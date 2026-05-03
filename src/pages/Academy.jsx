import { useState, useEffect } from 'react'
import { Clock, Star, BookOpen, PlayCircle, Video, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCourses, getEnrollments } from '../lib/database'
import { useNavigate } from 'react-router-dom'
import { CourseGridSkeleton } from '../components/Skeleton'
import { usePageMeta } from '../lib/usePageMeta'

export default function Academy() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchased, setPurchased] = useState(new Set())
  const [reloadKey, setReloadKey] = useState(0)

  usePageMeta({
    title: 'Barista Academy · Professional Coffee Courses',
    description: 'HD video courses from certified baristas. Learn espresso, latte art, and coffee fundamentals at your pace.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoading(false)
        setError('Taking longer than expected. Check your connection.')
      }
    }, 10000)
    getCourses()
      .then(data => {
        if (cancelled) return
        setCourses(data)
        setError(null)
      })
      .catch(err => { if (!cancelled) setError(err?.message || 'Could not load courses') })
      .finally(() => {
        clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true; clearTimeout(timeoutId) }
  }, [reloadKey])

  // Load enrollments to seed purchased Set whenever user is known.
  // Reset is deferred to the next microtask so the effect body never sets state synchronously.
  useEffect(() => {
    let cancelled = false
    if (!user) {
      Promise.resolve().then(() => { if (!cancelled) setPurchased(new Set()) })
      return () => { cancelled = true }
    }
    getEnrollments(user.id)
      .then(rows => { if (!cancelled) setPurchased(new Set(rows.map(r => r.course_id))) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user])

  const goToCourse = (course) => {
    if (purchased.has(course.id)) navigate('/my-courses')
    else navigate(`/course/${course.id}`)
  }

  return (
    <div className="academy-page">
      <div className="academy-hero">
        <div className="section-label">Learn from the best</div>
        <h1>Barista Academy</h1>
        <p>Professional video courses to take your coffee skills to the next level</p>
      </div>

      <div className="academy-container">
        {loading ? (
          <CourseGridSkeleton count={6} />
        ) : error ? (
          <div className="store-empty">
            <Video size={56} />
            <h3>Couldn't load courses</h3>
            <p>{error}</p>
            <button className="btn btn-blue" onClick={() => setReloadKey(k => k + 1)} style={{ marginTop: 16 }}>
              Try again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="store-empty">
            <Video size={56} />
            <h3>No courses registered yet</h3>
            <p>New courses are being prepared. Please check back soon.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div
                key={course.id}
                className="course-card clickable"
                onClick={() => goToCourse(course)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    goToCourse(course)
                  }
                }}
              >
                <div className="course-image">
                  <img src={course.image} alt={course.title} loading="lazy" />
                  <span className={`course-badge ${course.free ? 'free' : ''}`}>
                    {course.free ? 'FREE' : `₹${(course.price || 0).toLocaleString()}`}
                  </span>
                  <span className="course-level">{course.level}</span>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span><Clock size={13} /> {course.duration}</span>
                    <span><BookOpen size={13} /> {course.lesson_count || 0} lessons</span>
                    <span><Star size={13} fill="currentColor" /> {course.rating}</span>
                  </div>
                  {purchased.has(course.id) ? (
                    <button
                      type="button"
                      className="btn btn-success full-width"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/my-courses')
                      }}
                    >
                      <PlayCircle size={16} /> Watch Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary full-width"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToCourse(course)
                      }}
                    >
                      <Info size={16} /> Learn More
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
