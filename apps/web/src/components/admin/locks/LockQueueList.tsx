'use client';

import { useState } from 'react';
import { Lock, ExternalLink, AlertCircle } from 'lucide-react';

interface QueueItem {
  id: string;
  project: { id: string; name: string };
  result: string;
  lock_status: string;
  liquidity_locks: any[];
}

interface LockQueueListProps {
  queue: QueueItem[];
}

export function LockQueueList({ queue }: LockQueueListProps) {
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSetupLock = async (roundId: string) => {
    setLoading(roundId);
    try {
      // Call setup lock API
      const res = await fetch(`/api/admin/rounds/${roundId}/lock/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // Refresh page
        window.location.reload();
      } else {
        alert('Failed to setup lock');
      }
    } catch (err) {
      console.error('Error setting up lock:', err);
      alert('Error setting up lock');
    } finally {
      setLoading(null);
    }
  };

  if (queue.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Rounds Ready to Lock</h3>
          <p className="text-sm text-gray-400">
            Successful presale rounds will appear here when ready for liquidity locking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Queue: Ready to Lock ({queue.length})</h2>
      </div>

      <div className="divide-y divide-gray-800">
        {queue.map((item) => {
          const lockPlan = item.liquidity_locks?.[0];

          return (
            <div key={item.id} className="p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.project.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>Round #{item.id.slice(0, 8)}</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      SUCCESS
                    </span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                      {item.lock_status}
                    </span>
                  </div>

                  {lockPlan && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">DEX</div>
                        <div className="text-sm font-medium text-white">{lockPlan.dex_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="text-sm font-medium text-white">
                          {lockPlan.lock_duration_months} months
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Chain</div>
                        <div className="text-sm font-medium text-white">{lockPlan.chain}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetupLock(item.id)}
                    disabled={loading === item.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {loading === item.id ? 'Setting up...' : 'Setup Lock'}
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors">
                    Skip
                  </button>
                  <a
                    href={`/admin/projects/${item.project.id}`}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
                  >
                    Details
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
