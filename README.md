# Niskayuna Universe

A comprehensive water infrastructure and quality monitoring platform for Niskayuna, NY. This project combines two main components:

1. **Water Quality Atlas** - Community-powered water quality monitoring with interactive submission form
2. **Service Line Markers** - Visualization tools for mapping and analyzing service line data

## Overview

### Water Quality Atlas

The Water Quality Atlas enables residents to:

- Submit water quality test results (pH, TDS, temperature, lead levels) with location data
- View community water quality data on an interactive map
- Track water quality trends across the neighborhood
- Access historical test data

### Service Line Markers

The Service Line Markers component provides:

- Interactive visualization of service line materials (lead, copper, galvanized, plastic)
- Multiple map examples (Leaflet, Mapbox GL, deck.gl)
- Configurable marker styles with level-of-detail (LOD) switching
- Control panel for customizing visualization settings
- 7,940+ geocoded service line records from Niskayuna

## Architecture

This project uses a dual-architecture approach:

### Water Quality Atlas (Main App)
- **Frontend**: Astro static site with Leaflet.js for interactive mapping
- **Backend**: Google Apps Script for data storage and retrieval
- **Data Storage**: Google Sheets for community submissions
- **Deployment**: GitHub Pages with automated deployment via GitHub Actions
- **Offline Support**: Service Worker for progressive web app (PWA) functionality

### Service Line Markers (Visualization Tools)
- **Frontend**: Static HTML/JavaScript demos with multiple mapping libraries
- **Data**: Pre-processed GeoJSON from Niskayuna service line inventory (7,940 features)
- **Mapping**: Leaflet, Mapbox GL, and deck.gl examples
- **Visualization**: Control panel for customizing marker styles, colors, and LOD settings

## Features

### Water Quality Atlas

- **Interactive Map**: Leaflet-based map centered on Niskayuna, NY
- **Data Submission Form**: 
  - Email attribution for submitted tests
  - Address autocomplete using OpenStreetMap Nominatim API
  - Water quality metrics: pH, TDS (Total Dissolved Solids), temperature, lead levels
  - Optional notes field for additional context
- **Real-time Updates**: Automatic polling for new submissions every 30 seconds
- **Color-Coded Markers**: 
  - Red: pH < 6.5 (acidic)
  - Green: pH 6.5-8.5 (neutral)
  - Blue: pH > 8.5 (alkaline)
- **Sample Data**: Pre-populated with example test results
- **Offline Caching**: Service worker caches assets and data for offline viewing

### Service Line Markers

- **7 Marker Variants**: split, nested, donut, hex, halo, band, pin
- **Material Types**: Lead, Copper, Galvanized, Plastic, Unknown
- **Color Palettes**: 
  - Okabe-Ito (colorblind-safe, default)
  - ColorBrewer Dark2
  - Monochrome with patterns
- **Level of Detail (LOD)**: Automatic style switching based on zoom level
  - City (≤12): halo style, small size
  - Neighborhood (12-15): nested style, medium size
  - Parcel (≥15): split style, large size
- **Marker States**:
  - Lead present: Optional pulse animation
  - Unknown material: Dashed outline or stripe pattern
  - Verified: Thin inner outline
- **Interactive Control Panel**: Live configuration with export/import JSON
- **Multiple Map Integrations**: Leaflet, Mapbox GL, deck.gl examples

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:4321/niskayuniverse/` to view the application.

## Development

### Prerequisites

- Node.js 20+
- npm

### Available Scripts

- `npm run dev` - Start Astro development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run format` - Format code with Prettier

### Project Structure

```
├── src/
│   ├── pages/
│   │   └── index.astro          # Main Water Quality Atlas page
│   ├── components/
│   │   ├── Map.astro            # Map container component
│   │   └── SubmitForm.astro     # Water quality submission form
│   └── scripts/
│       ├── map.js               # Map initialization and marker logic
│       └── form.js              # Form handling and address autocomplete
├── public/
│   ├── data/
│   │   ├── tests.json           # Water quality test data
│   │   ├── markers.json         # Service line markers (7,940 features, 6.4 MB)
│   │   └── items.json           # Service line items list
│   ├── examples/
│   │   ├── leaflet.html         # Leaflet service line demo
│   │   ├── mapbox-gl.html       # Mapbox GL service line demo
│   │   └── deckgl.html          # deck.gl service line demo
│   └── control-panel.html       # Service line marker control panel
├── sw.js                        # Service worker for offline support
└── astro.config.mjs             # Astro configuration
```

## Deployment

### GitHub Pages

The site automatically deploys to GitHub Pages when changes are pushed to the `v2` branch:

1. GitHub Actions builds the Astro site
2. Static files are deployed to GitHub Pages
3. Site is available at `https://evcatalyst.github.io/niskayuniverse/`

### Manual Deployment

```bash
npm run build
# Built files are in ./dist
```

## Data Backend

### Water Quality Atlas

The Water Quality Atlas uses Google Apps Script as a serverless backend:

- **Endpoint**: `https://script.google.com/macros/s/AKfycbyTuL-uqaZnb4z9SjPBDi5yjSFvj7kc5ymTKa7zNkLNDAWeNaWHFevLt4VR606qs5G4/exec`
- **GET**: Retrieves all water quality test submissions
- **POST**: Submits new water quality test data
- **Storage**: Google Sheets stores all submissions

#### Water Quality Data Format

```json
{
  "timestamp": "2025-11-02T10:30:00Z",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "latitude": 42.7851,
  "longitude": -73.8949,
  "address": "123 Main St, Niskayuna, NY",
  "pH": 7.2,
  "tds": 150,
  "temperature": 68,
  "lead": null,
  "notes": "Kitchen tap test",
  "verified": true
}
```

### Service Line Markers

Service line data is pre-processed and stored as static GeoJSON:

- **Source**: Niskayuna service line inventory (8,075 records from PDF)
- **Geocoding**: 98.3% success rate via NYS GIS API (7,940 features)
- **Data Files**:
  - `markers.json`: 6.4 MB GeoJSON with coordinates and material types
  - `items.json`: 34.5 KB item list with address and parcel data
- **CSV Source**: `niskayuna_service_lines_full.csv` with normalized data

#### Service Line Data Format

```json
{
  "type": "Feature",
  "id": "unique-id",
  "geometry": {
    "type": "Point",
    "coordinates": [-73.8949, 42.7851]
  },
  "properties": {
    "address": "123 Main St",
    "private_type": "Copper",
    "public_type": "Copper",
    "verified": true,
    "confidence": "high"
  }
}
```

## How to Submit Water Quality Data

1. Visit the main site at [https://evcatalyst.github.io/niskayuniverse/](https://evcatalyst.github.io/niskayuniverse/)
2. Fill out the submission form:
   - **Email**: Your email for attribution
   - **Address**: Start typing your address (autocomplete suggestions will appear)
   - **pH**: Required (0-14 scale)
   - **TDS**: Optional (Total Dissolved Solids in ppm)
   - **Temperature**: Optional (in °F)
   - **Lead**: Optional (in ppb)
   - **Notes**: Optional observations or test conditions
3. Click "Submit Test"
4. Your marker will appear on the map within 30 seconds

## Service Line Marker Demos

### Available Demos

- **Leaflet Demo**: `https://evcatalyst.github.io/niskayuniverse/examples/leaflet.html`
  - Full-featured demo with search, address lookup, and pH overlay toggle
  - 7,940 service line markers with material type visualization
  
- **Mapbox GL Demo**: `https://evcatalyst.github.io/niskayuniverse/examples/mapbox-gl.html`
  - Vector-based rendering with smooth zoom transitions
  - Requires Mapbox API token (falls back to MapLibre GL)
  
- **deck.gl Demo**: `https://evcatalyst.github.io/niskayuniverse/examples/deckgl.html`
  - WebGL-powered visualization for high-performance rendering
  
- **Control Panel**: `https://evcatalyst.github.io/niskayuniverse/control-panel.html`
  - Configure marker styles, colors, palettes, and LOD settings
  - Export/import JSON configurations
  - Generate viewer and embed links

### Using the Control Panel

1. Open the control panel at `/control-panel.html`
2. Configure marker options:
   - Select marker variant (split, nested, donut, hex, halo, band, pin)
   - Choose color palette (Okabe-Ito, Dark2, Monochrome)
   - Adjust marker size and stroke width
   - Enable/disable states (lead present, verified, unknown material)
   - Set LOD thresholds for zoom-based styling
3. Preview changes in real-time
4. Export configuration as JSON
5. Generate viewer or embed links with custom settings

## APIs Used

### Water Quality Atlas
- **OpenStreetMap Nominatim**: Address geocoding and autocomplete
- **Google Apps Script**: Data storage and retrieval
- **Leaflet.js**: Interactive mapping
- **OpenStreetMap Tiles**: Map visualization

### Service Line Markers
- **NYS GIS API**: Address geocoding for service line locations
- **Leaflet.js / Mapbox GL / deck.gl**: Map rendering libraries
- **PMTiles** (optional): Efficient vector tile format for large datasets

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions, including:

- Address autocomplete verification
- Form submission testing
- Map functionality checks
- Data persistence validation

## Known Limitations

### Water Quality Atlas
- Google Apps Script rate limits: 5 requests per minute per user
- Nominatim API requests should be throttled (1 per second recommended)
- Form submissions require valid coordinates from geocoding

### Service Line Markers
- Large dataset (6.4 MB) may have slower initial load on slow connections
- Mapbox GL demo requires API token for full functionality (falls back to MapLibre GL)
- Some addresses may not have precise geocoding (98.3% success rate)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Test locally with `npm run build && npm run preview`
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/improvement`)
7. Open a Pull Request

## License

MIT
