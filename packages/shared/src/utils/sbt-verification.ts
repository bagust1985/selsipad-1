/**
 * FASE 8: SBT Verification Utilities
 * Verifies ownership of Soulbound Tokens on Solana and EVM chains
 */

import { ChainType } from '../types/fase8';

// Simple in-memory cache for demo purposes (In production use Redis)
// Key: `${chain}:${wallet}:${collection_id}` -> Value: timestamp
const verificationCache = new Map<string, number>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface VerificationResult {
  isValid: boolean;
  error?: string;
  cached?: boolean;
}

/**
 * Verify SBT Ownership
 * @param chain 'solana' | 'evm'
 * @param walletAddress User's wallet address
 * @param collectionId Mint address (Solana) or Contract address (EVM)
 */
export async function verifySbtOwnership(
  chain: ChainType,
  walletAddress: string,
  collectionId: string
): Promise<VerificationResult> {
  const cacheKey = `${chain}:${walletAddress}:${collectionId}`;
  const now = Date.now();

  // Check cache
  if (verificationCache.has(cacheKey)) {
    const timestamp = verificationCache.get(cacheKey)!;
    if (now - timestamp < CACHE_TTL_MS) {
      return { isValid: true, cached: true };
    } else {
      verificationCache.delete(cacheKey);
    }
  }

  try {
    let isValid = false;

    if (chain === 'solana') {
      isValid = await verifySolanaSbt(walletAddress, collectionId);
    } else if (chain === 'evm') {
      isValid = await verifyEvmSbt(walletAddress, collectionId);
    } else {
      return { isValid: false, error: 'Unsupported chain' };
    }

    if (isValid) {
      verificationCache.set(cacheKey, now);
    }

    return { isValid };
  } catch (error) {
    console.error('SBT Verification Error:', error);
    return { isValid: false, error: 'Verification failed' };
  }
}

/**
 * Mock Solana SBT Verification
 * TODO: Replace with actual RPC call (getParsedTokenAccountsByOwner)
 */
async function verifySolanaSbt(wallet: string, mint: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock logic: Valid if wallet starts with "valid_"
  // In production: Call Helius/Alchemy RPC
  return wallet.startsWith('valid_');
}

/**
 * Mock EVM SBT Verification
 * TODO: Replace with actual RPC call (ERC721.balanceOf)
 */
async function verifyEvmSbt(wallet: string, contract: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock logic: Valid if wallet starts with "0xvalid"
  return wallet.toLowerCase().startsWith('0xvalid');
}

/**
 * Clear Verification Cache (Admin tool)
 */
export function clearVerificationCache() {
  verificationCache.clear();
}
