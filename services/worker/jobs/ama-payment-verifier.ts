/**
 * AMA Payment Verifier Worker
 * Monitors PAID ama_sessions, verifies payment, updates status to APPROVED
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulatePaymentVerification(txHash: string): Promise<boolean> {
  // TODO: Integrate with Tx Manager
  console.log(`[SIMULATION] Verifying AMA payment tx ${txHash}`);
  return true; // Simulate success
}

export async function runAMAPaymentVerifier() {
  console.log('[AMA Payment Verifier] Starting...');

  try {
    const { data: paidSessions, error } = await supabase
      .from('ama_sessions')
      .select('*')
      .eq('status', 'PAID')
      .not('payment_tx_hash', 'is', null)
      .limit(10);

    if (error) {
      console.error('[AMA Payment Verifier] Error fetching sessions:', error);
      return;
    }

    console.log(`[AMA Payment Verifier] Found ${paidSessions?.length || 0} paid sessions`);

    for (const session of paidSessions || []) {
      try {
        console.log(`[AMA Payment Verifier] Processing session ${session.id}`);

        const isValid = await simulatePaymentVerification(session.payment_tx_hash!);

        if (isValid) {
          // Auto-approve (or set to pending admin approval based on config)
          await supabase.from('ama_sessions').update({ status: 'APPROVED' }).eq('id', session.id);

          console.log(`[AMA Payment Verifier] ✅ Approved AMA session ${session.id}`);
        } else {
          console.log(`[AMA Payment Verifier] ❌ Invalid payment for session ${session.id}`);
        }
      } catch (err) {
        console.error(`[AMA Payment Verifier] Error processing session ${session.id}:`, err);
      }
    }

    console.log('[AMA Payment Verifier] Completed');
  } catch (error) {
    console.error('[AMA Payment Verifier] Fatal error:', error);
  }
}

if (require.main === module) {
  runAMAPaymentVerifier()
    .then(() => {
      console.log('[AMA Payment Verifier] Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[AMA Payment Verifier] Fatal error:', error);
      process.exit(1);
    });
}
