import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, BookOpen, Star, PlayCircle, Lock, Play, Video, CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getCourseById, getLessonsPublic, isEnrolled, COURSE_ACCESS_DAYS,
} from '../lib/database'
import { isBunnyVideo, getBunnyEmbedUrl } from '../lib/bunny'
import { usePageMeta } from '../lib/usePageMeta'
import toast from 'react-hot-toast'

function isYouTube(url) { return /(?:youtube\.com|youtu\.be)/i.test(url || '') }
function isVimeo(url)   { return /vimeo\.com/i.test(url || '') }
function youtubeEmbed(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : url
}
function vimeoEmbed(url) {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? `https://player.vimeo.com/video/${m[1]}` : url
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [bunnyUrl, setBunnyUrl] = useState('')

  usePageMeta({
    title: course?.title ? `${course.title} · Mastermind Brews Academy` : 'Course · Mastermind Brews Academy',
    description: course?.description || 'Watch the intro video and explore lessons before enrolling.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const c = await getCourseById(courseId)
        if (cancelled) return
        setCourse(c)
        const ls = await getLessonsPublic(c.id).catch(() => [])
        if (cancelled) return
        setLessons(ls)
        setActiveId(ls[0]?.id ?? null)
        if (user) {
          const e = await isEnrolled(user.id, c.id).catch(() => false)
          if (!cancelled) setEnrolled(!!e)
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Course not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [courseId, user])

  const introUrl = course?.intro_video_url || course?.video_url || lessons[0]?.video_url || ''
  const activeLesson = useMemo(
    () => lessons.find(l => l.id === activeId) || null,
    [lessons, activeId],
  )
  const playableUrl = activeLesson?.video_url || introUrl

  // Generate signed Bunny URL when playable URL is a Bunny Video ID
  useEffect(() => {
    if (isBunnyVideo(playableUrl)) {
      let cancelled = false
      getBunnyEmbedUrl(playableUrl.trim()).then((signed) => {
        if (!cancelled) setBunnyUrl(signed)
      })
      return () => { cancelled = true }
    } else {
      setBunnyUrl('')
    }
  }, [playableUrl])

  const renderPlayer = () => {
    const introUrl = playableUrl
    if (!introUrl) {
      return (
        <div className="player-empty">
          <Video size={48} />
          <p>Intro video coming soon.</p>
        </div>
      )
    }
    if (isBunnyVideo(introUrl) && bunnyUrl) {
      return (
        <iframe
          src={bunnyUrl}
          title={`${course?.title || 'Course'} intro`}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          style={{ border: 'none' }}
        />
      )
    }
    if (isBunnyVideo(introUrl) && !bunnyUrl) {
      return <div className="player-empty"><span className="spinner" /> Loading secure video…</div>
    }
    if (isYouTube(introUrl)) {
      return (
        <iframe
          src={youtubeEmbed(introUrl)}
          title={`${course?.title || 'Course'} intro`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    if (isVimeo(introUrl)) {
      return (
        <iframe
          src={vimeoEmbed(introUrl)}
          title={`${course?.title || 'Course'} intro`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return <video src={introUrl} controls controlsList="nodownload" />
  }

  const handleBuy = () => {
    if (!course) return
    if (!user) {
      toast.error('Please login to enroll')
      navigate('/login')
      return
    }
    navigate(`/course/${course.id}/checkout`)
  }

  if (loading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading course...</div>
  }
  if (error || !course) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <Link to="/academy" className="checkout-back"><ArrowLeft size={16} /> Back to Academy</Link>
        <div className="store-empty" style={{ marginTop: 24 }}>
          <Video size={56} />
          <h3>Couldn't load course</h3>
          <p>{error || 'Course not found.'}</p>
        </div>
      </div>
    )
  }

  const price = Number(course.price || 0)
  const totalLessons = lessons.length

  return (
    <div className="player-page course-detail-page">
      <div className="container">
        <Link to="/academy" className="checkout-back">
          <ArrowLeft size={16} /> Back to Academy
        </Link>

        <div className="course-detail-stack">
          <div className="player-stage">{renderPlayer()}</div>

          <div className="player-info">
            <div className="course-detail-header">
              <div>
                {course.level && <span className="category-badge">{course.level}</span>}
                <h1>{course.title}</h1>
              </div>
              <div className="course-detail-price-block">
                {course.free ? (
                  <span className="course-badge free">FREE</span>
                ) : (
                  <div className="course-detail-price">₹{price.toLocaleString()}</div>
                )}
              </div>
            </div>

            <ul className="player-meta">
              {course.duration && <li><Clock size={14} /> {course.duration}</li>}
              {totalLessons ? <li><BookOpen size={14} /> {totalLessons} lessons</li> : null}
              {course.rating && <li><Star size={14} fill="currentColor" /> {course.rating}</li>}
            </ul>

            {course.description && (
              <div className="course-detail-description">
                <h3>About this course</h3>
                <p>{course.description}</p>
              </div>
            )}

            <div className="course-detail-actions">
              {enrolled ? (
                <button
                  type="button"
                  className="btn btn-success full-width"
                  onClick={() => navigate('/my-courses')}
                >
                  <PlayCircle size={18} /> Watch Now
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary full-width"
                  onClick={handleBuy}
                >
                  {course.free
                    ? <><Play size={18} /> Start Free</>
                    : <><Lock size={18} /> Buy Now -₹{price.toLocaleString()}</>}
                </button>
              )}
              {!course.free && !enrolled && (
                <p className="course-detail-fineprint">
                  Enrollment gives you {COURSE_ACCESS_DAYS} days of access from the day you buy.
                  After {COURSE_ACCESS_DAYS} days, you&rsquo;ll need to enroll again to keep watching.
                </p>
              )}
            </div>
          </div>

          <section className="course-content-section">
            <div className="course-content-head">
              <h2>Course content</h2>
              <span className="text-muted">{totalLessons} lesson{totalLessons === 1 ? '' : 's'}</span>
            </div>

            {totalLessons === 0 ? (
              <div className="course-detail-lessons-empty">
                Lesson list will appear here once the instructor publishes them.
              </div>
            ) : (
              <ul className="course-content-list">
                {lessons.map((l, idx) => {
                  const playable = enrolled || course.free
                  const handleClick = () => {
                    if (!playable) {
                      navigate(`/course/${course.id}/checkout`)
                      return
                    }
                    setActiveId(l.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  return (
                    <li
                      key={l.id}
                      className={`course-content-item ${activeId === l.id ? 'active' : ''} ${!playable ? 'locked' : ''}`}
                      onClick={handleClick}
                    >
                      <div className="course-content-thumb">
                        {l.thumbnail ? (
                          <img src={l.thumbnail} alt={l.title} />
                        ) : (
                          <div className="course-content-thumb-empty">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <span className="course-content-thumb-overlay">
                          {playable ? <PlayCircle size={28} /> : <Lock size={22} />}
                        </span>
                      </div>
                      <div className="course-content-body">
                        <strong>{idx + 1}. {l.title}</strong>
                        {l.description && <p>{l.description}</p>}
                        <div className="course-content-meta">
                          {l.duration_seconds ? (
                            <span><Clock size={12} /> {Math.round(l.duration_seconds / 60)} min</span>
                          ) : null}
                          {!playable && <span className="course-content-lock-tag"><Lock size={11} /> Locked</span>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
