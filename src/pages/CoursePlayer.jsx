import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, BookOpen, Star, CheckCircle2, Circle,
  PlayCircle, Lock, Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getCourseById, isEnrolled, getLessons,
  getLessonProgress, upsertLessonProgress, getEnrollmentStatus,
} from '../lib/database'
import { isBunnyVideo, getBunnyEmbedUrl } from '../lib/bunny'
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

export default function CoursePlayer() {
  const { courseId } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState({}) // { [lessonId]: row }
  const [activeId, setActiveId] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [bunnyUrl, setBunnyUrl] = useState('')

  const videoRef = useRef(null)
  const lastSavedRef = useRef(0)

  // ----- Bootstrapping -----
  useEffect(() => {
    if (loading) return
    if (!user) {
      toast.error('Please login to watch courses')
      navigate('/login')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const c = await getCourseById(courseId)
        if (cancelled) return
        // Retry once after a short delay to absorb replication lag right after
        // a paid purchase (edge function inserted enrollment moments ago).
        let enrolled = await isEnrolled(user.id, c.id)
        if (!enrolled && !c.free) {
          await new Promise(r => setTimeout(r, 800))
          if (cancelled) return
          enrolled = await isEnrolled(user.id, c.id)
        }
        if (!enrolled && !c.free) {
          // isEnrolled returns false for both "never enrolled" and "expired" —
          // distinguish so we can route the user back to enroll again.
          const status = await getEnrollmentStatus(user.id, c.id).catch(() => null)
          if (status?.expired) {
            toast.error('Your access to this course has expired. Re-enroll to keep watching.')
            navigate(`/course/${c.id}`)
          } else {
            toast.error('You are not enrolled in this course')
            navigate('/academy')
          }
          return
        }
        setCourse(c)

        const ls = await getLessons(c.id).catch(() => [])
        if (cancelled) return
        setLessons(ls)

        const pg = await getLessonProgress(user.id, c.id).catch(() => [])
        if (cancelled) return
        const map = {}
        for (const row of pg) map[row.lesson_id] = row
        setProgress(map)

        // Pick active lesson: last-watched-incomplete else first
        const incomplete = ls.find((l) => !map[l.id]?.completed)
        setActiveId(incomplete?.id ?? ls[0]?.id ?? null)
      } catch (err) {
        toast.error(err.message || 'Course not found')
        navigate('/academy')
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [courseId, user, loading, navigate])

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeId) || null,
    [lessons, activeId],
  )

  // Generate signed Bunny URL when the active lesson uses Bunny Stream
  useEffect(() => {
    const url = activeLesson?.video_url || course?.video_url || ''
    if (isBunnyVideo(url)) {
      let cancelled = false
      getBunnyEmbedUrl(url.trim()).then((signed) => {
        if (!cancelled) setBunnyUrl(signed)
      })
      return () => { cancelled = true }
    } else {
      setBunnyUrl('')
    }
  }, [activeLesson?.video_url, course?.video_url])

  const completedCount = useMemo(
    () => lessons.filter((l) => progress[l.id]?.completed).length,
    [lessons, progress],
  )
  const totalCount = lessons.length
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  // ----- Save progress (debounced via lastSavedRef) -----
  // notify=true surfaces errors via toast (used by manual "Mark Complete" click).
  // notify=false keeps auto-save (timeupdate) silent so playback isn't disrupted.
  const saveProgress = async ({ positionSeconds, completed, notify = false }) => {
    if (!user || !course || !activeLesson) return
    try {
      await upsertLessonProgress({
        userId: user.id,
        lessonId: activeLesson.id,
        courseId: course.id,
        positionSeconds,
        completed,
      })
      setProgress((prev) => ({
        ...prev,
        [activeLesson.id]: {
          ...(prev[activeLesson.id] || {}),
          position_seconds: positionSeconds,
          completed: completed || prev[activeLesson.id]?.completed,
        },
      }))
      return true
    } catch (e) {
      console.warn('Progress save failed', e.message)
      if (notify) toast.error(e.message || 'Could not save progress')
      return false
    }
  }

  // Hook into <video> element for native uploads
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const stored = progress[activeLesson?.id]?.position_seconds || 0
    if (stored && stored < (activeLesson?.duration_seconds || Infinity) - 5) {
      try { v.currentTime = stored } catch { /* noop */ }
    }
    const onTime = () => {
      const now = v.currentTime || 0
      if (now - lastSavedRef.current >= 8) {
        lastSavedRef.current = now
        const completed = v.duration > 0 && now / v.duration >= 0.95
        saveProgress({ positionSeconds: now, completed })
      }
    }
    const onEnd = () => saveProgress({ positionSeconds: v.duration || 0, completed: true })
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
    // eslint-disable-next-line
  }, [activeLesson?.id])

  // ----- Render -----
  if (loading || pageLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading course...</div>
  }
  if (!course) return null

  const url = activeLesson?.video_url || course.video_url || ''
  const renderPlayer = () => {
    if (!url) return <div className="player-empty">No video has been uploaded for this lesson yet.</div>
    if (isBunnyVideo(url) && bunnyUrl) {
      return (
        <iframe
          src={bunnyUrl}
          title={activeLesson?.title || course.title}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          style={{ border: 'none' }}
        />
      )
    }
    if (isBunnyVideo(url) && !bunnyUrl) {
      return <div className="player-empty"><span className="spinner" /> Loading secure video…</div>
    }
    if (isYouTube(url)) {
      return (
        <iframe
          src={youtubeEmbed(url)} title={activeLesson?.title || course.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    if (isVimeo(url)) {
      return (
        <iframe
          src={vimeoEmbed(url)} title={activeLesson?.title || course.title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return (
      <video
        ref={videoRef}
        src={url}
        controls
        controlsList="nodownload"
        key={activeLesson?.id || 'fallback'}
      />
    )
  }

  const markCurrentDone = async () => {
    const ok = await saveProgress({
      positionSeconds: activeLesson?.duration_seconds || 0,
      completed: true,
      notify: true,
    })
    if (!ok) return
    toast.success('Lesson marked complete')
    const idx = lessons.findIndex((l) => l.id === activeId)
    if (idx >= 0 && idx < lessons.length - 1) setActiveId(lessons[idx + 1].id)
  }

  return (
    <div className="player-page">
      <div className="container">
        <Link to="/my-courses" className="checkout-back">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>

        <div className="player-grid player-grid-with-sidebar">
          <div className="player-stage-col">
            <div className="player-stage">{renderPlayer()}</div>

            <div className="player-info">
              <h1>{activeLesson?.title || course.title}</h1>
              <p className="player-desc">{activeLesson?.description || course.description}</p>
              <ul className="player-meta">
                {course.duration && <li><Clock size={14} /> {course.duration}</li>}
                {totalCount ? <li><BookOpen size={14} /> {totalCount} lessons</li> : null}
                {course.rating && <li><Star size={14} fill="currentColor" /> {course.rating}</li>}
                {course.level && <li><span className="category-badge">{course.level}</span></li>}
              </ul>

              {totalCount > 0 && (
                <>
                  <div className="player-progress">
                    <div className="player-progress-head">
                      <span>{completedCount} of {totalCount} complete</span>
                      <strong>{percent}%</strong>
                    </div>
                    <div className="player-progress-bar">
                      <div className="player-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  {!progress[activeId]?.completed && url && (
                    <button className="btn btn-success" onClick={markCurrentDone}>
                      <CheckCircle2 size={16} /> Mark lesson complete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {totalCount > 0 && (
            <aside className="player-lessons">
              <div className="player-lessons-head">
                <h3>Lessons</h3>
                <span className="text-muted">{percent}%</span>
              </div>
              <ul>
                {lessons.map((l, idx) => {
                  const done = !!progress[l.id]?.completed
                  const locked = !course.free && !l.video_url
                  const isActive = activeId === l.id
                  return (
                    <li
                      key={l.id}
                      className={`player-lesson-item ${isActive ? 'active' : ''} ${done ? 'completed' : ''}`}
                      onClick={() => setActiveId(l.id)}
                    >
                      <div className="player-lesson-thumb">
                        {l.thumbnail ? (
                          <img src={l.thumbnail} alt={l.title} />
                        ) : (
                          <div className="player-lesson-thumb-empty">
                            <ImageIcon size={14} />
                          </div>
                        )}
                        <span className="player-lesson-thumb-overlay">
                          {done
                            ? <CheckCircle2 size={20} />
                            : locked
                              ? <Lock size={16} />
                              : <PlayCircle size={20} />}
                        </span>
                      </div>
                      <span className="player-lesson-title">
                        <strong>{idx + 1}. {l.title}</strong>
                        {l.duration_seconds ? (
                          <small>{Math.round(l.duration_seconds / 60)} min</small>
                        ) : null}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
