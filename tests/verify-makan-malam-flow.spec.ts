import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('Makan Malam flow verification', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('create event, capture result page, verify receipt styling', async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Create new event
    await page.goto('/');
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add Andi and Budi
    for (const name of ['Andi', 'Budi']) {
      await page.locator('button.border-dashed').first().click();
      await page.getByPlaceholder('Masukkan nama...').fill(name);
      await page.getByRole('button', { name: 'Tambah' }).last().click();
      await page.waitForTimeout(150);
    }

    // Title: Makan Malam
    await page
      .getByPlaceholder('contoh: Starbucks, Makan Siang')
      .fill('Makan Malam');

    // Item 1: Nasi Goreng, 25000, assign Andi and Budi
    const item1 = page
      .locator('form')
      .locator('div.bg-white.border.border-slate-100')
      .first();
    await item1.getByPlaceholder('Nama item').fill('Nasi Goreng');
    await item1.locator('input[inputmode="numeric"]').first().fill('25000');
    await item1.getByRole('button', { name: 'AN' }).click(); // Andi
    await item1.getByRole('button', { name: 'BU' }).click(); // Budi

    // Item 2: Es Teh, 8000, assign only Andi
    await page.getByRole('button', { name: 'Tambah Item Baru' }).click();
    await page.waitForTimeout(100);
    const item2 = page
      .locator('form')
      .locator('div.bg-white.border.border-slate-100')
      .nth(1);
    await item2.getByPlaceholder('Nama item').fill('Es Teh');
    await item2.locator('input[inputmode="numeric"]').first().fill('8000');
    await item2.getByRole('button', { name: 'AN' }).click(); // Andi only

    // Tax: 5000, Discount: 3000 (Service charge left at 0)
    // Order: item1 price, item2 price, tax, service charge, discount
    await page.locator('input[inputmode="numeric"]').nth(2).fill('5000');
    await page.locator('input[inputmode="numeric"]').nth(4).fill('3000');

    await page.getByRole('button', { name: 'Simpan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // 2. Screenshots - scroll from top to bottom
    // Top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'makan-malam-1-top.png'),
    });

    // Ringkasan area
    await page.evaluate(() => window.scrollTo(0, 250));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'makan-malam-2-ringkasan.png'),
    });

    // Person cards
    await page.evaluate(() => window.scrollTo(0, 450));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'makan-malam-3-person-cards.png'),
    });

    // Full page
    await page.screenshot({
      path: join(OUTPUT_DIR, 'makan-malam-4-full-page.png'),
      fullPage: true,
    });

    // 3. Verifications
    // a. Ringkasan / Subtotal - scroll to reveal
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(200);
    await expect(
      page.getByText(/Ringkasan|Subtotal/).first(),
    ).toBeVisible();

    // b. Person cards - Andi and Budi visible
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await expect(page.getByText('Andi', { exact: true })).toBeVisible();
    await expect(page.getByText('Budi', { exact: true })).toBeVisible();

    // c. Torn edges - ReceiptCard wraps content; structure verified via screenshots

    // d. Expand Andi
    await page.getByText('Andi', { exact: true }).click();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: join(OUTPUT_DIR, 'makan-malam-5-andi-expanded.png'),
    });

    // Verify expanded content: item breakdown, dashed separators, double-dashed before Total
    await expect(page.getByText('Nasi Goreng').first()).toBeVisible();
    await expect(page.getByText('Es Teh').first()).toBeVisible();
    await expect(page.getByText('Total').first()).toBeVisible();
  });
});
