import { createClient } from '@/lib/supabase/server';
import { ScrollText, Search, Filter } from 'lucide-react';

async function getAuditLogs() {
  const supabase = createClient();

  // Check if audit log table exists
  const { data: logs, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }

  return logs || [];
}

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ScrollText className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Log</h1>
            <p className="text-gray-400">View all administrative actions (append-only)</p>
          </div>
        </div>

        <div className="mt-4 bg-purple-950/30 border border-purple-800/40 rounded-lg p-4">
          <div className="flex gap-3">
            <Filter className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-purple-300 font-medium mb-1">Audit Log Features:</p>
              <ul className="text-purple-200/80 space-y-1 text-xs">
                <li>
                  • <strong>Append-only</strong> - Records cannot be modified or deleted
                </li>
                <li>
                  • <strong>Immutable</strong> - Ensures accountability and transparency
                </li>
                <li>
                  • <strong>Complete trail</strong> - All admin actions logged
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      {logs.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <ScrollText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Audit Logging Not Yet Implemented</p>
          <p className="text-gray-500 text-sm">
            TODO: Integrate audit logging for all admin actions
          </p>
          <div className="mt-6 bg-yellow-950/30 border border-yellow-800/40 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-300 font-medium mb-2">Implementation Notes:</p>
            <ul className="text-yellow-200/80 text-sm text-left space-y-1">
              <li>
                • Add <code className="bg-gray-800 px-1 rounded">logAdminAction()</code> calls to
                all server actions
              </li>
              <li>• Record: action type, admin wallet, metadata, timestamp</li>
              <li>• Implement search and filter UI</li>
              <li>• Add CSV export functionality</li>
            </ul>
          </div>
        </div>
      )}

      {/* Audit Log Table (when implemented) */}
      {logs.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Timestamp</th>
                <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                <th className="text-left p-4 text-gray-400 font-medium">Admin</th>
                <th className="text-left p-4 text-gray-400 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800">
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-white font-medium">{log.action}</td>
                  <td className="p-4 text-gray-300 font-mono text-sm">
                    {log.admin_wallet?.slice(0, 6)}...{log.admin_wallet?.slice(-4)}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{JSON.stringify(log.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
