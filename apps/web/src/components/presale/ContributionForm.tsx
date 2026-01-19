'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { StatusPill } from './StatusPill';

interface ContributionFormProps {
  roundId: string;
  network: string;
  paymentToken: string;
  min?: number;
  max?: number;
  userContribution?: any;
}

export function ContributionForm({
  roundId,
  network,
  paymentToken,
  min,
  max,
  userContribution,
}: ContributionFormProps) {
  const { address, isConnected, connect } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const handleContribute = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (min && contributionAmount < min) {
      setError(`Minimum contribution is ${min} ${paymentToken}`);
      return;
    }

    if (max && contributionAmount > max) {
      setError(`Maximum contribution is ${max} ${paymentToken}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create contribution intent
      const intentResponse = await fetch(`/api/rounds/${roundId}/contribute/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round_id: roundId,
          amount: contributionAmount,
          wallet_address: address,
        }),
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Failed to create contribution intent');
      }

      const intentData = await intentResponse.json();

      // Step 2: Sign the transaction (this is a placeholder)
      // In production, this would use wagmi/web3.js to sign the actual transaction
      setTxStatus('SUBMITTED');

      // Simulate transaction hash (in production, get this from the blockchain)
      const txHash = `0x${Math.random().toString(16).slice(2)}`;

      // Step 3: Confirm the contribution
      const confirmResponse = await fetch(`/api/rounds/${roundId}/contribute/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round_id: roundId,
          tx_hash: txHash,
          amount: contributionAmount,
          wallet_address: address,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Failed to confirm contribution');
      }

      setTxStatus('CONFIRMED');
      setAmount('');

      // Refresh the page after successful contribution
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const setPresetAmount = (percentage: number) => {
    if (!max) return;
    const presetAmount = (max * percentage) / 100;
    setAmount(presetAmount.toString());
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
        <p className="text-yellow-800 dark:text-yellow-300 mb-4">
          Connect your wallet to participate in this presale
        </p>
        <button
          onClick={connect}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (network !== 'SOLANA' && !address?.startsWith('0x')) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-800 dark:text-red-300 mb-2">Wrong Network</p>
        <p className="text-sm text-red-600 dark:text-red-400">
          Please switch to the correct network to participate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              Wallet Connected
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contribution Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount (${min ? `min ${min}` : '0'})`}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={loading}
          />
          <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-400">
            {paymentToken}
          </span>
        </div>

        {/* Quick presets */}
        {max && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => setPresetAmount(percent)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                disabled={loading}
              >
                {percent}%
              </button>
            ))}
          </div>
        )}

        {/* Min/Max Info */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
          {min && (
            <span>
              Min: {min} {paymentToken}
            </span>
          )}
          {max && (
            <span>
              Max: {max} {paymentToken}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Transaction Status */}
      {txStatus && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800 dark:text-blue-300">Transaction Status</p>
            <StatusPill status={txStatus as any} />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleContribute}
        disabled={loading || !amount}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Contribute'}
      </button>

      {/* Your Contribution */}
      {userContribution && (
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Contribution</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {userContribution.amount} {paymentToken}
          </p>
          <div className="mt-2">
            <StatusPill status={userContribution.status} />
          </div>
        </div>
      )}
    </div>
  );
}
