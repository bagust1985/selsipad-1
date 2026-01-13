import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/rounds/[id]/refund/quote
 * Check refund eligibility and amount
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get round
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('*, projects(owner_user_id)')
      .eq('id', params.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check if round is finalized and failed
    if (round.status !== 'FINALIZED' || round.result !== 'FAILED') {
      return NextResponse.json({
        refund_amount: 0,
        is_eligible: false,
        reason: 'Refunds only available for FAILED rounds',
        primary_wallet: null,
      });
    }

    // Get user's refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*')
      .eq('round_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (refundError || !refund) {
      return NextResponse.json({
        refund_amount: 0,
        is_eligible: false,
        reason: 'No refund available for this user',
        primary_wallet: null,
      });
    }

    // Check if already claimed
    if (refund.status === 'COMPLETED') {
      return NextResponse.json({
        refund_amount: 0,
        is_eligible: false,
        reason: 'Refund already claimed',
        primary_wallet: null,
      });
    }

    // Get user's primary wallet for this chain
    // TODO: Implement wallet lookup from user profile
    const primaryWallet = null; // Placeholder

    return NextResponse.json({
      refund_amount: Number(refund.amount),
      is_eligible: true,
      reason: refund.status === 'PROCESSING' ? 'Refund in progress' : undefined,
      primary_wallet: primaryWallet,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
