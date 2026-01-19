'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ComplianceGateBanner } from '../ComplianceGateBanner';
import type { ComplianceStatus } from '@/../../packages/shared/src/validators/presale-wizard';
import { validateComplianceGates } from '@/../../packages/shared/src/validators/presale-wizard';

interface Step9SubmitProps {
  complianceStatus: ComplianceStatus;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function Step9Submit({ complianceStatus, onSubmit, isSubmitting }: Step9SubmitProps) {
  const { valid, violations } = validateComplianceGates(complianceStatus);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (valid) {
      await onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Compliance Check & Submit</h2>
        <p className="text-gray-400">
          Final compliance verification before submitting your presale for admin review.
        </p>
      </div>

      {/* Compliance Banner */}
      <ComplianceGateBanner
        kycStatus={complianceStatus.kyc_status}
        scScanStatus={complianceStatus.sc_scan_status}
        vestingValid={
          complianceStatus.investor_vesting_valid && complianceStatus.team_vesting_valid
        }
        lpLockValid={complianceStatus.lp_lock_valid}
      />

      {/* Violations List (if attempted to submit) */}
      {submitAttempted && !valid && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-2">
                Cannot Submit - Requirements Not Met:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
                {violations.map((violation, index) => (
                  <li key={index}>{violation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !valid}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
            valid && !isSubmitting
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Submitting for Review...
            </>
          ) : valid ? (
            <>
              <CheckCircle className="w-6 h-6" />
              Submit for Admin Review
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6" />
              Complete All Requirements to Submit
            </>
          )}
        </button>

        {valid && !isSubmitting && (
          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-300">
                <strong className="text-green-200">All requirements met!</strong>
                <p className="mt-1">
                  Your presale configuration meets all compliance requirements. Click submit to send
                  it for admin review. You'll be notified once it's approved and ready to deploy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What Happens Next */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
        <h3 className="text-white font-semibold mb-3">What happens after submission?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
          <li>Admin team reviews your presale configuration (usually within 24-48 hours)</li>
          <li>If approved, you'll be notified and can deploy your presale on-chain</li>
          <li>Once deployed and start time reached, your presale goes live for contributions</li>
          <li>After end time, you can finalize the presale and distribute tokens</li>
        </ol>
      </div>
    </div>
  );
}
