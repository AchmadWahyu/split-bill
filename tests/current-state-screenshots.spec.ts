import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const EVENT_ID = 'current-state-test';

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

    // 2. Go to a fresh edit page
    await page.goto(`/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, 'current-2-add-expense.png') });

    // 3. Go back to home
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click first event card if any exist (cards show person count + amount)
    const eventCards = page.locator('button').filter({ hasText: /\d+\s+orang/ });
    const count = await eventCards.count();

    if (count > 0) {
      await eventCards.first().click();
      await page.waitForURL(/\/acara\/[^/]+$/);
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUTPUT_DIR, 'current-3-result-page.png') });
    } else {
      await page.screenshot({ path: join(OUTPUT_DIR, 'current-3-home-no-events.png') });
    }
  });
});
