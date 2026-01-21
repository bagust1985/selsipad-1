'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import VestingClaimer from '@/components/presale/VestingClaimer';

export default function ClaimPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to claim vested tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Vested Tokens</h1>
          <p className="text-gray-600">Presale #{params.id}</p>
        </div>

        <VestingClaimer presaleId={params.id as string} userAddress={address} />
      </div>
    </div>
  );
}
