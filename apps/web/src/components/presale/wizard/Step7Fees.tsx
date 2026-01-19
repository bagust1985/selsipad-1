'use client';

import type { FeesReferral } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step7FeesProps {
  data: Partial<FeesReferral>;
  onChange: (data: Partial<FeesReferral>) => void;
}

export function Step7Fees({ data, onChange }: Step7FeesProps) {
  const platformFeeBps = data.platform_fee_bps ?? 500;
  const platformFeePercent = (platformFeeBps / 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Fees & Referral</h2>
        <p className="text-gray-400">Platform fee structure and referral rewards configuration.</p>
      </div>

      {/* Platform Fee (Read-only) */}
      <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Platform Success Fee</h3>
            <p className="text-sm text-gray-400">Charged only if your presale reaches softcap</p>
          </div>
          <div className="text-3xl font-bold text-purple-400">{platformFeePercent}%</div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Fee distribution: 3% Treasury, 1% Referral Pool, 1% Staking Rewards
        </div>
      </div>

      {/* Referral Toggle */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Enable Referral Rewards</h3>
            <p className="text-sm text-gray-400">
              Allow users to refer others and earn rewards from their contributions
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...data, referral_enabled: !data.referral_enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              data.referral_enabled !== false ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.referral_enabled !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Referral Reward */}
      {data.referral_enabled !== false && (
        <div>
          <label
            htmlFor="referral_reward_bps"
            className="block text-sm font-medium text-white mb-2"
          >
            Referral Reward Rate (%)
          </label>
          <input
            id="referral_reward_bps"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={(data.referral_reward_bps ?? 100) / 100}
            onChange={(e) =>
              onChange({ ...data, referral_reward_bps: parseFloat(e.target.value) * 100 })
            }
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            Default: 1% of contribution amount given to referrer
          </p>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-sm text-gray-300">
        <strong className="text-white">How it works:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
          <li>Referrers share a unique link with their network</li>
          <li>When someone contributes via their link, referrer earns a reward</li>
          <li>Rewards are paid from the platform fee pool</li>
          <li>No additional cost to you or your contributors</li>
        </ul>
      </div>
    </div>
  );
}
