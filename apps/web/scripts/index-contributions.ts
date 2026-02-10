/**
 * Contribution Event Indexer
 *
 * Syncs on-chain `Contributed` events from PresaleRound contracts
 * to the `contributions` database table.
 *
 * This prevents data loss when:
 * - User closes browser before DB confirm call
 * - Session expires during contribution
 * - Network errors prevent confirm API call
 *
 * Usage:
 *   npx tsx scripts/index-contributions.ts                    # Index all deployed presales
 *   npx tsx scripts/index-contributions.ts <round_id>         # Index specific round
 *   npx tsx scripts/index-contributions.ts --from-block 89340000  # Start from specific block
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BSC_TESTNET_RPC_URL
 */

import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// ─── Config ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RPC_BY_CHAIN: Record<string, string> = {
  '97': process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com',
  '56': process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org',
};

// PresaleRound ABI — only events we care about
// PresaleRound ABI — events we care about
// On-chain: user (indexed topic), amount (data), referral (indexed topic)
const PRESALE_EVENTS_ABI = [
  'event Contributed(address indexed user, uint256 amount, address indexed referral)',
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Types ────────────────────────────────────────────────────────────
interface RoundInfo {
  id: string;
  chain: string;
  round_address: string;
  contract_address: string;
  deployment_block_number: number | null;
  start_at: string;
  end_at: string;
}

interface IndexResult {
  roundId: string;
  roundAddress: string;
  eventsFound: number;
  newInserts: number;
  duplicatesSkipped: number;
  errors: string[];
}

// ─── Core Indexer ─────────────────────────────────────────────────────

async function indexRoundContributions(round: RoundInfo, fromBlock?: number): Promise<IndexResult> {
  const result: IndexResult = {
    roundId: round.id,
    roundAddress: round.round_address || round.contract_address,
    eventsFound: 0,
    newInserts: 0,
    duplicatesSkipped: 0,
    errors: [],
  };

  const chain = String(round.chain);
  const rpcUrl = RPC_BY_CHAIN[chain];
  if (!rpcUrl) {
    result.errors.push(`No RPC URL for chain ${chain}`);
    return result;
  }

  const roundAddress = round.round_address || round.contract_address;
  if (!roundAddress) {
    result.errors.push('No contract address found');
    return result;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(roundAddress, PRESALE_EVENTS_ABI, provider);

  // Determine start block
  const startBlock = fromBlock || round.deployment_block_number || 0;
  const currentBlock = await provider.getBlockNumber();

  console.log(`  📦 Scanning blocks ${startBlock} → ${currentBlock} on chain ${chain}`);
  console.log(`  📍 Contract: ${roundAddress}`);

  // Query Contributed events in chunks (BSC has 5000 block limit)
  const CHUNK_SIZE = 5000;
  const allEvents: ethers.Log[] = [];

  for (let from = startBlock; from <= currentBlock; from += CHUNK_SIZE) {
    const to = Math.min(from + CHUNK_SIZE - 1, currentBlock);
    try {
      const filter = contract.filters.Contributed();
      const events = await contract.queryFilter(filter, from, to);
      allEvents.push(...(events as ethers.Log[]));
    } catch (err: any) {
      // Some RPCs have stricter limits; try smaller chunks
      console.warn(`  ⚠️ Error fetching blocks ${from}-${to}: ${err.message}`);
    }
  }

  result.eventsFound = allEvents.length;
  console.log(`  🔍 Found ${allEvents.length} Contributed events`);

  // Process each event
  for (const event of allEvents) {
    try {
      const parsed = contract.interface.parseLog({
        topics: event.topics as string[],
        data: event.data,
      });
      if (!parsed) continue;

      const userAddress = parsed.args[0] as string; // indexed
      const amountWei = parsed.args[1] as bigint;
      const txHash = event.transactionHash;
      const amount = parseFloat(ethers.formatEther(amountWei));

      // Check if tx_hash already exists in DB
      const { data: existing } = await supabase
        .from('contributions')
        .select('id')
        .eq('tx_hash', txHash)
        .maybeSingle();

      if (existing) {
        result.duplicatesSkipped++;
        continue;
      }

      // Look up user_id from wallets table
      const { data: wallet } = await supabase
        .from('wallets')
        .select('user_id')
        .ilike('address', userAddress)
        .maybeSingle();

      const userId = wallet?.user_id || null;

      // Get block timestamp for accurate created_at
      const block = await provider.getBlock(event.blockNumber);
      const confirmedAt = block
        ? new Date(block.timestamp * 1000).toISOString()
        : new Date().toISOString();

      // Insert contribution
      const { error: insertError } = await supabase.from('contributions').insert({
        round_id: round.id,
        user_id: userId,
        wallet_address: userAddress.toLowerCase(),
        amount,
        chain: round.chain,
        tx_hash: txHash,
        status: 'CONFIRMED',
        confirmed_at: confirmedAt,
      });

      if (insertError) {
        result.errors.push(`Insert failed for tx ${txHash}: ${insertError.message}`);
        console.error(`  ❌ Insert error for tx ${txHash.slice(0, 12)}...:`, insertError.message);
      } else {
        result.newInserts++;
        console.log(
          `  ✅ Indexed: ${amount} BNB from ${userAddress.slice(0, 10)}... (tx: ${txHash.slice(0, 12)}...)`
        );
      }
    } catch (err: any) {
      result.errors.push(`Event processing error: ${err.message}`);
    }
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Contribution Event Indexer Starting...\n');

  const args = process.argv.slice(2);
  let specificRoundId: string | null = null;
  let fromBlock: number | undefined;

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from-block' && args[i + 1]) {
      fromBlock = parseInt(args[i + 1]);
      i++;
    } else if (!args[i].startsWith('--')) {
      specificRoundId = args[i];
    }
  }

  // Fetch rounds to index
  let query = supabase
    .from('launch_rounds')
    .select('id, chain, round_address, contract_address, deployment_block_number, start_at, end_at')
    .eq('type', 'PRESALE')
    .in('status', ['DEPLOYED', 'LIVE', 'ACTIVE', 'ENDED', 'FINALIZED'])
    .not('round_address', 'is', null);

  if (specificRoundId) {
    query = query.eq('id', specificRoundId);
  }

  const { data: rounds, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch rounds:', error.message);
    process.exit(1);
  }

  if (!rounds || rounds.length === 0) {
    console.log('📭 No deployed presale rounds found.');
    process.exit(0);
  }

  console.log(`📋 Found ${rounds.length} presale round(s) to index\n`);

  const results: IndexResult[] = [];

  for (const round of rounds) {
    console.log(`\n─── Round: ${round.id} ───`);
    const result = await indexRoundContributions(round as RoundInfo, fromBlock);
    results.push(result);
  }

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 INDEXING SUMMARY');
  console.log('═══════════════════════════════════════');

  let totalEvents = 0;
  let totalInserts = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;

  for (const r of results) {
    console.log(`\n  Round: ${r.roundId}`);
    console.log(`    Contract: ${r.roundAddress}`);
    console.log(`    Events found: ${r.eventsFound}`);
    console.log(`    New inserts: ${r.newInserts}`);
    console.log(`    Duplicates skipped: ${r.duplicatesSkipped}`);
    if (r.errors.length > 0) {
      console.log(`    Errors: ${r.errors.length}`);
      r.errors.forEach((e) => console.log(`      - ${e}`));
    }
    totalEvents += r.eventsFound;
    totalInserts += r.newInserts;
    totalDuplicates += r.duplicatesSkipped;
    totalErrors += r.errors.length;
  }

  console.log(
    `\n  TOTAL: ${totalEvents} events, ${totalInserts} new, ${totalDuplicates} duplicates, ${totalErrors} errors`
  );
  console.log('\n✅ Indexing complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
