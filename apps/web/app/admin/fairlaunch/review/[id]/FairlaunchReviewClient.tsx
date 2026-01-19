'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveFairlaunch, rejectFairlaunch } from '../actions';
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface FairlaunchReviewClientProps {
  round: any;
}

export function FairlaunchReviewClient({ round }: FairlaunchReviewClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  // Extract fairlaunch params
  const saleParams = round.params?.sale_params || {};
  const lpLock = round.params?.lp_lock || {};
  const teamVesting = round.params?.team_vesting || {};

  const liquidityPercent = lpLock.percentage || 0;
  const lpLockMonths = lpLock.duration_months || 0;
  const isLiquidityValid = liquidityPercent >= 70 && lpLockMonths >= 12;

  const handleApprove = async () => {
    // Validate before approving
    if (!isLiquidityValid) {
      setError('Cannot approve: Liquidity must be ≥70% and locked for ≥12 months');
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await approveFairlaunch(round.id);

    if (result.success) {
      alert('Fairlaunch approved successfully!');
      router.push('/admin/fairlaunch/review');
    } else {
      setError(result.error || 'Failed to approve');
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await rejectFairlaunch(round.id, rejectionReason);

    if (result.success) {
      alert('Fairlaunch rejected');
      router.push('/admin/fairlaunch/review');
    } else {
      setError(result.error || 'Failed to reject');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/fairlaunch/review"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fairlaunch Reviews
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Review Fairlaunch</h1>
        <p className="text-gray-400">Verify fairlaunch parameters and approve or reject</p>
      </div>

      {/* Validation Warning */}
      {!isLiquidityValid && (
        <div className="mb-6 bg-red-950/30 border border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Fairlaunch Requirements Not Met</p>
              <p className="text-red-400 text-sm mt-1">
                This fairlaunch does not meet minimum requirements. Current liquidity:{' '}
                {liquidityPercent}% (min 70%), LP lock: {lpLockMonths} months (min 12).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Round Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Project Name</p>
              <p className="text-white font-medium">{round.name || 'Unnamed'}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Network</p>
              <p className="text-white capitalize">{round.network}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Owner Wallet</p>
              <p className="text-white font-mono text-sm">{round.created_by}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Token Address</p>
              <p className="text-white font-mono text-sm">
                {saleParams.token_address || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Fairlaunch Params */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Fairlaunch Parameters</h2>

          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Tokens for Sale</p>
              <p className="text-white">{saleParams.tokens_for_sale || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Softcap (No Hardcap)</p>
              <p className="text-white">{saleParams.softcap || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Payment Token</p>
              <p className="text-white">{saleParams.payment_token || 'NATIVE'}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Sale Period</p>
              <p className="text-white text-sm">
                {saleParams.start_at && saleParams.end_at ? (
                  <>
                    {new Date(saleParams.start_at).toLocaleDateString()} -
                    {new Date(saleParams.end_at).toLocaleDateString()}
                  </>
                ) : (
                  'Not set'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Liquidity & Lock */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Liquidity Plan</h2>

          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Liquidity Allocation</p>
              <p
                className={`text-lg font-semibold ${isLiquidityValid ? 'text-green-400' : 'text-red-400'}`}
              >
                {liquidityPercent}%{liquidityPercent < 70 && ' (Min 70% required)'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">LP Lock Duration</p>
              <p className={`text-white ${lpLockMonths < 12 ? 'text-red-400' : ''}`}>
                {lpLockMonths} months
                {lpLockMonths < 12 && ' (Min 12 months required)'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Listing Platform</p>
              <p className="text-white">{lpLock.platform || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Team Vesting */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Team Vesting</h2>

          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Team Allocation</p>
              <p className="text-white">{teamVesting.team_allocation || 'Not set'}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Vesting Schedule</p>
              {teamVesting.schedule && teamVesting.schedule.length > 0 ? (
                <div className="space-y-1">
                  {teamVesting.schedule.map((s: any, i: number) => (
                    <p key={i} className="text-white text-sm">
                      Month {s.month}: {s.percentage}%
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No schedule configured</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-950/30 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Review Actions</h2>

        {!showRejectInput ? (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing || !isLiquidityValid}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isProcessing ? 'Approving...' : 'Approve Fairlaunch'}
            </button>

            <button
              onClick={() => setShowRejectInput(true)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Reject Fairlaunch
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason (min 10 characters)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this fairlaunch is being rejected..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                rows={4}
                disabled={isProcessing}
              />
              <p className="text-gray-500 text-sm mt-1">
                {rejectionReason.length}/10 characters minimum
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.trim().length < 10}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-5 h-5" />
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>

              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectionReason('');
                  setError('');
                }}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
