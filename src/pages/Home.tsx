import { Link } from 'react-router-dom'
import Card from '../components/Card'

function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        margin: '-1rem -1rem 3rem -1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            marginBottom: '1rem',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Service Line Markers
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            maxWidth: '700px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            Interactive design system for visualizing service-line materials with configurable markers,
            level-of-detail switching, and accessibility-first implementation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/data" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}>
              Explore Data →
            </Link>
            <a
              href="./control-panel.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'white',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease'
              }}
            >
              Control Panel
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
        padding: '0 1rem'
      }}>
        <Card>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            📊
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Data Explorer</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.5' }}>
            Explore sample service-line data with advanced search, filter, and sort capabilities.
            View detailed information about each service line record.
          </p>
          <Link to="/data" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
          }}>
            View Data →
          </Link>
        </Card>

        <Card>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #28a745, #1e7e34)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            🗺️
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Map Examples</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.5' }}>
            Interactive map implementations showcasing service-line markers with different
            mapping libraries and visualization techniques.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href="./examples/leaflet.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #28a745, #1e7e34)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'transform 0.2s ease'
              }}
            >
              Leaflet
            </a>
            <a
              href="./examples/mapbox-gl.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #7952b3, #6f42c1)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'transform 0.2s ease'
              }}
            >
              Mapbox GL
            </a>
            <a
              href="./examples/deckgl.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'transform 0.2s ease'
              }}
            >
              Deck.gl
            </a>
          </div>
        </Card>

        <Card>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            ⚙️
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Control Panel</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.5' }}>
            Configure marker styles, color palettes, and level-of-detail settings.
            Customize every aspect of the service-line visualization system.
          </p>
          <a
            href="./control-panel.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 12px rgba(111,66,193,0.3)'
            }}
          >
            Open Panel →
          </a>
        </Card>

        <Card>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #17a2b8, #138496)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            📚
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Documentation</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.5' }}>
            Learn about the GitHub Pages + Actions architecture, implementation details,
            and how to integrate this system into your own projects.
          </p>
          <Link to="/about" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #17a2b8, #138496)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 12px rgba(23,162,184,0.3)'
          }}>
            Learn More →
          </Link>
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