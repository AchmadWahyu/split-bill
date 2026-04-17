import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const BASE_URL = 'http://localhost:5175';

test.describe('Test Receipt flow - port 5175', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('create event, capture result page, verify receipt styling', async ({
    page,
  }) => {
    test.setTimeout(90000);

    // Fresh context - clear storage
    await page.context().clearCookies();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Create new event
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add Andi and Budi
    for (const name of ['Andi', 'Budi']) {
      await page.locator('button.border-dashed').first().click();
      await page.getByPlaceholder('Masukkan nama...').fill(name);
      await page.getByRole('button', { name: 'Tambah' }).last().click();
      await page.waitForTimeout(150);
    }

    // Title: Test Receipt
    await page
      .getByPlaceholder('contoh: Starbucks, Makan Siang')
      .fill('Test Receipt');

    // Item 1: Kopi, 15000, assign both Andi and Budi
    const item1 = page
      .locator('form')
      .locator('div.bg-white.border.border-slate-100')
      .first();
    await item1.getByPlaceholder('Nama item').fill('Kopi');
    await item1.locator('input[inputmode="numeric"]').first().fill('15000');
    await item1.getByRole('button', { name: 'AN' }).click();
    await item1.getByRole('button', { name: 'BU' }).click();

    // Tax: 2000 (no discount, no service charge)
    await page.locator('input[inputmode="numeric"]').nth(2).fill('2000');

    await page.getByRole('button', { name: 'Simpan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // 2. Screenshots - top of page (green card + what's below)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'test-receipt-1-top.png'),
    });

    // Scroll down - Ringkasan area
    await page.evaluate(() => window.scrollTo(0, 220));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'test-receipt-2-below-green.png'),
    });

    // Person cards area
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'test-receipt-3-person-cards.png'),
    });

    // Full page
    await page.screenshot({
      path: join(OUTPUT_DIR, 'test-receipt-4-full.png'),
      fullPage: true,
    });

    // Expand Andi
    await page.evaluate(() => window.scrollTo(0, 350));
    await page.waitForTimeout(200);
    await page.getByText('Andi', { exact: true }).click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'test-receipt-5-andi-expanded.png'),
    });
  });
});
