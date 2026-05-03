import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react'
import { getBlogPostBySlug } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  usePageMeta({
    title: post?.title || 'Blog',
    description: post?.excerpt,
    image: post?.cover_image,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getBlogPostBySlug(slug)
      .then(row => {
        if (cancelled) return
        if (!row) setNotFound(true)
        else setPost(row)
      })
      .catch(err => {
        console.error('Failed to load post:', err)
        if (!cancelled) setNotFound(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="page-shell blog-post-page">
        <div className="container" style={{ padding: '60px 0' }}>
          <div className="skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton-line" style={{ width: '70%', height: 32, marginTop: 16 }} />
          <div className="skeleton-block" style={{ height: 320, marginTop: 24 }} />
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="page-shell blog-post-page">
        <div className="container" style={{ padding: '80px 0' }}>
          <div className="empty-state">
            <BookOpen size={32} />
            <h3>Post not found</h3>
            <p>It may have been removed or the link is wrong.</p>
            <Link to="/blog" className="btn btn-outline" style={{ marginTop: 12 }}>
              <ArrowLeft size={14} /> Back to blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell blog-post-page">
      <article className="blog-post">
        <div className="container narrow">
          <Link to="/blog" className="blog-back">
            <ArrowLeft size={14} /> Back to blog
          </Link>
          <div className="blog-post-meta">
            <Calendar size={12} /> {formatDate(post.created_at)}
            {post.author_name && <span> · {post.author_name}</span>}
          </div>
          <h1 className="blog-post-title">{post.title}</h1>
          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
          {post.cover_image && (
            <div className="blog-post-cover">
              <img src={post.cover_image} alt={post.title} />
            </div>
          )}
          <div className="blog-post-body">
            {(post.content || '').split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
