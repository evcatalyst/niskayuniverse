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
- `npm run validate:data` – validates the checked-in files (`service_lines.geojson`, `submissions.json`).

Validation rules:

- `service_lines.geojson` must be a FeatureCollection of Point features with `id`, `address`, and valid coordinates.
- `submissions.json` must be an array; each entry needs `id`, `address`, `submittedAt`, and optional `coordinates { lat, lng }`.

### GitHub Actions

- [`deploy.yml`](.github/workflows/deploy.yml): runs on push to `main` (or manual) → validates data → `npm run build` → deploys to GitHub Pages.
- [`data-sync.yml`](.github/workflows/data-sync.yml): manual by default (cron commented) → `npm ci` → `npm run fetch:data` → `npm run validate:data` → commits `public/data/` only if changed. Configure repo **Variables** `SERVICE_LINES_URL` and `SUBMISSIONS_URL` to point at your sources.

Other legacy workflows/configs were removed to keep this track canonical.

## Data & examples

- `public/data/service_lines.geojson`: sample FeatureCollection.
- `public/data/submissions.json`: sample resident submissions.
- `public/data/parcels_nys.geojson`: sample parcel polygons with building age data.
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
