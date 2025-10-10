import { Link } from 'react-router-dom'

function Header() {
  return (
    <header style={{
      background: '#2c3e50',
      color: 'white',
      padding: '1rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Service Line Markers
        </Link>
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          gap: '1rem'
        }}>
          <li><Link to="/" style={{ color: 'white' }}>Home</Link></li>
          <li><Link to="/data" style={{ color: 'white' }}>Data List</Link></li>
          <li><Link to="/about" style={{ color: 'white' }}>About</Link></li>
          <li>
            <a
              href="/control-panel.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white' }}
            >
              Control Panel
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header