import { expect, type Page } from '@playwright/test';
import { calculatePersonShares, calculateTotalFromShares } from '../../src/utils/calculations';
import { formatCurrencyIDR } from '../../src/utils/currency';
import type { EventType } from '../../src/types';

export async function expectResultPageForEvent(page: Page, event: EventType) {
  const personNames = event.personList.map((p) => p.name).filter(Boolean);
  const shares = calculatePersonShares(event.expense, personNames);
  const totalAmount = calculateTotalFromShares(shares);

  await expect(page.getByRole('heading', { name: event.title })).toBeVisible();
  await expect(page.getByText('Total Tagihan')).toBeVisible();
  await expect(page.getByText(formatCurrencyIDR(totalAmount)).first()).toBeVisible();

  const itemCount = event.expense.items.filter((i) => i.title).length;
  await expect(page.getByText(`${personNames.length} Anggota`, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(`${itemCount} Item`, { exact: true }).first()).toBeVisible();

  // Verify each person card shows the expected total
  for (const share of shares) {
    const button = page
      .locator('button')
      .filter({ has: page.getByText(share.name, { exact: true }) })
      .filter({ hasText: /Rp/ })
      .first();
    await expect(button).toBeVisible();
    await expect(button).toContainText(formatCurrencyIDR(Math.round(share.total)));
  }
}

export async function expandPersonCard(page: Page, name: string) {
  const button = page
    .locator('button')
    .filter({ has: page.getByText(name, { exact: true }) })
    .filter({ hasText: /Rp/ })
    .first();
  await button.click();
  await page.waitForTimeout(200);
}
