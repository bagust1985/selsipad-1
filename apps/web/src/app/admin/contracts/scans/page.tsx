import Link from 'next/link';
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { getScansNeedingReview } from '../actions';
import { ScanListTable } from './ScanListTable';

export default async function ScanReviewQueuePage() {
  const scansResult = await getScansNeedingReview();
  const scans = scansResult.success ? scansResult.data : [];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Back Button */}
      <Link
        href="/admin/contracts"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contract Management
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Scan Review Queue</h1>
        </div>
        <p className="text-gray-400">Contract scans flagged for manual review and admin override</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-white">{scans?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-yellow-950/30 border border-yellow-800/40 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-300 font-medium mb-1">Admin Review Required</p>
            <p className="text-yellow-200/80">
              These scans detected medium-risk patterns (proxies, dangerous opcodes) that require
              manual review. You can override to PASS or FAIL with a reason.
            </p>
          </div>
        </div>
      </div>

      {/* Scans Table */}
      {scans && scans.length > 0 ? (
        <ScanListTable scans={scans} />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Scans Pending Review</h3>
          <p className="text-gray-500 text-sm">
            All scans have been processed. Check back later or review completed scans.
          </p>
        </div>
      )}
    </div>
  );
}
