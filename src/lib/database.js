import { supabase } from './supabase'

// ===== PROFILES =====
export async function upsertProfile({ id, email, firstName, lastName }) {
  const { error } = await supabase.from('profiles').upsert({
    id,
    email,
    first_name: firstName,
    last_name: lastName,
  })
  if (error) throw error
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function checkIsAdmin(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  if (error) return false
  return data?.is_admin === true
}

// ===== PRODUCTS =====
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getFeaturedProducts(limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ===== COURSES =====
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(id)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(c => ({
    ...c,
    lesson_count: Array.isArray(c.lessons) ? c.lessons.length : 0,
    lessons: undefined,  // remove the raw lessons array from the course object
  }))
}

export async function addCourse(course) {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(id, updates) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

export async function getCourseById(id) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ===== ORDERS =====
// Manually merge profile info because there's no direct FK from
// orders.user_id to profiles.id (both reference auth.users), so PostgREST
// can't auto-resolve a `profiles(...)` embed.
export async function getOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!orders || orders.length === 0) return []

  const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]
  let profileMap = new Map()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)
    profileMap = new Map((profiles || []).map(p => [p.id, p]))
  }
  return orders.map(o => ({ ...o, profiles: profileMap.get(o.user_id) || null }))
}

export async function getOrdersForUser(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createOrder({ userId, items, total, shippingAddress, paymentId }) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      items,
      total,
      shipping_address: shippingAddress,
      payment_id: paymentId,
      status: 'confirmed',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ===== ENROLLMENTS (30-day window per enrollment) =====
// Tag rows with a derived `expired` boolean so UI can grey out finished courses.
export async function getEnrollments(userId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  const now = Date.now()
  return (data || []).map(row => ({
    ...row,
    expired: row.expires_at ? new Date(row.expires_at).getTime() <= now : false,
  }))
}

export async function getAllEnrollments() {
  // courses() embed works (real FK); profiles is merged manually.
  const { data: rows, error } = await supabase
    .from('enrollments')
    .select('*, courses(title, price, free, image)')
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  if (!rows || rows.length === 0) return []

  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))]
  let profileMap = new Map()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)
    profileMap = new Map((profiles || []).map(p => [p.id, p]))
  }
  return rows.map(r => ({ ...r, profiles: profileMap.get(r.user_id) || null }))
}

export async function addEnrollment({ userId, courseId, paymentId = null }) {
  // Bump enrolled_at on re-enrollment — the SQL trigger recomputes expires_at
  // to enrolled_at + 30 days. ignoreDuplicates: false so the row actually updates.
  const { data, error } = await supabase
    .from('enrollments')
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id', ignoreDuplicates: false }
    )
    .select()
  if (error) throw error
  return data
}

export async function isEnrolled(userId, courseId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  if (error || !data) return false
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return false
  return true
}

// Returns { enrolled, expired, expiresAt, daysLeft } so UI can show status.
export async function getEnrollmentStatus(userId, courseId) {
  const { data } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, expires_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  if (!data) return { enrolled: false, expired: false, expiresAt: null, daysLeft: null }
  const expiresAt = data.expires_at
  if (!expiresAt) return { enrolled: true, expired: false, expiresAt: null, daysLeft: null }
  const diff = new Date(expiresAt).getTime() - Date.now()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return { enrolled: diff > 0, expired: diff <= 0, expiresAt, daysLeft }
}

// ===== REVIEWS =====
// Public - returns approved reviews only (RLS enforces this for anon users)
// Profiles merged manually because reviews.user_id references auth.users,
// not profiles, so PostgREST can't auto-resolve a `profiles(...)` embed.
export async function getReviews(productId) {
  const { data: rows, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!rows || rows.length === 0) return []

  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))]
  let profileMap = new Map()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds)
    profileMap = new Map((profiles || []).map(p => [p.id, p]))
  }
  return rows.map(r => ({ ...r, profiles: profileMap.get(r.user_id) || null }))
}

// Admin only - returns ALL reviews (RLS allows admin to read unapproved)
export async function getAllReviews() {
  // products() embed works (real FK); profiles is merged manually.
  const { data: rows, error } = await supabase
    .from('reviews')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!rows || rows.length === 0) return []

  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))]
  let profileMap = new Map()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)
    profileMap = new Map((profiles || []).map(p => [p.id, p]))
  }
  return rows.map(r => ({ ...r, profiles: profileMap.get(r.user_id) || null }))
}

export async function addReview({ productId, userId, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      { product_id: productId, user_id: userId, rating, comment, approved: true },
      { onConflict: 'product_id,user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setReviewApproval(id, approved) {
  const { error } = await supabase.from('reviews').update({ approved }).eq('id', id)
  if (error) throw error
}

export async function deleteReview(id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}

// ===== LESSONS =====

// Full lesson data: only for enrolled users (CoursePlayer)
export async function getLessons(courseId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

// Public lesson list: strips video_url from non-preview lessons
// so video links are never exposed in browser DevTools for unenrolled users
export async function getLessonsPublic(courseId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, course_id, title, description, duration_seconds, position, preview, thumbnail, created_at')
    .eq('course_id', courseId)
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addLesson(lesson) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLesson(id, updates) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLesson(id) {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

export async function reorderLessons(idsInOrder) {
  // Update position for each lesson based on its index in the array
  const updates = idsInOrder.map((id, idx) =>
    supabase.from('lessons').update({ position: idx }).eq('id', id),
  )
  const results = await Promise.all(updates)
  const err = results.find((r) => r.error)
  if (err) throw err.error
}

// ===== LESSON PROGRESS =====
export async function getLessonProgress(userId, courseId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
  if (error) throw error
  return data || []
}

export async function upsertLessonProgress({ userId, lessonId, courseId, positionSeconds, completed }) {
  const payload = {
    user_id: userId,
    lesson_id: lessonId,
    course_id: courseId,
    position_seconds: Math.max(0, Math.round(positionSeconds || 0)),
    completed: !!completed,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from('lesson_progress')
    .upsert(payload, { onConflict: 'user_id,lesson_id' })
  if (error) throw error
}

// ===== COUPONS =====
export async function getCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addCoupon(c) {
  const { data, error } = await supabase
    .from('coupons')
    .insert(c)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCoupon(id, updates) {
  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
}

// ===== WISHLIST =====
export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addToWishlist(userId, productId) {
  const { error } = await supabase
    .from('wishlist')
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    )
  if (error) throw error
}

export async function removeFromWishlist(userId, productId) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

// ===== PERSISTENT CART =====
export async function getServerCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

export async function syncServerCart(userId, items) {
  // Replace the user's cart with the given items.
  const { error: delErr } = await supabase.from('cart_items').delete().eq('user_id', userId)
  if (delErr) throw delErr
  if (items.length === 0) return
  const rows = items.map((i) => ({ user_id: userId, product_id: i.id, qty: i.qty }))
  const { error } = await supabase.from('cart_items').insert(rows)
  if (error) throw error
}

// ===== CERTIFICATES =====
export async function getCertificate(userId, courseId) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  if (error) return null
  return data
}

export async function issueCertificate(userId, courseId) {
  const { data, error } = await supabase
    .from('certificates')
    .upsert(
      { user_id: userId, course_id: courseId },
      { onConflict: 'user_id,course_id', ignoreDuplicates: true },
    )
    .select()
    .single()
  if (error && error.code !== '23505') throw error
  return data
}

// ===== BLOG POSTS =====
export async function getPublishedBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image, author_name, published, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addBlogPost(post) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBlogPost(id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}

// ===== BARISTAS (CV directory) =====
export async function submitBarista(b) {
  // Insert as unapproved; admin must approve before it shows in the paid list.
  const payload = { ...b, approved: false }
  const { data, error } = await supabase
    .from('baristas')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getApprovedBaristas() {
  const { data, error } = await supabase
    .from('baristas')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllBaristas() {
  const { data, error } = await supabase
    .from('baristas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateBarista(id, updates) {
  const { data, error } = await supabase
    .from('baristas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBarista(id) {
  const { error } = await supabase.from('baristas').delete().eq('id', id)
  if (error) throw error
}

// ===== BARISTA ACCESS (paid pass — 20-day window) =====
export const CAFE_ACCESS_DAYS = 20
export const COURSE_ACCESS_DAYS = 30

// Returns { active, expiresAt, revokedAt, paidAt } or null when no record.
export async function getBaristaAccessStatus(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('barista_access')
    .select('user_id, payment_id, amount, paid_at, expires_at, revoked_at, revoked_reason')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  const now = Date.now()
  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null
  const active = !data.revoked_at && (!expiresAt || expiresAt > now)
  return {
    active,
    paidAt: data.paid_at,
    expiresAt: data.expires_at,
    revokedAt: data.revoked_at,
    revokedReason: data.revoked_reason,
    paymentId: data.payment_id,
    amount: data.amount,
  }
}

export async function hasBaristaAccess(userId) {
  const status = await getBaristaAccessStatus(userId)
  return !!status?.active
}

export async function grantBaristaAccess({ userId, paymentId, amount }) {
  // Goes through a SECURITY DEFINER RPC — the table's RLS lets users INSERT
  // their own row but not UPDATE it (so they can't clear admin's revoke).
  // The RPC handles both first-time grant and re-payment via on-conflict.
  // userId param is kept for backwards compat but ignored — the RPC reads
  // auth.uid() server-side, which is the only safe source of truth.
  void userId
  const { error } = await supabase.rpc('grant_barista_access', {
    p_payment_id: paymentId,
    p_amount: amount,
  })
  if (error) throw error
}

// Admin: revoke a cafe's access (e.g. after a successful hire). Drops their
// barista assignments too, so they can't see baristas anymore.
export async function adminRevokeCafeAccess(userId, reason = null) {
  const { error } = await supabase.rpc('admin_revoke_cafe_access', {
    p_user_id: userId,
    p_reason: reason,
  })
  if (error) throw error
}

// Helpers for UI (status pill / days-left).
export function accessStatus({ expires_at, revoked_at } = {}) {
  if (revoked_at) return { kind: 'revoked', label: 'Revoked', daysLeft: null }
  if (!expires_at) return { kind: 'active', label: 'Active', daysLeft: null }
  const diff = new Date(expires_at).getTime() - Date.now()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { kind: 'expired', label: `Expired ${Math.abs(daysLeft)}d ago`, daysLeft }
  if (daysLeft <= 5) return { kind: 'expiring', label: `${daysLeft}d left`, daysLeft }
  return { kind: 'active', label: `${daysLeft}d left`, daysLeft }
}

// ===== BARISTA ASSIGNMENTS (admin maps 5 baristas to each paid cafe) =====

export const BARISTA_SLOTS_PER_CAFE = 5

// Admin: list every cafe that has paid for directory access, joined with
// their profile, plus how many baristas are currently mapped to them.
export async function getPaidCafesWithAssignments() {
  const { data: access, error: accessErr } = await supabase
    .from('barista_access')
    .select('user_id, payment_id, amount, paid_at, expires_at, revoked_at, revoked_reason')
    .order('paid_at', { ascending: false })
  if (accessErr) throw accessErr
  if (!access || access.length === 0) return []

  const userIds = access.map(a => a.user_id)

  const [{ data: profiles }, { data: assignments }, { data: briefs }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds),
    supabase.from('barista_assignments').select('id, cafe_user_id, barista_id, assigned_at').in('cafe_user_id', userIds),
    supabase.from('cafe_briefs').select('*').in('user_id', userIds),
  ])

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))
  const briefMap = new Map((briefs || []).map(b => [b.user_id, b]))
  const assignmentsByCafe = new Map()
  for (const a of assignments || []) {
    if (!assignmentsByCafe.has(a.cafe_user_id)) assignmentsByCafe.set(a.cafe_user_id, [])
    assignmentsByCafe.get(a.cafe_user_id).push(a)
  }

  return access.map(a => ({
    ...a,
    profile: profileMap.get(a.user_id) || null,
    brief: briefMap.get(a.user_id) || null,
    assignments: assignmentsByCafe.get(a.user_id) || [],
  }))
}

// Admin: replace the full set of barista assignments for a single cafe.
export async function setBaristaAssignmentsForCafe(cafeUserId, baristaIds) {
  if (baristaIds.length > BARISTA_SLOTS_PER_CAFE) {
    throw new Error(`A cafe can only be mapped to ${BARISTA_SLOTS_PER_CAFE} baristas at most.`)
  }
  const { error: delErr } = await supabase
    .from('barista_assignments')
    .delete()
    .eq('cafe_user_id', cafeUserId)
  if (delErr) throw delErr

  if (baristaIds.length === 0) return []

  const rows = baristaIds.map(barista_id => ({ cafe_user_id: cafeUserId, barista_id }))
  const { data, error } = await supabase
    .from('barista_assignments')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

// Cafe view: returns only the baristas explicitly mapped to the current user.
// We query through barista_assignments so the result is correct even when
// the caller is also an admin (whose RLS would otherwise let them read every
// approved barista).
export async function getMyAssignedBaristas() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('barista_assignments')
    .select('assigned_at, baristas(*)')
    .eq('cafe_user_id', user.id)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return (data || [])
    .map(row => row.baristas)
    .filter(b => b && b.approved && !b.hired_at)
}

// Cafe action: mark a barista as hired. Server-side RPC verifies the caller
// is mapped to this barista, sets hired_at, then removes the barista's
// assignments so no other cafe sees them.
export async function markBaristaHired(baristaId) {
  const { error } = await supabase.rpc('mark_barista_hired', { p_barista_id: baristaId })
  if (error) throw error
}

// ===== CAFE BRIEFS (what kind of barista a paid cafe needs) =====
export const SHIFT_TYPES = [
  { id: 'morning',   label: 'Morning shift' },
  { id: 'evening',   label: 'Evening shift' },
  { id: 'full_time', label: 'Full-time' },
  { id: 'part_time', label: 'Part-time' },
  { id: 'any',       label: 'Any / flexible' },
]

export async function getMyCafeBrief() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('cafe_briefs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertCafeBrief(brief) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const payload = {
    user_id: user.id,
    city: brief.city?.trim() || null,
    shift_type: brief.shift_type || null,
    min_experience_years: Number.isFinite(parseInt(brief.min_experience_years))
      ? parseInt(brief.min_experience_years)
      : 0,
    budget_monthly: brief.budget_monthly === '' || brief.budget_monthly == null
      ? null
      : parseInt(brief.budget_monthly),
    notes: brief.notes?.trim() || null,
  }
  const { data, error } = await supabase
    .from('cafe_briefs')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}
