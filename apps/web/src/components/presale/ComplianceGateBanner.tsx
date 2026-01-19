'use client';

import { CheckCircle, Clock, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ComplianceGateBannerProps {
  kycStatus: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED';
  scScanStatus: 'NOT_REQUESTED' | 'PENDING' | 'PASS' | 'FAIL' | 'OVERRIDE_PASS';
  vestingValid: boolean;
  lpLockValid: boolean;
  className?: string;
}

interface GateStatus {
  label: string;
  status: 'passed' | 'pending' | 'failed';
  action?: {
    label: string;
    href: string;
  };
}

export function ComplianceGateBanner({
  kycStatus,
  scScanStatus,
  vestingValid,
  lpLockValid,
  className = '',
}: ComplianceGateBannerProps) {
  // Determine gate statuses
  const gates: GateStatus[] = [
    {
      label: 'Developer KYC',
      status:
        kycStatus === 'CONFIRMED' ? 'passed' : kycStatus === 'REJECTED' ? 'failed' : 'pending',
      action:
        kycStatus !== 'CONFIRMED'
          ? {
              label:
                kycStatus === 'PENDING'
                  ? 'Start KYC'
                  : kycStatus === 'REJECTED'
                    ? 'Resubmit KYC'
                    : 'Check Status',
              href: '/profile/kyc',
            }
          : undefined,
    },
    {
      label: 'Smart Contract Scan',
      status: ['PASS', 'OVERRIDE_PASS'].includes(scScanStatus)
        ? 'passed'
        : scScanStatus === 'FAIL'
          ? 'failed'
          : 'pending',
      action: !['PASS', 'OVERRIDE_PASS'].includes(scScanStatus)
        ? {
            label:
              scScanStatus === 'NOT_REQUESTED'
                ? 'Request Scan'
                : scScanStatus === 'FAIL'
                  ? 'Request Review'
                  : 'Check Status',
            href: '/project/sc-scan',
          }
        : undefined,
    },
    {
      label: 'Investor Vesting',
      status: vestingValid ? 'passed' : 'pending',
      action: !vestingValid
        ? {
            label: 'Configure',
            href: '#step-4',
          }
        : undefined,
    },
    {
      label: 'Team Vesting',
      status: vestingValid ? 'passed' : 'pending',
      action: !vestingValid
        ? {
            label: 'Configure',
            href: '#step-5',
          }
        : undefined,
    },
    {
      label: 'LP Lock (≥12 months)',
      status: lpLockValid ? 'passed' : 'pending',
      action: !lpLockValid
        ? {
            label: 'Configure',
            href: '#step-6',
          }
        : undefined,
    },
  ];

  const passedCount = gates.filter((g) => g.status === 'passed').length;
  const failedCount = gates.filter((g) => g.status === 'failed').length;
  const allPassed = passedCount === gates.length;
  const hasFailed = failedCount > 0;

  // Determine banner style
  const bannerStyle = allPassed
    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50'
    : hasFailed
      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50'
      : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';

  const IconComponent = allPassed ? CheckCircle : hasFailed ? XCircle : AlertTriangle;
  const iconColor = allPassed ? 'text-green-400' : hasFailed ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className={`border rounded-lg overflow-hidden ${bannerStyle} ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start gap-3">
          <IconComponent className={`w-6 h-6 mt-0.5 ${iconColor} flex-shrink-0`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {allPassed && 'All Compliance Gates Passed ✅'}
              {!allPassed && hasFailed && 'Compliance Check Failed'}
              {!allPassed && !hasFailed && 'Compliance Checks Required'}
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              {allPassed &&
                'Your presale meets all requirements and can be submitted for admin review.'}
              {!allPassed &&
                hasFailed &&
                'Some compliance requirements have failed. Please resolve the issues below.'}
              {!allPassed &&
                !hasFailed &&
                `Complete ${gates.length - passedCount} remaining requirement${gates.length - passedCount > 1 ? 's' : ''} to submit your presale.`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {passedCount}/{gates.length}
            </div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              allPassed
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : hasFailed
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
            style={{ width: `${(passedCount / gates.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Gates List */}
      <div className="p-4 space-y-3">
        {gates.map((gate, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-center gap-3">
              {gate.status === 'passed' && (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              )}
              {gate.status === 'pending' && (
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              )}
              {gate.status === 'failed' && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}

              <div>
                <div className="text-sm font-medium text-white">{gate.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {gate.status === 'passed' && 'Requirement met'}
                  {gate.status === 'pending' && 'Action required'}
                  {gate.status === 'failed' && 'Failed - needs attention'}
                </div>
              </div>
            </div>

            {gate.action && (
              <Link
                href={gate.action.href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
              >
                {gate.action.label}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer Note */}
      {!allPassed && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-gray-900/30 border border-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-white">Note:</strong> All compliance gates must pass before
              you can submit your presale for admin review. This ensures a safe and compliant launch
              for all participants.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
