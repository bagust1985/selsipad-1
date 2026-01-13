/**
 * GET /api/v1/referral/rewards - Get claimable rewards by chain
 * GET /api/v1/referral/claims - Get claim history
 * GET /api/v1/referral/leaderboard - Top referrers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/referral/rewards
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') || 'CLAIMABLE';

    const { data: rewards } = await supabase
      .from('referral_ledger')
      .select('*')
      .eq('referrer_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    return NextResponse.json({ rewards: rewards || [] });
  } catch (error) {
    console.error('Error in GET /api/v1/referral/rewards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
