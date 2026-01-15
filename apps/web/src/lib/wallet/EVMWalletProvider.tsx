'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, bsc, arbitrum, optimism, base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

interface EVMWalletProviderProps {
  children: ReactNode;
}

// Configure chains
const chains = [bsc, polygon, mainnet, arbitrum, optimism, base] as const;

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'selsipad-default-id';

// Manually configure connectors (avoiding all optional wagmi connectors)
const wagmiConfig = createConfig({
  chains,
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: 'SELSIPAD' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary-main))',
    '--w3m-border-radius-master': '0.375rem',
  },
});

// Create query client
const queryClient = new QueryClient();

/**
 * EVM Wallet Provider (Web3Modal - Simplified)
 *
 * Manually configured connectors to avoid optional dependencies:
 * - WalletConnect (for mobile wallets)
 * - Injected (MetaMask, Trust, Brave, etc.)
 * - Coinbase Wallet
 *
 * Uses Web3Modal v3 for production-ready wallet integration
 */
export function EVMWalletProvider({ children }: EVMWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
