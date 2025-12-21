import { test, expect } from '@playwright/test';

test.describe('Parcels Age Example Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the parcels-age.html page
    // Use relative path that works with the base URL from config
    await page.goto('/examples/parcels-age.html');
  });

  test('should load the page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Parcel Age Visualization/);
    
    // Check that header is present
    const header = page.locator('h1');
    await expect(header).toContainText('Parcel Age Visualization');
  });

  test('should have toggle control visible', async ({ page }) => {
    const toggle = page.locator('#parcels-toggle');
    await expect(toggle).toBeVisible();
    
    // Should be checked by default
    await expect(toggle).toBeChecked();
  });

  test('should have map element present', async ({ page }) => {
    const map = page.locator('#map');
    await expect(map).toBeVisible();
    
    // Wait for map to initialize
    await page.waitForTimeout(1000);
  });

  test('should display parcel count initially', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    const parcelCount = page.locator('#parcel-count');
    await expect(parcelCount).toBeVisible();
    
    // Should have some parcels displayed (not 0)
    const count = await parcelCount.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });

  test('should toggle parcels visibility when checkbox is clicked', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    const toggle = page.locator('#parcels-toggle');
    const parcelCount = page.locator('#parcel-count');
    
    // Get initial count (should be > 0)
    const initialCount = await parcelCount.textContent();
    expect(parseInt(initialCount || '0')).toBeGreaterThan(0);
    
    // Uncheck the toggle
    await toggle.click();
    await page.waitForTimeout(500);
    
    // Count should be 0 when parcels are hidden
    const hiddenCount = await parcelCount.textContent();
    expect(parseInt(hiddenCount || '0')).toBe(0);
    
    // Check the toggle again
    await toggle.click();
    await page.waitForTimeout(500);
    
    // Count should be back to initial value
    const restoredCount = await parcelCount.textContent();
    expect(parseInt(restoredCount || '0')).toBeGreaterThan(0);
  });

  test('should change map layer state when toggling', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    const toggle = page.locator('#parcels-toggle');
    
    // Check if Leaflet layer exists by evaluating JavaScript
    const hasMarkersInitially = await page.evaluate(() => {
      const layerGroup = (window as any).parcelLayer;
      return layerGroup ? layerGroup.getLayers().length > 0 : false;
    });
    
    expect(hasMarkersInitially).toBe(true);
    
    // Uncheck the toggle
    await toggle.click();
    await page.waitForTimeout(500);
    
    // Check that markers are cleared
    const hasMarkersAfterToggle = await page.evaluate(() => {
      const layerGroup = (window as any).parcelLayer;
      return layerGroup ? layerGroup.getLayers().length > 0 : false;
    });
    
    expect(hasMarkersAfterToggle).toBe(false);
  });

  test('visual regression - parcels displayed', async ({ page }) => {
    // Wait for page to fully load and render
    await page.waitForTimeout(3000);
    
    // Take a screenshot of the entire page
    await expect(page).toHaveScreenshot('parcels-age-with-parcels.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('visual regression - parcels hidden', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Hide parcels
    const toggle = page.locator('#parcels-toggle');
    await toggle.click();
    await page.waitForTimeout(1000);
    
    // Take a screenshot
    await expect(page).toHaveScreenshot('parcels-age-without-parcels.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('legend should be visible', async ({ page }) => {
    const legend = page.locator('.legend');
    await expect(legend).toBeVisible();
    
    // Check that legend contains age categories
    await expect(legend).toContainText('Building Age');
    await expect(legend).toContainText('Pre-1900');
    await expect(legend).toContainText('1900-1950');
    await expect(legend).toContainText('1950-2000');
    await expect(legend).toContainText('2000+');
    await expect(legend).toContainText('Unknown');
  });
});
