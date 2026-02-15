'use client';

import { Shield, AlertTriangle, Info } from 'lucide-react';

interface ScanFindingsDisplayProps {
  riskScore: number | null;
  riskFlags: string[];
  summary: string;
  rawFindings: Record<string, any>;
}

export function ScanFindingsDisplay({
  riskScore,
  riskFlags,
  summary,
  rawFindings,
}: ScanFindingsDisplayProps) {
  const getSeverityColor = (score: number) => {
    if (score >= 70) return 'text-red-400 bg-red-600/10 border-red-800';
    if (score >= 40) return 'text-yellow-400 bg-yellow-600/10 border-yellow-800';
    return 'text-green-400 bg-green-600/10 border-green-800';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 70) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Risk Score Card */}
      {riskScore !== null && (
        <div className={`border rounded-xl p-6 ${getSeverityColor(riskScore)}`}>
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{getSeverityLabel(riskScore)}</h3>
                <span className="text-2xl font-bold">{riskScore}/100</span>
              </div>
              <p className="opacity-90">{summary}</p>
            </div>
          </div>

          {/* Risk Score Bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  riskScore >= 70
                    ? 'bg-red-500'
                    : riskScore >= 40
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {riskFlags && riskFlags.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Detected Risk Patterns</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {riskFlags.map((flag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-yellow-600/10 text-yellow-400 text-sm rounded-md font-mono border border-yellow-800/40"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw Findings Accordion */}
      {rawFindings && rawFindings.checks && (
        <details className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <summary className="px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium">Detailed Findings (Click to expand)</span>
          </summary>
          <div className="px-6 py-4 border-t border-gray-800 space-y-4">
            {rawFindings.checks.map((check: any, idx: number) => (
              <div key={idx} className="border-l-2 border-gray-700 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-mono text-sm text-purple-400">{check.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      check.passed ? 'bg-green-600/10 text-green-400' : 'bg-red-600/10 text-red-400'
                    }`}
                  >
                    {check.passed ? 'PASSED' : 'FAILED'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                    {check.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{check.message}</p>
                {check.details && (
                  <pre className="mt-2 text-xs text-gray-500 bg-gray-950 rounded p-2 overflow-x-auto">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
