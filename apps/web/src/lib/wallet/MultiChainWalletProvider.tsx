'use client';

import { type ReactNode } from 'react';
import { SolanaWalletProvider } from './WalletProvider';
import { EVMWalletProvider } from './EVMWalletProvider';

interface MultiChainWalletProviderProps {
  children: ReactNode;
}

/**
 * Multi-Chain Wallet Provider
 *
 * Combines both Solana and EVM wallet providers
 * Allows users to connect wallets from both ecosystems
 *
 * Supported Chains:
 * - Solana (Phantom, Solflare, etc.)
 * - EVM (MetaMask, WalletConnect, Coinbase, Trust, etc.)
 *   - Ethereum Mainnet
 *   - BSC (Binance Smart Chain)
 *   - Polygon
 *   - Arbitrum
 *   - Optimism
 *   - Base
 */
export function MultiChainWalletProvider({ children }: MultiChainWalletProviderProps) {
  return (
    <EVMWalletProvider>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </EVMWalletProvider>
  );
}
