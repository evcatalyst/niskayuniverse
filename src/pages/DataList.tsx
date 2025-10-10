import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/Skeleton'

interface Item {
  id: number
  name: string
  email: string
  username: string
}

function DataList() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'email'>('name')

  useEffect(() => {
    fetch('./data/items.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load data')
        return res.json()
      })
      .then((data: Item[]) => {
        setItems(data)
        setFilteredItems(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    )

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        return a.email.localeCompare(b.email)
      }
    })

    setFilteredItems(filtered)
  }, [items, search, sortBy])

  if (loading) {
    return (
      <div>
        <h1>Data List</h1>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="60px" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>Data List</h1>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          <h3>Error loading data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Data List</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            flex: 1
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'email')}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: '#fff3cd',
          color: '#856404',
          borderRadius: '4px'
        }}>
          <h3>No items found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{
              padding: '1rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{item.email}</p>
              <Link to={`/detail/${item.id}`} style={{
                color: '#007bff',
                textDecoration: 'none'
              }}>
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataList