'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Connect Wallet Button
 *
 * Wrapper around WalletMultiButton with custom styling
 * Matches SELSIPAD design system
 *
 * Note: Only renders on client to prevent hydration errors
 */
export function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR to avoid hydration mismatch
  if (!mounted) {
    return (
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
    );
  }

  return (
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
    />
  );
}
