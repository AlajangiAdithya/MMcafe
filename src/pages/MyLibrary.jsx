import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, BookOpen, User as UserIcon, Loader2, Library } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getMyBooks, getBookDownloadUrl } from '../lib/database'
import Reveal from '../components/Reveal'

export default function MyLibrary() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setDataLoading(false)
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    getMyBooks(user.id)
      .then(rows => { if (!cancelled) setBooks(rows) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDataLoading(false) })
    return () => { cancelled = true }
  }, [user, loading, navigate])

  const handleDownload = async (bookId) => {
    if (downloadingId) return
    setDownloadingId(bookId)
    try {
      const url = await getBookDownloadUrl(bookId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(e.message || 'Could not start the download')
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading || dataLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading your library...</div>
  }

  return (
    <div className="myorders-page">
      <div className="container">
        <motion.div
          className="myorders-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1>My Library</h1>
          <p>{books.length} book{books.length === 1 ? '' : 's'}</p>
          <p className="myorders-fineprint">
            Your books are yours to keep — download the PDF any time. Each link is
            generated securely just for you.
          </p>
        </motion.div>

        {books.length === 0 ? (
          <Reveal className="myorders-empty">
            <Library size={48} />
            <h3>Your library is empty</h3>
            <p>Browse the Learn Coffee section to pick up a guide or eBook.</p>
            <Link to="/workshop" className="btn btn-blue">Browse books</Link>
          </Reveal>
        ) : (
          <div className="mycourses-grid">
            {books.map((row, idx) => {
              const b = row.books
              if (!b) return null
              const isDownloading = downloadingId === b.id
              return (
                <Reveal key={row.id} className="mycourse-card" delay={Math.min(idx * 60, 360)}>
                  <div className="mycourse-image">
                    {b.cover_image && <img src={b.cover_image} alt={b.title} />}
                  </div>
                  <div className="mycourse-info">
                    <h3>{b.title}</h3>
                    <div className="mycourse-meta">
                      {b.author && <span><UserIcon size={12} /> {b.author}</span>}
                      {b.pages ? <span><BookOpen size={12} /> {b.pages} pages</span> : null}
                    </div>
                    <button
                      type="button"
                      className="btn btn-blue full-width mylibrary-download"
                      onClick={() => handleDownload(b.id)}
                      disabled={isDownloading}
                    >
                      {isDownloading
                        ? <><Loader2 size={16} className="spin" /> Preparing…</>
                        : <><Download size={16} /> Download PDF</>}
                    </button>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
