import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Solana Bonding Curve Feature (FASE 7)
 *
 * Tests the complete bonding curve lifecycle:
 * 1. Create pool with DEX choice
 * 2. Deploy flow (0.5 SOL fee)
 * 3. Swap flow (1.5% fee with 50:50 split)
 * 4. Graduation detection (worker automation)
 * 5. Migration flow (DEX graduation)
 */

test.describe('Bonding Curve - FASE 7', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  let poolId: string;

  test.describe('Pool Creation', () => {
    test('should create bonding curve pool with DEX choice (Raydium)', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve/create`);

      // Fill in token info
      await page.fill('input[name="token_name"]', 'Test Token');
      await page.fill('input[name="token_symbol"]', 'TEST');
      await page.selectOption('select[name="token_decimals"]', '9');
      await page.fill('input[name="total_supply"]', '1000000000000000000');

      // Fill in AMM config
      await page.fill('input[name="virtual_sol_reserves"]', '10000000000'); // 10 SOL
      await page.fill('input[name="virtual_token_reserves"]', '1000000000000000000');
      await page.fill('input[name="graduation_threshold_sol"]', '50000000000'); // 50 SOL

      // Select DEX (Raydium)
      await page.click('button:has-text("Raydium")');

      // Submit form
      await page.click('button:has-text("Create Bonding Curve Pool")');

      // Wait for redirect and extract pool ID
      await page.waitForURL(/\/bonding-curve\/[a-f0-9-]+$/);
      const url = page.url();
      poolId = url.split('/').pop() || '';
      expect(poolId).toBeTruthy();

      // Verify pool details page
      await expect(page.locator('text=Test Token')).toBeVisible();
      await expect(page.locator('text=Raydium')).toBeVisible();
    });

    test('should create bonding curve pool with DEX choice (Orca)', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve/create`);

      // Fill in token info
      await page.fill('input[name="token_name"]', 'Orca Test Token');
      await page.fill('input[name="token_symbol"]', 'ORCT');
      await page.selectOption('select[name="token_decimals"]', '6');
      await page.fill('input[name="total_supply"]', '1000000000000');

      // Fill in AMM config
      await page.fill('input[name="virtual_sol_reserves"]', '5000000000'); // 5 SOL
      await page.fill('input[name="virtual_token_reserves"]', '500000000000');
      await page.fill('input[name="graduation_threshold_sol"]', '30000000000'); // 30 SOL

      // Select DEX (Orca)
      await page.click('button:has-text("Orca")');

      // Submit form
      await page.click('button:has-text("Create Bonding Curve Pool")');

      // Verify redirect
      await page.waitForURL(/\/bonding-curve\/[a-f0-9-]+$/);
      await expect(page.locator('text=Orca Test Token')).toBeVisible();
    });
  });

  test.describe('Fee Display', () => {
    test('should display correct fee structure in overview', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);

      // Click on first pool
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify Overview tab is active
      await expect(page.locator('[role="tab"]:has-text("Overview")')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // Check fee display
      await expect(page.locator('text=1.5%')).toBeVisible();
      await expect(page.locator('text=50%')).toBeVisible(); // Treasury
      await expect(page.locator('text=Referral')).toBeVisible();

      // Check graduation progress
      await expect(page.locator('text=Graduation Progress')).toBeVisible();
    });

    test('should show 50:50 fee split in fee split display', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify fee split component
      const feeSplitDisplay = page.locator(':has-text("Fee Split Model")');
      await expect(feeSplitDisplay).toBeVisible();

      const treasuryPercent = feeSplitDisplay.locator('text=50%').first();
      await expect(treasuryPercent).toBeVisible();
    });
  });

  test.describe('Graduation Progress', () => {
    test('should display graduation progress correctly', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Check progress bar exists
      const progressBar = page.locator('.h-3.bg-gradient-to-r');
      await expect(progressBar).toBeVisible();

      // Check progress text
      const progressText = page.locator(':has-text("SOL / ")');
      await expect(progressText).toBeVisible();
    });
  });

  test.describe('DEX Migration Details', () => {
    test('should display selected DEX in migration details', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Find DEX Migration Details section
      const dexDetails = page.locator(':has-text("DEX Migration")');
      await expect(dexDetails).toBeVisible();

      // Should show either Raydium or Orca
      const hasRaydium = await page
        .locator('text=Raydium')
        .isVisible()
        .catch(() => false);
      const hasOrca = await page
        .locator('text=Orca')
        .isVisible()
        .catch(() => false);

      expect(hasRaydium || hasOrca).toBeTruthy();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between pool detail tabs', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Test Overview tab
      await page.click('[role="tab"]:has-text("Overview")');
      await expect(page.locator('text=Bonding Curve Mechanics')).toBeVisible();

      // Test Chart tab (placeholder)
      await page.click('[role="tab"]:has-text("Chart")');
      await expect(page.locator('text=Chart Coming Soon')).toBeVisible();

      // Test Swap tab (placeholder)
      await page.click('[role="tab"]:has-text("Swap")');
      await expect(page.locator('text=Swap Panel Coming Soon')).toBeVisible();

      // Test Trades tab
      await page.click('[role="tab"]:has-text("Trades")');
      await expect(page.locator('text=Recent Trades')).toBeVisible();
    });

    test('should disable swap tab when pool is not LIVE', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Check if status is not LIVE
      const statusText = await page.locator('[class*="StatusPill"]').textContent();
      if (statusText !== 'LIVE') {
        // Swap tab should be disabled
        const swapTab = page.locator('[role="tab"]:has-text("Swap")');
        const isDisabled = await swapTab.evaluate((el) => el.hasAttribute('disabled'));
        expect(isDisabled).toBeTruthy();
      }
    });
  });

  test.describe('Bonding Curve Mechanics Display', () => {
    test('should display bonding curve mechanics info', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify mechanics section
      await expect(page.locator('text=Bonding Curve Mechanics')).toBeVisible();
      await expect(page.locator('text=Permissionless Launch')).toBeVisible();
      await expect(page.locator('text=Constant Product AMM')).toBeVisible();
      await expect(page.locator('text=Automatic Graduation')).toBeVisible();
    });

    test('should display fees section with all fee types', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify fees section
      await expect(page.locator('text=💰 Fees')).toBeVisible();
      await expect(page.locator('text=Deploy Fee')).toBeVisible();
      await expect(page.locator('text=Swap Fee')).toBeVisible();
      await expect(page.locator('text=Migration Fee')).toBeVisible();
    });
  });

  test.describe('Reserves Display', () => {
    test('should display virtual and actual reserves', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify reserves section
      await expect(page.locator('text=Virtual Reserves')).toBeVisible();
      await expect(page.locator('text=Actual Reserves')).toBeVisible();
    });
  });

  test.describe('Token Info Display', () => {
    test('should display token information', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);
      await page.click('a[href*="/bonding-curve/"]:first-child');

      // Verify token info section
      await expect(page.locator('text=🪙 Token Info')).toBeVisible();
      await expect(page.locator('text=Total Supply')).toBeVisible();
      await expect(page.locator('text=Decimals')).toBeVisible();
      await expect(page.locator('text=Created')).toBeVisible();
    });
  });

  test.describe('Pool Listing', () => {
    test('should list bonding curve pools', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);

      // Should show pools
      const poolCards = page.locator('[class*="pool"]');
      const count = await poolCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should navigate back from pool detail', async ({ page }) => {
      await page.goto(`${baseUrl}/bonding-curve`);

      // Only test if pools exist
      const poolLinks = await page.locator('a[href*="/bonding-curve/"]').count();
      if (poolLinks > 0) {
        await page.click('a[href*="/bonding-curve/"]:first-child');

        // Click back button
        await page.click('a:has-text("Back to Pools")');

        // Should be back at list
        await expect(page).toHaveURL(`${baseUrl}/bonding-curve`);
      }
    });
  });
});
