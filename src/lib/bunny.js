/**
 * Bunny.net Stream embed URL generator.
 *
 * How it works:
 *   1. Admin uploads a video to Bunny.net Stream dashboard.
 *   2. Admin pastes the Video ID (UUID) OR the full Bunny player/embed URL
 *      into the lesson editor.
 *   3. This module detects Bunny videos and generates embed URLs.
 *      If token auth is enabled, URLs are signed and time-limited.
 *
 * Accepted input formats:
 *   - Bare UUID:  33c9207c-aef5-4bb9-bdda-7f603636e639
 *   - Player URL: https://player.mediadelivery.net/play/647885/33c9207c-...
 *   - Embed URL:  https://iframe.mediadelivery.net/embed/647885/33c9207c-...
 *   - CDN URL:    https://vz-263567c0-2db.b-cdn.net/33c9207c-.../play_...
 *
 * Required env vars (set in .env):
 *   VITE_BUNNY_LIBRARY_ID       (numeric library ID)
 *
 * Optional env vars (for signed/expiring URLs):
 *   VITE_BUNNY_TOKEN_KEY        (token auth security key, enable in Bunny
 *                                library > Security > Token Authentication)
 */

const LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || ''
const TOKEN_KEY  = import.meta.env.VITE_BUNNY_TOKEN_KEY || ''

// Bunny embeds always use this host
const EMBED_HOST = 'iframe.mediadelivery.net'

// Patterns for full Bunny URLs
const BUNNY_URL_PATTERNS = [
  /mediadelivery\.net\/(?:play|embed)\/\d+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  /b-cdn\.net\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
]

/**
 * Extract the Bunny Video ID (UUID) from a string.
 * Accepts bare UUIDs or full Bunny player/embed/CDN URLs.
 * Returns null if not a Bunny video.
 */
export function extractBunnyVideoId(url) {
  if (!url) return null
  const trimmed = url.trim()

  // Check full Bunny URLs first
  for (const pattern of BUNNY_URL_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }

  // Check bare UUID
  const uuidMatch = trimmed.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
  if (uuidMatch) return uuidMatch[1]

  return null
}

/**
 * Returns true if the given string is a Bunny Stream video
 * (bare UUID or full Bunny URL).
 */
export function isBunnyVideo(url) {
  if (!url || !LIBRARY_ID) return false
  return !!extractBunnyVideoId(url)
}

/**
 * Check whether Bunny.net Stream is configured (at minimum, library ID is set).
 */
export function isBunnyConfigured() {
  return !!LIBRARY_ID
}

/**
 * Generate a Bunny.net Stream embed URL.
 *
 * If VITE_BUNNY_TOKEN_KEY is set, generates a signed, time-limited URL.
 * Otherwise, generates an unsigned embed URL (works if token auth is
 * disabled in the Bunny library settings).
 *
 * @param {string} videoIdOrUrl  Bunny Video ID (UUID) or full Bunny URL
 * @param {number} [ttlSeconds=14400]  token lifetime (default 4 hours)
 * @returns {Promise<string>}  embed URL
 */
export async function getBunnyEmbedUrl(videoIdOrUrl, ttlSeconds = 14400) {
  if (!LIBRARY_ID) {
    console.warn('Bunny.net Stream not configured. Set VITE_BUNNY_LIBRARY_ID.')
    return ''
  }

  const videoId = extractBunnyVideoId(videoIdOrUrl)
  if (!videoId) {
    console.warn('Could not extract Bunny Video ID from:', videoIdOrUrl)
    return ''
  }

  const baseUrl = `https://${EMBED_HOST}/embed/${LIBRARY_ID}/${videoId}`

  // If no token key is configured, return unsigned URL
  if (!TOKEN_KEY) {
    return baseUrl
  }

  // Generate signed URL with token authentication
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds
  const data = TOKEN_KEY + videoId + expires
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return `${baseUrl}?token=${token}&expires=${expires}`
}
