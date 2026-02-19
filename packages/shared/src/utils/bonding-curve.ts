/**
 * FASE 7: Bonding Curve Utilities
 * Constant-product AMM calculations and fee split logic
 */

import type { AMMCalculation, SwapQuote, SwapType } from '../types/fase7';

// =================================================
// CONSTANT-PRODUCT AMM FORMULAS
// =================================================

/**
 * Calculate swap output using constant-product formula: x * y = k
 * Fees are deducted from input before calculation
 *
 * @param swapType - BUY (SOL → Token) or SELL (Token → SOL)
 * @param inputAmount - Amount to swap in (lamports or token base units)
 * @param virtualSolReserves - Virtual SOL reserves  * @param virtualTokenReserves - Virtual token reserves
 * @param swapFeeBps - Swap fee in basis points (150 = 1.5%)
 * @returns Complete AMM calculation with fees
 */
export function calculateAMMSwap(
  swapType: SwapType,
  inputAmount: bigint,
  virtualSolReserves: bigint,
  virtualTokenReserves: bigint,
  swapFeeBps: number = 150
): AMMCalculation {
  if (inputAmount <= 0n) {
    throw new Error('Input amount must be positive');
  }
  if (virtualSolReserves <= 0n || virtualTokenReserves <= 0n) {
    throw new Error('Reserves must be positive');
  }

  // Calculate swap fee (1.5% default)
  const swapFee = (inputAmount * BigInt(swapFeeBps)) / 10000n;
  const inputAfterFee = inputAmount - swapFee;

  // Split fee 50/50
  const treasuryFee = swapFee / 2n;
  const referralPoolFee = swapFee - treasuryFee; // Remainder to avoid rounding issues

  // Constant product: k = x * y
  const k = virtualSolReserves * virtualTokenReserves;

  let outputAmount: bigint;
  let newSolReserves: bigint;
  let newTokenReserves: bigint;
  let pricePerToken: bigint;

  if (swapType === 'BUY') {
    // BUY: SOL → Token
    newSolReserves = virtualSolReserves + inputAfterFee;
    newTokenReserves = k / newSolReserves;
    outputAmount = virtualTokenReserves - newTokenReserves;

    // Price = SOL paid / tokens received (in lamports per token with decimals)
    pricePerToken = (inputAmount * BigInt(1e9)) / outputAmount;
  } else {
    // SELL: Token → SOL
    newTokenReserves = virtualTokenReserves + inputAfterFee;
    newSolReserves = k / newTokenReserves;
    outputAmount = virtualSolReserves - newSolReserves;

    // Price = SOL received / tokens paid (in lamports per token with decimals)
    pricePerToken = (outputAmount * BigInt(1e9)) / inputAmount;
  }

  if (outputAmount <= 0n) {
    throw new Error('Output amount too small');
  }

  // Calculate price impact
  const oldPrice = (virtualSolReserves * BigInt(10000)) / virtualTokenReserves;
  const newPrice = (newSolReserves * BigInt(10000)) / newTokenReserves;

  let priceImpactBps = 0;
  if (oldPrice > 0n) {
    priceImpactBps = Number(((newPrice - oldPrice) * 10000n) / oldPrice);
  }

  return {
    input_amount: inputAmount,
    output_amount: outputAmount,
    price_per_token: pricePerToken,
    swap_fee: swapFee,
    treasury_fee: treasuryFee,
    referral_pool_fee: referralPoolFee,
    new_sol_reserves: newSolReserves,
    new_token_reserves: newTokenReserves,
    price_impact_bps: Math.abs(priceImpactBps),
  };
}

/**
 * Generate swap quote with slippage protection
 */
export function generateSwapQuote(
  swapType: SwapType,
  inputAmount: string,
  virtualSolReserves: string,
  virtualTokenReserves: string,
  swapFeeBps: number = 150,
  slippageToleranceBps: number = 100 // 1% default
): SwapQuote {
  const calc = calculateAMMSwap(
    swapType,
    BigInt(inputAmount),
    BigInt(virtualSolReserves),
    BigInt(virtualTokenReserves),
    swapFeeBps
  );

  // Apply slippage tolerance to minimum output
  const slippageAdjustment = (calc.output_amount * BigInt(slippageToleranceBps)) / 10000n;
  const minimumOutput = calc.output_amount - slippageAdjustment;

  return {
    swap_type: swapType,
    input_amount: inputAmount,
    output_amount: calc.output_amount.toString(),
    price_per_token: calc.price_per_token.toString(),
    swap_fee_bps: swapFeeBps,
    treasury_fee: calc.treasury_fee.toString(),
    referral_pool_fee: calc.referral_pool_fee.toString(),
    minimum_output: minimumOutput.toString(),
    price_impact_percent: calc.price_impact_bps / 100,
    slippage_tolerance_bps: slippageToleranceBps,
  };
}

// =================================================
// FEE SPLIT CALCULATIONS
// =================================================

/**
 * Calculate 1.5% swap fee split 50/50
 */
export function calculateSwapFee(
  inputAmount: bigint,
  swapFeeBps: number = 150
): { total_fee: bigint; treasury_fee: bigint; referral_pool_fee: bigint } {
  const totalFee = (inputAmount * BigInt(swapFeeBps)) / 10000n;
  const treasuryFee = totalFee / 2n;
  const referralPoolFee = totalFee - treasuryFee; // Remainder

  return {
    total_fee: totalFee,
    treasury_fee: treasuryFee,
    referral_pool_fee: referralPoolFee,
  };
}

// =================================================
// GRADUATION CHECKS
// =================================================

/**
 * Check if pool has reached graduation threshold
 */
export function checkGraduationThreshold(
  actualSolReserves: string,
  graduationThresholdSol: string
): { threshold_met: boolean; progress_percent: number; remaining_sol: string } {
  const actual = BigInt(actualSolReserves);
  const threshold = BigInt(graduationThresholdSol);

  const thresholdMet = actual >= threshold;
  const progressPercent = Number((actual * 100n) / threshold);
  const remainingSol = threshold - actual;

  return {
    threshold_met: thresholdMet,
    progress_percent: Math.min(progressPercent, 100),
    remaining_sol: remainingSol > 0n ? remainingSol.toString() : '0',
  };
}

/**
 * Validate LP lock meets minimum duration requirement
 */
export function validateLPLockDuration(
  lockDurationMonths: number,
  minimumMonths: number = 12
): { valid: boolean; message: string } {
  if (lockDurationMonths >= minimumMonths) {
    return {
      valid: true,
      message: `LP lock duration ${lockDurationMonths} months meets minimum ${minimumMonths} months`,
    };
  }

  return {
    valid: false,
    message: `LP lock duration ${lockDurationMonths} months does not meet minimum ${minimumMonths} months`,
  };
}

// =================================================
// PRICE CALCULATIONS
// =================================================

/**
 * Calculate current token price based on reserves
 */
export function getCurrentPrice(
  solReserves: string,
  tokenReserves: string,
  tokenDecimals: number = 9
): string {
  const sol = BigInt(solReserves);
  const tokens = BigInt(tokenReserves);

  // Price = SOL / Tokens (in lamports per token)
  const price = (sol * BigInt(10 ** tokenDecimals)) / tokens;

  return price.toString();
}

/**
 * Calculate market cap based on current price
 */
export function calculateMarketCap(
  currentPrice: string,
  totalSupply: string,
  tokenDecimals: number = 9
): string {
  const price = BigInt(currentPrice);
  const supply = BigInt(totalSupply);

  // Market cap in lamports
  const marketCap = (price * supply) / BigInt(10 ** tokenDecimals);

  return marketCap.toString();
}

// =================================================
// VALIDATION HELPERS
// =================================================

/**
 * Validate bonding pool configuration
 */
export function validateBondingPoolConfig(config: {
  virtualSolReserves: string;
  virtualTokenReserves: string;
  graduationThresholdSol: string;
  totalSupply: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const virtualSol = BigInt(config.virtualSolReserves);
    const virtualTokens = BigInt(config.virtualTokenReserves);
    const threshold = BigInt(config.graduationThresholdSol);
    const supply = BigInt(config.totalSupply);

    if (virtualSol <= 0n) errors.push('Virtual SOL reserves must be positive');
    if (virtualTokens <= 0n) errors.push('Virtual token reserves must be positive');
    if (threshold <= 0n) errors.push('Graduation threshold must be positive');
    if (supply <= 0n) errors.push('Total supply must be positive');

    // Virtual token reserves should not exceed total supply
    if (virtualTokens > supply) {
      errors.push('Virtual token reserves cannot exceed total supply');
    }

    // Threshold should be reasonable (not too low or too high)
    const minThreshold = 1n * BigInt(1e9); // 1 SOL
    const maxThreshold = 100000n * BigInt(1e9); // 100,000 SOL
    if (threshold < minThreshold) errors.push('Graduation threshold too low (minimum 1 SOL)');
    if (threshold > maxThreshold)
      errors.push('Graduation threshold too high (maximum 100,000 SOL)');
  } catch {
    errors.push('Invalid number format in configuration');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate swap amount limits
 */
export function validateSwapAmount(
  inputAmount: string,
  swapType: SwapType,
  actualSolReserves: string,
  actualTokenReserves: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const amount = BigInt(inputAmount);
    const solReserves = BigInt(actualSolReserves);
    const tokenReserves = BigInt(actualTokenReserves);

    if (amount <= 0n) {
      errors.push('Swap amount must be positive');
    }

    // Check if swap would drain reserves
    if (swapType === 'BUY') {
      // Buying tokens - check reasonable SOL input limit
      if (amount > solReserves * 2n) {
        errors.push('SOL input exceeds reasonable limit (2x reserves)');
      }
    } else {
      // Selling tokens - check if pool has enough SOL
      if (amount > tokenReserves) {
        errors.push('Token input exceeds available reserves');
      }
    }
  } catch {
    errors.push('Invalid swap amount format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
