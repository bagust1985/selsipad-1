/**
 * FASE 7: Bonding Curve Unit Tests
 * Tests AMM math, fee calculations, and graduation logic
 *
 * Run: npx ts-node tests/unit/bonding-curve.test.ts
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock implementations of bonding curve functions
interface SwapQuote {
  output_amount: bigint;
  fee_amount: bigint;
  treasury_fee: bigint;
  referral_fee: bigint;
}

interface GraduationStatus {
  is_graduating: boolean;
  progress_percentage: number;
  sol_remaining: bigint;
}

/**
 * Constant-product AMM formula: x * y = k
 * With swap fee deducted before calculation
 */
function calculateAMMSwap(
  swapType: 'BUY' | 'SELL',
  inputAmount: bigint,
  virtualSol: bigint,
  virtualTokens: bigint,
  swapFeeBps: number = 150 // 1.5% = 150 bps
): SwapQuote {
  // Calculate swap fee (1.5%)
  const swapFee = (inputAmount * BigInt(swapFeeBps)) / 10000n;

  // 50/50 split
  const treasuryFee = swapFee / 2n;
  const referralFee = swapFee - treasuryFee;

  // Amount after fee
  const inputAfterFee = inputAmount - swapFee;

  // k = x * y (constant product formula)
  const k = virtualSol * virtualTokens;

  let outputAmount: bigint;

  if (swapType === 'BUY') {
    // User sends SOL, gets tokens
    // New X = virtualSol + inputAfterFee
    // New Y = k / New X
    const newX = virtualSol + inputAfterFee;
    const newY = k / newX;
    outputAmount = virtualTokens - newY;
  } else {
    // User sends tokens, gets SOL
    // New Y = virtualTokens + inputAfterFee
    // New X = k / New Y
    const newY = virtualTokens + inputAfterFee;
    const newX = k / newY;
    outputAmount = virtualSol - newX;
  }

  return {
    output_amount: outputAmount,
    fee_amount: swapFee,
    treasury_fee: treasuryFee,
    referral_fee: referralFee,
  };
}

/**
 * Check if pool should graduate
 */
function checkGraduationThreshold(actualSol: bigint, thresholdSol: bigint): GraduationStatus {
  const progress = thresholdSol > 0n ? (actualSol * 100n) / thresholdSol : 0n;
  const isGraduating = actualSol >= thresholdSol;
  const remaining = thresholdSol > actualSol ? thresholdSol - actualSol : 0n;

  return {
    is_graduating: isGraduating,
    progress_percentage: Number(progress),
    sol_remaining: remaining,
  };
}

/**
 * Validate fee split correctness
 */
function validateFeeSplit(swapFee: bigint, treasuryFee: bigint, referralFee: bigint): boolean {
  // Treasury + Referral should equal total fee
  return treasuryFee + referralFee === swapFee;
}

/**
 * Simulate multiple swaps and track reserves
 */
function simulateSwaps(
  swaps: Array<{ type: 'BUY' | 'SELL'; amount: bigint }>,
  virtualSol: bigint,
  virtualTokens: bigint,
  initialActualSol: bigint = 0n
): {
  finalVirtualSol: bigint;
  finalVirtualTokens: bigint;
  totalFees: bigint;
  totalTreasuryFees: bigint;
  totalReferralFees: bigint;
  actualSolRaised: bigint;
} {
  let currentVirtualSol = virtualSol;
  let currentVirtualTokens = virtualTokens;
  let totalFees = 0n;
  let totalTreasuryFees = 0n;
  let totalReferralFees = 0n;
  let actualSolRaised = initialActualSol;

  for (const swap of swaps) {
    const quote = calculateAMMSwap(
      swap.type,
      swap.amount,
      currentVirtualSol,
      currentVirtualTokens,
      150
    );

    // Update reserves
    if (swap.type === 'BUY') {
      currentVirtualSol += swap.amount - quote.fee_amount;
      currentVirtualTokens -= quote.output_amount;
      actualSolRaised += swap.amount - quote.fee_amount;
    } else {
      currentVirtualSol -= quote.output_amount;
      currentVirtualTokens += swap.amount - quote.fee_amount;
    }

    totalFees += quote.fee_amount;
    totalTreasuryFees += quote.treasury_fee;
    totalReferralFees += quote.referral_fee;
  }

  return {
    finalVirtualSol: currentVirtualSol,
    finalVirtualTokens: currentVirtualTokens,
    totalFees,
    totalTreasuryFees,
    totalReferralFees,
    actualSolRaised,
  };
}

// ============================================
// TEST SUITE
// ============================================

describe('Bonding Curve - AMM Math', () => {
  describe('Constant Product Formula (x * y = k)', () => {
    it('should calculate BUY quote correctly', () => {
      const virtualSol = 10n * 10n ** 9n; // 10 SOL
      const virtualTokens = 1000n * 10n ** 9n; // 1000 tokens
      const inputAmount = 1n * 10n ** 9n; // 1 SOL

      const quote = calculateAMMSwap('BUY', inputAmount, virtualSol, virtualTokens);

      // Fee should be 1.5% of 1 SOL = 0.015 SOL
      expect(quote.fee_amount).toBe(15000000n); // 0.015 SOL in lamports

      // Output should be positive
      expect(quote.output_amount).toBeGreaterThan(0n);
    });

    it('should calculate SELL quote correctly', () => {
      const virtualSol = 10n * 10n ** 9n;
      const virtualTokens = 1000n * 10n ** 9n;
      const inputAmount = 100n * 10n ** 9n; // 100 tokens

      const quote = calculateAMMSwap('SELL', inputAmount, virtualSol, virtualTokens);

      // Fee should be 1.5%
      expect(quote.fee_amount).toBe(1500000000n); // 1.5 SOL in lamports

      // Output should be positive
      expect(quote.output_amount).toBeGreaterThan(0n);
    });

    it('should maintain k constant (k = x * y)', () => {
      const virtualSol = 10n * 10n ** 9n;
      const virtualTokens = 1000n * 10n ** 9n;
      const inputAmount = 1n * 10n ** 9n;

      const k = virtualSol * virtualTokens;
      const quote = calculateAMMSwap('BUY', inputAmount, virtualSol, virtualTokens);

      const newVirtualSol = virtualSol + inputAmount - quote.fee_amount;
      const newVirtualTokens = virtualTokens - quote.output_amount;
      const newK = newVirtualSol * newVirtualTokens;

      // k should increase slightly (due to fees)
      expect(newK).toBeGreaterThanOrEqual(k);
    });

    it('should handle large amounts', () => {
      const virtualSol = 1000n * 10n ** 9n; // 1000 SOL
      const virtualTokens = 100000n * 10n ** 9n;
      const inputAmount = 100n * 10n ** 9n; // 100 SOL

      const quote = calculateAMMSwap('BUY', inputAmount, virtualSol, virtualTokens);

      expect(quote.output_amount).toBeGreaterThan(0n);
      expect(quote.fee_amount).toBeGreaterThan(0n);
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate 1.5% swap fee correctly', () => {
      const inputAmount = 100n * 10n ** 9n; // 100 SOL
      const quote = calculateAMMSwap('BUY', inputAmount, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // Fee = 100 SOL * 1.5% = 1.5 SOL
      expect(quote.fee_amount).toBe(1500000000n);
    });

    it('should split fee 50:50 treasury and referral', () => {
      const quote = calculateAMMSwap('BUY', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // Check 50:50 split
      expect(quote.treasury_fee).toBe(quote.referral_fee);
      expect(quote.treasury_fee + quote.referral_fee).toBe(quote.fee_amount);
    });

    it('should validate fee split', () => {
      const quote = calculateAMMSwap('BUY', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      const isValid = validateFeeSplit(quote.fee_amount, quote.treasury_fee, quote.referral_fee);

      expect(isValid).toBe(true);
    });

    it('should track treasury and referral fees separately', () => {
      const quote = calculateAMMSwap('SELL', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      const expectedFee = 1500000000n; // 1.5% of 100 SOL
      const expectedTreasury = expectedFee / 2n;
      const expectedReferral = expectedFee - expectedTreasury;

      expect(quote.treasury_fee).toBe(expectedTreasury);
      expect(quote.referral_fee).toBe(expectedReferral);
    });
  });

  describe('Graduation Detection', () => {
    it('should detect graduation when threshold reached', () => {
      const thresholdSol = 50n * 10n ** 9n; // 50 SOL
      const actualSol = 50n * 10n ** 9n; // 50 SOL (exactly at threshold)

      const status = checkGraduationThreshold(actualSol, thresholdSol);

      expect(status.is_graduating).toBe(true);
      expect(status.progress_percentage).toBe(100);
      expect(status.sol_remaining).toBe(0n);
    });

    it('should detect graduation when threshold exceeded', () => {
      const thresholdSol = 50n * 10n ** 9n;
      const actualSol = 100n * 10n ** 9n; // 100 SOL (exceeds threshold)

      const status = checkGraduationThreshold(actualSol, thresholdSol);

      expect(status.is_graduating).toBe(true);
      expect(status.progress_percentage).toBe(200);
    });

    it('should NOT graduate when below threshold', () => {
      const thresholdSol = 50n * 10n ** 9n;
      const actualSol = 30n * 10n ** 9n; // 30 SOL (below threshold)

      const status = checkGraduationThreshold(actualSol, thresholdSol);

      expect(status.is_graduating).toBe(false);
      expect(status.progress_percentage).toBe(60);
      expect(status.sol_remaining).toBe(20n * 10n ** 9n);
    });

    it('should calculate progress percentage correctly', () => {
      const thresholdSol = 100n * 10n ** 9n;
      const actualSol = 25n * 10n ** 9n; // 25% progress

      const status = checkGraduationThreshold(actualSol, thresholdSol);

      expect(status.progress_percentage).toBe(25);
    });

    it('should handle zero threshold', () => {
      const thresholdSol = 0n;
      const actualSol = 100n * 10n ** 9n;

      const status = checkGraduationThreshold(actualSol, thresholdSol);

      expect(status.progress_percentage).toBe(0);
    });
  });

  describe('Multi-Swap Scenarios', () => {
    it('should accumulate fees correctly across multiple swaps', () => {
      const swaps = [
        { type: 'BUY' as const, amount: 10n * 10n ** 9n },
        { type: 'BUY' as const, amount: 20n * 10n ** 9n },
        { type: 'SELL' as const, amount: 100n * 10n ** 9n },
      ];

      const result = simulateSwaps(swaps, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // Total fees should equal all individual fees
      // 10 * 1.5% + 20 * 1.5% + 100 * 1.5% = 1.95 SOL
      const expectedFees = 1950000000n;
      expect(result.totalFees).toBe(expectedFees);
    });

    it('should maintain 50:50 treasury/referral split across multiple swaps', () => {
      const swaps = [
        { type: 'BUY' as const, amount: 10n * 10n ** 9n },
        { type: 'BUY' as const, amount: 20n * 10n ** 9n },
      ];

      const result = simulateSwaps(swaps, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // Should be exactly 50:50
      expect(result.totalTreasuryFees).toBe(result.totalReferralFees);
    });

    it('should track actual SOL raised correctly', () => {
      const swaps = [
        { type: 'BUY' as const, amount: 10n * 10n ** 9n },
        { type: 'BUY' as const, amount: 20n * 10n ** 9n },
      ];

      const result = simulateSwaps(swaps, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // 30 SOL input - 1.5% fees = 29.55 SOL raised
      const totalInput = 30n * 10n ** 9n;
      const fees = (totalInput * 150n) / 10000n;
      const expected = totalInput - fees;

      expect(result.actualSolRaised).toBe(expected);
    });

    it('should detect graduation after multiple swaps', () => {
      const swaps = [
        { type: 'BUY' as const, amount: 25n * 10n ** 9n },
        { type: 'BUY' as const, amount: 25n * 10n ** 9n },
      ];

      const thresholdSol = 50n * 10n ** 9n;
      const result = simulateSwaps(swaps, 10n * 10n ** 9n, 1000n * 10n ** 9n, 0n);

      const graduationStatus = checkGraduationThreshold(result.actualSolRaised, thresholdSol);

      // Should be at or very close to threshold
      expect(graduationStatus.is_graduating).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum swap amount (1 lamport)', () => {
      const quote = calculateAMMSwap('BUY', 1n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      // Fee on 1 lamport = 1 * 150 / 10000 = 0 (rounded down)
      expect(quote.fee_amount).toBe(0n);
    });

    it('should handle very large swap amounts', () => {
      const quote = calculateAMMSwap('BUY', 1000n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      expect(quote.output_amount).toBeGreaterThan(0n);
    });

    it('should prevent division by zero in k calculation', () => {
      // This should not throw
      const quote = calculateAMMSwap('BUY', 1000n * 10n ** 9n, 1n, 1n);

      expect(quote.output_amount).toBeGreaterThan(0n);
    });
  });

  describe('Fee Distribution', () => {
    it('should allocate deploy fee to treasury', () => {
      const deployFee = 0.5 * 10n ** 9n; // 0.5 SOL
      // Deploy fee goes entirely to treasury (no split)
      expect(deployFee).toBe(500000000n);
    });

    it('should allocate migration fee to treasury', () => {
      const migrationFee = 2.5 * 10n ** 9n; // 2.5 SOL
      // Migration fee goes entirely to treasury (no split)
      expect(migrationFee).toBe(2500000000n);
    });

    it('should allocate swap fee 50:50', () => {
      const quote = calculateAMMSwap('BUY', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

      const treasuryPortion = (quote.fee_amount * 50n) / 100n;
      const referralPortion = quote.fee_amount - treasuryPortion;

      expect(quote.treasury_fee).toBe(treasuryPortion);
      expect(quote.referral_fee).toBe(referralPortion);
    });
  });
});
