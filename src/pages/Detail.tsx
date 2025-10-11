import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Skeleton from '../components/Skeleton'

interface Item {
  id: number
  name: string
  email: string
  username: string
  phone?: string
  website?: string
}

function Detail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/niskayuniverse/data/items.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load data')
        return res.json()
      })
      .then((data: Item[]) => {
        const found = data.find(i => i.id === parseInt(id!))
        if (!found) throw new Error('Item not found')
        setItem(found)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div>
        <Skeleton height="2rem" width="200px" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div>
        <h1>Item Not Found</h1>
        <p>{error}</p>
        <Link to="/data">← Back to Data List</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/data" style={{ color: '#007bff', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Data List
      </Link>

      <h1>{item.name}</h1>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p><strong>Email:</strong> {item.email}</p>
        <p><strong>Username:</strong> {item.username}</p>
        {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
        {item.website && <p><strong>Website:</strong> <a href={`http://${item.website}`} target="_blank" rel="noopener noreferrer">{item.website}</a></p>}
      </div>

      <h2>Related Items</h2>
      <p>More items from the same data source...</p>
      {/* Could add related items logic here */}
    </div>
  )
}

export default Detail