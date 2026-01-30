import * as React from 'react';
import { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, decodeEventLog, type Address } from 'viem';
import {
  FAIRLAUNCH_FACTORY_ADDRESS,
  FAIRLAUNCH_FACTORY_ABI,
  DEPLOYMENT_FEE,
} from '@/contracts/FairlaunchFactory';

export interface DeploymentParams {
  // CreateFairlaunchParams
  projectToken: Address;
  paymentToken: Address; // address(0) for native
  softcap: bigint;
  tokensForSale: bigint;
  minContribution: bigint;
  maxContribution: bigint;
  startTime: bigint;
  endTime: bigint;
  projectOwner: Address;
  listingPremiumBps: number;
  
  // TeamVestingParams
  vestingBeneficiary: Address;
  vestingStartTime: bigint;
  vestingDurations: bigint[];
  vestingAmounts: bigint[];
  
  // LPLockPlan
  lockMonths: bigint;
  liquidityPercent: bigint;
  dexId: `0x${string}`;
}

export interface DeploymentResult {
  success: boolean;
  fairlaunchAddress?: Address;
  vestingAddress?: Address;
  transactionHash?: `0x${string}`;
  fairlaunchId?: bigint;
  error?: string;
}

/**
 * Hook for deploying Fairlaunch contract via FairlaunchFactory
 */
export function useFairlaunchDeploy(chainId: number) {
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  
  const factoryAddress = FAIRLAUNCH_FACTORY_ADDRESS[chainId];
  const deploymentFee = DEPLOYMENT_FEE[chainId];

  const { write, data: txData, isLoading: isWriting, error: writeError } = useContractWrite({
    address: factoryAddress,
    abi: FAIRLAUNCH_FACTORY_ABI,
    functionName: 'createFairlaunch',
  });

  const {
    data: receipt,
    isLoading: isWaiting,
    error: waitError,
  } = useWaitForTransaction({
    hash: txData?.hash,
  });

  /**
   * Deploy fairlaunch with prepared parameters
   */
  const deploy = async (params: DeploymentParams): Promise<DeploymentResult> => {
    try {
      // Prepare contract arguments
      const createParams = {
        projectToken: params.projectToken,
        paymentToken: params.paymentToken,
        softcap: params.softcap,
        tokensForSale: params.tokensForSale,
        minContribution: params.minContribution,
        maxContribution: params.maxContribution,
        startTime: params.startTime,
        endTime: params.endTime,
        projectOwner: params.projectOwner,
        listingPremiumBps: params.listingPremiumBps,
      };

      const vestingParams = {
        beneficiary: params.vestingBeneficiary,
        startTime: params.vestingStartTime,
        durations: params.vestingDurations,
        amounts: params.vestingAmounts,
      };

      const lpPlan = {
        lockMonths: params.lockMonths,
        liquidityPercent: params.liquidityPercent,
        dexId: params.dexId,
      };

      // Call createFairlaunch with deployment fee
      write?.({
        args: [createParams, vestingParams, lpPlan],
        value: deploymentFee,
      });

      // Wait for transaction to be written
      // Note: actual parsing happens in useEffect below
      return {
        success: false, // Will be updated when receipt arrives
      };
    } catch (error: any) {
      const result: DeploymentResult = {
        success: false,
        error: error.message || 'Deployment failed',
      };
      setDeploymentResult(result);
      return result;
    }
  };

  // Parse transaction receipt when available
  React.useEffect(() => {
    if (receipt && receipt.logs) {
      try {
        // Find FairlaunchCreated event
        const fairlaunchCreatedLog = receipt.logs.find((log) => {
          try {
            const decoded = decodeEventLog({
              abi: FAIRLAUNCH_FACTORY_ABI,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'FairlaunchCreated';
          } catch {
            return false;
          }
        });

        if (fairlaunchCreatedLog) {
          const decoded = decodeEventLog({
            abi: FAIRLAUNCH_FACTORY_ABI,
            data: fairlaunchCreatedLog.data,
            topics: fairlaunchCreatedLog.topics,
          }) as {
            eventName: 'FairlaunchCreated';
            args: {
              fairlaunchId: bigint;
              fairlaunch: Address;
              vesting: Address;
              projectToken: Address;
            };
          };

          const result: DeploymentResult = {
            success: true,
            fairlaunchAddress: decoded.args.fairlaunch,
            vestingAddress: decoded.args.vesting,
            transactionHash: receipt.transactionHash,
            fairlaunchId: decoded.args.fairlaunchId,
          };

          setDeploymentResult(result);
        } else {
          setDeploymentResult({
            success: false,
            error: 'FairlaunchCreated event not found in transaction logs',
          });
        }
      } catch (error: any) {
        setDeploymentResult({
          success: false,
          error: `Failed to parse transaction logs: ${error.message}`,
        });
      }
    }
  }, [receipt]);

  // Handle errors
  React.useEffect(() => {
    if (writeError || waitError) {
      setDeploymentResult({
        success: false,
        error: writeError?.message || waitError?.message || 'Transaction failed',
      });
    }
  }, [writeError, waitError]);

  return {
    deploy,
    isLoading: isWriting || isWaiting,
    result: deploymentResult,
    transactionHash: txData?.hash,
    reset: () => setDeploymentResult(null),
  };
}

