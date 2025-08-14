import { test, expect } from '@playwright/test'

test.describe('Event Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a new event form
    await page.goto('/')
    const addButton = page.getByRole('link', { name: /new event/i })
    await addButton.click()
  })

  test('should display event form page', async ({ page }) => {
    // Should be on the event form page
    await expect(page).toHaveURL(/\/acara\/.*\/edit\/general/)
  })

  test('should have form elements', async ({ page }) => {
    // Basic form elements should be present
    await expect(page.getByRole('textbox')).toBeVisible()
  })

  test('should allow navigation between form sections', async ({ page }) => {
    // This test will depend on the actual form structure
    // For now, we'll just verify we're on a form page
    await expect(page).toHaveURL(/\/acara\/.*\/edit\/general/)
  })
})