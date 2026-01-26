import { createClient } from '@/lib/supabase/server';

/**
 * Check if user has developer verified badge
 * @param userId - User ID to check
 * @returns Promise<boolean> - true if user has developer badge
 */
export async function hasDevBadge(userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Get user's active badges using the RPC function
    const { data, error } = await supabase.rpc('get_user_active_badges', {
      target_user_id: userId,
    });

    console.log('[DevAccess] Checking user:', userId);
    console.log('[DevAccess] RPC Response:', { data, error });

    if (error) {
      console.error('[DevAccess] Error checking dev badge:', error);
      return false;
    }

    // Check if user has DEVELOPER_KYC_VERIFIED badge
    const hasDevBadge = data?.some(
      (badge: any) => {
        console.log('[DevAccess] Checking badge:', badge.badge_key);
        return badge.badge_key === 'DEVELOPER_KYC_VERIFIED';
      }
    );

    console.log('[DevAccess] Has DEVELOPER_KYC_VERIFIED:', hasDevBadge);
    console.log('[DevAccess] All badges:', data?.map((b: any) => b.badge_key));

    return hasDevBadge || false;
  } catch (error) {
    console.error('[DevAccess] Error in hasDevBadge:', error);
    return false;
  }
}

/**
 * Verify developer access for protected routes
 * Throws error if user doesn't have dev badge
 */
export async function verifyDevAccess(userId: string): Promise<void> {
  const isDev = await hasDevBadge(userId);
  
  if (!isDev) {
    throw new Error('Developer verification required. This feature is only accessible to verified developers.');
  }
}
