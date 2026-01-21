// Session Management Utilities for Wallet-Only Auth
// Pure wallet authentication without email requirement

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export interface Session {
  userId: string;
  address: string;
  chain: string;
  walletId: string;
  profile?: any;
}

/**
 * Server action to properly logout user
 * Deletes session from auth_sessions table and clears cookies
 *
 * NOTE: This should be called from API route, not directly
 * API route will handle redirect/response
 */
export async function logout() {
  const supabase = createClient();
  const cookieStore = cookies();

  try {
    // 1. Get session token from cookie
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // 2. Delete session from auth_sessions table
      const { error } = await supabase
        .from('auth_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Error deleting session:', error);
      }
    }

    // 3. Clear all auth cookies
    cookieStore.delete('session_token');
    cookieStore.delete('wallet_address');
    cookieStore.delete('chain');
  } catch (error) {
    console.error('Logout error:', error);
    throw error; // Let API route handle error response
  }

  // NO redirect here - API route will return JSON response
}

/**
 * Get current authenticated session
 * Returns null if not authenticated or session expired
 */
export async function getServerSession(): Promise<Session | null> {
  const sessionToken = cookies().get('session_token')?.value;

  if (!sessionToken) {
    console.log('[Session] No session token cookie');
    return null;
  }

  const supabase = createClient();

  // Step 1: Get session from auth_sessions
  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    console.log('[Session] Session lookup failed:', error?.message);
    return null;
  }

  // Step 2: Get wallet info
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('id, user_id, address, chain')
    .eq('address', session.wallet_address)
    .eq('chain', session.chain)
    .single();

  if (walletError || !wallet) {
    console.log('[Session] Wallet lookup failed:', walletError?.message);
    return null;
  }

  // Update last_used_at timestamp (fire and forget)
  supabase
    .from('auth_sessions')
    .update({ last_used_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
    .then(() => {});

  console.log('[Session] User authenticated:', wallet.user_id, 'wallet:', wallet.id);

  return {
    userId: wallet.user_id,
    address: wallet.address,
    chain: wallet.chain,
    walletId: wallet.id,
  };
}

/**
 * Get session with full profile data
 */
export async function getSessionWithProfile(): Promise<(Session & { profile: any }) | null> {
  const sessionToken = cookies().get('session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  const supabase = createClient();

  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select(
      `
      *,
      wallets!inner(
        user_id,
        address,
        chain,
        profiles!inner(*)
      )
    `
    )
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return null;
  }

  // Update last_used_at
  supabase
    .from('auth_sessions')
    .update({ last_used_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
    .then(() => {});

  return {
    userId: session.wallets.user_id,
    address: session.wallets.address,
    chain: session.wallets.chain,
    walletId: session.wallet_id, // Use wallet_id from session
    profile: session.wallets.profiles,
  };
}

/**
 * Generate cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create new session for wallet
 *
 * IMPORTANT: This will invalidate all other sessions for different wallets
 * to ensure wallet isolation (user only sees data from current wallet)
 */
export async function createSession(
  walletAddress: string,
  chain: string,
  userId: string,
  options?: {
    expiresInDays?: number;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresInDays = options?.expiresInDays || 30;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const supabase = createClient();

  // Step 1: Get wallet_id for this wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('id')
    .eq('address', walletAddress)
    .eq('chain', chain)
    .single();

  if (walletError || !wallet) {
    console.error('Failed to find wallet for session:', walletError);
    throw new Error('Wallet not found');
  }

  // Step 2: Invalidate all other wallet sessions for this user (wallet isolation)
  try {
    await supabase.rpc('invalidate_other_wallet_sessions', {
      p_user_id: userId,
      p_current_wallet_id: wallet.id,
    });
    console.log('[Session] Invalidated other wallet sessions for user', userId);
  } catch (err) {
    console.warn('[Session] Could not invalidate other sessions:', err);
    // Non-critical, continue with session creation
  }

  // Step 3: Create new session with wallet_id reference
  const { error } = await supabase.from('auth_sessions').insert({
    wallet_address: walletAddress,
    chain,
    wallet_id: wallet.id,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
    user_agent: options?.userAgent,
    ip_address: options?.ipAddress,
  });

  if (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }

  console.log('[Session] Created new session for wallet', wallet.id);
  return sessionToken;
}

/**
 * Delete session (logout)
 */
export async function deleteSession(sessionToken?: string): Promise<void> {
  const token = sessionToken || cookies().get('session_token')?.value;

  if (!token) {
    return;
  }

  const supabase = createClient();

  await supabase.from('auth_sessions').delete().eq('session_token', token);
}

/**
 * Cleanup expired sessions (call from cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const supabase = createClient();

  const { data } = await supabase.rpc('cleanup_expired_sessions');

  return data || 0;
}
