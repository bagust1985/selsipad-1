'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveAMA, rejectAMA } from '../../actions';
import { ArrowLeft, CheckCircle2, XCircle, Calendar, User, Clock } from 'lucide-react';
import Link from 'next/link';

interface AMAReviewClientProps {
  ama: any;
}

export function AMAReviewClient({ ama }: AMAReviewClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setIsProcessing(true);
    setError('');

    const result = await approveAMA(ama.id);

    if (result.success) {
      alert('AMA approved successfully!');
      router.push('/admin/ama');
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

    const result = await rejectAMA(ama.id, rejectionReason);

    if (result.success) {
      alert('AMA rejected');
      router.push('/admin/ama');
    } else {
      setError(result.error || 'Failed to reject');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/ama"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AMA Management
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Review AMA Session</h1>
        <p className="text-gray-400">Review and approve or reject AMA submission</p>
      </div>

      {/* AMA Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Title</p>
              <p className="text-white font-medium text-lg">{ama.title}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Description</p>
              <p className="text-white">{ama.description}</p>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-cyan-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">Host Wallet</p>
                <p className="text-white font-mono">{ama.host_wallet}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Schedule</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">Start Time</p>
                <p className="text-white">
                  {ama.start_at ? new Date(ama.start_at).toLocaleString() : 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">End Time</p>
                <p className="text-white">
                  {ama.end_at ? new Date(ama.end_at).toLocaleString() : 'Not set'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-white">
                {ama.start_at && ama.end_at
                  ? `${Math.round((new Date(ama.end_at).getTime() - new Date(ama.start_at).getTime()) / (1000 * 60 * 60))} hours`
                  : 'Not calculated'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Submitted</p>
              <p className="text-white">{new Date(ama.created_at).toLocaleString()}</p>
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
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isProcessing ? 'Approving...' : 'Approve AMA'}
            </button>

            <button
              onClick={() => setShowRejectInput(true)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Reject AMA
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
                placeholder="Explain why this AMA is being rejected..."
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
