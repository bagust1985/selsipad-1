'use client';

import { Info } from 'lucide-react';
import type { PresaleSaleParams } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step2SaleParamsProps {
  data: Partial<PresaleSaleParams>;
  onChange: (data: Partial<PresaleSaleParams>) => void;
  errors?: Partial<Record<keyof PresaleSaleParams, string>>;
  network?: string;
}

const PAYMENT_TOKENS = [
  { value: 'NATIVE', label: 'Native Token (ETH/BNB/SOL)', desc: 'Chain native token' },
  { value: 'USDC', label: 'USDC', desc: 'USD Coin stablecoin' },
  { value: 'USDT', label: 'USDT', desc: 'Tether stablecoin' },
];

export function Step2SaleParams({ data, onChange, errors, network }: Step2SaleParamsProps) {
  const handleChange = (field: keyof PresaleSaleParams, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const getMinStartDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Sale Parameters</h2>
        <p className="text-gray-400">
          Configure the pricing, amounts, and timeline for your presale.
        </p>
      </div>

      {/* Token Address */}
      <div>
        <label htmlFor="token_address" className="block text-sm font-medium text-white mb-2">
          Token Contract Address <span className="text-red-400">*</span>
        </label>
        <input
          id="token_address"
          type="text"
          value={data.token_address || ''}
          onChange={(e) => handleChange('token_address', e.target.value)}
          placeholder={network === 'solana' ? 'Solana token mint address' : '0x...'}
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.token_address ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
        />
        {errors?.token_address && (
          <p className="mt-2 text-sm text-red-400">{errors.token_address}</p>
        )}
      </div>

      {/* Grid: Total Tokens & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="total_tokens" className="block text-sm font-medium text-white mb-2">
            Total Tokens for Sale <span className="text-red-400">*</span>
          </label>
          <input
            id="total_tokens"
            type="text"
            value={data.total_tokens || ''}
            onChange={(e) => handleChange('total_tokens', e.target.value)}
            placeholder="1000000"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.total_tokens ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.total_tokens && (
            <p className="mt-2 text-sm text-red-400">{errors.total_tokens}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
            Price per Token <span className="text-red-400">*</span>
          </label>
          <input
            id="price"
            type="text"
            value={data.price || ''}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0.01"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.price ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.price && <p className="mt-2 text-sm text-red-400">{errors.price}</p>}
        </div>
      </div>

      {/* Grid: Softcap & Hardcap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="softcap" className="block text-sm font-medium text-white mb-2">
            Softcap <span className="text-red-400">*</span>
          </label>
          <input
            id="softcap"
            type="text"
            value={data.softcap || ''}
            onChange={(e) => handleChange('softcap', e.target.value)}
            placeholder="50000"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.softcap ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.softcap && <p className="mt-2 text-sm text-red-400">{errors.softcap}</p>}
          <p className="mt-1 text-xs text-gray-500">Minimum goal for success</p>
        </div>

        <div>
          <label htmlFor="hardcap" className="block text-sm font-medium text-white mb-2">
            Hardcap <span className="text-red-400">*</span>
          </label>
          <input
            id="hardcap"
            type="text"
            value={data.hardcap || ''}
            onChange={(e) => handleChange('hardcap', e.target.value)}
            placeholder="100000"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.hardcap ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.hardcap && <p className="mt-2 text-sm text-red-400">{errors.hardcap}</p>}
          <p className="mt-1 text-xs text-gray-500">Maximum amount to raise</p>
        </div>
      </div>

      {/* Grid: Min & Max Contribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="min_contribution" className="block text-sm font-medium text-white mb-2">
            Min Contribution <span className="text-red-400">*</span>
          </label>
          <input
            id="min_contribution"
            type="text"
            value={data.min_contribution || ''}
            onChange={(e) => handleChange('min_contribution', e.target.value)}
            placeholder="0.1"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.min_contribution ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.min_contribution && (
            <p className="mt-2 text-sm text-red-400">{errors.min_contribution}</p>
          )}
        </div>

        <div>
          <label htmlFor="max_contribution" className="block text-sm font-medium text-white mb-2">
            Max Contribution <span className="text-red-400">*</span>
          </label>
          <input
            id="max_contribution"
            type="text"
            value={data.max_contribution || ''}
            onChange={(e) => handleChange('max_contribution', e.target.value)}
            placeholder="10"
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.max_contribution ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
          />
          {errors?.max_contribution && (
            <p className="mt-2 text-sm text-red-400">{errors.max_contribution}</p>
          )}
        </div>
      </div>

      {/* Payment Token */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Payment Token <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAYMENT_TOKENS.map((token) => (
            <button
              key={token.value}
              type="button"
              onClick={() => handleChange('payment_token', token.value as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.payment_token === token.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="text-left">
                <div
                  className={`font-semibold ${
                    data.payment_token === token.value ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {token.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{token.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {errors?.payment_token && (
          <p className="mt-2 text-sm text-red-400">{errors.payment_token}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_at" className="block text-sm font-medium text-white mb-2">
            Start Date & Time <span className="text-red-400">*</span>
          </label>
          <input
            id="start_at"
            type="datetime-local"
            value={data.start_at?.slice(0, 16) || ''}
            onChange={(e) => handleChange('start_at', new Date(e.target.value).toISOString())}
            min={getMinStartDate()}
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.start_at ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white focus:outline-none focus:border-purple-500`}
          />
          {errors?.start_at && <p className="mt-2 text-sm text-red-400">{errors.start_at}</p>}
        </div>

        <div>
          <label htmlFor="end_at" className="block text-sm font-medium text-white mb-2">
            End Date & Time <span className="text-red-400">*</span>
          </label>
          <input
            id="end_at"
            type="datetime-local"
            value={data.end_at?.slice(0, 16) || ''}
            onChange={(e) => handleChange('end_at', new Date(e.target.value).toISOString())}
            min={data.start_at?.slice(0, 16)}
            className={`w-full px-4 py-3 bg-gray-900 border ${
              errors?.end_at ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white focus:outline-none focus:border-purple-500`}
          />
          {errors?.end_at && <p className="mt-2 text-sm text-red-400">{errors.end_at}</p>}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <strong className="text-white">Recommended Settings:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>Start time: At least 1 hour in the future</li>
            <li>Duration: 3-7 days for optimal participation</li>
            <li>Softcap: 50-70% of hardcap</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
