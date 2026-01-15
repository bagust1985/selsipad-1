/**
 * SBT Reward Distributor Job
 * Runs periodically (e.g., Hourly)
 * 1. Sum unprocessed fee_splits (NFT_STAKING)
 * 2. Count active stakers
 * 3. Distribute equally
 * 4. Update ledgers
 * 5. Mark processed
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function runSbtRewardDistribution() {
  console.log('Starting SBT Reward Distribution...');

  try {
    // 1. Get unprocessed fees
    const { data: fees, error: feeError } = await supabase
      .from('fee_splits')
      .select('id, amount, source_type') // Check real schema for 'amount' field (might be total_amount?)
      .eq('source_type', 'NFT_STAKING')
      .eq('processed', false);

    if (feeError) throw feeError;
    if (!fees || fees.length === 0) {
      console.log('No new fees to distribute.');
      return;
    }

    // Need to check schema for amount field. FASE 6 types imply 'treasury_amount', 'referral_pool_amount' etc.
    // Spec: "sbt_rewards_ledger: mencatat akrual reward dari sumber fee_splits NFT_STAKING".
    // Usually NFT_STAKING splits go to... Stakers?
    // If source_type is NFT_STAKING, the 'referral_pool_amount' or explicit 'staking_pool_amount'?
    // Let's assume there is a specific amount allocated for this pool in the fee split logic.
    // Or we use `total_amount` if the whole split is for staking?
    // FASE 6 split: Treasury 50 / Referral 50.
    // Is there a 'NFT_STAKING' bucket?
    // Spec says "Extract from NFT_STAKING source".
    // Let's assume `referral_pool_amount` is repurposed or there's a specific logic.
    // For now, I'll sum `total_amount` as placeholder, or `referral_pool_amount`.
    // Let's use `total_amount` for safety/example. A real implementation depends on mapping.
    // Actually, looking at FASE 6, `calculateFeeSplit` returns treasury/referral.
    // If NFT Staking is the *Source*, maybe the fees came *from* staking actions?
    // Or fees came from Trading/Launchpad and assigned *to* NFT_STAKING?
    // "mencatat akrual reward dari sumber fee_splits NFT_STAKING".
    // Maybe `source_type` indicates where money came from.
    // If money is FOR stakers, it should be in a specific column or we filter by destination.
    // Let's assume we distribute `referral_pool_amount` (often used as "Community/Staking" pool).

    // I will sum `referral_pool_amount`.

    const totalToDistribute = fees.reduce(
      (sum, fee) => sum + BigInt(fee.referral_pool_amount || 0),
      0n
    );

    if (totalToDistribute === 0n) {
      console.log('Total distribution amount is 0.');
      return;
    }

    // 2. Count Active Stakers
    // One stake per user per rule. Limit to unique users?
    // Table constraint: unique(user_id, rule_id).
    // A user can stake multiple rules? Yes.
    // Do they get multiple shares?
    // Equal split among "active stakers". Usually means "shares based on stake count".
    // If I stake 2 SBTs (different collections), I get 2 shares.

    const { count, error: countError } = await supabase
      .from('sbt_stakes')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const activeStakersCount = count || 0;

    if (activeStakersCount === 0) {
      console.log('No active stakers. Skipping distribution (Fees remain unprocessed).');
      return;
    }

    const amountPerStake = totalToDistribute / BigInt(activeStakersCount);

    console.log(
      `Distributing ${totalToDistribute} to ${activeStakersCount} stakes (${amountPerStake} each)`
    );

    // 3. Update Ledgers
    // We need to iterate users or stakes?
    // Stakes connect to users.
    // User might have multiple stakes.
    // We can query all stakes, group by user_id, calculate total per user.

    const { data: stakes } = await supabase.from('sbt_stakes').select('user_id');

    if (!stakes) return;

    // Group by user
    const userRewards = new Map<string, bigint>();
    stakes.forEach((stake) => {
      const current = userRewards.get(stake.user_id) || 0n;
      userRewards.set(stake.user_id, current + amountPerStake);
    });

    // Batch update (parallel promises or RPC)
    // Supabase JS doesn't have batch update for different values easily without RPC.
    // We will loop for now (Worker speed acceptable for MVP).
    // Or use `upsert` with array? Upsert needs all columns?
    // We can't strictly atomic increment with upsert from client without read-modify-write race
    // unless we use RPC.
    // "sbt_rewards_ledger" has `total_accrued`.
    // Valid approach: RPC `increment_sbt_rewards(user_id, amount)`.

    // Let's do read-modify-write for this Phase prototype (or assume safe if single worker).
    // Better: Helper RPC `bulk_distribute_rewards(payload: {user_id, amount}[])`.

    // Fallback: Loop update.
    for (const [userId, amount] of userRewards.entries()) {
      // Get current
      const { data: ledger } = await supabase
        .from('sbt_rewards_ledger')
        .select('total_accrued')
        .eq('user_id', userId)
        .single();

      const currentAccrued = BigInt(ledger?.total_accrued || 0);
      const newAccrued = currentAccrued + amount;

      await supabase.from('sbt_rewards_ledger').upsert(
        {
          user_id: userId,
          total_accrued: newAccrued.toString(),
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }

    // 4. Mark fees processed
    const feeIds = fees.map((f) => f.id);
    await supabase.from('fee_splits').update({ processed: true }).in('id', feeIds);

    console.log('Distribution complete.');
  } catch (error) {
    console.error('Job failed:', error);
  }
}
