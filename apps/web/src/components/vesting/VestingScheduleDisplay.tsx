'use client';

import { Lock, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface VestingSchedule {
  id: string;
  tge_percentage: number;
  cliff_months: number;
  vesting_months: number;
  interval_type: 'DAILY' | 'MONTHLY';
  tge_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'PAUSED';
  total_tokens?: number;
}

interface VestingScheduleDisplayProps {
  schedule: VestingSchedule | null;
  loading?: boolean;
}

export function VestingScheduleDisplay({ schedule, loading }: VestingScheduleDisplayProps) {
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

  if (!schedule) {
    return (
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">No Vesting Schedule</h3>
            <p className="text-sm text-gray-400">Vesting schedule not configured for this round</p>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = schedule.status === 'CONFIRMED';
  const isPending = schedule.status === 'PENDING';
  const isFailed = schedule.status === 'FAILED';

  const statusColor = isConfirmed
    ? 'text-green-400 bg-green-400/10 border-green-400/30'
    : isPending
      ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      : 'text-red-400 bg-red-400/10 border-red-400/30';

  const vestingPercentage = 100 - schedule.tge_percentage;
  const tgeDate = new Date(schedule.tge_at);

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Vesting Schedule</h3>
            <p className="text-sm text-gray-400">Token distribution timeline</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColor}`}>
          {schedule.status}
        </div>
      </div>

      {/* TGE Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-semibold text-white">Token Generation Event (TGE)</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 pl-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">TGE Release</div>
            <div className="text-2xl font-bold text-white">{schedule.tge_percentage}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">TGE Date</div>
            <div className="text-sm font-medium text-white">{tgeDate.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{tgeDate.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Vesting Section */}
      {vestingPercentage > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Vesting Period</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Vested Amount</div>
              <div className="text-2xl font-bold text-white">{vestingPercentage}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Duration</div>
              <div className="text-sm font-medium text-white">{schedule.vesting_months} months</div>
              <div className="text-xs text-gray-500 capitalize">
                {schedule.interval_type.toLowerCase()} unlock
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cliff Section */}
      {schedule.cliff_months > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">Cliff Period</div>
              <div className="text-xs text-gray-400">
                No tokens unlocked for the first{' '}
                <span className="text-white font-semibold">{schedule.cliff_months} months</span>{' '}
                after TGE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {schedule.total_tokens && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Tokens</span>
            <span className="text-white font-semibold font-mono">
              {schedule.total_tokens.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
