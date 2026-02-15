'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Loader2 } from 'lucide-react';
import { SBTVerifyCard } from '@/components/staking/SBTVerifyCard';
import { StakePanel } from '@/components/staking/StakePanel';
import { RewardClaimPanel } from '@/components/staking/RewardClaimPanel';

export default function SBTStakingPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [isStaked, setIsStaked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sbtInfo, setSbtInfo] = useState<any>(null);
  const [rewardInfo, setRewardInfo] = useState<any>(null);

  useEffect(() => {
    checkStakingStatus();
  }, []);

  const checkStakingStatus = async () => {
    try {
      const res = await fetch('/api/staking/sbt/rewards');
      if (res.ok) {
        const data = await res.json();
        setIsStaked(data.data.hasActiveStake);
        setRewardInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (info: any) => {
    setIsVerified(true);
    setSbtInfo(info);
  };

  const handleStaked = () => {
    setIsStaked(true);
    checkStakingStatus();
  };

  const handleUnstaked = () => {
    setIsStaked(false);
    checkStakingStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-white">SBT Staking Pool</h1>
              <p className="text-xs text-gray-500 font-medium">Proof of Human Verification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Pool Stats */}
        {rewardInfo && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total Pool</div>
              <div className="text-2xl font-bold text-white">
                ${parseFloat(rewardInfo.poolBalance || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total Stakers</div>
              <div className="text-2xl font-bold text-white">{rewardInfo.totalStakers || 0}</div>
            </div>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Claim Fee</div>
              <div className="text-2xl font-bold text-white">$10</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Verify SBT */}
          {!isVerified && !isStaked && <SBTVerifyCard onVerified={handleVerified} />}

          {/* Step 2: Stake */}
          {isVerified && !isStaked && <StakePanel sbtInfo={sbtInfo} onStaked={handleStaked} />}

          {/* Step 3: Manage Rewards */}
          {isStaked && rewardInfo && (
            <RewardClaimPanel
              rewardInfo={rewardInfo}
              onUnstaked={handleUnstaked}
              onClaimed={checkStakingStatus}
            />
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-950/30 border border-blue-800/40 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">
            <TrendingUp className="w-5 h-5 inline mr-2" />
            How It Works
          </h3>
          <ul className="text-sm text-blue-200/80 space-y-2">
            <li>
              • <strong>Verify</strong> your external SBT ownership on-chain
            </li>
            <li>
              • <strong>Stake</strong> your SBT (no token transfer, database-only)
            </li>
            <li>
              • <strong>Earn</strong> rewards from NFT_STAKING fee splits
            </li>
            <li>
              • <strong>Claim</strong> anytime with a flat $10 fee
            </li>
            <li>
              • <strong>Unstake</strong> instantly (no cooldown period)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
