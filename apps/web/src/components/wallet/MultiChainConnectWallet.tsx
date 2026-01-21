'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import {
  signMessageSolana,
  signMessageEVM,
  verifyAndCreateSession,
} from '@/lib/wallet/signMessage';
import { useRouter } from 'next/navigation';
import { NetworkSelector, useSelectedNetwork } from './NetworkSelector';

/**
 * Multi-Chain Connect Wallet Button with Auto Sign-In
 *
 * Automatically triggers sign-in flow after wallet connection
 * Includes network selector for choosing blockchain network
 */
export function MultiChainConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Solana
  const solanaWallet = useWallet();
  const { publicKey, signMessage: signMessageSol } = solanaWallet;

  // EVM
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Network selector
  const selectedNetwork = useSelectedNetwork();

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto sign-in when Solana wallet connects (only if not already authenticated)
  useEffect(() => {
    const checkAndAuth = async () => {
      if (publicKey && signMessageSol && !isAuthenticating) {
        // Check if already authenticated
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.authenticated) {
          console.log('[Wallet] Already authenticated, skipping signature');
          return;
        }

        // Not authenticated - trigger sign
        handleSolanaAuth();
      }
    };
    checkAndAuth();
  }, [publicKey]);

  // Auto sign-in when EVM wallet connects (only if not already authenticated)
  useEffect(() => {
    const checkAndAuth = async () => {
      if (isConnected && address && !isAuthenticating) {
        // Check if already authenticated
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.authenticated) {
          console.log('[Wallet] Already authenticated, skipping signature');
          return;
        }

        // Not authenticated - trigger sign
        handleEVMAuth();
      }
    };
    checkAndAuth();
  }, [isConnected, address]);

  const handleSolanaAuth = async () => {
    if (!publicKey || !signMessageSol) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Sign authentication message
      const signResult = await signMessageSolana(signMessageSol, publicKey);

      // Verify and create session
      const result = await verifyAndCreateSession('solana', signResult);

      if (result.success) {
        // Redirect to profile or refresh
        router.push('/profile');
        router.refresh();
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Solana auth error:', error);
      setAuthError(error.message || 'Failed to sign message');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEVMAuth = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Sign authentication message
      const signResult = await signMessageEVM(signMessageAsync, address);

      // Verify and create session
      const result = await verifyAndCreateSession('evm', signResult);

      if (result.success) {
        // Redirect to profile or refresh
        router.push('/profile');
        router.refresh();
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('EVM auth error:', error);
      if (error.message?.includes('rejected')) {
        setAuthError('Signature rejected');
      } else {
        setAuthError(error.message || 'Failed to sign message');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Prevent SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="h-10 px-4 rounded-md text-sm font-medium"
          style={{
            backgroundColor: 'hsl(var(--primary-main))',
            color: 'hsl(var(--primary-text))',
          }}
          disabled
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {/* Network Selector - determines active network for each chain */}
        <NetworkSelector compact />

        {/* Solana Wallet Button - Always visible */}
        <WalletMultiButton
          style={{
            backgroundColor: 'hsl(var(--primary-main))',
            color: 'hsl(var(--primary-text))',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            height: '2.5rem',
            transition: 'background-color 0.2s',
          }}
          disabled={isAuthenticating}
        />

        {/* EVM Wallet Button - Always visible */}
        <button
          onClick={() => open()}
          style={{
            backgroundColor: isConnected ? 'hsl(var(--bg-elevated))' : 'hsl(var(--primary-main))',
            color: isConnected ? 'hsl(var(--text-primary))' : 'hsl(var(--primary-text))',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            height: '2.5rem',
            transition: 'background-color 0.2s',
          }}
          disabled={isAuthenticating}
        >
          {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect EVM'}
        </button>
      </div>

      {/* Network Info - Show selected network */}
      <p className="text-xs text-text-secondary">
        Network: {selectedNetwork.icon} {selectedNetwork.name}
      </p>

      {/* Status Messages */}
      {isAuthenticating && (
        <p className="text-xs text-text-secondary">🔐 Signing message to authenticate...</p>
      )}

      {authError && <p className="text-xs text-error">❌ {authError}</p>}
    </div>
  );
}
