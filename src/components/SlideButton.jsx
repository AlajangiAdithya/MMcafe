import { useCallback, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Check, Loader2, ChevronRight, X } from 'lucide-react'

const DRAG_THRESHOLD = 0.9
const SPRING = { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }

export default function SlideButton({
  label = 'Slide to confirm',
  onConfirm,
  loading = false,
  status = 'idle',          // 'idle' | 'loading' | 'success' | 'error'
  disabled = false,
  className = '',
  variant = 'primary',      // 'primary' | 'blue'
}) {
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [completed, setCompleted] = useState(false)

  const dragX = useMotionValue(0)
  const springX = useSpring(dragX, SPRING)
  const fillWidth = useTransform(springX, x => x + 56)

  const getMaxX = () => {
    const w = trackRef.current?.offsetWidth ?? 280
    return Math.max(0, w - 56)
  }

  const handleDragStart = useCallback(() => {
    if (completed || disabled || loading) return
    setIsDragging(true)
  }, [completed, disabled, loading])

  const handleDragEnd = () => {
    if (completed || disabled || loading) return
    setIsDragging(false)
    const maxX = getMaxX()
    const progress = maxX > 0 ? dragX.get() / maxX : 0
    if (progress >= DRAG_THRESHOLD) {
      dragX.set(maxX)
      setCompleted(true)
      onConfirm?.()
    } else {
      dragX.set(0)
    }
  }

  const handleDrag = (_e, info) => {
    if (completed || disabled || loading) return
    const maxX = getMaxX()
    const newX = Math.max(0, Math.min(info.offset.x, maxX))
    dragX.set(newX)
  }

  const showCompleted = completed || loading || status !== 'idle'

  return (
    <div
      ref={trackRef}
      className={`slide-btn slide-btn-${variant} ${disabled ? 'is-disabled' : ''} ${className}`}
      aria-disabled={disabled}
    >
      {!showCompleted && (
        <motion.div className="slide-btn-fill" style={{ width: fillWidth }} />
      )}

      {!showCompleted && (
        <span className="slide-btn-label">{label}</span>
      )}

      <AnimatePresence>
        {!showCompleted && (
          <motion.div
            className={`slide-btn-handle ${isDragging ? 'is-dragging' : ''}`}
            drag={disabled ? false : 'x'}
            dragConstraints={trackRef}
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            style={{ x: springX }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
          >
            <ChevronRight size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleted && (
          <motion.div
            className="slide-btn-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait">
              {status === 'error' ? (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="slide-btn-status-icon error"
                >
                  <X size={20} /> <span>Failed</span>
                </motion.div>
              ) : status === 'success' ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="slide-btn-status-icon success"
                >
                  <Check size={20} /> <span>Done</span>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="slide-btn-status-icon"
                >
                  <Loader2 size={20} className="slide-btn-spin" /> <span>Processing…</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
