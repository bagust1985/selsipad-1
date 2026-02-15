/**
 * Presale Helper Functions
 * Token calculation utilities for presale escrow deposits
 *
 * ─── Math Policy ───
 * 1. All percentages in BPS (basis points): 500 = 5%, 6000 = 60%
 * 2. Ceil division for token amounts (prevents underfunding)
 * 3. LP buffer of 1% (lpBufferBps = 100) prevents finalize revert from AMM rounding
 * 4. All internal math uses bigint/wei — no floating point
 *
 * This file is the SINGLE SOURCE OF TRUTH for supply calculation.
 * Both the wizard (Step5, Step9) and prepare-finalize route MUST use these functions.
 */

// ─── Core Bigint Utilities ───

/** Ceiling division: ceil(a / b) */
export function ceilDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('Division by zero');
  if (a === 0n) return 0n;
  return (a + b - 1n) / b;
}

// ─── Constants ───
const BPS_BASE = 10000n;
const WEI = 10n ** 18n; // 1e18

// ─── Supply Calculation (bigint/wei) ───

export interface PresaleSupplyParams {
  /** Hardcap in wei (e.g. parseEther("1")) */
  hardcapWei: bigint;
  /** Price per token in wei (e.g. parseEther("0.001")) */
  priceWei: bigint;
  /** Token decimals (default 18) */
  tokenDecimals?: number;
  /** LP percentage in BPS (e.g. 6000 = 60% of net BNB → LP) */
  lpBps: bigint;
  /** Platform fee in BPS (e.g. 500 = 5%) */
  feeBps: bigint;
  /** Team allocation in BPS of total supply (e.g. 3600 = 36%) */
  teamBps: bigint;
  /** LP buffer in BPS (default 100 = 1%) — extra tokens to prevent AMM rounding revert */
  lpBufferBps?: bigint;
}

export interface PresaleSupplyResult {
  /** Tokens available for sale (at hardcap) */
  saleTokens: bigint;
  /** Tokens for LP liquidity (worst case at hardcap + buffer) */
  lpTokens: bigint;
  /** Tokens for team vesting */
  teamTokens: bigint;
  /** Total token supply = sale + lp + team */
  totalSupply: bigint;
}

/**
 * Calculate optimal total token supply for a presale.
 *
 * Formula:
 *   saleTokens = ceil(hardcap / price)     ← tokens purchasable at hardcap
 *   maxLpBnb   = hardcap × (1 - feeBps) × lpBps
 *   lpTokens   = ceil(maxLpBnb / price) × (1 + buffer)
 *   subtotal   = sale + lp
 *   teamTokens = subtotal × teamBps / (BPS_BASE - teamBps)
 *   total      = sale + lp + team
 *
 * All calculations use wei precision. No floating point.
 */
export function calculatePresaleSupply(params: PresaleSupplyParams): PresaleSupplyResult {
  const {
    hardcapWei,
    priceWei,
    tokenDecimals = 18,
    lpBps,
    feeBps,
    teamBps,
    lpBufferBps = 100n, // 1% default
  } = params;

  if (priceWei === 0n) throw new Error('Price cannot be zero');
  if (teamBps >= BPS_BASE) throw new Error('Team BPS must be < 10000');

  const tokenUnit = 10n ** BigInt(tokenDecimals);

  // 1. Sale tokens = ceil(hardcap / price) — in token smallest unit
  //    hardcapWei is in wei (18 dec), priceWei is price per 1 token in wei
  //    saleTokens (in smallest unit) = ceil(hardcapWei * tokenUnit / priceWei)
  const saleTokens = ceilDiv(hardcapWei * tokenUnit, priceWei);

  // 2. LP tokens:
  //    netBnb     = hardcap × (BPS_BASE - feeBps) / BPS_BASE
  //    lpBnb      = netBnb × lpBps / BPS_BASE
  //    lpTokensRaw= ceil(lpBnb * tokenUnit / priceWei)
  //    lpTokens   = ceil(lpTokensRaw × (BPS_BASE + lpBufferBps) / BPS_BASE)
  const netBnbWei = (hardcapWei * (BPS_BASE - feeBps)) / BPS_BASE;
  const lpBnbWei = (netBnbWei * lpBps) / BPS_BASE;
  const lpTokensRaw = ceilDiv(lpBnbWei * tokenUnit, priceWei);
  const lpTokens = ceilDiv(lpTokensRaw * (BPS_BASE + lpBufferBps), BPS_BASE);

  // 3. Team tokens = subtotal × teamBps / (BPS_BASE - teamBps)
  //    This ensures: teamTokens / totalSupply = teamBps / BPS_BASE
  const subtotal = saleTokens + lpTokens;
  const teamTokens = teamBps > 0n ? ceilDiv(subtotal * teamBps, BPS_BASE - teamBps) : 0n;

  // 4. Total supply
  const totalSupply = saleTokens + lpTokens + teamTokens;

  return { saleTokens, lpTokens, teamTokens, totalSupply };
}

// ─── Display Helpers (number-based, for UI only) ───

/**
 * Convert PresaleSupplyResult to human-readable numbers.
 * For UI display only — never use these numbers for on-chain math.
 */
export function supplyToDisplay(
  result: PresaleSupplyResult,
  tokenDecimals: number = 18
): { sale: number; lp: number; team: number; total: number } {
  const div = 10 ** tokenDecimals;
  return {
    sale: Number(result.saleTokens) / div,
    lp: Number(result.lpTokens) / div,
    team: Number(result.teamTokens) / div,
    total: Number(result.totalSupply) / div,
  };
}

/**
 * Calculate FDV at a given fill level.
 * @param priceWei Price per token in wei
 * @param totalSupply Total supply in smallest unit
 * @param fillBps Fill level in BPS (10000 = hardcap, 5000 = 50%)
 * @param feeBps Platform fee BPS
 * @param lpBps LP percentage BPS
 * @param tokenDecimals Token decimals
 * @returns FDV in wei (BNB), and effective supply after burn
 */
export function calculateFDV(params: {
  priceWei: bigint;
  totalSupply: bigint;
  saleTokens: bigint;
  lpTokens: bigint;
  teamTokens: bigint;
  fillBps: bigint; // 10000 = hardcap
  feeBps: bigint;
  lpBps: bigint;
  tokenDecimals?: number;
}): { fdvWei: bigint; effectiveSupply: bigint; burnedTokens: bigint } {
  const tokenUnit = 10n ** BigInt(params.tokenDecimals ?? 18);

  // At partial fill, unsold tokens + unused LP tokens are burned
  const soldTokens = (params.saleTokens * params.fillBps) / BPS_BASE;
  const unsoldBurn = params.saleTokens - soldTokens;

  // LP tokens scale with fill level
  const actualLpTokens = (params.lpTokens * params.fillBps) / BPS_BASE;
  const lpBurn = params.lpTokens - actualLpTokens;

  const burnedTokens = unsoldBurn + lpBurn;
  const effectiveSupply = params.totalSupply - burnedTokens;

  // FDV = effectiveSupply × price
  const fdvWei = (effectiveSupply * params.priceWei) / tokenUnit;

  return { fdvWei, effectiveSupply, burnedTokens };
}

// ─── Legacy wrapper (backward compat for existing wizard code) ───

/**
 * @deprecated Use calculatePresaleSupply with bigint params instead.
 * Kept for backward compatibility during migration.
 */
export function getEscrowBreakdown(params: {
  tokensForSale: string;
  teamVestingTokens: string;
  lpLockPercentage: number;
}): {
  sale: number;
  lp: number;
  team: number;
  total: number;
} {
  const sale = parseFloat(params.tokensForSale);
  const team = parseFloat(params.teamVestingTokens) || 0;
  const lp = sale * (params.lpLockPercentage / 100);
  const total = sale + Math.ceil(lp) + team;

  return { sale, lp: Math.ceil(lp), team, total };
}

/**
 * @deprecated Use calculatePresaleSupply instead.
 */
export function calculatePresaleEscrowTokens(params: {
  tokensForSale: string;
  teamVestingTokens: string;
  lpLockPercentage: number;
}): number {
  const result = getEscrowBreakdown(params);
  return result.total;
}
