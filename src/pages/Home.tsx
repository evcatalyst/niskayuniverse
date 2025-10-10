import { Link } from 'react-router-dom'
import Card from '../components/Card'

function Home() {
  return (
    <div>
      <section style={{
        textAlign: 'center',
        padding: '2rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        margin: '-1rem -1rem 2rem -1rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Service Line Markers</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Interactive design system for visualizing service-line materials with configurable markers,
          level-of-detail switching, and accessibility-first implementation.
        </p>
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Card>
          <h3>Data List</h3>
          <p>Explore sample service-line data with search, filter, and sort capabilities.</p>
          <Link to="/data" style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            View Data
          </Link>
        </Card>

        <Card>
          <h3>About</h3>
          <p>Learn about the Pages + Actions architecture and how this demo works.</p>
          <Link to="/about" style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            Learn More
          </Link>
        </Card>

        <Card>
          <h3>Control Panel</h3>
          <p>Configure marker styles, palettes, and LOD settings interactively.</p>
          <a
            href="/control-panel.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#6f42c1',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}
          >
            Open Panel
          </a>
        </Card>

        <Card>
          <h3>Map Examples</h3>
          <p>View interactive map examples with service-line markers.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href="./examples/mapbox-gl.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#7952b3',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Mapbox GL
            </a>
            <a
              href="./examples/leaflet.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#28a745',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Leaflet
            </a>
            <a
              href="./examples/deckgl.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Deck.gl
            </a>
          </div>
        </Card>
      </div>

      <section style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h2>Features</h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <li>✓ 7 marker variants (split, nested, donut, hex, halo, band, pin)</li>
          <li>✓ 3 colorblind-safe palettes</li>
          <li>✓ Level-of-detail switching</li>
          <li>✓ Accessibility (WCAG AA)</li>
          <li>✓ Map integrations (Mapbox, Leaflet, deck.gl)</li>
          <li>✓ GitHub Pages + Actions backend</li>
        </ul>
      </section>
    </div>
  )
}

export default Home