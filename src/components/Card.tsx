interface CardProps {
  children: React.ReactNode
}

function Card({ children }: CardProps) {
  return (
    <div style={{
      border: '1px solid #e1e5e9',
      borderRadius: '12px',
      padding: '2rem',
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      {children}
    </div>
  )
}

export default Card