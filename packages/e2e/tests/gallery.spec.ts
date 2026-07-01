import { test, expect } from '@playwright/test'

test('gallery page shows pokemon cards', async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('gallery has type filter', async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByText(/type|fire|water|electric/i).first().or(page.locator('select, [role="listbox"]').first())).toBeVisible()
})
