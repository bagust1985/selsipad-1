/**
 * GET /api/v1/sbt/history
 * Fetch:
 * 1. Current Balance (Ledger)
 * 2. Active Stakes
 * 3. Recent Claims
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallel fetch
    const [ledgerRes, stakesRes, claimsRes] = await Promise.all([
      supabase.from('sbt_rewards_ledger').select('*').eq('user_id', user.id).single(),
      supabase.from('sbt_stakes').select('*, sbt_rules(*)').eq('user_id', user.id),
      supabase
        .from('sbt_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    return NextResponse.json({
      ledger: ledgerRes.data || { total_accrued: 0, total_claimed: 0 },
      stakes: stakesRes.data || [],
      claims: claimsRes.data || [],
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
