// Supabase Edge Function: book-download
// Issues a SHORT-LIVED signed URL for a purchased book's private PDF.
//
// Security model (mirrors payment-verify):
//   1. Verify the caller's JWT -> resolve the user.
//   2. Using the service role, confirm the user has a row in book_purchases
//      for this book. No purchase -> 403 (the file path is never revealed).
//   3. Sign the private object for ~2 minutes and return the URL.
//
// The `course-books` bucket is PRIVATE, so the signed URL is the only way to
// reach the file, and it expires quickly. Buyers always get a fresh link from
// My Library, so a leaked link is useless within minutes.
//
// Deploy:  supabase functions deploy book-download --no-verify-jwt
// (JWT is verified manually below; the service role does the privileged reads.)

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })

const BUCKET = 'course-books'
const TTL_SECONDS = 120

function safeFileName(title: string) {
  const base = (title || 'book')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'book'
  return `${base}.pdf`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const SUPA_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPA_ANON = Deno.env.get('SUPABASE_ANON_KEY')!

    const auth = req.headers.get('Authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Missing auth' }, 401)

    const userClient = createClient(SUPA_URL, SUPA_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData } = await userClient.auth.getUser()
    if (!userData.user) return json({ error: 'Invalid auth' }, 401)
    const user = userData.user

    const body = await req.json().catch(() => ({}))
    const bookId = Number((body as any).bookId)
    if (!bookId) return json({ error: 'Missing bookId' }, 400)

    const admin = createClient(SUPA_URL, SUPA_SERVICE)

    // 1) Verify the purchase server-side.
    const { data: purchase, error: pErr } = await admin
      .from('book_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .maybeSingle()
    if (pErr) return json({ error: pErr.message }, 500)
    if (!purchase) return json({ error: 'You have not purchased this book' }, 403)

    // 2) Look up the private file path.
    const { data: book, error: bErr } = await admin
      .from('books')
      .select('title, pdf_path')
      .eq('id', bookId)
      .single()
    if (bErr || !book) return json({ error: 'Book not found' }, 404)
    if (!book.pdf_path) return json({ error: 'This book has no file attached yet' }, 409)

    // 3) Sign the private object for a short window.
    const { data: signed, error: sErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(book.pdf_path, TTL_SECONDS, { download: safeFileName(book.title) })
    if (sErr || !signed?.signedUrl) {
      return json({ error: sErr?.message || 'Could not sign the file' }, 500)
    }

    return json({ url: signed.signedUrl, expiresIn: TTL_SECONDS })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
