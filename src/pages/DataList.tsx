import { useState, useEffect } from 'react'
import Skeleton from '../components/Skeleton'

interface Item {
  id: number
  name: string
  email: string
  username: string
  address: string
  town: string
  zip: string
  road_side: string
  private_side: string
  verified: boolean
  confidence: string
  last_verified: string
}

function DataList() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'address'>('name')

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/evcatalyst/niskayuniverse/main/data/items.json')
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
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase()) ||
      item.road_side.toLowerCase().includes(search.toLowerCase()) ||
      item.private_side.toLowerCase().includes(search.toLowerCase()) ||
      item.zip.includes(search)
    )

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        return a.address.localeCompare(b.address)
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
          placeholder="Search by address, material, or zip code..."
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
          onChange={e => setSortBy(e.target.value as 'name' | 'address')}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="name">Sort by Street Name</option>
          <option value="address">Sort by Address</option>
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
              borderRadius: '8px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{item.address}</h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  background: item.verified ? '#d4edda' : '#f8d7da',
                  color: item.verified ? '#155724' : '#721c24'
                }}>
                  {item.verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <div>
                  <strong>Road Side:</strong> {item.road_side}
                </div>
                <div>
                  <strong>Private Side:</strong> {item.private_side}
                </div>
                <div>
                  <strong>Location:</strong> {item.town}, {item.zip}
                </div>
                <div>
                  <strong>Confidence:</strong> {(parseFloat(item.confidence) * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                Last verified: {new Date(item.last_verified).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataList