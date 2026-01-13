import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSuccessGating } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/rounds/[id]/mark-success
 * Manually mark round as SUCCESS (admin only)
 * REQUIRES: All three gates must be passed
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

    // TODO: Check admin role

    // Get round
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('*')
      .eq('id', params.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check if already marked
    if (round.success_gated_at) {
      return NextResponse.json(
        {
          error: 'Round already marked as SUCCESS',
          success_gated_at: round.success_gated_at,
        },
        { status: 400 }
      );
    }

    // Validate all gates
    const gateValidation = validateSuccessGating(
      round.result || 'NONE',
      round.vesting_status || 'NONE',
      round.lock_status || 'NONE'
    );

    if (!gateValidation.passed) {
      return NextResponse.json(
        {
          error: 'Cannot mark as SUCCESS: Not all gates passed',
          missing_requirements: gateValidation.missing,
          gates: {
            round_success: round.result === 'SUCCESS',
            vesting_confirmed: round.vesting_status === 'CONFIRMED',
            lock_confirmed: round.lock_status === 'LOCKED',
          },
        },
        { status: 400 }
      );
    }

    // Mark round as SUCCESS
    const successGatedAt = new Date().toISOString();
    const { data: updatedRound, error: updateError } = await supabase
      .from('launch_rounds')
      .update({ success_gated_at: successGatedAt })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking success:', updateError);
      return NextResponse.json({ error: 'Failed to mark as SUCCESS' }, { status: 500 });
    }

    // TODO: Trigger badge awards
    // TODO: Trigger project milestone notifications
    // TODO: Write audit log

    return NextResponse.json({
      round: updatedRound,
      success_gated_at: successGatedAt,
      message: 'Round marked as SUCCESS - all gates passed!',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
