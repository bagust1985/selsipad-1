import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type PresaleParams, type FairlaunchParams } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/rounds/[id]/finalize
 * Finalize an ended round (calculate allocations/refunds)
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated admin user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check admin role (Super Admin or two-man rule)

    // Check idempotency key
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
    }

    // Get round
    const { data: round, error: fetchError } = await supabase
      .from('launch_rounds')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Validate status
    if (round.status !== 'ENDED') {
      return NextResponse.json({ error: 'Can only finalize ENDED rounds' }, { status: 400 });
    }

    if (round.result !== 'NONE') {
      return NextResponse.json({ error: 'Round already finalized' }, { status: 400 });
    }

    // Determine result based on softcap
    const softcap =
      round.type === 'PRESALE'
        ? (round.params as PresaleParams).softcap
        : (round.params as FairlaunchParams).softcap;

    const result = round.total_raised >= softcap ? 'SUCCESS' : 'FAILED';

    // Calculate final price for fairlaunch
    let finalPrice: number | undefined;
    if (round.type === 'FAIRLAUNCH' && result === 'SUCCESS') {
      const params = round.params as FairlaunchParams;
      finalPrice = round.total_raised / params.token_for_sale;
    }

    // Begin transaction - update round
    const updates: Record<string, unknown> = {
      status: 'FINALIZED',
      result,
      finalized_by: user.id,
      finalized_at: new Date().toISOString(),
    };

    if (finalPrice !== undefined) {
      updates.params = {
        ...(round.params as FairlaunchParams),
        final_price: finalPrice,
      };
    }

    const { data: finalizedRound, error: updateError } = await supabase
      .from('launch_rounds')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error finalizing round:', updateError);
      return NextResponse.json({ error: 'Failed to finalize round' }, { status: 500 });
    }

    // Generate allocations for successful rounds
    if (result === 'SUCCESS') {
      // Get all confirmed contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('user_id, amount')
        .eq('round_id', params.id)
        .eq('status', 'CONFIRMED');

      if (contributions && contributions.length > 0) {
        // Calculate allocations
        const allocations = contributions.map((contrib) => {
          let tokens = 0;

          if (round.type === 'PRESALE') {
            const params = round.params as PresaleParams;
            tokens = contrib.amount / params.price;
          } else {
            // Fairlaunch: proportional allocation
            const sharePercentage = contrib.amount / round.total_raised;
            const params = round.params as FairlaunchParams;
            tokens = params.token_for_sale * sharePercentage;
          }

          return {
            round_id: params.id,
            user_id: contrib.user_id,
            contributed_amount: contrib.amount,
            allocation_tokens: tokens,
            claimable_tokens: 0, // Will be set by vesting (FASE 5)
            refund_amount: 0,
          };
        });

        // Insert allocations
        const { error: allocError } = await supabase.from('round_allocations').insert(allocations);

        if (allocError) {
          console.error('Error creating allocations:', allocError);
          // Continue even if allocation insert fails (can be retried)
        }
      }
    }

    // Generate refunds for failed rounds
    if (result === 'FAILED') {
      // Get all confirmed contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('user_id, amount')
        .eq('round_id', params.id)
        .eq('status', 'CONFIRMED');

      if (contributions && contributions.length > 0) {
        const refunds = contributions.map((contrib) => ({
          round_id: params.id,
          user_id: contrib.user_id,
          amount: contrib.amount,
          status: 'PENDING',
          chain: round.chain,
        }));

        // Insert refunds
        const { error: refundError } = await supabase.from('refunds').insert(refunds);

        if (refundError) {
          console.error('Error creating refunds:', refundError);
        }
      }
    }

    // TODO: Create audit log

    return NextResponse.json({
      round: finalizedRound,
      result,
      allocations_created: result === 'SUCCESS',
      refunds_created: result === 'FAILED',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
