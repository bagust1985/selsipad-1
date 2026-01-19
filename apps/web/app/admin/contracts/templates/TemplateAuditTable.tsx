'use client';

import { ExternalLink, Shield, XCircle } from 'lucide-react';

interface TemplateAudit {
  id: string;
  network: string;
  factory_address: string | null;
  template_version: string;
  implementation_hash: string;
  audit_report_ref: string;
  audit_provider: string | null;
  audited_at: string | null;
  status: string;
  created_at: string;
}

interface TemplateAuditTableProps {
  templates: TemplateAudit[];
}

export function TemplateAuditTable({ templates }: TemplateAuditTableProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Template Version
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Implementation Hash
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Audit Provider
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Audit Report
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded-md font-medium">
                    {template.network}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm text-white font-mono">{template.template_version}</code>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs text-gray-400 font-mono">
                    {template.implementation_hash.slice(0, 10)}...
                    {template.implementation_hash.slice(-8)}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-white text-sm">{template.audit_provider || 'Not specified'}</p>
                  {template.audited_at && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(template.audited_at).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {template.status === 'VALID' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600/10 text-green-400 text-sm rounded-md font-medium">
                      <Shield className="w-4 h-4" />
                      VALID
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/10 text-red-400 text-sm rounded-md font-medium">
                      <XCircle className="w-4 h-4" />
                      REVOKED
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={template.audit_report_ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">View Report</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
