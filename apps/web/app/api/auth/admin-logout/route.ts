import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear admin_wallet cookie
  response.cookies.delete('admin_wallet');

  return response;
}
