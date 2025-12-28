# Water Atlas - Architecture & Technical Design

**Document Version**: 1.0  
**Last Updated**: December 21, 2024  
**Target Audience**: Senior Engineers, Technical Architects, Municipal IT Staff

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [Technology Stack](#technology-stack)
5. [Data Architecture](#data-architecture)
6. [Application Components](#application-components)
7. [Data Pipeline](#data-pipeline)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Security & Privacy](#security--privacy)
10. [Performance & Scalability](#performance--scalability)
11. [Testing Strategy](#testing-strategy)
12. [Integration Points](#integration-points)
13. [Technical Decisions & Rationale](#technical-decisions--rationale)
14. [Future Architecture Considerations](#future-architecture-considerations)

---

## Executive Summary

The **Water Atlas** is a static web application designed to provide municipalities with a lightweight, GitHub Pages-deployable platform for managing and visualizing water infrastructure data. The system integrates three primary data sources:

1. **Service Line Inventory** - Point data of water service connections with material composition
2. **Resident Submissions** - Crowdsourced water quality test results (pH, TDS, lead levels)
3. **NYS Tax Parcel Data** - Enriched with building age for lead pipe risk correlation

The architecture follows a **JAMstack pattern** (JavaScript, APIs, Markup), emphasizing static generation, client-side rendering, and API-driven data updates. This design prioritizes:
- **Zero infrastructure costs** (GitHub Pages hosting)
- **Zero server maintenance** (no backend processes)
- **Fast global delivery** (CDN-distributed static assets)
- **Municipal IT friendliness** (no complex deployments)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Source    │  │ Data Sources │  │   GitHub Actions        │ │
│  │  Code      │  │  (CSV, APIs) │  │  - CI/CD (deploy.yml)   │ │
│  │  (Astro)   │  │              │  │  - Data Sync            │ │
│  └────────────┘  └──────────────┘  │  - Testing              │ │
│                                     └─────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Build & Deploy
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Pages (CDN)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Static Assets (HTML, CSS, JS, GeoJSON)                   │  │
│  │  - /index.html (Main UI)                                  │  │
│  │  - /examples/parcels-age.html (Parcel visualization)      │  │
│  │  - /data/service_lines.geojson                            │  │
│  │  - /data/submissions.json                                 │  │
│  │  - /data/parcels_nys.geojson                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS Request
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Leaflet.js  │  │ Form Handler │  │  Nominatim Client   │   │
│  │  (Mapping)   │  │ (Submission) │  │  (Geocoding)        │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  - Nominatim (OpenStreetMap geocoding)                          │
│  - NYS GIS MapServer (Parcel data API)                          │
│  - Configurable submission endpoint (POST target)               │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User visits** `https://evcatalyst.github.io/niskayuniverse/`
2. **Browser loads** static HTML, CSS, JS from GitHub Pages CDN
3. **JavaScript fetches** GeoJSON data files from `/data/` directory
4. **Leaflet renders** service lines, submissions, and parcels on interactive map
5. **User submits** water quality data → POSTs to configurable endpoint (e.g., Google Forms, Zapier, custom API)
6. **Address autocomplete** queries Nominatim API (respecting rate limits)

---

## Architecture Principles

### 1. Static-First Design
- **Pre-render everything possible** at build time
- No server-side logic at runtime (except external API calls)
- Data updates trigger rebuilds, not dynamic queries

**Rationale**: Eliminates hosting costs, reduces attack surface, maximizes performance.

### 2. Client-Side Intelligence
- All data filtering, sorting, and visualization happens in browser
- Progressive enhancement: map loads, then data layers, then interactivity

**Rationale**: Leverages modern browser capabilities, reduces server dependency.

### 3. Configuration Over Code
- All site-specific settings in `src/lib/siteConfig.js`
- Environment variables for secrets and endpoints
- No hardcoded municipality names or coordinates

**Rationale**: Enables template reuse for any municipality with minimal code changes.

### 4. Data Validation First
- Schema validation (`scripts/validators.mjs`) runs on every data update
- CI pipeline fails if data is malformed
- Unit tests verify parsing logic (year ranges, coordinate bounds)

**Rationale**: Prevents deployment of broken data; ensures map always renders correctly.

### 5. Provenance Tracking
- Every data record includes `provenance` metadata (source, timestamp, confidence)
- Supports auditing and debugging data quality issues

**Rationale**: Critical for municipality accountability and data governance.

### 6. Separation of Concerns
- **Presentation** (`src/pages/`, `src/styles/`) - Astro components and CSS
- **Configuration** (`src/lib/siteConfig.js`) - Centralized settings
- **Data Processing** (`scripts/`) - Node.js scripts for ETL
- **Testing** (`tests/`) - Unit and E2E tests

**Rationale**: Clear boundaries improve maintainability and team collaboration.

---

## Technology Stack

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Astro | 4.x | Static site generation |
| **Mapping** | Leaflet | 1.9.4 | Interactive map rendering (CDN) |
| **Geocoding** | Nominatim | OSM API | Address autocomplete & resolution |
| **Styling** | CSS (custom) | N/A | Lightweight, no framework overhead |
| **JavaScript** | Vanilla ES6+ | N/A | No client-side framework bloat |

### Build & Tooling

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Package Manager** | npm | 20.x | Dependency management |
| **Build Tool** | Astro CLI | 4.x | Static site compilation |
| **Testing (Unit)** | Vitest | 4.x | Fast, Vite-native test runner |
| **Testing (E2E)** | Playwright | 1.57.x | Cross-browser UI testing |
| **Type Checking** | TypeScript | 5.x | Data pipeline type safety |
| **Linting** | (Placeholder) | N/A | ESLint not currently configured |

### Data & APIs

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Service Line Data** | GeoJSON (Point) | RFC 7946 compliant |
| **Parcel Data** | GeoJSON (Polygon) | NYS Tax Parcels API |
| **Submissions** | JSON array | Custom schema |
| **Geocoding API** | Nominatim (OSM) | Free, rate-limited (1 req/sec) |
| **Parcel Data Source** | NYS ArcGIS REST API | Annual updates |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | GitHub Pages | Free CDN hosting |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Version Control** | Git (GitHub) | Source control & collaboration |

---

## Data Architecture

### Data Models

#### 1. Service Line Inventory (`service_lines.geojson`)

**Schema**: GeoJSON FeatureCollection

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "svc-001",                    // Unique identifier
        "address": "123 River Road",        // Street address
        "private_material": "copper",       // Private side pipe material
        "public_material": "ductile iron",  // Public side pipe material
        "status": "verified",               // verified | unknown
        "updated": "2024-12-01"             // ISO 8601 date
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-73.8898, 42.8086] // [longitude, latitude]
      }
    }
  ]
}
```

**Validation Rules**:
- Each feature must have `id` and `address`
- Geometry must be Point with valid WGS84 coordinates
- `status` should be one of: `verified`, `unknown`
- Materials typically: `copper`, `lead`, `galvanized`, `pvc`, `unknown`

**Source**: Municipality-provided CSV (converted via scripts)

---

#### 2. Resident Submissions (`submissions.json`)

**Schema**: JSON array

```json
[
  {
    "id": "submission-001",
    "address": "124 River Road",
    "coordinates": { "lat": 42.8082, "lng": -73.889 },
    "ph": 7.3,                              // 0-14 scale
    "tds": 128,                             // Total Dissolved Solids (ppm)
    "temperatureF": 64.5,                   // Temperature in Fahrenheit
    "leadPpb": 0.8,                         // Lead concentration (parts per billion)
    "notes": "Tap test from kitchen sink.",
    "contact": "user@example.com",          // Optional, for follow-up
    "status": "received",                   // received | approved | rejected
    "submittedAt": "2024-12-02T10:15:00Z"  // ISO 8601 timestamp
  }
]
```

**Validation Rules**:
- Each entry must have `id`, `address`, `submittedAt`
- `coordinates` optional but recommended (enables map placement)
- `ph` should be 0-14 (if provided)
- `leadPpb` critical for risk assessment (EPA action level: 15 ppb)

**Source**: User submissions via form (POSTed to external endpoint, periodically synced back)

---

#### 3. NYS Tax Parcels (`parcels_nys.geojson`)

**Schema**: GeoJSON FeatureCollection (Polygon/MultiPolygon)

```json
{
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "EPSG:4326" } },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "parcel_id": "4633-100-1-1",
        "swis_code": "4633",                // State-Wide Identification System code
        "swis_sbl_id": "4633-100-1-1",      // Section-Block-Lot ID
        "swis_print_key_id": "4633.100-1-1",
        "year_built": 1975,                 // 1700 - current year
        "owner_name": "SAMPLE OWNER A",
        "street_addr": "671 ACORN DRIVE",
        "city": "Niskayuna",
        "zip": "12309",
        "provenance": {
          "source": "NYS_Tax_Parcels_Public",
          "source_url": "https://...",
          "fetched_at": "2024-12-21T13:00:00Z",
          "join_method": "address",         // key | address | spatial
          "confidence": 0.9                 // 0.0 - 1.0
        }
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [ /* coordinate rings */ ]
      }
    }
  ]
}
```

**Validation Rules**:
- `parcel_id` must be unique (normalized from SWIS_SBL_ID or SWIS_PRINT_KEY_ID)
- `year_built` must be integer in range [1700, current_year] or null
- Provenance must include `source`, `source_url`, `fetched_at`
- Geometry in EPSG:4326 (WGS84)

**Source**: NYS GIS ArcGIS REST API (fetched via `scripts/fetch-parcels.mts`)

---

#### 4. Parcel Index (`parcels_nys_index.json`)

**Schema**: Lightweight lookup object

```json
{
  "4633-100-1-1": {
    "parcel_id": "4633-100-1-1",
    "year_built": 1975,
    "owner_name": "SAMPLE OWNER A",
    "address": "671 ACORN DRIVE",
    "swis_code": "4633",
    "provenance": { /* ... */ }
  }
}
```

**Purpose**: Fast client-side lookup without loading full polygon geometries.

---

### Data Relationships

```
Service Line ───┐
                │ (spatial join or address match)
                ├──> Parcel (year_built, owner_name)
                │
Submission  ────┘
```

**Join Strategy** (as implemented in `fetch-parcels.mts`):
1. **Key match** (confidence: 1.0) - Direct parcel ID match
2. **Address normalization** (confidence: 0.9) - Fuzzy address matching
3. **Spatial join** (confidence: 0.7) - Point-in-polygon fallback

**Future Enhancement**: Store joined parcel_id in service_lines.geojson for fast lookups.

---

## Application Components

### Frontend Pages

#### 1. Main UI (`src/pages/index.astro`)

**Purpose**: Primary user-facing interface for map browsing and submissions.

**Key Features**:
- Interactive Leaflet map centered on municipality
- Service line markers (color-coded by status: verified, unknown)
- Resident submission markers (orange)
- Address autocomplete form
- Water quality submission form (pH, TDS, lead, temperature)
- Legend showing data layers

**Data Loading**:
- Fetches `data/service_lines.geojson` (client-side)
- Fetches `data/submissions.json` (client-side)
- Currently **does NOT** load parcel data (gap identified)

**JavaScript Architecture**:
- Vanilla ES6+, no frameworks
- Event-driven form handling
- Debounced Nominatim autocomplete (350ms delay)
- Async/await for data fetching

---

#### 2. Parcel Age Visualization (`public/examples/parcels-age.html`)

**Purpose**: Standalone demonstration of parcel layer with building age choropleth.

**Key Features**:
- LOD (Level-of-Detail) switching:
  - Zoom < 15: Show parcel centroids (circles)
  - Zoom ≥ 15: Show parcel polygons
- Building age color mapping:
  - Pre-1920: Dark brown (#7c2d12)
  - 1920-1950: Orange (#ea580c)
  - 1951-1986: Amber (#fbbf24) - **Lead pipe era**
  - Post-1986: Green (#4ade80) - Lead ban
  - Unknown: Gray (#94a3b8)
- Layer toggles (parcels, service lines)
- Hover effects on polygons

**Rationale for Separate File**: Originally created as proof-of-concept; **should be merged into main UI** (see Roadmap Phase 1).

---

#### 3. Control Panel (`public/control-panel.html`)

**Purpose**: Quick QA/debugging tool for service line data.

**Features**:
- Loads `service_lines.geojson`
- Filter by status (verified, unknown, all)
- Displays markers with basic popups

**Use Case**: Internal testing, not public-facing.

---

#### 4. Leaflet Example (`public/examples/leaflet.html`)

**Purpose**: Minimal demo of service line + submission rendering.

**Use Case**: Starter template for developers.

---

### Backend Scripts (Node.js)

#### 1. Data Fetching (`scripts/fetch-data.mjs`)

**Purpose**: Download remote service line and submission data.

**Flow**:
1. Read URLs from environment variables (`SERVICE_LINES_URL`, `SUBMISSIONS_URL`)
2. Fetch JSON from URLs
3. Validate schemas via `validators.mjs`
4. Write to `public/data/` directory

**Trigger**: Manual via `npm run fetch:data` or GitHub Actions cron.

---

#### 2. Parcel Data Fetching (`scripts/fetch-parcels.mts`)

**Purpose**: Query NYS GIS API for tax parcel data and enrich with building age.

**Flow**:
1. Query ArcGIS REST API with Niskayuna SWIS code and bounding box
2. Parse features, extract properties (year_built, owner_name, address)
3. Normalize parcel_id (prefer SWIS_SBL_ID → SWIS_PRINT_KEY_ID → OBJECTID)
4. Validate year_built (1700-current year range)
5. Join to service lines (optional enhancement)
6. Generate `parcels_nys.geojson` (full polygons)
7. Generate `parcels_nys_index.json` (lightweight lookup)

**Key Functions** (exported for testing):
- `parseYearBuilt(value)`: Validates and normalizes year (handles strings, nulls, out-of-range)
- `normalizeParcelId(attrs)`: Extracts parcel ID from various field names
- `normalizeAddress(addr)`: Uppercase, remove punctuation, normalize street suffixes (ST, RD, AVE)
- `attachProvenance(source, url, method?, confidence?)`: Metadata tagging

**Trigger**: Manual via `npm run fetch:parcels` or GitHub Actions.

---

#### 3. Data Validation (`scripts/validate-data.mjs`)

**Purpose**: Pre-deployment schema validation.

**Checks**:
- Service lines: GeoJSON FeatureCollection, Point geometries, required fields (id, address)
- Submissions: JSON array, required fields (id, address, submittedAt), valid coordinates

**Trigger**: Runs in CI pipeline before deployment.

---

#### 4. CSV Conversion (`scripts/convert-csv-to-json.js`)

**Purpose**: Convert municipality-provided CSV to GeoJSON (legacy script).

**Note**: May be deprecated in favor of fetch-parcels direct API approach.

---

### Configuration

#### `src/lib/siteConfig.js`

**Centralized Settings**:

```javascript
export const siteConfig = {
  municipalityName: 'MunicipalityName',  // Display name
  basePath: '/niskayuniverse',           // GitHub Pages repo path
  site: 'https://evcatalyst.github.io/niskayuniverse/',
  map: {
    center: [42.8073, -73.8945],        // [lat, lng] for Niskayuna
    zoom: 13
  },
  dataPaths: {
    serviceLines: 'data/service_lines.geojson',
    submissions: 'data/submissions.json'
  },
  dataSources: {
    serviceLines: process.env.SERVICE_LINES_URL || '',
    submissions: process.env.SUBMISSIONS_URL || ''
  },
  submissionEndpoint: process.env.SUBMISSION_ENDPOINT || 'https://httpbin.org/post',
  nominatimEndpoint: 'https://nominatim.openstreetmap.org/search'
};
```

**Design Pattern**: Environment variables override defaults, supporting deployment flexibility.

---

## Data Pipeline

### Automated Data Sync Workflow

```
┌────────────────────────────────────────────────────────────────┐
│  Trigger: Manual dispatch or cron (currently disabled)         │
└────────────────┬───────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  GitHub Actions: data-sync.yml                                 │
│  1. Checkout repo                                              │
│  2. npm ci (install dependencies)                              │
│  3. node scripts/fetch-data.mjs (fetch service lines/subs)     │
│  4. npm run fetch:parcels (fetch NYS parcel data)              │
│  5. npm run validate:data (schema validation)                  │
│  6. git diff public/data/                                      │
│  7. If changed: commit & push to main                          │
└────────────────┬───────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  Trigger: deploy.yml (on push to main)                         │
│  1. npm run validate:data                                      │
│  2. npm run build (Astro static generation)                    │
│  3. Upload ./dist to GitHub Pages                              │
└────────────────┬───────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  GitHub Pages CDN                                              │
│  Static site live at https://evcatalyst.github.io/niskayuniverse/ │
└────────────────────────────────────────────────────────────────┘
```

### Data Freshness

- **Service Lines**: Manual updates by municipality (CSV upload → fetch-data)
- **Submissions**: Depends on POST endpoint (could be real-time if synced via webhook)
- **Parcels**: NYS updates annually (Jan-Feb); manual trigger recommended

---

## Deployment & Infrastructure

### GitHub Pages Configuration

**Settings**:
- **Source**: GitHub Actions (not legacy `gh-pages` branch)
- **Custom Domain**: Supported (configure CNAME file)
- **HTTPS**: Enforced by default

**Base Path Handling**:
- All asset URLs prefixed with `siteConfig.basePath`
- `<base href="/niskayuniverse/">` tag in HTML head
- JavaScript resolves paths via `withBasePath()` helper

---

### CI/CD Pipeline

#### `deploy.yml` (Production Deployment)

**Trigger**: Push to `main` branch or manual dispatch

**Steps**:
1. Checkout code
2. Install Node.js dependencies
3. Validate data files
4. Build Astro static site (`npm run build`)
5. Upload `./dist` folder to GitHub Pages artifact
6. Deploy to Pages environment

**Concurrency**: Cancel in-progress deploys on new push.

---

#### `ci.yml` (Continuous Integration)

**Trigger**: Pull request or push to `main`

**Steps**:
1. Lint (currently placeholder)
2. Type check (`tsc --noEmit`)
3. Unit tests (Vitest)
4. Install Playwright browsers
5. Build (with retry on failure)
6. E2E tests (Playwright)

**Retry Logic**: If build fails, clean reinstall and retry (handles transient npm issues).

---

#### `data-sync.yml` (Scheduled Data Updates)

**Trigger**: Manual dispatch (cron commented out to prevent constant failures)

**Steps**:
1. Fetch remote data sources
2. Fetch parcel data
3. Validate
4. Commit only if `public/data/` changed

**Note**: Cron disabled pending stable data sources. Once configured, enable hourly or daily sync.

---

### Environment Variables & Secrets

**Repository Variables** (Settings → Secrets and variables → Variables):
- `SERVICE_LINES_URL`: URL to fetch service line GeoJSON/JSON
- `SUBMISSIONS_URL`: URL to fetch submissions JSON
- `BASE_PATH`: Override default `/niskayuniverse` (optional)

**Repository Secrets**:
- `SUBMISSION_ENDPOINT`: POST target for form submissions (if sensitive)
- Future: API keys for self-hosted Nominatim, analytics, etc.

---

## Security & Privacy

### Threat Model

**Attack Vectors**:
1. **XSS (Cross-Site Scripting)**: User-submitted data rendered in popups
2. **Data Injection**: Malformed GeoJSON/JSON crashes map
3. **DDoS**: Public submission endpoint abuse
4. **PII Leakage**: Submission contact info exposed

### Mitigations

#### 1. Input Sanitization

**Implemented**:
- `escapeHtml()` function in `parcels-age.html` sanitizes all popup content
- Prevents `<script>` injection in parcel attributes (owner_name, address)

**Required for Main UI**:
- Apply `escapeHtml()` to service line and submission popups in `index.astro`

---

#### 2. Data Validation

- Schema validation rejects malformed data before deployment
- CI pipeline blocks merges if validation fails

---

#### 3. Rate Limiting

**Nominatim**:
- Client-side debouncing (350ms) limits autocomplete requests
- Respects OSM usage policy (1 req/sec)

**Submission Endpoint**:
- Recommended: Use Google Forms (built-in CAPTCHA) or Zapier rate limits
- Future: Add client-side CAPTCHA (reCAPTCHA, hCaptcha)

---

#### 4. Privacy

**Submission Data**:
- Contact info (email/phone) optional
- Stored server-side only if endpoint configured for it
- Consider anonymizing contact info in public `submissions.json` (e.g., hash emails)

**Parcel Data**:
- Owner names are public record (NYS GIS data)
- No sensitive PII beyond what's already publicly available

---

#### 5. Content Security Policy (CSP)

**Not Currently Implemented**:
- Recommended: Add CSP headers to restrict script sources
- Challenge: Leaflet loaded from CDN (unpkg.com) - would need CSP exception

---

## Performance & Scalability

### Client-Side Performance

**Current Metrics** (estimated, based on codebase):
- **Page Load**: ~2-3 seconds (network dependent)
- **Map Render**: ~500ms for 3 service lines (sample data)
- **Parcel Layer**: ~2 seconds for ~100 parcels (parcels-age.html)

**Bottlenecks**:
1. **Large Parcel GeoJSON**: Full polygon geometries for entire municipality could be 10+ MB
2. **Leaflet Rendering**: Polygons are slower than points (LOD switching mitigates this)

---

### Optimization Strategies

#### 1. Level-of-Detail (LOD) Switching

**Implemented in `parcels-age.html`**:
- Zoom < 15: Render parcel centroids (circles) - lightweight
- Zoom ≥ 15: Render full polygons - detailed

**Performance Gain**: 10x faster rendering at low zoom.

---

#### 2. Data Simplification

**Recommendation**: Use Mapshaper to simplify parcel geometries
```bash
mapshaper parcels_nys.geojson -simplify 10% -o parcels_nys_simplified.geojson
```

**Trade-off**: Slight loss of boundary precision for 50%+ file size reduction.

---

#### 3. PMTiles (Future)

**Alternative**: Convert GeoJSON to PMTiles (Mapbox Vector Tiles)
- Supports zoom-level tiling (load only visible tiles)
- Reduces initial download size
- Requires PMTiles loader library

**Effort**: Medium (script already exists: `scripts/generate-pmtiles.mjs`)

---

#### 4. Service Worker Caching

**Not Implemented**:
- `sw.js` and `sw-register.js` exist in repo but unused
- Could cache GeoJSON files for offline access

---

### Scalability Limits

**GitHub Pages Constraints**:
- 1 GB repository size limit (including history)
- 100 GB/month bandwidth soft limit
- Static files only (no server-side computation)

**Mitigation**:
- If data exceeds 1 GB, host GeoJSON on external CDN (AWS S3, Cloudflare R2)
- Use parcel index for lookup-heavy operations (avoid loading full geometries)

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage**: `tests/unit/parcels.test.ts`

**Test Cases**:
- `parseYearBuilt()`: Valid years, invalid values, edge cases (1699, future years)
- `normalizeParcelId()`: Prefer SWIS_SBL_ID, fallback to OBJECTID
- `normalizeAddress()`: Uppercase, suffix normalization (Street → ST)
- `attachProvenance()`: Metadata fields correctly populated
- Data file validation: Parcel index has valid structure and year ranges

**Run**:
```bash
npm test           # Run once
npm run test:watch # Watch mode
```

---

### E2E Tests (Playwright)

**Coverage**: `tests/e2e/parcels.spec.ts`

**Test Cases**:
- Parcel data files accessible (200 status)
- GeoJSON has correct schema (FeatureCollection, properties)
- Year Built values within valid range (1700-current year)
- Page loads without errors (excluding favicon/SW warnings)
- Visual regression: Screenshot of parcels-age.html

**Run**:
```bash
npm run test:e2e      # Headless
npm run test:e2e:ui   # Interactive UI
```

---

### Manual Testing

**Checklist** (from `TESTING.md`):
1. `npm run dev` → Verify map loads service lines + submissions
2. Submit form → Check success message and orange marker appears
3. Autocomplete → Type address, verify suggestions and map pans
4. Open `public/examples/leaflet.html` → Verify base path resolution
5. Open `public/control-panel.html` → Verify status filter works

---

## Integration Points

### External APIs

#### 1. Nominatim (OpenStreetMap)

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Usage**: Address autocomplete and geocoding

**Rate Limit**: 1 request/second (per OSM usage policy)

**Authentication**: None (free)

**Fallback**: Could switch to Mapbox Geocoding API (requires API key)

---

#### 2. NYS GIS ArcGIS REST API

**Endpoint**: `https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Tax_Parcels_Public/MapServer`

**Usage**: Fetch tax parcel polygons and attributes

**Authentication**: None (public dataset)

**Update Cadence**: Annually (Jan-Feb)

**Data License**: NYS Open Data (public domain)

---

#### 3. Submission POST Endpoint

**Default**: `https://httpbin.org/post` (echo service for testing)

**Production Options**:
- **Google Forms**: Form responses → Google Sheets → Export as JSON
- **Zapier/Make**: Webhook → Transform → Append to hosted JSON
- **Custom API**: AWS Lambda, Netlify Functions, etc.

**Required Response**: 200 OK status (body ignored)

---

### Future Integrations

- **311 Systems**: Link parcels to service requests (water main breaks)
- **GIS Platforms**: Export to ArcGIS Online, QGIS
- **Email Notifications**: SendGrid, AWS SES for high-risk submissions
- **Analytics**: Google Analytics, Plausible for usage tracking

---

## Technical Decisions & Rationale

### Why Astro?

**Alternatives Considered**: Next.js, Gatsby, Jekyll

**Reasons for Astro**:
1. **Zero JavaScript by default** - Fastest possible load times
2. **Partial hydration** - Interactive components only where needed
3. **GitHub Pages friendly** - Static output, no Node.js runtime required
4. **Developer experience** - Familiar JSX-like syntax, fast HMR

**Trade-offs**: Smaller ecosystem than Next.js, but simplicity > features for this use case.

---

### Why Leaflet (not Mapbox GL)?

**Alternatives Considered**: Mapbox GL JS, OpenLayers

**Reasons for Leaflet**:
1. **No API key required** - Zero setup friction for municipalities
2. **Lightweight** - 40 KB gzipped vs 200+ KB for Mapbox GL
3. **OSM tiles** - Free and unrestricted
4. **Mature ecosystem** - Extensive plugin library

**Trade-offs**: Limited 3D capabilities, but 2D maps sufficient for current requirements.

---

### Why GitHub Pages (not Netlify/Vercel)?

**Reasons**:
1. **Zero cost** - Already using GitHub for version control
2. **No configuration** - Deploy action built-in
3. **Municipal IT friendly** - Most municipalities already have GitHub accounts

**Trade-offs**: No serverless functions (but workaround: external endpoints for form submissions).

---

### Why Static (not Dynamic Backend)?

**Reasons**:
1. **Cost** - No server hosting fees
2. **Maintenance** - No security patches, no uptime monitoring
3. **Performance** - CDN-distributed assets, instant global delivery
4. **Resilience** - No database failures, no server crashes

**Trade-offs**: Data updates require rebuild (acceptable for daily/hourly sync cadence).

---

## Future Architecture Considerations

### When to Migrate to Dynamic Backend

**Triggers**:
1. Real-time submission requirements (can't wait for rebuild)
2. User authentication needed (admin portal for staff)
3. Complex analytics requiring server-side aggregation
4. Database-backed search (e.g., "Find all parcels built before 1950 with lead pipes")

**Migration Path**: Astro → Astro + Netlify Functions → Next.js (API routes)

---

### Scaling to State-Wide Deployment

**Challenges**:
1. **Data Volume**: NY State has 10M+ parcels (would require PMTiles or tiling service)
2. **Multi-Municipality**: Subdomain routing (`niskayuna.wateratlas.ny.gov`)
3. **Centralized Data**: State-managed parcel database

**Solution**:
- Micro-frontends: Each municipality has own GitHub repo
- Shared component library: `@wateratlas/ui` npm package
- Federated data API: State-level aggregation endpoint

---

### Advanced Analytics Architecture

**Requirements** (if analytics dashboard added):
- Client-side: D3.js or Chart.js for visualizations
- Server-side: PostgreSQL + PostGIS for spatial queries
- API: GraphQL or REST for flexible querying

**Recommended Stack**:
- **Frontend**: Astro + React islands (for interactive charts)
- **Backend**: Supabase (PostgreSQL as a service) or AWS RDS
- **API**: Hasura (auto-generated GraphQL from PostgreSQL)

---

## Appendix: Key File Locations

```
niskayuniverse/
├── src/
│   ├── pages/
│   │   └── index.astro                  # Main UI
│   ├── lib/
│   │   └── siteConfig.js                # Centralized configuration
│   └── styles/
│       └── global.css                   # Shared styles
├── public/
│   ├── data/
│   │   ├── service_lines.geojson        # Service line inventory
│   │   ├── submissions.json             # Resident submissions
│   │   ├── parcels_nys.geojson          # Tax parcel polygons
│   │   └── parcels_nys_index.json       # Parcel lookup index
│   ├── examples/
│   │   ├── parcels-age.html             # Parcel visualization demo
│   │   ├── leaflet.html                 # Leaflet basic demo
│   │   └── control-panel.html           # Service line QA tool
├── scripts/
│   ├── fetch-data.mjs                   # Fetch service lines/submissions
│   ├── fetch-parcels.mts                # Fetch NYS parcel data
│   ├── validate-data.mjs                # Schema validation
│   └── validators.mjs                   # Validation functions
├── tests/
│   ├── unit/
│   │   └── parcels.test.ts              # Unit tests for parcel processing
│   └── e2e/
│       └── parcels.spec.ts              # E2E tests for UI
├── .github/
│   └── workflows/
│       ├── deploy.yml                   # Production deployment
│       ├── ci.yml                       # CI pipeline
│       └── data-sync.yml                # Data sync automation
├── astro.config.mjs                     # Astro build configuration
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── vitest.config.ts                     # Unit test configuration
└── playwright.config.ts                 # E2E test configuration
```

---

## Glossary

- **SWIS**: State-Wide Identification System (NYS tax parcel coding)
- **SBL**: Section-Block-Lot (parcel identifier format)
- **TDS**: Total Dissolved Solids (water quality metric, ppm)
- **ppb**: Parts per billion (lead concentration metric)
- **Choropleth**: Map visualization using color gradients for quantitative data
- **LOD**: Level of Detail (rendering different geometries based on zoom)
- **PMTiles**: Protobuf-based vector tile format for efficient map data delivery
- **JAMstack**: JavaScript, APIs, Markup (static site architecture pattern)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-21 | Copilot | Initial architecture documentation |

---

**END OF DOCUMENT**
