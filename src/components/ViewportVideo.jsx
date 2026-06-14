import { forwardRef, useEffect, useRef } from 'react'

/**
 * ViewportVideo, drop-in replacement for <video> that pauses when off-screen
 * to save CPU/battery (especially on mobile). Resumes when back in view.
 *
 * All native <video> props pass through. The element is muted by default
 * so autoplay never breaks browser policy.
 */
const ViewportVideo = forwardRef(function ViewportVideo(props, externalRef) {
  const localRef = useRef(null)
  const ref = externalRef || localRef

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Play returns a promise; swallow rejection (autoplay can fail).
            const p = el.play()
            if (p && typeof p.catch === 'function') p.catch(() => {})
          } else {
            el.pause()
          }
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  // Pause when the tab is hidden, resume when re-shown + still in view.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onVis = () => {
      if (document.hidden) el.pause()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [ref])

  return <video ref={ref} muted playsInline {...props} />
})

export default ViewportVideo
