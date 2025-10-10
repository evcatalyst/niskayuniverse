# Service Line Markers

A production-ready web application demonstrating a "Pages for hosting, Actions for backend" architecture on GitHub Pages. Features an interactive service-line marker design system with configurable visual tokens, level-of-detail (LOD) switching, and a comprehensive control panel.

## Architecture

This project uses GitHub Pages for static hosting and GitHub Actions as a serverless backend:

- **Frontend**: React + TypeScript + Vite, deployed statically to GitHub Pages
- **Backend**: Scheduled GitHub Actions fetch data from public APIs and commit JSON to the repository
- **Design System**: Vanilla CSS + TypeScript for service-line markers with accessibility and performance optimizations

## Features

- **Service-Line Markers**: 7 visual variants (split, nested, donut, hex, halo, band, pin) with configurable palettes and states
- **Level of Detail (LOD)**: Automatic style switching based on zoom level
- **Control Panel**: Interactive configuration with export/import, viewer/embed modes
- **Map Examples**: Mapbox GL, Leaflet, and deck.gl integrations
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance**: Optimized for 50+ FPS with thousands of markers

## Quick Start

```bash
npm install
npm run dev
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run end-to-end tests
- `npm run a11y` - Run accessibility tests

## Deployment

### GitHub Pages Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to `main` branch to trigger deployment
4. Optional: Add custom domain via `CNAME` file

### Preview Deployments

Pull requests automatically create preview deployments via GitHub Actions.

## Data Backend

The `data-sync.yml` workflow runs hourly and on manual trigger:

1. Fetches data from public JSON APIs
2. Processes and validates data
3. Commits updated JSON files to `public/data/`
4. Site instantly reflects changes

To add new data sources, modify `scripts/fetch-data.mts`.

## Design System

### Tokens

All visual tokens are defined in `src/styles/tokens.css` as CSS variables. Supports three palettes:

- Okabe-Ito (colorblind-safe, default)
- ColorBrewer Dark2
- Monochrome with patterns

### Marker Variants

- `split`: Circle split left/right (private/public)
- `nested`: Inner dot (private) + outer ring (public)
- `donut`: Ring with two semicircles
- `hex`: Hexagon split left/right
- `halo`: Outer halo (public) + inner dot (private)
- `band`: Rounded capsule split left/right
- `pin`: Badge/pin split left/right

### States

- Lead present: Optional pulse animation
- Unknown material: Dashed outline or stripe pattern
- Verified: Thin inner outline

### Level of Detail

Automatic switching based on zoom:

- City (≤12): `halo` style, small size
- Neighborhood (12-15): `nested` style, medium size
- Parcel (≥15): `split` style, large size

## Control Panel

Located at `public/control-panel.html`, provides:

- Live configuration of all marker options
- Export/import JSON configurations
- Viewer and embed link generation
- PostMessage API for embedded usage

## Map Examples

- `public/examples/mapbox-gl.html` - Mapbox GL JS integration
- `public/examples/leaflet.html` - Leaflet integration
- `public/examples/deckgl.html` - deck.gl integration

Mapbox requires an API token (optional, falls back to MapLibre GL).

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run e2e
```

### Accessibility

```bash
npm run a11y
```

## Configuration Schema

See `public/config.schema.json` for the complete JSON Schema definition of marker configurations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure CI passes
5. Submit pull request

## License

MIT