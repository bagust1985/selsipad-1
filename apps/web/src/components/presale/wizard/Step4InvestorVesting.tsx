'use client';

import { VestingScheduleBuilder } from '../VestingScheduleBuilder';
import type { InvestorVesting } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step4InvestorVestingProps {
  data: Partial<InvestorVesting>;
  onChange: (data: Partial<InvestorVesting>) => void;
  errors?: any;
}

export function Step4InvestorVesting({ data, onChange, errors }: Step4InvestorVestingProps) {
  const handleChange = (field: keyof InvestorVesting, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Investor Vesting</h2>
        <p className="text-gray-400">
          Define when investors will receive their tokens.{' '}
          <span className="text-red-400 font-semibold">This is mandatory for all presales.</span>
        </p>
      </div>

      {/* TGE Percentage */}
      <div>
        <label htmlFor="tge_percentage" className="block text-sm font-medium text-white mb-2">
          TGE Unlock (%)
        </label>
        <input
          id="tge_percentage"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={data.tge_percentage ?? ''}
          onChange={(e) => handleChange('tge_percentage', parseFloat(e.target.value) || 0)}
          placeholder="10"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          Percentage unlocked immediately at Token Generation Event
        </p>
      </div>

      {/* Cliff Duration */}
      <div>
        <label htmlFor="cliff_months" className="block text-sm font-medium text-white mb-2">
          Cliff Duration (months)
        </label>
        <input
          id="cliff_months"
          type="number"
          min="0"
          max="24"
          value={data.cliff_months ?? ''}
          onChange={(e) => handleChange('cliff_months', parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          Lock period before vesting starts (0 = no cliff)
        </p>
      </div>

      {/* Vesting Schedule */}
      <VestingScheduleBuilder
        label="Investor"
        value={data.schedule || []}
        onChange={(schedule) => handleChange('schedule', schedule)}
      />

      {errors && typeof errors === 'string' && <p className="text-sm text-red-400">{errors}</p>}
    </div>
  );
}
