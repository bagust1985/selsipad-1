'use client';

import * as React from 'react';
import { useNetwork } from 'wagmi';
import { type Address } from 'viem';
import { useFairlaunchDeploy, type DeploymentParams } from '@/hooks/useFairlaunchDeploy';
import { prepareFairlaunchDeployment } from '@/actions/fairlaunch/prepare-fairlaunch-deployment';

export interface FairlaunchDeploymentOrchestratorProps {
  wizardData: any;
  onDeploymentStart?: () => void;
  onDeploymentComplete?: (result: {
    success: boolean;
    fairlaunchAddress?: Address;
    vestingAddress?: Address;
    transactionHash?: `0x${string}`;
    error?: string;
  }) => void;
  children: (deployFn: () => Promise<any>) => React.ReactNode;
}

/**
 * Orchestrates real blockchain deployment via wagmi
 * Bridges the gap between wizard callback pattern and wagmi hooks
 */
export function FairlaunchDeploymentOrchestrator({
  wizardData,
  onDeploymentStart,
  onDeploymentComplete,
  children,
}: FairlaunchDeploymentOrchestratorProps) {
  const { chain } = useNetwork();
  const chainId = chain?.id || 97; // Default to BSC Testnet
  
  const { deploy, isLoading, result, transactionHash } = useFairlaunchDeploy(chainId);

  // Watch for deployment result
  React.useEffect(() => {
    if (result && onDeploymentComplete) {
      onDeploymentComplete({
        success: result.success,
        fairlaunchAddress: result.fairlaunchAddress,
        vestingAddress: result.vestingAddress,
        transactionHash: result.transactionHash,
        error: result.error,
      });
    }
  }, [result, onDeploymentComplete]);

  /**
   * Main deployment function that follows wizard pattern
   */
  const handleDeploy = async (): Promise<{
    success: boolean;
    fairlaunchAddress?: string;
    vestingAddress?: string;
    transactionHash?: string;
    error?: string;
  }> => {
    try {
      onDeploymentStart?.();

      // Step 1: Prepare deployment parameters via backend
      const prepareResult = await prepareFairlaunchDeployment({
        network: wizardData.network,
        tokenAddress: wizardData.tokenAddress as Address,
        tokenDecimals: wizardData.tokenDecimals,
        tokensForSale: wizardData.tokensForSale,
        softcap: wizardData.softcap,
        startTime: wizardData.startTime,
        endTime: wizardData.endTime,
        minContribution: wizardData.minContribution,
        maxContribution: wizardData.maxContribution,
        dexPlatform: wizardData.dexPlatform,
        listingPremiumBps: wizardData.listingPremiumBps || 1000,
        liquidityPercent: wizardData.liquidityPercent,
        lpLockMonths: wizardData.lpLockMonths,
        teamAllocation: wizardData.teamAllocation || 0,
        vestingBeneficiary: (wizardData.vestingBeneficiary as Address) || wizardData.account,
        vestingSchedule: wizardData.vestingSchedule || [],
        userAddress: wizardData.account as Address,
      });

      if (!prepareResult.success || !prepareResult.params) {
        throw new Error(prepareResult.error || 'Failed to prepare deployment parameters');
      }

      // Step 2: Deploy via wagmi
      const deploymentParams: DeploymentParams = {
        projectToken: prepareResult.params.projectToken,
        paymentToken: prepareResult.params.paymentToken,
        softcap: prepareResult.params.softcap,
        tokensForSale: prepareResult.params.tokensForSale,
        minContribution: prepareResult.params.minContribution,
        maxContribution: prepareResult.params.maxContribution,
        startTime: prepareResult.params.startTime,
        endTime: prepareResult.params.endTime,
        projectOwner: prepareResult.params.projectOwner,
        listingPremiumBps: prepareResult.params.listingPremiumBps,
        vestingBeneficiary: prepareResult.params.vestingParams.beneficiary,
        vestingStartTime: prepareResult.params.vestingParams.startTime,
        vestingDurations: prepareResult.params.vestingParams.durations,
        vestingAmounts: prepareResult.params.vestingParams.amounts,
        lockMonths: prepareResult.params.lpPlan.lockMonths,
        liquidityPercent: prepareResult.params.lpPlan.liquidityPercent,
        dexId: prepareResult.params.lpPlan.dexId,
      };

      const deployResult = await deploy(deploymentParams);

      // Note: The actual deployment happens asynchronously
      // Result will be picked up by useEffect above and passed to onDeploymentComplete
      
      return {
        success: true,
        // These will be populated once transaction completes
      };
    } catch (error: any) {
      console.error('[FairlaunchDeploymentOrchestrator] Error:', error);
      return {
        success: false,
        error: error.message || 'Deployment failed',
      };
    }
  };

  return <>{children(handleDeploy)}</>;
}
