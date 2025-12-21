# Testing guide

Manual smoke tests to verify the Water Atlas stack:

1. Install and build

```bash
npm ci
npm run build
npm run validate:data
```

2. Local UI

- Run `npm run dev` and open http://localhost:4321.
- Confirm the map loads service line points and submission points from `public/data/`.
- Submit the form with an address; expect a success message (or the configured endpoint error) and a new orange marker.
- Type an address (≥3 chars); Nominatim suggestions should appear and pan the map when selected.

3. Static demos

- Open `public/examples/leaflet.html` in a browser to confirm assets load under the repo base path.
- Open `public/control-panel.html` and toggle the status filter to verify markers render from `service_lines.geojson`.
