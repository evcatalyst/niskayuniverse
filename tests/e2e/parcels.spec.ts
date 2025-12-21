import { test, expect } from '@playwright/test';

test.describe('Parcel Layer', () => {
  test('parcel data files exist and are accessible', async ({ page, baseURL }) => {
    // Check that parcel GeoJSON is accessible
    const parcelUrl = `${baseURL}/data/parcels_nys.geojson`;
    const parcelResponse = await page.request.get(parcelUrl);
    expect(parcelResponse.ok()).toBeTruthy();
    
    const parcelData = await parcelResponse.json();
    expect(parcelData.type).toBe('FeatureCollection');
    expect(parcelData.features).toBeDefined();
    expect(parcelData.features.length).toBeGreaterThan(0);
    
    // Check that parcel index is accessible
    const indexUrl = `${baseURL}/data/parcels_nys_index.json`;
    const indexResponse = await page.request.get(indexUrl);
    expect(indexResponse.ok()).toBeTruthy();
    
    const indexData = await indexResponse.json();
    expect(Object.keys(indexData).length).toBeGreaterThan(0);
  });

  test('parcel data has correct schema', async ({ page, baseURL }) => {
    const parcelUrl = `${baseURL}/data/parcels_nys.geojson`;
    const parcelResponse = await page.request.get(parcelUrl);
    const parcelData = await parcelResponse.json();
    
    const firstFeature = parcelData.features[0];
    
    // Check required properties
    expect(firstFeature.properties.parcel_id).toBeDefined();
    expect(firstFeature.properties.provenance).toBeDefined();
    expect(firstFeature.properties.provenance.source).toBe('NYS_Tax_Parcels_Public');
    expect(firstFeature.properties.provenance.source_url).toContain('NYS_Tax_Parcels_Public');
    expect(firstFeature.properties.provenance.fetched_at).toBeDefined();
    
    // Check geometry
    expect(firstFeature.geometry.type).toMatch(/^(Polygon|MultiPolygon)$/);
    expect(firstFeature.geometry.coordinates).toBeDefined();
  });

  test('parcel index has correct structure', async ({ page, baseURL }) => {
    const indexUrl = `${baseURL}/data/parcels_nys_index.json`;
    const indexResponse = await page.request.get(indexUrl);
    const indexData = await indexResponse.json();
    
    const firstKey = Object.keys(indexData)[0];
    const firstEntry = indexData[firstKey];
    
    expect(firstEntry.parcel_id).toBe(firstKey);
    expect(firstEntry.provenance).toBeDefined();
    expect(firstEntry.provenance.source).toBe('NYS_Tax_Parcels_Public');
  });

  test('parcels with year_built have valid ranges', async ({ page, baseURL }) => {
    const parcelUrl = `${baseURL}/data/parcels_nys.geojson`;
    const parcelResponse = await page.request.get(parcelUrl);
    const parcelData = await parcelResponse.json();
    
    const currentYear = new Date().getFullYear();
    
    for (const feature of parcelData.features) {
      const yearBuilt = feature.properties.year_built;
      if (yearBuilt !== null && yearBuilt !== undefined) {
        expect(yearBuilt).toBeGreaterThanOrEqual(1700);
        expect(yearBuilt).toBeLessThanOrEqual(currentYear);
      }
    }
  });

  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have no critical page errors
    // Filter out minor warnings/errors that don't affect functionality
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && !err.includes('Service Worker')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Parcel Age Example - E2E', () => {
  test('parcels-age.html loads successfully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/examples/parcels-age.html');
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded
    const title = await page.title();
    expect(title).toContain('Parcel');
    
    // Should have no critical errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && !err.includes('Service Worker')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('toggling parcels changes DOM state', async ({ page }) => {
    await page.goto('/examples/parcels-age.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to initialize and data to load
    await page.waitForTimeout(2000);
    
    // Find the parcels checkbox
    const parcelsCheckbox = page.locator('#toggle-parcels');
    expect(await parcelsCheckbox.isChecked()).toBe(true);
    
    // Uncheck the parcels checkbox
    await parcelsCheckbox.uncheck();
    expect(await parcelsCheckbox.isChecked()).toBe(false);
    
    // Wait for map layers to update
    await page.waitForTimeout(500);
    
    // Re-check the parcels checkbox
    await parcelsCheckbox.check();
    expect(await parcelsCheckbox.isChecked()).toBe(true);
  });

  test('toggling service lines changes DOM state', async ({ page }) => {
    await page.goto('/examples/parcels-age.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to initialize
    await page.waitForTimeout(2000);
    
    // Find the service lines checkbox
    const serviceLinesCheckbox = page.locator('#toggle-service-lines');
    expect(await serviceLinesCheckbox.isChecked()).toBe(true);
    
    // Uncheck the service lines checkbox
    await serviceLinesCheckbox.uncheck();
    expect(await serviceLinesCheckbox.isChecked()).toBe(false);
    
    // Wait for map layers to update
    await page.waitForTimeout(500);
    
    // Re-check the service lines checkbox
    await serviceLinesCheckbox.check();
    expect(await serviceLinesCheckbox.isChecked()).toBe(true);
  });

  test('visual regression - parcel map snapshot', async ({ page }) => {
    await page.goto('/examples/parcels-age.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to fully render
    await page.waitForTimeout(3000);
    
    // Take a screenshot for visual regression testing
    await expect(page).toHaveScreenshot('parcels-age-map.png', {
      fullPage: false,
      // Allow for small rendering differences
      maxDiffPixels: 100,
    });
  });

  test('visual regression - parcels with toggle off', async ({ page }) => {
    await page.goto('/examples/parcels-age.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to fully render
    await page.waitForTimeout(3000);
    
    // Uncheck parcels
    await page.locator('#toggle-parcels').uncheck();
    await page.waitForTimeout(500);
    
    // Take a screenshot with parcels hidden
    await expect(page).toHaveScreenshot('parcels-age-map-no-parcels.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });
});
