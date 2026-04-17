import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('Result page verification', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('verify Makan Siang result page with receipt aesthetic', async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 900 });

    // Create the event first (fresh browser has no localStorage)
    await page.goto('/');
    await page.locator('a[href^="/acara/"]').first().click();
    await page.waitForURL(/\/acara\/.*\/edit/);

    // Add persons
    for (const name of ['Joko', 'Eko', 'Sukiyem']) {
      await page.locator('button.border-dashed').first().click();
      await page.getByPlaceholder('Masukkan nama...').fill(name);
      await page.getByRole('button', { name: 'Tambah' }).last().click();
      await page.waitForTimeout(150);
    }

    // Fill form
    await page.getByPlaceholder('contoh: Starbucks, Makan Siang').fill('Makan Siang');
    const items = [
      { name: 'Ayam Goreng', price: '60000', assign: ['JO', 'SU'] },
      { name: 'Pizza', price: '125000', assign: ['JO', 'EK', 'SU'] },
      { name: 'Jus Alpukat', price: '96000', assign: ['JO', 'EK', 'SU'] },
    ];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i > 0) await page.getByRole('button', { name: 'Tambah Item Baru' }).click();
      await page.waitForTimeout(100);
      const card = page.locator('form').locator('div.bg-white.border.border-slate-100').nth(i);
      await card.getByPlaceholder('Nama item').fill(item.name);
      await card.locator('input[inputmode="numeric"]').first().fill(item.price);
      for (const init of item.assign) {
        await card.getByRole('button', { name: init }).click();
      }
    }
    await page.locator('input[inputmode="numeric"]').nth(3).fill('28100');
    await page.locator('input[inputmode="numeric"]').nth(4).fill('10000');
    await page.locator('input[inputmode="numeric"]').nth(5).fill('40000');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await page.waitForURL(/\/acara\/[^/]+$/);
    await page.waitForTimeout(500);

    // Screenshot 1: Result page (collapsed state)
    await page.screenshot({
      path: join(OUTPUT_DIR, 'result-page-collapsed.png'),
    });

    // 2. Verify header
    await expect(
      page.getByRole('heading', { name: 'Makan Siang' })
    ).toBeVisible();
    await expect(
      page.getByText('Hasil pembagian tagihan')
    ).toBeVisible();

    // 3. Verify green total card (total amount, person count, item count)
    await expect(page.getByText('Total tagihan')).toBeVisible();
    await expect(page.getByText(/anggota · \d+ item/)).toBeVisible();

    // 4. Receipt summary & person cards verified via screenshots below

    // 5. Verify person cards (Joko, Eko, Sukiyem)
    await expect(page.getByText('Joko', { exact: true })).toBeVisible();
    await expect(page.getByText('Eko', { exact: true })).toBeVisible();
    await expect(page.getByText('Sukiyem', { exact: true })).toBeVisible();

    // 6. Click Joko card to expand
    await page.getByText('Joko', { exact: true }).click();
    await page.waitForTimeout(300);

    // Screenshot 2: Expanded Joko card
    await page.screenshot({
      path: join(OUTPUT_DIR, 'result-page-joko-expanded.png'),
    });

    // Verify expanded content
    await expect(page.getByText('Ayam Goreng').first()).toBeVisible();
    await expect(page.getByText('Pajak (proporsional)').first()).toBeVisible();
  });
});
