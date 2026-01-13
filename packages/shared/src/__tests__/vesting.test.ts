/**
 * FASE 5 Vesting Calculation Tests
 * Unit tests for server-side vesting calculations
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateClaimable,
  isCliffPassed,
  getCliffRemainingDays,
  getVestingTimeline,
  canClaimNow,
} from '../utils/vesting';
import type { VestingSchedule, VestingAllocation } from '../types/fase5';

describe('Vesting Calculations', () => {
  // Helper to create test schedule
  const createSchedule = (overrides: Partial<VestingSchedule> = {}): VestingSchedule => ({
    id: 'test-schedule-1',
    round_id: 'test-round-1',
    token_address: '0xTEST',
    chain: 'ethereum',
    total_tokens: '1000000',
    tge_percentage: 20,
    tge_at: '2024-01-01T00:00:00Z',
    cliff_months: 3,
    vesting_months: 12,
    interval_type: 'MONTHLY',
    status: 'CONFIRMED',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  const createAllocation = (overrides: Partial<VestingAllocation> = {}): VestingAllocation => ({
    id: 'test-alloc-1',
    schedule_id: 'test-schedule-1',
    round_id: 'test-round-1',
    user_id: 'test-user-1',
    allocation_tokens: '10000',
    claimed_tokens: '0',
    total_claims: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  describe('TGE Unlock', () => {
    it('should unlock TGE percentage immediately', () => {
      const schedule = createSchedule({ tge_percentage: 20 });
      const allocation = createAllocation({ allocation_tokens: '10000' });
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.tge_unlocked).toBe('2000');
      expect(result.available_now).toBe('2000');
    });

    it('should not unlock before TGE', () => {
      const schedule = createSchedule({ tge_at: '2024-01-01T00:00:00Z' });
      const allocation = createAllocation();
      const currentTime = new Date('2023-12-31T23:59:59Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.tge_unlocked).toBe('0');
      expect(result.available_now).toBe('0');
    });

    it('should handle 100% TGE (no vesting)', () => {
      const schedule = createSchedule({
        tge_percentage: 100,
        cliff_months: 0,
        vesting_months: 0,
      });
      const allocation = createAllocation({ allocation_tokens: '10000' });
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.tge_unlocked).toBe('10000');
      expect(result.total_claimable).toBe('10000');
    });
  });

  describe('Cliff Period', () => {
    it('should not unlock vesting before cliff ends', () => {
      const schedule = createSchedule({
        tge_percentage: 20,
        cliff_months: 3,
        tge_at: '2024-01-01T00:00:00Z',
      });
      const allocation = createAllocation({ allocation_tokens: '10000' });
      const currentTime = new Date('2024-03-15T00:00:00Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.tge_unlocked).toBe('2000');
      expect(result.vested_unlocked).toBe('0');
    });

    it('should check cliff passed correctly', () => {
      const schedule = createSchedule({
        cliff_months: 3,
        tge_at: '2024-01-01T00:00:00Z',
      });

      expect(isCliffPassed(schedule, new Date('2024-03-31T23:59:59Z'))).toBe(false);
      expect(isCliffPassed(schedule, new Date('2024-04-01T00:00:00Z'))).toBe(true);
    });

    it('should calculate remaining cliff days', () => {
      const schedule = createSchedule({
        cliff_months: 3,
        tge_at: '2024-01-01T00:00:00Z',
      });

      const remaining = getCliffRemainingDays(schedule, new Date('2024-02-01T00:00:00Z'));
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThan(90);
    });
  });

  describe('Claimed Tokens', () => {
    it('should subtract claimed tokens from available', () => {
      const schedule = createSchedule({ tge_percentage: 20 });
      const allocation = createAllocation({
        allocation_tokens: '10000',
        claimed_tokens: '1000',
      });
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.tge_unlocked).toBe('2000');
      expect(result.already_claimed).toBe('1000');
      expect(result.available_now).toBe('1000');
    });

    it('should return 0 available if all tokens claimed', () => {
      const schedule = createSchedule({ tge_percentage: 100 });
      const allocation = createAllocation({
        allocation_tokens: '10000',
        claimed_tokens: '10000',
      });
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = calculateClaimable(schedule, allocation, currentTime);

      expect(result.available_now).toBe('0');
    });
  });

  describe('Eligibility Checks', () => {
    it('should allow claiming when tokens available', () => {
      const schedule = createSchedule({ tge_percentage: 20, status: 'CONFIRMED' });
      const allocation = createAllocation();
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = canClaimNow(schedule, allocation, currentTime);

      expect(result.can_claim).toBe(true);
    });

    it('should not allow claiming when paused', () => {
      const schedule = createSchedule({ status: 'PAUSED' });
      const allocation = createAllocation();
      const currentTime = new Date('2024-01-01T00:00:01Z');

      const result = canClaimNow(schedule, allocation, currentTime);

      expect(result.can_claim).toBe(false);
      expect(result.reason).toContain('paused');
    });

    it('should not allow claiming before TGE', () => {
      const schedule = createSchedule({ tge_at: '2024-01-01T00:00:00Z', status: 'CONFIRMED' });
      const allocation = createAllocation();
      const currentTime = new Date('2023-12-31T23:59:59Z');

      const result = canClaimNow(schedule, allocation, currentTime);

      expect(result.can_claim).toBe(false);
    });
  });

  describe('Timeline Generation', () => {
    it('should generate correct timeline', () => {
      const schedule = createSchedule({
        tge_percentage: 20,
        cliff_months: 3,
        vesting_months: 12,
        tge_at: '2024-01-01T00:00:00Z',
      });

      const timeline = getVestingTimeline(schedule, new Date('2024-01-01T00:00:01Z'));

      expect(timeline.tge_date).toBe('2024-01-01T00:00:00.000Z');
      expect(timeline.cliff_end_date).toBeDefined();
      expect(timeline.vesting_end_date).toBeDefined();
      expect(timeline.percent_vested).toBe(20);
    });
  });
});
