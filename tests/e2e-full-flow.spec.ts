import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('E2E full flow', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('complete add expense flow with verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });

    // 1. Go to home and click "+"
    await page.goto('/');
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);

    // 2a. Open person dialog and add Joko
    await page.locator('button.border-dashed').first().click();
    await page.getByPlaceholder('Masukkan nama...').fill('Joko');
    await page.getByRole('button', { name: 'Tambah' }).last().click();
    await page.waitForTimeout(200);

    // 2b. Open dialog and add Eko
    await page.locator('button.border-dashed').first().click();
    await page.getByPlaceholder('Masukkan nama...').fill('Eko');
    await page.getByRole('button', { name: 'Tambah' }).last().click();
    await page.waitForTimeout(200);

    // 2c. Open dialog and add Sukiyem
    await page.locator('button.border-dashed').first().click();
    await page.getByPlaceholder('Masukkan nama...').fill('Sukiyem');
    await page.getByRole('button', { name: 'Tambah' }).last().click();
    await page.waitForTimeout(200);

    // 2d. Fill Nama Acara
    await page.getByPlaceholder('contoh: Starbucks, Makan Siang').fill('Makan Siang');

    // 2e-f. First item: Ayam Goreng, 60000
    await page.getByPlaceholder('Nama item').first().fill('Ayam Goreng');
    await page.locator('input[inputmode="numeric"]').first().fill('60000');

    // 2g. Assign Joko and Sukiyem to first item (click avatars with JO and SU)
    const item1 = page.locator('form').locator('div.bg-white.border.border-gray-100').first();
    await item1.getByRole('button', { name: 'JO' }).click();
    await item1.getByRole('button', { name: 'SU' }).click();

    // 2h. Add second item
    await page.getByRole('button', { name: 'Tambah Item Baru' }).click();
    await page.waitForTimeout(100);

    // 2i. Second item: Pizza, 125000
    const item2Inputs = page.locator('form').locator('div.bg-white.border.border-gray-100').nth(1);
    await item2Inputs.getByPlaceholder('Nama item').fill('Pizza');
    await item2Inputs.locator('input[inputmode="numeric"]').first().fill('125000');

    // 2j. Assign all three to second item
    const item2 = page.locator('form').locator('div.bg-white.border.border-gray-100').nth(1);
    await item2.getByRole('button', { name: 'JO' }).click();
    await item2.getByRole('button', { name: 'EK' }).click();
    await item2.getByRole('button', { name: 'SU' }).click();

    // 2k. Add third item
    await page.getByRole('button', { name: 'Tambah Item Baru' }).click();
    await page.waitForTimeout(100);

    // 2l. Third item: Jus Alpukat, 96000
    const item3Inputs = page.locator('form').locator('div.bg-white.border.border-gray-100').nth(2);
    await item3Inputs.getByPlaceholder('Nama item').fill('Jus Alpukat');
    await item3Inputs.locator('input[inputmode="numeric"]').first().fill('96000');

    // 2m. Assign all three to third item
    const item3 = page.locator('form').locator('div.bg-white.border.border-gray-100').nth(2);
    await item3.getByRole('button', { name: 'JO' }).click();
    await item3.getByRole('button', { name: 'EK' }).click();
    await item3.getByRole('button', { name: 'SU' }).click();

    // 2n. Pajak 28100
    await page.locator('input[inputmode="numeric"]').nth(3).fill('28100');

    // 2o. Biaya Layanan 10000
    await page.locator('input[inputmode="numeric"]').nth(4).fill('10000');

    // 2p. Diskon 40000
    await page.locator('input[inputmode="numeric"]').nth(5).fill('40000');

    // 2q. Screenshot of filled form
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUTPUT_DIR, 'e2e-filled-form.png') });

    // 2r. Click Simpan
    await page.getByRole('button', { name: 'Simpan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // 3a. Screenshot of result page
    await page.screenshot({ path: join(OUTPUT_DIR, 'e2e-result-page.png') });

    // 3b. Verify "Makan Siang" title
    await expect(page.getByRole('heading', { name: 'Makan Siang' })).toBeVisible();

    // 3c. Verify total tagihan is shown
    await expect(page.getByText('Total tagihan')).toBeVisible();
    await expect(page.getByText(/Rp/).first()).toBeVisible();

    // 3d. Verify each person has a breakdown card
    await expect(page.getByText('Joko', { exact: true })).toBeVisible();
    await expect(page.getByText('Eko', { exact: true })).toBeVisible();
    await expect(page.getByText('Sukiyem', { exact: true })).toBeVisible();

    // 3e. Verify share buttons
    await expect(page.getByRole('button', { name: /Salin Semua|Tersalin!/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'WhatsApp' })).toBeVisible();
  });
});
