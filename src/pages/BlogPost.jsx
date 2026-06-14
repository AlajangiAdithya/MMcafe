import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { getBlogPostBySlug } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import Loader from '@/components/ui/loader-4'
import Reveal from '../components/Reveal'

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
    type: post ? 'article' : 'website',
    noindex: true, // hidden/prep: blog posts out of the index until blog launch
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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader />
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
      <motion.article
        className="blog-post"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
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
            <motion.div
              className="blog-post-cover"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={post.cover_image} alt={post.title} />
            </motion.div>
          )}
          <motion.div
            className="blog-post-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {(post.content || '').split(/\n{2,}/).map((para, i) => (
              <Reveal key={i} as="p" delay={Math.min(i * 60, 360)}>{para}</Reveal>
            ))}
          </motion.div>
        </div>
      </motion.article>
    </div>
  )
}
