import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://www.google.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Google/);
});

test('google search', async ({ page }) => {
  await page.goto('https://www.google.com/');

  // Type into search box.
  await page.locator('textarea[name="q"]').fill('Playwright');

  // Press Enter.
  await page.keyboard.press('Enter');

  // Expect a new page to be loaded.
  await page.waitForNavigation();

  // Expect the new page to contain the word "Playwright".
  await expect(page.locator('body')).toContainText('Playwright');
});
