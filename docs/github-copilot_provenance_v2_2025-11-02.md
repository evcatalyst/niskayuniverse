# Niskayuna Water Quality Atlas — Implementation Approach and Technical Roadmap (v2)

Provenance
- Author: GitHub Copilot (automated coding assistant)
- Date: 2025-11-02
- Repository: evcatalyst/niskayuniverse
- Branch: v2
- Commit: 4e12e267e104c72fec7efa386a2f55a6b8b547dd
- Hosting target: GitHub Pages (/niskayuniverse/)
- Source context: User request to restart as lightweight, Google Sheets–backed, crowdsourced platform

## 1) Goals and Objectives
- Public, fast, lightweight map of community water quality tests for Niskayuna, NY
- Authenticated submissions via Google login with clear attribution
- Photo evidence support and structured measurements (pH, TDS, temp, optional lead)
- Zero-cost operations: GitHub Pages + free-tier services
- Data remains accessible, auditable, and exportable (CSV/JSON)
- Progressive enhancement: works on low-end devices, degrades gracefully
- Privacy-first: explicit consent for storing email attribution

## 2) Success Criteria (Measurable)
- P50 map load < 2.0s on broadband; < 4.0s on 3G–slow
- Initial payload < 250KB (excluding tiles); lazy-load data in chunks
- New submission end-to-end < 5s (photo + metadata)
- 99th percentile read error rate < 1% under 200 concurrent viewers
- A11y: WCAG 2.1 AA (keyboard, landmarks, color contrast, focus states)
- Data integrity: no duplicated rows for concurrent writes (validated server-side)
- Uptime: Pages availability > 99.9%

## 3) Architecture Summary (MVP)
- Frontend: Astro (static-first, partial hydration), Leaflet for mapping
- Auth: Google Identity Services (OAuth ID token)
- Data store: Google Sheets (WaterQualityTests, ServiceLines, CommunityReports)
- Photos: Cloudinary (free-tier, transformation + CDN)
- Write gateway: Google Apps Script Web App (execute as me, access: anyone)
- Caching: Service Worker + IndexedDB for datasets and images
- Automation: GitHub Actions (data validation, prebuild JSON chunks, sitemap)

### Data Flow (Writes)
User (OAuth) → Frontend → Cloudinary (photo) → Apps Script (server validation + rate limit) → Google Sheets (append row)

### Data Flow (Reads)
Frontend → Cache (IndexedDB) → Fallback to prebuilt JSON from /public/data → Optional on-demand refresh from Apps Script read endpoint (rate-limited)

## 4) Key Decisions and Rationale
- Astro over SvelteKit: static optimization + smaller client JS via islands (keeps Pages blazing fast)
- Leaflet over MapLibre: lighter, simpler for raster tiles; switchable later if vector styling is needed
- Sheets for MVP: low friction and collaboration; plan Supabase migration at ~5k+ rows
- Apps Script Web App: free, provides server-side validation, rate limiting, and atomic writes
- Cloudinary for images: direct browser upload, auto-optimization, global CDN
- Smart polling (30s→60s→120s): avoids rate-limit spikes while keeping data fresh

## 5) Phased Roadmap

Phase 0 — Repo hygiene (Day 0)
- Create docs, skeleton directories, .editorconfig/.prettierrc linting and formatting
- Configure GitHub Pages base path (/niskayuniverse/) and 404 fallback if SPA routes are used

Phase 1 — MVP (Week 1–2)
- Astro site with Leaflet map (OSM raster), basic controls, accessibility scaffolding
- Public read: load prebuilt JSON chunk(s) from /public/data/tests.json
- Google OAuth sign-in UI (no writes yet)
- SW + IndexedDB for caching datasets

Phase 2 — Authenticated submissions (Week 3)
- Cloudinary direct upload widget + URL capture
- Apps Script Web App write endpoint with: ID token verification, rate limit (e.g., 5 writes/min/user), server validation, append to WaterQualityTests
- Client-side form: geolocation, address search, numeric coercion/validation

Phase 3 — Data refresh and moderation (Week 4)
- Smart polling with ETags/If-Modified-Since, backoff on throttling
- Admin-only verification flag (Verified = TRUE) via protected Apps Script endpoint
- Export endpoints: CSV/JSON download for transparency

Phase 4 — Community features (Week 5–6)
- Embed GitHub Discussions for comments/Q&A
- Leaderboard (top contributors) + opt-in public profile
- Basic anomaly detection rule set (e.g., pH outliers flag)

Phase 5 — Scale and migration readiness (Week 7+)
- Threshold checks: if rows > 5k or P95 read latency > 2s, prepare Supabase migration (schema parity, RLS policies, swap endpoints)
- Optional: Vector tiles + MapLibre if styling/performance needs grow

## 6) Data Model (Sheets)
- WaterQualityTests(timestamp, userEmail, userName, latitude, longitude, address, pH, tds, temperature, lead, photoURLs, notes, verified)
- ServiceLines(address, parcelID, privateSide, publicSide, verified, verifiedBy, lastUpdated, confidence)
- CommunityReports(timestamp, userEmail, issueType, description, location, photos, status)

Validation rules (server-side via Apps Script)
- Coordinates: finite lat/lng; within Niskayuna bounding box
- pH: 0–14; TDS/lead: non-negative; temperature: reasonable range
- Notes: sanitize, 500 chars max; photoURLs: HTTPS only
- Rate limit: per user, windowed; IP heuristic optional

## 7) Risks and Mitigations
- Rate limits (Sheets): prebuilt JSON, cache-first, batched reads, smart polling
- Data corruption: server-only writes, atomic append rows, duplicate detection (hash of user+timestamp+coords)
- Security: verify ID token via Google tokeninfo endpoint; deny unverified emails; strict schema validation
- Privacy: consent banner; store minimal PII; allow per-user data export/deletion request
- Performance: bundle budget < 150KB JS on landing; defer map until visible; use CSS-only UI where possible
- Vendor lock-in: provide weekly exports via GitHub Actions; document schema; plan migration

## 8) Testing and Quality Gates
- Unit: form validation, mappers, URL builders
- Integration: Apps Script endpoints (staging sheet), Cloudinary upload mocks
- E2E: submission → map refresh (Playwright)
- A11y: pa11y-ci, keyboard traps, landmarks
- CI: lint, build, link-check, data schema lint (Zod), JSON size checks

## 9) Observability and Ops
- Basic telemetry: page views, submission counts, client error rates (Plausible/GA4)
- Health: Apps Script error logs; rate-limit metrics via Script Properties counters
- Backups: weekly Sheets → CSV export to repo; photo URL inventory snapshot

## 10) Open Questions (for stakeholder/models)
- Minimum viable fields for tests? Required vs optional
- Public visibility of email vs display name? Anonymization policy
- Verification workflow: who verifies? thresholds? audit trail?
- Map defaults: color scale, clustering thresholds, date filters
- Migration trigger definition: exact thresholds and rollout plan

## 11) Deliverables Checklist
- [ ] Astro scaffold with Leaflet map and Pages base configured
- [ ] SW + IndexedDB cache for /data/*.json
- [ ] Google OAuth sign-in and profile display
- [ ] Apps Script Web App (verify token, validate, rate-limit, append)
- [ ] Submission form with Cloudinary upload
- [ ] Data export (CSV/JSON), docs, and governance policies
- [ ] Automated weekly backup workflow

---
This document is intended as the living source of truth for v2 implementation and may be iterated alongside stakeholder and model feedback.
