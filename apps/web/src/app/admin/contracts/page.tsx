import Link from 'next/link';
import { Shield, FileSearch, CheckCircle, Settings, ArrowLeft } from 'lucide-react';

export default function ContractsAdminPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Contract Security Management</h1>
        </div>
        <p className="text-gray-400">Manage contract scans, audit proofs, and template registry</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Scan Review Queue */}
        <Link
          href="/admin/contracts/scans"
          className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
              <FileSearch className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Scan Review Queue</h3>
              <p className="text-gray-400 text-sm mb-3">
                Review contract scans flagged for admin approval
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                View Queue
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Audit Proof Verification */}
        <Link
          href="/admin/contracts/audits"
          className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-600 transition-all hover:shadow-lg hover:shadow-green-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-600/10 rounded-lg group-hover:bg-green-600/20 transition-colors">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Audit Proof Verification</h3>
              <p className="text-gray-400 text-sm mb-3">
                Verify professional audit reports submitted by developers
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                View Submissions
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Template Audit Registry */}
        <Link
          href="/admin/contracts/templates"
          className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600 transition-all hover:shadow-lg hover:shadow-blue-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Template Audit Registry</h3>
              <p className="text-gray-400 text-sm mb-3">
                Manage audited template versions for STRICT mode
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                Manage Registry
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Contract Security System</h4>
        <p className="text-blue-200/80 text-sm">
          This system enforces security standards for external contracts and template deployments.
          All scans and audit verifications are logged for compliance.
        </p>
      </div>
    </div>
  );
}
