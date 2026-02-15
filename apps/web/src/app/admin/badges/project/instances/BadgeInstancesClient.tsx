'use client';

import { useState } from 'react';
import { revokeProjectBadge } from '../actions';
import { ArrowLeft, Award, Search, XCircle, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface BadgeInstancesClientProps {
  instances: any[];
}

export function BadgeInstancesClient({ instances }: BadgeInstancesClientProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Filter instances
  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      search === '' ||
      instance.badge_definitions?.name?.toLowerCase().includes(search.toLowerCase()) ||
      instance.projects?.name?.toLowerCase().includes(search.toLowerCase()) ||
      instance.projects?.owner_user_id?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      (filterType === 'auto' && !instance.awarded_by) ||
      (filterType === 'manual' && instance.awarded_by);

    return matchesSearch && matchesType;
  });

  const handleRevoke = async (instanceId: string) => {
    if (revokeReason.trim().length < 10) {
      setError('Revocation reason must be at least 10 characters');
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await revokeProjectBadge(instanceId, revokeReason);

    if (result.success) {
      alert('Badge revoked successfully');
      setRevokeId(null);
      setRevokeReason('');
      window.location.reload(); // Refresh to show updated list
    } else {
      setError(result.error || 'Failed to revoke badge');
    }

    setIsProcessing(false);
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/badges"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Badges
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold text-white">Badge Instances</h1>
        </div>
        <p className="text-gray-400">View all awarded badges and revoke if needed</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search badge, project, or wallet..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              All ({instances.length})
            </button>
            <button
              onClick={() => setFilterType('auto')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Auto ({instances.filter((i) => !i.awarded_by).length})
            </button>
            <button
              onClick={() => setFilterType('manual')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'manual'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Manual ({instances.filter((i) => i.awarded_by).length})
            </button>
          </div>
        </div>
      </div>

      {/* Instances Table */}
      {filteredInstances.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {search || filterType !== 'all'
              ? 'No badges found matching filters'
              : 'No badges awarded yet'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Badge</th>
                <th className="text-left p-4 text-gray-400 font-medium">Project</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Awarded</th>
                <th className="text-left p-4 text-gray-400 font-medium">Reason</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstances.map((instance) => {
                const isAuto = !instance.awarded_by;

                return (
                  <tr key={instance.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">
                            {instance.badge_definitions?.name || 'Unknown'}
                          </p>
                          <code className="text-xs text-gray-500 font-mono">
                            {instance.badge_definitions?.badge_key}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{instance.projects?.name || 'Unknown'}</p>
                        <p className="text-gray-500 text-sm font-mono">
                          {instance.projects?.owner_user_id?.slice(0, 6)}...
                          {instance.projects?.owner_user_id?.slice(-4)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {isAuto ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Auto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                          <Shield className="w-3 h-3" />
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(instance.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-400 text-sm max-w-xs truncate">
                      {instance.reason || '-'}
                    </td>
                    <td className="p-4 text-right">
                      {revokeId === instance.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            placeholder="Reason for revocation (min 10 chars)..."
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm resize-none"
                            rows={2}
                            disabled={isProcessing}
                          />
                          {error && <p className="text-red-400 text-xs">{error}</p>}
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRevoke(instance.id)}
                              disabled={isProcessing || revokeReason.trim().length < 10}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm"
                            >
                              {isProcessing ? 'Revoking...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => {
                                setRevokeId(null);
                                setRevokeReason('');
                                setError('');
                              }}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevokeId(instance.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
