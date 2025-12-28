# Testing guide

Manual smoke tests to verify the Water Atlas stack:

1) Install and build
```bash
npm ci
npm run build
npm run validate:data
```

2) Local UI
- Run `npm run dev` and open http://localhost:4321.
- Confirm the map loads service line points and submission points from `public/data/`.
- Submit the form with an address; expect a success message (or the configured endpoint error) and a new orange marker.
- Type an address (≥3 chars); Nominatim suggestions should appear and pan the map when selected.

3) Static demos
- Open `public/examples/leaflet.html` in a browser to confirm assets load under the repo base path.
- Open `public/control-panel.html` and toggle the status filter to verify markers render from `service_lines.geojson`.

## Automated Tests

### Unit Tests

Run unit tests with Vitest:

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
```

Unit tests cover:
- Year Built parsing and validation (1700-current year bounds)
- Parcel ID normalization rules (SWIS_SBL_ID → SWIS_PRINT_KEY_ID → OBJECTID fallback)
- Address normalization for matching
- Provenance tagging and confidence scoring

### E2E Tests

Run end-to-end tests with Playwright:

```bash
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
```

E2E tests verify:
- Parcel data files are accessible and have correct schema
- Year Built values are within valid ranges
- Parcel index structure is correct
- Page loads without errors

**Note:** E2E tests require the dev server to be running. Playwright will automatically start the server if it's not already running.
