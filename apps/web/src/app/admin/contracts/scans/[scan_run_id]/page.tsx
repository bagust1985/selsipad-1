import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ScanFindingsDisplay } from './ScanFindingsDisplay';
import { OverrideForm } from './OverrideForm';

interface PageProps {
  params: {
    scan_run_id: string;
  };
}

export default async function ScanDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: scan, error } = await supabase
    .from('sc_scan_results')
    .select('*, projects(id, name)')
    .eq('id', params.scan_run_id)
    .single();

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-950/30 border border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Scan Not Found</h2>
            <p className="text-gray-400 mb-4">The scan run you're looking for doesn't exist.</p>
            <Link
              href="/admin/contracts/scans"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/contracts/scans"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">Security Scan Detail</h1>
          </div>
          <p className="text-gray-400">Review findings and override scan result</p>
        </div>

        {/* Project Info Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Scan Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Project</p>
              <p className="text-white font-medium">{scan.projects?.name || 'Unnamed Project'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Network</p>
              <p className="text-white font-medium">{scan.network}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-400 mb-1">Contract Address</p>
              <code className="text-purple-400 font-mono text-sm">{scan.target_address}</code>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Scan Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                  scan.status === 'PASS'
                    ? 'bg-green-600/10 text-green-400'
                    : scan.status === 'FAIL'
                      ? 'bg-red-600/10 text-red-400'
                      : 'bg-yellow-600/10 text-yellow-400'
                }`}
              >
                {scan.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Created At</p>
              <p className="text-white">{new Date(scan.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Findings */}
        <ScanFindingsDisplay
          riskScore={scan.score}
          riskFlags={scan.risk_flags || []}
          summary={scan.summary || ''}
          rawFindings={scan.raw_findings || {}}
        />

        {/* Override Form */}
        <OverrideForm scanRunId={scan.id} projectId={scan.project_id} />
      </div>
    </div>
  );
}
