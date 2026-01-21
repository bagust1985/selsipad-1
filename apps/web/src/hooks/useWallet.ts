'use client';

import { useState, useEffect } from 'react';

/**
 * Simple wallet hook for contribution form
 * This is a placeholder - in production, integrate with wagmi/web3.js
 */
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected (from localStorage)
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    // Placeholder connect function
    // In production, use wagmi for EVM or @solana/wallet-adapter for Solana
    try {
      // Simulate wallet connection
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        const connectedAddress = accounts[0];
        setAddress(connectedAddress);
        setIsConnected(true);
        localStorage.setItem('wallet_address', connectedAddress);
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = async () => {
    // Client-side cleanup
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('wallet_address');

    // Server-side session cleanup (deletes from DB + clears cookies)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // Redirect handled by server
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server fails, force redirect
      window.location.href = '/';
    }
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
  };
}
