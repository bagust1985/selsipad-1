'use client';

import type { LpLock } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step6LpLockProps {
  data: Partial<LpLock>;
  onChange: (data: Partial<LpLock>) => void;
  errors?: Partial<Record<keyof LpLock, string>>;
}

const LP_PLATFORMS = [
  { value: 'UNICRYPT', label: 'Unicrypt', desc: 'Popular multi-chain locker' },
  { value: 'TEAM_FINANCE', label: 'Team Finance', desc: 'Trusted DeFi locker' },
  { value: 'PINKSALE', label: 'PinkSale', desc: 'BSC-focused locker' },
  { value: 'CUSTOM', label: 'Custom', desc: 'Your own locker contract' },
];

export function Step6LpLock({ data, onChange, errors }: Step6LpLockProps) {
  const handleChange = (field: keyof LpLock, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">LP Lock Plan</h2>
        <p className="text-gray-400">
          Configure liquidity locking.{' '}
          <span className="text-red-400 font-semibold">Minimum 12 months required.</span>
        </p>
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration_months" className="block text-sm font-medium text-white mb-2">
          Lock Duration (months) <span className="text-red-400">*</span>
        </label>
        <input
          id="duration_months"
          type="number"
          min="12"
          max="60"
          value={data.duration_months ?? ''}
          onChange={(e) => handleChange('duration_months', parseInt(e.target.value) || 12)}
          placeholder="12"
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.duration_months ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
        />
        {errors?.duration_months && (
          <p className="mt-2 text-sm text-red-400">{errors.duration_months}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">Minimum 12 months, recommended 24+ months</p>
      </div>

      {/* Percentage */}
      <div>
        <label htmlFor="percentage" className="block text-sm font-medium text-white mb-2">
          LP Tokens to Lock (%) <span className="text-red-400">*</span>
        </label>
        <input
          id="percentage"
          type="number"
          min="1"
          max="100"
          value={data.percentage ?? ''}
          onChange={(e) => handleChange('percentage', parseInt(e.target.value) || 100)}
          placeholder="100"
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.percentage ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
        />
        {errors?.percentage && <p className="mt-2 text-sm text-red-400">{errors.percentage}</p>}
        <p className="mt-2 text-xs text-gray-500">Recommended: 100% for maximum trust</p>
      </div>

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          LP Lock Platform <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LP_PLATFORMS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() => handleChange('platform', platform.value as any)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.platform === platform.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div
                className={`font-semibold ${
                  data.platform === platform.value ? 'text-white' : 'text-gray-300'
                }`}
              >
                {platform.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{platform.desc}</div>
            </button>
          ))}
        </div>
        {errors?.platform && <p className="mt-2 text-sm text-red-400">{errors.platform}</p>}
      </div>

      {/* Custom Platform Address */}
      {data.platform === 'CUSTOM' && (
        <div>
          <label
            htmlFor="custom_platform_address"
            className="block text-sm font-medium text-white mb-2"
          >
            Custom Locker Contract Address <span className="text-red-400">*</span>
          </label>
          <input
            id="custom_platform_address"
            type="text"
            value={data.custom_platform_address || ''}
            onChange={(e) => handleChange('custom_platform_address', e.target.value)}
            placeholder="0x..."
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.custom_platform_address ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.custom_platform_address && (
            <p className="mt-2 text-sm text-red-400">{errors.custom_platform_address}</p>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
        <div className="text-sm text-yellow-300">
          <strong className="text-yellow-200">⚠️ Important:</strong> Liquidity locking is crucial
          for investor protection. The longer the lock period, the more confidence investors will
          have in your project.
        </div>
      </div>
    </div>
  );
}
