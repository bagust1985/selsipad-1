'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { bscTestnet, bsc, mainnet, sepolia } from 'viem/chains';

interface LivePresaleProgressProps {
  contractAddress: string;
  chain?: string;
  currency?: string;
  hardcap: number; // in ETH/BNB
  fallbackRaised?: number;
}

// ABI for reading presale state
const PRESALE_READ_ABI = [
  {
    inputs: [],
    name: 'totalRaised',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hardCap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

function getChainConfig(chainId?: string) {
  switch (chainId) {
    case '97':
      return bscTestnet;
    case '56':
      return bsc;
    case '1':
      return mainnet;
    case '11155111':
      return sepolia;
    default:
      return bscTestnet; // Default to BSC Testnet
  }
}

export function LivePresaleProgress({
  contractAddress,
  chain: chainId,
  currency = 'BNB',
  hardcap,
  fallbackRaised = 0,
}: LivePresaleProgressProps) {
  const client = useMemo(() => {
    const viemChain = getChainConfig(chainId);
    return createPublicClient({
      chain: viemChain,
      transport: http(),
    });
  }, [chainId]);

  const [raised, setRaised] = useState<number>(fallbackRaised);
  const [onChainHardcap, setOnChainHardcap] = useState<number>(hardcap);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!client || !contractAddress) return;

    async function fetchOnChain() {
      try {
        const [totalRaisedWei, hardCapWei] = await Promise.all([
          client.readContract({
            address: contractAddress as `0x${string}`,
            abi: PRESALE_READ_ABI,
            functionName: 'totalRaised',
          }),
          client.readContract({
            address: contractAddress as `0x${string}`,
            abi: PRESALE_READ_ABI,
            functionName: 'hardCap',
          }),
        ]);

        const raisedEth = parseFloat(formatEther(totalRaisedWei as bigint));
        const hardcapEth = parseFloat(formatEther(hardCapWei as bigint));

        setRaised(raisedEth);
        setOnChainHardcap(hardcapEth);
        setLoaded(true);
      } catch (err) {
        console.error('[LivePresaleProgress] Error reading contract:', err);
        // Keep fallback values
        setLoaded(true);
      }
    }

    fetchOnChain();

    // Refresh every 15 seconds
    const interval = setInterval(fetchOnChain, 15000);
    return () => clearInterval(interval);
  }, [client, contractAddress]);

  const target = onChainHardcap > 0 ? onChainHardcap : hardcap;
  const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const isGood = percent > 0;

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-[#0A0A0C]/60 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Total Raised
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {raised.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
              <span className="text-lg text-gray-500">{currency}</span>
            </span>
            <span className="text-sm text-gray-400">
              / {target.toLocaleString()} {currency}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-medium mb-1">Progress</p>
          <p className={`text-2xl font-bold ${isGood ? 'text-[#39AEC4]' : 'text-gray-200'}`}>
            {percent}%
          </p>
        </div>
      </div>

      <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ${
            isGood ? 'bg-gradient-to-r from-[#39AEC4] to-[#756BBA]' : 'bg-gray-600'
          }`}
          style={{ width: `${percent}%` }}
        >
          <div
            className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>

      {!loaded && (
        <p className="text-xs text-gray-600 mt-2 animate-pulse">
          Loading live data from contract...
        </p>
      )}
      {loaded && raised !== fallbackRaised && (
        <p className="text-[10px] text-gray-600 mt-2">📡 Live on-chain data</p>
      )}
    </div>
  );
}
