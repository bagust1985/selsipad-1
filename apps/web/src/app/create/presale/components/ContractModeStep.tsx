'use client';

import { Shield, FileCode, Zap, Check } from 'lucide-react';

export interface ContractModeStepProps {
  selectedMode: 'EXTERNAL_CONTRACT' | 'LAUNCHPAD_TEMPLATE' | null;
  onSelectMode: (mode: 'EXTERNAL_CONTRACT' | 'LAUNCHPAD_TEMPLATE') => void;
  network: string;
}

export function ContractModeStep({ selectedMode, onSelectMode, network }: ContractModeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Contract Source</h2>
        <p className="text-gray-400">Select how you want to deploy your presale contract</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* External Contract Option */}
        <button
          type="button"
          onClick={() => onSelectMode('EXTERNAL_CONTRACT')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            selectedMode === 'EXTERNAL_CONTRACT'
              ? 'border-purple-600 bg-purple-600/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${
                selectedMode === 'EXTERNAL_CONTRACT' ? 'bg-purple-600/20' : 'bg-gray-700'
              }`}
            >
              <FileCode
                className={`w-8 h-8 ${
                  selectedMode === 'EXTERNAL_CONTRACT' ? 'text-purple-400' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Use My Contract</h3>
              <p className="text-sm text-gray-400 mb-4">
                Bring your own smart contract that you've already deployed
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {selectedMode === 'EXTERNAL_CONTRACT' ? (
                    <Check className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-gray-500" />
                  )}
                  Security scan required
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {selectedMode === 'EXTERNAL_CONTRACT' ? (
                    <Check className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-500" />
                  )}
                  Full control over contract
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Launchpad Template Option */}
        <button
          type="button"
          onClick={() => onSelectMode('LAUNCHPAD_TEMPLATE')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            selectedMode === 'LAUNCHPAD_TEMPLATE'
              ? 'border-green-600 bg-green-600/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${
                selectedMode === 'LAUNCHPAD_TEMPLATE' ? 'bg-green-600/20' : 'bg-gray-700'
              }`}
            >
              <Zap
                className={`w-8 h-8 ${
                  selectedMode === 'LAUNCHPAD_TEMPLATE' ? 'text-green-400' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Use Launchpad Template</h3>
              <p className="text-sm text-gray-400 mb-4">
                Deploy from our audited, battle-tested template
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {selectedMode === 'LAUNCHPAD_TEMPLATE' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-500" />
                  )}
                  No scan required
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {selectedMode === 'LAUNCHPAD_TEMPLATE' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-500" />
                  )}
                  Fast deployment
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {selectedMode === 'LAUNCHPAD_TEMPLATE' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-gray-500" />
                  )}
                  May be audited (based on version)
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Selection Indicator */}
      {selectedMode && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Selected:{' '}
            <span className="text-white font-medium">
              {selectedMode === 'EXTERNAL_CONTRACT' ? 'My Contract' : 'Launchpad Template'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
