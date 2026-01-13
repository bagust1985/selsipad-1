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

    const { data: claims } = await supabase
      .from('referral_ledger')
      .select('*')
      .eq('referrer_id', user.id)
      .eq('status', 'CLAIMED')
      .order('claimed_at', { ascending: false });

    return NextResponse.json({ claims: claims || [] });
  } catch (error) {
    console.error('Error in GET /api/v1/referral/claims:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
