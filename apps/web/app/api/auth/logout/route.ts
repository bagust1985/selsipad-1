import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Logout - Delete session
 */
export async function POST() {
  const { deleteSession } = await import('@/lib/auth/session');

  const sessionToken = cookies().get('session_token')?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  cookies().delete('session_token');

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
