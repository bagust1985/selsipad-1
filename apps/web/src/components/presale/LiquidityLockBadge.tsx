'use client';

import { Lock, ExternalLink, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LiquidityLock {
  id: string;
  chain: string;
  dex_type: string;
  lp_token_address: string;
  lock_amount: string;
  locked_at: string | null;
  locked_until: string | null;
  lock_duration_months: number;
  locker_contract_address: string | null;
  lock_tx_hash: string | null;
  status: 'PENDING' | 'LOCKED' | 'UNLOCKED' | 'FAILED';
}

interface LiquidityLockBadgeProps {
  roundId: string;
}

export function LiquidityLockBadge({ roundId }: LiquidityLockBadgeProps) {
  const [lock, setLock] = useState<LiquidityLock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLockStatus();
  }, [roundId]);

  const fetchLockStatus = async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}/lock`);
      if (res.ok) {
        const data = await res.json();
        setLock(data.lock);
      }
    } catch (err) {
      console.error('Failed to fetch lock status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!lock) {
    return null; // No lock configured
  }

  const getExplorerUrl = (chain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      bsc: 'https://bscscan.com/tx/',
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
    };
    return `${explorers[chain] || ''}${txHash}`;
  };

  const getDexName = (dexType: string) => {
    const names: Record<string, string> = {
      UNISWAP_V2: 'Uniswap V2',
      PANCAKE: 'PancakeSwap',
      RAYDIUM: 'Raydium',
      ORCA: 'Orca',
      OTHER: 'DEX',
    };
    return names[dexType] || dexType;
  };

  const calculateDaysRemaining = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // PENDING state
  if (lock.status === 'PENDING') {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-1">🟡 Liquidity Lock Pending</h4>
            <p className="text-sm text-gray-400 mb-2">
              Liquidity lock process is in progress. Lock will be confirmed shortly.
            </p>
            <div className="text-xs text-yellow-400">
              Duration: {lock.lock_duration_months} months lock planned
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FAILED state
  if (lock.status === 'FAILED') {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-1">🔴 Lock Failed</h4>
            <p className="text-sm text-gray-400">
              Liquidity lock failed. Please contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED state
  if (lock.status === 'UNLOCKED') {
    return (
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-1">⚪ Lock Period Ended</h4>
            <p className="text-sm text-gray-400 mb-3">
              The {lock.lock_duration_months}-month lock period has ended.
            </p>
            {lock.lock_tx_hash && (
              <a
                href={getExplorerUrl(lock.chain, lock.lock_tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                View Lock Transaction
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOCKED state (active lock)
  const daysRemaining = lock.locked_until ? calculateDaysRemaining(lock.locked_until) : null;
  const lockDate = lock.locked_at ? new Date(lock.locked_at) : null;
  const unlockDate = lock.locked_until ? new Date(lock.locked_until) : null;

  return (
    <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-green-500/20 rounded-lg">
          <Lock className="w-8 h-8 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">🔒 Liquidity Locked</h3>
          <p className="text-sm text-gray-400">
            Liquidity is securely locked for investor protection
          </p>
        </div>
        <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
          <span className="text-xs font-semibold text-green-400">ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Lock Duration</div>
          <div className="text-lg font-bold text-white">{lock.lock_duration_months} months</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">DEX Platform</div>
          <div className="text-lg font-bold text-white">{getDexName(lock.dex_type)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Locked On</div>
          <div className="text-sm font-semibold text-white">
            {lockDate?.toLocaleDateString() || 'Pending'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Unlock Date</div>
          <div className="text-sm font-semibold text-white">
            {unlockDate?.toLocaleDateString() || 'Calculating...'}
          </div>
        </div>
      </div>

      {daysRemaining !== null && daysRemaining > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              <strong>{daysRemaining} days</strong> remaining until unlock
            </span>
          </div>
        </div>
      )}

      {lock.lock_tx_hash && (
        <a
          href={getExplorerUrl(lock.chain, lock.lock_tx_hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Lock Contract
        </a>
      )}
    </div>
  );
}
