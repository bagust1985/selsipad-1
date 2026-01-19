'use client';

import { Lock, TrendingUp, Calendar, ExternalLink, AlertCircle } from 'lucide-react';

interface LiquidityLock {
  id: string;
  chain: string;
  dex_type: string;
  lp_token_address: string;
  lock_amount: number;
  locked_at: string | null;
  locked_until: string | null;
  lock_duration_months: number;
  locker_contract_address?: string;
  lock_tx_hash?: string;
  status: 'PENDING' | 'LOCKED' | 'UNLOCKED' | 'FAILED';
}

interface LPLockDisplayProps {
  lock: LiquidityLock | null;
  daysRemaining?: number | null;
  unlockProgress?: number;
  loading?: boolean;
}

export function LPLockDisplay({
  lock,
  daysRemaining,
  unlockProgress = 0,
  loading,
}: LPLockDisplayProps) {
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!lock) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">No LP Lock</h3>
            <p className="text-sm text-gray-400">Liquidity lock not yet created for this round</p>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = lock.status === 'LOCKED';
  const isPending = lock.status === 'PENDING';
  const isUnlocked = lock.status === 'UNLOCKED';
  const isFailed = lock.status === 'FAILED';

  const statusColor = isLocked
    ? 'text-green-400 bg-green-400/10 border-green-400/30'
    : isPending
      ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      : isUnlocked
        ? 'text-blue-400 bg-blue-400/10 border-blue-400/30'
        : 'text-red-400 bg-red-400/10 border-red-400/30';

  const lockedDate = lock.locked_at ? new Date(lock.locked_at) : null;
  const unlockDate = lock.locked_until ? new Date(lock.locked_until) : null;

  // Explorer URL based on chain
  const getExplorerUrl = (chain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      SOLANA: 'https://solscan.io/tx/',
      ETHEREUM: 'https://etherscan.io/tx/',
      BSC: 'https://bscscan.com/tx/',
      POLYGON: 'https://polygonscan.com/tx/',
    };
    return `${explorers[chain] || explorers.ETHEREUM}${txHash}`;
  };

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Liquidity Lock</h3>
            <p className="text-sm text-gray-400">
              {lock.dex_type} • {lock.chain}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColor}`}>
          {lock.status}
        </div>
      </div>

      {/* Lock Duration Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Lock Duration</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{lock.lock_duration_months} months</div>
        {lock.lock_duration_months >= 12 && (
          <div className="text-xs text-green-400">✓ Meets minimum 12-month requirement</div>
        )}
      </div>

      {/* Progress Bar (if locked) */}
      {isLocked && unlockProgress !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Unlock Progress</span>
            <span className="text-white font-semibold">{unlockProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all"
              style={{ width: `${Math.min(unlockProgress, 100)}%` }}
            />
          </div>
          {daysRemaining !== null && daysRemaining !== undefined && (
            <div className="text-sm text-gray-500">
              {daysRemaining > 0 ? (
                <>
                  <span className="text-white font-semibold">{daysRemaining}</span> days remaining
                </>
              ) : (
                <span className="text-green-400">Unlock period reached</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lock Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {lockedDate && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Locked At</div>
            <div className="text-sm font-medium text-white">{lockedDate.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{lockedDate.toLocaleTimeString()}</div>
          </div>
        )}
        {unlockDate && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Unlocks At</div>
            <div className="text-sm font-medium text-white">{unlockDate.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{unlockDate.toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* LP Token Info */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 mb-2">LP Token Address</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-gray-800 rounded text-xs font-mono text-gray-300 truncate">
            {lock.lp_token_address}
          </code>
          <a
            href={getExplorerUrl(lock.chain, lock.lp_token_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
          </a>
        </div>
      </div>

      {/* Transaction Link */}
      {lock.lock_tx_hash && (
        <div className="pt-6 border-t border-gray-800">
          <a
            href={getExplorerUrl(lock.chain, lock.lock_tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group"
          >
            <span className="text-sm text-gray-400 group-hover:text-white">
              View Lock Transaction
            </span>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </a>
        </div>
      )}

      {/* Locker Contract (if available) */}
      {lock.locker_contract_address && (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Locker Contract</div>
          <code className="block px-3 py-2 bg-gray-800 rounded text-xs font-mono text-gray-300 truncate">
            {lock.locker_contract_address}
          </code>
        </div>
      )}
    </div>
  );
}
