import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Get user_id from wallets table
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('user_id')
      .eq('address', walletAddress)
      .single();

    if (walletError || !wallet) {
      console.log('[Admin Auth] Wallet not found:', walletAddress);
      return NextResponse.json(
        { error: 'Wallet not found. Please connect your wallet to the app first.' },
        { status: 404 }
      );
    }

    // Step 2: Check is_admin from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, user_id')
      .eq('user_id', wallet.user_id)
      .single();

    if (profileError || !profile) {
      console.log('[Admin Auth] Profile not found for user_id:', wallet.user_id);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_admin) {
      console.log('[Admin Auth] Access denied - not admin:', walletAddress);
      return NextResponse.json(
        { error: 'Access denied. Your wallet is not authorized as admin.' },
        { status: 403 }
      );
    }

    console.log('[Admin Auth] Success:', {
      wallet: walletAddress,
      user_id: profile.user_id,
    });

    // Create response with admin_wallet cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      redirectTo: '/admin/dashboard',
    });

    // Set admin wallet cookie (httpOnly for security)
    response.cookies.set('admin_wallet', walletAddress, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/admin',
    });

    return response;
  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
