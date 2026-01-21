'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@/lib/auth/session';

interface CurrentWallet {
  walletId: string;
  address: string;
  chain: string;
  network: 'SOL' | 'EVM';
}

/**
 * Hook to get current connected wallet from session
 *
 * Provides wallet isolation metadata for the current authenticated session
 */
export function useCurrentWallet() {
  const [currentWallet, setCurrentWallet] = useState<CurrentWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentWallet = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.authenticated && data.session) {
          const session: Session = data.session;
          setCurrentWallet({
            walletId: session.walletId,
            address: session.address,
            chain: session.chain,
            network: session.chain === 'SOLANA' ? 'SOL' : 'EVM',
          });
        } else {
          setCurrentWallet(null);
        }
      } catch (err) {
        console.error('Error fetching current wallet:', err);
        setCurrentWallet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentWallet();
  }, []);

  return {
    currentWallet,
    loading,
    isConnected: !!currentWallet,
  };
}
