'use client';

import { ImageUpload } from '../ImageUpload';
import type { PresaleBasics } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step1BasicInfoProps {
  data: Partial<PresaleBasics>;
  onChange: (data: Partial<PresaleBasics>) => void;
  errors?: Partial<Record<keyof PresaleBasics, string>>;
}

const NETWORKS = [
  { value: 'ethereum', label: 'Ethereum', icon: '⟠' },
  { value: 'bsc', label: 'BNB Smart Chain', icon: '🔶' },
  { value: 'polygon', label: 'Polygon', icon: '🟣' },
  { value: 'avalanche', label: 'Avalanche', icon: '🔺' },
  { value: 'solana', label: 'Solana', icon: '◎' },
];

export function Step1BasicInfo({ data, onChange, errors }: Step1BasicInfoProps) {
  const handleChange = (field: keyof PresaleBasics, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
        <p className="text-gray-400">
          Tell us about your project and choose which network you'll be launching on.
        </p>
      </div>

      {/* Project Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
          Project Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Awesome DeFi Protocol"
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.name ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
          maxLength={100}
        />
        {errors?.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
        <p className="mt-2 text-xs text-gray-500">{data.name?.length || 0}/100 characters</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Project Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your project, its goals, and what makes it unique..."
          rows={6}
          className={`w-full px-4 py-3 bg-gray-900 border ${
            errors?.description ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none`}
          maxLength={2000}
        />
        {errors?.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
        <p className="mt-2 text-xs text-gray-500">
          {data.description?.length || 0}/2000 characters (minimum 50)
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <ImageUpload
          label="Project Logo"
          description="Recommended: 512x512px, PNG or JPG (max 2MB)"
          value={data.logo_url}
          onChange={(url) => handleChange('logo_url', url)}
          folder="presale-logos"
        />
        {errors?.logo_url && <p className="mt-2 text-sm text-red-400">{errors.logo_url}</p>}
      </div>

      {/* Banner Upload (Optional) */}
      <div>
        <ImageUpload
          label="Project Banner (Optional)"
          description="Recommended: 1920x400px, PNG or JPG (max 2MB)"
          value={data.banner_url}
          onChange={(url) => handleChange('banner_url', url)}
          folder="presale-banners"
        />
        {errors?.banner_url && <p className="mt-2 text-sm text-red-400">{errors.banner_url}</p>}
      </div>

      {/* Network Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Network <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NETWORKS.map((network) => (
            <button
              key={network.value}
              type="button"
              onClick={() => handleChange('network', network.value as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.network === network.value
                  ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/30'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{network.icon}</div>
                <div className="text-left">
                  <div
                    className={`font-semibold ${
                      data.network === network.value ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {network.label}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors?.network && <p className="mt-2 text-sm text-red-400">{errors.network}</p>}
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <div className="flex gap-3">
          <div className="text-blue-400 text-xl flex-shrink-0">ℹ️</div>
          <div className="text-sm text-blue-300">
            <strong className="text-blue-200">Important:</strong> The network you select cannot be
            changed after creation. Make sure to choose the network where your token contract is
            deployed.
          </div>
        </div>
      </div>
    </div>
  );
}
