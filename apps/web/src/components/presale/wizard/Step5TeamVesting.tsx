'use client';

import { VestingScheduleBuilder } from '../VestingScheduleBuilder';
import type { TeamVesting } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step5TeamVestingProps {
  data: Partial<TeamVesting>;
  onChange: (data: Partial<TeamVesting>) => void;
  errors?: any;
}

export function Step5TeamVesting({ data, onChange, errors }: Step5TeamVestingProps) {
  const handleChange = (field: keyof TeamVesting, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Team Vesting</h2>
        <p className="text-gray-400">
          Define when team tokens will unlock.{' '}
          <span className="text-red-400 font-semibold">This is mandatory for all presales.</span>
        </p>
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
          placeholder="100000"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-gray-500">Total tokens allocated to team/founders</p>
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
