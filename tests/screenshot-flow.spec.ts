import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('Screenshot capture flow', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('capture home, add expense, and person dialog screenshots', async ({
    page,
  }) => {
    // Use mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Capture console messages
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

    // 2. Click the "+" floating button
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUTPUT_DIR, '2-tambah-pengeluaran.png') });

    // 3. Click "Tambah" to open person dialog (dashed circular add-person button)
    await page.locator('button.border-dashed').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUTPUT_DIR, '3-person-dialog.png') });

    // Log any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  });
});
