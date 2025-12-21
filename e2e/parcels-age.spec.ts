import { test, expect } from '@playwright/test'

test.describe('Parcels Age Example Page', () => {
  test('should load the page and display basic elements', async ({ page }) => {
    // Navigate to the parcels-age.html page
    await page.goto('/examples/parcels-age.html')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page).toHaveTitle(/Parcel Age Visualization/)

    // Check that header is present
    const header = page.locator('h1')
    await expect(header).toContainText('Parcel Age Visualization')

    // Check toggle is visible and checked
    const toggle = page.locator('#parcels-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toBeChecked()

    // Check map exists
    const map = page.locator('#map')
    await expect(map).toBeVisible()

    // Check legend is visible
    const legend = page.locator('.legend')
    await expect(legend).toBeVisible()
    await expect(legend).toContainText('Building Age')
  })

  test('should toggle parcels visibility', async ({ page }) => {
    await page.goto('/examples/parcels-age.html')
    await page.waitForLoadState('networkidle')

    // Wait for data to load
    await page.waitForTimeout(2000)

    const toggle = page.locator('#parcels-toggle')
    const parcelCount = page.locator('#parcel-count')

    // Get initial count (should be > 0)
    const initialCount = await parcelCount.textContent()
    expect(parseInt(initialCount || '0')).toBeGreaterThan(0)

    // Uncheck the toggle
    await toggle.click()
    await page.waitForTimeout(500)

    // Count should be 0 when parcels are hidden
    const hiddenCount = await parcelCount.textContent()
    expect(parseInt(hiddenCount || '0')).toBe(0)

    // Check the toggle again
    await toggle.click()
    await page.waitForTimeout(500)

    // Count should be back to initial value
    const restoredCount = await parcelCount.textContent()
    expect(parseInt(restoredCount || '0')).toBeGreaterThan(0)
  })

  test('visual regression - parcels displayed', async ({ page }) => {
    await page.goto('/examples/parcels-age.html')
    await page.waitForLoadState('networkidle')

    // Wait for page to fully load and render
    await page.waitForTimeout(3000)

    // Take a screenshot of the entire page
    await expect(page).toHaveScreenshot('parcels-age-with-parcels.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })
})
