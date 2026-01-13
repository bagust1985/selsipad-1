import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateContributionConfirm,
  PoolValidationError,
  isPoolLive,
  type LaunchRound,
} from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/rounds/[id]/contribute/confirm
 * Confirm contribution with transaction hash
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

    // Check if contribution already exists with this idempotency key
    // (In production, would store idempotency keys in separate table)

    // Validate request body
    const body = await request.json();
    let confirmData;
    try {
      confirmData = validateContributionConfirm({
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

    // Check if round is still live
    if (!isPoolLive(round as LaunchRound)) {
      return NextResponse.json({ error: 'Round is not currently live' }, { status: 400 });
    }

    // Check for duplicate tx_hash
    const { data: existing } = await supabase
      .from('contributions')
      .select('id')
      .eq('chain', round.chain)
      .eq('tx_hash', confirmData.tx_hash)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Transaction hash already used' }, { status: 400 });
    }

    // Create contribution (in PENDING status)
    // Note: Actual on-chain verification would be done by Tx Manager/Indexer
    const { data: contribution, error: createError } = await supabase
      .from('contributions')
      .insert({
        round_id: params.id,
        user_id: user.id,
        wallet_address: confirmData.wallet_address,
        amount: confirmData.amount,
        chain: round.chain,
        tx_hash: confirmData.tx_hash,
        status: 'PENDING', // Will be updated to CONFIRMED by Tx Manager
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating contribution:', createError);

      // Check if it's a unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json({ error: 'Contribution already exists' }, { status: 400 });
      }

      return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
    }

    // TODO: Trigger Tx Manager to verify transaction on-chain
    // For MVP, we'll assume transaction is valid and update to CONFIRMED immediately
    // In production, this would be handled by indexer/worker

    return NextResponse.json(
      {
        contribution,
        message: 'Contribution submitted. Verification in progress.',
      },
      { status: 202 }
    ); // 202 Accepted
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
