'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, StatusBadge, Avatar } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import type { UserProfile } from '@/lib/data/profile';
import { formatDistance } from 'date-fns';

interface ProfileClientContentProps {
  initialProfile: UserProfile;
}

export function ProfileClientContent({ initialProfile }: ProfileClientContentProps) {
  const [profile] = useState<UserProfile>(initialProfile);

  const primaryWallet = profile.wallets.find((w) => w.is_primary);

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader
        title="Profile"
        actions={
          <Link
            href="/profile/edit"
            className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-hover transition-colors text-body-sm font-medium"
          >
            Edit Profile
          </Link>
        }
      />

      <PageContainer className="py-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.avatar_url}
                alt={profile.username || 'User'}
                size="xl"
                fallback={profile.username?.slice(0, 2).toUpperCase() || 'U'}
              />
              <div className="flex-1">
                <h2 className="text-heading-lg">{profile.username || 'Anonymous User'}</h2>
                {profile.bio && (
                  <p className="text-body-sm text-text-secondary mt-1">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
              <div>
                <p className="text-caption text-text-secondary">Followers</p>
                <p className="text-heading-md">{profile.follower_count || 0}</p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">Following</p>
                <p className="text-heading-md">{profile.following_count || 0}</p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">Total Contributed</p>
                <p className="text-heading-md">{profile.total_contributions} SOL</p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">Tokens Claimed</p>
                <p className="text-heading-md">{profile.total_claimed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Collection */}
        <div className="space-y-3">
          <div>
            <h3 className="text-heading-md text-text-primary">Badge Collection</h3>
            <p className="text-caption text-text-secondary mt-1">
              Your earned badges and achievements
            </p>
          </div>

          {/* Blue Check Status */}
          <Link href="/profile/blue-check">
            <Card hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg-elevated rounded-full flex items-center justify-center">
                      {profile.bluecheck_status === 'active' ? '✓' : '○'}
                    </div>
                    <div>
                      <h4 className="text-heading-sm">Blue Check</h4>
                      <p className="text-caption text-text-secondary">
                        {profile.bluecheck_status === 'active' && profile.bluecheck_expires_at
                          ? `Expires ${formatDistance(new Date(profile.bluecheck_expires_at), new Date(), { addSuffix: true })}`
                          : 'Enhanced trust badge'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      profile.bluecheck_status === 'none'
                        ? 'inactive'
                        : profile.bluecheck_status === 'active'
                          ? 'verified'
                          : (profile.bluecheck_status as any)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* KYC Status */}
          <Link href="/profile/kyc">
            <Card hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg-elevated rounded-full flex items-center justify-center">
                      {profile.kyc_status === 'verified' ? '✓' : '📋'}
                    </div>
                    <div>
                      <h4 className="text-heading-sm">Developer KYC</h4>
                      <p className="text-caption text-text-secondary">
                        {profile.kyc_status === 'verified'
                          ? 'Identity verified for project creation'
                          : 'Required for project creators'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      profile.kyc_status === 'verified'
                        ? 'verified'
                        : profile.kyc_status === 'not_started'
                          ? 'inactive'
                          : (profile.kyc_status as any)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Wallet Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-md text-text-primary">Wallets</h3>
            <Link
              href="/profile/wallets"
              className="text-body-sm text-primary-main hover:underline"
            >
              Manage
            </Link>
          </div>

          {primaryWallet ? (
            <Card variant="bordered" className="border-l-4 border-primary-main">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-heading-sm font-mono">{primaryWallet.address}</h4>
                      <span className="px-2 py-0.5 bg-primary-soft/20 text-primary-main text-caption rounded-full border border-primary-main/30">
                        Primary
                      </span>
                    </div>
                    <p className="text-caption text-text-secondary">
                      {primaryWallet.network} • {primaryWallet.label || 'No label'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-body-sm text-text-secondary mb-3">No primary wallet set</p>
                <Link href="/profile/wallets">
                  <button className="px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors">
                    Add Wallet
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}

          {profile.wallets.length > 1 && (
            <p className="text-caption text-text-secondary">
              +{profile.wallets.length - 1} more wallet{profile.wallets.length > 2 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/profile/wallets">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <svg
                  className="w-8 h-8 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <h4 className="text-heading-sm">Add Wallet</h4>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/security">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <svg
                  className="w-8 h-8 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h4 className="text-heading-sm">Security</h4>
              </CardContent>
            </Card>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
