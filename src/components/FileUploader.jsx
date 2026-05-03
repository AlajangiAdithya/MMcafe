import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Film, Loader2, Link as LinkIcon, Check } from 'lucide-react'
import { uploadFile } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/**
 * Reusable file uploader for Supabase Storage with a "paste URL" fallback
 * for admins who already have a hosted asset.
 *
 * Props:
 *  - bucket    : 'product-images' | 'course-videos' | 'course-thumbnails'
 *  - accept    : file input accept string (e.g. 'image/*' or 'video/*')
 *  - kind      : 'image' | 'video'  (controls preview type)
 *  - value     : current public URL (or '')
 *  - onChange  : (url: string) => void
 *  - maxSizeMB : optional client-side size guard
 *  - label     : optional label override
 */
export default function FileUploader({
  bucket,
  accept = 'image/*',
  kind = 'image',
  value = '',
  onChange,
  maxSizeMB,
  label,
}) {
  const inputRef = useRef(null)
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large (max ${maxSizeMB}MB)`)
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const { url } = await uploadFile(bucket, file, {
        userId: user?.id || 'anon',
        onProgress: setProgress,
      })
      onChange(url)
      toast.success('Uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) handleFile(f)
  }

  const applyUrl = () => {
    const trimmed = urlDraft.trim()
    if (!trimmed) {
      toast.error('Paste a URL first')
      return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error('URL must start with http:// or https://')
      return
    }
    onChange(trimmed)
    setShowUrl(false)
    setUrlDraft('')
    toast.success('URL set')
  }

  const Icon = kind === 'video' ? Film : ImageIcon

  return (
    <div className="file-uploader">
      {label && <span className="file-uploader-label">{label}</span>}

      {value && !uploading ? (
        <div className="file-uploader-preview">
          {kind === 'video' ? (
            <video src={value} controls className="file-uploader-media" />
          ) : (
            <img src={value} alt="Preview" className="file-uploader-media" />
          )}
          <div className="file-uploader-actions">
            <button
              type="button"
              className="btn-ghost-small"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} /> Replace
            </button>
            <button
              type="button"
              className="btn-ghost-small"
              onClick={() => { setShowUrl(s => !s); setUrlDraft(value) }}
              disabled={uploading}
            >
              <LinkIcon size={14} /> Use URL
            </button>
            <button
              type="button"
              className="btn-ghost-small danger"
              onClick={() => onChange('')}
              disabled={uploading}
            >
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`file-uploader-drop ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={(e) => {
            if (uploading) return
            // Avoid triggering file picker when interacting with the URL toggle
            if (e.target.closest('.file-uploader-url-row')) return
            inputRef.current?.click()
          }}
          role="button"
          tabIndex={0}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="spin" />
              <span>Uploading… {progress}%</span>
              <div className="file-uploader-bar">
                <div className="file-uploader-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <Icon size={20} />
              <span>
                <strong>Click</strong> or drag a {kind} here
              </span>
              {maxSizeMB && <small>Max {maxSizeMB}MB</small>}
              <button
                type="button"
                className="btn-ghost-small"
                onClick={(e) => { e.stopPropagation(); setShowUrl(s => !s) }}
                style={{ marginTop: 8 }}
              >
                <LinkIcon size={14} /> Or paste a URL
              </button>
            </>
          )}
        </div>
      )}

      {showUrl && (
        <div className="file-uploader-url-row" style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder={kind === 'video' ? 'https://… (mp4, m3u8, etc.)' : 'https://… (image URL)'}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyUrl() } }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid var(--border, #2a2a4a)',
              background: 'var(--surface, #11112a)',
              color: 'inherit',
              fontSize: '0.9rem',
            }}
          />
          <button type="button" className="btn btn-blue" onClick={applyUrl}>
            <Check size={14} /> Use
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
