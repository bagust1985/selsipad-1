import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, PageContainer } from '@/components/layout';
import { getUserProfile } from '@/lib/data/profile';
import { getUserStatsMultiChain } from '@/lib/data/multi-chain-stats';
import { getServerSession } from '@/lib/auth/session';
import { ProfileClientContent } from './ProfileClientContent';
import { Card, CardContent } from '@/components/ui';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  // Get session ONCE - reuse everywhere
  const session = await getServerSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <PageHeader title="Profile" />
        <PageContainer className="py-4">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-heading-lg mb-4">Connect Your Wallet</h2>
              <p className="text-body-sm text-text-secondary mb-6">
                Please connect your wallet to view your profile
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary-main text-primary-text rounded-md font-medium hover:bg-primary-hover transition-colors"
              >
                Go to Home
              </Link>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    );
  }

  // Fetch ALL data in parallel — single session, no redundant DB calls
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [profile, multiChainStats, badgesResult] = await Promise.all([
    // Pass session to avoid internal getServerSession() call
    getUserProfile(session),
    // Multi-chain stats
    getUserStatsMultiChain(session.userId),
    // Badges
    supabase
      .from('badge_instances')
      .select(
        `
        id,
        status,
        awarded_at,
        badge:badge_id (
          id,
          badge_key,
          name,
          description,
          icon_url,
          badge_type
        )
      `
      )
      .eq('user_id', session.userId)
      .eq('status', 'ACTIVE'),
  ]);

  const userBadges = badgesResult.data || [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <PageHeader title="Profile" />
        <PageContainer className="py-4">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-heading-lg mb-4">Connect Your Wallet</h2>
              <p className="text-body-sm text-text-secondary mb-6">
                Please connect your wallet to view your profile
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary-main text-primary-text rounded-md font-medium hover:bg-primary-hover transition-colors"
              >
                Go to Home
              </Link>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    );
  }

  return (
    <ProfileClientContent
      initialProfile={profile}
      multiChainStats={multiChainStats}
      userBadges={userBadges}
    />
  );
}
