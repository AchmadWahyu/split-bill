import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const EVENT_ID = 'e2e-full-flow-test';

async function addPerson(page, name: string) {
  await page.locator('[data-testid="add-member-button"]').click();
  await page.getByPlaceholder('Masukkan nama...').fill(name);
  await page.getByRole('button', { name: 'Tambah' }).last().click();
  await page.waitForTimeout(100);
}

test.describe('E2E full flow', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('complete add expense flow with verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });

    // 1. Go directly to a fresh edit page
    await page.goto(`/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);

    // 2. Add persons
    await addPerson(page, 'Joko');
    await addPerson(page, 'Eko');
    await addPerson(page, 'Sukiyem');

    // 3. Fill event title
    await page.getByPlaceholder('contoh: Starbucks, Makan Siang').fill('Makan Siang');

    // 4. Fill the default orphan item
    const card = page.locator('[data-testid="orphan-items-card"]').first();
    await card.locator('input[placeholder="Nama item"]').first().fill('Ayam Goreng');
    await card.locator('input[inputmode="numeric"]').first().fill('60000');
    const item1 = card.locator('[data-testid="receipt-item"]').first();
    await item1.getByRole('button', { name: 'JO' }).click();
    await item1.getByRole('button', { name: 'SU' }).click();

    // 5. Add second item
    await card.getByRole('button', { name: 'Tambah Item' }).click();
    const item2 = card.locator('[data-testid="receipt-item"]').nth(1);
    await item2.locator('input[placeholder="Nama item"]').fill('Pizza');
    await item2.locator('input[inputmode="numeric"]').first().fill('125000');
    await item2.getByRole('button', { name: 'JO' }).click();
    await item2.getByRole('button', { name: 'EK' }).click();
    await item2.getByRole('button', { name: 'SU' }).click();

    // 6. Add third item
    await card.getByRole('button', { name: 'Tambah Item' }).click();
    const item3 = card.locator('[data-testid="receipt-item"]').nth(2);
    await item3.locator('input[placeholder="Nama item"]').fill('Jus Alpukat');
    await item3.locator('input[inputmode="numeric"]').first().fill('96000');
    await item3.getByRole('button', { name: 'JO' }).click();
    await item3.getByRole('button', { name: 'EK' }).click();
    await item3.getByRole('button', { name: 'SU' }).click();

    // 7. Fill fees
    await page.locator('[data-testid="tax-input"]').fill('28100');
    await page.locator('[data-testid="service-input"]').fill('10000');
    await page.locator('[data-testid="discount-input"]').fill('40000');

    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUTPUT_DIR, 'e2e-filled-form.png') });

    // 8. Save
    await page.getByRole('button', { name: 'Simpan & Lanjut Bagi Tagihan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // 9. Verify result page
    await page.screenshot({ path: join(OUTPUT_DIR, 'e2e-result-page.png') });
    await expect(page.getByRole('heading', { name: 'Makan Siang' })).toBeVisible();
    await expect(page.getByText('Total Tagihan')).toBeVisible();
    await expect(page.getByText(/Rp/).first()).toBeVisible();

    await expect(page.getByText('Joko', { exact: true })).toBeVisible();
    await expect(page.getByText('Eko', { exact: true })).toBeVisible();
    await expect(page.getByText('Sukiyem', { exact: true })).toBeVisible();

    await expect(page.getByRole('button', { name: /Salin semua|Tersalin!/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /WhatsApp/ })).toBeVisible();
  });
});
