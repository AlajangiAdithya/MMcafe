import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlayCircle, BookOpen, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getEnrollments, COURSE_ACCESS_DAYS } from '../lib/database'

export default function MyCourses() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setDataLoading(false)
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    getEnrollments(user.id)
      .then(rows => { if (!cancelled) setEnrollments(rows) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDataLoading(false) })
    return () => { cancelled = true }
  }, [user, loading, navigate])

  if (loading || dataLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading courses...</div>
  }

  return (
    <div className="myorders-page">
      <div className="container">
        <div className="myorders-header">
          <h1>My Courses</h1>
          <p>{enrollments.length} enrolled course{enrollments.length === 1 ? '' : 's'}</p>
          <p className="myorders-fineprint">
            Each enrollment gives you <strong>{COURSE_ACCESS_DAYS} days</strong> of access from the day you enrolled.
            After that, you&rsquo;ll need to enroll again to keep watching.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="myorders-empty">
            <BookOpen size={48} />
            <h3>No enrollments yet</h3>
            <p>Browse the academy to enroll in your first course.</p>
            <Link to="/academy" className="btn btn-blue">Browse Academy</Link>
          </div>
        ) : (
          <div className="mycourses-grid">
            {enrollments.map(e => {
              const c = e.courses
              if (!c) return null
              const daysLeft = e.expires_at
                ? Math.ceil((new Date(e.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null
              return (
                <div key={e.id} className={`mycourse-card ${e.expired ? 'mycourse-card-expired' : ''}`}>
                  <div className="mycourse-image">
                    {c.image && <img src={c.image} alt={c.title} />}
                    {e.expired && <span className="mycourse-expired-badge">Expired</span>}
                  </div>
                  <div className="mycourse-info">
                    <h3>{c.title}</h3>
                    <div className="mycourse-meta">
                      {c.duration && <span><Clock size={12} /> {c.duration}</span>}
                      {c.lessons ? <span><BookOpen size={12} /> {c.lessons} lessons</span> : null}
                    </div>
                    {daysLeft !== null && !e.expired && (
                      <div className={`mycourse-expiry ${daysLeft <= 5 ? 'mycourse-expiry-warn' : ''}`}>
                        {daysLeft <= 5 && <AlertCircle size={12} />}
                        {daysLeft} day{daysLeft === 1 ? '' : 's'} of access left
                      </div>
                    )}
                    {e.expired ? (
                      <Link to={`/course/${c.id}`} className="btn btn-blue full-width">
                        <RefreshCw size={16} /> Enroll again
                      </Link>
                    ) : (
                      <Link to={`/learn/${c.id}`} className="btn btn-blue full-width">
                        <PlayCircle size={16} /> Start Learning
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
