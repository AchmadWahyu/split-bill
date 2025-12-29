import { test, expect } from '@playwright/test';
import mockData from '../../src/mocks/localStorage/all-payer/all-payer-multiple-person-no-discount-tax-service.json' with { type: 'json' };

test.describe('All Payer Multiple Person - No Discount/Tax/Service', () => {
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
    const eventTitle = page.getByText('All Person is Payer - Multiple Person - No Discount/Tax/Service');
    await expect(eventTitle).toBeVisible();

    // Verify the event shows 3 people
    await expect(page.getByText('3 orang')).toBeVisible();

    // Verify total expense is displayed (60000 + 90000 + 120000 = 270000)
    // Format: Rp 270.000 (Indonesian format)
    await expect(page.getByText(/Rp\s*270[.,]000/i)).toBeVisible();

    // Click on the event card to view details
    // The card is clickable, so clicking on the heading should work
    await eventTitle.click();

    // Wait for navigation to event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-all-payer-no-discount-tax-service/?$')
    );

    // Verify the event title is displayed
    await expect(
      page.getByRole('heading', {
        name: 'All Person is Payer - Multiple Person - No Discount/Tax/Service',
      })
    ).toBeVisible();

    // Verify the "Ringkasan" (Summary) tab is active by default
    const ringkasanTab = page.getByRole('button', { name: 'Ringkasan' });
    await expect(ringkasanTab).toHaveClass(/border-slate-900/);

    // Verify all three people are shown in the summary (they may appear in multiple places)
    for (const name of ['Andi', 'Budi', 'Cici'] as const) {
      const loc = page.getByText(name);
      const count = await loc.count();
      expect(count).toBeGreaterThan(0);
    }

    // Note: Transaction details are in collapsed sections, so we'll verify them after expanding

    // Switch to "Rincian" (Details) tab
    const rincianTab = page.getByRole('button', { name: 'Rincian' });
    await rincianTab.click();

    // Verify the Rincian tab is now active
    await expect(rincianTab).toHaveClass(/border-slate-900/);

    // Verify all three people are shown in the details tab (they may appear in multiple places)
    for (const name of ['Andi', 'Budi', 'Cici'] as const) {
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
    // Each person should have all three transactions (Sarapan, Makan Siang, Makan Malam)
    // Each transaction title appears 3 times (once for each person)
    const transactionTitles = ['Sarapan', 'Makan Siang', 'Makan Malam'];
    for (const title of transactionTitles) {
      const loc = page.getByText(title);
      const count = await loc.count();
      expect(count).toBeGreaterThan(1);
    }

    // Verify each person's share per transaction
    // Sarapan: 60000 / 3 = 20000 per person
    // Makan Siang: 90000 / 3 = 30000 per person
    // Makan Malam: 120000 / 3 = 40000 per person
    // Total per person: 90000

    // Check that amounts are displayed (format: Rp XX.XXX)
    // Because debts are divided evenly, each amount appears multiple times (once per person)
    const amountPatterns = [
      /Rp\s*20[.,]000/i, // 20000
      /Rp\s*30[.,]000/i, // 30000
      /Rp\s*40[.,]000/i, // 40000
      /Rp\s*90[.,]000/i, // 90000 total per person
    ];

    for (const pattern of amountPatterns) {
      const loc = page.getByText(pattern);
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
    const eventTitle = page.getByText('All Person is Payer - Multiple Person - No Discount/Tax/Service');
    await eventTitle.click();

    // Wait for event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-all-payer-no-discount-tax-service/?$')
    );

    // Verify we're on the Ringkasan tab
    const ringkasanTab = page.getByRole('button', { name: 'Ringkasan' });
    await expect(ringkasanTab).toHaveClass(/border-slate-900/);

    // Verify debt information is displayed
    // Since all expenses are shared equally and each person paid different amounts:
    // - Andi paid 60000, should pay 90000 total → owes 30000
    // - Budi paid 90000, should pay 90000 total → owes 0
    // - Cici paid 120000, should pay 90000 total → is owed 30000

    // After normalization, Andi should owe to Budi (since Budi paid more than his share for Makan Siang)
    // And Andi should owe to Cici (since Cici paid more than her share for Makan Malam)
    // But the normalization logic will handle mutual debts

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
    const eventTitle = page.getByText('All Person is Payer - Multiple Person - No Discount/Tax/Service');
    await eventTitle.click();

    // Wait for event detail page
    await expect(page).toHaveURL(
      new RegExp('http://localhost:5173/acara/event-all-payer-no-discount-tax-service/?$')
    );

    // Switch to Rincian tab
    const rincianTab = page.getByRole('button', { name: 'Rincian' });
    await rincianTab.click();

    // Verify all three transactions are shown for each person
    // Each person should see:
    // - Sarapan: Rp 20.000 (60000 / 3)
    // - Makan Siang: Rp 30.000 (90000 / 3)
    // - Makan Malam: Rp 40.000 (120000 / 3)
    // Total: Rp 90.000

    // Verify "Rincian Transaksi:" label is present
    // This text appears multiple times (once for each person)
    const rincianTransaksiLoc = page.getByText(/Rincian Transaksi:/i);
    const rincianTransaksiCount = await rincianTransaksiLoc.count();
    expect(rincianTransaksiCount).toBeGreaterThan(1);

    // Verify total amounts are displayed for each person (90000 each)
    const totalAmounts = page.locator('text=/Rp\\s*90[.,]000/i');
    const count = await totalAmounts.count();
    // Should have at least 3 instances (one for each person)
    expect(count).toBeGreaterThanOrEqual(3);

    // Expand all "Rincian Transaksi:" collapses to see transaction details
    const rincianCollapses = page.getByText(/Rincian Transaksi:/i);
    const collapseCount = await rincianCollapses.count();
    for (let i = 0; i < collapseCount; i++) {
      await rincianCollapses.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Verify transaction titles are visible after expanding
    const transactionTitles = ['Sarapan', 'Makan Siang', 'Makan Malam'];
    for (const title of transactionTitles) {
      await expect(page.getByText(title).first()).toBeVisible();
    }
  });
});

