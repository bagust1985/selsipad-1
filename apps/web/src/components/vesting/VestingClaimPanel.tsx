'use client';

import { useState, useEffect } from 'react';
import { Gift, Lock, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface VestingAllocation {
  id: string;
  allocation_tokens: string;
  claimed_tokens: string;
  last_claim_at?: string;
  total_claims: number;
}

interface NextUnlock {
  amount: string;
  unlockAt: string;
  daysUntil: number;
}

interface VestingClaimPanelProps {
  allocationId: string;
  userAddress?: string;
}

export function VestingClaimPanel({ allocationId, userAddress }: VestingClaimPanelProps) {
  const [claimable, setClaimable] = useState('0');
  const [nextUnlock, setNextUnlock] = useState<NextUnlock | null>(null);
  const [vestingProgress, setVestingProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch claimable amount
  useEffect(() => {
    if (!userAddress || !allocationId) {
      setLoading(false);
      return;
    }

    fetchClaimable();
  }, [allocationId, userAddress]);

  const fetchClaimable = async () => {
    try {
      const res = await fetch(`/api/vesting/${allocationId}/claimable`);
      if (res.ok) {
        const data = await res.json();
        setClaimable(data.data.claimable || '0');
        setNextUnlock(data.data.nextUnlock);
        setVestingProgress(data.data.vestingProgress);
      }
    } catch (err) {
      console.error('Failed to fetch claimable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!userAddress || Number(claimable) <= 0) return;

    setClaiming(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/vesting/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationId,
          amount: claimable,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to claim');
      }

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Claim failed');
      }

      setSuccess(true);
      // Refresh claimable amount
      await fetchClaimable();
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  // Not connected
  if (!userAddress) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Connect Wallet</h3>
            <p className="text-sm text-gray-400">
              Connect your wallet to view and claim vested tokens
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!vestingProgress) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">No Allocation</h3>
            <p className="text-sm text-gray-400">You don't have any token allocation</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTokens = Number(vestingProgress.total);
  const claimedTokens = Number(vestingProgress.claimed);
  const unlockedTokens = Number(vestingProgress.unlocked);
  const remainingTokens = totalTokens - claimedTokens;
  const claimProgress = vestingProgress.percentUnlocked;

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <Gift className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Your Vesting Allocation</h3>
          <p className="text-sm text-gray-400">Claim your vested tokens</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Total Allocated</div>
          <div className="text-lg font-bold text-white">{totalTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Claimed</div>
          <div className="text-lg font-bold text-green-400">{claimedTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Remaining</div>
          <div className="text-lg font-bold text-white">{remainingTokens.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Vesting Progress</span>
          <span className="text-white font-semibold">{claimProgress.toFixed(1)}% Unlocked</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all"
            style={{ width: `${Math.min(claimProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Claimable Amount */}
      {Number(claimable) > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Available to Claim</div>
          <div className="text-3xl font-bold text-white mb-2">
            {Number(claimable).toLocaleString()}
          </div>
          <div className="text-xs text-green-400">✓ Ready for claim</div>
        </div>
      )}

      {/* Next Unlock Info */}
      {nextUnlock && Number(claimable) === 0 && remainingTokens > 0 && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 mt-1" />
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">Next Unlock</div>
              <div className="text-2xl font-bold text-white mb-1">
                {Number(nextUnlock.amount).toLocaleString()} tokens
              </div>
              <div className="text-xs text-blue-400">
                in {nextUnlock.daysUntil} days ({new Date(nextUnlock.unlockAt).toLocaleDateString()}
                )
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={claiming || Number(claimable) <= 0}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          Number(claimable) > 0 && !claiming
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {claiming ? (
          <span className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Claiming...
          </span>
        ) : Number(claimable) > 0 ? (
          `Claim ${Number(claimable).toLocaleString()} Tokens`
        ) : remainingTokens > 0 ? (
          'Nothing to claim yet'
        ) : (
          'All tokens claimed'
        )}
      </button>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Tokens claimed successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}
