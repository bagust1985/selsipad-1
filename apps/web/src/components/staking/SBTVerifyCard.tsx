'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Search } from 'lucide-react';

interface SBTVerifyCardProps {
  onVerified: (info: any) => void;
}

export function SBTVerifyCard({ onVerified }: SBTVerifyCardProps) {
  const [sbtContract, setSbtContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [walletAddress, setWalletAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!sbtContract || !tokenId || !walletAddress) {
      setError('Please fill all fields');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/staking/sbt/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sbtContract,
          tokenId,
          chain,
          walletAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      if (!data.data.isValid) {
        throw new Error('SBT ownership could not be verified');
      }

      setVerified(true);
      onVerified({ sbtContract, tokenId, chain, walletAddress });
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-white">✅ SBT Verified</h3>
            <p className="text-sm text-gray-400">Your Proof of Human SBT is confirmed</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Token ID</div>
            <div className="text-white font-mono">#{tokenId}</div>
          </div>
          <div>
            <div className="text-gray-500">Chain</div>
            <div className="text-white capitalize">{chain}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex items-start gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-400 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Verify Your SBT</h3>
          <p className="text-sm text-gray-400">Verify ownership of your external Soulbound Token</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* SBT Contract */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            SBT Contract Address
          </label>
          <input
            type="text"
            value={sbtContract}
            onChange={(e) => setSbtContract(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Token ID */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="12345"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BSC</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
          </select>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <Search className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify SBT Ownership
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
