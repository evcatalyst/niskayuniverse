# Water Atlas Project Roadmap

**Document Version**: 1.0  
**Last Updated**: December 21, 2024  
**Project Vision**: Create a comprehensive, municipality-wide water quality and infrastructure intelligence platform deployable as a static site

---

## Executive Summary

The Water Atlas is currently a functional water service line inventory and submission system. The roadmap below outlines the path to fully realize the vision of an integrated water quality intelligence platform that correlates infrastructure data (service lines, parcels, building age) with real-time resident submissions to identify potential lead exposure risks and water quality issues.

---

## Current State Assessment

### ✅ Successfully Implemented

1. **Core Infrastructure**
   - Static site generation with Astro
   - GitHub Pages deployment pipeline
   - Leaflet-based mapping with interactive markers
   - Service line inventory display (Point GeoJSON)
   - Resident submission form with water quality parameters (pH, TDS, lead, temperature)
   - Address autocomplete via Nominatim
   - Data validation pipeline for service lines and submissions

2. **Data Integration**
   - NYS tax parcel data fetching and enrichment
   - Building year normalization (1700-present validation)
   - Parcel-to-service-line spatial/address joining
   - Choropleth visualization by building age (separate example)
   - Level-of-detail (LOD) switching for performance

3. **Automation & CI/CD**
   - GitHub Actions for deployment
   - Manual/scheduled data sync workflows
   - Unit tests (Vitest) for data processing
   - E2E tests (Playwright) for UI validation
   - Data schema validation

### ❌ Identified Gaps

1. **UI Integration**
   - Parcel data visualization exists only as separate example (`parcels-age.html`)
   - Main UI (`index.astro`) doesn't display parcel polygons or building age
   - No visual correlation between building age and service line materials
   - No integrated layer controls in main UI

2. **Analytics & Intelligence**
   - No statistics dashboard (total lines, lead risk zones, submission coverage)
   - No trend analysis for water quality submissions over time
   - No risk scoring based on building age + service line material
   - No heatmap or clustering for high-risk areas

3. **Data Management**
   - No admin interface for reviewing/approving submissions
   - No data export functionality (CSV, GeoJSON)
   - No bulk upload capability for service line updates
   - Submission data stored separately from service line inventory (no merge workflow)

4. **User Experience**
   - Limited mobile responsiveness testing
   - No print-friendly view for reports
   - No shareable links to specific parcels or submissions
   - No help/tutorial overlay for first-time users

5. **Advanced Features**
   - No temporal analysis of data changes
   - No integration with external water quality APIs
   - No email notifications for new submissions
   - No public API for third-party integrations

---

## Roadmap Phases

### Phase 1: UI Integration & Core Feature Parity (Priority: HIGH)
**Timeline**: 2-3 weeks  
**Goal**: Bring parcel visualization and layer controls into the main UI

#### Tasks

1. **Integrate Parcel Layer into Main UI**
   - [ ] Add parcel polygon layer to `index.astro`
   - [ ] Implement building age choropleth coloring (same as `parcels-age.html`)
   - [ ] Add LOD switching (centroids at low zoom, polygons at high zoom)
   - [ ] Create unified legend showing all data layers
   - [ ] Add layer toggle controls (service lines, parcels, submissions)

2. **Enhanced Interactivity**
   - [ ] Implement parcel click to show building age, owner, address
   - [ ] Add service line material filter (copper, lead, galvanized, unknown)
   - [ ] Highlight parcels with pre-1986 construction (potential lead pipe risk)
   - [ ] Cross-highlight: clicking parcel shows related service line(s) if matched

3. **Mobile Optimization**
   - [ ] Responsive layer controls (collapsible on mobile)
   - [ ] Touch-friendly map interactions
   - [ ] Mobile-optimized submission form

**Deliverables**:
- Single unified map interface with all data layers
- Interactive filtering and highlighting
- Mobile-responsive design

---

### Phase 2: Analytics Dashboard (Priority: HIGH)
**Timeline**: 2-3 weeks  
**Goal**: Provide actionable intelligence from collected data

#### Tasks

1. **Statistics Panel**
   - [ ] Create `/analytics.astro` page
   - [ ] Display key metrics:
     - Total service lines by material type
     - % of lines with unknown material
     - Total resident submissions
     - Average pH, TDS, lead levels by neighborhood
   - [ ] Visualize building age distribution (histogram)
   - [ ] Show submission coverage map (parcels with/without submissions)

2. **Risk Analysis**
   - [ ] Implement risk scoring algorithm:
     - High risk: pre-1986 building + unknown/lead service line + high lead PPB in submissions
     - Medium risk: pre-1986 building + unknown service line
     - Low risk: post-1986 or verified non-lead service line
   - [ ] Color-code parcels by risk score
   - [ ] Generate ranked list of high-risk addresses
   - [ ] Export risk report as CSV/PDF

3. **Trend Visualization**
   - [ ] Time-series chart for submission data (pH, TDS, lead over time)
   - [ ] Seasonal analysis of water quality parameters
   - [ ] Identify outliers and anomalies

**Deliverables**:
- Analytics dashboard with charts and statistics
- Risk assessment map layer
- Exportable risk reports

---

### Phase 3: Data Management & Workflow (Priority: MEDIUM)
**Timeline**: 3-4 weeks  
**Goal**: Enable staff to manage submissions and maintain data quality

#### Tasks

1. **Submission Review Interface**
   - [ ] Create `/admin.astro` (password-protected via GitHub OAuth or simple token)
   - [ ] List all pending submissions with status (pending, approved, rejected)
   - [ ] Bulk approve/reject workflow
   - [ ] Merge approved submissions into service line inventory
   - [ ] Flag submissions for follow-up (e.g., high lead levels)

2. **Data Export**
   - [ ] Export service lines as GeoJSON, CSV, Shapefile
   - [ ] Export submissions as CSV with filters (date range, parameters)
   - [ ] Export parcel data subset (e.g., high-risk parcels)
   - [ ] Generate PDF reports for specific addresses or zones

3. **Bulk Data Updates**
   - [ ] CSV upload interface for service line updates
   - [ ] Validate uploaded data against schema
   - [ ] Preview changes before committing
   - [ ] Auto-geocode addresses if missing coordinates

**Deliverables**:
- Admin interface for submission management
- Data export tools
- Bulk upload capability

---

### Phase 4: Advanced Features & Public Engagement (Priority: LOW)
**Timeline**: 4-6 weeks  
**Goal**: Enhance community engagement and data accessibility

#### Tasks

1. **Public API**
   - [ ] Expose read-only JSON API endpoints:
     - `/api/service-lines.json` (with filters)
     - `/api/submissions.json` (anonymized)
     - `/api/parcels/{parcel_id}.json`
   - [ ] Document API with OpenAPI spec
   - [ ] Rate limiting and caching

2. **Enhanced Visualizations**
   - [ ] 3D building height rendering (if parcel data includes stories/height)
   - [ ] Animated time-lapse of submission data collection
   - [ ] Heatmap of water quality parameters
   - [ ] Clustering for dense marker areas

3. **Community Features**
   - [ ] Shareable links to specific parcels or submissions
   - [ ] Embed widgets for other municipal websites
   - [ ] Email digest for new high-risk submissions (to staff)
   - [ ] Public comment threads on submissions (moderated)

4. **Accessibility & Internationalization**
   - [ ] Full keyboard navigation support
   - [ ] Screen reader optimization
   - [ ] High-contrast mode
   - [ ] Spanish/other language translations for UI

**Deliverables**:
- Public API with documentation
- Advanced visualization options
- Community engagement features
- Accessibility compliance (WCAG 2.1 AA)

---

## Technical Debt & Infrastructure

### Ongoing Maintenance

1. **Performance**
   - [ ] Optimize parcel GeoJSON size (simplify geometries, use PMTiles for large datasets)
   - [ ] Implement service worker for offline caching
   - [ ] Lazy-load data layers based on viewport

2. **Testing**
   - [ ] Increase E2E test coverage (submission flow, parcel interaction)
   - [ ] Add visual regression tests for map rendering
   - [ ] Accessibility testing with axe-core

3. **Documentation**
   - [ ] Expand `TESTING.md` with E2E test scenarios
   - [ ] Create deployment guide for other municipalities
   - [ ] Document data update workflows

4. **Security**
   - [ ] Sanitize all user inputs (already using `escapeHtml` in parcel popups)
   - [ ] Implement rate limiting for submission endpoint
   - [ ] Add CAPTCHA to submission form (optional, if spam becomes issue)

---

## Success Metrics

### Phase 1
- [ ] Main UI loads all data layers without performance degradation
- [ ] Layer toggles work correctly on desktop and mobile
- [ ] User can filter service lines by material type

### Phase 2
- [ ] Analytics dashboard loads in <3 seconds
- [ ] Risk scoring accurately identifies high-risk parcels
- [ ] Reports can be exported in multiple formats

### Phase 3
- [ ] Admin can review and approve submissions in <5 clicks
- [ ] Data export completes in <10 seconds for full dataset
- [ ] Bulk upload validates and geocodes 100+ addresses without errors

### Phase 4
- [ ] API handles 1000+ requests/day without rate limit issues
- [ ] Public engagement features drive 20% increase in submissions
- [ ] Site passes WCAG 2.1 AA accessibility audit

---

## Dependencies & Blockers

### External Dependencies
- **NYS Parcel Data**: Updated annually (Jan-Feb). Sync workflow must accommodate delays.
- **Nominatim**: Free geocoding has rate limits (1 req/sec). Consider self-hosted Nominatim or Mapbox for production.
- **GitHub Pages**: Static hosting limits (1GB repo, no backend). May need serverless functions (Netlify/Vercel) for admin features.

### Resource Requirements
- **Development**: 1 frontend engineer for Phase 1-2, +1 for Phase 3-4
- **Design**: UX review for analytics dashboard and admin interface
- **QA**: Testing on real devices (iOS, Android, various browsers)

### Risks
- **Data Quality**: Incomplete or inaccurate service line material data from municipality
- **User Adoption**: Low submission rates if outreach/education is insufficient
- **Scope Creep**: Avoid over-engineering analytics (start simple, iterate based on feedback)

---

## Next Steps (Immediate Actions)

1. **This Week**:
   - Review roadmap with stakeholders
   - Prioritize Phase 1 tasks
   - Set up project board (GitHub Projects) to track progress

2. **Next Sprint (2 weeks)**:
   - Implement parcel layer integration in main UI
   - Create unified layer controls
   - Test on mobile devices

3. **One Month**:
   - Complete Phase 1 deliverables
   - Begin Phase 2 analytics dashboard design
   - Gather feedback from beta users (municipal staff, residents)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-21 | Initial roadmap based on codebase assessment |

---

## Appendix: Feature Requests (Parking Lot)

Features to consider for future phases:
- Integration with municipal GIS systems (ArcGIS REST API)
- Real-time sensor data feeds (if municipality installs IoT water quality monitors)
- Predictive modeling for pipe failure risk
- Integration with 311 service request systems
- Historical water main break overlay
- Soil lead contamination data layer (if available)
