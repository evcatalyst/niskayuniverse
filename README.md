# Niskayuna Water Quality Atlas

A community-powered water quality monitoring application for Niskayuna, NY. Residents can submit water quality test results from their homes and view community data on an interactive map.

## Overview

The Niskayuna Water Quality Atlas enables residents to:

- Submit water quality test results (pH, TDS, temperature, lead levels) with location data
- View community water quality data on an interactive map
- Track water quality trends across the neighborhood
- Access historical test data

## Architecture

This project uses a serverless architecture with GitHub Pages and Google Apps Script:

- **Frontend**: Astro static site with Leaflet.js for interactive mapping
- **Backend**: Google Apps Script for data storage and retrieval
- **Data Storage**: Google Sheets for community submissions
- **Deployment**: GitHub Pages with automated deployment via GitHub Actions
- **Offline Support**: Service Worker for progressive web app (PWA) functionality

## Features

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
│   │   └── index.astro          # Main page
│   ├── components/
│   │   ├── Map.astro            # Map container component
│   │   └── SubmitForm.astro     # Water quality submission form
│   └── scripts/
│       ├── map.js               # Map initialization and marker logic
│       └── form.js              # Form handling and address autocomplete
├── public/
│   └── data/
│       └── tests.json           # Sample water quality data
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

### Google Apps Script Integration

The application uses Google Apps Script as a serverless backend:

- **Endpoint**: `https://script.google.com/macros/s/AKfycbyTuL-uqaZnb4z9SjPBDi5yjSFvj7kc5ymTKa7zNkLNDAWeNaWHFevLt4VR606qs5G4/exec`
- **GET**: Retrieves all water quality test submissions
- **POST**: Submits new water quality test data
- **Storage**: Google Sheets stores all submissions

### Data Format

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

## How to Submit Water Quality Data

1. Visit the site at [https://evcatalyst.github.io/niskayuniverse/](https://evcatalyst.github.io/niskayuniverse/)
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

## APIs Used

- **OpenStreetMap Nominatim**: Address geocoding and autocomplete
- **Google Apps Script**: Data storage and retrieval
- **Leaflet.js**: Interactive mapping
- **OpenStreetMap Tiles**: Map visualization

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions, including:

- Address autocomplete verification
- Form submission testing
- Map functionality checks
- Data persistence validation

## Known Limitations

- Google Apps Script rate limits: 5 requests per minute per user
- Nominatim API requests should be throttled (1 per second recommended)
- Form submissions require valid coordinates from geocoding

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
