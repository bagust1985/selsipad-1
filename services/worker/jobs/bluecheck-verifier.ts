/**
 * Blue Check Verifier Worker
 * Monitors PENDING bluecheck_purchases, verifies tx_hash, activates Blue Check
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateOnChainVerification(
  txHash: string,
  chain: string,
  expectedAmount: string
): Promise<boolean> {
  // TODO: Integrate with Tx Manager for real verification
  console.log(`[SIMULATION] Verifying tx ${txHash} on ${chain} for amount ${expectedAmount}`);

  // Simulate verification (always success for now)
  return true;
}

export async function runBlueCheckVerifier() {
  console.log('[BlueCheck Verifier] Starting...');

  try {
    // Get PENDING purchases
    const { data: purchases, error } = await supabase
      .from('bluecheck_purchases')
      .select('*')
      .eq('status', 'PENDING')
      .not('payment_tx_hash', 'is', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('[BlueCheck Verifier] Error fetching purchases:', error);
      return;
    }

    console.log(`[BlueCheck Verifier] Found ${purchases?.length || 0} pending purchases`);

    for (const purchase of purchases || []) {
      try {
        console.log(`[BlueCheck Verifier] Processing purchase ${purchase.id}`);

        // Verify transaction
        const isValid = await simulateOnChainVerification(
          purchase.payment_tx_hash!,
          purchase.payment_chain,
          purchase.payment_amount
        );

        if (isValid) {
          // Update purchase status to CONFIRMED
          const { error: updateError } = await supabase
            .from('bluecheck_purchases')
            .update({ status: 'CONFIRMED' })
            .eq('id', purchase.id);

          if (updateError) {
            console.error(
              `[BlueCheck Verifier] Error updating purchase ${purchase.id}:`,
              updateError
            );
            continue;
          }

          // Activate Blue Check for user
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ bluecheck_status: 'ACTIVE' })
            .eq('user_id', purchase.user_id);

          if (profileError) {
            console.error(
              `[BlueCheck Verifier] Error activating Blue Check for user ${purchase.user_id}:`,
              profileError
            );
            continue;
          }

          // Mark fee_split as ready for processing
          const { error: feeSplitError } = await supabase
            .from('fee_splits')
            .update({ processed: false })
            .eq('source_type', 'BLUECHECK')
            .eq('source_id', purchase.id);

          if (feeSplitError) {
            console.error(`[BlueCheck Verifier] Error updating fee split:`, feeSplitError);
          }

          console.log(`[BlueCheck Verifier] ✅ Activated Blue Check for user ${purchase.user_id}`);
        } else {
          // Mark as FAILED
          const { error: failError } = await supabase
            .from('bluecheck_purchases')
            .update({ status: 'FAILED' })
            .eq('id', purchase.id);

          if (failError) {
            console.error(`[BlueCheck Verifier] Error marking purchase as failed:`, failError);
          }

          console.log(`[BlueCheck Verifier] ❌ Failed verification for purchase ${purchase.id}`);
        }
      } catch (err) {
        console.error(`[BlueCheck Verifier] Error processing purchase ${purchase.id}:`, err);
      }
    }

    console.log('[BlueCheck Verifier] Completed');
  } catch (error) {
    console.error('[BlueCheck Verifier] Fatal error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runBlueCheckVerifier()
    .then(() => {
      console.log('[BlueCheck Verifier] Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[BlueCheck Verifier] Fatal error:', error);
      process.exit(1);
    });
}
