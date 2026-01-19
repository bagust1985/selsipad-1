'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { grantUserBadge } from '../actions';
import { ArrowLeft, Award, Search, AlertCircle, User } from 'lucide-react';
import Link from 'next/link';

interface GrantUserBadgeClientProps {
  badges: any[];
  users: any[];
}

export function GrantUserBadgeClient({ badges, users }: GrantUserBadgeClientProps) {
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const searchLower = searchUser.toLowerCase();
    return (
      u.username?.toLowerCase().includes(searchLower) ||
      u.wallets?.some((w: any) => w.address?.toLowerCase().includes(searchLower))
    );
  });

  const handleGrant = async () => {
    setError('');
    setSuccess('');

    if (!selectedBadge) {
      setError('Please select a badge');
      return;
    }

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setIsProcessing(true);

    const result = await grantUserBadge(selectedUser, selectedBadge, reason);

    if (result.success) {
      setSuccess('Badge granted successfully!');
      setSelectedBadge('');
      setSelectedUser('');
      setReason('');
      setSearchUser('');

      setTimeout(() => {
        router.push('/admin/badges');
        router.refresh();
      }, 2000);
    } else {
      setError(result.error || 'Failed to grant badge');
    }

    setIsProcessing(false);
  };

  const selectedBadgeData = badges.find((b) => b.badge_key === selectedBadge);
  const selectedUserData = users.find((u) => u.user_id === selectedUser);

  return (
    <div>
      <Link
        href="/admin/badges/user"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to User Badges
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Grant User Badge</h1>
        </div>
        <p className="text-gray-400">Award a badge to a user profile</p>
      </div>

      <div className="mb-6 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">User Badges</p>
            <p className="text-blue-200/80 text-xs">
              These badges attach to user profiles (TEAM badges, WHALE, REFERRAL_PRO, etc). For
              project badges (KYC_VERIFIED, SC_AUDIT), use Grant Project Badge instead.
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-950/30 border border-green-800 rounded-lg p-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-950/30 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        {/* Step 1: Select Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            1. Select User Badge
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge.badge_key)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedBadge === badge.badge_key
                    ? 'border-purple-600 bg-purple-600/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Award
                    className={`w-5 h-5 mt-0.5 ${
                      selectedBadge === badge.badge_key ? 'text-purple-400' : 'text-gray-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-white">{badge.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{badge.description}</p>
                    <code className="text-xs bg-gray-900 px-2 py-1 rounded text-purple-400 font-mono mt-2 inline-block">
                      {badge.badge_key}
                    </code>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select User */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">2. Select User</label>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by username or wallet address..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-700 rounded-lg p-2">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => setSelectedUser(user.user_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUser === user.user_id
                      ? 'bg-purple-600/20 border border-purple-600'
                      : 'bg-gray-800 hover:bg-gray-750'
                  }`}
                >
                  <p className="font-medium text-white">{user.username || 'Anonymous User'}</p>
                  <p className="text-gray-400 text-sm font-mono">
                    {user.wallets?.[0]?.address?.slice(0, 10)}...
                    {user.wallets?.[0]?.address?.slice(-8)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Step 3: Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            3. Reason for Grant (min 10 characters)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this badge is being granted..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
            rows={4}
            disabled={isProcessing}
          />
          <p className="text-gray-500 text-sm mt-1">{reason.length}/10 characters minimum</p>
        </div>

        {/* Summary */}
        {selectedBadgeData && selectedUserData && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Grant Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Badge:</span>
                <span className="text-white font-medium">{selectedBadgeData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User:</span>
                <span className="text-white font-medium">
                  {selectedUserData.username || 'Anonymous'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet:</span>
                <span className="text-white font-mono text-xs">
                  {selectedUserData.wallets?.[0]?.address}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleGrant}
          disabled={isProcessing || !selectedBadge || !selectedUser || reason.trim().length < 10}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          <Award className="w-5 h-5" />
          {isProcessing ? 'Granting Badge...' : 'Grant Badge'}
        </button>
      </div>
    </div>
  );
}
