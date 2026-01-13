/**
 * Vesting Claim Processor Worker
 * Verifies claim transactions on-chain and updates status
 *
 * Trigger: Claims in PENDING status
 * Run: Every 30 seconds via cron
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PendingClaim {
  id: string;
  allocation_id: string;
  user_id: string;
  claim_amount: string;
  tx_hash: string;
  chain: string;
  wallet_address: string;
}

/**
 * Verify claim transaction on-chain
 * TODO: Integrate with Tx Manager for actual verification
 */
async function verifyClaimOnChain(
  claim: PendingClaim
): Promise<{ verified: boolean; error?: string }> {
  console.log(`  Verifying tx ${claim.tx_hash} on ${claim.chain}...`);

  // TODO: Call Tx Manager API to verify transaction
  // For now, simulate verification (always succeeds after short delay)

  // Placeholder logic
  const isValid = claim.tx_hash && claim.tx_hash.length > 10;

  if (!isValid) {
    return { verified: false, error: 'Invalid transaction hash' };
  }

  // Simulate successful verification
  return { verified: true };
}

/**
 * Process a single pending claim
 */
async function processClaim(claim: PendingClaim): Promise<void> {
  console.log(`\n📋 Processing claim ${claim.id}...`);

  try {
    // Verify transaction on-chain
    const verification = await verifyClaimOnChain(claim);

    if (verification.verified) {
      // Update claim status to CONFIRMED
      await supabase
        .from('vesting_claims')
        .update({
          status: 'CONFIRMED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', claim.id);

      // Update allocation: increment claimed_tokens
      const { data: allocation } = await supabase
        .from('vesting_allocations')
        .select('claimed_tokens, total_claims')
        .eq('id', claim.allocation_id)
        .single();

      if (allocation) {
        const newClaimedTokens = BigInt(allocation.claimed_tokens) + BigInt(claim.claim_amount);

        await supabase
          .from('vesting_allocations')
          .update({
            claimed_tokens: newClaimedTokens.toString(),
            total_claims: allocation.total_claims + 1,
            last_claim_at: new Date().toISOString(),
          })
          .eq('id', claim.allocation_id);
      }

      console.log(`  ✅ Claim confirmed: ${claim.claim_amount} tokens`);
    } else {
      // Mark as FAILED
      await supabase
        .from('vesting_claims')
        .update({
          status: 'FAILED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', claim.id);

      console.log(`  ❌ Claim failed: ${verification.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error(`Error processing claim ${claim.id}:`, err);
  }
}

/**
 * Main claim processor function
 */
export async function runVestingClaimProcessor(): Promise<void> {
  console.log('\n🔍 Running Vesting Claim Processor...');
  console.log('Time:', new Date().toISOString());

  try {
    // Find pending claims
    const { data: claims, error } = await supabase
      .from('vesting_claims')
      .select('*')
      .eq('status', 'PENDING')
      .not('tx_hash', 'is', null)
      .limit(20)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending claims:', error);
      return;
    }

    if (!claims || claims.length === 0) {
      console.log('No pending claims to process');
      return;
    }

    console.log(`Found ${claims.length} pending claims`);

    // Process each claim
    for (const claim of claims) {
      await processClaim(claim as PendingClaim);
    }

    console.log('\n✅ Claim processor completed successfully\n');
  } catch (err) {
    console.error('❌ Claim processor error:', err);
    throw err;
  }
}

// Run directly if this is the main module
runVestingClaimProcessor()
  .then(() => {
    console.log('Claim processor finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Claim processor failed:', error);
    process.exit(1);
  });
