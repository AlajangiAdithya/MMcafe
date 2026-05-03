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
 * Delete a file from a bucket. Pass either the storage path or a public URL.
 */
export async function deleteFile(bucket, pathOrUrl) {
  if (!pathOrUrl) return
  let path = pathOrUrl
  // Extract path from public URL if needed
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = pathOrUrl.indexOf(marker)
  if (idx !== -1) path = pathOrUrl.substring(idx + marker.length)
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
