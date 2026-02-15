'use server';

import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export interface AdminSession {
  userId: string;
  wallet: string;
  roles: string[];
  chain: string;
}

/**
 * Get admin session from admin_session cookie (set by /api/auth/admin-login).
 * Falls back to regular session_token cookie if admin_session not found.
 * Verifies the user has admin privileges via profiles.is_admin.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  // 1. Try admin_session cookie first (set by admin login)
  const adminSessionRaw = cookieStore.get('admin_session')?.value;
  if (adminSessionRaw) {
    try {
      const parsed = JSON.parse(adminSessionRaw);
      if (parsed.userId && parsed.wallet) {
        // Verify admin status in DB
        const supabase = createServiceRoleClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', parsed.userId)
          .single();

        if (profile?.is_admin) {
          return {
            userId: parsed.userId,
            wallet: parsed.wallet,
            roles: parsed.roles || [],
            chain: parsed.chain || 'EVM_1',
          };
        }
      }
    } catch {
      // Invalid JSON, fall through
    }
  }

  // 2. Fallback: try regular session_token cookie
  const sessionToken = cookieStore.get('session_token')?.value;
  if (sessionToken) {
    const supabase = createServiceRoleClient();
    const { data: session } = await supabase
      .from('auth_sessions')
      .select('*, wallets(*)')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (session?.wallets?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.wallets.user_id)
        .single();

      if (profile?.is_admin) {
        return {
          userId: session.wallets.user_id,
          wallet: session.wallets.address,
          roles: ['admin'],
          chain: session.wallets.chain,
        };
      }
    }
  }

  return null;
}
