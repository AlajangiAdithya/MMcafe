import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { getPublishedBlogPosts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Blog() {
  usePageMeta({
    title: 'Blog',
    description: 'Stories, brewing guides, and notes on coffee from the Mastermind Brews team.',
  })

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getPublishedBlogPosts()
      .then(rows => { if (!cancelled) setPosts(rows) })
      .catch(err => console.error('Failed to load posts:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page-shell blog-page">
      <section className="page-hero">
        <div className="container">
          <div className="section-label">Blog</div>
          <h1 className="page-title">Notes from the Cafe</h1>
          <p className="page-lede">Brew guides, behind-the-counter stories, and the occasional opinion about coffee.</p>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="container">
          {loading ? (
            <div className="blog-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="blog-card blog-card-skeleton">
                  <div className="blog-card-cover skeleton-block" />
                  <div className="blog-card-body">
                    <div className="skeleton-line skeleton-line-sm" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={32} />
              <h3>No posts yet</h3>
              <p>Check back soon - we are brewing the first one.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="blog-card">
                  <div className="blog-card-cover">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} loading="lazy" />
                    ) : (
                      <div className="blog-card-placeholder"><BookOpen size={28} /></div>
                    )}
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <Calendar size={12} /> {formatDate(p.created_at)}
                      {p.author_name && <span> · {p.author_name}</span>}
                    </div>
                    <h3 className="blog-card-title">{p.title}</h3>
                    {p.excerpt && <p className="blog-card-excerpt">{p.excerpt}</p>}
                    <span className="blog-card-link">Read post <ArrowRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
