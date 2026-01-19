'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { NetworkBadge } from '@/components/presale/NetworkBadge';
import { StatusPill } from '@/components/presale/StatusPill';

interface Fairlaunch {
  id: string;
  status: string;
  network: string;
  params: any;
  start_at: string;
  end_at: string;
  total_raised: number;
  total_participants: number;
  created_by: string;
}

interface FairlaunchDetailProps {
  fairlaunch: Fairlaunch;
  userAddress?: string;
}

type TabType = 'overview' | 'contribute' | 'claim' | 'refund' | 'transactions';

export function FairlaunchDetail({ fairlaunch, userAddress }: FairlaunchDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const projectName = fairlaunch.params?.project_name || 'Unnamed Project';
  const softcap = fairlaunch.params?.softcap || 0;
  const raised = fairlaunch.total_raised || 0;
  const tokensForSale = fairlaunch.params?.tokens_for_sale || 0;
  const finalPrice = tokensForSale > 0 ? raised / tokensForSale : 0;
  const progress = softcap > 0 ? (raised / softcap) * 100 : 0;

  const tabs: { key: TabType; label: string; enabled: boolean }[] = [
    { key: 'overview', label: 'Overview', enabled: true },
    { key: 'contribute', label: 'Contribute', enabled: fairlaunch.status === 'LIVE' },
    { key: 'claim', label: 'Claim', enabled: fairlaunch.status === 'FINALIZED_SUCCESS' },
    {
      key: 'refund',
      label: 'Refund',
      enabled: ['FINALIZED_FAIL', 'REFUNDING'].includes(fairlaunch.status),
    },
    { key: 'transactions', label: 'Transactions', enabled: !!userAddress },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/fairlaunch"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fairlaunches
      </Link>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {fairlaunch.params?.logo_url && (
              <img
                src={fairlaunch.params.logo_url}
                alt={projectName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{projectName}</h1>
              <p className="text-gray-400 mb-3">
                {fairlaunch.params?.project_description || 'No description'}
              </p>
              <div className="flex items-center gap-3">
                <NetworkBadge network={fairlaunch.network} />
                <StatusPill status={fairlaunch.status} />
                {fairlaunch.params?.token_symbol && (
                  <span className="text-sm text-gray-500">
                    Token:{' '}
                    <span className="text-white font-semibold">
                      {fairlaunch.params.token_symbol}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Raised: </span>
              <span className="text-white font-semibold">{raised.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Softcap: </span>
              <span className="text-white font-semibold">{softcap.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Participants: </span>
              <span className="text-white font-semibold">{fairlaunch.total_participants || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-800">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => tab.enabled && setActiveTab(tab.key)}
              disabled={!tab.enabled}
              className={`pb-3 px-1 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-green-400 border-b-2 border-green-400'
                  : tab.enabled
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        {activeTab === 'overview' && (
          <OverviewTab fairlaunch={fairlaunch} finalPrice={finalPrice} />
        )}
        {activeTab === 'contribute' && <ContributeTab userAddress={userAddress} />}
        {activeTab === 'claim' && <ClaimTab />}
        {activeTab === 'refund' && <RefundTab />}
        {activeTab === 'transactions' && <TransactionsTab userAddress={userAddress} />}
      </div>
    </div>
  );
}

function OverviewTab({ fairlaunch, finalPrice }: { fairlaunch: Fairlaunch; finalPrice: number }) {
  const tokensForSale = fairlaunch.params?.tokens_for_sale || 0;

  return (
    <div className="space-y-6">
      {/* Fairlaunch Rules */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🚀 Fairlaunch Mechanics</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">•</span>
            <div>
              <p className="text-white font-medium">No Hardcap</p>
              <p className="text-gray-400">All contributions accepted until sale ends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">•</span>
            <div>
              <p className="text-white font-medium">Final Price Formula</p>
              <p className="text-gray-400 font-mono">
                Price = Total Raised / {tokensForSale.toLocaleString()} tokens
              </p>
              {finalPrice > 0 && (
                <p className="text-emerald-400 mt-1">Current: {finalPrice.toFixed(6)} per token</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">•</span>
            <div>
              <p className="text-white font-medium">Refund Condition</p>
              <p className="text-gray-400">
                If total raised {'<'} softcap → all participants get refunds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidity Plan */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">💧 Liquidity & LP Lock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">LP Allocation</div>
            <div className="text-xl font-bold text-white">
              {fairlaunch.params?.liquidity_percent || 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">of raised funds to liquidity</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">LP Lock Duration</div>
            <div className="text-xl font-bold text-white">
              {fairlaunch.params?.lp_lock?.duration_months || 0} months
            </div>
            <div className="text-xs text-gray-500 mt-1">minimum lock period</div>
          </div>
        </div>
      </div>

      {/* Team Vesting */}
      {fairlaunch.params?.team_vesting && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">👥 Team Vesting</h3>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">
              TGE: {fairlaunch.params.team_vesting.tge_percent}% • Cliff:{' '}
              {fairlaunch.params.team_vesting.cliff_months}mo
            </div>
            {fairlaunch.params.team_vesting.schedule && (
              <div className="text-xs text-gray-500">
                {fairlaunch.params.team_vesting.schedule.length} vesting milestones configured
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sale Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">📅 Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Start Time</div>
            <div className="text-white">{new Date(fairlaunch.start_at).toLocaleString()}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">End Time</div>
            <div className="text-white">{new Date(fairlaunch.end_at).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributeTab({ userAddress }: { userAddress?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold text-white mb-2">Contribute Coming Soon</h3>
      <p className="text-gray-400">
        {userAddress
          ? 'Contribution flow will be available after on-chain integration'
          : 'Connect your wallet to contribute'}
      </p>
    </div>
  );
}

function ClaimTab() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎁</div>
      <h3 className="text-xl font-semibold text-white mb-2">Claim Coming Soon</h3>
      <p className="text-gray-400">Token claiming will be available after sale success</p>
    </div>
  );
}

function RefundTab() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">💸</div>
      <h3 className="text-xl font-semibold text-white mb-2">Refund Coming Soon</h3>
      <p className="text-gray-400">Refund functionality will be available if softcap not met</p>
    </div>
  );
}

function TransactionsTab({ userAddress }: { userAddress?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-white mb-2">Transaction History</h3>
      <p className="text-gray-400">
        {userAddress
          ? 'Your transaction history will appear here'
          : 'Connect wallet to view your transactions'}
      </p>
    </div>
  );
}
