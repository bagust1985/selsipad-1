'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { createFairlaunchDraft, submitFairlaunch } from './actions';

// ===== FAIRLAUNCH-SPECIFIC SCHEMAS (NOT PRESALE) =====
const fairlaunchBasicsSchema = z.object({
  name: z.string().min(3, 'Min 3 characters'),
  symbol: z.string().min(2, 'Min 2 characters').max(10, 'Max 10 characters'),
  description: z.string().min(10, 'Min 10 characters'),
  logo_url: z.string().url('Must be valid URL').optional().or(z.literal('')),
  network: z.enum(['ethereum', 'bnb', 'solana']),
});

const fairlaunchParamsSchema = z.object({
  token_address: z.string().min(20, 'Invalid token address'),
  tokens_for_sale: z.string().min(1, 'Required'),
  softcap: z.string().min(1, 'Softcap required'), // NO HARDCAP
  payment_token: z.enum(['NATIVE', 'USDT', 'USDC']),
  start_at: z.string().min(1, 'Start time required'),
  end_at: z.string().min(1, 'End time required'),
  min_contribution: z.string().optional(),
  max_contribution: z.string().optional(),
});

const fairlaunchLiquiditySchema = z.object({
  liquidity_percent: z.number().min(70, 'Fairlaunch requires min 70% liquidity'),
  lp_lock_months: z.number().min(12, 'LP lock must be at least 12 months'),
  listing_platform: z.string().min(1, 'Platform required'),
});

const teamVestingSchema = z.object({
  team_allocation: z.string().min(1, 'Required'),
  schedule: z
    .array(
      z.object({
        month: z.number(),
        percentage: z.number(),
      })
    )
    .min(1, 'At least one vesting period required'),
});

interface CreateFairlaunchWizardProps {
  walletAddress: string;
  initialKycStatus: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED';
  initialScScanStatus: 'NOT_REQUESTED' | 'PENDING' | 'PASS' | 'FAIL' | 'OVERRIDE_PASS';
}

// Unique storage key for fairlaunch
const STORAGE_KEY = 'wizard:fairlaunch:v1';

const FAIRLAUNCH_STEPS = [
  { id: 1, name: 'Basic Info', description: 'Project details' },
  { id: 2, name: 'Fairlaunch Params', description: 'Tokens & softcap' },
  { id: 3, name: 'Liquidity Plan', description: '>=70% LP + Lock' },
  { id: 4, name: 'Team Vesting', description: 'Mandatory vesting' },
  { id: 5, name: 'Fees', description: 'Platform fees' },
  { id: 6, name: 'Review', description: 'Summary' },
  { id: 7, name: 'Submit', description: 'Compliance check' },
];

export function CreateFairlaunchWizard({
  walletAddress,
  initialKycStatus,
  initialScScanStatus,
}: CreateFairlaunchWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [wizardData, setWizardData] = useState({
    basics: { network: 'ethereum' },
    params: { payment_token: 'NATIVE' },
    liquidity: { liquidity_percent: 70, lp_lock_months: 12, listing_platform: 'Uniswap' },
    team_vesting: { team_allocation: '0', schedule: [] },
    fees: { platform_fee_bps: 500, referral_enabled: true, referral_reward_bps: 100 },
  });

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWizardData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load fairlaunch draft:', e);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (wizardData.basics?.name) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
    }
  }, [wizardData]);

  const validateStep = (step: number): boolean => {
    setErrors({});
    try {
      switch (step) {
        case 1:
          fairlaunchBasicsSchema.parse(wizardData.basics);
          break;
        case 2:
          fairlaunchParamsSchema.parse(wizardData.params);
          break;
        case 3:
          fairlaunchLiquiditySchema.parse(wizardData.liquidity);
          break;
        case 4:
          teamVestingSchema.parse(wizardData.team_vesting);
          if (wizardData.team_vesting.schedule.reduce((s, v) => s + v.percentage, 0) !== 100) {
            setErrors({ schedule: 'Vesting must total 100%' });
            return false;
          }
          break;
        case 6:
          return termsAccepted;
      }
      return true;
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: any = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const result = await createFairlaunchDraft(wizardData, walletAddress);
      if (result.success) {
        alert('Draft saved!');
      } else {
        alert('Save failed: ' + result.error);
      }
    } catch (error) {
      alert('Failed to save draft');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitFairlaunch(wizardData, walletAddress);
      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        router.push('/fairlaunch?created=true');
      } else {
        alert('Submission failed: ' + result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycPassed = initialKycStatus === 'CONFIRMED';
  const scScanPassed = ['PASS', 'OVERRIDE_PASS'].includes(initialScScanStatus);
  const teamVestingValid =
    wizardData.team_vesting.schedule.reduce((sum, v) => sum + v.percentage, 0) === 100;
  const liquidityValid =
    wizardData.liquidity.liquidity_percent >= 70 && wizardData.liquidity.lp_lock_months >= 12;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Fairlaunch</h1>
        <p className="text-gray-400">
          Launch your fairlaunch in 7 steps. Pro-rata tokenomics with softcap only.
        </p>

        <div className="mt-4 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">Fairlaunch Key Points:</p>
              <ul className="text-blue-200/80 space-y-1 text-xs">
                <li>
                  • <strong>No hardcap</strong> - only softcap
                </li>
                <li>
                  • <strong>Final price</strong> = total_raised / tokens_for_sale
                </li>
                <li>
                  • <strong>Min 70% liquidity</strong> + 12+ month lock
                </li>
                <li>
                  • <strong>Team vesting mandatory</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper - 7 STEPS */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {FAIRLAUNCH_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() =>
                  currentStep > step.id || completedSteps.includes(step.id)
                    ? setCurrentStep(step.id)
                    : null
                }
                className={`flex flex-col items-center ${currentStep >= step.id ? 'opacity-100' : 'opacity-50'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step.id
                      ? 'bg-purple-600 text-white'
                      : completedSteps.includes(step.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                <span className="text-xs text-gray-400 mt-1 hidden md:block">{step.name}</span>
              </button>
              {index < FAIRLAUNCH_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-700'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={wizardData.basics?.name || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      basics: { ...wizardData.basics, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="My Token"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={wizardData.basics?.symbol || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      basics: { ...wizardData.basics, symbol: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="MTK"
                />
                {errors.symbol && <p className="text-red-400 text-sm mt-1">{errors.symbol}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={wizardData.basics?.description || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      basics: { ...wizardData.basics, description: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  rows={4}
                  placeholder="Describe your project..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                <select
                  value={wizardData.basics?.network || 'ethereum'}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      basics: { ...wizardData.basics, network: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="bnb">BNB Chain</option>
                  <option value="solana">Solana</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fairlaunch Params (NO HARDCAP!) */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Fairlaunch Parameters</h2>
            <div className="mb-4 bg-amber-950/30 border border-amber-800/40 rounded-lg p-3">
              <p className="text-amber-200 text-sm">
                <strong>No Hardcap:</strong> Final price = total_raised / tokens_for_sale
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  value={wizardData.params?.token_address || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      params: { ...wizardData.params, token_address: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                  placeholder="0x..."
                />
                {errors.token_address && (
                  <p className="text-red-400 text-sm mt-1">{errors.token_address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tokens For Sale
                </label>
                <input
                  type="number"
                  value={wizardData.params?.tokens_for_sale || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      params: { ...wizardData.params, tokens_for_sale: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="1000000"
                />
                {errors.tokens_for_sale && (
                  <p className="text-red-400 text-sm mt-1">{errors.tokens_for_sale}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Softcap Only</label>
                <input
                  type="number"
                  value={wizardData.params?.softcap || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      params: { ...wizardData.params, softcap: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="100"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Minimum funds to raise. If not met, refund issued.
                </p>
                {errors.softcap && <p className="text-red-400 text-sm mt-1">{errors.softcap}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={wizardData.params?.start_at || ''}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        params: { ...wizardData.params, start_at: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={wizardData.params?.end_at || ''}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        params: { ...wizardData.params, end_at: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Liquidity Plan (>=70%, >=12mo) */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Liquidity Plan</h2>
            <div className="mb-4 bg-purple-950/30 border border-purple-800/40 rounded-lg p-3">
              <p className="text-purple-200 text-sm">
                <strong>Fairlaunch Requirement:</strong> Min 70% liquidity + 12+ month lock
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Liquidity Percentage (%)
                </label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={wizardData.liquidity?.liquidity_percent || 70}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      liquidity: {
                        ...wizardData.liquidity,
                        liquidity_percent: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Minimum 70% for fairlaunch</p>
                {errors.liquidity_percent && (
                  <p className="text-red-400 text-sm mt-1">{errors.liquidity_percent}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LP Lock Duration (months)
                </label>
                <input
                  type="number"
                  min="12"
                  value={wizardData.liquidity?.lp_lock_months || 12}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      liquidity: {
                        ...wizardData.liquidity,
                        lp_lock_months: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Minimum 12 months</p>
                {errors.lp_lock_months && (
                  <p className="text-red-400 text-sm mt-1">{errors.lp_lock_months}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Listing Platform
                </label>
                <select
                  value={wizardData.liquidity?.listing_platform || 'Uniswap'}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      liquidity: { ...wizardData.liquidity, listing_platform: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="Uniswap">Uniswap</option>
                  <option value="PancakeSwap">PancakeSwap</option>
                  <option value="Raydium">Raydium (Solana)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Team Vesting (MANDATORY) */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Team Vesting (Mandatory)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Allocation
                </label>
                <input
                  type="number"
                  value={wizardData.team_vesting?.team_allocation || ''}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      team_vesting: { ...wizardData.team_vesting, team_allocation: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="100000"
                />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Vesting Schedule (must total 100%)</p>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Add vesting periods. Example: Month 0 = 20%, Month 6 = 40%, Month 12 = 40%
                  </p>
                </div>
                {errors.schedule && <p className="text-red-400 text-sm mt-1">{errors.schedule}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Fees */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Fee Structure</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Success Fee</span>
                  <span className="text-white font-medium">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Referral Rewards</span>
                  <span className="text-white font-medium">1%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Review & Terms</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-white mb-2">Summary</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Project:</span>{' '}
                  <span className="text-white">{wizardData.basics?.name || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Network:</span>{' '}
                  <span className="text-white">{wizardData.basics?.network}</span>
                </p>
                <p>
                  <span className="text-gray-400">Tokens for Sale:</span>{' '}
                  <span className="text-white">{wizardData.params?.tokens_for_sale || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Softcap:</span>{' '}
                  <span className="text-white">{wizardData.params?.softcap || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Hardcap:</span>{' '}
                  <span className="text-amber-400">NO HARDCAP (Fairlaunch)</span>
                </p>
                <p>
                  <span className="text-gray-400">Liquidity:</span>{' '}
                  <span className="text-white">
                    {wizardData.liquidity?.liquidity_percent}% locked for{' '}
                    {wizardData.liquidity?.lp_lock_months} months
                  </span>
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-300">
                I accept the terms and understand that fairlaunch uses pro-rata pricing (final_price
                = total_raised / tokens_for_sale)
              </span>
            </label>
          </div>
        )}

        {/* Step 7: Submit (Compliance) */}
        {currentStep === 7 && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Compliance Check</h2>

            <div className="space-y-3 mb-6 text-left max-w-md mx-auto">
              <div
                className={`flex items-center gap-3 ${kycPassed ? 'text-green-400' : 'text-red-400'}`}
              >
                {kycPassed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>Developer KYC {kycPassed ? 'Passed' : 'Required'}</span>
              </div>
              <div
                className={`flex items-center gap-3 ${scScanPassed ? 'text-green-400' : 'text-red-400'}`}
              >
                {scScanPassed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>Smart Contract Scan {scScanPassed ? 'Passed' : 'Required'}</span>
              </div>
              <div
                className={`flex items-center gap-3 ${teamVestingValid ? 'text-green-400' : 'text-red-400'}`}
              >
                {teamVestingValid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>Team Vesting {teamVestingValid ? 'Configured' : 'Required'}</span>
              </div>
              <div
                className={`flex items-center gap-3 ${liquidityValid ? 'text-green-400' : 'text-red-400'}`}
              >
                {liquidityValid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>Liquidity Plan {liquidityValid ? 'Valid' : 'Invalid'}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !kycPassed || !scScanPassed || !teamVestingValid || !liquidityValid
              }
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Fairlaunch'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            currentStep === 1
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-3">
          {currentStep < 7 && (
            <>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
