# Testing Documentation

This repository includes comprehensive test coverage for parcel data ingestion, processing, and visualization.

## Test Infrastructure

- **Vitest**: Unit testing framework for JavaScript/TypeScript
- **Playwright**: End-to-end browser testing framework
- **Test Coverage**: Unit tests, data validation tests, and E2E visual regression tests

## Running Tests

### All Tests
```bash
npm run test        # Run unit tests
npm run e2e         # Run E2E tests (requires build first)
npm run test:watch  # Run unit tests in watch mode
npm run test:ui     # Open Vitest UI
npm run e2e:ui      # Open Playwright UI
```

### Linting and Type Checking
```bash
npm run lint        # Check code formatting
npm run format      # Format code
npm run typecheck   # TypeScript type checking
```

### Build and Preview
```bash
npm run build       # Build the site
npm run preview     # Preview the built site
```

## Test Suites

### 1. Unit Tests (`scripts/parcel-utils.test.mjs`)

Tests for parcel data utility functions:

- **parseYearBuilt()**: 
  - Returns integer for valid years
  - Returns null for invalid/empty values
  - Rejects years before 1600
  - Rejects years too far in the future
  - Accepts current year and reasonable future years

- **normalizeParcelId()**:
  - Prioritizes SWIS_SBL_ID over SWIS_PRINT_KEY_ID
  - Falls back to SWIS_PRINT_KEY_ID when SWIS_SBL_ID is missing or empty
  - Trims whitespace from IDs
  - Returns null when both IDs are missing

- **attachProvenance()**:
  - Attaches source, fetched_at, and join_method to parcel records
  - Uses default join_method when not provided
  - Preserves all original parcel properties
  - Validates required parameters

### 2. Data Validation Tests (`tests/data-validation.test.mjs`)

Tests for `public/data/parcels_nys_index.json`:

- Loads the parcel data file successfully
- Verifies minimum record count (≥50 parcels)
- Ensures reasonable percentage of parcels have year_built data (≥30%)
- Validates year_built values are within acceptable range (1600 to current year + 5)
- Checks all records have required provenance fields (source, fetched_at, join_method)
- Validates parcel_id is present for all records
- Ensures coordinates are valid latitude/longitude values

### 3. E2E Tests (`e2e/parcels-age.spec.ts`)

Tests for the parcels-age.html interactive map:

- Page loads successfully with correct title
- Toggle control is visible and checked by default
- Map element is present
- Legend displays age categories
- Parcel count updates correctly
- Toggling checkbox shows/hides parcels on map
- Visual regression testing with screenshot comparison

## Test Data

### Parcel Data Generation

Run the parcel ingestion script to generate test data:

```bash
npm run ingest:parcels
```

This generates `public/data/parcels_nys_index.json` with sample NYS parcel data including:
- Parcel IDs (SWIS_SBL_ID and SWIS_PRINT_KEY_ID)
- Property information (owner, address, values)
- Year built data (with realistic distribution)
- Coordinates (latitude/longitude)
- Provenance metadata (source, fetched_at, join_method)

## CI/CD Integration

The `.github/workflows/ci.yml` workflow runs:

1. Lint checks
2. TypeScript type checking
3. Unit tests
4. Parcel data generation
5. Build
6. E2E tests
7. Playwright report artifact upload

## Visual Regression Testing

E2E tests include screenshot comparison for visual regression detection:

- Screenshots are stored in `e2e/parcels-age.spec.ts-snapshots/`
- Tests compare current screenshots against baseline
- `maxDiffPixels` threshold allows for minor rendering differences
- Failed tests generate diff images for review

## Troubleshooting

### E2E Tests Timeout

If E2E tests timeout:
1. Ensure the site builds successfully: `npm run build`
2. Try running preview server manually: `npm run preview`
3. Verify the page loads at `http://localhost:4321/niskayuniverse/examples/parcels-age.html`
4. Check Playwright config baseURL matches your setup

### TypeScript Errors

Ensure @types/node is installed:
```bash
npm install --save-dev @types/node
```

### Test Data Missing

Generate parcel data before running tests:
```bash
npm run ingest:parcels
npm run test
```

## Test Philosophy

- **Unit tests**: Fast, focused tests for individual functions
- **Data validation**: Ensures generated data meets quality standards
- **E2E tests**: Validates user-facing functionality and visual appearance
- **Separation of concerns**: Artifact generation is separate from tests
- **No live network dependencies**: Tests use pre-generated data files
