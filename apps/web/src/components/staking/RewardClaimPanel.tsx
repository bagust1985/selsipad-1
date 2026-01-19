'use client';

import { useState } from 'react';
import { Gift, DollarSign, Unlock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface RewardClaimPanelProps {
  rewardInfo: any;
  onUnstaked: () => void;
  onClaimed: () => void;
}

export function RewardClaimPanel({ rewardInfo, onUnstaked, onClaimed }: RewardClaimPanelProps) {
  const [claiming, setClaiming] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimableRewards = parseFloat(rewardInfo.claimableRewards || 0);
  const netPayout = parseFloat(rewardInfo.netPayout || 0);
  const claimFee = parseFloat(rewardInfo.claimFee || 10);

  const handleClaim = async () => {
    if (claimableRewards < claimFee) {
      setError(`Minimum ${claimFee} USDT required to cover claim fee`);
      return;
    }

    setClaiming(true);
    setError(null);
    setClaimSuccess(false);

    try {
      const res = await fetch('/api/staking/sbt/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: rewardInfo.positionId,
          amount: claimableRewards.toFixed(2),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Claim failed');
      }

      setClaimSuccess(true);
      onClaimed();
    } catch (err: any) {
      setError(err.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  const handleUnstake = async () => {
    if (!confirm('Are you sure you want to unstake? You can restake anytime.')) {
      return;
    }

    setUnstaking(true);
    setError(null);

    try {
      const res = await fetch('/api/staking/sbt/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: rewardInfo.positionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unstake failed');
      }

      onUnstaked();
    } catch (err: any) {
      setError(err.message || 'Unstake failed');
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staking Status */}
      <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">🟢 Currently Staked</h3>
            <p className="text-sm text-gray-400">Earning rewards from the pool</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Staked Since</div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(rewardInfo.stakedAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Days Staked</div>
            <div className="text-sm font-semibold text-white">{rewardInfo.daysStaked} days</div>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-start gap-3 mb-6">
          <Gift className="w-6 h-6 text-yellow-400 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Accumulated Rewards</h3>
            <p className="text-sm text-gray-400">Claim your staking rewards</p>
          </div>
        </div>

        {/* Claimable Amount */}
        <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg mb-4">
          <div className="text-sm text-gray-400 mb-2">Available to Claim</div>
          <div className="text-4xl font-bold text-white mb-3">
            💰 ${claimableRewards.toFixed(2)} USDT
          </div>

          {claimableRewards > 0 && (
            <div className="text-sm text-yellow-300">✓ Minimum claim amount met</div>
          )}
        </div>

        {/* Fee Breakdown */}
        {claimableRewards >= claimFee && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Claimable Rewards:</span>
              <span className="text-white font-semibold">${claimableRewards.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Claim Fee:</span>
              <span className="text-red-400">- ${claimFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-500/20 pt-2 mt-2">
              <div className="flex justify-between text-base">
                <span className="text-white font-semibold">Net Payout:</span>
                <span className="text-green-400 font-bold">${netPayout.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={claiming || claimableRewards < claimFee}
          className={`w-full py-3 rounded-lg font-semibold transition-colors mb-3 ${
            claimableRewards >= claimFee && !claiming
              ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {claiming ? (
            'Claiming...'
          ) : claimableRewards >= claimFee ? (
            <>
              <DollarSign className="w-4 h-4 inline mr-2" />
              Claim ${netPayout.toFixed(2)} (${claimFee} fee)
            </>
          ) : (
            `Minimum $${claimFee} required`
          )}
        </button>

        {/* Success Message */}
        {claimSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Rewards claimed successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Unstake Button */}
        <button
          onClick={handleUnstake}
          disabled={unstaking}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Unlock className="w-4 h-4" />
          {unstaking ? 'Unstaking...' : 'Unstake SBT (No Cooldown)'}
        </button>
      </div>
    </div>
  );
}
