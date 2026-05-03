import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, PlayCircle, Play, Clock, BookOpen, Star, Video, CheckCircle
} from 'lucide-react'
import SlideButton from './SlideButton'

export default function CourseDetailModal({
  course,
  onClose,
  enrolled,
  coursesFromDb,
  onEnroll,
}) {
  const navigate = useNavigate()

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!course) return null

  const price = Number(course.price || 0)

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="detail-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="detail-modal-media">
          {course.image ? (
            <img src={course.image} alt={course.title} />
          ) : (
            <div className="detail-modal-placeholder"><Video size={48} /></div>
          )}
        </div>

        <div className="detail-modal-body">
          <div className="detail-modal-badges">
            {course.level && <span className="detail-chip">{course.level}</span>}
            {course.duration && (
              <span className="detail-chip"><Clock size={12} /> {course.duration}</span>
            )}
            {course.lessons ? (
              <span className="detail-chip"><BookOpen size={12} /> {course.lessons} lessons</span>
            ) : null}
            {course.free ? (
              <span className="detail-chip detail-chip-success">FREE</span>
            ) : null}
          </div>

          <h2 className="detail-modal-title">{course.title}</h2>

          {course.rating ? (
            <div className="detail-modal-rating">
              <Star size={14} fill="currentColor" />
              <strong>{Number(course.rating).toFixed(1)}</strong>
            </div>
          ) : null}

          {!course.free && (
            <div className="detail-modal-price">₹{price.toLocaleString()}</div>
          )}

          {course.description && (
            <div className="detail-modal-section">
              <h3>About this course</h3>
              <p className="detail-modal-desc">{course.description}</p>
            </div>
          )}

          <div className="detail-modal-actions">
            {enrolled ? (
              coursesFromDb ? (
                <button
                  type="button"
                  className="btn btn-success full-width"
                  onClick={() => { navigate('/my-courses'); onClose() }}
                >
                  <PlayCircle size={16} /> Watch Now
                </button>
              ) : (
                <button className="btn btn-success full-width" disabled>
                  <CheckCircle size={16} /> Enrolled
                </button>
              )
            ) : course.free ? (
              <button
                className="btn btn-primary full-width"
                onClick={() => onEnroll(course)}
              >
                <Play size={16} /> Start Free
              </button>
            ) : (
              <SlideButton
                label={`Slide to Enroll · ₹${price.toLocaleString()}`}
                onConfirm={() => onEnroll(course)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
