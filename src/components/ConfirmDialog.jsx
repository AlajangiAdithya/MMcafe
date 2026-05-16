import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Premium replacement for window.confirm / window.prompt.
 *
 * Imperative variant (preferred for one-off prompts):
 *   const ok = await confirmAction({ title, message, danger: true })
 *   if (!ok) return
 *
 * Declarative variant: render <ConfirmDialog ... /> from state.
 *
 * When `input` is set, the dialog renders a multi-line textarea and resolves
 * with its trimmed string (empty string still resolves truthy if the user
 * confirms; cancel resolves with `null`).
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  input = false,
  inputLabel,
  inputPlaceholder,
  inputDefaultValue = '',
  onConfirm,
  onCancel,
}) {
  const [text, setText] = useState(inputDefaultValue)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setText(inputDefaultValue)
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, inputDefaultValue, onCancel])

  const handleConfirm = () => {
    if (input) onConfirm?.(text.trim())
    else onConfirm?.()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-overlay"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={`confirm-dialog ${danger ? 'confirm-dialog-danger' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          >
            <button
              type="button"
              className="confirm-close"
              onClick={onCancel}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="confirm-header">
              {danger && (
                <div className="confirm-icon">
                  <AlertTriangle size={22} />
                </div>
              )}
              <div>
                <h3 id="confirm-title">{title}</h3>
                {message && <p>{message}</p>}
              </div>
            </div>
            {input && (
              <label className="confirm-input-row">
                {inputLabel && <span>{inputLabel}</span>}
                <textarea
                  ref={inputRef}
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={inputPlaceholder}
                />
              </label>
            )}
            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${danger ? 'btn-danger' : 'btn-blue'}`}
                onClick={handleConfirm}
                ref={!input ? inputRef : undefined}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Imperative API: returns a Promise that resolves with the user's response.
 *  - confirm dialog: resolves true / false
 *  - prompt dialog (input: true): resolves trimmed string / null on cancel
 *
 * Implementation mounts a single dialog into a portal-style root. Multiple
 * calls queue serially.
 */
let queue = Promise.resolve()
let mountRoot = null

function ensureRoot() {
  if (mountRoot) return mountRoot
  mountRoot = document.createElement('div')
  mountRoot.id = 'mm-confirm-root'
  document.body.appendChild(mountRoot)
  return mountRoot
}

export function confirmAction(opts = {}) {
  // Serialise to avoid two dialogs stacking visually.
  queue = queue.then(() => openOne(opts))
  return queue
}

async function openOne(opts) {
  const { createRoot } = await import('react-dom/client')
  const root = ensureRoot()
  return new Promise((resolve) => {
    const r = createRoot(root)
    const close = (val) => {
      r.render(
        <ConfirmDialog
          {...opts}
          open={false}
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      )
      setTimeout(() => {
        r.unmount()
        resolve(val)
      }, 220)
    }
    r.render(
      <ConfirmDialog
        {...opts}
        open
        onConfirm={(val) => close(opts.input ? val : true)}
        onCancel={() => close(opts.input ? null : false)}
      />,
    )
  })
}
