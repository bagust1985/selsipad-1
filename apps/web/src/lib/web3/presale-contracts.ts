/**
 * Presale Smart Contract ABIs and Addresses
 *
 * IMPORTANT: These ABIs are extracted from compiled Hardhat artifacts.
 * Only essential functions are included to reduce bundle size.
 */

// Minimal ABI for PresaleRound contract
export const PRESALE_ROUND_ABI = [
  // View functions
  {
    name: 'status',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'totalRaised',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'softCap',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'hardCap',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'startTime',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'endTime',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'contributions',
    type: 'function',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'projectOwner',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'vestingVault',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'tgeTimestamp',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'minContribution',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'maxContribution',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },

  // Write functions
  {
    name: 'contribute',
    type: 'function',
    inputs: [{ type: 'uint256' }, { type: 'address' }],
    outputs: [],
    stateMutability: 'payable',
  },
  { name: 'claimRefund', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    name: 'finalizeSuccess',
    type: 'function',
    inputs: [{ type: 'bytes32' }, { type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'finalizeSuccessEscrow',
    type: 'function',
    inputs: [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'finalizeFailed',
    type: 'function',
    inputs: [{ type: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // View: escrow finalization state
  {
    name: 'burnedAmount',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'bnbDistributed',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

// Minimal ABI for MerkleVesting contract
export const MERKLE_VESTING_ABI = [
  // View functions
  {
    name: 'tgeUnlockBps',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'cliffDuration',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'vestingDuration',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'tgeTimestamp',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'claimed',
    type: 'function',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getClaimable',
    type: 'function',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'scheduleSalt',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    name: 'token',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },

  // Write functions
  {
    name: 'claim',
    type: 'function',
    inputs: [{ type: 'uint256' }, { type: 'bytes32[]' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

// Contract addresses by network
export const CONTRACTS = {
  bsc_testnet: {
    chainId: 97,
    factory: '0xb0ee30606d4fA0446d596F1a6523E0cc75C361ff' as `0x${string}`,
    feeSplitter: '0x9CE09C9e370a3974f4D0c55D6a15C4d9F186d161' as `0x${string}`,
    timelockExecutor: '0xdce552fa663879e2453f2259ced9f06a0c4a6a2d' as `0x${string}`,
    // Previous v2.2: factory 0xf3935d541A4F8fBED26c39f7E43625CE7b4d11E6, feeSplitter 0xa91e51F043Bc455dAae1f74Ad1991Df4C711b5ED
  },
} as const;

// Status enum matching on-chain
export enum PresaleStatus {
  UPCOMING = 0,
  ACTIVE = 1,
  ENDED = 2,
  FINALIZED_SUCCESS = 3,
  FINALIZED_FAILED = 4,
  CANCELLED = 5,
}

// Status labels for UI
export const STATUS_LABELS: Record<PresaleStatus, string> = {
  [PresaleStatus.UPCOMING]: 'Upcoming',
  [PresaleStatus.ACTIVE]: 'Active',
  [PresaleStatus.ENDED]: 'Ended',
  [PresaleStatus.FINALIZED_SUCCESS]: 'Successful',
  [PresaleStatus.FINALIZED_FAILED]: 'Failed',
  [PresaleStatus.CANCELLED]: 'Cancelled',
};

// Status colors for badges
export const STATUS_COLORS: Record<PresaleStatus, string> = {
  [PresaleStatus.UPCOMING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [PresaleStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [PresaleStatus.ENDED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [PresaleStatus.FINALIZED_SUCCESS]:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [PresaleStatus.FINALIZED_FAILED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [PresaleStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

// Aliases used by admin pages
export const PresaleStatusLabel = STATUS_LABELS;
export const PresaleStatusColor = STATUS_COLORS;
