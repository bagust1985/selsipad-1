/**
 * Admin: Revoke/Restore Blue Check
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRevokeBlueCheck } from '@selsipad/shared';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = validateRevokeBlueCheck(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // TODO: Check admin role (FASE 2)

    await supabase
      .from('profiles')
      .update({ bluecheck_status: 'REVOKED' })
      .eq('user_id', body.user_id);

    // TODO: Audit log
    return NextResponse.json({ success: true, message: 'Blue Check revoked' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
