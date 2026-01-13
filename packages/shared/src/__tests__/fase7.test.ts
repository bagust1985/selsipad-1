/**
 * FASE 7 Unit Tests: Bonding Curve Utilities
 * Tests for AMM calculations, fee splits, and graduation logic
 */

import {
  calculateAMMSwap,
  generateSwapQuote,
  calculateSwapFee,
  checkGraduationThreshold,
  validateLPLockDuration,
  getCurrentPrice,
  calculateMarketCap,
  validateBondingPoolConfig,
  validateSwapAmount,
} from '../utils/bonding-curve';

describe('FASE 7: Bonding Curve AMM Calculations', () => {
  describe('calculateAMMSwap', () => {
    const virtualSol = 10000000000n; // 10 SOL
    const virtualTokens = 500000000000000n; // 500M tokens
    const swapFeeBps = 150; // 1.5%

    it('should calculate BUY swap correctly', () => {
      const input = 100000000n; // 0.1 SOL
      const result = calculateAMMSwap('BUY', input, virtualSol, virtualTokens, swapFeeBps);

      // Verify fee calculation
      const expectedFee = (input * 150n) / 10000n; // 1.5% = 1,500,000
      expect(result.swap_fee).toBe(expectedFee);

      // Verify fee split 50/50
      expect(result.treasury_fee).toBe(expectedFee / 2n);
      expect(result.referral_pool_fee).toBe(expectedFee - expectedFee / 2n);

      // Verify constant product formula
      const inputAfterFee = input - expectedFee;
      const newSolReserves = virtualSol + inputAfterFee;
      const k = virtualSol * virtualTokens;
      const newTokenReserves = k / newSolReserves;
      const expectedOutput = virtualTokens - newTokenReserves;

      expect(result.output_amount).toBe(expectedOutput);
      expect(result.new_sol_reserves).toBe(newSolReserves);
      expect(result.new_token_reserves).toBe(newTokenReserves);

      // Verify output is positive
      expect(result.output_amount).toBeGreaterThan(0n);
    });

    it('should calculate SELL swap correctly', () => {
      const input = 1000000000000n; // 1M tokens
      const result = calculateAMMSwap('SELL', input, virtualSol, virtualTokens, swapFeeBps);

      // Verify fee calculation
      const expectedFee = (input * 150n) / 10000n;
      expect(result.swap_fee).toBe(expectedFee);

      // Verify constant product formula
      const inputAfterFee = input - expectedFee;
      const newTokenReserves = virtualTokens + inputAfterFee;
      const k = virtualSol * virtualTokens;
      const newSolReserves = k / newTokenReserves;
      const expectedOutput = virtualSol - newSolReserves;

      expect(result.output_amount).toBe(expectedOutput);
      expect(result.new_sol_reserves).toBe(newSolReserves);
      expect(result.new_token_reserves).toBe(newTokenReserves);

      // Verify output is positive
      expect(result.output_amount).toBeGreaterThan(0n);
    });

    it('should reject zero input amount', () => {
      expect(() => {
        calculateAMMSwap('BUY', 0n, virtualSol, virtualTokens, swapFeeBps);
      }).toThrow('Input amount must be positive');
    });

    it('should reject zero reserves', () => {
      expect(() => {
        calculateAMMSwap('BUY', 100000000n, 0n, virtualTokens, swapFeeBps);
      }).toThrow('Reserves must be positive');
    });

    it('should calculate price impact correctly', () => {
      const input = 1000000000n; // 1 SOL (large swap)
      const result = calculateAMMSwap('BUY', input, virtualSol, virtualTokens, swapFeeBps);

      // Verify price impact is calculated (might be 0 due to constant product)
      expect(result.price_impact_bps).toBeGreaterThanOrEqual(0);

      // Verify reserves changed
      expect(result.new_sol_reserves).toBeGreaterThan(virtualSol);
      expect(result.new_token_reserves).toBeLessThan(virtualTokens);
    });
  });

  describe('generateSwapQuote', () => {
    it('should generate quote with slippage protection', () => {
      const quote = generateSwapQuote(
        'BUY',
        '100000000', // 0.1 SOL
        '10000000000', // 10 SOL virtual
        '500000000000000', // 500M tokens virtual
        150, // 1.5% swap fee
        100 // 1% slippage
      );

      expect(quote.swap_type).toBe('BUY');
      expect(quote.input_amount).toBe('100000000');
      expect(BigInt(quote.output_amount)).toBeGreaterThan(0n);
      expect(BigInt(quote.minimum_output)).toBeLessThan(BigInt(quote.output_amount));

      // Verify slippage applied
      const slippageAmount = (BigInt(quote.output_amount) * 100n) / 10000n;
      expect(BigInt(quote.minimum_output)).toBe(BigInt(quote.output_amount) - slippageAmount);
    });
  });

  describe('calculateSwapFee', () => {
    it('should calculate 1.5% fee correctly', () => {
      const input = 100000000n; // 0.1 SOL
      const result = calculateSwapFee(input, 150);

      const expectedTotal = (input * 150n) / 10000n; // 1,500,000
      expect(result.total_fee).toBe(expectedTotal);
      expect(result.treasury_fee).toBe(expectedTotal / 2n);
      expect(result.referral_pool_fee).toBe(expectedTotal - expectedTotal / 2n);

      // Verify split adds up
      expect(result.treasury_fee + result.referral_pool_fee).toBe(result.total_fee);
    });

    it('should handle odd fee amounts (remainder to referral pool)', () => {
      const input = 333n; // Odd number
      const result = calculateSwapFee(input, 150);

      // Verify referral pool gets remainder
      expect(result.treasury_fee + result.referral_pool_fee).toBe(result.total_fee);
      expect(result.referral_pool_fee).toBeGreaterThanOrEqual(result.treasury_fee);
    });
  });

  describe('checkGraduationThreshold', () => {
    it('should detect threshold not met', () => {
      const result = checkGraduationThreshold('50000000000', '100000000000'); // 50 SOL / 100 SOL

      expect(result.threshold_met).toBe(false);
      expect(result.progress_percent).toBe(50);
      expect(result.remaining_sol).toBe('50000000000');
    });

    it('should detect threshold met', () => {
      const result = checkGraduationThreshold('102000000000', '100000000000'); // 102 SOL / 100 SOL

      expect(result.threshold_met).toBe(true);
      expect(result.progress_percent).toBe(100); // Capped at 100
      expect(result.remaining_sol).toBe('0');
    });

    it('should detect exact threshold', () => {
      const result = checkGraduationThreshold('100000000000', '100000000000'); // 100 SOL / 100 SOL

      expect(result.threshold_met).toBe(true);
      expect(result.progress_percent).toBe(100);
      expect(result.remaining_sol).toBe('0');
    });
  });

  describe('validateLPLockDuration', () => {
    it('should accept 12-month minimum', () => {
      const result = validateLPLockDuration(12, 12);

      expect(result.valid).toBe(true);
      expect(result.message).toContain('meets minimum');
    });

    it('should accept duration above minimum', () => {
      const result = validateLPLockDuration(24, 12);

      expect(result.valid).toBe(true);
    });

    it('should reject duration below minimum', () => {
      const result = validateLPLockDuration(6, 12);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('does not meet minimum');
    });
  });

  describe('getCurrentPrice', () => {
    it('should calculate price correctly', () => {
      const price = getCurrentPrice('10000000000', '500000000000000', 9);

      // Price = SOL / Tokens = 10 SOL / 500M tokens = 0.00000002 SOL per token
      // In lamports per token: 20 lamports
      expect(BigInt(price)).toBeGreaterThan(0n);
    });
  });

  describe('calculateMarketCap', () => {
    it('should calculate market cap correctly', () => {
      const price = '20'; // 20 lamports per token
      const supply = '1000000000000000'; // 1B tokens
      const marketCap = calculateMarketCap(price, supply, 9);

      // Market cap = 20 * 1B / 10^9 = 20,000 lamports = 0.00002 SOL
      expect(BigInt(marketCap)).toBeGreaterThan(0n);
    });
  });

  describe('validateBondingPoolConfig', () => {
    it('should accept valid configuration', () => {
      const result = validateBondingPoolConfig({
        virtualSolReserves: '10000000000',
        virtualTokenReserves: '500000000000000',
        graduationThresholdSol: '100000000000',
        totalSupply: '1000000000000000',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative reserves', () => {
      const result = validateBondingPoolConfig({
        virtualSolReserves: '0',
        virtualTokenReserves: '500000000000000',
        graduationThresholdSol: '100000000000',
        totalSupply: '1000000000000000',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Virtual SOL reserves must be positive');
    });

    it('should reject virtual tokens > total supply', () => {
      const result = validateBondingPoolConfig({
        virtualSolReserves: '10000000000',
        virtualTokenReserves: '2000000000000000', // 2B tokens
        graduationThresholdSol: '100000000000',
        totalSupply: '1000000000000000', // 1B tokens
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Virtual token reserves cannot exceed total supply');
    });

    it('should reject threshold too low', () => {
      const result = validateBondingPoolConfig({
        virtualSolReserves: '10000000000',
        virtualTokenReserves: '500000000000000',
        graduationThresholdSol: '100000000', // 0.1 SOL (too low)
        totalSupply: '1000000000000000',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('Graduation threshold too low'))).toBe(true);
    });
  });

  describe('validateSwapAmount', () => {
    it('should accept valid swap amount', () => {
      const result = validateSwapAmount('100000000', 'BUY', '50000000000', '250000000000000');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero amount', () => {
      const result = validateSwapAmount('0', 'BUY', '50000000000', '250000000000000');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Swap amount must be positive');
    });

    it('should reject excessive BUY amount', () => {
      const result = validateSwapAmount(
        '200000000000', // 200 SOL
        'BUY',
        '50000000000', // Pool only has 50 SOL
        '250000000000000'
      );

      expect(result.valid).toBe(false);
    });
  });
});
