import { getFeedPosts } from '@/lib/data/feed';
import { getUserProfile } from '@/lib/data/profile';
import FeedClientContent from './FeedClientContent';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Feed Page (Server Component)
 *
 * Fetches feed posts and user profile data server-side
 * and passes to client component for interactive rendering
 */
export default async function FeedPage() {
  const [posts, profile] = await Promise.all([getFeedPosts(), getUserProfile()]);

  console.log('[Feed Page] Profile data:', {
    profile,
    bluecheck_status: profile?.bluecheck_status,
  });

  const bluecheckStatus = profile?.bluecheck_status?.toUpperCase();
  const userEligible = bluecheckStatus === 'VERIFIED' || bluecheckStatus === 'ACTIVE';

  console.log('[Feed Page] Eligibility:', {
    bluecheckStatus,
    userEligible,
  });

  return (
    <FeedClientContent initialPosts={posts} userEligible={userEligible} userProfile={profile} />
  );
}
