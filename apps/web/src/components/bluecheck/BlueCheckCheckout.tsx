/**
 * Blue Check Checkout Component
 *
 * Handles the purchase flow for Blue Check via smart contract
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, Button } from '@/components/ui';
import { MultiChainConnectWallet } from '@/components/wallet/MultiChainConnectWallet';
import { useBlueCheckPurchase } from '@/hooks/useBlueCheckPurchase';
import { useToast } from '@/components/ui';

export function BlueCheckCheckout() {
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const { requiredBNB, hasPurchased, isLoading, isPurchasing, error, purchaseBlueCheck } =
    useBlueCheckPurchase();

  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      await purchaseBlueCheck();
      showToast('success', 'Blue Check purchased successfully! 🎉');
      // Reload page to update status
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to purchase Blue Check');
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <h3 className="text-heading-md">Connect Your Wallet</h3>
          <p className="text-body-sm text-text-secondary">
            Connect your EVM wallet (MetaMask, WalletConnect, etc.) to purchase Blue Check
          </p>
          <div className="flex justify-center">
            <MultiChainConnectWallet />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPurchased) {
    return (
      <Card className="border-success-main">
        <CardContent className="space-y-3 py-8 text-center">
          <div className="text-5xl">✅</div>
          <h3 className="text-heading-md text-success-main">Already Purchased!</h3>
          <p className="text-body-sm text-text-secondary">
            You already have lifetime Blue Check access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-heading-md">Purchase Blue Check</h3>
          <p className="text-body-sm text-text-secondary">Lifetime access for a one-time payment</p>
        </div>

        <div className="bg-bg-elevated p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-body-sm text-text-secondary">Price (USD)</span>
            <span className="text-heading-md font-semibold">$10.00</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-body-sm text-text-secondary">Price (BNB)</span>
            {isLoading ? (
              <span className="text-body-sm text-text-secondary">Loading...</span>
            ) : (
              <span className="text-heading-sm font-semibold text-primary-main">
                {parseFloat(requiredBNB).toFixed(4)} BNB
              </span>
            )}
          </div>

          <div className="h-px bg-border-subtle my-2" />

          <div className="flex justify-between items-center">
            <span className="text-body-sm text-text-secondary">Fee Split</span>
            <div className="text-right text-caption text-text-secondary">
              <div>70% → Treasury</div>
              <div>30% → Referral Pool</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-status-error-bg border border-status-error-text rounded-lg">
            <p className="text-body-sm text-status-error-text">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || isLoading}
            className="w-full"
            size="lg"
          >
            {isPurchasing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              'Purchase Blue Check'
            )}
          </Button>

          <p className="text-caption text-text-secondary text-center">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div className="bg-bg-elevated p-4 rounded-lg space-y-2">
          <h4 className="text-heading-sm">What You Get:</h4>
          <ul className="space-y-1 text-body-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-success-main">✓</span>
              <span>Lifetime Blue Check badge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-main">✓</span>
              <span>Post on SelsiFeed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-main">✓</span>
              <span>Claim referral rewards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-main">✓</span>
              <span>Enhanced platform credibility</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
