import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');
const BASE_URL = 'http://localhost:5173';
const EVENT_ID = 'verify-test-receipt';

async function addPerson(page, name: string) {
  await page.locator('[data-testid="add-member-button"]').click();
  await page.getByPlaceholder('Masukkan nama...').fill(name);
  await page.getByRole('button', { name: 'Tambah' }).last().click();
  await page.waitForTimeout(150);
}

test.describe('Test Receipt flow - current dev server', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('create event, capture result page, verify receipt styling', async ({
    page,
  }) => {
    test.setTimeout(90000);

    await page.context().clearCookies();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });

    // Create new event directly on edit page
    await page.goto(`${BASE_URL}/acara/${EVENT_ID}/edit`);
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add Andi and Budi
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');

    // Title: Test Receipt
    await page.getByPlaceholder('contoh: Starbucks, Makan Siang').fill('Test Receipt');

    // Item 1: Kopi, 15000, assign both Andi and Budi
    const card = page.locator('[data-testid="orphan-items-card"]').first();
    const item1 = card.locator('[data-testid="receipt-item"]').first();
    await item1.locator('input[placeholder="Nama item"]').fill('Kopi');
    await item1.locator('input[inputmode="numeric"]').first().fill('15000');
    await item1.getByRole('button', { name: 'AN' }).click();
    await item1.getByRole('button', { name: 'BU' }).click();

    // Tax: 2000 (no discount, no service charge)
    await page.locator('[data-testid="tax-input"]').fill('2000');

    await page.getByRole('button', { name: 'Simpan & Lanjut Bagi Tagihan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // Screenshots
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'test-receipt-1-top.png') });

    await page.evaluate(() => window.scrollTo(0, 220));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'test-receipt-2-below-green.png') });

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUTPUT_DIR, 'test-receipt-3-person-cards.png') });

    await page.screenshot({ path: join(OUTPUT_DIR, 'test-receipt-4-full.png'), fullPage: true });

    // Expand Andi
    await page.evaluate(() => window.scrollTo(0, 350));
    await page.waitForTimeout(200);
    await page.getByText('Andi', { exact: true }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUTPUT_DIR, 'test-receipt-5-andi-expanded.png') });
  });
});
