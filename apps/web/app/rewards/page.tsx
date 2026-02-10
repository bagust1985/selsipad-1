/**
 * Rewards Page - Referral Dashboard
 * Shows user's referral statistics, earnings, and referred users
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth/session';
import { getReferralStats } from '@/actions/referral/get-stats';
import { PageHeader, PageContainer } from '@/components/layout';
import { ReferralStatsCards } from '@/components/referral/ReferralStatsCards';
import { ReferralList } from '@/components/referral/ReferralList';
import { ReferralExplainer } from '@/components/referral/ReferralExplainer';
import { ReferralCodeDisplay } from '@/components/referral/ReferralCodeDisplay';

export default async function RewardsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  // Fetch referral statistics
  const { success, stats, error } = await getReferralStats();

  if (!success || !stats) {
    console.error('Failed to load referral stats:', error);
    // Show empty state but don't redirect
  }

  /* Custom Header matching Profile page */
  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans selection:bg-cyan-500/30">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Referral Rewards</h1>
              <p className="text-xs text-gray-500 font-medium">Track your earnings</p>
            </div>
          </div>

          {/* Optional: Add an action button here if needed, or keep empty to match Profile alignment */}
        </div>
      </div>

      <PageContainer className="py-6">
        {stats ? (
          <div className="space-y-6">
            <ReferralStatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Pass referred users or use a client component if needed */}
                {/* The original code just used stats.referredUsers, assuming ReferralList handles it */}
                <ReferralList referredUsers={stats.referredUsers} />
              </div>
              <div className="space-y-6">
                {/* We need to pass the referral code if available in stats or fetch it. 
                    The original code didn't pass props to ReferralCodeDisplay? 
                    Let's check ReferralCodeDisplay definition if needed, but for now presume it fetches its own or uses context.
                    Actually, looking at previous code, it was <ReferralCodeDisplay /> without props.
                */}
                <ReferralCodeDisplay />
                <ReferralExplainer />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl mb-2 text-white">Failed to load referral data</p>
            <p className="text-sm text-gray-500">{error || 'Please try again later'}</p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
