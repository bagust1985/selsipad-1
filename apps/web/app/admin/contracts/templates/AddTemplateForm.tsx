'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { upsertTemplateAudit } from '../actions';

export function AddTemplateForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    network: 'EVM' as 'EVM' | 'SOLANA',
    template_version: '',
    implementation_hash: '',
    factory_address: '',
    audit_report_ref: '',
    audit_provider: '',
    audited_at: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.template_version || !formData.implementation_hash || !formData.audit_report_ref) {
      setError('Template version, implementation hash, and audit report URL are required');
      return;
    }

    setIsProcessing(true);

    const result = await upsertTemplateAudit({
      ...formData,
      status: 'VALID',
    });

    if (result.success) {
      router.refresh();
      setIsOpen(false);
      setFormData({
        network: 'EVM',
        template_version: '',
        implementation_hash: '',
        factory_address: '',
        audit_report_ref: '',
        audit_provider: '',
        audited_at: '',
      });
    } else {
      setError(result.error || 'Failed to add template audit');
    }

    setIsProcessing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Audited Template
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Add Audited Template Version</h3>

          {error && (
            <div className="bg-red-950/30 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Network */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Network <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.network}
                onChange={(e) =>
                  setFormData({ ...formData, network: e.target.value as 'EVM' | 'SOLANA' })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="EVM">EVM</option>
                <option value="SOLANA">SOLANA</option>
              </select>
            </div>

            {/* Template Version */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template Version <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.template_version}
                onChange={(e) => setFormData({ ...formData, template_version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>

            {/* Implementation Hash */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Implementation Hash <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.implementation_hash}
                onChange={(e) => setFormData({ ...formData, implementation_hash: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
              />
            </div>

            {/* Factory Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Factory Address (Optional)
              </label>
              <input
                type="text"
                value={formData.factory_address}
                onChange={(e) => setFormData({ ...formData, factory_address: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
              />
            </div>

            {/* Audit Report URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audit Report URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={formData.audit_report_ref}
                onChange={(e) => setFormData({ ...formData, audit_report_ref: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>

            {/* Audit Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audit Provider (Optional)
              </label>
              <input
                type="text"
                value={formData.audit_provider}
                onChange={(e) => setFormData({ ...formData, audit_provider: e.target.value })}
                placeholder="Certik, Hacken, etc."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>

            {/* Audit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audit Date (Optional)
              </label>
              <input
                type="date"
                value={formData.audited_at}
                onChange={(e) => setFormData({ ...formData, audited_at: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? 'Adding...' : 'Add Template'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError('');
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
