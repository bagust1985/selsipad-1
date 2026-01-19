'use client';

import Link from 'next/link';
import { FileSearch, ExternalLink, Clock } from 'lucide-react';

interface Scan {
  id: string;
  project_id: string;
  network: string;
  target_address: string;
  status: string;
  score: number | null;
  risk_flags: string[];
  summary: string | null;
  created_at: string;
  projects?: {
    id: string;
    name: string;
  };
}

interface ScanListTableProps {
  scans: Scan[];
}

export function ScanListTable({ scans }: ScanListTableProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Contract Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Risk Flags
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-medium">
                      {scan.projects?.name || 'Unnamed Project'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded-md font-medium">
                    {scan.network}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs text-gray-400 font-mono">
                    {scan.target_address.slice(0, 10)}...{scan.target_address.slice(-8)}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {scan.score !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            scan.score >= 70
                              ? 'bg-red-500'
                              : scan.score >= 40
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${scan.score}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{scan.score}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {scan.risk_flags && scan.risk_flags.length > 0 ? (
                      scan.risk_flags.slice(0, 2).map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-yellow-600/10 text-yellow-400 text-xs rounded-md font-mono"
                        >
                          {flag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">None</span>
                    )}
                    {scan.risk_flags && scan.risk_flags.length > 2 && (
                      <span className="text-gray-500 text-xs">
                        +{scan.risk_flags.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(scan.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/admin/contracts/scans/${scan.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Review
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
