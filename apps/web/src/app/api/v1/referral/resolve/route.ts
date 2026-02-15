import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/v1/referral/resolve?code=XXXXXXXX
 *
 * Resolves a referral code to the referrer's wallet address for on-chain usage.
 * Returns the wallet address so the contribute() call can pass it to the contract.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find the profile that owns this referral code
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error || !profile?.wallet_address) {
    return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    wallet_address: profile.wallet_address,
  });
}
