import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const EVENT_ID = 'screenshot-flow-test';

test.describe('Screenshot capture flow', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('capture home, add expense, and person dialog screenshots', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, '1-home.png') });

    // 2. Go directly to a fresh edit page for the screenshot
    await page.goto(`/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, '2-tambah-pengeluaran.png') });

    // 3. Open the add-person dialog
    await page.locator('[data-testid="add-member-button"]').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUTPUT_DIR, '3-person-dialog.png') });

    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  });
});
