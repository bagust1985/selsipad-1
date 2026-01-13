import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateRefundClaim, PoolValidationError } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/rounds/[id]/refund/claim
 * Claim refund for failed round
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
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

    // Check idempotency key
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
    }

    // Validate request body
    const body = await request.json();
    try {
      validateRefundClaim({
        ...body,
        round_id: params.id,
      });
    } catch (err) {
      if (err instanceof PoolValidationError) {
        return NextResponse.json({ error: err.message, field: err.field }, { status: 400 });
      }
      throw err;
    }

    // Get round
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('*')
      .eq('id', params.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Verify round is finalized and failed
    if (round.status !== 'FINALIZED' || round.result !== 'FAILED') {
      return NextResponse.json(
        { error: 'Refunds only available for FAILED rounds' },
        { status: 400 }
      );
    }

    // Get user's refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*')
      .eq('round_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (refundError || !refund) {
      return NextResponse.json({ error: 'No refund available' }, { status: 404 });
    }

    // Check if already claimed
    if (refund.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Refund already claimed' }, { status: 400 });
    }

    // Check if already in progress
    if (refund.status === 'PROCESSING') {
      return NextResponse.json({
        refund,
        message: 'Refund already in progress',
      });
    }

    // Update status to PROCESSING
    const { data: updated, error: updateError } = await supabase
      .from('refunds')
      .update({
        status: 'PROCESSING',
        idempotency_key: idempotencyKey,
      })
      .eq('id', refund.id)
      .eq('status', 'PENDING') // Optimistic locking
      .select()
      .single();

    if (updateError || !updated) {
      // If update failed, likely because status changed (race condition)
      return NextResponse.json(
        { error: 'Refund claim failed. Please try again.' },
        { status: 409 }
      );
    }

    // TODO: Trigger Tx Manager to process refund transaction
    // For MVP, we return success immediately
    // In production, this would queue a refund transaction

    return NextResponse.json(
      {
        refund: updated,
        message: 'Refund claim submitted. Processing will complete shortly.',
      },
      { status: 202 }
    ); // 202 Accepted
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
