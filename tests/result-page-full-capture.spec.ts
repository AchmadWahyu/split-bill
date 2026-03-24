import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

test.describe('Result page full capture', () => {
  test.beforeAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test('capture full result page at multiple scroll positions', async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate: create event if needed, or go to home and click Makan Siang
    await page.goto('/');
    const makanSiangCard = page.getByText('Makan Siang').first();
    const cardVisible = await makanSiangCard.isVisible().catch(() => false);

    if (!cardVisible) {
      // Create the event first
      await page.locator('a[href^="/acara/"]').first().click();
      await page.waitForURL(/\/acara\/.*\/edit/);
      for (const name of ['Joko', 'Eko', 'Sukiyem']) {
        await page.locator('button.border-dashed').first().click();
        await page.getByPlaceholder('Masukkan nama...').fill(name);
        await page.getByRole('button', { name: 'Tambah' }).last().click();
        await page.waitForTimeout(150);
      }
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
    } else {
      await makanSiangCard.click();
      await page.waitForURL(/\/acara\/[^/]+$/);
    }
    await page.waitForTimeout(500);

    // Full page screenshot (scroll to top first)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'full-1-top.png'),
    });

    // Scroll positions: 200, 400, 600, 800, 1000
    for (let y = 200; y <= 1000; y += 200) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: join(OUTPUT_DIR, `full-2-scroll-${y}.png`),
      });
    }

    // Scroll to top, then expand Joko
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.getByText('Joko', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'full-3-joko-expanded.png'),
    });

    // Expand Eko as well
    await page.getByText('Eko', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'full-4-joko-eko-expanded.png'),
    });

    // Scroll to show Ringkasan section (between green card and person cards)
    await page.evaluate(() => window.scrollTo(0, 250));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'full-5-ringkasan-area.png'),
    });
  });
});
