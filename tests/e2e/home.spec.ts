import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Split Bareng' })).toBeVisible()
  })

  test('should show empty state when no events exist', async ({ page }) => {
    await expect(page.getByText('Belum ada acara nih')).toBeVisible()
    await expect(page.getByText('Yuk, bikin acara patungan baru!')).toBeVisible()
  })

  test('should have add new event button', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /new event/i })
    await expect(addButton).toBeVisible()
    await expect(addButton).toHaveAttribute('href', /\/acara\/.*\/edit\/general/)
  })

  test('should navigate to new event form when add button is clicked', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /new event/i })
    await addButton.click()
    
    // Should navigate to a new event form page
    await expect(page).toHaveURL(/\/acara\/.*\/edit\/general/)
  })
})