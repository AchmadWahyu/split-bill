import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should handle 404 for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-route')
    
    // Should show 404 page
    await expect(page.getByText(/not found/i)).toBeVisible()
  })

  test('should maintain navigation state', async ({ page }) => {
    await page.goto('/')
    
    // Should be on home page
    await expect(page.getByRole('heading', { name: 'Split Bareng' })).toBeVisible()
    
    // Navigate to new event
    const addButton = page.getByRole('link', { name: /new event/i })
    await addButton.click()
    
    // Should be on event form page
    await expect(page).toHaveURL(/\/acara\/.*\/edit\/general/)
    
    // Go back to home
    await page.goBack()
    
    // Should be back on home page
    await expect(page.getByRole('heading', { name: 'Split Bareng' })).toBeVisible()
  })
})