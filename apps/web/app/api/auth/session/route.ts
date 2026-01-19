import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get current session info
 */
export async function GET() {
  const { getSession } = await import('@/lib/auth/session');

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    address: session.address,
    chain: session.chain,
  });
}
