'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { overrideScanResult } from '../../actions';

interface OverrideFormProps {
  scanRunId: string;
  projectId: string;
}

export function OverrideForm({ scanRunId, projectId }: OverrideFormProps) {
  const router = useRouter();
  const [override, setOverride] = useState<'PASS' | 'FAIL'>('PASS');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (reason.trim().length < 20) {
      setError('Reason must be at least 20 characters');
      return;
    }

    setIsProcessing(true);

    const result = await overrideScanResult(projectId, scanRunId, override, reason);

    if (result.success) {
      setSuccess(
        `Scan overridden to ${override}. Badge ${override === 'PASS' ? 'issued' : 'not issued'}.`
      );
      setTimeout(() => {
        router.push('/admin/contracts/scans');
        router.refresh();
      }, 2000);
    } else {
      setError(result.error || 'Failed to override scan');
    }

    setIsProcessing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Admin Override</h3>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">Override Policy</p>
            <p className="text-blue-200/80">
              Overriding to PASS will automatically issue the PROJECT_AUDITED badge to this project.
              All overrides are logged with your reason in the audit trail.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-950/30 border border-green-800 rounded-lg p-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-950/30 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Override Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Override Decision */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Override Decision <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOverride('PASS')}
              className={`p-4 rounded-lg border-2 transition-all ${
                override === 'PASS'
                  ? 'border-green-600 bg-green-600/10'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle
                  className={`w-6 h-6 ${override === 'PASS' ? 'text-green-400' : 'text-gray-500'}`}
                />
                <div className="text-left">
                  <p className="font-semibold text-white">Override to PASS</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Approve contract and issue PROJECT_AUDITED badge
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOverride('FAIL')}
              className={`p-4 rounded-lg border-2 transition-all ${
                override === 'FAIL'
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <XCircle
                  className={`w-6 h-6 ${override === 'FAIL' ? 'text-red-400' : 'text-gray-500'}`}
                />
                <div className="text-left">
                  <p className="font-semibold text-white">Override to FAIL</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Reject contract and block project submission
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason for Override <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are overriding this scan result (minimum 20 characters)..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-600"
            rows={4}
            disabled={isProcessing}
          />
          <p className="text-gray-500 text-sm mt-1">{reason.length}/20 characters minimum</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || reason.trim().length < 20}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-colors ${
            override === 'PASS'
              ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
              : 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
          }`}
        >
          {override === 'PASS' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {isProcessing ? 'Processing...' : `Override to ${override}`}
        </button>
      </form>
    </div>
  );
}
