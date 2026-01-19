'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink, FileText, Calendar } from 'lucide-react';
import { verifyAuditProof } from '../actions';

interface AuditProof {
  id: string;
  project_id: string;
  auditor_name: string;
  report_url: string;
  report_hash: string | null;
  audit_date: string | null;
  scope: any;
  status: string;
  created_at: string;
  projects?: {
    id: string;
    name: string;
  };
}

interface AuditProofCardProps {
  proof: AuditProof;
}

export function AuditProofCard({ proof }: AuditProofCardProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [decision, setDecision] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (decision === 'REJECTED' && reason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }

    setIsProcessing(true);

    const result = await verifyAuditProof(proof.id, decision, reason);

    if (result.success) {
      router.refresh();
      setShowForm(false);
    } else {
      setError(result.error || 'Failed to process audit proof');
    }

    setIsProcessing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {proof.projects?.name || 'Unnamed Project'}
          </h3>
          <p className="text-sm text-gray-400">
            Submitted {new Date(proof.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-600/10 text-yellow-400 text-sm rounded-md font-medium">
          PENDING
        </span>
      </div>

      {/* Audit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Auditor</p>
          <p className="text-white font-medium">{proof.auditor_name}</p>
        </div>
        {proof.audit_date && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Audit Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-white">{new Date(proof.audit_date).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        <div className="md:col-span-2">
          <p className="text-sm text-gray-400 mb-1">Report URL</p>
          <a
            href={proof.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">{proof.report_url}</span>
          </a>
        </div>
        {proof.report_hash && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400 mb-1">Report Hash (SHA256)</p>
            <code className="text-xs text-gray-500 font-mono">{proof.report_hash}</code>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showForm ? (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setDecision('VERIFIED');
              setShowForm(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Verify & Approve
          </button>
          <button
            onClick={() => {
              setDecision('REJECTED');
              setShowForm(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-800 pt-4 mt-4">
          <h4 className="text-sm font-medium text-white mb-3">
            {decision === 'VERIFIED' ? 'Verify Audit Proof' : 'Reject Audit Proof'}
          </h4>

          {error && (
            <div className="mb-4 bg-red-950/30 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {decision === 'REJECTED' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this audit proof is being rejected (minimum 10 characters)..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                rows={3}
              />
              <p className="text-gray-500 text-sm mt-1">{reason.length}/10 characters minimum</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isProcessing || (decision === 'REJECTED' && reason.trim().length < 10)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                decision === 'VERIFIED'
                  ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white'
                  : 'bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white'
              }`}
            >
              {isProcessing
                ? 'Processing...'
                : `Confirm ${decision === 'VERIFIED' ? 'Verification' : 'Rejection'}`}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
                setReason('');
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
