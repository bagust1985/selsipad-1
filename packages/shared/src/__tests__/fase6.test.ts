/**
 * FASE 6 Unit Tests
 * Tests for referral, fee split, and AMA token utilities
 */

import { describe, it, expect } from '@jest/globals';
import { calculateFeeSplit } from '../validators/fase6';
import {
  checkClaimEligibility,
  calculateReferralStatistics,
  getClaimableForChainAsset,
} from '../utils/referral';

describe('FASE 6: Fee Split Calculation', () => {
  it('should calculate exact 70/30 split', () => {
    const totalAmount = 10000000n; // $10 in 6 decimals
    const { treasury_amount, referral_pool_amount } = calculateFeeSplit(totalAmount);

    expect(treasury_amount).toBe(7000000n); // 70%
    expect(referral_pool_amount).toBe(3000000n); // 30%
    expect(treasury_amount + referral_pool_amount).toBe(totalAmount);
  });

  it('should handle remainder correctly', () => {
    const totalAmount = 100n;
    const { treasury_amount, referral_pool_amount } = calculateFeeSplit(totalAmount);

    expect(treasury_amount).toBe(70n);
    expect(referral_pool_amount).toBe(30n);
    expect(treasury_amount + referral_pool_amount).toBe(100n);
  });

  it('should handle large amounts', () => {
    const totalAmount = 1000000000000000000n; // 1 token with 18 decimals
    const { treasury_amount, referral_pool_amount } = calculateFeeSplit(totalAmount);

    expect(treasury_amount).toBe(700000000000000000n);
    expect(referral_pool_amount).toBe(300000000000000000n);
  });
});

describe('FASE 6: Claim Eligibility Checks', () => {
  it('should reject claim without Blue Check', () => {
    const result = checkClaimEligibility(null, 5, []);
    expect(result.can_claim).toBe(false);
    expect(result.reasons).toContain('You must have Blue Check (ACTIVE) to claim');
  });

  it('should reject claim without active referrals', () => {
    const result = checkClaimEligibility('ACTIVE', 0, []);
    expect(result.can_claim).toBe(false);
    expect(result.reasons).toContain('You must have at least 1 active referral to claim rewards');
  });

  it('should reject claim without claimable rewards', () => {
    const result = checkClaimEligibility('ACTIVE', 5, []);
    expect(result.can_claim).toBe(false);
    expect(result.reasons).toContain('You have no claimable rewards');
  });

  it('should allow claim with all requirements met', () => {
    const mockLedger = [
      { status: 'CLAIMABLE', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
    ];
    const result = checkClaimEligibility('ACTIVE', 5, mockLedger as any);
    expect(result.can_claim).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('should reject revoked Blue Check', () => {
    const mockLedger = [
      { status: 'CLAIMABLE', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
    ];
    const result = checkClaimEligibility('REVOKED', 5, mockLedger as any);
    expect(result.can_claim).toBe(false);
  });
});

describe('FASE 6: Referral Statistics', () => {
  it('should calculate correct statistics', () => {
    const mockLedger = [
      { status: 'CLAIMABLE', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
      { status: 'CLAIMABLE', amount: '2000000', chain: 'ethereum', asset: 'USDT' },
      { status: 'CLAIMED', amount: '5000000', chain: 'ethereum', asset: 'USDT' },
    ];

    const stats = calculateReferralStatistics(10, 8, mockLedger as any);

    expect(stats.total_referrals).toBe(10);
    expect(stats.active_referrals).toBe(8);
    expect(stats.total_earned).toBe('8000000');
    expect(stats.total_claimed).toBe('5000000');
    expect(stats.total_claimable).toBe('3000000');
  });
});

describe('FASE 6: Get Claimable by Chain/Asset', () => {
  it('should sum claimable amounts for specific chain/asset', () => {
    const mockLedger = [
      { id: '1', status: 'CLAIMABLE', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
      { id: '2', status: 'CLAIMABLE', amount: '2000000', chain: 'ethereum', asset: 'USDT' },
      { id: '3', status: 'CLAIMABLE', amount: '500000', chain: 'bsc', asset: 'USDT' },
      { id: '4', status: 'CLAIMED', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
    ];

    const result = getClaimableForChainAsset(mockLedger as any, 'ethereum', 'USDT');

    expect(result.total_amount).toBe(3000000n);
    expect(result.entry_ids).toHaveLength(2);
    expect(result.entry_ids).toContain('1');
    expect(result.entry_ids).toContain('2');
  });

  it('should return zero for non-existent chain/asset', () => {
    const mockLedger = [
      { id: '1', status: 'CLAIMABLE', amount: '1000000', chain: 'ethereum', asset: 'USDT' },
    ];

    const result = getClaimableForChainAsset(mockLedger as any, 'polygon', 'USDC');
    expect(result.total_amount).toBe(0n);
    expect(result.entry_ids).toHaveLength(0);
  });
});

console.log('✅ All FASE 6 unit tests defined. Run with: pnpm test');
