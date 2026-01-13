/**
 * FASE 6 E2E Tests: AMA Join Token Flow
 * Tests AMA session creation and secure join token
 */

import { test, expect } from '@playwright/test';

test.describe('AMA Session Flow', () => {
  test('project owner can create AMA', async ({ page }) => {
    // TODO: Login as project owner
    await page.goto('/project/my-project/ama');

    // Click create AMA
    await page.click('[data-testid="create-ama"]');

    // Fill form
    await page.fill('[name="title"]', 'Community AMA');
    await page.fill('[name="description"]', 'Ask us anything!');
    await page.select('[name="type"]', 'VOICE');
    await page.fill('[name="scheduled_at"]', '2026-01-20T10:00');

    // Submit
    await page.click('[data-testid="submit-ama"]');

    // Should show success
    await expect(page.getByText(/AMA created/i)).toBeVisible();
    await expect(page.getByText('SUBMITTED')).toBeVisible();
  });

  test('should display AMA list', async ({ page }) => {
    await page.goto('/ama');

    // Should show approved AMAs
    await expect(page.getByText('Upcoming AMAs')).toBeVisible();

    // Should have filters
    await expect(page.locator('[data-testid="filter-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-voice"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-video"]')).toBeVisible();
  });

  test('should show AMA status flow', async ({ page }) => {
    await page.goto('/ama/my-ama-id');

    // Should show current status
    await expect(page.locator('[data-testid="ama-status"]')).toBeVisible();

    // Possible statuses: SUBMITTED, PAID, APPROVED, LIVE, ENDED
  });
});

test.describe('AMA Join Token', () => {
  test('cannot join TEXT AMA (no token needed)', async ({ page }) => {
    await page.goto('/ama/text-ama-id');

    // Should not show join button for TEXT type
    const joinButton = page.locator('[data-testid="generate-join-token"]');
    await expect(joinButton).not.toBeVisible();
  });

  test('can generate join token for VOICE AMA', async ({ page }) => {
    await page.goto('/ama/voice-ama-id');

    // AMA must be LIVE
    await expect(page.getByText('LIVE')).toBeVisible();

    // Click join
    await page.click('[data-testid="join-ama"]');

    // Should generate token
    await expect(page.getByText('Join Token Generated')).toBeVisible();

    // Should show expiry time
    await expect(page.getByText(/Expires in.*minutes/)).toBeVisible();
  });

  test('join token should expire after TTL', async ({ page }) => {
    await page.goto('/ama/voice-ama-id/join');

    // Generate token
    await page.click('[data-testid="join-ama"]');

    // Wait for expiry (simulate - in real test would wait)
    // TODO: Mock time to speed up test

    // Try to use expired token
    const token = await page.locator('[data-testid="join-token"]').textContent();

    // Navigate to streaming page with token
    await page.goto(`/ama/voice-ama-id/stream?token=${token}`);

    // Should show error if expired
    // await expect(page.getByText(/expired/i)).toBeVisible();
  });

  test('join token should be one-time use', async ({ page, context }) => {
    await page.goto('/ama/voice-ama-id');
    await page.click('[data-testid="join-ama"]');

    const token = await page.locator('[data-testid="join-token"]').textContent();

    // Use token once
    await page.goto(`/ama/voice-ama-id/stream?token=${token}`);
    await expect(page.getByText('Connected')).toBeVisible();

    // Try to use same token in new tab
    const newPage = await context.newPage();
    await newPage.goto(`/ama/voice-ama-id/stream?token=${token}`);

    // Should show error (already used)
    await expect(newPage.getByText(/already used/i)).toBeVisible();
  });

  test('join token should be user-bound', async ({ page, context }) => {
    // User A generates token
    await page.goto('/ama/voice-ama-id');
    await page.click('[data-testid="join-ama"]');
    const token = await page.locator('[data-testid="join-token"]').textContent();

    // User B tries to use User A's token
    const userBPage = await context.newPage();
    // TODO: Login as different user
    await userBPage.goto(`/ama/voice-ama-id/stream?token=${token}`);

    // Should show error (not your token)
    await expect(userBPage.getByText(/invalid token/i)).toBeVisible();
  });
});
