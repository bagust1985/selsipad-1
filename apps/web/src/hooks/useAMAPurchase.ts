/**
 * useAMAPurchase Hook
 * 
 * Handles AMA request payment via AMAPurchaseRegistry smart contract
 * Uses Chainlink oracle for real-time BNB/USD pricing
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useReadContract } from 'wagmi';
import { parseEther, formatEther, keccak256, encodePacked } from 'viem';
import { submitAMARequest } from '@/lib/data/ama';

// Contract address (BSC Testnet - deployed Feb 4, 2026)
const AMA_PURCHASE_REGISTRY_ADDRESS = '0x16224B0F87413416c4084603F0B1A6015739B7Bd' as const;

// ABI for AMAPurchaseRegistry
const AMA_PURCHASE_REGISTRY_ABI = [
  {
    inputs: [],
    name: 'AMA_FEE_USD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRequiredBNB',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'requestId', type: 'bytes32' }],
    name: 'requestAMA',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'requestId', type: 'bytes32' }],
    name: 'requestExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOraclePrice',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface AMAFormData {
  projectId: string;
  projectName: string;
  scheduledAt: string;
  description: string;
}

interface UseAMAPurchaseReturn {
  // State
  requiredBNB: string;
  feeUSD: number;
  bnbPrice: number;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  
  // Actions
  submitAMA: (formData: AMAFormData) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  refreshPrice: () => void;
}

export function useAMAPurchase(): UseAMAPurchaseReturn {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [requiredBNB, setRequiredBNB] = useState<string>('0');
  const [bnbPrice, setBnbPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const feeUSD = 100; // Fixed $100 fee
  
  // Read required BNB from contract
  const { data: requiredBNBWei, refetch: refetchPrice } = useReadContract({
    address: AMA_PURCHASE_REGISTRY_ADDRESS,
    abi: AMA_PURCHASE_REGISTRY_ABI,
    functionName: 'getRequiredBNB',
    query: {
      enabled: !!address,
    },
  });
  
  // Read oracle price
  const { data: oraclePrice } = useReadContract({
    address: AMA_PURCHASE_REGISTRY_ADDRESS,
    abi: AMA_PURCHASE_REGISTRY_ABI,
    functionName: 'getOraclePrice',
    query: {
      enabled: !!address,
    },
  });
  
  // Update state when contract data changes
  useEffect(() => {
    if (requiredBNBWei) {
      const bnbAmount = formatEther(requiredBNBWei);
      setRequiredBNB(bnbAmount);
      setIsLoading(false);
    } else {
      // Fallback: Estimate based on $600/BNB
      setRequiredBNB((feeUSD / 600).toFixed(6));
      setIsLoading(false);
    }
  }, [requiredBNBWei]);
  
  useEffect(() => {
    if (oraclePrice) {
      // Oracle price has 8 decimals
      setBnbPrice(Number(oraclePrice) / 1e8);
    }
  }, [oraclePrice]);
  
  /**
   * Generate a unique request ID from form data
   */
  const generateRequestId = (formData: AMAFormData, walletAddress: string): `0x${string}` => {
    const packed = encodePacked(
      ['address', 'string', 'string', 'uint256'],
      [walletAddress as `0x${string}`, formData.projectId, formData.scheduledAt, BigInt(Date.now())]
    );
    return keccak256(packed);
  };
  
  /**
   * Submit AMA request with payment
   */
  const submitAMA = async (formData: AMAFormData): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!walletClient || !address || !publicClient || !chain) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    try {
      setIsPurchasing(true);
      setError(null);
      
      // Generate unique request ID
      const requestId = generateRequestId(formData, address);
      
      // Get current required BNB
      let paymentAmount: bigint;
      if (requiredBNBWei) {
        paymentAmount = requiredBNBWei;
      } else {
        // Fallback calculation
        paymentAmount = parseEther((feeUSD / 600).toFixed(6));
      }
      
      // Add 1% buffer for price fluctuation
      const paymentWithBuffer = (paymentAmount * BigInt(101)) / BigInt(100);
      
      console.log('[AMA] Submitting request:', {
        requestId,
        paymentAmount: formatEther(paymentWithBuffer),
        formData,
      });
      
      // Execute contract transaction
      const hash = await walletClient.writeContract({
        address: AMA_PURCHASE_REGISTRY_ADDRESS,
        abi: AMA_PURCHASE_REGISTRY_ABI,
        functionName: 'requestAMA',
        args: [requestId],
        value: paymentWithBuffer,
      });
      
      console.log('[AMA] Transaction sent:', hash);
      
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        console.log('[AMA] Transaction confirmed, saving to database...');
        
        // Save to database via server action
        const result = await submitAMARequest({
          projectId: formData.projectId,
          projectName: formData.projectName,
          scheduledAt: formData.scheduledAt,
          description: formData.description,
          paymentTxHash: hash,
          paymentAmountBnb: formatEther(paymentWithBuffer),
          requestIdBytes32: requestId,
          chainId: chain.id,
        });
        
        console.log('[AMA] Database save result:', result);
        
        if (!result.success) {
          console.warn('[AMA] Database save failed:', result.error);
          // Don't fail - payment succeeded on-chain
        }
        
        return { success: true, txHash: hash };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (err: any) {
      console.error('[AMA] Purchase error:', err);
      const errorMsg = err.shortMessage || err.message || 'Failed to submit AMA request';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const refreshPrice = () => {
    refetchPrice();
  };
  
  return {
    requiredBNB,
    feeUSD,
    bnbPrice,
    isLoading,
    isPurchasing,
    error,
    submitAMA,
    refreshPrice,
  };
}
