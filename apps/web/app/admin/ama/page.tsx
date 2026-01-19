import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Clock, CheckCircle2, XCircle, Play, AlertCircle } from 'lucide-react';
import Link from 'next/link';

async function getAMASessions() {
  const supabase = createClient();

  const { data: sessions, error } = await supabase
    .from('ama_sessions')
    .select(
      `
      *,
      profiles(wallet_address, username)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch AMA sessions:', error);
    return [];
  }

  return sessions || [];
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
          <CheckCircle2 className="w-3 h-3" />
          Scheduled
        </span>
      );
    case 'LIVE':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
          <Play className="w-3 h-3" />
          Live
        </span>
      );
    case 'ENDED':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">
          Ended
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return <span className="text-gray-500">{status}</span>;
  }
}

export default async function AMAManagementPage() {
  const sessions = await getAMASessions();

  // Group by status
  const pending = sessions.filter((s) => s.status === 'SUBMITTED');
  const scheduled = sessions.filter((s) => s.status === 'SCHEDULED');
  const live = sessions.filter((s) => s.status === 'LIVE');
  const ended = sessions.filter((s) => s.status === 'ENDED');
  const rejected = sessions.filter((s) => s.status === 'REJECTED');

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-cyan-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">AMA Management</h1>
              <p className="text-gray-400">Approve, schedule, and manage AMA sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">{pending.length} Pending</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-4 bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-cyan-300 font-medium mb-1">AMA Workflow:</p>
              <ul className="text-cyan-200/80 space-y-1 text-xs">
                <li>
                  • <strong>SUBMITTED</strong> - Awaiting admin approval
                </li>
                <li>
                  • <strong>SCHEDULED</strong> - Approved, will go LIVE at start time
                </li>
                <li>
                  • <strong>LIVE</strong> - Currently accepting questions
                </li>
                <li>
                  • <strong>ENDED</strong> - Finished (auto or force-ended)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4">
          <p className="text-yellow-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-white">{pending.length}</p>
        </div>
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
          <p className="text-blue-400 text-sm mb-1">Scheduled</p>
          <p className="text-3xl font-bold text-white">{scheduled.length}</p>
        </div>
        <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-1">Live</p>
          <p className="text-3xl font-bold text-white">{live.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Ended</p>
          <p className="text-3xl font-bold text-white">{ended.length}</p>
        </div>
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4">
          <p className="text-red-400 text-sm mb-1">Rejected</p>
          <p className="text-3xl font-bold text-white">{rejected.length}</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Pending Approvals ({pending.length})
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Host</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Scheduled Time</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Submitted</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((ama) => (
                  <tr key={ama.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{ama.title}</p>
                      <p className="text-gray-500 text-sm line-clamp-1">{ama.description}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300">{ama.profiles?.username || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm font-mono">
                        {ama.host_wallet?.slice(0, 6)}...{ama.host_wallet?.slice(-4)}
                      </p>
                    </td>
                    <td className="p-4 text-gray-300">
                      {ama.start_at ? new Date(ama.start_at).toLocaleString() : 'Not set'}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(ama.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/ama/review/${ama.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Sessions Table */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          All AMA Sessions ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No AMA sessions yet</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Host</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Schedule</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((ama) => (
                  <tr key={ama.id} className="border-b border-gray-800">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {ama.is_pinned && <span className="text-yellow-400">📌</span>}
                        <div>
                          <p className="text-white font-medium">{ama.title}</p>
                          <p className="text-gray-500 text-sm line-clamp-1">{ama.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {ama.host_wallet?.slice(0, 6)}...{ama.host_wallet?.slice(-4)}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {ama.start_at ? new Date(ama.start_at).toLocaleDateString() : 'TBD'}
                    </td>
                    <td className="p-4">{getStatusBadge(ama.status)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/ama/${ama.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
