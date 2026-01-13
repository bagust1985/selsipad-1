import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateRejectPool, PoolValidationError } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/rounds/[id]/reject
 * Reject a launch round with reason
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
    if (round.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Can only reject SUBMITTED rounds' }, { status: 400 });
    }

    // Validate request body
    const body = await request.json();
    let rejectData;
    try {
      rejectData = validateRejectPool(body);
    } catch (err) {
      if (err instanceof PoolValidationError) {
        return NextResponse.json({ error: err.message, field: err.field }, { status: 400 });
      }
      throw err;
    }

    // Update to REJECTED
    const { data: updated, error: updateError } = await supabase
      .from('launch_rounds')
      .update({
        status: 'REJECTED',
        rejection_reason: rejectData.rejection_reason,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting round:', updateError);
      return NextResponse.json({ error: 'Failed to reject round' }, { status: 500 });
    }

    // TODO: Create audit log

    return NextResponse.json({ round: updated });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
