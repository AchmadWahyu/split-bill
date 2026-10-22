import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const EVENT_ID = 'verify-makan-malam';

async function addPerson(page, name: string) {
  await page.locator('[data-testid="add-member-button"]').click();
  await page.getByPlaceholder('Masukkan nama...').fill(name);
  await page.getByRole('button', { name: 'Tambah' }).last().click();
  await page.waitForTimeout(150);
}

test.describe('Makan Malam flow verification', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('create event, capture result page, verify receipt styling', async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Go to a fresh edit page
    await page.goto(`/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add Andi and Budi
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');

    // Title: Makan Malam
    await page
      .getByPlaceholder('contoh: Starbucks, Makan Siang')
      .fill('Makan Malam');

    // Item 1: Nasi Goreng, 25000, assign Andi and Budi
    const card = page.locator('[data-testid="orphan-items-card"]').first();
    const item1 = card.locator('[data-testid="receipt-item"]').first();
    await item1.locator('input[placeholder="Nama item"]').fill('Nasi Goreng');
    await item1.locator('input[inputmode="numeric"]').first().fill('25000');
    await item1.getByRole('button', { name: 'AN' }).click();
    await item1.getByRole('button', { name: 'BU' }).click();

    // Item 2: Es Teh, 8000, assign only Andi
    await card.getByRole('button', { name: 'Tambah Item' }).click();
    const item2 = card.locator('[data-testid="receipt-item"]').nth(1);
    await item2.locator('input[placeholder="Nama item"]').fill('Es Teh');
    await item2.locator('input[inputmode="numeric"]').first().fill('8000');
    await item2.getByRole('button', { name: 'AN' }).click();

    // Tax: 5000, Discount: 3000
    await page.locator('[data-testid="tax-input"]').fill('5000');
    await page.locator('[data-testid="discount-input"]').fill('3000');

    await page.getByRole('button', { name: 'Simpan & Lanjut Bagi Tagihan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // 2. Screenshots
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'makan-malam-1-top.png') });

    await page.evaluate(() => window.scrollTo(0, 250));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'makan-malam-2-ringkasan.png') });

    await page.evaluate(() => window.scrollTo(0, 450));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'makan-malam-3-person-cards.png') });

    await page.screenshot({ path: join(OUTPUT_DIR, 'makan-malam-4-full-page.png'), fullPage: true });

    // 3. Verifications
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(200);
    await expect(page.getByText(/Ringkasan|Subtotal/).first()).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await expect(page.getByText('Andi', { exact: true })).toBeVisible();
    await expect(page.getByText('Budi', { exact: true })).toBeVisible();

    // Expand Andi
    await page.getByText('Andi', { exact: true }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUTPUT_DIR, 'makan-malam-5-andi-expanded.png') });

    await expect(page.getByText('Nasi Goreng').first()).toBeVisible();
    await expect(page.getByText('Es Teh').first()).toBeVisible();
    await expect(page.getByText('Total').first()).toBeVisible();
  });
});
