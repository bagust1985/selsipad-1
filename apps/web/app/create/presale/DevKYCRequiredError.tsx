'use client';

import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function DevKYCRequiredError() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-900/20 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Developer KYC Verification Required
        </h1>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-gray-300 text-center mb-6">
            To create a presale on SELSIPAD, you must complete the Developer KYC verification
            process. This helps protect investors and ensures platform security.
          </p>

          {/* Requirements */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              What you'll need:
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Valid government-issued ID (Passport, ID Card, or Driver's License)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Selfie with your ID for liveness verification</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Proof of address (Utility bill, Bank statement, etc.)
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/profile/kyc/submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors"
            >
              Submit KYC Application
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
          <p className="text-blue-200/80 text-sm text-center">
            <strong className="text-blue-300">Processing time:</strong> KYC applications are
            reviewed within 24-48 hours. You'll receive a notification once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
