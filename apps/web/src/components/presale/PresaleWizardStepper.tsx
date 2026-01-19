'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface PresaleWizardStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
  className?: string;
}

const WIZARD_STEPS: Step[] = [
  {
    number: 1,
    title: 'Basic Info',
    description: 'Project details and network',
  },
  {
    number: 2,
    title: 'Sale Params',
    description: 'Pricing and amounts',
  },
  {
    number: 3,
    title: 'Anti-Bot',
    description: 'Protection settings',
  },
  {
    number: 4,
    title: 'Investor Vesting',
    description: 'Buyer unlock schedule',
  },
  {
    number: 5,
    title: 'Team Vesting',
    description: 'Team unlock schedule',
  },
  {
    number: 6,
    title: 'LP Lock',
    description: 'Liquidity protection',
  },
  {
    number: 7,
    title: 'Fees',
    description: 'Platform fees',
  },
  {
    number: 8,
    title: 'Review',
    description: 'Verify all details',
  },
  {
    number: 9,
    title: 'Submit',
    description: 'Compliance check',
  },
];

export function PresaleWizardStepper({
  currentStep,
  totalSteps = 9,
  onStepClick,
  completedSteps = [],
  className = '',
}: PresaleWizardStepperProps) {
  const progress = (currentStep / totalSteps) * 100;

  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepNumber) || stepNumber < currentStep) {
      return 'completed';
    }
    if (stepNumber === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && (completedSteps.includes(stepNumber) || stepNumber <= currentStep)) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-purple-400 font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper - Horizontal */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connection Lines */}
          <div
            className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800"
            style={{ left: '2.5rem', right: '2.5rem' }}
          />

          <div className="relative flex justify-between">
            {WIZARD_STEPS.map((step) => {
              const status = getStepStatus(step.number);
              const isClickable =
                onStepClick && (completedSteps.includes(step.number) || step.number <= currentStep);

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / totalSteps}%` }}
                >
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isClickable}
                    className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all
                      ${status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white' : ''}
                      ${status === 'current' ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white ring-4 ring-purple-500/20' : ''}
                      ${status === 'upcoming' ? 'bg-gray-800 border-gray-700 text-gray-500' : ''}
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}
                  >
                    {status === 'completed' ? <Check className="w-5 h-5" /> : step.number}
                  </button>

                  {/* Step Info */}
                  <div className="mt-3 text-center">
                    <div
                      className={`text-xs font-medium ${
                        status === 'current'
                          ? 'text-white'
                          : status === 'completed'
                            ? 'text-green-400'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 hidden xl:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Stepper - Vertical Compact */}
      <div className="lg:hidden">
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-9 gap-1">
            {WIZARD_STEPS.map((step) => {
              const status = getStepStatus(step.number);
              const isClickable =
                onStepClick && (completedSteps.includes(step.number) || step.number <= currentStep);

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isClickable}
                  title={`${step.number}. ${step.title}`}
                  className={`
                    aspect-square rounded-md flex items-center justify-center text-xs font-semibold transition-all
                    ${status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : ''}
                    ${status === 'current' ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white ring-2 ring-purple-500' : ''}
                    ${status === 'upcoming' ? 'bg-gray-800 text-gray-600' : ''}
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                  `}
                >
                  {status === 'completed' ? <Check className="w-3 h-3" /> : step.number}
                </button>
              );
            })}
          </div>

          {/* Current Step Info */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">Current Step:</div>
            <div className="text-white font-semibold mt-1">
              {currentStep}. {WIZARD_STEPS[currentStep - 1]?.title}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {WIZARD_STEPS[currentStep - 1]?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
