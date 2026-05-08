import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { getPublishedBlogPosts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import Loader from '@/components/ui/loader-4'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
          >
            <motion.div className="section-label" variants={fadeUp}>Blog</motion.div>
            <motion.div variants={fadeUp}>
              <AnimatedText
                text="Notes from the Cafe"
                textClassName="text-foreground"
                underlineClassName="text-primary"
              />
            </motion.div>
            <motion.p className="page-lede" variants={fadeUp}>Brew guides, behind-the-counter stories, and the occasional opinion about coffee.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={32} />
              <h3>No posts yet</h3>
              <p>Check back soon - we are brewing the first one.</p>
            </div>
          ) : (
            <motion.div
              className="blog-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              {posts.map(p => (
                <motion.div key={p.id} variants={fadeUp}>
                  <Link to={`/blog/${p.slug}`} className="blog-card">
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
