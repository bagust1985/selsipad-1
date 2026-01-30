'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWalletClient, usePublicClient } from 'wagmi';
import { ArrowLeft, ExternalLink, Globe, Twitter, Send, MessageCircle, Shield, CheckCircle, Copy, Clock, TrendingUp, Lock, Users } from 'lucide-react';
import { NetworkBadge } from '@/components/presale/NetworkBadge';
import { StatusPill } from '@/components/presale/StatusPill';
import { Countdown } from '@/components/ui/Countdown';

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

// Helper to get display network name from chain ID or network name
function getNetworkDisplay(networkName?: string, chainId?: string): string {
  if (networkName) {
    const nameMap: Record<string, string> = {
      'bsc_testnet': 'BSC Testnet',
      'sepolia': 'Sepolia',
      'base_sepolia': 'Base Sepolia',
      'ethereum': 'Ethereum',
      'bnb': 'BNB Chain',
      'base': 'Base',
    };
    return nameMap[networkName] || networkName;
  }
  
  // Fallback to chain ID mapping
  const chainMap: Record<string, string> = {
    '97': 'BSC Testnet',
    '56': 'BNB Chain',
    '11155111': 'Sepolia',
    '1': 'Ethereum',
    '8453': 'Base',
    '84532': 'Base Sepolia',
  };
  return chainMap[chainId || ''] || 'Unknown';
}

// Helper to get native currency symbol from network name
function getNativeCurrency(networkName?: string, chainId?: string): string {
  if (networkName?.includes('bsc') || networkName?.includes('bnb') || chainId === '97' || chainId === '56') {
    return 'BNB';
  }
  if (networkName?.includes('base') || chainId === '8453' || chainId === '84532') {
    return 'ETH';
  }
  return 'ETH'; // Default
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
              <div className="flex items-center gap-3 flex-wrap">
                {/* Security Badges */}
                {fairlaunch.params?.token_source === 'factory' && fairlaunch.params?.security_badges?.length > 0 && (
                  <>
                    {fairlaunch.params.security_badges.includes('SAFU') && (
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-medium text-yellow-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        SAFU
                      </span>
                    )}
                    {fairlaunch.params.security_badges.includes('SC_PASS') && (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-medium text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        SC Pass
                      </span>
                    )}
                  </>
                )}

                {fairlaunch.params?.token_symbol && (
                  <span className="text-sm text-gray-500">
                    Token:{' '}
                    <span className="text-white font-semibold">
                      {fairlaunch.params.token_symbol}
                    </span>
                  </span>
                )}
              </div>
              
              {/* Social Media Links */}
              {fairlaunch.params?.social_links && Object.keys(fairlaunch.params.social_links).length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {fairlaunch.params.social_links.website && (
                    <a
                      href={fairlaunch.params.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Website"
                    >
                      <Globe className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  {fairlaunch.params.social_links.twitter && (
                    <a
                      href={fairlaunch.params.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  {fairlaunch.params.social_links.telegram && (
                    <a
                      href={fairlaunch.params.social_links.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Telegram"
                    >
                      <Send className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  {fairlaunch.params.social_links.discord && (
                    <a
                      href={fairlaunch.params.social_links.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Discord"
                    >
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
          {/* Current Status */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Status
            </span>
            {(() => {
              const status = getTimeStatus(fairlaunch.start_at, fairlaunch.end_at);
              const colors = {
                upcoming: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                live: 'bg-green-500/10 border-green-500/30 text-green-400',
                ended: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
              };
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${colors[status]}`}>
                  {status === 'live' ? '🟢 Live' : status === 'upcoming' ? '⏰ Upcoming' : '⏹️ Ended'}
                </span>
              );
            })()}
          </div>

          {/* Timeline Bar */}
          <div className="relative h-2 bg-gray-700 rounded-full mb-3">
            <div
              className="absolute h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${calculateTimeProgress(fairlaunch.start_at, fairlaunch.end_at)}%` }}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <div className="text-gray-400">Start</div>
              <div className="text-white font-medium" suppressHydrationWarning>
                {new Date(fairlaunch.start_at).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400">End</div>
              <div className="text-white font-medium" suppressHydrationWarning>
                {new Date(fairlaunch.end_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Countdown */}
          {getTimeStatus(fairlaunch.start_at, fairlaunch.end_at) === 'live' && (
            <div className="mt-3 text-center bg-green-500/5 border border-green-500/20 rounded-lg py-2">
              <div className="text-gray-400 text-xs mb-1">Time Remaining</div>
              <div className="text-xl font-bold text-green-400">
                <Countdown targetDate={fairlaunch.end_at} />
              </div>
            </div>
          )}
          {getTimeStatus(fairlaunch.start_at, fairlaunch.end_at) === 'upcoming' && (
            <div className="mt-3 text-center bg-blue-500/5 border border-blue-500/20 rounded-lg py-2">
              <div className="text-gray-400 text-xs mb-1">Starts In</div>
              <div className="text-xl font-bold text-blue-400">
                <Countdown targetDate={fairlaunch.start_at} />
              </div>
            </div>
          )}
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
        {activeTab === 'contribute' && <ContributeTab userAddress={userAddress} fairlaunch={fairlaunch} />}
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

      {/* Token Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">🪙 Token Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Token Name</div>
            <div className="text-white font-medium">{fairlaunch.params?.token_name || 'N/A'}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Symbol</div>
            <div className="text-white font-medium">{fairlaunch.params?.token_symbol || 'N/A'}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg col-span-full">
            <div className="text-sm text-gray-400 mb-1">Contract Address</div>
            <div className="flex items-center gap-2">
              <code className="text-white font-mono text-sm">{fairlaunch.params?.token_address || 'N/A'}</code>
              {fairlaunch.params?.token_address && (
                <button
                  onClick={() => navigator.clipboard.writeText(fairlaunch.params.token_address)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Decimals</div>
            <div className="text-white font-medium">{fairlaunch.params?.token_decimals || 18}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Supply</div>
            <div className="text-white font-medium">{(fairlaunch.params?.token_total_supply || 0).toLocaleString()}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Network</div>
            <div className="text-white font-medium">{getNetworkDisplay(fairlaunch.params?.network_name, fairlaunch.network)}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Tokens for Sale</div>
            <div className="text-white font-medium">{tokensForSale.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Sale Parameters */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">💰 Sale Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Softcap</div>
            <div className="text-white font-medium">{fairlaunch.params?.softcap || 0} {getNativeCurrency(fairlaunch.params?.network_name, fairlaunch.network)}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Hardcap</div>
            <div className="text-white font-medium">No Hardcap</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Min Contribution</div>
            <div className="text-white font-medium">{fairlaunch.params?.min_contribution || 0} {getNativeCurrency(fairlaunch.params?.network_name, fairlaunch.network)}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Max Contribution</div>
            <div className="text-white font-medium">{fairlaunch.params?.max_contribution || 0} {getNativeCurrency(fairlaunch.params?.network_name, fairlaunch.network)}</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Listing On</div>
            <div className="text-white font-medium capitalize">{fairlaunch.params?.dex_platform || 'PancakeSwap'}</div>
          </div>
        </div>
      </div>

      {/* Tokenomics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">📊 Tokenomics</h3>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  const totalSupply = fairlaunch.params?.token_total_supply || 1;
                  const presalePercent = ((tokensForSale / totalSupply) * 100);
                  const teamPercent = ((parseFloat(fairlaunch.params?.team_allocation || '0') / totalSupply) * 100);
                  const unlockedPercent = 100 - presalePercent - teamPercent;
                  
                  // Calculate segments
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  
                  const presaleLength = (presalePercent / 100) * circumference;
                  const teamLength = (teamPercent / 100) * circumference;
                  const unlockedLength = (unlockedPercent / 100) * circumference;
                  
                  let offset = 0;
                  
                  return (
                    <>
                      {/* Presale - Green */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="16"
                        strokeDasharray={`${presaleLength} ${circumference}`}
                        strokeDashoffset={-offset}
                        className="transition-all"
                      />
                      {/* Team - Blue */}
                      {teamPercent > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="16"
                          strokeDasharray={`${teamLength} ${circumference}`}
                          strokeDashoffset={-(offset + presaleLength)}
                          className="transition-all"
                        />
                      )}
                      {/* Unlocked - Gray */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="16"
                        strokeDasharray={`${unlockedLength} ${circumference}`}
                        strokeDashoffset={-(offset + presaleLength + teamLength)}
                        className="transition-all"
                      />
                    </>
                  );
                })()}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-white">
                  {fairlaunch.params?.token_total_supply ? (fairlaunch.params.token_total_supply / 1000000).toFixed(1) : 0}M
                </div>
                <div className="text-xs text-gray-400">Total Supply</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3 w-full">
              {/* Presale */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Presale</span>
                </div>
                <span className="text-white font-semibold">
                  {tokensForSale.toLocaleString()} ({fairlaunch.params?.token_total_supply ? ((tokensForSale / fairlaunch.params.token_total_supply) * 100).toFixed(1) : 0}%)
                </span>
              </div>

              {/* Team */}
              {parseFloat(fairlaunch.params?.team_allocation || '0') > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-400">Team</span>
                  </div>
                  <span className="text-white font-semibold">
                    {parseFloat(fairlaunch.params.team_allocation).toLocaleString()} ({fairlaunch.params?.token_total_supply ? ((parseFloat(fairlaunch.params.team_allocation) / fairlaunch.params.token_total_supply) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              )}

              {/* Unlocked/Burned */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-gray-400">Unlocked</span>
                </div>
                <span className="text-white font-semibold">
                  {fairlaunch.params?.token_total_supply ? (
                    (fairlaunch.params.token_total_supply - tokensForSale - parseFloat(fairlaunch.params?.team_allocation || '0')).toLocaleString()
                  ) : 0} ({fairlaunch.params?.token_total_supply ? (((fairlaunch.params.token_total_supply - tokensForSale - parseFloat(fairlaunch.params?.team_allocation || '0')) / fairlaunch.params.token_total_supply) * 100).toFixed(1) : 0}%)
                </span>
              </div>


              {/* Pool Contract Address */}
              <div className="pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-500 mb-1">Pool Contract</div>
                {fairlaunch.params?.round_address ? (
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-blue-400 font-mono flex-1 truncate">
                      {fairlaunch.params.round_address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(fairlaunch.params.round_address)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                      title="Copy pool address"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Contract address not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEX Listing */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          DEX Listing
        </h3>

        <div className="space-y-3">
          {/* Platform */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Platform</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium capitalize">
                {getDexName(fairlaunch.params?.dex_platform || 'pancakeswap')}
              </span>
            </div>
          </div>

          {/* Listing Price */}
          {fairlaunch.params?.listing_price && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Listing Price</span>
              <span className="text-white font-semibold">
                {fairlaunch.params.listing_price} {getNativeCurrency(fairlaunch.params?.network_name, fairlaunch.network)}
              </span>
            </div>
          )}

          {/* Premium */}
          {fairlaunch.params?.listing_premium_bps && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price Premium</span>
              <span className="text-green-400 font-semibold">
                +{fairlaunch.params.listing_premium_bps / 100}%
              </span>
            </div>
          )}

          {/* Liquidity */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Liquidity</span>
            <span className="text-white font-semibold">
              {fairlaunch.params?.liquidity_percent || 0}%
            </span>
          </div>

          {/* TGE Date */}
          {fairlaunch.params?.tge_timestamp && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">TGE Date</span>
              <span className="text-white" suppressHydrationWarning>
                {new Date(fairlaunch.params.tge_timestamp * 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* LP Lock */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-400" />
          Liquidity Lock
        </h3>

        <div className="space-y-4">
          {/* Lock Duration */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Lock Duration</span>
              <span className="text-2xl font-bold text-white">
                {fairlaunch.params?.lp_lock_months || 0} months
              </span>
            </div>

            {/* Unlock Date */}
            {fairlaunch.params?.tge_timestamp && fairlaunch.params?.lp_lock_months && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Unlock Date</span>
                <span className="text-green-400 font-medium" suppressHydrationWarning>
                  {new Date(
                    (fairlaunch.params.tge_timestamp + fairlaunch.params.lp_lock_months * 30 * 24 * 3600) * 1000
                  ).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Countdown to Unlock (if LP is locked) */}
          {fairlaunch.status === "FINALIZED_SUCCESS" && fairlaunch.params?.tge_timestamp && fairlaunch.params?.lp_lock_months && (
            <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <div className="text-xs text-yellow-400 mb-1">Unlocks in</div>
              <div className="text-lg font-bold text-yellow-300">
                <Countdown targetDate={new Date((fairlaunch.params.tge_timestamp + fairlaunch.params.lp_lock_months * 30 * 24 * 3600) * 1000)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Vesting */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Team Vesting
        </h3>

        {parseFloat(fairlaunch.params?.team_allocation || '0') > 0 ? (
          <div className="space-y-4">
            {/* Allocation */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Team Allocation</span>
              <span className="text-white font-semibold">
                {parseFloat(fairlaunch.params.team_allocation).toLocaleString()} tokens
              </span>
            </div>

            {/* Vesting Schedule */}
            {fairlaunch.params?.team_vesting && (
              <>
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TGE Unlock</span>
                    <span className="text-green-400 font-medium">
                      {fairlaunch.params.team_vesting.tge_percent}%
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cliff Period</span>
                    <span className="text-white">
                      {fairlaunch.params.team_vesting.cliff_months} months
                    </span>
                  </div>

                  {fairlaunch.params.team_vesting.linear_months && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Vesting Period</span>
                      <span className="text-white">
                        {fairlaunch.params.team_vesting.linear_months} months (linear)
                      </span>
                    </div>
                  )}
                </div>

                {/* Visual Timeline */}
                <div className="relative h-16 bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center justify-between h-full">
                    {/* TGE */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-400 mt-1">TGE</span>
                      <span className="text-xs text-green-400">
                        {fairlaunch.params.team_vesting.tge_percent}%
                      </span>
                    </div>

                    {/* Cliff */}
                    <div className="flex-1 h-0.5 bg-gray-700 mx-2" />
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-xs text-gray-400 mt-1">Cliff End</span>
                      <span className="text-xs text-yellow-400">
                        {fairlaunch.params.team_vesting.cliff_months}m
                      </span>
                    </div>

                    {/* Vesting */}
                    {fairlaunch.params.team_vesting.linear_months && (
                      <>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-yellow-500 to-blue-500 mx-2" />
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-xs text-gray-400 mt-1">Fully Vested</span>
                          <span className="text-xs text-blue-400">100%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Contract Address */}
            {fairlaunch.params?.vesting_vault_address && (
              <div className="pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Vesting Contract</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-blue-400 font-mono">
                      {fairlaunch.params.vesting_vault_address.slice(0, 6)}...
                      {fairlaunch.params.vesting_vault_address.slice(-4)}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(fairlaunch.params.vesting_vault_address)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No team vesting configured
          </div>
        )}
      </div>

      {/* Remove old Timeline section - now in header */}
    </div>
  );
}

function ContributeTab({ userAddress, fairlaunch }: { userAddress?: string; fairlaunch: Fairlaunch }) {
  const [amount, setAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Wagmi hooks
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  // Get contract address and network info
  const fairlaunchAddress = fairlaunch.params?.round_address as `0x${string}` | undefined;
  const minContribution = Number(fairlaunch.params?.min_contribution || 0);
  const maxContribution = Number(fairlaunch.params?.max_contribution || 0);
  const nativeCurrency = getNativeCurrency(fairlaunch.network, fairlaunch.params?.chain_id);
  
  const handleContribute = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }
    
    if (!publicClient) {
      setError('Network not available');
      return;
    }
    
    if (!fairlaunchAddress) {
      setError('Fairlaunch contract address not found');
      return;
    }
    
    try {
      setIsContributing(true);
      setError('');
      setSuccess('');
      
      const amountNum = parseFloat(amount);
      
      // Validation
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (amountNum < minContribution) {
        throw new Error(`Minimum contribution is ${minContribution} ${nativeCurrency}`);
      }
      
      if (amountNum > maxContribution) {
        throw new Error(`Maximum contribution is ${maxContribution} ${nativeCurrency}`);
      }
      
      // Import helpers
      const { parseEther } = await import('viem');
      const { FAIRLAUNCH_ABI } = await import('@/contracts/Fairlaunch');
      
      // Convert to wei
      const valueInWei = parseEther(amount);
      
      // Call contribute function using walletClient
      const txHash = await walletClient.writeContract({
        address: fairlaunchAddress,
        abi: FAIRLAUNCH_ABI,
        functionName: 'contribute',
        value: valueInWei,
      });
      
      setSuccess(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`);
      
      // Wait for confirmation using publicClient
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2,
      });
      
      if (receipt.status === 'reverted') {
        throw new Error('Transaction failed');
      }
      
      setSuccess(`Contribution successful! You contributed ${amount} ${nativeCurrency}`);
      setAmount('');
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      console.error('Contribution error:', err);
      setError(err.message || 'Failed to contribute');
    } finally {
      setIsContributing(false);
    }
  };
  
  if (!userAddress) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">
          Connect your wallet to contribute to this Fairlaunch
        </p>
      </div>
    );
  }
  
  if (fairlaunch.status !== 'LIVE') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏸️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Sale Not Active</h3>
        <p className="text-gray-400">
          This Fairlaunch is currently {fairlaunch.status.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-panel p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Contribute to Fairlaunch</h3>
        
        {/* Contribution Limits */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Minimum</div>
            <div className="text-lg font-semibold text-white">
              {minContribution} {nativeCurrency}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Maximum</div>
            <div className="text-lg font-semibold text-white">
              {maxContribution} {nativeCurrency}
            </div>
          </div>
        </div>
        
        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contribution Amount ({nativeCurrency})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: ${minContribution} ${nativeCurrency}`}
              step="0.01"
              min={minContribution}
              max={maxContribution}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isContributing}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {nativeCurrency}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setAmount(minContribution.toString())}
              className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300"
              disabled={isContributing}
            >
              Min
            </button>
            <button
              onClick={() => setAmount(maxContribution.toString())}
              className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300"
              disabled={isContributing}
            >
              Max
            </button>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        
        {/* Contribute Button */}
        <button
          onClick={handleContribute}
          disabled={isContributing || !amount || parseFloat(amount) <= 0}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
        >
          {isContributing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {success ? 'Confirming...' : 'Processing...'}
            </span>
          ) : (
            `Contribute ${amount || '0'} ${nativeCurrency}`
          )}
        </button>
        
        {/* Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 Your contribution will be used to purchase tokens at the sale price. 
            You can claim your tokens after the sale ends successfully.
          </p>
        </div>
      </div>
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

// Helper functions for timeline features
function getTimeStatus(start: string, end: string): 'upcoming' | 'live' | 'ended' {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'ended';
  return 'live';
}

function calculateTimeProgress(start: string, end: string): number {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  
  if (now < startTime) return 0;
  if (now > endTime) return 100;
  
  return ((now - startTime) / (endTime - startTime)) * 100;
}

function getDexLogo(platform: string): string {
  const logos: Record<string, string> = {
    pancakeswap: '/dex/pancakeswap.png',
    uniswap: '/dex/uniswap.png',
    sushiswap: '/dex/sushiswap.png',
  };
  return logos[platform.toLowerCase()] || '/dex/default.png';
}

function getDexName(platform: string): string {
  const names: Record<string, string> = {
    pancakeswap: 'PancakeSwap',
    uniswap: 'Uniswap',
    sushiswap: 'SushiSwap',
  };
  return names[platform.toLowerCase()] || platform;
}
