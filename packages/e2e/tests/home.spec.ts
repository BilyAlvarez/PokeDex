import { test, expect } from '@playwright/test'

test('home page loads and shows title', async ({ page }) => {
  await page.goto('/home')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('navigation links are present on home page', async ({ page }) => {
  await page.goto('/home')
  await expect(page.getByText(/scan|gallery|assistant/i).first()).toBeVisible()
})

test('splash screen redirects to home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/home/, { timeout: 10000 })
})

test('login page renders form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[type="email"]').first()).toBeVisible()
  await expect(page.locator('input[type="password"]').first()).toBeVisible()
})
