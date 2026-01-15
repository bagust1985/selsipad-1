'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, type ReactNode } from 'react';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

/**
 * Solana Wallet Provider
 *
 * Provides wallet connection functionality for Solana wallets
 * Supports: Phantom, Solflare
 *
 * Usage:
 * Wrap your app with this provider in the root layout
 */
export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Determine network from environment or default to Devnet
  const network =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;

  // Get RPC endpoint
  const endpoint = useMemo(() => {
    // Use custom RPC if provided, otherwise use public cluster
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }

    // Use devnet RPC if in devnet mode
    if (network === WalletAdapterNetwork.Devnet && process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL;
    }

    // Fallback to public cluster
    return clusterApiUrl(network);
  }, [network]);

  // Initialize wallet adapters
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
