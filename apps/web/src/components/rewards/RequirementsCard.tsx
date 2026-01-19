'use client';

import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface ClaimRequirements {
  canClaim: boolean;
  blockedReason: string | null;
  requirements: {
    blueCheck: {
      met: boolean;
      status: string;
    };
    activeReferrals: {
      met: boolean;
      count: number;
      required: number;
    };
  };
}

interface RequirementsCardProps {
  requirements: ClaimRequirements | null;
  loading?: boolean;
}

export function RequirementsCard({ requirements, loading }: RequirementsCardProps) {
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-3 bg-gray-800 rounded w-2/3"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!requirements) return null;

  const { canClaim, blockedReason, requirements: reqs } = requirements;

  return (
    <div
      className={`p-6 border rounded-xl ${
        canClaim ? 'bg-green-950/20 border-green-500/30' : 'bg-yellow-950/20 border-yellow-500/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-semibold text-white">Claim Requirements</h3>
      </div>

      {/* Requirement Checklist */}
      <div className="space-y-3 mb-4">
        {/* Blue Check */}
        <div className="flex items-start gap-3">
          {reqs.blueCheck.met ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${reqs.blueCheck.met ? 'text-green-300' : 'text-red-300'}`}
            >
              {reqs.blueCheck.met ? 'Blue Check Verified' : 'Blue Check Required'}
            </p>
            {!reqs.blueCheck.met && (
              <Link
                href="/profile/bluecheck"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                Get Blue Check
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Active Referrals */}
        <div className="flex items-start gap-3">
          {reqs.activeReferrals.met ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${reqs.activeReferrals.met ? 'text-green-300' : 'text-red-300'}`}
            >
              Active Referrals: {reqs.activeReferrals.count} / {reqs.activeReferrals.required}
            </p>
            {!reqs.activeReferrals.met && (
              <button
                onClick={() => {
                  const shareButton = document.querySelector(
                    '[data-share-referral]'
                  ) as HTMLButtonElement;
                  shareButton?.click();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                Share Referral Link
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            {/* Progress Bar */}
            {!reqs.activeReferrals.met && (
              <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (reqs.activeReferrals.count / reqs.activeReferrals.required) * 100)}%`,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={`p-3 rounded-lg ${
          canClaim
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-yellow-500/10 border border-yellow-500/20'
        }`}
      >
        <p className={`text-sm font-medium ${canClaim ? 'text-green-300' : 'text-yellow-300'}`}>
          {canClaim ? (
            <span className="flex items-center gap-2">✅ You can claim rewards!</span>
          ) : (
            <span className="flex items-center gap-2">🔒 {blockedReason}</span>
          )}
        </p>
      </div>
    </div>
  );
}
