import { Page, expect } from '@playwright/test'

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
}

export async function createNewEvent(page: Page) {
  await page.goto('/')
  const addButton = page.getByRole('link', { name: /new event/i })
  await addButton.click()
  await waitForPageLoad(page)
}

export async function fillEventForm(page: Page, eventData: {
  title: string
  people: string[]
  expenses: Array<{
    title: string
    price: string
    payer: string
    receivers: string[]
  }>
}) {
  // Fill event title
  const titleInput = page.getByRole('textbox', { name: /title/i })
  if (titleInput.isVisible()) {
    await titleInput.fill(eventData.title)
  }

  // Add people
  for (const person of eventData.people) {
    const addPersonButton = page.getByRole('button', { name: /add person/i })
    if (addPersonButton.isVisible()) {
      await addPersonButton.click()
      const personInput = page.getByRole('textbox', { name: /person name/i })
      await personInput.fill(person)
      await page.getByRole('button', { name: /save/i }).click()
    }
  }

  // Add expenses
  for (const expense of eventData.expenses) {
    const addExpenseButton = page.getByRole('button', { name: /add expense/i })
    if (addExpenseButton.isVisible()) {
      await addExpenseButton.click()
      
      const expenseTitleInput = page.getByRole('textbox', { name: /expense title/i })
      await expenseTitleInput.fill(expense.title)
      
      const priceInput = page.getByRole('textbox', { name: /price/i })
      await priceInput.fill(expense.price)
      
      // Select payer
      const payerSelect = page.getByRole('combobox', { name: /payer/i })
      await payerSelect.selectOption(expense.payer)
      
      // Select receivers
      for (const receiver of expense.receivers) {
        const receiverCheckbox = page.getByRole('checkbox', { name: new RegExp(receiver, 'i') })
        await receiverCheckbox.check()
      }
      
      await page.getByRole('button', { name: /save/i }).click()
    }
  }
}

export async function verifyEventExists(page: Page, eventTitle: string) {
  await page.goto('/')
  await expect(page.getByText(eventTitle)).toBeVisible()
}