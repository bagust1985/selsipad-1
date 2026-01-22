/**
 * Price Oracle Service
 * Fetches real-time token prices from CoinGecko API
 * Includes caching to avoid rate limits
 */

interface TokenPrice {
  price: number;
  timestamp: number;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

// In-memory cache with 5-minute TTL
const PRICE_CACHE: Record<string, TokenPrice> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Map token symbols to CoinGecko IDs
 */
function getTokenId(token: string): string {
  const mapping: Record<string, string> = {
    BNB: 'binancecoin',
    ETH: 'ethereum',
    SOL: 'solana',
    MATIC: 'matic-network',
    USDT: 'tether',
    USDC: 'usd-coin',
    DAI: 'dai',
    BUSD: 'binance-usd',
  };
  return mapping[token.toUpperCase()] || token.toLowerCase();
}

/**
 * Fetch token price from CoinGecko
 * Uses cache to minimize API calls
 */
export async function getTokenPriceUSD(token: string): Promise<number> {
  const tokenId = getTokenId(token);

  // Check cache
  const cached = PRICE_CACHE[tokenId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // Fetch from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Cache for 5 minutes on CDN/browser
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return 0;
    }

    const data: CoinGeckoResponse = await response.json();
    const price = data[tokenId]?.usd || 0;

    // Update cache
    PRICE_CACHE[tokenId] = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    // Return cached value if available, even if expired
    return cached?.price || 0;
  }
}

/**
 * Estimate USD value for an amount of tokens
 */
export async function estimateUSD(amount: number, token: string): Promise<number> {
  if (amount <= 0) return 0;

  const price = await getTokenPriceUSD(token);
  return amount * price;
}

/**
 * Get multiple token prices in a single request (batch)
 * More efficient than individual calls
 */
export async function getMultipleTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  const uniqueTokens = [...new Set(tokens)];
  const tokenIds = uniqueTokens.map(getTokenId);

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd`,
      {
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return {};
    }

    const data: CoinGeckoResponse = await response.json();

    // Map back to original token symbols
    const prices: Record<string, number> = {};
    uniqueTokens.forEach((token) => {
      const tokenId = getTokenId(token);
      prices[token] = data[tokenId]?.usd || 0;

      // Update cache
      PRICE_CACHE[tokenId] = {
        price: prices[token],
        timestamp: Date.now(),
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
    return {};
  }
}

/**
 * Clear price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  Object.keys(PRICE_CACHE).forEach((key) => delete PRICE_CACHE[key]);
}
