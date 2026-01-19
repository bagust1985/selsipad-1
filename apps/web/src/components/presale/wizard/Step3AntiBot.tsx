'use client';

import type { PresaleAntiBot } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step3AntiBotProps {
  data: Partial<PresaleAntiBot>;
  onChange: (data: Partial<PresaleAntiBot>) => void;
  errors?: Partial<Record<keyof PresaleAntiBot, string>>;
}

export function Step3AntiBot({ data, onChange, errors }: Step3AntiBotProps) {
  const handleChange = (field: keyof PresaleAntiBot, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Anti-Bot Configuration</h2>
        <p className="text-gray-400">
          Optional settings to prevent bots and ensure fair distribution (can be skipped).
        </p>
      </div>

      {/* Whitelist Toggle */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Whitelist Mode</h3>
            <p className="text-sm text-gray-400">Only allow whitelisted addresses to participate</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('whitelist_enabled', !data.whitelist_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              data.whitelist_enabled ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.whitelist_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Max Buy Per Wallet */}
      <div>
        <label htmlFor="max_buy_per_wallet" className="block text-sm font-medium text-white mb-2">
          Max Buy Per Wallet (Optional)
        </label>
        <input
          id="max_buy_per_wallet"
          type="text"
          value={data.max_buy_per_wallet || ''}
          onChange={(e) => handleChange('max_buy_per_wallet', e.target.value)}
          placeholder="Leave empty for no limit"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          Additional limit beyond max contribution to prevent whales
        </p>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg text-sm text-blue-300">
        <strong className="text-blue-200">Note:</strong> These settings are optional. You can skip
        this step if you don't need anti-bot protection.
      </div>
    </div>
  );
}
