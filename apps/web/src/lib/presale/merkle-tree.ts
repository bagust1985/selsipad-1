/**
 * Merkle Tree Utility for Presale Vesting
 *
 * Generates Merkle trees and proofs for the MerkleVesting contract.
 * Each leaf is: keccak256(abi.encodePacked(address, uint256))
 * where address is the contributor and uint256 is their total token allocation.
 */

import { ethers } from 'ethers';

export interface MerkleLeaf {
  address: string;
  allocation: bigint; // Token allocation in wei
}

export interface MerkleTreeResult {
  root: string;
  leaves: MerkleLeaf[];
  totalAllocation: bigint;
  proofs: Record<string, string[]>; // address → proof
}

/**
 * Hash a leaf node: keccak256(abi.encodePacked(address, allocation))
 */
function hashLeaf(address: string, allocation: bigint): string {
  return ethers.solidityPackedKeccak256(['address', 'uint256'], [address, allocation]);
}

/**
 * Hash a pair of nodes (sorted to ensure deterministic ordering)
 */
function hashPair(a: string, b: string): string {
  const sorted = [a, b].sort();
  return ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [sorted[0]!, sorted[1]!]);
}

/**
 * Build a Merkle tree from leaf hashes.
 * Returns all layers (bottom-up), where the last layer is the root.
 */
function buildTree(leafHashes: string[]): string[][] {
  if (leafHashes.length === 0) {
    return [['0x' + '0'.repeat(64)]];
  }

  // If odd number of leaves, duplicate last
  const leaves = [...leafHashes];
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]!);
  }

  const layers: string[][] = [leaves];
  let currentLayer = leaves;

  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      nextLayer.push(hashPair(currentLayer[i]!, currentLayer[i + 1]!));
    }
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  return layers;
}

/**
 * Generate Merkle proof for a specific leaf index.
 */
function getProof(layers: string[][], leafIndex: number): string[] {
  const proof: string[] = [];
  let index = leafIndex;

  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i]!;
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]!);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Generate a complete Merkle tree from contributor allocations.
 *
 * @param contributions - List of { address, allocation } pairs
 * @returns MerkleTreeResult with root, leaves, totalAllocation, and proofs
 */
export function generateMerkleTree(contributions: MerkleLeaf[]): MerkleTreeResult {
  if (contributions.length === 0) {
    return {
      root: '0x' + '0'.repeat(64),
      leaves: [],
      totalAllocation: 0n,
      proofs: {},
    };
  }

  // Deduplicate by address (aggregate allocations)
  const allocationMap = new Map<string, bigint>();
  for (const c of contributions) {
    const addr = c.address.toLowerCase();
    allocationMap.set(addr, (allocationMap.get(addr) || 0n) + c.allocation);
  }

  // Build sorted leaf array (deterministic ordering)
  const leaves: MerkleLeaf[] = Array.from(allocationMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([address, allocation]) => ({
      address: ethers.getAddress(address) as string, // Checksum
      allocation,
    }));

  // Hash all leaves
  const leafHashes = leaves.map((l) => hashLeaf(l.address, l.allocation));

  // Build tree
  const layers = buildTree(leafHashes);
  const root = layers[layers.length - 1]![0]!;

  // Generate proofs for each address
  const proofs: Record<string, string[]> = {};
  for (let i = 0; i < leaves.length; i++) {
    proofs[leaves[i]!.address.toLowerCase()] = getProof(layers, i);
  }

  const totalAllocation = leaves.reduce((sum, l) => sum + l.allocation, 0n);

  return {
    root,
    leaves,
    totalAllocation,
    proofs,
  };
}

/**
 * Calculate token allocations for contributors based on their contribution amounts.
 *
 * @param contributions - Array of { address, contributionAmount } (in ETH/BNB wei)
 * @param totalTokensForSale - Total tokens allocated for the presale (in token wei)
 * @param totalRaised - Total raised in the presale (in ETH/BNB wei)
 * @returns MerkleLeaf[] with calculated token allocations
 */
export function calculateAllocations(
  contributions: { address: string; contributionAmount: bigint }[],
  totalTokensForSale: bigint,
  totalRaised: bigint
): MerkleLeaf[] {
  if (totalRaised === 0n) return [];

  return contributions.map((c) => ({
    address: c.address,
    allocation: (c.contributionAmount * totalTokensForSale) / totalRaised,
  }));
}
