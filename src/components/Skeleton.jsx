// Lightweight skeletons: no library, just CSS shimmer.

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton skeleton-line" style={{ width: '55%' }} />
      </div>
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image-tall" />
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-line" style={{ width: '85%' }} />
        <div className="skeleton skeleton-line" style={{ width: '95%' }} />
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line skeleton-button" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )
}

export function CourseGridSkeleton({ count = 6 }) {
  return (
    <div className="courses-grid">
      {Array.from({ length: count }).map((_, i) => <CourseCardSkeleton key={i} />)}
    </div>
  )
}

export function LineSkeleton({ width = '100%' }) {
  return <div className="skeleton skeleton-line" style={{ width }} />
}
