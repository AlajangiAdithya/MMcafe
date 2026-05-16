import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Pencil, Trash2, X, Save, Video as VideoIcon,
  GripVertical, Eye, ArrowUp, ArrowDown, Image as ImageIcon,
} from 'lucide-react'
import {
  getLessons, addLesson, updateLesson, deleteLesson, reorderLessons,
} from '../lib/database'
import { isBunnyVideo, isBunnyConfigured } from '../lib/bunny'
import FileUploader from './FileUploader'
import { confirmAction } from './ConfirmDialog'
import toast from 'react-hot-toast'

const EMPTY_LESSON = {
  title: '',
  description: '',
  video_url: '',
  thumbnail: '',
  duration_seconds: '',
}

export default function LessonsEditor({ courseId }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | { ...lesson } | { ...EMPTY_LESSON, _new: true }
  const [savingOrder, setSavingOrder] = useState(false)

  const reload = async () => {
    setLoading(true)
    try {
      setLessons(await getLessons(courseId))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() /* eslint-disable-line */ }, [courseId])

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await updateLesson(form.id, {
          title: form.title,
          description: form.description,
          video_url: form.video_url,
          thumbnail: form.thumbnail || null,
          duration_seconds: parseInt(form.duration_seconds) || 0,
          preview: false,
        })
        toast.success('Lesson updated')
      } else {
        await addLesson({
          course_id: courseId,
          title: form.title,
          description: form.description,
          video_url: form.video_url,
          thumbnail: form.thumbnail || null,
          duration_seconds: parseInt(form.duration_seconds) || 0,
          preview: false,
          position: lessons.length,
        })
        toast.success('Lesson added')
      }
      setEditing(null)
      await reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirmAction({
      title: 'Delete lesson?',
      message: 'The lesson and its video reference will be removed. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteLesson(id)
      toast.success('Lesson deleted')
      await reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const move = async (idx, dir) => {
    const next = [...lessons]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setLessons(next)
    setSavingOrder(true)
    try {
      await reorderLessons(next.map((l) => l.id))
    } catch (e) {
      toast.error(e.message)
      reload()
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="lessons-editor">
      <div className="lessons-editor-header">
        <div>
          <h3>Lessons ({lessons.length})</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            Drag-free reorder with the arrows. The first lesson plays first.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-blue btn-sm"
          onClick={() => setEditing({ ...EMPTY_LESSON, _new: true })}
        >
          <Plus size={14} /> Add Lesson
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner" /> Loading…</div>
      ) : lessons.length === 0 ? (
        <div className="lessons-empty">
          <VideoIcon size={28} />
          <p>No lessons yet. Add the first one.</p>
        </div>
      ) : (
        <ul className="lessons-list">
          {lessons.map((l, idx) => (
            <li key={l.id} className="lesson-row">
              <div className="lesson-handle"><GripVertical size={14} /></div>
              <div className="lesson-row-thumb">
                {l.thumbnail ? (
                  <img src={l.thumbnail} alt={l.title} />
                ) : (
                  <div className="lesson-row-thumb-empty" title="No thumbnail">
                    <ImageIcon size={16} />
                    <span>No image</span>
                  </div>
                )}
              </div>
              <div className="lesson-row-main">
                <div className="lesson-row-title">
                  <strong>{idx + 1}. {l.title}</strong>

                </div>
                {l.description && <p className="lesson-row-desc">{l.description}</p>}
                <div className="lesson-row-meta">
                  {l.video_url
                    ? <span>
                        <Eye size={12} />
                        {isBunnyVideo(l.video_url) ? ' Bunny Stream' : ' Video uploaded'}
                      </span>
                    : <span className="text-muted">No video yet</span>}
                  {l.duration_seconds ? <span>· {fmt(l.duration_seconds)}</span> : null}
                </div>
              </div>
              <div className="lesson-row-actions">
                <button
                  type="button" className="admin-action-btn edit"
                  onClick={() => move(idx, -1)} disabled={idx === 0 || savingOrder}
                  title="Move up"
                ><ArrowUp size={14} /></button>
                <button
                  type="button" className="admin-action-btn edit"
                  onClick={() => move(idx, +1)} disabled={idx === lessons.length - 1 || savingOrder}
                  title="Move down"
                ><ArrowDown size={14} /></button>
                <button
                  type="button" className="admin-action-btn edit"
                  onClick={() => setEditing(l)} title="Edit"
                ><Pencil size={14} /></button>
                <button
                  type="button" className="admin-action-btn delete"
                  onClick={() => handleDelete(l.id)} title="Delete"
                ><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && createPortal(
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <LessonForm
              data={editing}
              onSave={handleSave}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

function LessonForm({ data, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title required')
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={submit}>
      <div className="admin-modal-header">
        <h2>{form._new ? 'Add Lesson' : 'Edit Lesson'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Title *</label>
          <input
            type="text" value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Pulling the perfect espresso shot" required
          />
        </div>
        <div className="admin-form-group">
          <label>Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What this lesson covers…" rows={2}
          />
        </div>
        <div className="admin-form-group">
          <label>Thumbnail Image</label>
          <FileUploader
            bucket="course-thumbnails"
            accept="image/*"
            kind="image"
            value={form.thumbnail}
            onChange={(url) => update('thumbnail', url)}
            maxSizeMB={5}
          />
          <small className="text-muted">
            Optional. Shown next to this lesson. If empty, a "No image" placeholder is shown.
          </small>
        </div>
        <div className="admin-form-group">
          <label>Video</label>
          {isBunnyConfigured() && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted, #888)', display: 'block', marginBottom: 4 }}>
                🐰 Bunny Video ID <span style={{ opacity: 0.7 }}>(recommended: secure, no link leaking)</span>
              </label>
              <input
                type="text"
                value={isBunnyVideo(form.video_url) ? form.video_url : ''}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="Paste Video ID or full Bunny URL"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
              <small className="text-muted" style={{ display: 'block', marginTop: 2 }}>
                Paste the Video ID (UUID) or the full player URL from Bunny.net dashboard.
              </small>
            </div>
          )}
          {(!isBunnyConfigured() || !isBunnyVideo(form.video_url)) && (
            <>
              <FileUploader
                bucket="course-videos"
                accept="video/*"
                kind="video"
                value={!isBunnyVideo(form.video_url) ? form.video_url : ''}
                onChange={(url) => update('video_url', url)}
                maxSizeMB={500}
              />
              <small className="text-muted">Or paste a YouTube/Vimeo URL below.</small>
              <input
                type="url" value={!isBunnyVideo(form.video_url) ? (form.video_url || '') : ''}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ marginTop: 8 }}
              />
            </>
          )}
          {isBunnyConfigured() && isBunnyVideo(form.video_url) && (
            <button
              type="button"
              className="btn-ghost-small"
              onClick={() => update('video_url', '')}
              style={{ marginTop: 8, fontSize: '0.8rem' }}
            >
              Switch to file upload / YouTube URL instead
            </button>
          )}
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Duration (seconds)</label>
            <input
              type="number" min={0}
              value={form.duration_seconds ?? ''}
              onChange={(e) => update('duration_seconds', e.target.value)}
              placeholder="600"
            />
          </div>

        </div>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : <><Save size={16} /> Save</>}
        </button>
      </div>
    </form>
  )
}

function fmt(seconds) {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}:${String(r).padStart(2, '0')}`
}
