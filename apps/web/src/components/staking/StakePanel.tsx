'use client';

import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface StakePanelProps {
  sbtInfo: any;
  onStaked: () => void;
}

export function StakePanel({ sbtInfo, onStaked }: StakePanelProps) {
  const [staking, setStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStake = async () => {
    setStaking(true);
    setError(null);

    try {
      const res = await fetch('/api/staking/sbt/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sbtContract: sbtInfo.sbtContract,
          tokenId: sbtInfo.tokenId,
          chain: sbtInfo.chain,
          walletAddress: sbtInfo.walletAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Staking failed');
      }

      onStaked();
    } catch (err: any) {
      setError(err.message || 'Staking failed');
    } finally {
      setStaking(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex items-start gap-3 mb-6">
        <Lock className="w-6 h-6 text-green-400 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Stake Your SBT</h3>
          <p className="text-sm text-gray-400">Start earning rewards from the staking pool</p>
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
        <div className="text-sm text-blue-200 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span>No token transfer required (database-only)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span>Earn rewards from NFT_STAKING fee splits</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span>Unstake anytime with no cooldown</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleStake}
        disabled={staking}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-semibold transition-colors"
      >
        {staking ? 'Staking...' : 'Stake SBT'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}
