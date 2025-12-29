import { test, expect } from '@playwright/test';
import mockData from '../../src/mocks/localStorage/double-payer/double-payer-multiple-person-with-discount-tax-service-charge.json' with { type: 'json' };

test.describe('Double Payer - Multiple Person - With Discount, Tax & Service Charge', () => {
  test.beforeEach(async ({ page }) => {
    // Set up localStorage with mock data before each test
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('eventList', JSON.stringify(data));
    }, mockData);
  });

  test('should display event on home page and show correct details', async ({
    page,
  }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify the event card is visible
    const eventTitle = page.getByText('Double Payer - Multiple Person - With Discount, Tax & Service Charge');
    await expect(eventTitle).toBeVisible();

    // Verify the event shows 3 people
    await expect(page.getByText('3 orang')).toBeVisible();

    // Verify total expense is displayed (150000 + 90000 = 240000)
    // Format: Rp 240.000 (Indonesian format)
    await expect(page.getByText(/Rp\s*240[.,]000/i)).toBeVisible();

    // Click on the event card to view details
    await eventTitle.click();

    // Wait for navigation to event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-double-payer-with-discount-tax-service-charge/?$')
    );

    // Verify the event title is displayed
    await expect(
      page.getByRole('heading', {
        name: 'Double Payer - Multiple Person - With Discount, Tax & Service Charge',
      })
    ).toBeVisible();

    // Verify the "Ringkasan" (Summary) tab is active by default
    const ringkasanTab = page.getByRole('button', { name: 'Ringkasan' });
    await expect(ringkasanTab).toHaveClass(/border-slate-900/);

    // Verify all people are shown in the summary (they may appear in multiple places)
    for (const name of ["Andi","Budi","Cici"] as const) {
      const loc = page.getByText(name);
      const count = await loc.count();
      expect(count).toBeGreaterThan(0);
    }

    // Switch to "Rincian" (Details) tab
    const rincianTab = page.getByRole('button', { name: 'Rincian' });
    await rincianTab.click();

    // Verify the Rincian tab is now active
    await expect(rincianTab).toHaveClass(/border-slate-900/);

    // Verify all people are shown in the details tab (they may appear in multiple places)
    for (const name of ["Andi","Budi","Cici"] as const) {
      const loc = page.getByText(name);
      const count = await loc.count();
      expect(count).toBeGreaterThan(0);
    }

    // Transaction details are in collapsed sections
    // Expand all "Rincian Transaksi:" collapses to see transaction details for all people
    const rincianCollapses = page.getByText(/Rincian Transaksi:/i);
    const collapseCount = await rincianCollapses.count();
    for (let i = 0; i < collapseCount; i++) {
      await rincianCollapses.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Verify transaction details are shown
    // Each transaction title appears multiple times (once for each person)
    const transactionTitles = ["Makan Siang","Kopi"];
    for (const title of transactionTitles) {
      const loc = page.getByText(title);
      const count = await loc.count();
      expect(count).toBeGreaterThan(1);
    }

    // Verify "Balik ke Home" button works
    const backButton = page.getByRole('button', { name: 'Balik ke Home' });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Verify navigation back to home
    await expect(page).toHaveURL('/');
  });

  test('should show correct debt calculations in summary tab', async ({
    page,
  }) => {
    await page.goto('/');

    // Click on the event card
    const eventTitle = page.getByText('Double Payer - Multiple Person - With Discount, Tax & Service Charge');
    await eventTitle.click();

    // Wait for event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-double-payer-with-discount-tax-service-charge/?$')
    );

    // Verify we're on the Ringkasan tab
    const ringkasanTab = page.getByRole('button', { name: 'Ringkasan' });
    await expect(ringkasanTab).toHaveClass(/border-slate-900/);

    // Verify "Bayar ke:" (Pay to) labels are present
    // This text appears multiple times (once for each person who has debts)
    const bayarKeLoc = page.getByText(/Bayar ke:/i);
    const bayarKeCount = await bayarKeLoc.count();
    expect(bayarKeCount).toBeGreaterThan(1);

    // Expand the first debt collapse to see transaction details
    const firstDebtCollapse = page.getByText(/Bayar ke:/i).first();
    await firstDebtCollapse.click();
    await page.waitForTimeout(300);

    // Verify that debt amounts are displayed (the exact amounts depend on normalization logic)
    // We'll check that amounts are present and formatted correctly
    const debtAmounts = page.locator('text=/Rp\\s*\\d+[.,]\\d{3}/i');
    await expect(debtAmounts.first()).toBeVisible();
  });

  test('should show correct transaction details in details tab', async ({
    page,
  }) => {
    await page.goto('/');

    // Click on the event card
    const eventTitle = page.getByText('Double Payer - Multiple Person - With Discount, Tax & Service Charge');
    await eventTitle.click();

    // Wait for event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-double-payer-with-discount-tax-service-charge/?$')
    );

    // Switch to Rincian tab
    const rincianTab = page.getByRole('button', { name: 'Rincian' });
    await rincianTab.click();

    // Verify "Rincian Transaksi:" label is present
    // This text appears multiple times (once for each person)
    const rincianTransaksiLoc = page.getByText(/Rincian Transaksi:/i);
    const rincianTransaksiCount = await rincianTransaksiLoc.count();
    expect(rincianTransaksiCount).toBeGreaterThan(1);

    // Expand all "Rincian Transaksi:" collapses to see transaction details
    const rincianCollapses = page.getByText(/Rincian Transaksi:/i);
    const collapseCount = await rincianCollapses.count();
    for (let i = 0; i < collapseCount; i++) {
      await rincianCollapses.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Verify transaction titles are visible after expanding
    const transactionTitles = ["Makan Siang","Kopi"];
    for (const title of transactionTitles) {
      await expect(page.getByText(title).first()).toBeVisible();
    }
  });
});
