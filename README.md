# Water Atlas (MunicipalityName)

A lightweight, static “Water Atlas” template for municipalities. It ships with:

- Astro static output (GitHub Pages friendly)
- Leaflet map loading inventory (`public/data/service_lines.geojson`) and resident submissions (`public/data/submissions.json`)
- Address autocomplete via Nominatim
- Configurable submission POST endpoint (no secrets committed)
- GitHub Actions for manual/scheduled data refresh into `public/data/`

## Stack

- Astro 4 (static output)
- Leaflet (CDN) for mapping
- Vanilla JS for form, autocomplete, and map overlays

## Base path & site config

All runtime paths flow through [`src/lib/siteConfig.js`](src/lib/siteConfig.js):

- `basePath` (default `/niskayuniverse`) – used by Astro `base`, `<base>` tag, and data URLs.
- `dataPaths` – relative paths under `public/data/`.
- `dataSources` – optional remote URLs for `scripts/fetch-data`.
- `submissionEndpoint` – POST target for submissions (defaults to `https://httpbin.org/post`).

When deploying under another repo name, update `basePath` (and `site` if desired) in `siteConfig`.

## Running locally

```bash
npm ci
npm run dev
# build check
npm run build
# data validation
npm run validate:data
```

Open http://localhost:4321 (Astro default). The map reads sample data from `public/data/`.

## Data pipeline

Scripts live in `scripts/`:

- `npm run fetch:data` – fetches remote sources (if `SERVICE_LINES_URL` / `SUBMISSIONS_URL` are set as env or repo variables), validates, and writes to `public/data/`.
- `npm run fetch:parcels` – fetches NYS tax parcel data for Niskayuna, enriches with Year Built, and writes `parcels_nys.geojson` and `parcels_nys_index.json` to `public/data/`.
- `npm run validate:data` – validates the checked-in files (`service_lines.geojson`, `submissions.json`).

Validation rules:

- `service_lines.geojson` must be a FeatureCollection of Point features with `id`, `address`, and valid coordinates.
- `submissions.json` must be an array; each entry needs `id`, `address`, `submittedAt`, and optional `coordinates { lat, lng }`.

### NYS Parcel Data Integration

The system integrates with New York State standardized parcel datasets to provide parcel geometry and Year Built enrichment:

**Authoritative NYS Sources:**
- [NYS Parcels Program](https://gis.ny.gov/parcels) – Download and web services landing page
- [NYS Parcel Data Dictionary](https://gis.ny.gov/standardized-tax-parcel-data-dictionary) – Standardized schema and field definitions
- [NYS Public Parcels MapServer](https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Tax_Parcels_Public/MapServer) – 2024 parcel polygons (updated annually)

**Schema and Outputs:**

The parcel fetching process produces two normalized outputs in `public/data/`:

1. **`parcels_nys.geojson`** – Parcel polygon geometries with properties:
   - `parcel_id` – Normalized ID (prefers `SWIS_SBL_ID`, fallback to `SWIS_PRINT_KEY_ID`)
   - `year_built` – Parsed as integer (1700-current year) or null
   - `owner_name`, `street_addr`, `city`, `zip` – Parcel attributes
   - `provenance` – Source metadata including join method and confidence

2. **`parcels_nys_index.json`** – Lightweight lookup index keyed by `parcel_id` with selected attributes

**Join Strategy:**
Service line records are joined to parcels using the following hierarchy:
1. **Key match** – Direct parcel ID match (confidence: 1.0)
2. **Address normalization** – Fuzzy address matching (confidence: 0.9)
3. **Spatial join** – Centroid-in-polygon fallback (confidence: 0.7)

**CRS:** All parcel data is delivered in EPSG:4326 (WGS84) for web mapping compatibility.

**Update Cadence:** NYS parcel data is updated annually. Run `npm run fetch:parcels` to refresh local data.

### GitHub Actions

- [`deploy.yml`](.github/workflows/deploy.yml): runs on push to `main` (or manual) → validates data → `npm run build` → deploys to GitHub Pages.
- [`data-sync.yml`](.github/workflows/data-sync.yml): manual by default (cron commented) → `npm ci` → `npm run fetch:data` → `npm run validate:data` → commits `public/data/` only if changed. Configure repo **Variables** `SERVICE_LINES_URL` and `SUBMISSIONS_URL` to point at your sources.

Other legacy workflows/configs were removed to keep this track canonical.

## User Interfaces

### Main UI (`/`)
Public-facing portal with service line map, resident submission form, and address autocomplete.

### Analytics Dashboard (`/analytics`)
**NEW** - Professional full-screen analytics interface featuring:
- Full-screen interactive map with all data layers
- Minimizable, draggable overlay panels for search, layer control, and statistics
- Historical data timeline chart showing pH and lead levels over time
- Building age choropleth visualization (Pre-1920, 1920-1950, Lead Era 1951-1986, Post-1986)
- Real-time statistics (total parcels, lead era buildings, submissions, avg pH)
- Cross-layer search (parcels, service lines, submissions)
- LOD (Level of Detail) switching for performance

**[View Analytics UI Documentation](docs/ANALYTICS_UI.md)** for detailed usage guide.

## Data & examples

- `public/data/service_lines.geojson`: sample FeatureCollection.
- `public/data/submissions.json`: sample resident submissions.
- `public/data/parcels_nys.geojson`: NYS tax parcel polygons with Year Built enrichment.
- `public/data/parcels_nys_index.json`: parcel attribute index keyed by parcel_id.
- `public/examples/leaflet.html`: standalone Leaflet demo (resolves paths via the base path).
- `public/examples/parcels-age.html`: parcel building age visualization with LOD switching, layer toggles, and choropleth mapping.
- `public/control-panel.html`: quick visual preview of service line markers.

## Submission flow

- Address autocomplete uses Nominatim (respect rate limits).
- Form POSTs JSON to `siteConfig.submissionEndpoint` (configurable; defaults to a safe placeholder).
- No secrets are committed; supply endpoints via env/repo variables.

## Deployment

GitHub Pages is the expected host. Ensure Pages source is “GitHub Actions” and push to `main` to deploy. The base path should match the repository name unless you set a custom domain. Workflows already use the base path from `siteConfig`.

## Notes for new municipalities

1. Update `src/lib/siteConfig.js` (`municipalityName`, `basePath`, `map.center`, endpoints).
2. Configure repo variables `SERVICE_LINES_URL` / `SUBMISSIONS_URL`.
3. Run `npm run fetch:data && npm run validate:data`.
4. Commit and push to `main` to deploy.
