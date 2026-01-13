import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePoolStatus, PoolValidationError } from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/rounds/[id]/submit
 * Submit round for admin review
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

    // Get round with project details
    const { data: round, error: fetchError } = await supabase
      .from('launch_rounds')
      .select(
        `
        *,
        projects (
          owner_user_id,
          kyc_status,
          sc_scan_status
        )
      `
      )
      .eq('id', params.id)
      .single();

    if (fetchError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check ownership
    if (round.projects.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate status
    try {
      validatePoolStatus(round.status, ['DRAFT'], 'submit');
    } catch (err) {
      if (err instanceof PoolValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // Snapshot gate statuses
    const kycStatusSnapshot = round.projects.kyc_status;
    const scanStatusSnapshot = round.projects.sc_scan_status;

    // Verify still eligible
    if (kycStatusSnapshot !== 'VERIFIED' || scanStatusSnapshot !== 'PASSED') {
      return NextResponse.json(
        {
          error: 'Project no longer eligible',
          reasons: [
            kycStatusSnapshot !== 'VERIFIED' ? 'KYC verification required' : null,
            scanStatusSnapshot !== 'PASSED' ? 'SC scan must pass' : null,
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    // Update to SUBMITTED with snapshots
    const { data: updated, error: updateError } = await supabase
      .from('launch_rounds')
      .update({
        status: 'SUBMITTED',
        kyc_status_at_submit: kycStatusSnapshot,
        scan_status_at_submit: scanStatusSnapshot,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error submitting round:', updateError);
      return NextResponse.json({ error: 'Failed to submit round' }, { status: 500 });
    }

    return NextResponse.json({ round: updated });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
