'use client';

import { Lock, Shield } from 'lucide-react';

interface LpLockData {
  duration_months: number;
  percentage: number;
}

interface Step6LpLockProps {
  data: Partial<LpLockData>;
  onChange: (data: Partial<LpLockData>) => void;
  errors?: Partial<Record<string, string>>;
}

export function Step6LpLock({ data, onChange, errors }: Step6LpLockProps) {
  const handleChange = (field: keyof LpLockData, value: any) => {
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

      {/* Selsila Platform Badge */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/40 rounded-lg">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/30">
          <Lock className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Selsila LP Locker</p>
          <p className="text-sm text-gray-400">
            Liquidity is locked via Selsila&apos;s built-in LP locker smart contract
          </p>
        </div>
      </div>

      {/* Percentage */}
      <div>
        <label htmlFor="percentage" className="block text-sm font-medium text-white mb-2">
          LP Tokens to Lock (%) <span className="text-red-400">*</span>
        </label>
        <input
          id="percentage"
          type="number"
          min="51"
          max="100"
          value={data.percentage ?? ''}
          onChange={(e) => handleChange('percentage', parseInt(e.target.value) || 100)}
          placeholder="100"
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.percentage ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
        />
        {errors?.percentage && <p className="mt-2 text-sm text-red-400">{errors.percentage}</p>}
        <p className="mt-2 text-xs text-gray-500">
          Minimum 51%, recommended 100% for maximum trust
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

      {/* Auto-Lock Info Banner */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
          <div className="text-sm text-green-300">
            <p className="font-semibold text-green-200 mb-1">Liquidity is Automatically Locked</p>
            <p className="text-gray-400">
              Once the presale ends successfully, {data.percentage || 0}% of the raised liquidity
              will be automatically added to the DEX and locked for {data.duration_months || 0}{' '}
              months via Selsila&apos;s LP Locker contract. You will receive the{' '}
              <span className="text-green-300 font-medium">&quot;Locked Liquidity&quot;</span>{' '}
              badge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
