'use client';

import { Flame } from 'lucide-react';
import { VestingScheduleBuilder } from '../VestingScheduleBuilder';
import type { TeamVesting } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step5TeamVestingProps {
  data: Partial<TeamVesting>;
  onChange: (data: Partial<TeamVesting>) => void;
  errors?: any;
  /** Total token supply from token creation (Step 0 on-chain read) */
  totalTokenSupply?: string;
  /** Tokens allocated for sale (from Step 2) */
  tokensForSale?: string;
  /** LP lock percentage — % of tokensForSale allocated for DEX liquidity */
  lpLockPercentage?: number;
}

export function Step5TeamVesting({
  data,
  onChange,
  errors,
  totalTokenSupply,
  tokensForSale,
  lpLockPercentage = 0,
}: Step5TeamVestingProps) {
  const handleChange = (field: keyof TeamVesting, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Calculate token allocation breakdown
  // CORRECT FORMULA (per PresaleFactory.sol):
  //   LP tokens = tokensForSale × lpPercent / 100
  //   (liquidityPercent is % of tokensForSale paired with raised funds for DEX)
  const totalSupply = parseFloat(totalTokenSupply || '0');
  const saleTokens = parseFloat(tokensForSale || '0');
  const lpTokens = saleTokens > 0 ? (saleTokens * lpLockPercentage) / 100 : 0;
  const remainingForTeam = totalSupply > 0 ? totalSupply - saleTokens - lpTokens : 0;
  const teamAllocation = parseFloat(data.team_allocation || '0');

  const hasAllocationData = totalSupply > 0 && saleTokens > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Team Vesting</h2>
        <p className="text-gray-400">
          Define when team tokens will unlock.{' '}
          <span className="text-red-400 font-semibold">This is mandatory for all presales.</span>
        </p>
      </div>

      {/* Token Allocation Breakdown */}
      {hasAllocationData && (
        <div className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg space-y-3">
          <div className="text-sm font-medium text-purple-300">📊 Token Allocation Breakdown</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total Token Supply</span>
              <span className="font-mono text-white">{totalSupply.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>├ Tokens for Sale (Step 2)</span>
              <span className="font-mono text-yellow-400">- {saleTokens.toLocaleString()}</span>
            </div>
            {lpLockPercentage > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>├ LP Liquidity ({lpLockPercentage}% of sale tokens)</span>
                <span className="font-mono text-blue-400">- {lpTokens.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-semibold border-t border-gray-700 pt-2">
              <span>= Remaining for Team</span>
              <span
                className={`font-mono ${remainingForTeam > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {remainingForTeam.toLocaleString()}
              </span>
            </div>
          </div>
          {remainingForTeam < 0 && (
            <p className="text-xs text-red-400 mt-1">
              ⚠️ Token allocation exceeds total supply. Reduce tokens for sale or LP lock
              percentage.
            </p>
          )}
          {teamAllocation > 0 && teamAllocation !== remainingForTeam && remainingForTeam > 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ Team allocation ({teamAllocation.toLocaleString()}) differs from remaining tokens (
              {remainingForTeam.toLocaleString()})
            </p>
          )}
        </div>
      )}

      {/* Unsold Token Burn Notice */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-orange-200 mb-1">Unsold Token Handling</p>
            <p className="text-gray-400">
              If the presale only reaches softcap (not hardcap),{' '}
              <span className="text-orange-300 font-medium">
                unsold tokens will be automatically burned
              </span>
              . This protects investors from project dumping unsold tokens on the market.
            </p>
          </div>
        </div>
      </div>

      {/* Team Allocation */}
      <div>
        <label htmlFor="team_allocation" className="block text-sm font-medium text-white mb-2">
          Team Allocation (tokens) <span className="text-red-400">*</span>
        </label>
        <input
          id="team_allocation"
          type="text"
          value={data.team_allocation || ''}
          onChange={(e) => handleChange('team_allocation', e.target.value)}
          placeholder={hasAllocationData ? remainingForTeam.toString() : '100000'}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-gray-500">Total tokens allocated to team/founders</p>
        {hasAllocationData && remainingForTeam > 0 && (
          <button
            type="button"
            onClick={() => handleChange('team_allocation', remainingForTeam.toString())}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
          >
            Auto-fill with remaining: {remainingForTeam.toLocaleString()} tokens
          </button>
        )}
      </div>

      {/* Vesting Schedule */}
      <VestingScheduleBuilder
        label="Team"
        value={data.schedule || []}
        onChange={(schedule) => handleChange('schedule', schedule)}
      />

      {/* Recommended Settings */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
        <div className="text-sm text-gray-300">
          <strong className="text-white">💡 Recommended:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>No unlock at TGE (0%)</li>
            <li>6-12 month cliff period</li>
            <li>10% monthly linear vesting over 10 months</li>
          </ul>
        </div>
      </div>

      {errors && typeof errors === 'string' && <p className="text-sm text-red-400">{errors}</p>}
    </div>
  );
}
