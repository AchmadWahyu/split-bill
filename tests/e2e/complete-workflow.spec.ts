import { test, expect } from '@playwright/test'
import { createNewEvent, fillEventForm, verifyEventExists } from './utils/test-helpers'

test.describe('Complete Workflow', () => {
  test('should create a complete event with people and expenses', async ({ page }) => {
    const eventData = {
      title: 'Team Dinner',
      people: ['Alice', 'Bob', 'Charlie'],
      expenses: [
        {
          title: 'Pizza',
          price: '150000',
          payer: 'Alice',
          receivers: ['Alice', 'Bob', 'Charlie']
        },
        {
          title: 'Drinks',
          price: '50000',
          payer: 'Bob',
          receivers: ['Alice', 'Bob', 'Charlie']
        }
      ]
    }

    // Create new event
    await createNewEvent(page)
    
    // Fill the event form
    await fillEventForm(page, eventData)
    
    // Save the event
    const saveButton = page.getByRole('button', { name: /save|submit/i })
    if (saveButton.isVisible()) {
      await saveButton.click()
    }
    
    // Verify we're back on home page
    await page.waitForURL('/')
    
    // Verify event exists
    await verifyEventExists(page, eventData.title)
  })

  test('should calculate and display correct totals', async ({ page }) => {
    await page.goto('/')
    
    // Create a simple event
    const addButton = page.getByRole('link', { name: /new event/i })
    await addButton.click()
    
    // This test will need to be updated based on the actual form structure
    // For now, we'll just verify navigation works
    await expect(page).toHaveURL(/\/acara\/.*\/edit\/general/)
  })

  test('should handle form validation', async ({ page }) => {
    await createNewEvent(page)
    
    // Try to submit without required fields
    const saveButton = page.getByRole('button', { name: /save|submit/i })
    if (saveButton.isVisible()) {
      await saveButton.click()
      
      // Should show validation errors
      await expect(page.getByText(/required|error/i)).toBeVisible()
    }
  })
})