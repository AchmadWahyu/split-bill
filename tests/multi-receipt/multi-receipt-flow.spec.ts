import { test, expect } from '@playwright/test';
import { join } from 'path';
import {
  OUTPUT_DIR,
  ensureOutputDir,
  createScanMock,
  startFirstReceiptScan,
  addReceiptFromEditPage,
  waitForEditPage,
  addPerson,
  receiptCard,
  assignPersonToFirstItemInReceipt,
  assignPersonToItemInReceipt,
  assignPeopleToAllItemsInReceipt,
  saveEvent,
  expectReceiptCount,
  suppressAddMemberCoachmark,
  scanReceipt1,
  scanReceipt2,
} from '../helpers/multi-receipt';

test.use({
  video: 'on',
  trace: 'on',
  viewport: { width: 390, height: 844 },
});

test.beforeAll(() => {
  ensureOutputDir();
});

test.describe('Multi-receipt flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await suppressAddMemberCoachmark(page);
  });

  test('Case 1 - scan two receipts, save, and verify result', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case1-after-first-scan.png'),
    });

    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');

    // Assign both people to all items in first receipt
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'BU');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'BU');

    await addReceiptFromEditPage(page, scanMock, scanReceipt2);
    await waitForEditPage(page);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case1-after-second-scan.png'),
    });

    await expectReceiptCount(page, 2);

    // Assign both people to all items in second receipt
    await assignPersonToFirstItemInReceipt(page, 'Solaria', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Solaria', 'BU');
    await assignPersonToItemInReceipt(page, 'Solaria', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Solaria', 1, 'BU');

    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case1-filled-form.png'),
    });

    await saveEvent(page);

    await expect(
      page.getByRole('heading', { name: 'Warung Kopi, Solaria' }),
    ).toBeVisible();
    await expect(page.getByText('Total Tagihan')).toBeVisible();
    await expect(page.getByText(/2 Struk/)).toBeVisible();
    await expect(page.getByText('Andi', { exact: true })).toBeVisible();
    await expect(page.getByText('Budi', { exact: true })).toBeVisible();

    await page.screenshot({ path: join(OUTPUT_DIR, 'mr-case1-result.png') });
  });

  test('Case 2 - second receipt fails then retry succeeds', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'BU');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'BU');

    // First attempt for second receipt fails
    await addReceiptFromEditPage(page, scanMock, {}, 500);
    await page.waitForURL(/\/acara\/.*\/scan/);
    await page.getByText('Struk gagal dibaca').waitFor();
    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case2-error-state.png'),
    });

    // Retry with success
    await page.getByRole('button', { name: 'Coba Lagi' }).click();
    await page.getByText('Posisikan struk dalam bingkai').waitFor();
    scanMock.setResponse(scanReceipt2, 200);
    await page.locator('input[type="file"]').setInputFiles({
      name: 'dummy.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='.split(',')[1],
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Pakai Foto Ini' }).click();
    await waitForEditPage(page);

    await expectReceiptCount(page, 2);
    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case2-after-retry.png'),
    });
  });

  test('Case 3 - second receipt fails then user chooses manual input', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'BU');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'BU');

    await addReceiptFromEditPage(page, scanMock, {}, 500);
    await page.waitForURL(/\/acara\/.*\/scan/);
    await page.getByText('Struk gagal dibaca').waitFor();

    await page.getByRole('button', { name: 'Input Manual' }).click();
    await waitForEditPage(page);

    // First receipt should still be present
    await expectReceiptCount(page, 1);

    // Add a manual item inside the existing receipt
    const card = receiptCard(page, 'Warung Kopi');
    await card
      .getByRole('button', { name: /Tambah Item di Warung Kopi/i })
      .click();
    await card.locator('input[placeholder="Nama item"]').last().fill('Tisu');
    await card.locator('input[inputmode="numeric"]').last().fill('5000');
    await assignPeopleToAllItemsInReceipt(page, 'Warung Kopi', ['Andi', 'Budi']);

    await saveEvent(page);

    // Total should be first receipt (35000) + manual item (5000)
    await expect(page.getByText('Rp 40.000').first()).toBeVisible();
    await page.screenshot({ path: join(OUTPUT_DIR, 'mr-case3-result.png') });
  });

  test('Case 4 - rename a receipt', async ({ page }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);

    const card = receiptCard(page, 'Warung Kopi');
    await card.getByLabel('Ubah nama receipt').click();
    await card.locator('input').first().fill('Kopi Brumbun');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await expect(page.getByText('Struk 1 • Kopi Brumbun')).toBeVisible();
    await expect(
      page.getByPlaceholder('contoh: Starbucks, Makan Siang'),
    ).toHaveValue('Kopi Brumbun');

    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case4-renamed-receipt.png'),
    });
  });

  test('Case 5 - delete a receipt removes its items', async ({ page }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await addReceiptFromEditPage(page, scanMock, scanReceipt2);
    await waitForEditPage(page);

    await expectReceiptCount(page, 2);

    const solariaCard = receiptCard(page, 'Solaria');
    await solariaCard.getByLabel('Hapus receipt').click();
    await page.getByRole('button', { name: 'Hapus' }).last().click();
    await page.waitForTimeout(200);

    await expectReceiptCount(page, 1);
    await expect(page.getByText('Solaria')).not.toBeVisible();

    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case5-after-delete.png'),
    });
  });

  test('Case 6 - add item inside a receipt card', async ({ page }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');

    const card = receiptCard(page, 'Warung Kopi');
    await card
      .getByRole('button', { name: /Tambah Item di Warung Kopi/i })
      .click();
    await card.locator('input[placeholder="Nama item"]').last().fill('Kopi Tubruk');
    await card.locator('input[inputmode="numeric"]').last().fill('18000');
    await assignPeopleToAllItemsInReceipt(page, 'Warung Kopi', ['Andi', 'Budi']);

    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case6-added-item.png'),
    });

    await saveEvent(page);

    // Subtotal 20000+15000+18000 = 53000
    await expect(page.getByText('Rp 53.000').first()).toBeVisible();
    await page.screenshot({ path: join(OUTPUT_DIR, 'mr-case6-result.png') });
  });

  test('Case 7 - multiple receipts with different fees calculate correctly', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const scanMock = createScanMock(page);
    await scanMock.install();

    await startFirstReceiptScan(page, scanMock, scanReceipt1);
    await waitForEditPage(page);
    await addPerson(page, 'Andi');
    await addPerson(page, 'Budi');

    // Assign all first receipt items
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Warung Kopi', 'BU');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Warung Kopi', 1, 'BU');

    await addReceiptFromEditPage(page, scanMock, scanReceipt2);
    await waitForEditPage(page);

    await assignPersonToFirstItemInReceipt(page, 'Solaria', 'AN');
    await assignPersonToFirstItemInReceipt(page, 'Solaria', 'BU');
    await assignPersonToItemInReceipt(page, 'Solaria', 1, 'AN');
    await assignPersonToItemInReceipt(page, 'Solaria', 1, 'BU');

    await page.screenshot({
      path: join(OUTPUT_DIR, 'mr-case7-filled-form.png'),
    });

    await saveEvent(page);

    // Receipt1: 35000
    // Receipt2: 53000 - 3000 + 4000 + 5000 = 59000
    // Grand total: 94000
    await expect(page.getByText('Rp 94.000').first()).toBeVisible();
    await expect(page.getByText('Pajak').first()).toBeVisible();
    await expect(page.getByText('Biaya Layanan').first()).toBeVisible();
    await expect(page.getByText('Diskon').first()).toBeVisible();
    await page.screenshot({ path: join(OUTPUT_DIR, 'mr-case7-result.png') });
  });
});
