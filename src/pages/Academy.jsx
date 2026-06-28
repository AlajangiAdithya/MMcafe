import { useState, useEffect } from 'react'
import { Clock, Star, BookOpen, PlayCircle, Video, Info, Award, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getCourses, getEnrollments } from '../lib/database'
import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'
import { CourseGridSkeleton } from '../components/Skeleton'
import RotatingWord from '../components/RotatingWord'
import MarqueeStrip from '../components/MarqueeStrip'
import '../styles/premium-hero.css'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const WHY = [
  { n: '01', Icon: Video, title: 'HD Video Lessons', body: 'Filmed at the bar, close-up on the technique, rewind any step until it clicks.' },
  { n: '02', Icon: Award, title: 'Taught by Champions', body: 'Curriculum built by certified, competition-placed baristas from our Mulund cafe.' },
  { n: '03', Icon: Wifi, title: 'Learn at Your Pace', body: 'Lifetime access on any device. Start a free lesson today, no equipment required.' },
]

export default function Academy() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchased, setPurchased] = useState(new Set())
  const [reloadKey, setReloadKey] = useState(0)

  usePageMeta({
    title: 'Online Barista Academy · Professional Coffee Courses',
    description: 'HD video courses from certified baristas. Learn espresso, latte art, brewing methods and cafe fundamentals at your pace, anywhere in India.',
    keywords: 'online barista course India, barista training online, espresso course, latte art classes, coffee certification India, learn coffee online',
    noindex: true, // hidden/prep: keep the academy out of the index until launch
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
      <header className="pg-hero">
        <div className="pg-hero-bg" aria-hidden="true" style={{ backgroundImage: 'url(/pour-over-coffee.jpg)' }} />
        <div className="pg-hero-scrim" aria-hidden="true" />
        <motion.div
          className="pg-hero-inner"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.1 } } }}
        >
          <motion.div className="pg-eyebrow" variants={fadeUp}>Learn from the best</motion.div>
          <motion.h1
            className="pg-title"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          >
            Master the art of <em><RotatingWord words={['espresso', 'latte art', 'pour-over', 'cupping', 'milk steaming']} /></em>
          </motion.h1>
          <motion.p className="pg-lede" variants={fadeUp}>
            Professional HD video courses from certified, competition-placed baristas, learn at your own pace, anywhere in India.
          </motion.p>
          <motion.div variants={fadeUp}>
            <span className="pg-scrollcue"><span className="pg-mouse" /> Explore the courses</span>
          </motion.div>
        </motion.div>
      </header>

      <MarqueeStrip
        variant="accent"
        speed={30}
        items={['Espresso', 'Latte Art', 'Pour Over', 'Cupping', 'Single Origin', 'Milk Steaming', 'Dialing In', 'Chikmagalur']}
      />

      <section className="band-dark">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">Why Learn With Us</div>
            <h2 className="about-intro-title" style={{ textAlign: 'center' }}>Built for real bar skills</h2>
          </div>
          <motion.div
            className="acad-why"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {WHY.map(({ n, Icon, title, body }) => (
              <motion.div className="acad-why-row" variants={fadeUp} key={n}>
                <span className="acad-why-num" aria-hidden="true">{n}</span>
                <span className="acad-why-icon" aria-hidden="true"><Icon size={22} /></span>
                <div className="acad-why-text">
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
          <motion.div
            className="courses-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {courses.map(course => (
              <motion.div
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
                variants={fadeUp}
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
