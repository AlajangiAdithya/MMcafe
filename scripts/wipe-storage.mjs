// ============================================================================
// ⚠️  WIPE STORAGE  —  permanently deletes EVERY file in the app's buckets.
// ============================================================================
// Empties the five storage buckets through the Storage API, which removes the
// real files (and their metadata) so the space is actually reclaimed. Run this
// BEFORE reset_database.sql.
//
// Needs the SERVICE ROLE key (NOT the anon key) — it bypasses RLS so it can see
// and delete every user's uploads. Get it from:
//   Dashboard → Project Settings → API → service_role secret.
//
// Usage (PowerShell):
//   $env:SUPABASE_URL="https://<ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
//   node scripts/wipe-storage.mjs
//
// Usage (bash):
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
//   node scripts/wipe-storage.mjs
// ============================================================================
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('✗ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const BUCKETS = [
  'product-images',
  'course-thumbnails',
  'course-videos',
  'book-covers',
  'course-books',
]

// Files are stored as <userId>/<file>, so we recurse one level into folders.
async function listAllPaths(bucket, prefix = '') {
  const paths = []
  const limit = 100
  let offset = 0
  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    if (!data || data.length === 0) break
    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.id === null) {
        // Folder placeholder → descend into it.
        paths.push(...(await listAllPaths(bucket, full)))
      } else {
        paths.push(full)
      }
    }
    if (data.length < limit) break
    offset += limit
  }
  return paths
}

let grandTotal = 0
for (const bucket of BUCKETS) {
  try {
    const paths = await listAllPaths(bucket)
    if (paths.length === 0) {
      console.log(`• ${bucket}: already empty`)
      continue
    }
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await supabase.storage.from(bucket).remove(paths.slice(i, i + 100))
      if (error) throw error
    }
    grandTotal += paths.length
    console.log(`✓ ${bucket}: removed ${paths.length} file(s)`)
  } catch (e) {
    console.error(`✗ ${bucket}: ${e?.message || e}`)
  }
}
console.log(`\nDone. ${grandTotal} file(s) removed across ${BUCKETS.length} buckets.`)
