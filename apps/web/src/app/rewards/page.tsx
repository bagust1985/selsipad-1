'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Banner,
  EmptyState,
  EmptyIcon,
  useToast,
} from '@/components/ui';
import { PageHeader, PageContainer, BottomSheet } from '@/components/layout';
import {
  getClaimableRewards,
  getReferralStats,
  claimReward,
  claimAllRewards,
  getClaimRequirements,
  type Reward,
  type ReferralStats,
  type ClaimRequirements,
} from '@/lib/data/rewards';
import { formatDistance } from 'date-fns';

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingAll, setClaimingAll] = useState(false);
  const [referralSheetOpen, setReferralSheetOpen] = useState(false);
  const [claimReqs, setClaimReqs] = useState<ClaimRequirements | null>(null);
  const { showToast } = useToast();

  // Load data
  useState(() => {
    Promise.all([getClaimableRewards(), getReferralStats(), getClaimRequirements()]).then(
      ([rewardsData, statsData, reqsData]) => {
        setRewards(rewardsData);
        setStats(statsData);
        setClaimReqs(reqsData);
        setLoading(false);
      }
    );
  });

  const totalClaimable = rewards.reduce((sum, r) => sum + r.amount, 0);

  const handleClaimSingle = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
      setRewards(rewards.filter((r) => r.id !== rewardId));
      showToast('success', 'Reward claimed successfully');
    } catch (error) {
      showToast('error', 'Failed to claim reward');
    }
  };

  const handleClaimAll = async () => {
    if (rewards.length === 0) return;

    setClaimingAll(true);
    try {
      await claimAllRewards();
      setRewards([]);
      showToast('success', `Claimed all rewards successfully`);
    } catch (error) {
      showToast('error', 'Failed to claim rewards');
    } finally {
      setClaimingAll(false);
    }
  };

  const handleShareReferral = () => {
    if (!stats) return;

    const referralLink = `https://selsipad.com/ref/${stats.referral_code}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join SELSIPAD',
        text: `Use my referral code ${stats.referral_code} to get started on SELSIPAD!`,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      showToast('success', 'Referral link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <PageHeader title="Rewards" />
        <PageContainer className="py-4">
          <p className="text-text-secondary">Loading...</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Rewards" />

      <PageContainer className="py-4 space-y-6">
        {/* Claimable Summary */}
        <Card variant="bordered" className="border-l-4 border-primary-main">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-text-secondary">Total Claimable</p>
                <p className="text-display-md font-bold text-text-primary tabular-nums">
                  {totalClaimable.toFixed(6)} {rewards[0]?.currency || 'BNB'}
                </p>
              </div>
              {rewards.length > 0 && (
                <Button onClick={handleClaimAll} isLoading={claimingAll}>
                  Claim All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        {stats && (
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-heading-lg">Referral Program</h3>
                <button
                  onClick={() => setReferralSheetOpen(true)}
                  className="px-3 py-1.5 bg-primary-soft/20 text-primary-main rounded-md text-caption font-medium hover:bg-primary-soft/30 transition-colors"
                >
                  Share
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-text-secondary">Total Referrals</p>
                  <p className="text-heading-md">{stats.total_referrals}</p>
                </div>
                <div>
                  <p className="text-caption text-text-secondary">Active</p>
                  <p className="text-heading-md">{stats.active_referrals}</p>
                </div>
                <div>
                  <p className="text-caption text-text-secondary">Total Earned</p>
                  <p className="text-heading-md">{stats.total_earnings.toFixed(6)} BNB</p>
                </div>
                <div>
                  <p className="text-caption text-text-secondary">Pending</p>
                  <p className="text-heading-md">{stats.pending_rewards.toFixed(6)} BNB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claimable Rewards */}
        <div className="space-y-3">
          <h3 className="text-heading-md text-text-primary">Claimable Rewards</h3>

          {rewards.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<EmptyIcon />}
                  title="No rewards to claim"
                  description="Keep participating to earn rewards!"
                  action={{
                    label: 'View History',
                    onClick: () => (window.location.href = '/rewards/history'),
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id} hover>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {reward.type === 'referral'
                            ? '👥'
                            : reward.type === 'contribution'
                              ? '💰'
                              : reward.type === 'social'
                                ? '💬'
                                : '🎯'}
                        </span>
                        <h4 className="text-heading-sm">{reward.description}</h4>
                      </div>
                      <p className="text-caption text-text-secondary">
                        {formatDistance(new Date(reward.created_at), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-heading-md font-bold text-status-success-text tabular-nums">
                        +{reward.amount} {reward.currency}
                      </p>
                      <button
                        onClick={() => handleClaimSingle(reward.id)}
                        className="px-3 py-1 bg-primary-main text-primary-text rounded-md text-caption font-medium hover:bg-primary-hover transition-colors"
                      >
                        Claim
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Banner */}
        <Banner
          type="info"
          message="How to earn more rewards"
          submessage="Refer friends, participate in presales, and engage with the community to earn SOL rewards."
        />
      </PageContainer>

      {/* Referral Share Bottom Sheet */}
      <BottomSheet
        isOpen={referralSheetOpen}
        onClose={() => setReferralSheetOpen(false)}
        title="Share Referral Link"
      >
        {stats && (
          <div className="space-y-4">
            <div>
              <p className="text-body-sm text-text-secondary mb-3">
                Share your referral code and earn rewards when your friends participate in presales!
              </p>

              <div className="p-4 bg-bg-card rounded-lg border border-border-subtle">
                <p className="text-caption text-text-secondary mb-1">Your Referral Code</p>
                <p className="text-heading-lg font-mono text-text-primary">{stats.referral_code}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-caption text-text-secondary">Referral Rewards (Modul 15):</p>
              <ul className="text-body-sm text-text-secondary space-y-1">
                <li>• Fairlaunch/Presale: 2% of contribution (40% of 5% fee)</li>
                <li>• Bonding Curve: 0.75% of swap (50% of 1.5% fee)</li>
                <li>• Blue Check: 30% of $10 fee ($3 per activation)</li>
                <li>• Requires Blue Check ACTIVE + 1 active referral to claim</li>
              </ul>
            </div>

            <Button className="w-full" onClick={handleShareReferral}>
              Share Referral Link
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
