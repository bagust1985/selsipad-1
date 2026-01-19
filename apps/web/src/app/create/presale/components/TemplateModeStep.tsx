'use client';

import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export interface TemplateModeStepProps {
  templateVersion: string;
  network: string;
  templateAuditStatus: 'VALID' | 'NOT_AUDITED' | null;
}

export function TemplateModeStep({
  templateVersion,
  network,
  templateAuditStatus,
}: TemplateModeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Launchpad Template</h2>
        <p className="text-gray-400">Your presale will be deployed using our audited template</p>
      </div>

      {/* Template Info Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Template Information</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Template Version</p>
            <code className="text-white font-mono text-lg">{templateVersion}</code>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Network</p>
            <p className="text-white font-medium">{network}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Deployment Method</p>
            <p className="text-white">Factory deployment (automated)</p>
          </div>
        </div>
      </div>

      {/* Audit Status Banner */}
      {templateAuditStatus === 'VALID' ? (
        <div className="bg-green-950/30 border border-green-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-300 mb-2">✅ Audited Template</h4>
              <p className="text-green-200/80 text-sm mb-3">
                This template version has been professionally audited and verified. Your project
                will automatically receive the <strong>PROJECT_AUDITED</strong> badge upon
                deployment.
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  Eligible for PROJECT_AUDITED badge
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">🏭 Factory Verified</h4>
              <p className="text-gray-400 text-sm mb-3">
                This template version has not yet been audited. Your contract will be deployed from
                our verified factory, but will not receive the PROJECT_AUDITED badge.
              </p>
              <p className="text-gray-500 text-sm">
                The contract is still safe to use and follows our standard template pattern.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Contract Button */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            // Redirect to template deployment page
            const params = new URLSearchParams({
              version: templateVersion,
              network: network,
              returnTo: '/create/presale',
            });
            window.location.href = `/create-contract/template?${params.toString()}`;
          }}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5" />
          Deploy Template Contract
        </button>
        <p className="text-sm text-gray-400 text-center">
          You'll be redirected to deploy your contract, then return to complete the presale setup
        </p>
      </div>

      {/* Benefits List */}
      <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-3">Template Benefits:</h4>
        <ul className="text-blue-200/80 text-sm space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            No security scan required
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            Battle-tested code used by many projects
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            Fast deployment via factory
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            Community support and documentation
          </li>
        </ul>
      </div>
    </div>
  );
}
