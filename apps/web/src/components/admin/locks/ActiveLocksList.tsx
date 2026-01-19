'use client';

import { Lock, ExternalLink, Calendar } from 'lucide-react';

interface ActiveLock {
  id: string;
  chain: string;
  dex_type: string;
  lock_duration_months: number;
  locked_at: string;
  locked_until: string;
  lock_tx_hash: string | null;
  status: string;
  round: {
    id: string;
    project: { id: string; name: string };
  };
}

interface ActiveLocksListProps {
  locks: ActiveLock[];
}

export function ActiveLocksList({ locks }: ActiveLocksListProps) {
  const getExplorerUrl = (chain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      bsc: 'https://bscscan.com/tx/',
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
    };
    return `${explorers[chain] || ''}${txHash}`;
  };

  const calculateDaysRemaining = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (locks.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Locks</h3>
          <p className="text-sm text-gray-400">Successfully locked LP tokens will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Active Locks ({locks.length})</h2>
      </div>

      <div className="divide-y divide-gray-800">
        {locks.map((lock) => {
          const daysRemaining = calculateDaysRemaining(lock.locked_until);
          const lockDate = new Date(lock.locked_at);
          const unlockDate = new Date(lock.locked_until);

          return (
            <div key={lock.id} className="p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{lock.round.project.name}</h3>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      LOCKED 🟢
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Locked On</div>
                      <div className="text-sm font-medium text-white">
                        {lockDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Unlock Date</div>
                      <div className="text-sm font-medium text-white">
                        {unlockDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Days Remaining</div>
                      <div className="text-sm font-medium text-white">{daysRemaining} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Duration</div>
                      <div className="text-sm font-medium text-white">
                        {lock.lock_duration_months} months
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{lock.chain.toUpperCase()}</span>
                    <span>•</span>
                    <span>{lock.dex_type}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {lock.lock_tx_hash && (
                    <a
                      href={getExplorerUrl(lock.chain, lock.lock_tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
                    >
                      View Lock
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a
                    href={`/admin/projects/${lock.round.project.id}`}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Project
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Lock Progress</span>
                  <span>
                    {Math.max(
                      0,
                      Math.round(
                        ((lock.lock_duration_months * 30 - daysRemaining) /
                          (lock.lock_duration_months * 30)) *
                          100
                      )
                    )}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((lock.lock_duration_months * 30 - daysRemaining) / (lock.lock_duration_months * 30)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
