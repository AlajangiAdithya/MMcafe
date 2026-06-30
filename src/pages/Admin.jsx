import { Fragment, useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Video, Users, ShoppingBag, Star,
  Plus, Pencil, Trash2, X, Save, Eye, EyeOff,
  DollarSign, UserCheck, Coffee, Search, ChevronLeft, ChevronRight,
  Check, XCircle, Tag, Download, TrendingUp, Home, LogOut, RefreshCw,
  GraduationCap, ChevronDown, ChevronUp, BookOpen, Image as ImageIcon,
  Newspaper, Building2, Link2, MapPin, Phone, Mail, AlertCircle, Briefcase,
  ClipboardList, Clock, Wallet, Library, FileText,
} from 'lucide-react'
import {
  getProducts, addProduct, updateProduct, deleteProduct,
  getCourses, addCourse, updateCourse, deleteCourse,
  getBooksAdmin, addBook, updateBook, deleteBook,
  getProfiles, getOrders, updateOrderStatus,
  getAllReviews, setReviewApproval, deleteReview,
  getCoupons, addCoupon, updateCoupon, deleteCoupon,
  getAllEnrollments, getLessons,
  getAllBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
  getAllBaristas, updateBarista, deleteBarista,
  getPaidCafesWithAssignments, setBaristaAssignmentsForCafe, BARISTA_SLOTS_PER_CAFE,
  SHIFT_TYPES, adminRevokeCafeAccess, accessStatus, CAFE_ACCESS_DAYS, COURSE_ACCESS_DAYS,
} from '../lib/database'
import FileUploader from '../components/FileUploader'
import LessonsEditor from '../components/LessonsEditor'
import { confirmAction } from '../components/ConfirmDialog'
import { isBunnyVideo, isBunnyConfigured } from '../lib/bunny'
import { sendOrderStatusEmail } from '../lib/email'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'courses', label: 'Courses', icon: Video },
  { id: 'books', label: 'Books', icon: Library },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'blog', label: 'Blog', icon: Newspaper },
  { id: 'baristas', label: 'Baristas', icon: UserCheck },
  { id: 'mappings', label: 'Cafe Mappings', icon: Link2 },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users', icon: Users },
]

const ORDER_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const fullName = (p, fallback = '-') => {
  if (!p) return fallback
  const name = `${p.first_name || ''} ${p.last_name || ''}`.trim()
  return name || p.email || fallback
}

const EMPTY_PRODUCT = { name: '', price: '', category: 'beans', weight: '', image: '', description: '', in_stock: true, stock_quantity: '', is_featured: false }
const EMPTY_COURSE = { title: '', description: '', price: '', duration: '', rating: '4.5', level: 'Beginner', image: '', video_url: '', free: false }
const EMPTY_BOOK = { title: '', description: '', price: '', author: '', pages: '', cover_image: '', pdf_path: '', free: false }
const EMPTY_COUPON = { code: '', description: '', discount_type: 'percent', discount_value: '', min_order_total: '', max_uses: '', active: true, expires_at: '' }
const EMPTY_BLOG = { slug: '', title: '', excerpt: '', cover_image: '', content: '', author_name: '', published: false }

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [courses, setCourses] = useState([])
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [coupons, setCoupons] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [baristas, setBaristas] = useState([])
  const [paidCafes, setPaidCafes] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Modal state
  const [modal, setModal] = useState(null) // { type, mode, data }

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (!isAdmin) {
      // Wait a brief moment in case isAdmin is still being checked async,
      // then bail out if still not admin.
      const t = setTimeout(() => navigate('/', { replace: true }), 600)
      return () => clearTimeout(t)
    }
    loadData()
  }, [user, isAdmin, loading, navigate])

  const loadData = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true)
    else setDataLoading(true)
    try {
      const reportFail = (label) => (err) => {
        console.error(`[Admin] failed to load ${label}:`, err)
        toast.error(`Could not load ${label}: ${err?.message || 'unknown error'}`)
        return []
      }
      const [p, c, bk, u, o, r, cp, en, bp, bs, pc] = await Promise.all([
        getProducts().catch(reportFail('products')),
        getCourses().catch(reportFail('courses')),
        getBooksAdmin().catch(reportFail('books')),
        getProfiles().catch(reportFail('users')),
        getOrders().catch(reportFail('orders')),
        getAllReviews().catch(reportFail('reviews')),
        getCoupons().catch(reportFail('coupons')),
        getAllEnrollments().catch(reportFail('enrollments')),
        getAllBlogPosts().catch(reportFail('blog posts')),
        getAllBaristas().catch(reportFail('baristas')),
        getPaidCafesWithAssignments().catch(reportFail('paid cafes')),
      ])
      setProducts(p)
      setCourses(c)
      setBooks(bk)
      setUsers(u)
      setOrders(o)
      setReviews(r)
      setCoupons(cp)
      setEnrollments(en)
      setBlogPosts(bp)
      setBaristas(bs)
      setPaidCafes(pc)
    } finally {
      setDataLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>
  if (!user || !isAdmin) return null

  // ===== HANDLERS =====
  const handleSaveProduct = async (formData) => {
    const stockQty = parseInt(formData.stock_quantity) || 0
    const payload = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      weight: formData.weight,
      image: formData.image,
      description: formData.description,
      stock_quantity: stockQty,
      in_stock: stockQty > 0,
      is_featured: !!formData.is_featured,
    }
    try {
      if (modal.mode === 'edit') {
        await updateProduct(modal.data.id, payload)
        toast.success('Product updated')
      } else {
        await addProduct(payload)
        toast.success('Product added')
      }
      setModal(null)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleFeatured = async (product) => {
    const next = !product.is_featured
    if (next) {
      const featuredCount = products.filter(p => p.is_featured && p.id !== product.id).length
      if (featuredCount >= 4) {
        toast.error('Only 4 products can be featured on the home page. Unfeature one first.')
        return
      }
    }
    try {
      await updateProduct(product.id, { is_featured: next })
      toast.success(next ? 'Added to homepage' : 'Removed from homepage')
      loadData({ silent: true })
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteProduct = async (id) => {
    const ok = await confirmAction({
      title: 'Delete product?',
      message: 'This permanently removes the product from the store. Existing orders keep their snapshot.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSaveCourse = async (formData) => {
    const payload = {
      title: formData.title,
      description: formData.description,
      price: formData.free ? 0 : (parseInt(formData.price) || 0),
      duration: formData.duration,
      rating: parseFloat(formData.rating) || 4.5,
      level: formData.level,
      image: formData.image,
      video_url: formData.video_url,
      free: formData.free,
    }
    try {
      if (modal.mode === 'edit') {
        await updateCourse(modal.data.id, payload)
        toast.success('Course updated')
      } else {
        await addCourse(payload)
        toast.success('Course added')
      }
      setModal(null)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteCourse = async (id) => {
    const ok = await confirmAction({
      title: 'Delete course?',
      message: 'This removes the course and all its lessons. Students who already enrolled keep nothing.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteCourse(id)
      toast.success('Course deleted')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSaveBook = async (formData) => {
    if (!formData.pdf_path) {
      toast.error('Upload the book PDF before saving')
      return
    }
    const payload = {
      title: formData.title,
      description: formData.description,
      price: formData.free ? 0 : (parseInt(formData.price) || 0),
      author: formData.author?.trim() || null,
      pages: parseInt(formData.pages) || null,
      cover_image: formData.cover_image || null,
      pdf_path: formData.pdf_path,
      free: !!formData.free,
    }
    try {
      if (modal.mode === 'edit') {
        await updateBook(modal.data.id, payload)
        toast.success('Book updated')
      } else {
        await addBook(payload)
        toast.success('Book added')
      }
      setModal(null)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteBook = async (id) => {
    const ok = await confirmAction({
      title: 'Delete book?',
      message: 'This removes the book from the Academy. Buyers will lose access to the download.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteBook(id)
      toast.success('Book deleted')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleOrderStatusChange = async (orderId, status) => {
    const existing = orders.find(o => o.id === orderId)
    const previousStatus = existing?.status
    // Optimistic UI
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    try {
      await updateOrderStatus(orderId, status)
      toast.success(`Order #${orderId} → ${status}`)
      // Fire-and-forget customer notification, only when the status actually
      // changed. sendOrderStatusEmail silently no-ops when EmailJS isn't set up.
      if (existing && previousStatus !== status) {
        const email = existing.shipping_address?.email || existing.profiles?.email
        const name = existing.shipping_address?.fullName
          || `${existing.profiles?.first_name || ''} ${existing.profiles?.last_name || ''}`.trim()
        if (email) {
          sendOrderStatusEmail({
            order: { ...existing, status },
            status,
            customerEmail: email,
            customerName: name,
          })
        }
      }
    } catch (err) {
      toast.error(err.message)
      loadData()
    }
  }

  const handleReviewApproval = async (id, approved) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r))
    try {
      await setReviewApproval(id, approved)
      toast.success(approved ? 'Review approved' : 'Review hidden')
    } catch (err) {
      toast.error(err.message)
      loadData()
    }
  }

  const handleReviewDelete = async (id) => {
    const ok = await confirmAction({
      title: 'Delete review?',
      message: 'The reviewer will no longer see it. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteReview(id)
      toast.success('Review deleted')
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ===== COUPON HANDLERS =====
  const handleSaveCoupon = async (formData) => {
    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseInt(formData.discount_value) || 0,
      min_order_total: parseInt(formData.min_order_total) || 0,
      max_uses: formData.max_uses === '' ? null : parseInt(formData.max_uses),
      active: !!formData.active,
      expires_at: formData.expires_at || null,
    }
    try {
      if (modal.mode === 'edit') {
        await updateCoupon(modal.data.id, payload)
        toast.success('Coupon updated')
      } else {
        await addCoupon(payload)
        toast.success('Coupon added')
      }
      setModal(null)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteCoupon = async (id) => {
    const ok = await confirmAction({
      title: 'Delete coupon?',
      message: 'Anyone who has the code will no longer be able to redeem it.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteCoupon(id)
      toast.success('Coupon deleted')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ===== BLOG HANDLERS =====
  const handleSaveBlog = async (formData) => {
    const slug = (formData.slug && formData.slug.trim()) || slugify(formData.title)
    if (!slug) {
      toast.error('A title or slug is required')
      return
    }
    const payload = {
      slug,
      title: formData.title.trim(),
      excerpt: formData.excerpt?.trim() || null,
      cover_image: formData.cover_image || null,
      content: formData.content || '',
      author_name: formData.author_name?.trim() || null,
      published: !!formData.published,
    }
    try {
      if (modal.mode === 'edit') {
        await updateBlogPost(modal.data.id, payload)
        toast.success('Post updated')
      } else {
        await addBlogPost(payload)
        toast.success('Post created')
      }
      setModal(null)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteBlog = async (id) => {
    const ok = await confirmAction({
      title: 'Delete blog post?',
      message: 'The post will be removed and any inbound links will 404.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteBlogPost(id)
      toast.success('Post deleted')
      setBlogPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleTogglePublish = async (post) => {
    const next = !post.published
    setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: next } : p))
    try {
      await updateBlogPost(post.id, { published: next })
      toast.success(next ? 'Published' : 'Unpublished')
    } catch (err) {
      toast.error(err.message)
      loadData()
    }
  }

  // ===== BARISTA HANDLERS =====
  const handleApproveBarista = async (b, approved) => {
    setBaristas(prev => prev.map(x => x.id === b.id ? { ...x, approved } : x))
    try {
      await updateBarista(b.id, { approved })
      toast.success(approved ? 'Barista approved' : 'Barista hidden')
    } catch (err) {
      toast.error(err.message)
      loadData()
    }
  }

  const handleDeleteBarista = async (id) => {
    const ok = await confirmAction({
      title: 'Delete barista submission?',
      message: 'Their profile will be removed from the directory.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteBarista(id)
      toast.success('Submission deleted')
      setBaristas(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ===== ASSIGNMENT HANDLERS =====
  const handleSaveAssignments = async (cafeUserId, baristaIds) => {
    try {
      await setBaristaAssignmentsForCafe(cafeUserId, baristaIds)
      toast.success(`Saved ${baristaIds.length} of ${BARISTA_SLOTS_PER_CAFE} assignments`)
      setModal(null)
      loadData({ silent: true })
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRevokeCafeAccess = async (cafe) => {
    const cafeName = [cafe.profile?.first_name, cafe.profile?.last_name].filter(Boolean).join(' ') || cafe.profile?.email || 'this cafe'
    const reason = await confirmAction({
      title: `Revoke access for ${cafeName}?`,
      message:
        "This removes their directory access immediately, drops their barista assignments, " +
        "and they'll have to pay again to come back.",
      confirmLabel: 'Revoke access',
      danger: true,
      input: true,
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'e.g. hire confirmed, 20 days passed',
      inputDefaultValue: 'hire confirmed',
    })
    if (reason === null) return
    try {
      await adminRevokeCafeAccess(cafe.user_id, reason || null)
      toast.success(`Access revoked for ${cafeName}`)
      loadData({ silent: true })
    } catch (err) {
      toast.error(err.message || 'Could not revoke access')
    }
  }

  // ===== ASSIGNMENT COUNTS (per barista, used by assign modal) =====
  const baristaAssignmentCounts = useMemo(() => {
    const m = new Map()
    for (const c of paidCafes) {
      for (const a of c.assignments) {
        m.set(a.barista_id, (m.get(a.barista_id) || 0) + 1)
      }
    }
    return m
  }, [paidCafes])

  // ===== STATS =====
  // A paid enrollment is one with a payment_id set; price comes from the embedded course row.
  const productRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const courseRevenue = enrollments.reduce((s, e) => {
    if (!e.payment_id) return s
    return s + Number(e.courses?.price || 0)
  }, 0)
  const totalRevenue = productRevenue + courseRevenue

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Coffee size={22} />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-item"
            onClick={() => loadData({ silent: true })}
            disabled={refreshing}
            title="Reload all data"
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          <Link to="/" className="admin-nav-item">
            <Home size={18} />
            <span>Back to Site</span>
          </Link>
          <button className="admin-nav-item" onClick={signOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {dataLoading ? (
          <div className="admin-loading">
            <span className="spinner" /> Loading data...
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <DashboardTab
                products={products}
                courses={courses}
                books={books}
                users={users}
                orders={orders}
                reviews={reviews}
                enrollments={enrollments}
                productRevenue={productRevenue}
                courseRevenue={courseRevenue}
                totalRevenue={totalRevenue}
              />
            )}
            {tab === 'products' && (
              <ProductsTab
                products={products}
                onAdd={() => setModal({ type: 'product', mode: 'add', data: { ...EMPTY_PRODUCT } })}
                onEdit={(p) => setModal({ type: 'product', mode: 'edit', data: { ...p } })}
                onDelete={handleDeleteProduct}
                onToggleFeatured={handleToggleFeatured}
              />
            )}
            {tab === 'courses' && (
              <CoursesTab
                courses={courses}
                onAdd={() => setModal({ type: 'course', mode: 'add', data: { ...EMPTY_COURSE } })}
                onEdit={(c) => setModal({ type: 'course', mode: 'edit', data: { ...c } })}
                onManageLessons={(c) => setModal({ type: 'lessons', data: c })}
                onDelete={handleDeleteCourse}
              />
            )}
            {tab === 'books' && (
              <BooksTab
                books={books}
                onAdd={() => setModal({ type: 'book', mode: 'add', data: { ...EMPTY_BOOK } })}
                onEdit={(b) => setModal({ type: 'book', mode: 'edit', data: { ...b } })}
                onDelete={handleDeleteBook}
              />
            )}
            {tab === 'orders' && (
              <OrdersTab orders={orders} onStatusChange={handleOrderStatusChange} />
            )}
            {tab === 'enrollments' && (
              <EnrollmentsTab enrollments={enrollments} />
            )}
            {tab === 'coupons' && (
              <CouponsTab
                coupons={coupons}
                onAdd={() => setModal({ type: 'coupon', mode: 'add', data: { ...EMPTY_COUPON } })}
                onEdit={(c) => setModal({
                  type: 'coupon', mode: 'edit',
                  data: {
                    ...c,
                    expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
                    max_uses: c.max_uses ?? '',
                  },
                })}
                onDelete={handleDeleteCoupon}
              />
            )}
            {tab === 'reviews' && (
              <ReviewsTab
                reviews={reviews}
                onApproval={handleReviewApproval}
                onDelete={handleReviewDelete}
              />
            )}
            {tab === 'blog' && (
              <BlogTab
                posts={blogPosts}
                onAdd={() => setModal({ type: 'blog', mode: 'add', data: { ...EMPTY_BLOG } })}
                onEdit={(p) => setModal({ type: 'blog', mode: 'edit', data: { ...p } })}
                onDelete={handleDeleteBlog}
                onTogglePublish={handleTogglePublish}
              />
            )}
            {tab === 'baristas' && (
              <BaristasTab
                baristas={baristas}
                onApprove={handleApproveBarista}
                onDelete={handleDeleteBarista}
                onView={(b) => setModal({ type: 'barista-view', data: b })}
              />
            )}
            {tab === 'payments' && (
              <PaymentsTab orders={orders} enrollments={enrollments} paidCafes={paidCafes} />
            )}
            {tab === 'mappings' && (
              <MappingsTab
                paidCafes={paidCafes}
                baristas={baristas}
                onManage={(cafe) => setModal({ type: 'assignments', mode: 'edit', data: cafe })}
                onRevoke={handleRevokeCafeAccess}
              />
            )}
            {tab === 'users' && <UsersTab users={users} />}
          </>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            {modal.type === 'product' && (
              <ProductForm
                data={modal.data}
                mode={modal.mode}
                onSave={handleSaveProduct}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'course' && (
              <CourseForm
                data={modal.data}
                mode={modal.mode}
                onSave={handleSaveCourse}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'book' && (
              <BookForm
                data={modal.data}
                mode={modal.mode}
                onSave={handleSaveBook}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'coupon' && (
              <CouponForm
                data={modal.data}
                mode={modal.mode}
                onSave={handleSaveCoupon}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'blog' && (
              <BlogForm
                data={modal.data}
                mode={modal.mode}
                onSave={handleSaveBlog}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'assignments' && (
              <AssignBaristasForm
                cafe={modal.data}
                baristas={baristas}
                counts={baristaAssignmentCounts}
                onSave={handleSaveAssignments}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'barista-view' && (
              <BaristaDetailsModal
                barista={modal.data}
                onClose={() => setModal(null)}
              />
            )}
            {modal.type === 'lessons' && (
              <div>
                <div className="admin-modal-header">
                  <h2>Lessons -{modal.data.title}</h2>
                  <button type="button" onClick={() => setModal(null)} className="icon-btn">
                    <X size={20} />
                  </button>
                </div>
                <div className="admin-modal-body">
                  <LessonsEditor courseId={modal.data.id} />
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-blue" onClick={() => setModal(null)}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Pagination + Search hook =====
function useTableControls(rows, searchKeys) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(row =>
      searchKeys.some(k => {
        const v = k.split('.').reduce((acc, key) => acc?.[key], row)
        return String(v ?? '').toLowerCase().includes(q)
      })
    )
  }, [rows, search, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  // Auto-clamp the displayed page if filters/sizes shrink the result set
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // setSearchAndReset / setPageSizeAndReset wrap setters so we never need a
  // setState-in-effect to reset pagination on filter/size changes.
  const setSearchAndReset = (v) => { setSearch(v); setPage(1) }
  const setPageSizeAndReset = (v) => { setPageSize(v); setPage(1) }

  return {
    search,
    setSearch: setSearchAndReset,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    slice,
    total: filtered.length,
    totalPages,
  }
}

function TableToolbar({ search, setSearch, pageSize, setPageSize, placeholder, children }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-search">
        <Search size={14} />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {children}
      <div className="admin-toolbar-spacer" />
      <label className="admin-pagesize">
        Rows:
        <select value={pageSize} onChange={e => setPageSize(parseInt(e.target.value))}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  )
}

function Pager({ page, setPage, totalPages, total }) {
  if (total === 0) {
    return <div className="admin-pager admin-pager-empty">No results match your filters.</div>
  }
  return (
    <div className="admin-pager">
      <span className="admin-pager-info">{total} result{total === 1 ? '' : 's'} • Page {page} of {totalPages}</span>
      <div className="admin-pager-buttons">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="admin-pager-btn">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="admin-pager-btn">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ===== DASHBOARD TAB =====
function DashboardTab({
  products, courses, books = [], users, orders, reviews, enrollments,
  productRevenue, courseRevenue, totalRevenue,
}) {
  const paidEnrollments = enrollments.filter(e => !!e.payment_id)
  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCheck, color: '#4A90D9' },
    { label: 'Products', value: products.length, icon: Package, color: '#3AAA3A' },
    { label: 'Courses', value: courses.length, icon: Video, color: '#D4647A' },
    { label: 'Books', value: books.length, icon: Library, color: '#B88E2F' },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, color: '#F2A73B' },
  ]

  // Build last-14-days revenue series with separate product / course bands.
  const series = useMemo(() => {
    const days = 14
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (days - 1 - i))
      return { date: d, products: 0, courses: 0, total: 0 }
    })
    const idxOf = (when) => {
      const d = new Date(when); d.setHours(0, 0, 0, 0)
      return Math.floor((d - buckets[0].date) / 86400000)
    }
    for (const o of orders) {
      const i = idxOf(o.created_at)
      if (i >= 0 && i < days) {
        buckets[i].products += o.total || 0
        buckets[i].total    += o.total || 0
      }
    }
    for (const e of paidEnrollments) {
      const i = idxOf(e.enrolled_at)
      const price = Number(e.courses?.price || 0)
      if (i >= 0 && i < days) {
        buckets[i].courses += price
        buckets[i].total   += price
      }
    }
    return buckets
  }, [orders, paidEnrollments])

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your store</p>
      </div>

      <div className="admin-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{s.value}</span>
              <span className="admin-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#3AAA3A15', color: '#3AAA3A' }}>
            <DollarSign size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">₹{totalRevenue.toLocaleString()}</span>
            <span className="admin-stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#4A90D915', color: '#4A90D9' }}>
            <Package size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">₹{productRevenue.toLocaleString()}</span>
            <span className="admin-stat-label">Product Revenue · {orders.length} orders</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#D4647A15', color: '#D4647A' }}>
            <GraduationCap size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">₹{courseRevenue.toLocaleString()}</span>
            <span className="admin-stat-label">Course Revenue · {paidEnrollments.length} paid enrolls</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#F2A73B15', color: '#F2A73B' }}>
            <Star size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{reviews.length}</span>
            <span className="admin-stat-label">Reviews</span>
          </div>
        </div>
      </div>

      {/* Sales chart */}
      <div className="admin-section">
        <h2><TrendingUp size={18} /> Revenue (last 14 days)</h2>
        <SalesChart series={series} />
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="admin-section">
          <h2>Recent Orders</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{fullName(o.profiles)}</td>
                    <td>₹{(o.total || 0).toLocaleString()}</td>
                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Enrollments */}
      {enrollments.length > 0 && (
        <div className="admin-section">
          <h2>Recent Enrollments</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 5).map(e => {
                  const paid = !!e.payment_id
                  const price = Number(e.courses?.price || 0)
                  return (
                    <tr key={e.id}>
                      <td>{fullName(e.profiles)}</td>
                      <td>{e.courses?.title || `#${e.course_id}`}</td>
                      <td>
                        <span className={`status-badge ${paid ? 'status-confirmed' : 'status-processing'}`}>
                          {paid ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td>{paid ? `₹${price.toLocaleString()}` : '-'}</td>
                      <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== ENROLLMENTS TAB =====
function EnrollmentsTab({ enrollments }) {
  const ctrl = useTableControls(enrollments, [
    'profiles.first_name', 'profiles.last_name', 'profiles.email',
    'courses.title', 'payment_id',
  ])

  const totalRevenue = enrollments.reduce(
    (s, e) => e.payment_id ? s + Number(e.courses?.price || 0) : s, 0,
  )
  const paidCount = enrollments.filter(e => !!e.payment_id).length

  return (
    <div>
      <div className="admin-page-header">
        <h1>Enrollments</h1>
        <p>{enrollments.length} total · {paidCount} paid · ₹{totalRevenue.toLocaleString()} earned from courses</p>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by student, course, or payment id…"
            value={ctrl.search}
            onChange={(e) => ctrl.setSearch(e.target.value)}
          />
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="admin-empty">
          <GraduationCap size={48} />
          <h3>No enrollments yet</h3>
          <p>When customers enrol in a course it will appear here.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment ID</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(e => {
                  const paid = !!e.payment_id
                  const price = Number(e.courses?.price || 0)
                  return (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{fullName(e.profiles)}</td>
                      <td>{e.profiles?.email || '-'}</td>
                      <td>{e.courses?.title || `#${e.course_id}`}</td>
                      <td>
                        <span className={`status-badge ${paid ? 'status-confirmed' : 'status-processing'}`}>
                          {paid ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td>{paid ? `₹${price.toLocaleString()}` : '-'}</td>
                      <td className="mono-cell">{e.payment_id || '-'}</td>
                      <td>{new Date(e.enrolled_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== SALES CHART (inline SVG, no deps) =====
function SalesChart({ series }) {
  const W = 720
  const H = 200
  const PAD = 32
  const max = Math.max(1, ...series.map(s => s.total))
  const xStep = (W - PAD * 2) / Math.max(1, series.length - 1)
  const yFor = (v) => H - PAD - (v / max) * (H - PAD * 2)
  const path = series.map((s, i) => {
    const x = PAD + i * xStep
    const y = yFor(s.total)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const area = `${path} L ${PAD + (series.length - 1) * xStep} ${H - PAD} L ${PAD} ${H - PAD} Z`
  return (
    <div className="admin-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="admin-chart">
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D89A52" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D89A52" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rev)" />
        <path d={path} fill="none" stroke="#D89A52" strokeWidth="2" />
        {series.map((s, i) => (
          <g key={i}>
            <circle cx={PAD + i * xStep} cy={yFor(s.total)} r="3" fill="#ECBC7C" />
          </g>
        ))}
      </svg>
      <div className="admin-chart-axis">
        {series.map((s, i) =>
          i === 0 || i === series.length - 1 || i === Math.floor(series.length / 2) ? (
            <span key={i} style={{ left: `${(i / (series.length - 1)) * 100}%` }}>
              {s.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

// ===== PRODUCTS TAB =====
function ProductsTab({ products, onAdd, onEdit, onDelete, onToggleFeatured }) {
  const [category, setCategory] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  let visible = category === 'all' ? products : products.filter(p => p.category === category)
  if (featuredOnly) visible = visible.filter(p => p.is_featured)
  const featuredCount = products.filter(p => p.is_featured).length
  const ctrl = useTableControls(visible, ['name', 'category', 'description'])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>
            {products.length} products in store
            {' · '}
            <span style={{ color: featuredCount > 0 ? 'var(--mm-pink)' : 'var(--text-muted)' }}>
              {featuredCount}/4 featured on homepage
            </span>
          </p>
        </div>
        <button className="btn btn-blue" onClick={onAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty">
          <Package size={48} />
          <h3>No products yet</h3>
          <p>Add your first product to get started</p>
          <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Product</button>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search products..."
          >
            <select value={category} onChange={e => setCategory(e.target.value)} className="admin-filter-select">
              <option value="all">All categories</option>
              <option value="beans">Beans</option>
              <option value="powder">Powder</option>
            </select>
            <button
              type="button"
              className={`admin-filter-toggle ${featuredOnly ? 'active' : ''}`}
              onClick={() => setFeaturedOnly(v => !v)}
              title="Show featured only"
            >
              <Star size={14} fill={featuredOnly ? 'currentColor' : 'none'} />
              Featured only
            </button>
          </TableToolbar>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Weight</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="admin-thumb" />
                      ) : (
                        <div className="admin-thumb-placeholder"><Package size={16} /></div>
                      )}
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="category-badge">{p.category}</span></td>
                    <td>₹{p.price}</td>
                    <td>{p.weight || '-'}</td>
                    <td>
                      {p.in_stock ? (
                        <span className="status-badge status-confirmed">In Stock</span>
                      ) : (
                        <span className="status-badge status-cancelled">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-feature-toggle ${p.is_featured ? 'on' : ''}`}
                        onClick={() => onToggleFeatured(p)}
                        title={p.is_featured ? 'Remove from homepage' : 'Show on homepage'}
                      >
                        <Star size={14} fill={p.is_featured ? 'currentColor' : 'none'} />
                        {p.is_featured ? 'Featured' : 'Feature'}
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => onEdit(p)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="admin-action-btn delete" onClick={() => onDelete(p.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== COURSES TAB =====
function CoursesTab({ courses, onAdd, onEdit, onManageLessons, onDelete }) {
  const [level, setLevel] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [lessonsCache, setLessonsCache] = useState({}) // { [courseId]: { loading, data, error } }
  const visible = level === 'all' ? courses : courses.filter(c => c.level === level)
  const ctrl = useTableControls(visible, ['title', 'level', 'description'])

  const toggleExpand = async (course) => {
    if (expanded === course.id) {
      setExpanded(null)
      return
    }
    setExpanded(course.id)
    if (lessonsCache[course.id]?.data) return
    setLessonsCache(prev => ({ ...prev, [course.id]: { loading: true } }))
    try {
      const data = await getLessons(course.id)
      setLessonsCache(prev => ({ ...prev, [course.id]: { loading: false, data } }))
    } catch (err) {
      setLessonsCache(prev => ({
        ...prev,
        [course.id]: { loading: false, error: err?.message || 'Failed to load lessons' },
      }))
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Courses</h1>
          <p>{courses.length} courses in academy</p>
        </div>
        <button className="btn btn-blue" onClick={onAdd}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="admin-empty">
          <Video size={48} />
          <h3>No courses yet</h3>
          <p>Add your first course to get started</p>
          <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Course</button>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search courses..."
          >
            <select value={level} onChange={e => setLevel(e.target.value)} className="admin-filter-select">
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </TableToolbar>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Lessons</th>
                  <th>Video</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(c => {
                  const isOpen = expanded === c.id
                  const cache = lessonsCache[c.id]
                  return (
                    <Fragment key={c.id}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="admin-action-btn edit"
                            onClick={() => toggleExpand(c)}
                            title={isOpen ? 'Hide lessons' : 'View lessons'}
                          >
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                        <td>
                          {c.image ? (
                            <img src={c.image} alt={c.title} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb-placeholder"><Video size={16} /></div>
                          )}
                        </td>
                        <td><strong>{c.title}</strong></td>
                        <td><span className="category-badge">{c.level}</span></td>
                        <td>{c.free ? <span className="status-badge status-confirmed">FREE</span> : `₹${c.price}`}</td>
                        <td>{c.duration || '-'}</td>
                        <td>{c.lessons || 0}</td>
                        <td>
                          {c.video_url ? (
                            <span className="admin-video-link"><Eye size={14} /> Uploaded</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="btn btn-blue btn-sm"
                              onClick={() => onManageLessons(c)}
                              title="Add or manage lessons"
                            >
                              <Plus size={14} /> Lessons
                            </button>
                            <button className="admin-action-btn edit" onClick={() => onEdit(c)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button className="admin-action-btn delete" onClick={() => onDelete(c.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="admin-detail-row">
                          <td colSpan={9}>
                            <div className="admin-course-lessons">
                              <h4><BookOpen size={14} /> Lessons in "{c.title}"</h4>
                              {cache?.loading && (
                                <div className="text-muted" style={{ padding: '8px 0' }}>
                                  <span className="spinner" /> Loading lessons…
                                </div>
                              )}
                              {cache?.error && (
                                <div className="text-muted" style={{ padding: '8px 0' }}>
                                  {cache.error}
                                </div>
                              )}
                              {cache?.data && cache.data.length === 0 && (
                                <div className="admin-course-lessons-empty">
                                  <p>No lessons yet.</p>
                                  <button
                                    type="button"
                                    className="btn btn-blue btn-sm"
                                    onClick={() => onManageLessons(c)}
                                  >
                                    <Plus size={14} /> Add Lessons
                                  </button>
                                </div>
                              )}
                              {cache?.data && cache.data.length > 0 && (
                                <>
                                  <ol className="admin-lesson-list">
                                    {cache.data.map((l, idx) => (
                                      <li key={l.id}>
                                        <div className="admin-lesson-thumb">
                                          {l.thumbnail ? (
                                            <img src={l.thumbnail} alt={l.title} />
                                          ) : (
                                            <div className="admin-lesson-thumb-empty" title="No thumbnail">
                                              <ImageIcon size={14} />
                                              <span>No image</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="admin-lesson-body">
                                          <span className="admin-lesson-title">
                                            {idx + 1}. {l.title}
                                          </span>
                                          <span className="admin-lesson-meta">
                                            {l.duration_seconds
                                              ? `${Math.round(l.duration_seconds / 60)} min`
                                              : 'Duration not set'}
                                            {' · '}{l.video_url ? 'video' : 'no video'}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    style={{ marginTop: 12 }}
                                    onClick={() => onManageLessons(c)}
                                  >
                                    <Plus size={14} /> Add More Lessons
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== BOOKS TAB =====
function BooksTab({ books, onAdd, onEdit, onDelete }) {
  const ctrl = useTableControls(books, ['title', 'author', 'description'])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Books</h1>
          <p>{books.length} digital book{books.length === 1 ? '' : 's'} in the Academy</p>
        </div>
        <button className="btn btn-blue" onClick={onAdd}>
          <Plus size={16} /> Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="admin-empty">
          <Library size={48} />
          <h3>No books yet</h3>
          <p>Add your first PDF book to sell it in Learn Coffee.</p>
          <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Book</button>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search books..."
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Pages</th>
                  <th>PDF</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(b => (
                  <tr key={b.id}>
                    <td>
                      {b.cover_image ? (
                        <img src={b.cover_image} alt={b.title} className="admin-thumb" />
                      ) : (
                        <div className="admin-thumb-placeholder"><Library size={16} /></div>
                      )}
                    </td>
                    <td><strong>{b.title}</strong></td>
                    <td>{b.author || '-'}</td>
                    <td>{b.free ? <span className="status-badge status-confirmed">FREE</span> : `₹${b.price}`}</td>
                    <td>{b.pages || '-'}</td>
                    <td>
                      {b.pdf_path ? (
                        <span className="admin-video-link"><FileText size={14} /> Attached</span>
                      ) : (
                        <span className="text-muted">Missing</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => onEdit(b)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="admin-action-btn delete" onClick={() => onDelete(b.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

function BookForm({ data, mode, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.pdf_path) return toast.error('Upload the book PDF before saving')
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="book-form">
      <div className="admin-modal-header">
        <h2 className="book-form-heading"><Library size={18} /> {mode === 'edit' ? 'Edit Book' : 'Add a Book'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <p className="book-form-intro">
          Sell a downloadable PDF in <strong>Learn Coffee</strong>, right alongside your video courses.
        </p>

        <div className="admin-form-group">
          <label>Title *</label>
          <input
            type="text" value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="The Home Barista Handbook" required
          />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What this book covers…" rows={3}
          />
        </div>

        <div className="book-form-fields">
          <div className="admin-form-group">
            <label>Author</label>
            <input
              type="text" value={form.author || ''}
              onChange={(e) => update('author', e.target.value)}
              placeholder="Mastermind Brews"
            />
          </div>
          <div className="admin-form-group">
            <label>Pages</label>
            <input
              type="number" min={0} value={form.pages ?? ''}
              onChange={(e) => update('pages', e.target.value)}
              placeholder="120"
            />
          </div>
          <div className="admin-form-group">
            <label>Price (₹)</label>
            <input
              type="number" min={0} value={form.free ? '' : (form.price ?? '')}
              onChange={(e) => update('price', e.target.value)}
              placeholder="499" disabled={form.free}
            />
          </div>
        </div>

        <label className="book-free-toggle">
          <input
            type="checkbox" checked={!!form.free}
            onChange={(e) => update('free', e.target.checked)}
          />
          <span>Offer this book for free (no payment required)</span>
        </label>

        <div className="book-form-uploads">
          <div className="book-upload-card">
            <div className="book-upload-head">
              <ImageIcon size={15} /> Cover image
              <span className="book-upload-tag">Public</span>
            </div>
            <FileUploader
              bucket="book-covers"
              accept="image/*"
              kind="image"
              value={form.cover_image}
              onChange={(url) => update('cover_image', url)}
              maxSizeMB={5}
            />
            <small>Shown on the storefront card. Optional, but a cover sells better.</small>
          </div>

          <div className="book-upload-card">
            <div className="book-upload-head">
              <FileText size={15} /> Book PDF
              <span className="book-upload-tag private">Private</span>
            </div>
            <FileUploader
              bucket="course-books"
              accept="application/pdf"
              kind="file"
              isPrivate
              value={form.pdf_path}
              onChange={(path) => update('pdf_path', path)}
              maxSizeMB={50}
            />
            <small>Required. Stored privately — buyers only ever get a short-lived signed link, never a public URL.</small>
          </div>
        </div>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : <><Save size={16} /> Save book</>}
        </button>
      </div>
    </form>
  )
}

// ===== CSV EXPORT HELPER =====
function downloadCsv(filename, rows) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ===== USERS TAB =====
function UsersTab({ users }) {
  const ctrl = useTableControls(users, ['first_name', 'last_name', 'email'])

  const exportCsv = () => {
    downloadCsv('users.csv', users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      is_admin: u.is_admin,
      created_at: u.created_at,
    })))
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>{users.length} registered users</p>
        </div>
        {users.length > 0 && (
          <button className="btn btn-ghost" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="admin-empty">
          <Users size={48} />
          <h3>No users yet</h3>
          <p>Users will appear here once they sign up</p>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by name or email..."
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <strong>{fullName(u)}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u.is_admin ? (
                        <span className="status-badge status-confirmed">Admin</span>
                      ) : (
                        <span className="status-badge status-pending">Customer</span>
                      )}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== ORDERS TAB =====
function OrdersTab({ orders, onStatusChange }) {
  const [status, setStatus] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const visible = status === 'all' ? orders : orders.filter(o => o.status === status)
  const ctrl = useTableControls(visible, ['id', 'payment_id', 'profiles.email', 'profiles.first_name', 'profiles.last_name'])

  const exportCsv = () => {
    downloadCsv('orders.csv', orders.map((o) => ({
      id: o.id,
      created_at: o.created_at,
      status: o.status,
      total: o.total,
      payment_id: o.payment_id,
      customer: o.profiles?.email || '',
      first_name: o.profiles?.first_name || '',
      last_name: o.profiles?.last_name || '',
      items_count: (o.items || []).length,
      city: o.shipping_address?.city || '',
      state: o.shipping_address?.state || '',
      pincode: o.shipping_address?.pincode || '',
    })))
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders</p>
        </div>
        {orders.length > 0 && (
          <button className="btn btn-ghost" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty">
          <ShoppingBag size={48} />
          <h3>No orders yet</h3>
          <p>Orders will appear here when customers check out</p>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by order #, email, payment ID..."
          >
            <select value={status} onChange={e => setStatus(e.target.value)} className="admin-filter-select">
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </TableToolbar>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(o => {
                  const itemsList = o.items || []
                  const addr = o.shipping_address || {}
                  return (
                    <Fragment key={o.id}>
                      <tr>
                        <td><strong>#{o.id}</strong></td>
                        <td>{fullName(o.profiles)}</td>
                        <td>{itemsList.length} item(s)</td>
                        <td>₹{(o.total || 0).toLocaleString()}</td>
                        <td><code className="admin-code">{o.payment_id || '-'}</code></td>
                        <td>
                          <select
                            value={o.status || 'confirmed'}
                            onChange={e => onStatusChange(o.id, e.target.value)}
                            className={`admin-status-select status-${o.status}`}
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-action-btn edit"
                            onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                            title="Toggle details"
                          >
                            {expanded === o.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expanded === o.id && (
                        <tr className="admin-detail-row">
                          <td colSpan={8}>
                            <div className="admin-order-detail">
                              <div className="admin-order-detail-section">
                                <h4>Shipping Address</h4>
                                <p>{addr.fullName}</p>
                                <p>{addr.line1}</p>
                                {addr.line2 && <p>{addr.line2}</p>}
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p>Phone: {addr.phone}</p>
                              </div>
                              <div className="admin-order-detail-section">
                                <h4>Items Ordered</h4>
                                {itemsList.map((item, i) => (
                                  <div key={i} className="admin-order-item">
                                    <span>{item.name} x {item.qty}</span>
                                    <span>₹{(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== REVIEWS TAB =====
function ReviewsTab({ reviews, onApproval, onDelete }) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'all'
    ? reviews
    : filter === 'approved'
      ? reviews.filter(r => r.approved)
      : reviews.filter(r => !r.approved)
  const ctrl = useTableControls(visible, ['comment', 'products.name', 'profiles.email'])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Reviews</h1>
          <p>{reviews.length} reviews submitted</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="admin-empty">
          <Star size={48} />
          <h3>No reviews yet</h3>
          <p>Customer reviews will appear here</p>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search reviews..."
          >
            <select value={filter} onChange={e => setFilter(e.target.value)} className="admin-filter-select">
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
            </select>
          </TableToolbar>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.products?.name || '-'}</strong></td>
                    <td>{fullName(r.profiles, 'Anonymous')}</td>
                    <td>
                      <span className="stars-row">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={12} fill={n <= r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </td>
                    <td className="review-comment-cell">{r.comment}</td>
                    <td>
                      {r.approved ? (
                        <span className="status-badge status-confirmed">Approved</span>
                      ) : (
                        <span className="status-badge status-cancelled">Hidden</span>
                      )}
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        {r.approved ? (
                          <button className="admin-action-btn delete" onClick={() => onApproval(r.id, false)} title="Hide">
                            <XCircle size={14} />
                          </button>
                        ) : (
                          <button className="admin-action-btn edit" onClick={() => onApproval(r.id, true)} title="Approve">
                            <Check size={14} />
                          </button>
                        )}
                        <button className="admin-action-btn delete" onClick={() => onDelete(r.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== PRODUCT FORM MODAL =====
function ProductForm({ data, mode, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-modal-header">
        <h2>{mode === 'edit' ? 'Edit Product' : 'Add Product'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Product Name *</label>
          <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Arabica Beans - Medium Roast" required />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="599" required />
          </div>
          <div className="admin-form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}>
              <option value="beans">Beans</option>
              <option value="powder">Powder</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Weight</label>
            <input type="text" value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="250g" />
          </div>
          <div className="admin-form-group">
            <label>Stock Qty</label>
            <input type="number" min={0} value={form.stock_quantity ?? ''} onChange={e => update('stock_quantity', e.target.value)} placeholder="100" />
          </div>
        </div>

        <div className="admin-form-group">
          <label>Product Image</label>
          <FileUploader
            bucket="product-images"
            accept="image/*"
            kind="image"
            value={form.image}
            onChange={(url) => update('image', url)}
            maxSizeMB={5}
          />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Smooth, balanced with notes of caramel..." rows={3} />
        </div>

        <label className="admin-feature-check">
          <input
            type="checkbox"
            checked={!!form.is_featured}
            onChange={e => update('is_featured', e.target.checked)}
          />
          <span className="admin-feature-check-body">
            <span className="admin-feature-check-title">
              <Star size={14} fill={form.is_featured ? 'currentColor' : 'none'} />
              Show on homepage as Featured
            </span>
            <span className="admin-feature-check-hint">
              Up to 4 featured products appear in the "Best Sellers" section on the home page.
            </span>
          </span>
        </label>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving...</> : <><Save size={16} /> {mode === 'edit' ? 'Update' : 'Add Product'}</>}
        </button>
      </div>
    </form>
  )
}

// ===== COUPONS TAB =====
function CouponsTab({ coupons, onAdd, onEdit, onDelete }) {
  const ctrl = useTableControls(coupons, ['code', 'description'])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Coupons</h1>
          <p>{coupons.length} coupons</p>
        </div>
        <button className="btn btn-blue" onClick={onAdd}>
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="admin-empty">
          <Tag size={48} />
          <h3>No coupons yet</h3>
          <p>Offer customers a discount to drive conversions.</p>
          <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Coupon</button>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by code…"
          />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Used</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(c => (
                  <tr key={c.id}>
                    <td><code className="admin-code">{c.code}</code></td>
                    <td>
                      {c.discount_type === 'percent'
                        ? `${c.discount_value}%`
                        : `₹${c.discount_value}`}
                    </td>
                    <td>{c.min_order_total ? `₹${c.min_order_total}` : '-'}</td>
                    <td>
                      {c.uses || 0}{c.max_uses ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      {c.active
                        ? <span className="status-badge status-confirmed">Active</span>
                        : <span className="status-badge status-cancelled">Disabled</span>}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => onEdit(c)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="admin-action-btn delete" onClick={() => onDelete(c.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== COUPON FORM MODAL =====
function CouponForm({ data, mode, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) return toast.error('Code is required')
    if (!form.discount_value) return toast.error('Discount value is required')
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={submit}>
      <div className="admin-modal-header">
        <h2>{mode === 'edit' ? 'Edit Coupon' : 'Add Coupon'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Code *</label>
          <input
            type="text" value={form.code}
            onChange={e => update('code', e.target.value.toUpperCase())}
            placeholder="WELCOME10" required
          />
        </div>
        <div className="admin-form-group">
          <label>Description</label>
          <input
            type="text" value={form.description || ''}
            onChange={e => update('description', e.target.value)}
            placeholder="10% off your first order"
          />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Type</label>
            <select value={form.discount_type} onChange={e => update('discount_type', e.target.value)}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Value *</label>
            <input
              type="number" min={1} value={form.discount_value ?? ''}
              onChange={e => update('discount_value', e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="admin-form-group">
            <label>Min Order (₹)</label>
            <input
              type="number" min={0} value={form.min_order_total ?? ''}
              onChange={e => update('min_order_total', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Max Uses (blank = unlimited)</label>
            <input
              type="number" min={1} value={form.max_uses}
              onChange={e => update('max_uses', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label>Expires (optional)</label>
            <input
              type="datetime-local" value={form.expires_at}
              onChange={e => update('expires_at', e.target.value)}
            />
          </div>
        </div>
        <div className="admin-form-check">
          <label>
            <input type="checkbox" checked={!!form.active} onChange={e => update('active', e.target.checked)} />
            Active
          </label>
        </div>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving...</> : <><Save size={16} /> Save</>}
        </button>
      </div>
    </form>
  )
}

// ===== COURSE FORM MODAL =====
function CourseForm({ data, mode, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-modal-header">
        <h2>{mode === 'edit' ? 'Edit Course' : 'Add Course'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Course Title *</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Espresso Mastery" required />
        </div>
        <div className="admin-form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Master the art of pulling the perfect espresso..." rows={3} />
        </div>

        <div className="admin-form-group">
          <label>Course Intro Video</label>
          {isBunnyConfigured() ? (
            <>
              <input
                type="text"
                value={form.video_url || ''}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="Paste Bunny Video ID or full Bunny URL"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
              <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                🐰 Paste the Video ID or player URL from your Bunny.net Stream library.
              </small>
            </>
          ) : (
            <>
              <input
                type="url"
                value={form.video_url || ''}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="Paste video URL"
              />
              <small className="text-muted">Bunny.net not configured. Set VITE_BUNNY_LIBRARY_ID in .env.</small>
            </>
          )}
        </div>

        <div className="admin-form-group">
          <label>Thumbnail Image</label>
          <FileUploader
            bucket="course-thumbnails"
            accept="image/*"
            kind="image"
            value={form.image}
            onChange={(url) => update('image', url)}
            maxSizeMB={5}
          />
        </div>

        <div className="admin-form-check" style={{ margin: '16px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.free} onChange={e => update('free', e.target.checked)} />
            <span style={{ fontWeight: 600 }}>Free Course</span>
          </label>
        </div>

        {!form.free && (
          <div className="admin-form-group">
            <label>Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="999" min={1} />
          </div>
        )}

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Duration</label>
            <input type="text" value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="4h 15m" />
          </div>
          <div className="admin-form-group">
            <label>Level</label>
            <select value={form.level} onChange={e => update('level', e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Rating</label>
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => update('rating', e.target.value)} placeholder="4.5" />
          </div>
        </div>

        {mode === 'add' && (
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 12 }}>
            Save the course first, then add lessons from the course list.
          </p>
        )}
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving...</> : <><Save size={16} /> {mode === 'edit' ? 'Update' : 'Add Course'}</>}
        </button>
      </div>
    </form>
  )
}

// ===== BLOG TAB =====
function BlogTab({ posts, onAdd, onEdit, onDelete, onTogglePublish }) {
  const ctrl = useTableControls(posts, ['title', 'slug', 'author_name'])
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Blog Posts</h1>
          <p>{posts.length} post{posts.length === 1 ? '' : 's'} • {posts.filter(p => p.published).length} published</p>
        </div>
        <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Post</button>
      </div>

      {posts.length === 0 ? (
        <div className="admin-empty">
          <Newspaper size={48} />
          <h3>No posts yet</h3>
          <p>Write your first blog post and publish it to /blog.</p>
          <button className="btn btn-blue" onClick={onAdd}><Plus size={16} /> Add Post</button>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by title, slug or author…"
          />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.cover_image
                        ? <img src={p.cover_image} alt="" className="admin-thumb" />
                        : <div className="admin-thumb-placeholder"><ImageIcon size={16} /></div>}
                    </td>
                    <td>
                      <strong>{p.title}</strong>
                      {p.excerpt && (
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>
                          {p.excerpt.slice(0, 80)}{p.excerpt.length > 80 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td><code className="admin-code">{p.slug}</code></td>
                    <td>{p.author_name || '-'}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      {p.published
                        ? <button onClick={() => onTogglePublish(p)} className="status-badge status-confirmed" title="Click to unpublish" style={{ cursor: 'pointer', border: 'none' }}>Published</button>
                        : <button onClick={() => onTogglePublish(p)} className="status-badge status-cancelled" title="Click to publish" style={{ cursor: 'pointer', border: 'none' }}>Draft</button>}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => onEdit(p)} title="Edit"><Pencil size={14} /></button>
                        <button className="admin-action-btn delete" onClick={() => onDelete(p.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== BLOG FORM MODAL =====
function BlogForm({ data, mode, onSave, onClose }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title?.trim()) return toast.error('Title is required')
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={submit}>
      <div className="admin-modal-header">
        <h2>{mode === 'edit' ? 'Edit Post' : 'New Blog Post'}</h2>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              const t = e.target.value
              update('title', t)
              if (mode !== 'edit' && (!form.slug || form.slug === slugify(form.title))) {
                update('slug', slugify(t))
              }
            }}
            placeholder="How we roast our Chikmagalur beans"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Slug (URL)</label>
          <input
            type="text"
            value={form.slug || ''}
            onChange={(e) => update('slug', slugify(e.target.value))}
            placeholder="auto-generated from title"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <small className="text-muted">Used in /blog/&lt;slug&gt;</small>
        </div>

        <div className="admin-form-group">
          <label>Author</label>
          <input
            type="text"
            value={form.author_name || ''}
            onChange={(e) => update('author_name', e.target.value)}
            placeholder="Author name"
          />
        </div>

        <div className="admin-form-group">
          <label>Excerpt</label>
          <textarea
            value={form.excerpt || ''}
            onChange={(e) => update('excerpt', e.target.value)}
            rows={2}
            placeholder="Short summary shown in listing"
            maxLength={300}
          />
        </div>

        <div className="admin-form-group">
          <label>Cover Image</label>
          <FileUploader
            bucket="course-thumbnails"
            accept="image/*"
            kind="image"
            value={form.cover_image || ''}
            onChange={(url) => update('cover_image', url)}
            maxSizeMB={5}
          />
        </div>

        <div className="admin-form-group">
          <label>Content *</label>
          <textarea
            value={form.content || ''}
            onChange={(e) => update('content', e.target.value)}
            rows={14}
            placeholder="Write your post... separate paragraphs with a blank line."
            style={{ fontFamily: 'inherit', lineHeight: 1.6 }}
          />
          <small className="text-muted">Plain text. Two newlines start a new paragraph.</small>
        </div>

        <div className="admin-form-check" style={{ margin: '12px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => update('published', e.target.checked)}
            />
            <span style={{ fontWeight: 600 }}>Publish (visible to public)</span>
          </label>
        </div>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving...</> : <><Save size={16} /> {mode === 'edit' ? 'Update' : 'Create Post'}</>}
        </button>
      </div>
    </form>
  )
}

// ===== BARISTAS TAB =====
function BaristasTab({ baristas, onApprove, onDelete, onView }) {
  const [statusFilter, setStatusFilter] = useState('active') // active | pending | approved | hired | all
  const filtered = useMemo(() => {
    switch (statusFilter) {
      case 'pending':  return baristas.filter(b => !b.approved && !b.hired_at)
      case 'approved': return baristas.filter(b => b.approved && !b.hired_at)
      case 'hired':    return baristas.filter(b => b.hired_at)
      case 'active':   return baristas.filter(b => !b.hired_at)
      case 'all':
      default:         return baristas
    }
  }, [baristas, statusFilter])
  const ctrl = useTableControls(filtered, ['full_name', 'email', 'phone', 'current_location'])
  const pending = baristas.filter(b => !b.approved && !b.hired_at).length
  const approved = baristas.filter(b => b.approved && !b.hired_at).length
  const hired = baristas.filter(b => b.hired_at).length
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Barista Submissions</h1>
          <p>{baristas.length} total • {pending} pending • {approved} approved • {hired} hired</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {[
          { id: 'active',   label: `Active (${pending + approved})` },
          { id: 'pending',  label: `Pending (${pending})` },
          { id: 'approved', label: `Approved (${approved})` },
          { id: 'hired',    label: `Hired (${hired})` },
          { id: 'all',      label: `All (${baristas.length})` },
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`admin-filter-chip ${statusFilter === opt.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {baristas.length === 0 ? (
        <div className="admin-empty">
          <UserCheck size={48} />
          <h3>No submissions yet</h3>
          <p>Baristas will appear here once they fill the form on /barista-signup.</p>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by name, email, phone or location…"
          />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Experience</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(b => (
                  <tr key={b.id}>
                    <td>
                      {b.photo_url
                        ? <img src={b.photo_url} alt="" className="admin-thumb" />
                        : <div className="admin-thumb-placeholder"><Users size={16} /></div>}
                    </td>
                    <td><strong>{b.full_name}</strong></td>
                    <td>
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                        <a href={`mailto:${b.email}`}>{b.email}</a><br />
                        <a href={`tel:${b.phone}`}>{b.phone}</a>
                      </div>
                    </td>
                    <td>{b.experience_years || 0} yrs</td>
                    <td>{b.current_location || '-'}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                    <td>
                      {b.hired_at
                        ? <span className="status-badge status-confirmed" title={`Hired on ${new Date(b.hired_at).toLocaleDateString()}`} style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>Hired ✓</span>
                        : b.approved
                          ? <button onClick={() => onApprove(b, false)} className="status-badge status-confirmed" title="Click to hide" style={{ cursor: 'pointer', border: 'none' }}>Approved</button>
                          : <button onClick={() => onApprove(b, true)} className="status-badge status-cancelled" title="Click to approve" style={{ cursor: 'pointer', border: 'none' }}>Pending</button>}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn" onClick={() => onView(b)} title="View full details">
                          <Eye size={14} />
                        </button>
                        {!b.approved && !b.hired_at && (
                          <button className="admin-action-btn edit" onClick={() => onApprove(b, true)} title="Approve">
                            <Check size={14} />
                          </button>
                        )}
                        <button className="admin-action-btn delete" onClick={() => onDelete(b.id)} title={b.hired_at ? 'Permanently remove from database' : 'Delete'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}

// ===== MAPPINGS TAB (cafe → 5 baristas) =====
function MappingsTab({ paidCafes, baristas, onManage, onRevoke }) {
  const baristaById = useMemo(
    () => new Map(baristas.map(b => [b.id, b])),
    [baristas],
  )
  const [filter, setFilter] = useState('active') // active | expiring | expired | revoked | all

  // Tag every cafe with its access status once.
  const tagged = useMemo(
    () => paidCafes.map(c => ({ ...c, status: accessStatus(c) })),
    [paidCafes],
  )

  const counts = useMemo(() => ({
    active:   tagged.filter(c => c.status.kind === 'active').length,
    expiring: tagged.filter(c => c.status.kind === 'expiring').length,
    expired:  tagged.filter(c => c.status.kind === 'expired').length,
    revoked:  tagged.filter(c => c.status.kind === 'revoked').length,
    all:      tagged.length,
  }), [tagged])

  const visible = useMemo(() => {
    if (filter === 'all') return tagged
    return tagged.filter(c => c.status.kind === filter)
  }, [tagged, filter])

  const totalSlots = visible.length * BARISTA_SLOTS_PER_CAFE
  const filledSlots = visible.reduce((s, c) => s + c.assignments.length, 0)
  const cafesWaiting = visible.filter(c => c.status.kind !== 'revoked' && c.status.kind !== 'expired' && c.assignments.length === 0).length

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Cafe Mappings</h1>
          <p>
            {visible.length} cafe{visible.length === 1 ? '' : 's'} shown • {filledSlots} of {totalSlots} slots filled
            {cafesWaiting > 0 && <> • <strong style={{ color: '#f59e0b' }}>{cafesWaiting} waiting for assignments</strong></>}
          </p>
        </div>
      </div>

      <div className="admin-info-banner">
        <AlertCircle size={16} />
        <span>
          Cafe access lasts <strong>{CAFE_ACCESS_DAYS} days</strong> from payment. Revoke manually
          once a hire is confirmed, that drops their assignments so the same baristas
          can be matched elsewhere.
        </span>
      </div>

      <div className="admin-filter-row">
        {[
          { id: 'active',   label: 'Active' },
          { id: 'expiring', label: 'Expiring (≤5d)' },
          { id: 'expired',  label: 'Expired' },
          { id: 'revoked',  label: 'Revoked' },
          { id: 'all',      label: 'All' },
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`admin-filter-chip ${filter === opt.id ? 'is-active' : ''}`}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
            <span className="admin-filter-count">{counts[opt.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="admin-empty">
          <Building2 size={48} />
          <h3>No cafes match this filter</h3>
          <p>Try a different filter, or wait for the next paid signup.</p>
        </div>
      ) : (
        <div className="mappings-grid">
          {visible.map(cafe => {
            const filled = cafe.assignments.length
            const empty = Math.max(0, BARISTA_SLOTS_PER_CAFE - filled)
            const cafeName = [cafe.profile?.first_name, cafe.profile?.last_name].filter(Boolean).join(' ') || cafe.profile?.email || 'Cafe'
            const status = cafe.status
            const isInactive = status.kind === 'revoked' || status.kind === 'expired'
            return (
              <div key={cafe.user_id} className={`mapping-card ${isInactive ? 'mapping-card-inactive' : ''}`}>
                <div className="mapping-card-head">
                  <div className="mapping-card-title">
                    <Building2 size={16} />
                    <strong>{cafeName}</strong>
                  </div>
                  <span className={`mapping-pill pill-${status.kind}`}>{status.label}</span>
                </div>

                <div className="mapping-card-meta">
                  {cafe.profile?.email && <div><Mail size={12} /> {cafe.profile.email}</div>}
                  <div>Paid ₹{cafe.amount ?? '-'} on {new Date(cafe.paid_at).toLocaleDateString()}</div>
                  {cafe.expires_at && (
                    <div>
                      {status.kind === 'expired' ? 'Expired' : 'Expires'}: {new Date(cafe.expires_at).toLocaleDateString()}
                    </div>
                  )}
                  {cafe.revoked_at && (
                    <div style={{ color: '#f87171' }}>
                      Revoked {new Date(cafe.revoked_at).toLocaleDateString()}
                      {cafe.revoked_reason ? `: ${cafe.revoked_reason}` : ''}
                    </div>
                  )}
                </div>

                <div className="mapping-pill-row">
                  <span className={`mapping-pill ${filled === 0 ? 'pill-warn' : filled === BARISTA_SLOTS_PER_CAFE ? 'pill-ok' : 'pill-mid'}`}>
                    {filled} / {BARISTA_SLOTS_PER_CAFE} mapped
                  </span>
                </div>

                <CafeBriefBlock brief={cafe.brief} />

                <ol className="mapping-slot-list">
                  {Array.from({ length: BARISTA_SLOTS_PER_CAFE }).map((_, i) => {
                    const a = cafe.assignments[i]
                    const b = a ? baristaById.get(a.barista_id) : null
                    return (
                      <li key={i} className={`mapping-slot ${b ? 'filled' : 'empty'}`}>
                        <span className="mapping-slot-num">{i + 1}</span>
                        {b ? (
                          <div className="mapping-slot-info">
                            <strong>{b.full_name}</strong>
                            <span>
                              {b.current_location || 'no location'} • {b.experience_years || 0} yr
                              {b.experience_years === 1 ? '' : 's'}
                            </span>
                          </div>
                        ) : (
                          <div className="mapping-slot-info empty-text">Empty slot</div>
                        )}
                      </li>
                    )
                  })}
                </ol>

                {!isInactive && empty > 0 && filled === 0 && (
                  <p className="mapping-warn">
                    <AlertCircle size={12} /> This cafe has paid but has no baristas yet. Assign now.
                  </p>
                )}

                <div className="mapping-card-actions">
                  {!isInactive && (
                    <button className="btn btn-primary" onClick={() => onManage(cafe)}>
                      <Link2 size={14} /> Manage assignments
                    </button>
                  )}
                  {status.kind !== 'revoked' && (
                    <button
                      type="button"
                      className="btn btn-danger-ghost"
                      onClick={() => onRevoke(cafe)}
                      title="Remove this cafe's access (e.g. after a successful hire)"
                    >
                      <Trash2 size={14} /> Revoke access
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CafeBriefBlock({ brief }) {
  if (!brief) {
    return (
      <div className="mapping-brief mapping-brief-empty">
        <ClipboardList size={12} />
        <span>No brief submitted yet. Cafe hasn&rsquo;t told us what they need.</span>
      </div>
    )
  }
  const shiftLabel = SHIFT_TYPES.find(s => s.id === brief.shift_type)?.label
  return (
    <div className="mapping-brief">
      <div className="mapping-brief-head">
        <ClipboardList size={12} /> <strong>Cafe brief</strong>
      </div>
      <div className="mapping-brief-grid">
        {brief.city && <span><MapPin size={11} /> {brief.city}</span>}
        {shiftLabel && <span><Clock size={11} /> {shiftLabel}</span>}
        {brief.min_experience_years > 0 && (
          <span><Briefcase size={11} /> {brief.min_experience_years}+ yr</span>
        )}
        {brief.budget_monthly && (
          <span><Wallet size={11} /> ₹{brief.budget_monthly.toLocaleString('en-IN')}/mo</span>
        )}
      </div>
      {brief.notes && <p className="mapping-brief-notes">&ldquo;{brief.notes}&rdquo;</p>}
    </div>
  )
}

// ===== ASSIGN BARISTAS MODAL =====
function AssignBaristasForm({ cafe, baristas, counts, onSave, onClose }) {
  // Hired baristas are filtered out, they're no longer available.
  const approved = useMemo(
    () => baristas.filter(b => b.approved && !b.hired_at),
    [baristas],
  )
  const [selected, setSelected] = useState(() => new Set(cafe.assignments.map(a => a.barista_id)))
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return approved
    return approved.filter(b =>
      [b.full_name, b.current_location, b.skills, b.email].some(v => String(v ?? '').toLowerCase().includes(q))
    )
  }, [approved, search])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < BARISTA_SLOTS_PER_CAFE) next.add(id)
      else toast.error(`You can only map ${BARISTA_SLOTS_PER_CAFE} baristas to one cafe.`)
      return next
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(cafe.user_id, Array.from(selected))
    setSaving(false)
  }

  const cafeName = [cafe.profile?.first_name, cafe.profile?.last_name].filter(Boolean).join(' ') || cafe.profile?.email || 'this cafe'

  return (
    <form onSubmit={submit} className="assign-form">
      <div className="admin-modal-header">
        <div>
          <h2>Map baristas to {cafeName}</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
            Pick up to {BARISTA_SLOTS_PER_CAFE} approved baristas. Saving replaces this cafe&rsquo;s current list.
          </p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn"><X size={20} /></button>
      </div>

      <div className="admin-modal-body">
        <div className="admin-info-banner" style={{ marginBottom: 12 }}>
          <AlertCircle size={16} />
          <span>
            The same barista can be mapped to <strong>multiple cafes</strong>, reuse them
            freely if you don&rsquo;t have new approved baristas. The badge next to a name shows
            how many cafes already have them.
          </span>
        </div>

        <div className="assign-counter">
          <span className={`mapping-pill ${selected.size === 0 ? 'pill-warn' : selected.size === BARISTA_SLOTS_PER_CAFE ? 'pill-ok' : 'pill-mid'}`}>
            {selected.size} / {BARISTA_SLOTS_PER_CAFE} selected
          </span>
        </div>

        <div className="admin-search" style={{ marginBottom: 12 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by name, city, skill or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {approved.length === 0 ? (
          <div className="admin-empty">
            <UserCheck size={32} />
            <h3>No approved baristas</h3>
            <p>Approve baristas in the Baristas tab before mapping them to a cafe.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            No baristas match &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <ul className="assign-list">
            {filtered.map(b => {
              const isSelected = selected.has(b.id)
              const atLimit = selected.size >= BARISTA_SLOTS_PER_CAFE && !isSelected
              const mappedCount = counts?.get(b.id) || 0
              return (
                <li key={b.id} className={`assign-row ${isSelected ? 'selected' : ''} ${atLimit ? 'disabled' : ''}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={atLimit}
                      onChange={() => toggle(b.id)}
                    />
                    <div className="assign-row-info">
                      <div className="assign-row-name">
                        <strong>{b.full_name}</strong>
                        {mappedCount > 0 && (
                          <span className={`mapping-pill ${mappedCount >= 3 ? 'pill-warn' : 'pill-mid'}`} title="Times this barista is already mapped to a cafe">
                            mapped to {mappedCount} cafe{mappedCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <div className="assign-row-meta">
                        {b.current_location && <span><MapPin size={11} /> {b.current_location}</span>}
                        <span><Briefcase size={11} /> {b.experience_years || 0} yr{b.experience_years === 1 ? '' : 's'}</span>
                        {b.phone && <span><Phone size={11} /> {b.phone}</span>}
                      </div>
                      {b.skills && <div className="assign-row-skills">{b.skills}</div>}
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="admin-modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-blue" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : <><Save size={14} /> Save assignments</>}
        </button>
      </div>
    </form>
  )
}

// ===== BARISTA DETAILS MODAL =====
function BaristaDetailsModal({ barista, onClose }) {
  if (!barista) return null
  const b = barista
  const status = b.hired_at ? 'Hired' : b.approved ? 'Approved' : 'Pending review'
  const educationLines = (b.education || '').split('\n').map(s => s.trim()).filter(Boolean)
  const skills = (b.skills || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean)
  return (
    <div>
      <div className="admin-modal-header">
        <h2>Barista submission</h2>
        <button type="button" onClick={onClose} className="icon-btn">
          <X size={20} />
        </button>
      </div>
      <div className="admin-modal-body">
        <div className="barista-details">
          <div className="barista-details-photo">
            {b.photo_url
              ? <img src={b.photo_url} alt={b.full_name} />
              : <div className="barista-details-photo-empty"><Users size={36} /></div>}
            <span className={`pill pill-${b.hired_at ? 'expired' : b.approved ? 'active' : 'expiring'}`}>
              {status}
            </span>
          </div>
          <div className="barista-details-grid">
            <div className="barista-details-row">
              <label>Full name</label>
              <div><strong>{b.full_name || '-'}</strong></div>
            </div>
            <div className="barista-details-row">
              <label>Phone</label>
              <div>{b.phone ? <a href={`tel:${b.phone}`}>{b.phone}</a> : '-'}</div>
            </div>
            <div className="barista-details-row">
              <label>Email</label>
              <div>{b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : '-'}</div>
            </div>
            <div className="barista-details-row">
              <label>Location</label>
              <div>{b.current_location || '-'}</div>
            </div>
            <div className="barista-details-row">
              <label>Experience</label>
              <div>{b.experience_years || 0} year{(b.experience_years || 0) === 1 ? '' : 's'}</div>
            </div>
            <div className="barista-details-row">
              <label>Submitted</label>
              <div>{b.created_at ? new Date(b.created_at).toLocaleString() : '-'}</div>
            </div>
            {b.hired_at && (
              <div className="barista-details-row">
                <label>Hired on</label>
                <div>{new Date(b.hired_at).toLocaleString()}</div>
              </div>
            )}
            <div className="barista-details-row barista-details-row-full">
              <label>Experience summary</label>
              <div className="barista-details-text">{b.experience_summary || '-'}</div>
            </div>
            <div className="barista-details-row barista-details-row-full">
              <label>Education</label>
              {educationLines.length
                ? <ul className="barista-details-list">
                    {educationLines.map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                : <div className="barista-details-text">-</div>}
            </div>
            <div className="barista-details-row barista-details-row-full">
              <label>Skills</label>
              {skills.length
                ? <div className="barista-details-skills">
                    {skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}
                  </div>
                : <div className="barista-details-text">-</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="admin-modal-footer">
        <button type="button" className="btn btn-blue" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ===== PAYMENTS TAB =====
function PaymentsTab({ orders, enrollments, paidCafes }) {
  const [typeFilter, setTypeFilter] = useState('all') // all | order | course | directory

  const rows = useMemo(() => {
    const all = []
    for (const o of orders || []) {
      if (!o.payment_id && o.status === 'cancelled') continue
      all.push({
        id: `order-${o.id}`,
        type: 'order',
        when: o.created_at,
        paymentId: o.payment_id || '-',
        amount: Number(o.total) || 0,
        who: fullName(o.profiles, o.user_id?.slice(0, 8) || 'Guest'),
        email: o.profiles?.email || '',
        detail: `Order #${String(o.id).slice(0, 8)} • ${o.status || 'pending'}`,
      })
    }
    for (const e of enrollments || []) {
      const price = e.courses?.free ? 0 : Number(e.courses?.price) || 0
      all.push({
        id: `enroll-${e.id}`,
        type: 'course',
        when: e.enrolled_at,
        paymentId: e.payment_id || (e.courses?.free ? 'FREE' : '-'),
        amount: price,
        who: fullName(e.profiles, '-'),
        email: e.profiles?.email || '',
        detail: e.courses?.title || 'Course enrollment',
      })
    }
    for (const c of paidCafes || []) {
      all.push({
        id: `cafe-${c.user_id}-${c.payment_id || c.paid_at}`,
        type: 'directory',
        when: c.paid_at,
        paymentId: c.payment_id || '-',
        amount: Number(c.amount) || 0,
        who: fullName(c.profile, c.user_id?.slice(0, 8) || '-'),
        email: c.profile?.email || '',
        detail: `Directory access • ${accessStatus(c).label}`,
      })
    }
    return all.sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0))
  }, [orders, enrollments, paidCafes])

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return rows
    return rows.filter(r => r.type === typeFilter)
  }, [rows, typeFilter])

  const ctrl = useTableControls(filtered, ['paymentId', 'who', 'email', 'detail'])

  const totals = useMemo(() => {
    let order = 0, course = 0, directory = 0
    for (const r of rows) {
      if (r.type === 'order') order += r.amount
      else if (r.type === 'course') course += r.amount
      else if (r.type === 'directory') directory += r.amount
    }
    return { order, course, directory, total: order + course + directory }
  }, [rows])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Payments</h1>
          <p>{rows.length} total transactions • {fmt(totals.total)} gross</p>
        </div>
      </div>

      <div className="payments-summary">
        <div className="payments-summary-card">
          <span className="payments-summary-label"><ShoppingBag size={14} /> Shop orders</span>
          <strong>{fmt(totals.order)}</strong>
          <small>{rows.filter(r => r.type === 'order').length} payments</small>
        </div>
        <div className="payments-summary-card">
          <span className="payments-summary-label"><GraduationCap size={14} /> Course enrollments</span>
          <strong>{fmt(totals.course)}</strong>
          <small>{rows.filter(r => r.type === 'course').length} enrollments</small>
        </div>
        <div className="payments-summary-card">
          <span className="payments-summary-label"><Building2 size={14} /> Directory access</span>
          <strong>{fmt(totals.directory)}</strong>
          <small>{rows.filter(r => r.type === 'directory').length} purchases</small>
        </div>
      </div>

      <div className="admin-filter-row">
        {[
          { id: 'all', label: `All (${rows.length})` },
          { id: 'order', label: `Orders (${rows.filter(r => r.type === 'order').length})` },
          { id: 'course', label: `Courses (${rows.filter(r => r.type === 'course').length})` },
          { id: 'directory', label: `Directory (${rows.filter(r => r.type === 'directory').length})` },
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`admin-filter-chip ${typeFilter === opt.id ? 'active' : ''}`}
            onClick={() => setTypeFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <DollarSign size={48} />
          <h3>No payments yet</h3>
          <p>Incoming orders, course enrollments and directory purchases will appear here.</p>
        </div>
      ) : (
        <>
          <TableToolbar
            search={ctrl.search} setSearch={ctrl.setSearch}
            pageSize={ctrl.pageSize} setPageSize={ctrl.setPageSize}
            placeholder="Search by payment ID, customer or email…"
          />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Detail</th>
                  <th>Payment ID</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.slice.map(r => (
                  <tr key={r.id}>
                    <td>{r.when ? new Date(r.when).toLocaleString() : '-'}</td>
                    <td><span className={`pill pill-type-${r.type}`}>{r.type}</span></td>
                    <td>
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                        <strong>{r.who}</strong>
                        {r.email && <><br /><a href={`mailto:${r.email}`}>{r.email}</a></>}
                      </div>
                    </td>
                    <td>{r.detail}</td>
                    <td><code className="payments-pid">{r.paymentId}</code></td>
                    <td><strong>{fmt(r.amount)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...ctrl} />
        </>
      )}
    </div>
  )
}
