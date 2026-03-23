import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('Current state screenshots', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('capture home, add expense, and result page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, 'current-1-home.png') });

    // 2. Click "+" and go to add expense page
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, 'current-2-add-expense.png') });

    // 3. Go back to home
    await page.goto('/');
    await page.waitForTimeout(500);

    // Check if there are event cards (from previous E2E test)
    const eventCards = page.locator('[data-slot="card"]');
    const count = await eventCards.count();

    if (count > 0) {
      // Click first event to see result page
      await eventCards.first().click();
      await page.waitForURL(/\/acara\/[^/]+$/);
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUTPUT_DIR, 'current-3-result-page.png') });
    } else {
      // No events - take screenshot of empty home
      await page.screenshot({ path: join(OUTPUT_DIR, 'current-3-home-no-events.png') });
    }
  });
});
