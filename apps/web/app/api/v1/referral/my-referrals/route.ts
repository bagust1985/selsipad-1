/**
 * GET /api/v1/referral/my-referrals
 * List all referrals with activation status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: referrals } = await supabase
      .from('referral_relationships')
      .select(
        `
        *,
        referee:profiles!referral_relationships_referee_id_fkey(user_id, username, avatar_url, created_at)
      `
      )
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    const referralsWithStatus = (referrals || []).map((ref) => ({
      ...ref,
      is_active: ref.activated_at !== null,
    }));

    return NextResponse.json({ referrals: referralsWithStatus });
  } catch (error) {
    console.error('Error in GET /api/v1/referral/my-referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
