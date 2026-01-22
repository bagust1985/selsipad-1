/**
 * Multi-Chain Utilities
 * Helper functions for chain-specific operations
 */

export type ChainId = 'BSC' | 'ETHEREUM' | 'SOLANA' | 'POLYGON' | 'ARBITRUM';

export interface ChainInfo {
  id: ChainId;
  name: string;
  nativeToken: string;
  explorer: string;
  rpcUrl?: string;
}

/**
 * Get native token symbol for a chain
 */
export function getNativeToken(chain: string): string {
  const mapping: Record<string, string> = {
    BSC: 'BNB',
    ETHEREUM: 'ETH',
    SOLANA: 'SOL',
    POLYGON: 'MATIC',
    ARBITRUM: 'ETH',
  };
  return mapping[chain.toUpperCase()] || 'TOKEN';
}

/**
 * Get chain info
 */
export function getChainInfo(chain: string): ChainInfo {
  const chainMap: Record<string, ChainInfo> = {
    BSC: {
      id: 'BSC',
      name: 'BNB Smart Chain',
      nativeToken: 'BNB',
      explorer: 'https://bscscan.com',
    },
    ETHEREUM: {
      id: 'ETHEREUM',
      name: 'Ethereum',
      nativeToken: 'ETH',
      explorer: 'https://etherscan.io',
    },
    SOLANA: {
      id: 'SOLANA',
      name: 'Solana',
      nativeToken: 'SOL',
      explorer: 'https://solscan.io',
    },
    POLYGON: {
      id: 'POLYGON',
      name: 'Polygon',
      nativeToken: 'MATIC',
      explorer: 'https://polygonscan.com',
    },
    ARBITRUM: {
      id: 'ARBITRUM',
      name: 'Arbitrum',
      nativeToken: 'ETH',
      explorer: 'https://arbiscan.io',
    },
  };

  return (
    chainMap[chain.toUpperCase()] || {
      id: chain as ChainId,
      name: chain,
      nativeToken: 'TOKEN',
      explorer: '',
    }
  );
}

/**
 * Get reward token for a chain and source
 */
export function getRewardToken(chain: string, source: string): string {
  // Most rewards are in USDT
  // Can be customized per chain/source in the future
  if (chain === 'SOLANA') {
    return 'USDT'; // SPL USDT on Solana
  }
  return 'USDT'; // BEP-20/ERC-20 USDT on EVM chains
}

/**
 * Shorten blockchain address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format chain name for display
 */
export function formatChainName(chain: string): string {
  const info = getChainInfo(chain);
  return info.name;
}
