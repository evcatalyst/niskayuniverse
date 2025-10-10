interface CardProps {
  children: React.ReactNode
}

function Card({ children }: CardProps) {
  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      background: 'white',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition-normal)'
    }}>
      {children}
    </div>
  )
}

export default Card