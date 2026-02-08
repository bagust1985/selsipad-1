'use client';

import { useState } from 'react';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import type { VestingEntry } from '@/../../packages/shared/src/validators/presale-wizard';
import { createLinearVesting } from '@/../../packages/shared/src/validators/presale-wizard';

interface VestingScheduleBuilderProps {
  value: VestingEntry[];
  onChange: (schedule: VestingEntry[]) => void;
  label: string;
  tgePercentage?: number;
  className?: string;
}

export function VestingScheduleBuilder({
  value,
  onChange,
  label,
  tgePercentage = 0,
  className = '',
}: VestingScheduleBuilderProps) {
  const [showLinearWizard, setShowLinearWizard] = useState(false);
  const [linearMonths, setLinearMonths] = useState('10');
  const [linearTGE, setLinearTGE] = useState('0');

  const schedulePercentage = value.reduce((sum, entry) => sum + entry.percentage, 0);
  const vestingTarget = 100 - tgePercentage; // Schedule must total this
  const grandTotal = tgePercentage + schedulePercentage; // Overall total including TGE
  const isValid = Math.abs(grandTotal - 100) < 0.01;

  const handleAddEntry = () => {
    const newEntry: VestingEntry = {
      month: value.length > 0 ? Math.max(...value.map((v) => v.month)) + 1 : 0,
      percentage: 0,
    };
    onChange([...value, newEntry]);
  };

  const handleRemoveEntry = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = (index: number, field: 'month' | 'percentage', val: string) => {
    const newValue = [...value];
    const numValue = Number(val);

    if (!isNaN(numValue)) {
      newValue[index] = {
        ...newValue[index],
        [field]: numValue,
      } as VestingEntry;
      onChange(newValue);
    }
  };

  const handleApplyLinear = () => {
    const months = parseInt(linearMonths);
    const tge = parseFloat(linearTGE);

    if (months > 0 && tge >= 0 && tge <= 100) {
      const schedule = createLinearVesting(months, tge);
      onChange(schedule);
      setShowLinearWizard(false);
    }
  };

  const sortedValue = [...value].sort((a, b) => a.month - b.month);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{label} Vesting</h3>
          <p className="text-sm text-gray-400 mt-1">
            Define when tokens will unlock for {label.toLowerCase()} holders
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowLinearWizard(!showLinearWizard)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Quick Setup
        </button>
      </div>

      {/* Linear Wizard */}
      {showLinearWizard && (
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Linear Distribution Wizard</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Duration (months)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={linearMonths}
                onChange={(e) => setLinearMonths(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">TGE Unlock (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={linearTGE}
                onChange={(e) => setLinearTGE(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyLinear}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply Linear Schedule
          </button>
        </div>
      )}

      {/* Schedule Entries */}
      <div className="space-y-2">
        {sortedValue.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Month</label>
                <input
                  type="number"
                  min="0"
                  value={entry.month}
                  onChange={(e) => handleUpdateEntry(index, 'month', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={entry.percentage}
                  onChange={(e) => handleUpdateEntry(index, 'percentage', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveEntry(index)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Remove entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Entry Button */}
      <button
        type="button"
        onClick={handleAddEntry}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Vesting Entry
      </button>

      {/* Progress Bar & Validation */}
      <div className="space-y-2">
        {/* TGE + Schedule breakdown */}
        {tgePercentage > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">TGE Unlock</span>
            <span className="text-purple-400 font-semibold">{tgePercentage.toFixed(2)}%</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Vesting Schedule</span>
          <span
            className={`font-semibold ${
              Math.abs(schedulePercentage - vestingTarget) < 0.01
                ? 'text-green-400'
                : schedulePercentage > vestingTarget
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }`}
          >
            {schedulePercentage.toFixed(2)}% / {vestingTarget.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-2">
          <span className="text-gray-300 font-medium">Total Allocation</span>
          <span
            className={`font-bold ${
              isValid ? 'text-green-400' : grandTotal > 100 ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {grandTotal.toFixed(2)}%
          </span>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
          {tgePercentage > 0 && (
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              style={{ width: `${Math.min(tgePercentage, 100)}%` }}
            />
          )}
          <div
            className={`h-full transition-all duration-300 ${
              isValid
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : grandTotal > 100
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
            style={{ width: `${Math.min(schedulePercentage, 100 - tgePercentage)}%` }}
          />
        </div>

        {!isValid && (
          <p className="text-sm text-yellow-400">
            {grandTotal > 100
              ? `⚠️ Total exceeds 100% by ${(grandTotal - 100).toFixed(2)}%`
              : `⚠️ Vesting schedule needs ${(vestingTarget - schedulePercentage).toFixed(2)}% more (TGE: ${tgePercentage}% + Schedule: ${schedulePercentage.toFixed(2)}% = ${grandTotal.toFixed(2)}%)`}
          </p>
        )}
      </div>

      {/* Summary */}
      {value.length > 0 && (
        <div className="p-3 bg-gray-800/30 border border-gray-700 rounded-lg text-sm text-gray-300">
          <div className="font-medium mb-1">Schedule Summary:</div>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            {sortedValue.find((e) => e.month === 0 && e.percentage > 0) && (
              <li key="tge">
                TGE: {sortedValue.find((e) => e.month === 0)?.percentage}% unlocked immediately
              </li>
            )}
            {sortedValue.filter((e) => e.month > 0).length > 0 && (
              <li>Vesting over {Math.max(...sortedValue.map((e) => e.month))} months</li>
            )}
            <li>{sortedValue.length} total unlock events</li>
          </ul>
        </div>
      )}
    </div>
  );
}
