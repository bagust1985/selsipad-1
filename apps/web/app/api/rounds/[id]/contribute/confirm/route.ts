import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateContributionConfirm, PoolValidationError } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/rounds/[id]/contribute/confirm
 * Confirm contribution with transaction hash (step 2 of 2-step flow)
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

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateContributionConfirm(body);
    } catch (err) {
      if (err instanceof PoolValidationError) {
        return NextResponse.json({ error: err.message, field: err.field }, { status: 400 });
      }
      throw err;
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

    // Check for duplicate transaction hash
    const { data: existingTx } = await supabase
      .from('contributions')
      .select('id')
      .eq('chain', round.chain)
      .eq('tx_hash', validatedData.tx_hash)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ error: 'Transaction hash already recorded' }, { status: 409 });
    }

    // Find pending contribution for this user/round
    const { data: pendingContribution } = await supabase
      .from('contributions')
      .select('*')
      .eq('round_id', params.id)
      .eq('user_id', user.id)
      .eq('wallet_address', validatedData.wallet_address)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingContribution) {
      // Update existing pending contribution
      const { data: updated, error: updateError } = await supabase
        .from('contributions')
        .update({
          tx_hash: validatedData.tx_hash,
          status: 'CONFIRMED',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', pendingContribution.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating contribution:', updateError);
        return NextResponse.json({ error: 'Failed to confirm contribution' }, { status: 500 });
      }

      return NextResponse.json({ contribution: updated });
    } else {
      // Create new contribution (if user submitted tx directly without intent)
      const { data: newContribution, error: createError } = await supabase
        .from('contributions')
        .insert({
          round_id: params.id,
          user_id: user.id,
          wallet_address: validatedData.wallet_address,
          amount: validatedData.amount,
          chain: round.chain,
          tx_hash: validatedData.tx_hash,
          status: 'CONFIRMED',
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating contribution:', createError);
        return NextResponse.json({ error: 'Failed to record contribution' }, { status: 500 });
      }

      return NextResponse.json({ contribution: newContribution });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
