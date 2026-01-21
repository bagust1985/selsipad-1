import { logout } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

/**
 * API Route: POST /api/auth/logout
 * Calls server action to delete session from database
 */
export async function POST() {
  try {
    // Call server action to delete session & redirect
    await logout();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
