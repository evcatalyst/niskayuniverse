interface SkeletonProps {
  width?: string
  height?: string
}

function Skeleton({ width = '100%', height = '1rem' }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: '4px'
    }} />
  )
}

export default Skeleton