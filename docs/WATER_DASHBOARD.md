# Water Distribution Dashboard - User Guide

**Document Version**: 1.0  
**Last Updated**: December 26, 2024  
**Target Audience**: Municipal Staff, Board Members, Residents

---

## Overview

The Water Distribution Dashboard is a user-friendly, open-data-driven visualization platform designed to provide transparent access to water infrastructure and quality information. Built following principles of simplicity and minimalism, the dashboard makes complex data accessible to everyone—from technical staff to everyday residents.

**Access the dashboard**: `/dashboard` (e.g., `https://evcatalyst.github.io/niskayuniverse/dashboard`)

---

## Design Philosophy

> "True simplicity is derived from so much more than just the absence of clutter… It's about bringing order to complexity." — Jony Ive

The dashboard follows these core design principles:

### 1. Simplicity and Clarity
- **Clean visual hierarchy**: Information is organized intuitively, with the map as the primary focus
- **Minimal interface elements**: Only essential controls are visible; additional details appear on interaction
- **Clear labeling**: Plain language replaces technical jargon wherever possible

### 2. Zero Friction
- **No API keys required**: Uses OpenStreetMap tiles and open data sources
- **No sign-up or authentication**: Immediate access for all users
- **No installation**: Works in any modern web browser

### 3. Performance-First
- **Level of Detail (LOD) switching**: Automatically adjusts visualization complexity based on zoom level
- **Optimized data loading**: Fetches only necessary data for current view
- **Mobile-friendly**: Responsive design that works on phones, tablets, and desktops

### 4. Transparency and Trust
- **Full data attribution**: All sources clearly credited in the About panel
- **Provenance tracking**: Data includes metadata about source and update time
- **Open source**: Built with open-source technologies and freely adaptable

---

## Features

### Interactive Map

The centerpiece of the dashboard is a full-screen interactive map displaying:

#### 1. **Parcel Boundaries** (Building Age Choropleth)
Visualizes tax parcels color-coded by construction year:
- **Pre-1920** (Dark Brown): Historic buildings
- **1920–1950** (Orange): Early 20th century
- **1951–1986** (Amber): **Lead pipe era** - Buildings constructed before lead ban
- **Post-1986** (Green): Modern construction with lead-free plumbing
- **Unknown** (Gray): Missing or invalid year data

**Zoom Behavior**:
- **Low zoom (< 15)**: Shows parcel centroids (circles) for fast rendering
- **High zoom (≥ 15)**: Shows full parcel polygons with boundaries

**Interaction**:
- Click any parcel to view details: address, year built, owner, parcel ID
- Hover over polygons to highlight boundaries

#### 2. **Service Lines**
Point markers indicating water service connections:
- **Blue circles**: General service lines
- **Green circles**: Verified service lines

**Information displayed**:
- Property address
- Private side pipe material (e.g., copper, lead, PVC)
- Public side pipe material
- Verification status
- Last update date

#### 3. **Resident Submissions**
Orange markers showing community-sourced water quality data:
- pH levels (0-14 scale)
- Total Dissolved Solids (TDS, in ppm)
- Lead concentration (ppb)
- Temperature (°F)
- Submission timestamp

---

### Layer Controls

Located in the top-right floating panel:

**Toggle layers on/off**:
- ☑ Parcel Boundaries
- ☑ Service Lines
- ☑ Resident Submissions

All layers are visible by default. Uncheck to hide specific data types.

---

### Information Panel

Located at the bottom of the screen (minimized by default):

**Accessing**: Click the handle bar at the bottom center to expand

**Content**:
- **Water System Name**: Town of Niskayuna
- **Population Served**: ~21,000 residents
- **Water Source**: Groundwater wells
- **Supplier**: Self-supplied (not purchased from another system)

---

### Legend

Bottom-left panel explaining color coding for:

**Building Age Categories**:
- Each color represents a specific construction era
- The 1951-1986 period is marked as "Lead Era" due to higher risk of lead pipes

**Data Points**:
- Service Lines (blue)
- Submissions (orange)

---

### About / Data Sources

Click the "About / Data Sources" button (top-right) to view:

#### Design Philosophy
Explanation of the minimalist, user-centered approach

#### Data Sources
Full attribution for all datasets:
- **Public Water Supply Service Areas**: NYS Department of Environmental Conservation
- **Tax Parcel Data**: NYS GIS Clearinghouse (updated annually)
- **Service Line Inventory**: Town of Niskayuna Water Department
- **Resident Submissions**: Community-sourced water quality data
- **Base Map**: OpenStreetMap contributors

Each source includes a link to the authoritative data portal.

#### Technology Stack
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Hosting**: GitHub Pages (free, static hosting)
- **Automation**: GitHub Actions for data updates
- **Framework**: Astro (static site generation)

#### White-Labeling
Instructions for adapting the dashboard to other municipalities

---

## Common Use Cases

### For Residents

**1. "Is my home in the lead pipe era?"**
- Navigate to your address on the map
- Zoom in until parcel polygons appear
- Click your property to view "Year Built"
- If built 1951-1986, your property may have lead service lines

**2. "What material is my water service line?"**
- Look for blue/green circles near your address
- Click the marker to view pipe materials
- If listed as "Unknown," consider submitting a test or inspection result

**3. "Are there recent water quality submissions in my area?"**
- Enable the "Resident Submissions" layer
- Look for orange markers nearby
- Click to view pH, TDS, and lead levels

### For Municipal Staff

**1. "Where are our highest-risk properties?"**
- Focus on amber-colored parcels (1951-1986 lead era)
- Cross-reference with service line markers showing "lead" material
- Export this data for targeted outreach campaigns

**2. "What's our service line material inventory status?"**
- Count verified (green) vs. unverified (blue) service line markers
- Identify gaps where properties lack service line data
- Use for compliance reporting

**3. "How can I share this with the public?"**
- Share the dashboard URL directly
- Screenshot specific areas for reports or presentations
- Embed in municipal website (static page)

### For Board Members

**1. "What's the scope of our lead pipe issue?"**
- Visual overview: How many amber parcels exist?
- Check service line markers for confirmed lead
- Review resident submissions for elevated lead levels

**2. "How much of our inventory is verified?"**
- Compare number of green (verified) vs. blue markers
- Assess progress toward service line material survey goals

---

## Data Update Workflow

### Automated Updates
The dashboard uses GitHub Actions to automatically refresh data:

**Frequency**:
- **Service Lines**: On-demand (when municipality uploads new CSV)
- **Parcel Data**: Annually (NYS updates tax rolls Jan-Feb)
- **Resident Submissions**: Near real-time (if connected to form endpoint)

**Process**:
1. GitHub Action triggers (manual or scheduled)
2. Fetches data from configured sources
3. Validates schemas (ensures data integrity)
4. Commits to repository
5. Triggers deployment to GitHub Pages
6. Dashboard reflects new data within minutes

### Manual Updates
Municipal staff can update data by:
1. Placing new CSV/GeoJSON files in `public/data/` directory
2. Running validation: `npm run validate:data`
3. Committing changes to GitHub repository
4. Automatic deployment occurs

---

## Technical Details

### Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile browsers**: iOS Safari, Android Chrome
- **Legacy support**: Internet Explorer not supported

### Performance
- **Initial load**: ~2-3 seconds (network dependent)
- **Map render**: Instant for parcel centroids, ~1s for full polygons
- **Data size**: Service lines (~100 KB), Parcels (~2-5 MB), Submissions (~50 KB)

### Accessibility
- **Keyboard navigation**: Full support for tab/enter controls
- **Screen readers**: ARIA labels on interactive elements
- **High contrast**: Readable color choices (WCAG 2.1 compliant)

### Security
- **XSS protection**: All user-generated content is HTML-escaped
- **No backend**: Static site architecture minimizes attack surface
- **HTTPS**: Enforced by GitHub Pages

---

## White-Labeling for Other Municipalities

The dashboard is designed as a template that can be easily adapted:

### Steps to Customize

1. **Update Configuration** (`src/lib/siteConfig.js`):
   ```javascript
   export const siteConfig = {
     municipalityName: 'Your Town Name',
     basePath: '/your-repo-name',
     map: {
       center: [your_latitude, your_longitude],  // e.g., [42.3601, -71.0589] for Boston
       zoom: 13
     },
     // ... other settings
   };
   ```

2. **Replace Data Files**:
   - `public/data/service_lines.geojson`: Your service line inventory
   - `public/data/submissions.json`: Your resident submissions (or start empty)
   - `public/data/parcels_nys.geojson`: Fetch for your SWIS code (if NY) or provide local parcels

3. **Customize Branding** (optional):
   - Update header text in `src/pages/dashboard.astro`
   - Adjust color scheme in CSS variables
   - Add municipal logo

4. **Deploy**:
   - Push to your GitHub repository
   - Enable GitHub Pages in Settings → Pages
   - Set source to "GitHub Actions"
   - Access at `https://yourusername.github.io/your-repo-name/dashboard`

### Data Requirements

**Minimum**:
- Service line inventory (Point GeoJSON with address, coordinates, optional material)

**Recommended**:
- Tax parcel polygons with Year Built (for building age visualization)
- Resident submission system (form endpoint configured)

**Optional**:
- Additional GIS layers (water mains, hydrants, treatment plants)

---

## Troubleshooting

### "Map not loading"
- Check browser console for errors
- Verify internet connection (requires access to OpenStreetMap tiles)
- Clear browser cache and reload

### "No data layers visible"
- Ensure layer toggles are checked (top-right panel)
- Zoom in to appropriate level (parcels need zoom ≥ 13)
- Check that data files exist in `public/data/` directory

### "Parcel colors all gray (unknown)"
- `year_built` field may be missing or invalid in parcel data
- Re-run parcel fetch script: `npm run fetch:parcels`
- Validate data: `npm run validate:data`

### "Service lines not appearing"
- Verify `service_lines.geojson` is valid GeoJSON
- Check coordinates are in correct format [longitude, latitude]
- Ensure file is accessible at configured path

---

## Future Enhancements

Planned features based on user feedback:

- **Search functionality**: Address search with autocomplete
- **Filtering**: Filter service lines by material type
- **Export tools**: Download visible data as CSV
- **Print mode**: Simplified view for printing reports
- **Historical comparison**: View changes over time
- **Risk scoring**: Automated lead exposure risk assessment

---

## Support and Feedback

### Reporting Issues
- **Technical issues**: Open a GitHub issue in the repository
- **Data errors**: Contact municipal water department
- **Feature requests**: Submit via GitHub Discussions

### Contributing
This is an open-source project. Contributions welcome:
- Code improvements (pull requests)
- Documentation updates
- Translation to other languages
- Bug reports and testing

---

## Acknowledgments

**Data Providers**:
- New York State Department of Environmental Conservation
- NYS GIS Clearinghouse
- Town of Niskayuna Water Department
- OpenStreetMap contributors

**Technology**:
- Leaflet mapping library
- Astro static site generator
- GitHub Pages hosting

**Design Inspiration**:
Guided by principles of simplicity and clarity from design leaders who prioritize user experience over complexity.

---

**Document End**

For technical documentation, see [ARCHITECTURE.md](../ARCHITECTURE.md)  
For development roadmap, see [ROADMAP.md](../ROADMAP.md)
