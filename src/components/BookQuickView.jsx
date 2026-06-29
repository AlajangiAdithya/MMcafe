import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ShieldCheck, BookOpen, User as UserIcon, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { addBookPurchase, getBookDownloadUrl } from '../lib/database'
import { payAndVerify } from '../lib/payments'
import { sendBookEmail } from '../lib/email'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

/**
 * Storefront quick-view + buy/download flow for a single book.
 * Self-contained shadcn Dialog so it never disturbs the surrounding page
 * aesthetic. Content is styled with project CSS (.book-qv-*) on the espresso
 * palette; the shadcn primitives bring their own (token-driven) styling.
 */
export default function BookQuickView({ book, open, onOpenChange, purchased, onPurchased }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [owned, setOwned] = useState(!!purchased)
  const [busy, setBusy] = useState(false)        // buy in progress
  const [downloading, setDownloading] = useState(false)

  // Keep local ownership in sync when the parent (or a fresh open) changes it.
  useEffect(() => { setOwned(!!purchased) }, [purchased, book?.id, open])

  if (!book) return null

  const price = Number(book.price || 0)
  const isFree = book.free || price <= 0
  const customerName = user?.user_metadata?.first_name || user?.user_metadata?.full_name || ''

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const url = await getBookDownloadUrl(book.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(e.message || 'Could not start the download')
    } finally {
      setDownloading(false)
    }
  }

  const finishPurchase = (total) => {
    setOwned(true)
    onPurchased?.(book.id)
    toast.success(`"${book.title}" added to your library`)
    sendBookEmail({
      customerName,
      customerEmail: user.email,
      orderId: `BOOK-${book.id}`,
      bookTitle: book.title,
      total,
      bookCover: book.cover_image,
    })
  }

  const handleBuy = () => {
    if (busy) return
    if (!user) {
      toast.error('Please sign in to buy this book')
      navigate('/login')
      return
    }
    setBusy(true)

    if (isFree) {
      addBookPurchase({ userId: user.id, bookId: book.id })
        .then(() => finishPurchase(0))
        .catch((err) => toast.error(err?.message || 'Could not add the book'))
        .finally(() => setBusy(false))
      return
    }

    payAndVerify({
      kind: 'book',
      bookId: book.id,
      customer: { name: customerName, email: user.email },
      brandName: book.title,
      onSuccess: () => { finishPurchase(price); setBusy(false) },
      onFailure: (msg) => { toast.error(msg || 'Payment failed'); setBusy(false) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="book-qv-content">
        <DialogHeader>
          <DialogTitle className="book-qv-title">{book.title}</DialogTitle>
          <DialogDescription className="book-qv-sub">
            {book.author ? `By ${book.author}` : 'Coffee guide'}
            {book.pages ? ` · ${book.pages} pages` : ''} · PDF
          </DialogDescription>
        </DialogHeader>

        <div className="book-qv-body">
          <div className="book-qv-cover">
            {book.cover_image ? (
              <img src={book.cover_image} alt={book.title} loading="lazy" />
            ) : (
              <div className="book-qv-cover-empty"><BookOpen size={28} /></div>
            )}
            <Badge variant={isFree ? 'accent' : 'secondary'} className="book-qv-price-badge">
              {isFree ? 'FREE' : `₹${price.toLocaleString()}`}
            </Badge>
          </div>

          <div className="book-qv-detail">
            <div className="book-qv-meta">
              {book.author && <span><UserIcon size={13} /> {book.author}</span>}
              {book.pages ? <span><BookOpen size={13} /> {book.pages} pages</span> : null}
            </div>
            {book.description && <p className="book-qv-desc">{book.description}</p>}

            {owned ? (
              <div className="book-qv-owned">
                <Badge variant="default" className="book-qv-owned-badge">In your library</Badge>
                <Button onClick={handleDownload} disabled={downloading} className="book-qv-cta">
                  {downloading
                    ? <><Loader2 size={16} className="spin" /> Preparing…</>
                    : <><Download size={16} /> Download PDF</>}
                </Button>
              </div>
            ) : (
              <Button onClick={handleBuy} disabled={busy} className="book-qv-cta">
                {busy
                  ? <><Loader2 size={16} className="spin" /> Processing…</>
                  : isFree
                    ? <><Download size={16} /> Get it free</>
                    : <><Lock size={16} /> Buy ₹{price.toLocaleString()}</>}
              </Button>
            )}

            <p className="book-qv-secure">
              <ShieldCheck size={13} />
              {owned
                ? 'Secure, watermark-ready download link, generated just for you.'
                : 'Server-verified payment via Razorpay. Yours to keep forever.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
