'use client';

import { useState } from 'react';
import { Flame, Plus, Trash2, AlertTriangle, Info } from 'lucide-react';
import { VestingScheduleBuilder } from '../VestingScheduleBuilder';
import type { TeamVesting } from '@/../../packages/shared/src/validators/presale-wizard';
import {
  calculatePresaleSupply,
  supplyToDisplay,
  calculateFDV,
  type PresaleSupplyParams,
} from '@/lib/presale/helpers';
import { parseEther } from 'ethers';

interface TeamWalletEntry {
  address: string;
  share_percent: number;
}

interface Step5TeamVestingProps {
  data: Partial<TeamVesting>;
  onChange: (data: Partial<TeamVesting>) => void;
  errors?: any;
  /** Hardcap in BNB (e.g. "1") */
  hardcapBnb?: string;
  /** Price per token in BNB (e.g. "0.001") */
  pricePerToken?: string;
  /** LP lock percentage (BPS field in UI, e.g. 60 means 60%) */
  lpLockPercentage?: number;
  /** Platform fee BPS (e.g. 500 = 5%) */
  feeBps?: number;
  /** Token decimals */
  tokenDecimals?: number;
  /** Investor vesting cliff months (for team warning) */
  investorCliffMonths?: number;
}

export function Step5TeamVesting({
  data,
  onChange,
  errors,
  hardcapBnb = '0',
  pricePerToken = '0',
  lpLockPercentage = 60,
  feeBps = 500,
  tokenDecimals = 18,
  investorCliffMonths = 0,
}: Step5TeamVestingProps) {
  const handleChange = (field: keyof TeamVesting, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Team wallets state
  const wallets: TeamWalletEntry[] = (data as any).team_wallets || [
    { address: '', share_percent: 100 },
  ];

  const updateWallets = (newWallets: TeamWalletEntry[]) => {
    onChange({ ...data, team_wallets: newWallets } as any);
  };

  const addWallet = () => {
    updateWallets([...wallets, { address: '', share_percent: 0 }]);
  };

  const removeWallet = (index: number) => {
    if (wallets.length <= 1) return;
    const newWallets = wallets.filter((_, i) => i !== index);
    updateWallets(newWallets);
  };

  const updateWallet = (index: number, field: keyof TeamWalletEntry, value: string | number) => {
    const newWallets = [...wallets];
    const existing = newWallets[index] ?? { address: '', share_percent: 0 };
    newWallets[index] = { ...existing, [field]: value };
    updateWallets(newWallets);
  };

  // Share sum validation
  const shareSum = wallets.reduce((s, w) => s + (w.share_percent || 0), 0);
  const shareSumValid = Math.abs(shareSum - 100) < 0.01;

  // Check for duplicate addresses
  const addressList = wallets.map((w) => w.address.toLowerCase()).filter((a) => a.length > 0);
  const hasDuplicates = new Set(addressList).size !== addressList.length;

  // ─── Calculate optimal supply ───
  const hardcapNum = parseFloat(hardcapBnb);
  const priceNum = parseFloat(pricePerToken);
  const teamBpsInput = parseFloat(data.team_allocation || '0');

  const hasValidParams = hardcapNum > 0 && priceNum > 0;

  let supplyDisplay = { sale: 0, lp: 0, team: 0, total: 0 };
  let fdvHardcap = 0;
  let fdvSoftcap = 0;
  let supplyResult: ReturnType<typeof calculatePresaleSupply> | null = null;

  if (hasValidParams) {
    try {
      const hardcapWei = parseEther(hardcapBnb);
      const priceWei = parseEther(pricePerToken);
      // Convert LP percentage (60) to BPS (6000)
      const lpBps = BigInt(Math.round(lpLockPercentage * 100));
      // Team BPS: user-entered team_allocation as percentage of total supply
      // If team_allocation is set, calculate teamBps
      // For now: teamBps is a percentage field (36 = 36% = 3600 BPS)
      const teamBps = teamBpsInput > 0 ? BigInt(Math.round(teamBpsInput * 100)) : 0n;

      const params: PresaleSupplyParams = {
        hardcapWei: BigInt(hardcapWei.toString()),
        priceWei: BigInt(priceWei.toString()),
        tokenDecimals,
        lpBps,
        feeBps: BigInt(feeBps),
        teamBps,
      };

      supplyResult = calculatePresaleSupply(params);
      supplyDisplay = supplyToDisplay(supplyResult, tokenDecimals);

      // FDV at hardcap
      const fdvHardcapResult = calculateFDV({
        priceWei: BigInt(priceWei.toString()),
        totalSupply: supplyResult.totalSupply,
        saleTokens: supplyResult.saleTokens,
        lpTokens: supplyResult.lpTokens,
        teamTokens: supplyResult.teamTokens,
        fillBps: 10000n,
        feeBps: BigInt(feeBps),
        lpBps,
        tokenDecimals,
      });
      fdvHardcap = Number(fdvHardcapResult.fdvWei) / 1e18;

      // FDV at softcap (assume 50%)
      const fdvSoftcapResult = calculateFDV({
        priceWei: BigInt(priceWei.toString()),
        totalSupply: supplyResult.totalSupply,
        saleTokens: supplyResult.saleTokens,
        lpTokens: supplyResult.lpTokens,
        teamTokens: supplyResult.teamTokens,
        fillBps: 5000n,
        feeBps: BigInt(feeBps),
        lpBps,
        tokenDecimals,
      });
      fdvSoftcap = Number(fdvSoftcapResult.fdvWei) / 1e18;
    } catch {
      // Invalid params, ignore
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Team Vesting</h2>
        <p className="text-gray-400">
          Define team wallet addresses and vesting schedule.{' '}
          <span className="text-red-400 font-semibold">This is mandatory for all presales.</span>
        </p>
      </div>

      {/* ─── Team Vesting = Investor Warning ─── */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-200 mb-1">Same Vesting Schedule as Investors</p>
            <p className="text-gray-400">
              Team tokens follow the{' '}
              <span className="text-yellow-300 font-medium">same vesting schedule</span> as investor
              tokens (same cliff, same linear release).
            </p>
            {investorCliffMonths < 3 && (
              <p className="text-red-400 mt-2 font-medium">
                🔴 Warning: Cliff period is short ({investorCliffMonths} months). Investors may have
                concerns about early team token unlocks.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Team Allocation (% of total supply) ─── */}
      <div>
        <label htmlFor="team_allocation" className="block text-sm font-medium text-white mb-2">
          Team Allocation (% of total supply) <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="team_allocation"
            type="number"
            min="0"
            max="50"
            step="1"
            value={data.team_allocation || ''}
            onChange={(e) => handleChange('team_allocation', e.target.value)}
            placeholder="36"
            className="w-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <span className="text-gray-400">% of total supply</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Percentage of total token supply allocated to team/founders (e.g. 36 = 36%)
        </p>
      </div>

      {/* ─── Calculated Supply Breakdown ─── */}
      {hasValidParams && supplyDisplay.total > 0 && (
        <div className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg space-y-3">
          <div className="text-sm font-medium text-purple-300">
            📊 Calculated Token Supply (Optimal)
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Sale Tokens</span>
              <span className="font-mono text-yellow-400">
                {supplyDisplay.sale.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="flex items-center gap-1">
                LP Tokens
                <span className="relative group">
                  <Info className="w-3 h-3 text-gray-500 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 p-2 bg-gray-800 text-xs text-gray-300 rounded border border-gray-600 z-10">
                    LP = (hardcap × (1-fee%) × LP%) / price + 1% buffer
                  </span>
                </span>
              </span>
              <span className="font-mono text-blue-400">{supplyDisplay.lp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Team Tokens ({data.team_allocation || 0}%)</span>
              <span className="font-mono text-green-400">
                {supplyDisplay.team.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-white font-semibold border-t border-gray-700 pt-2">
              <span>= Total Supply (auto-calculated)</span>
              <span className="font-mono text-white">{supplyDisplay.total.toLocaleString()}</span>
            </div>
          </div>

          {/* FDV Display */}
          <div className="pt-2 border-t border-gray-700 space-y-1">
            <div className="text-xs text-gray-500 font-medium">Projected FDV</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">At Hardcap (100% fill)</span>
              <span className="font-mono text-green-400">{fdvHardcap.toFixed(4)} BNB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">At Softcap (~50% fill)</span>
              <span className="font-mono text-yellow-400">{fdvSoftcap.toFixed(4)} BNB</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Team Wallet Addresses ─── */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Team Wallet Addresses <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add wallet addresses that will receive team tokens. Share percentages must total 100%.
        </p>

        <div className="space-y-3">
          {wallets.map((wallet, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={wallet.address}
                onChange={(e) => updateWallet(index, 'address', e.target.value)}
                placeholder="0x..."
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={wallet.share_percent || ''}
                  onChange={(e) =>
                    updateWallet(index, 'share_percent', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm text-right focus:outline-none focus:border-purple-500"
                  placeholder="0"
                />
                <span className="text-gray-400 text-sm">%</span>
              </div>
              {wallets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWallet(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove wallet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addWallet}
          className="mt-3 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Wallet
        </button>

        {/* Share sum indicator */}
        <div className={`mt-2 text-xs ${shareSumValid ? 'text-green-400' : 'text-red-400'}`}>
          Total share: {shareSum}% {shareSumValid ? '✓' : `(must equal 100%)`}
        </div>
        {hasDuplicates && (
          <p className="mt-1 text-xs text-red-400">⚠️ Duplicate wallet addresses detected</p>
        )}
      </div>

      {/* ─── Unsold Token Burn Notice ─── */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-orange-200 mb-1">Automatic Surplus Burn</p>
            <p className="text-gray-400">
              After finalization,{' '}
              <span className="text-orange-300 font-medium">
                all remaining tokens in the contract are automatically burned
              </span>
              . This ensures the developer holds zero tokens post-listing, protecting investors from
              dump risk.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Vesting Schedule ─── */}
      <VestingScheduleBuilder
        label="Team"
        value={data.schedule || []}
        onChange={(schedule) => handleChange('schedule', schedule)}
      />

      {/* ─── Recommended Settings ─── */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
        <div className="text-sm text-gray-300">
          <strong className="text-white">💡 Recommended:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>No unlock at TGE (0%)</li>
            <li>6-12 month cliff period</li>
            <li>10% monthly linear vesting over 10 months</li>
            <li>Team allocation between 10-36% of total supply</li>
          </ul>
        </div>
      </div>

      {errors && typeof errors === 'string' && <p className="text-sm text-red-400">{errors}</p>}
    </div>
  );
}
