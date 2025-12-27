# Mobile Dashboard UI Guide

## Overview

The mobile dashboard (`/mobile-dashboard`) implements a mobile-first map interface following OpenInfraMap UX patterns. It prioritizes progressive disclosure, thumb reach, and safe-area correctness while supporting rich layer visualization without blocking the map.

## UI Components

### 1. Top-Left Header
- **Location**: Fixed top-left with iOS safe area padding
- **Contents**: 
  - App title ("Water Map")
  - Quick links: "About" | "Key"
- **Behavior**: Compact, non-blocking, rounded corners with backdrop blur

### 2. Right-Side Control Stack
- **Location**: Fixed top-right with iOS safe area padding
- **Controls** (vertical stack):
  - Zoom In (+)
  - Zoom Out (−)
  - Layers toggle (≡)
- **Size**: 44x44px minimum for touch targets
- **Spacing**: 8px gap between buttons

### 3. Bottom-Right Info Button
- **Location**: Fixed bottom-right above layers panel
- **Button**: Circular "i" icon
- **Action**: Opens About/Data Sources modal
- **Position**: Adjusts vertically based on panel state

### 4. Layers Panel (Bottom Sheet)

**Three States:**
- **Peek (default)**: 80px visible
  - Shows title and drag handle
  - Map ~90% visible
- **Mid**: 55% screen height
  - Shows mode selector + layer groups
  - Map ~45% visible
- **Expanded**: 85% screen height
  - Full layer list with scroll
  - Map ~15% visible

**Interaction:**
- Tap drag handle to cycle states: peek → mid → expanded → peek
- Touch drag vertically to position panel
- Tap "Layers" button (≡) to toggle peek/mid
- Panel content scrolls independently

**Contents:**
- Analysis Mode selector (2x2 grid of mode buttons)
- Layer groups with toggles:
  - Background (radio buttons for basemap)
  - Boundaries, Data Points, Distribution, etc. (checkboxes)

### 5. Legend Modal
- **Trigger**: Tap "Key" link in header
- **Layout**: Centered card, max 400px width
- **Contents**: Dynamic - shows only enabled layers
- **Sections**: Grouped by category (Boundaries, Movement, Infrastructure, etc.)
- **Close**: × button (top-right) or tap backdrop

### 6. About Modal
- **Trigger**: Tap "About" link in header OR "i" button
- **Layout**: Centered card, max 400px width
- **Contents**:
  - Water Distribution Dashboard description
  - Data Sources (provenance list for enabled layers)
  - Base Map attribution
- **Close**: × button (top-right) or tap backdrop

### 7. Search Box (Optional)
- **Location**: Below header (currently hidden)
- **Purpose**: Placeholder for future search implementation
- **Show/Hide**: Toggle via CSS class

## Registry-Driven Behavior

All UI elements are populated from `/public/config/layers.registry.json`:

### Analysis Modes
```json
{
  "modes": [
    {
      "id": "overview",
      "label": "Overview",
      "description": "Simple, general view...",
      "enable_layers": ["service_area_boundary", "parcels", ...],
      "disable_layers": ["flow_accumulation", ...],
      "legend_profile": "default"
    }
  ]
}
```

**Behavior:**
- Mode buttons (max 4) populate from `modes` array
- Clicking mode applies `enable_layers` and `disable_layers`
- Legend updates to match `legend_profile`
- Active mode button highlighted in blue

### Layer Groups
```json
{
  "layers": [
    {
      "id": "service_area_boundary",
      "label": "Service Area Boundary",
      "group": "Boundaries",
      "type": "geojson",
      "geometry": "polygon",
      "path": "/data/water_service_area.geojson",
      "default_visible": true,
      "min_zoom": 0,
      "style": { ... },
      "legend": { ... },
      "provenance": { ... }
    }
  ]
}
```

**Behavior:**
- Layers grouped by `group` property
- Background/Basemap group uses radio buttons (mutually exclusive)
- All other groups use checkboxes
- Layers only load when visible and zoom >= `min_zoom`
- Provenance displayed in About modal when layer enabled

### Legend Profiles
```json
{
  "legend_profiles": {
    "default": {
      "sections": [
        { "id": "boundaries", "label": "Boundaries", "items": ["service_area_boundary"] }
      ]
    }
  }
}
```

**Behavior:**
- Each mode references a legend profile
- Sections group legend items
- Only shows items for currently enabled layers
- Swatch types: categories, line, dot, fill

## Editing the Registry

### Adding a New Layer

1. Add layer definition to `layers` array:
```json
{
  "id": "my_new_layer",
  "label": "My New Layer",
  "group": "Custom Group",
  "type": "geojson",
  "geometry": "point",
  "path": "/data/my_layer.geojson",
  "default_visible": false,
  "min_zoom": 12,
  "style": {
    "point_radius": 6,
    "color": "#ff6b6b"
  },
  "legend": {
    "swatch": "dot",
    "text": "My Layer Points",
    "color": "#ff6b6b"
  },
  "provenance": {
    "source_name": "Data Provider",
    "source_url": "https://example.com",
    "license": "Public Domain",
    "fetched_at": "AUTO_FROM_BUILD",
    "completeness": "Description of data completeness",
    "attribution_required": true
  }
}
```

2. Add to legend profile(s):
```json
{
  "legend_profiles": {
    "default": {
      "sections": [
        { "id": "custom", "label": "Custom", "items": ["my_new_layer"] }
      ]
    }
  }
}
```

3. Optionally add to mode(s):
```json
{
  "modes": [
    {
      "id": "overview",
      "enable_layers": ["my_new_layer", ...]
    }
  ]
}
```

### Creating a New Mode

1. Add to `modes` array:
```json
{
  "id": "my_analysis",
  "label": "My Analysis",
  "description": "Custom analysis mode...",
  "enable_layers": ["layer1", "layer2"],
  "disable_layers": ["layer3"],
  "legend_profile": "custom_profile"
}
```

2. Create corresponding legend profile:
```json
{
  "legend_profiles": {
    "custom_profile": {
      "sections": [
        { "id": "section1", "label": "Section 1", "items": ["layer1", "layer2"] }
      ]
    }
  }
}
```

**Note**: Mobile UI displays max 4 modes (2x2 grid). Additional modes will log a warning.

### Customizing Layer Groups

Groups are auto-generated from `layer.group` property. Common groups:
- **Background** or **Basemap**: Radio buttons (mutually exclusive)
- **Boundaries**: Parcel/service area boundaries
- **Data Points**: Point data (service lines, submissions)
- **Distribution**: Water infrastructure
- **Stormwater**: Storm system features
- **Topography**: Elevation, flow, ponding
- **Subsurface**: Soils, geology
- **Salt Exposure**: Salting routes

## Performance Optimization

### Lazy Loading
- Layers with `min_zoom > current_zoom + 3` are skipped on initial load
- Layers only fetch data when toggled visible
- Layer visibility state persisted in JavaScript Map

### Data Format Support
- **GeoJSON FeatureCollection**: Standard format
- **Array with coordinates**: Auto-converts to GeoJSON
  - Detects `{coordinates: {lat, lng}}` structure
  - Example: `submissions.json` format

### Geometry Simplification
- Use simplified geometries in GeoJSON for performance
- Recommended: Mapshaper with 10% tolerance
- Trade-off: Slight boundary imprecision for 50%+ file size reduction

### Future: Vector Tiles
- Consider PMTiles for large datasets (>10MB)
- Zoom-level tiling reduces initial load
- Requires PMTiles loader library

## Mobile UX Best Practices

### Touch Targets
- Minimum 44x44px for all interactive elements
- 8px spacing between buttons to avoid accidental taps
- Drag handle area generous (full panel width)

### Safe Areas
- iOS notch: `env(safe-area-inset-top)`
- Home indicator: `env(safe-area-inset-bottom)`
- All fixed UI elements respect safe areas

### Panel States
- Default to "peek" to maximize map visibility
- "Mid" state for quick layer toggles
- "Expanded" for detailed exploration
- Smooth transitions (300ms cubic-bezier easing)

### Modals
- Never full-screen (max 80vh)
- Always scrollable
- Easy to dismiss (× button + backdrop tap)
- Slight backdrop dimming (50% black)

### Typography
- Header: 14px (mobile compact)
- Panel title: 18px
- Layer labels: 15px (readable on small screens)
- Legend text: 14px
- Provenance details: 13px

### Colors
- Primary: #0ea5e9 (sky blue - accessible)
- Text: #1e293b (slate 800)
- Secondary text: #64748b (slate 500)
- Disabled: #94a3b8 (slate 400)
- Backgrounds: rgba(255, 255, 255, 0.95) with backdrop blur

## Accessibility

- All buttons have `aria-label` attributes
- Keyboard navigation supported (tab through controls)
- High contrast text (WCAG AA compliant)
- Touch targets exceed minimum size (44px)
- Screen reader friendly (semantic HTML)

## Browser Compatibility

- **iOS Safari**: Full support (iOS 12+)
- **Chrome Mobile**: Full support
- **Firefox Mobile**: Full support
- **Samsung Internet**: Full support

**Progressive Enhancement:**
- Backdrop blur: Graceful fallback to solid background
- Touch gestures: Click/tap works if touch events unsupported
- Safe areas: Falls back to 0px if not supported

## Troubleshooting

### Layers Not Loading
- Check console for fetch errors
- Verify `path` in registry is correct (relative to base path)
- Ensure data file exists in `/public/data/`
- Check `min_zoom` threshold

### Panel Not Dragging
- Verify touch events supported in browser
- Check console for JavaScript errors
- Ensure `panel-handle-area` element exists

### Legend Empty
- Verify layers are enabled
- Check `legend_profile` matches mode
- Ensure legend items reference valid layer IDs

### Mode Buttons Not Showing
- Max 4 modes displayed (check console for warning)
- Verify `modes` array in registry
- Check for JavaScript errors in `renderModeSelector()`

### Safe Areas Not Working
- iOS 11.2+ required for `env()` support
- Add `viewport-fit=cover` to viewport meta tag
- Check CSS custom properties defined in `:root`

## Deployment Notes

- Build output: `/dist/mobile-dashboard/index.html`
- Works offline after initial load (if service worker enabled)
- No API keys required (uses OpenStreetMap tiles)
- Static hosting compatible (GitHub Pages, Netlify, Vercel)

## Future Enhancements

1. **Search Implementation**
   - Geocoding via Nominatim
   - Feature ID lookup
   - Parcel search by address

2. **Advanced Interactions**
   - Feature selection with context highlight
   - Buffer/proximity analysis
   - Measure distance tool

3. **Data Layers**
   - Real-time data updates
   - Animated layers (flow direction)
   - Heat maps

4. **Offline Support**
   - Service worker caching
   - Offline-first data strategy
   - Background sync for submissions

5. **Analytics**
   - Usage tracking (privacy-respecting)
   - Popular layer combinations
   - Performance metrics

---

**Last Updated**: December 27, 2024  
**Version**: 1.0.0  
**Maintainer**: evcatalyst
