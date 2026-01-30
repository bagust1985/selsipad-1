'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { NetworkTokenStep } from './steps/NetworkTokenStep';
import { ProjectInfoStep } from './steps/ProjectInfoStep';
import { SaleParamsStep } from './steps/SaleParamsStep';
import { LiquidityPlanStep } from './steps/LiquidityPlanStep';
import { TeamVestingStep } from './steps/TeamVestingStep';
import { ReviewStep } from './steps/ReviewStep';
import { DeployStep } from './steps/DeployStep';
import { VestingScheduleUI } from '@/lib/fairlaunch/helpers';
import { prepareFairlaunchDeployment, saveFairlaunch } from '@/actions/fairlaunch';

interface CreateFairlaunchWizardProps {
  walletAddress: string;
}

// Wizard data interface
interface WizardData {
  // Step 1: Network & Token
  network: string;
  tokenMode: 'existing' | 'factory' | null;
  tokenAddress: string;
  tokenSource: string;
  securityScanStatus: 'PASS' | 'FAIL' | null;
  securityBadges: string[];
  
  // Token metadata (from scan or factory creation)
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenTotalSupply?: string;

  // Step 2: Project Info
  projectName: string;
  description: string;
  logoUrl?: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };

  // Step 3: Sale Parameters
  tokensForSale: string;
  softcap: string;
  startTime: string;
  endTime: string;
  minContribution: string;
  maxContribution: string;
  dexPlatform: string;
  listingPremiumBps: number;

  // Step 4: Liquidity Plan
  liquidityPercent: number;
  lpLockMonths: number;

  // Step 5: Team Vesting
  teamAllocation: string;
  vestingBeneficiary: string;
  vestingSchedule: VestingScheduleUI[];
}

const STORAGE_KEY = 'wizard:fairlaunch:v2';

const FAIRLAUNCH_STEPS = [
  { id: 1, title: 'Network & Token', description: 'Choose network and token' },
  { id: 2, title: 'Project Info', description: 'Project details & social' },
  { id: 3, title: 'Sale Parameters', description: 'Tokens, softcap & timing' },
  { id: 4, title: 'Liquidity Plan', description: 'LP allocation & lock' },
  { id: 5, title: 'Team Vesting', description: 'Team tokens & schedule' },
  { id: 6, title: 'Review & Apply', description: 'Final review' },
  { id: 7, title: 'Deploy', description: 'Deploy fairlaunch' },
];

export function CreateFairlaunchWizard({ walletAddress }: CreateFairlaunchWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize wizard data with defaults
  const [wizardData, setWizardData] = useState<WizardData>({
    network: '',
    tokenMode: null,
    tokenAddress: '',
    tokenSource: '',
    securityScanStatus: null,
    securityBadges: [],
    projectName: '',
    description: '',
    logoUrl: '',
    socialLinks: {},
    tokensForSale: '',
    softcap: '',
    startTime: '',
    endTime: '',
    minContribution: '',
    maxContribution: '',
    dexPlatform: '',
    listingPremiumBps: 0,
    liquidityPercent: 80,
    lpLockMonths: 12,
    teamAllocation: '0',
    vestingBeneficiary: walletAddress,
    vestingSchedule: [{ month: 0, percentage: 100 }],
  });

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWizardData({ ...wizardData, ...parsed });
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (wizardData.projectName) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
    }
  }, [wizardData]);

  // Update wizard data helper
  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
    setErrors({}); // Clear errors when data changes
  };

  // Validation for each step
  const validateStep = (step: number): boolean => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!wizardData.network) newErrors.network = 'Network is required';
        if (!wizardData.tokenAddress) newErrors.tokenAddress = 'Token address is required';
        if (wizardData.securityScanStatus !== 'PASS') {
          newErrors.security = 'Token must pass security scan';
        }
        break;

      case 2:
        if (!wizardData.projectName || wizardData.projectName.length < 3) {
          newErrors.projectName = 'Project name must be at least 3 characters';
        }
        if (!wizardData.description || wizardData.description.length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        }
        // Validate social links if provided
        Object.entries(wizardData.socialLinks).forEach(([platform, url]) => {
          if (url && !url.startsWith('http')) {
            newErrors[`social_${platform}`] = 'Must be a valid URL';
          }
        });
        break;

      case 3:
        if (!wizardData.tokensForSale || parseFloat(wizardData.tokensForSale) <= 0) {
          newErrors.tokensForSale = 'Tokens for sale must be greater than 0';
        }
        if (!wizardData.softcap || parseFloat(wizardData.softcap) <= 0) {
          newErrors.softcap = 'Softcap must be greater than 0';
        }
        if (!wizardData.startTime) newErrors.startTime = 'Start time is required';
        if (!wizardData.endTime) newErrors.endTime = 'End time is required';
        if (new Date(wizardData.startTime) >= new Date(wizardData.endTime)) {
          newErrors.endTime = 'End time must be after start time';
        }
        if (!wizardData.dexPlatform) newErrors.dexPlatform = 'DEX platform is required';
        break;

      case 4:
        if (wizardData.liquidityPercent < 70 || wizardData.liquidityPercent > 100) {
          newErrors.liquidityPercent = 'Liquidity must be 70-100%';
        }
        if (wizardData.lpLockMonths < 12) {
          newErrors.lpLockMonths = 'LP lock must be at least 12 months';
        }
        break;

      case 5:
        const teamAlloc = parseFloat(wizardData.teamAllocation);
        if (isNaN(teamAlloc) || teamAlloc < 0) {
          newErrors.teamAllocation = 'Invalid team allocation';
        }
        if (teamAlloc > 0) {
          if (!wizardData.vestingBeneficiary || wizardData.vestingBeneficiary.length < 40) {
            newErrors.vestingBeneficiary = 'Valid beneficiary address required';
          }
          const totalPercent = wizardData.vestingSchedule.reduce(
            (sum, period) => sum + period.percentage,
            0
          );
          if (Math.abs(totalPercent - 100) > 0.01) {
            newErrors.vestingSchedule = 'Vesting schedule must total 100%';
          }
        }
        break;

      case 6:
        if (!termsAccepted) {
          newErrors.terms = 'You must accept terms & conditions';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
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

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
    alert('Draft saved successfully!');
  };

  // Deploy handler
  const handleDeploy = async () => {
    // Prevent duplicate submissions  
    if (isDeploying) {
      console.warn('Deployment already in progress');
      return;
    }

    try {
      setIsDeploying(true);
      
      // Step 1: Prepare deployment params via server action
      const prepareResult = await prepareFairlaunchDeployment(wizardData);

      if (!prepareResult.success || !prepareResult.params) {
        throw new Error(prepareResult.error || 'Failed to prepare deployment');
      }

      // Step 2: Client-side deployment using wagmi
      // TODO: Add wagmi hooks for actual blockchain interaction
      // For now, return mock data until wagmi is integrated
      
      // IMPORTANT: This is a placeholder for wagmi integration
      // Real implementation should:
      // 1. Call writeContract() to deploy fairlaunch
      // 2. Wait for transaction confirmation
      // 3. Parse event logs to get deployed addresses
      // 4. Then call saveFairlaunch below
      
      console.log('Deployment params ready:', prepareResult.params);
      console.log('Factory address:', prepareResult.factoryAddress);
      console.log('Chain ID:', prepareResult.chainId);

      // Mock deployment result (replace with real wagmi calls)
      const mockTxHash = '0x' + Math.random().toString(16).substring(2);
      const mockFairlaunchAddr = '0x' + Math.random().toString(16).substring(2, 42);
      const mockVestingAddr = '0x' + Math.random().toString(16).substring(2, 42);
      const mockFeeSplitterAddr = '0x' + Math.random().toString(16).substring(2, 42);

      // Step 3: Save to database after successful deployment
      const saveResult = await saveFairlaunch({
        network: wizardData.network,
        tokenAddress: wizardData.tokenAddress,
        tokenSource: wizardData.tokenMode as 'factory' | 'existing',
        securityBadges: wizardData.securityBadges,
        
        // Token metadata
        tokenName: wizardData.tokenName,
        tokenSymbol: wizardData.tokenSymbol,
        tokenDecimals: wizardData.tokenDecimals,
        tokenTotalSupply: wizardData.tokenTotalSupply,
        
        projectName: wizardData.projectName,
        description: wizardData.description,
        logoUrl: wizardData.logoUrl,
        socialLinks: wizardData.socialLinks,
        tokensForSale: wizardData.tokensForSale,
        softcap: wizardData.softcap,
        startTime: wizardData.startTime,
        endTime: wizardData.endTime,
        minContribution: wizardData.minContribution,
        maxContribution: wizardData.maxContribution,
        dexPlatform: wizardData.dexPlatform,
        listingPremiumBps: wizardData.listingPremiumBps,
        liquidityPercent: wizardData.liquidityPercent,
        lpLockMonths: wizardData.lpLockMonths,
        teamAllocation: wizardData.teamAllocation,
        vestingBeneficiary: wizardData.vestingBeneficiary,
        vestingSchedule: wizardData.vestingSchedule,
        fairlaunchAddress: mockFairlaunchAddr,
        vestingAddress: mockVestingAddr,
        feeSplitterAddress: mockFeeSplitterAddr,
        transactionHash: mockTxHash,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save fairlaunch to database');
      }

      // Clear draft after successful deployment
      localStorage.removeItem(STORAGE_KEY);

      return {
        success: true,
        fairlaunchAddress: mockFairlaunchAddr,
        vestingAddress: mockVestingAddr,
        transactionHash: mockTxHash,
        fairlaunchId: saveResult.fairlaunchId,
      };
    } catch (error: any) {
      console.error('Deployment error:', error);
      return {
        success: false,
        error: error.message || 'Deployment failed',
      };
    } finally {
      setIsDeploying(false);
    }
  };

  // Get network symbol
  const getNetworkSymbol = (network: string) => {
    if (network.includes('bsc') || network === 'bnb') return 'BNB';
    if (network === 'solana') return 'SOL';
    return 'ETH';
  };

  const paymentSymbol = getNetworkSymbol(wizardData.network);

  // Get explorer URL
  const getExplorerUrl = (network: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      sepolia: 'https://sepolia.etherscan.io',
      bnb: 'https://bscscan.com',
      bsc_testnet: 'https://testnet.bscscan.com',
      base: 'https://basescan.org',
      base_sepolia: 'https://sepolia.basescan.org',
    };
    return explorers[network] || 'https://etherscan.io';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Fairlaunch 🚀</h1>
          <p className="text-gray-400">
            Launch your token in 7 steps. No KYC, no admin review - instant deployment with auto
            security checks.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            {FAIRLAUNCH_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    // Allow navigation to completed steps or current step
                    if (completedSteps.includes(step.id) || step.id <= currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={step.id > currentStep && !completedSteps.includes(step.id)}
                  className={`flex flex-col items-center transition ${
                    step.id === currentStep
                      ? 'opacity-100 scale-110'
                      : completedSteps.includes(step.id)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                      currentStep === step.id
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                        : completedSteps.includes(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? '✓' : step.id}
                  </div>
                  <span className="text-xs text-gray-300 mt-2 hidden md:block text-center max-w-[100px]">
                    {step.title}
                  </span>
                </button>
                {index < FAIRLAUNCH_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition ${
                      completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 mb-6 min-h-[600px]">
          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              {FAIRLAUNCH_STEPS[currentStep - 1]?.title || 'Step'}
            </h2>
            <p className="text-gray-400 text-sm">
              {FAIRLAUNCH_STEPS[currentStep - 1]?.description || ''}
            </p>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <NetworkTokenStep
              data={{
                network: wizardData.network,
                tokenMode: wizardData.tokenMode,
                tokenAddress: wizardData.tokenAddress,
                tokenSource: wizardData.tokenSource,
                securityScanStatus: wizardData.securityScanStatus,
                securityBadges: wizardData.securityBadges,
              }}
              onChange={updateWizardData}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <ProjectInfoStep
              data={{
                projectName: wizardData.projectName,
                description: wizardData.description,
                logoUrl: wizardData.logoUrl,
                socialLinks: wizardData.socialLinks,
              }}
              onChange={updateWizardData}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <SaleParamsStep
              data={{
                tokensForSale: wizardData.tokensForSale,
                softcap: wizardData.softcap,
                startTime: wizardData.startTime,
                endTime: wizardData.endTime,
                minContribution: wizardData.minContribution,
                maxContribution: wizardData.maxContribution,
                dexPlatform: wizardData.dexPlatform,
                listingPremiumBps: wizardData.listingPremiumBps,
              }}
              network={wizardData.network}
              paymentSymbol={paymentSymbol}
              onChange={updateWizardData}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <LiquidityPlanStep
              data={{
                liquidityPercent: wizardData.liquidityPercent,
                lpLockMonths: wizardData.lpLockMonths,
              }}
              saleData={{
                tokensForSale: wizardData.tokensForSale,
                softcap: wizardData.softcap,
                endTime: wizardData.endTime,
              }}
              paymentSymbol={paymentSymbol}
              onChange={updateWizardData}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <TeamVestingStep
              data={{
                teamAllocation: wizardData.teamAllocation,
                vestingBeneficiary: wizardData.vestingBeneficiary,
                vestingSchedule: wizardData.vestingSchedule,
              }}
              walletAddress={walletAddress}
              onChange={updateWizardData}
              errors={errors}
            />
          )}

          {currentStep === 6 && (
            <ReviewStep
              wizardData={wizardData}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentStep === 7 && (
            <DeployStep
              wizardData={wizardData}
              onDeploy={handleDeploy}
              explorerUrl={getExplorerUrl(wizardData.network)}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={isDeploying}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 6 ? (
                isDeploying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Deploy Now
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Validation Errors (global) */}
        {Object.keys(errors).length > 0 && currentStep < 7 && (
          <div className="mt-4 bg-red-950/30 border border-red-800/40 rounded-lg p-4">
            <p className="text-red-300 font-medium text-sm mb-2">
              ⚠️ Please fix the following errors:
            </p>
            <ul className="text-red-300/80 text-sm space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
