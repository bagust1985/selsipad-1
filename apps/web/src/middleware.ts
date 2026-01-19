import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for admin login page
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Admin route protection (for /admin/dashboard and subpages)
  if (pathname.startsWith('/admin')) {
    // Get admin wallet from cookie (set after successful admin login)
    const adminWallet = request.cookies.get('admin_wallet')?.value;

    if (!adminWallet) {
      const redirectUrl = new URL('/admin', request.url);
      redirectUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(redirectUrl);
    }

    // Use service role to check admin status
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user_id from wallets
    const { data: wallet } = await supabase
      .from('wallets')
      .select('user_id')
      .eq('address', adminWallet)
      .single();

    if (!wallet) {
      const redirectUrl = new URL('/admin', request.url);
      redirectUrl.searchParams.set('error', 'wallet_not_found');
      return NextResponse.redirect(redirectUrl);
    }

    // Check is_admin from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', wallet.user_id)
      .single();

    // Redirect if not admin
    if (!profile?.is_admin) {
      const redirectUrl = new URL('/admin', request.url);
      redirectUrl.searchParams.set('error', 'admin_access_denied');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
