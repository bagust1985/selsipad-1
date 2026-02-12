// FairlaunchFactory Contract Configuration
// Auto-generated from artifacts

import { Address } from 'viem';

/**
 * FairlaunchFactory addresses per network
 */
export const FAIRLAUNCH_FACTORY_ADDRESS: Record<number, Address> = {
  97: '0xa6dE6Ebd3E0ED5AcbE9c07B59C738C610821e175', // BSC Testnet - Pair Pre-Create Fix (Feb 12)
  11155111: '0x53850a56397379Da8572A6a47003bca88bB52A24', // Sepolia - V2 Router Fix (Feb 12)
  84532: '0xeEf8C1da1b94111237c419AB7C6cC30761f31572', // Base Sepolia - Full Infra Deploy (Feb 12)
} as const;

/**
 * Simple Token Factory addresses per network
 */
export const SIMPLE_TOKEN_FACTORY_ADDRESS: Record<number, Address> = {
  97: '0x28DBa6468e7e5AD805374244B5D528375fC4610A', // BSC Testnet
  11155111: '0x54Ce7D20d072BBbF0F8B58bf9210af763C72bD2b', // Sepolia (Feb 12 V2 Router Fix)
  84532: '0x99E428b66aEA77833C8c84375758fCEa73c998C7', // Base Sepolia (Feb 12)
} as const;

/**
 * FeeSplitter addresses per network
 */
export const FEE_SPLITTER_ADDRESS: Record<number, Address> = {
  97: '0x3301b82B4559F1607DA83FA460DC9820CbE1344e', // BSC Testnet
  11155111: '0x5f3cf3D4fD540EFb2eEDA43921292fD08608518D', // Sepolia (Feb 12 V2 Router Fix)
  84532: '0x069b5487A3CAbD868B498c34DA2d7cCfc2D3Dc4C', // Base Sepolia (Feb 12)
} as const;

/**
 * Deployment fee in wei per network
 */
export const DEPLOYMENT_FEE: Record<number, bigint> = {
  97: BigInt('200000000000000000'), // 0.2 BNB (BSC Testnet)
  11155111: BigInt('10000000000000000'), // 0.01 ETH (Sepolia)
  84532: BigInt('10000000000000000'), // 0.01 ETH (Base Sepolia)
} as const;

/**
 * Token creation fee in wei per network
 */
export const TOKEN_CREATION_FEE: Record<number, bigint> = {
  97: BigInt('200000000000000000'), // 0.2 BNB (BSC Testnet)
  11155111: BigInt('10000000000000000'), // 0.01 ETH (Sepolia)
  84532: BigInt('10000000000000000'), // 0.01 ETH (Base Sepolia)
} as const;

/**
 * Fairlaunch Factory ABI (only functions we need)
 */
export const FAIRLAUNCH_FACTORY_ABI = [
  {
    inputs: [],
    name: 'DEPLOYMENT_FEE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'projectToken', type: 'address' },
          { internalType: 'address', name: 'paymentToken', type: 'address' },
          { internalType: 'uint256', name: 'softcap', type: 'uint256' },
          { internalType: 'uint256', name: 'tokensForSale', type: 'uint256' },
          { internalType: 'uint256', name: 'minContribution', type: 'uint256' },
          { internalType: 'uint256', name: 'maxContribution', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'address', name: 'projectOwner', type: 'address' },
          { internalType: 'uint16', name: 'listingPremiumBps', type: 'uint16' },
        ],
        internalType: 'struct FairlaunchFactory.CreateFairlaunchParams',
        name: 'params',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'beneficiary', type: 'address' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256[]', name: 'durations', type: 'uint256[]' },
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
        ],
        internalType: 'struct FairlaunchFactory.TeamVestingParams',
        name: 'vestingParams',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'lockMonths', type: 'uint256' },
          { internalType: 'uint256', name: 'liquidityPercent', type: 'uint256' },
          { internalType: 'bytes32', name: 'dexId', type: 'bytes32' },
        ],
        internalType: 'struct FairlaunchFactory.LPLockPlan',
        name: 'lpPlan',
        type: 'tuple',
      },
    ],
    name: 'createFairlaunch',
    outputs: [
      { internalType: 'address', name: 'fairlaunch', type: 'address' },
      { internalType: 'address', name: 'vesting', type: 'address' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'fairlaunchId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'fairlaunch', type: 'address' },
      { indexed: true, internalType: 'address', name: 'vesting', type: 'address' },
      { indexed: false, internalType: 'address', name: 'projectToken', type: 'address' },
    ],
    name: 'FairlaunchCreated',
    type: 'event',
  },
] as const;
