import { useEffect, useState } from 'react'
import { Star, Send, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getReviews, addReview, hasPurchasedProduct } from '../lib/database'
import toast from 'react-hot-toast'

function StarRow({ value, size = 14, onSelect }) {
  return (
    <span className="stars-row">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          fill={n <= value ? 'currentColor' : 'none'}
          stroke="currentColor"
          className={onSelect ? 'star-pickable' : ''}
          onClick={onSelect ? () => onSelect(n) : undefined}
        />
      ))}
    </span>
  )
}

export default function ProductReviews({ productId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    let active = true
    getReviews(productId)
      .then(r => { if (active) setReviews(r) })
      .catch(err => {
        console.error('getReviews failed', err)
        if (active) toast.error(err?.message || 'Could not load reviews')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [productId])

  // Only buyers may post — keeps the review wall honest.
  useEffect(() => {
    let active = true
    if (!user) { setCanReview(false); return }
    hasPurchasedProduct(user.id, productId).then((ok) => {
      if (active) setCanReview(!!ok)
    })
    return () => { active = false }
  }, [user, productId])

  const submit = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Login to leave a review')
    if (!comment.trim()) return toast.error('Add a short comment')
    setSubmitting(true)
    try {
      await addReview({ productId, userId: user.id, rating, comment: comment.trim() })
      toast.success('Review posted')
      setComment('')
      setRating(5)
      const r = await getReviews(productId)
      setReviews(r)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="product-reviews">
      <h4>Reviews</h4>

      {loading ? (
        <p className="text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first!</p>
      ) : (
        <ul className="reviews-list">
          {reviews.map(r => (
            <li key={r.id} className="review-item">
              <div className="review-head">
                <strong>
                  {r.profiles?.first_name || r.profiles?.last_name
                    ? `${r.profiles.first_name || ''} ${r.profiles.last_name || ''}`.trim()
                    : 'Anonymous'}
                </strong>
                <StarRow value={r.rating} />
                <span className="review-date">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p>{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {!user ? (
        <p className="text-muted">Login to leave a review.</p>
      ) : canReview ? (
        <form className="review-form" onSubmit={submit}>
          <div className="review-form-row">
            <label>Your rating:</label>
            <StarRow value={rating} size={18} onSelect={setRating} />
          </div>
          <textarea
            placeholder="Share your experience…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn btn-blue review-submit" disabled={submitting}>
            <Send size={14} /> {submitting ? 'Posting…' : 'Post review'}
          </button>
        </form>
      ) : (
        <p className="review-gated">
          <ShoppingBag size={14} />
          Only verified buyers can review this product. Place an order and come back here once it&rsquo;s delivered.
        </p>
      )}
    </div>
  )
}
