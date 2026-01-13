/**
 * POST /api/admin/bluecheck/restore
 * Restore revoked Blue Check
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { user_id, reason } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // TODO: Check admin role (FASE 2)
    // TODO: Require re-authentication for high-risk action

    // Restore Blue Check
    await supabase.from('profiles').update({ bluecheck_status: 'ACTIVE' }).eq('user_id', user_id);

    // TODO: Audit log with reason
    console.log(`[Admin] Blue Check restored for user ${user_id} by ${user.id}. Reason: ${reason}`);

    return NextResponse.json({ success: true, message: 'Blue Check restored' });
  } catch (error) {
    console.error('Error in POST /api/admin/bluecheck/restore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
