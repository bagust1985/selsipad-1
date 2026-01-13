/**
 * FASE 6 E2E Tests: Referral System
 * Tests referral code generation, activation, and claim flow
 */

import { test, expect } from '@playwright/test';

test.describe('Referral System', () => {
  test('should generate unique referral code', async ({ page }) => {
    await page.goto('/referral');

    // Click generate code
    await page.click('[data-testid="generate-referral-code"]');

    // Should show code
    const code = await page.locator('[data-testid="referral-code"]').textContent();
    expect(code).toHaveLength(8);

    // Should show referral link
    await expect(page.getByText(/selsipad.com\/\?ref=/)).toBeVisible();
  });

  test('should display referral stats', async ({ page }) => {
    await page.goto('/referral');

    // Should show stats
    await expect(page.getByText('Total Referrals')).toBeVisible();
    await expect(page.getByText('Active Referrals')).toBeVisible();
    await expect(page.getByText('Total Earned')).toBeVisible();
  });

  test('new user can use referral code', async ({ page, context }) => {
    // Get referral link
    await page.goto('/referral');
    const referralLink = await page.locator('[data-testid="referral-link"]').textContent();
    const code = referralLink?.split('=')[1];

    // Open new page as new user
    const newPage = await context.newPage();
    await newPage.goto(`/?ref=${code}`);

    // Sign up with referral code pre-filled
    await newPage.goto('/signup');
    const inputValue = await newPage.locator('[name="referral_code"]').inputValue();
    expect(inputValue).toBe(code);
  });

  test('should show referral as pending until activated', async ({ page }) => {
    await page.goto('/referral/my-referrals');

    // Should show pending referrals
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Not yet activated')).toBeVisible();
  });

  test('referral activates after qualifying event', async ({ page }) => {
    // TODO: Simulate qualifying event (Blue Check purchase)
    await page.goto('/referral/my-referrals');

    // Should show activated
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.locator('[data-testid="active-badge"]')).toBeVisible();
  });
});

test.describe('Referral Claim with Gating', () => {
  test('non-Blue Check user cannot claim', async ({ page }) => {
    await page.goto('/referral/rewards');

    // Click claim
    await page.click('[data-testid="claim-rewards"]');

    // Should show error
    await expect(page.getByText(/Blue Check required/i)).toBeVisible();
  });

  test('user without active referrals cannot claim', async ({ page }) => {
    // TODO: Login as Blue Check user with no active referrals
    await page.goto('/referral/rewards');

    await page.click('[data-testid="claim-rewards"]');

    // Should show error
    await expect(page.getByText(/at least 1 active referral/i)).toBeVisible();
  });

  test('eligible user can claim rewards', async ({ page }) => {
    // TODO: Login as Blue Check user with active referrals
    await page.goto('/referral/rewards');

    // Should show claimable amount
    await expect(page.getByText(/Claimable/i)).toBeVisible();

    // Select chain and asset
    await page.click('[data-testid="select-ethereum"]');
    await page.click('[data-testid="select-usdt"]');

    // Click claim
    await page.click('[data-testid="claim-rewards"]');

    // Should show success
    await expect(page.getByText(/Claim submitted/i)).toBeVisible();
  });

  test('should display referral leaderboard', async ({ page }) => {
    await page.goto('/referral/leaderboard');

    // Should show top referrers
    await expect(page.getByText('Rank')).toBeVisible();
    await expect(page.getByText('Active Referrals')).toBeVisible();

    // Should have at least header row
    const rows = await page.locator('table tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});
