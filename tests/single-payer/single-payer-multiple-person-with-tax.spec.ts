import { test, expect } from '@playwright/test';
import mockData from '../../src/mocks/localStorage/single-payer/single-payer-multiple-person-with-tax.json' with { type: 'json' };
import { expectResultPageForEvent, expandPersonCard } from '../helpers/resultAssertions';

test.describe('Single Payer - Multiple Person - With Tax', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('eventList', JSON.stringify(data));
    }, mockData);
  });

  test('should display event on home page and show correct details', async ({ page }) => {
    await page.goto('/');
    const eventTitle = page.getByText('Single Payer - Multiple Person - With Tax');
    await expect(eventTitle).toBeVisible();
    await expect(page.getByText(/\d+ orang/)).toBeVisible();
    await expect(page.getByText(/Rp\s*\d+[.,]\d{3}/i)).toBeVisible();

    await eventTitle.click();
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/acara\/event-single-payer-with-tax\/?$/);

    await expectResultPageForEvent(page, mockData[0]);

    const firstPerson = mockData[0].personList[0].name;
    await expandPersonCard(page, firstPerson);
    for (const item of mockData[0].expense.items) {
      await expect(page.getByText(item.title).first()).toBeVisible();
    }
    await expect(page.getByText('Total').first()).toBeVisible();

    const backButton = page.getByText('Kembali ke Home').last();
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  test('should show correct per-person totals', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Single Payer - Multiple Person - With Tax').click();
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/acara\/event-single-payer-with-tax\/?$/);
    await expectResultPageForEvent(page, mockData[0]);

    const firstPerson = mockData[0].personList[0].name;
    await expandPersonCard(page, firstPerson);
    for (const item of mockData[0].expense.items) {
      await expect(page.getByText(item.title).first()).toBeVisible();
    }
  });

  test('should show correct transaction details when expanded', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Single Payer - Multiple Person - With Tax').click();
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/acara\/event-single-payer-with-tax\/?$/);

    for (const person of mockData[0].personList) {
      await expandPersonCard(page, person.name);
    }

    for (const item of mockData[0].expense.items) {
      await expect(page.getByText(item.title).first()).toBeVisible();
    }
  });
});
