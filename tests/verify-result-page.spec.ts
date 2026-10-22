import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const EVENT_ID = 'verify-result-page';

async function addPerson(page, name: string) {
  await page.locator('[data-testid="add-member-button"]').click();
  await page.getByPlaceholder('Masukkan nama...').fill(name);
  await page.getByRole('button', { name: 'Tambah' }).last().click();
  await page.waitForTimeout(150);
}

test.describe('Result page verification', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('verify Makan Siang result page with receipt aesthetic', async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 900 });

    // Go directly to a fresh edit page
    await page.goto(`/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add persons
    for (const name of ['Joko', 'Eko', 'Sukiyem']) {
      await addPerson(page, name);
    }

    // Fill form
    await page.getByPlaceholder('contoh: Starbucks, Makan Siang').fill('Makan Siang');
    const card = page.locator('[data-testid="orphan-items-card"]').first();
    const items = [
      { name: 'Ayam Goreng', price: '60000', assign: ['JO', 'SU'] },
      { name: 'Pizza', price: '125000', assign: ['JO', 'EK', 'SU'] },
      { name: 'Jus Alpukat', price: '96000', assign: ['JO', 'EK', 'SU'] },
    ];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i > 0) await card.getByRole('button', { name: 'Tambah Item' }).click();
      await page.waitForTimeout(100);
      const row = card.locator('[data-testid="receipt-item"]').nth(i);
      await row.locator('input[placeholder="Nama item"]').fill(item.name);
      await row.locator('input[inputmode="numeric"]').first().fill(item.price);
      for (const init of item.assign) {
        await row.getByRole('button', { name: init }).click();
      }
    }
    await page.locator('[data-testid="tax-input"]').fill('28100');
    await page.locator('[data-testid="service-input"]').fill('10000');
    await page.locator('[data-testid="discount-input"]').fill('40000');
    await page.getByRole('button', { name: 'Simpan & Lanjut Bagi Tagihan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // Screenshot 1: Result page (collapsed state)
    await page.screenshot({ path: join(OUTPUT_DIR, 'result-page-collapsed.png') });

    // Verify header
    await expect(page.getByRole('heading', { name: 'Makan Siang' })).toBeVisible();
    await expect(page.getByText('Total Tagihan')).toBeVisible();

    // Verify green total card (total amount, person count, item count)
    await expect(page.getByText(/\d+ Anggota/)).toBeVisible();
    await expect(page.getByText(/\d+ Item/)).toBeVisible();

    // Verify person cards
    await expect(page.getByText('Joko', { exact: true })).toBeVisible();
    await expect(page.getByText('Eko', { exact: true })).toBeVisible();
    await expect(page.getByText('Sukiyem', { exact: true })).toBeVisible();

    // Expand Joko card
    await page.getByText('Joko', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUTPUT_DIR, 'result-page-joko-expanded.png') });

    await expect(page.getByText('Ayam Goreng').first()).toBeVisible();
    await expect(page.getByText('Pajak (proporsional)').first()).toBeVisible();
  });
});
