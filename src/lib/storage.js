import { supabase } from './supabase'

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file'

/**
 * Upload a File to a Supabase Storage bucket and return its public URL.
 * Path layout: <userId|anon>/<timestamp>-<slug>
 *
 * @param {string} bucket  bucket id (e.g. 'product-images')
 * @param {File}   file    browser File object
 * @param {object} [opts]
 * @param {string} [opts.userId]    used for the folder prefix
 * @param {(pct:number)=>void} [opts.onProgress]  optional progress callback (0-100)
 */
export async function uploadFile(bucket, file, { userId = 'anon', onProgress } = {}) {
  if (!file) throw new Error('No file provided')

  const path = `${userId}/${Date.now()}-${slug(file.name)}`

  // Supabase JS v2 doesn't expose upload progress directly; emit synthetic progress
  // so the UI doesn't feel frozen on large videos.
  let progressTimer
  if (onProgress) {
    let pct = 5
    onProgress(pct)
    progressTimer = setInterval(() => {
      pct = Math.min(pct + 7, 90)
      onProgress(pct)
    }, 400)
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (progressTimer) clearInterval(progressTimer)
  if (onProgress) onProgress(100)

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

/**
 * Upload a File to a PRIVATE Supabase Storage bucket and return only its
 * storage path (never a public URL — the bucket isn't public).
 *
 * Used for paid digital goods (e.g. book PDFs) that must never be reachable
 * by a guessable public link. The stored path is later turned into a
 * short-lived signed URL by the `book-download` edge function, but only after
 * a purchase is verified server-side.
 *
 * @param {string} bucket  private bucket id (e.g. 'course-books')
 * @param {File}   file    browser File object
 * @param {object} [opts]
 * @param {string} [opts.userId]    used for the folder prefix
 * @param {(pct:number)=>void} [opts.onProgress]  optional progress callback (0-100)
 * @returns {Promise<{ path: string }>}
 */
export async function uploadFilePrivate(bucket, file, { userId = 'anon', onProgress } = {}) {
  if (!file) throw new Error('No file provided')

  const path = `${userId}/${Date.now()}-${slug(file.name)}`

  let progressTimer
  if (onProgress) {
    let pct = 5
    onProgress(pct)
    progressTimer = setInterval(() => {
      pct = Math.min(pct + 7, 90)
      onProgress(pct)
    }, 400)
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (progressTimer) clearInterval(progressTimer)
  if (onProgress) onProgress(100)

  if (error) throw error

  // Deliberately NO getPublicUrl: the bucket is private, so we persist the
  // path and sign it on demand for verified buyers only.
  return { path }
}

/**
 * Resolve a stored value into the object path *inside `bucket`*, or null when
 * the value isn't a deletable object in that bucket. Handles every shape a
 * file field can hold:
 *   - a public URL for this bucket  → the object path after the bucket marker
 *   - any other absolute URL        → null (external video host, signed URL,
 *                                      a different bucket — not ours to delete)
 *   - a bare token with no slash     → null (e.g. a Bunny video ID, not a path)
 *   - a bare storage path (priv.)    → used as-is (e.g. "userId/123-file.pdf")
 */
function storagePathFor(bucket, value) {
  if (!value || typeof value !== 'string') return null
  const v = value.trim()
  if (!v) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = v.indexOf(marker)
  if (idx !== -1) return decodeURIComponent(v.substring(idx + marker.length))
  if (/^https?:\/\//i.test(v)) return null
  if (!v.includes('/')) return null
  return v
}

/**
 * Delete a file from a bucket. Pass either the storage path or a public URL.
 * No-ops when the value isn't an object in this bucket (external URL, etc.).
 */
export async function deleteFile(bucket, pathOrUrl) {
  const path = storagePathFor(bucket, pathOrUrl)
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/**
 * Best-effort removal of many storage objects at once, used when a catalog row
 * (product / course / book / lesson) is deleted so its images, videos and PDFs
 * don't linger in storage and waste space.
 *
 * Pass a list of { bucket, value } pairs; empties, external URLs and bare IDs
 * are skipped automatically. This NEVER throws — orphaned-file cleanup must not
 * undo or block the DB delete that triggered it, so failures are logged only.
 *
 * @param {Array<{bucket: string, value: string}>} items
 */
export async function deleteStorageFiles(items = []) {
  // Group paths per bucket so each bucket needs only one remove() round-trip.
  const byBucket = new Map()
  for (const { bucket, value } of items) {
    const path = storagePathFor(bucket, value)
    if (!path) continue
    if (!byBucket.has(bucket)) byBucket.set(bucket, [])
    byBucket.get(bucket).push(path)
  }
  await Promise.all(
    [...byBucket.entries()].map(async ([bucket, paths]) => {
      try {
        const { error } = await supabase.storage.from(bucket).remove(paths)
        if (error) console.warn(`[storage] could not remove from ${bucket}:`, error.message)
      } catch (e) {
        console.warn(`[storage] remove threw for ${bucket}:`, e?.message || e)
      }
    }),
  )
}
