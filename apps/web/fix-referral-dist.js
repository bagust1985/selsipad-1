/**
 * Re-process referral rewards for already-finalized round.
 * Reads on-chain Contributed events and writes to referral_ledger.
 */
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const ROUND_ID = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
const ROUND_ADDRESS = '0xf22BB547b70966026a1a219193e97009775da7b3';
const DEPLOY_BLOCK = 90591756;

const PRESALE_ABI = [
  'event Contributed(address indexed contributor, uint256 amount, address indexed referrer)',
  'function totalRaised() view returns (uint256)',
  'function feeConfig() view returns (uint256 totalBps, uint256 treasuryBps, uint256 referralPoolBps, uint256 sbtStakingBps)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
  const contract = new ethers.Contract(ROUND_ADDRESS, PRESALE_ABI, provider);

  // 1. Get fee config
  const totalRaised = await contract.totalRaised();
  const feeConfig = await contract.feeConfig();
  const feeBps = BigInt(feeConfig.totalBps);
  const feeAmount = (totalRaised * feeBps) / 10000n;
  const referralWei = (feeAmount * 40n) / 100n;

  console.log(`Total Raised: ${ethers.formatEther(totalRaised)} BNB`);
  console.log(`Fee (${feeBps}bps): ${ethers.formatEther(feeAmount)} BNB`);
  console.log(`Referral Pool (40%): ${ethers.formatEther(referralWei)} BNB`);

  // 2. Get fee_split ID
  const { data: feeSplit } = await supabase
    .from('fee_splits')
    .select('id')
    .eq('source_id', ROUND_ID)
    .eq('source_type', 'PRESALE')
    .single();

  if (!feeSplit) {
    console.error('No fee_split found!');
    return;
  }
  console.log(`Fee Split ID: ${feeSplit.id}`);

  // 3. Query on-chain Contributed events from deploy block
  const currentBlock = await provider.getBlockNumber();
  let events = [];
  const MAX_RANGE = 9999;
  for (let start = DEPLOY_BLOCK; start <= currentBlock; start += MAX_RANGE) {
    const end = Math.min(start + MAX_RANGE - 1, currentBlock);
    const chunk = await contract.queryFilter('Contributed', start, end);
    events.push(...chunk);
  }
  console.log(`\nFound ${events.length} Contributed events (blocks ${DEPLOY_BLOCK}-${currentBlock})`);

  // Master referrer
  const MASTER_REFERRER = (process.env.NEXT_PUBLIC_MASTER_REFERRER || '').toLowerCase();
  console.log(`Master referrer: ${MASTER_REFERRER || 'NOT SET'}`);

  let referralCount = 0;

  for (const event of events) {
    const [contributor, amount, referrer] = event.args;
    if (referrer === ethers.ZeroAddress) continue;

    console.log(`\n--- Processing contribution ---`);
    console.log(`  Contributor: ${contributor}`);
    console.log(`  Amount: ${ethers.formatEther(amount)} BNB`);
    console.log(`  On-chain referrer: ${referrer}`);

    // Look up contributor wallet → user_id
    const { data: contribWallet } = await supabase
      .from('wallets')
      .select('user_id')
      .ilike('address', contributor)
      .single();

    if (!contribWallet?.user_id) {
      console.log('  ⚠ Contributor wallet not found in DB, skipping');
      continue;
    }
    console.log(`  Contributor user_id: ${contribWallet.user_id}`);

    // Resolve the REAL referrer
    let realReferrerId = null;
    const isOnchainMasterReferrer = MASTER_REFERRER && String(referrer).toLowerCase() === MASTER_REFERRER;

    if (!isOnchainMasterReferrer) {
      // Direct wallet lookup
      const { data: referrerWallet } = await supabase
        .from('wallets')
        .select('user_id')
        .ilike('address', referrer)
        .single();

      if (referrerWallet?.user_id) {
        realReferrerId = referrerWallet.user_id;
        console.log(`  ✅ Direct referrer found: ${realReferrerId}`);
      } else {
        console.log(`  ⚠ On-chain referrer wallet not in DB, checking referral_relationships...`);
      }
    } else {
      console.log(`  Master referrer detected, checking referral_relationships...`);
    }

    // Fallback to DB referral_relationships
    if (!realReferrerId) {
      const { data: relationship } = await supabase
        .from('referral_relationships')
        .select('referrer_id, activated_at')
        .eq('referee_id', contribWallet.user_id)
        .single();

      if (relationship?.referrer_id) {
        realReferrerId = relationship.referrer_id;
        console.log(`  ✅ DB referral_relationship found: → ${realReferrerId}`);

        // Activate if not yet activated
        if (!relationship.activated_at) {
          await supabase
            .from('referral_relationships')
            .update({ activated_at: new Date().toISOString() })
            .eq('referee_id', contribWallet.user_id)
            .eq('referrer_id', realReferrerId);
          console.log(`  ✅ Referral relationship activated`);
        }
      } else {
        console.log(`  ❌ No referral relationship found, skipping`);
        continue;
      }
    }

    if (!realReferrerId) continue;

    // Calculate proportional referral reward
    const proportionalAmount = (referralWei * BigInt(amount)) / totalRaised;
    console.log(`  Referral reward: ${ethers.formatEther(proportionalAmount)} BNB → ${realReferrerId}`);

    // Upsert to referral_ledger
    const { error: ledgerErr } = await supabase.from('referral_ledger').upsert(
      {
        referrer_id: realReferrerId,
        source_type: 'PRESALE',
        source_id: feeSplit.id,
        referee_id: contribWallet.user_id,
        amount: proportionalAmount.toString(),
        asset: 'BNB',
        chain: '97',
        status: 'CLAIMABLE',
      },
      { onConflict: 'source_type,source_id,referee_id' }
    );

    if (!ledgerErr) {
      referralCount++;
      console.log(`  ✅ Referral ledger entry created`);
    } else {
      console.error(`  ❌ Ledger upsert error:`, ledgerErr.message);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`DONE: Created ${referralCount} referral entries from ${events.length} events`);

  // Verify
  console.log('\n=== VERIFICATION: referral_ledger entries ===');
  const { data: ledger } = await supabase
    .from('referral_ledger')
    .select('*')
    .eq('source_id', feeSplit.id);
  
  console.log(`Total entries: ${ledger?.length || 0}`);
  ledger?.forEach(l => {
    console.log(`  referrer: ${l.referrer_id?.slice(0,8)}... | referee: ${l.referee_id?.slice(0,8)}... | amount: ${ethers.formatEther(BigInt(l.amount))} BNB | status: ${l.status}`);
  });
}

main().catch(console.error);
