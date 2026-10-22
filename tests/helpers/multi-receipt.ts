import { expect, type Page, type Route, type Request } from '@playwright/test';
import { join } from 'path';
import { mkdirSync } from 'fs';

export const OUTPUT_DIR = join(process.cwd(), 'screenshots-captured');

export function ensureOutputDir() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function suppressAddMemberCoachmark(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'split-bill:coachmark:add-member',
      JSON.stringify({ dismissedAt: new Date().toISOString() }),
    );
  });
}

// 1x1 transparent PNG as base64 data URL
export const DUMMY_IMAGE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export function dummyImageBuffer() {
  return Buffer.from(DUMMY_IMAGE_BASE64.split(',')[1], 'base64');
}

export type ScanResponseBody = {
  title: string;
  personList: { name: string }[];
  expense: {
    items: { title: string; price: string; receiver: string[] }[];
    tax: { value: string; type: 'AMOUNT' | 'PERCENTAGE' };
    serviceCharge: { value: string; type: 'AMOUNT' | 'PERCENTAGE' };
    discount: { value: string; type: 'AMOUNT' | 'PERCENTAGE' };
  };
};

export const scanReceipt1: ScanResponseBody = {
  title: 'Warung Kopi',
  personList: [],
  expense: {
    items: [
      { title: 'Kopi Susu', price: '20000', receiver: [] },
      { title: 'Roti Bakar', price: '15000', receiver: [] },
    ],
    tax: { value: '0', type: 'AMOUNT' },
    serviceCharge: { value: '0', type: 'AMOUNT' },
    discount: { value: '0', type: 'AMOUNT' },
  },
};

export const scanReceipt2: ScanResponseBody = {
  title: 'Solaria',
  personList: [],
  expense: {
    items: [
      { title: 'Nasi Goreng', price: '45000', receiver: [] },
      { title: 'Es Teh', price: '8000', receiver: [] },
    ],
    tax: { value: '5000', type: 'AMOUNT' },
    serviceCharge: { value: '4000', type: 'AMOUNT' },
    discount: { value: '3000', type: 'AMOUNT' },
  },
};

export function createScanMock(page: Page) {
  let nextStatus = 200;
  let nextBody: ScanResponseBody | object = {};

  const handler = async (route: Route, request: Request) => {
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: nextStatus,
      contentType: 'application/json',
      body: JSON.stringify(nextBody),
    });
  };

  return {
    async install() {
      await page.route('/api/scan-receipt', handler);
    },
    setResponse(body: ScanResponseBody | object, status = 200) {
      nextBody = body;
      nextStatus = status;
    },
  };
}

export async function waitForScanPage(page: Page) {
  await page.waitForURL(/\/acara\/.*\/scan/);
  await page.getByText('Posisikan struk dalam bingkai').waitFor();
}

export async function uploadImageAndConfirm(page: Page) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'dummy.png',
    mimeType: 'image/png',
    buffer: dummyImageBuffer(),
  });
  await page.getByRole('button', { name: 'Pakai Foto Ini' }).click();
}

export async function startFirstReceiptScan(
  page: Page,
  scanMock: ReturnType<typeof createScanMock>,
  response: ScanResponseBody,
) {
  scanMock.setResponse(response, 200);
  await page.goto('/');
  await page.getByRole('link', { name: /Scan struk baru/i }).click();
  await waitForScanPage(page);
  await uploadImageAndConfirm(page);
}

export async function addReceiptFromEditPage(
  page: Page,
  scanMock: ReturnType<typeof createScanMock>,
  response: ScanResponseBody,
  status = 200,
) {
  scanMock.setResponse(response, status);
  await page.locator('[data-testid="scan-new-receipt"]').click();
  await waitForScanPage(page);
  await uploadImageAndConfirm(page);
}

export async function waitForEditPage(page: Page) {
  await page.waitForURL(/\/acara\/.*\/edit/);
  await page.getByRole('heading', { name: /Edit Pengeluaran|Tambah Pengeluaran/i }).waitFor();
}

export async function addPerson(page: Page, name: string) {
  await page.locator('[data-testid="add-member-button"]').click();
  await page.getByPlaceholder('Masukkan nama...').fill(name);
  await page.getByRole('button', { name: 'Tambah' }).last().click();
  await page.getByRole('heading', { name: 'Tambah Anggota' }).waitFor({ state: 'hidden' });
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

export function receiptCard(page: Page, name: string) {
  return page.locator(`[data-testid="receipt-card"][data-receipt-name="${name}"]`);
}

export async function assignPersonToFirstItemInReceipt(
  page: Page,
  receiptName: string,
  initials: string,
) {
  await assignPersonToItemInReceipt(page, receiptName, 0, initials);
}

export async function assignPersonToItemInReceipt(
  page: Page,
  receiptName: string,
  itemIndex: number,
  initials: string,
) {
  const card = receiptCard(page, receiptName);
  const item = card.locator('[data-testid="receipt-item"]').nth(itemIndex);
  const button = item.getByRole('button', { name: initials });
  await button.scrollIntoViewIfNeeded();
  const pressed = await button.getAttribute('aria-pressed');
  if (pressed !== 'true') {
    await button.click();
    await page.waitForTimeout(80);
  }
}

export function getPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export async function assignPeopleToAllItemsInReceipt(
  page: Page,
  receiptName: string,
  people: string[],
) {
  const card = receiptCard(page, receiptName);
  const itemCount = await card.locator('[data-testid="receipt-item"]').count();
  for (let i = 0; i < itemCount; i++) {
    for (const person of people) {
      await assignPersonToItemInReceipt(
        page,
        receiptName,
        i,
        getPersonInitials(person),
      );
    }
  }
}

export async function fillItemInReceipt(
  page: Page,
  receiptName: string,
  itemIndex: number,
  title: string,
  price: string,
) {
  const card = receiptCard(page, receiptName);
  const item = card.locator('input[placeholder="Nama item"]').nth(itemIndex);
  await item.fill(title);
  const priceInput = card.locator('input[inputmode="numeric"]').nth(itemIndex);
  await priceInput.fill(price);
}

export async function dismissAllToasts(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __sonner_toast?: { dismiss: () => void } }).__sonner_toast?.dismiss();
  });
  await page.waitForTimeout(200);
}

export async function saveEvent(page: Page) {
  await dismissAllToasts(page);
  await page
    .getByRole('button', { name: 'Simpan & Lanjut Bagi Tagihan' })
    .click();
  await page.waitForURL(/\/acara\/[^/]+$/);
  await page.waitForTimeout(400);
}

export async function expectReceiptCount(page: Page, count: number) {
  await page.locator('[data-testid="scan-new-receipt"]').waitFor();
  const cards = page.locator('[data-testid="receipt-card"]');
  await expect(cards).toHaveCount(count);
}
