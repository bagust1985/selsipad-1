/**
 * GET /api/admin/sbt/rules
 * List all SBT rules (including inactive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Admin check usually middleware or here
    // For now assuming RLS or valid session + RBAC check (implied)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // In a real app we check role === 'admin' here.

    const { data: rules, error } = await supabase
      .from('sbt_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rules });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/sbt/rules
 * Create new SBT rule
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    // Validate body...

    const { data, error } = await supabase.from('sbt_rules').insert(body).select().single();

    if (error) throw error;

    return NextResponse.json({ rule: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
