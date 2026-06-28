/**
 * EmailJS transactional email helpers.
 *
 * These build a COMPLETE, self-contained branded HTML email in code and send it
 * to EmailJS as a single `content_html` variable. This gives us full control of
 * currency (₹), brand colours, item images and layout — instead of relying on
 * EmailJS's stock "Order Confirmation" template (which hardcodes "$", a green
 * banner and broken image slots).
 *
 * ⚠️ ONE-TIME EMAILJS SETUP (required for the new look to render):
 *   In your EmailJS template (VITE_EMAILJS_TEMPLATE_ID), set:
 *     • Subject  : {{subject}}
 *     • Content  : switch the editor to "Code"/HTML mode and put ONLY:  {{{content_html}}}
 *       (triple braces = unescaped HTML; double braces would print the raw tags)
 *     • To Email : {{to_email}}
 *   Do the same for the status template if you use a separate one.
 *
 * Required env vars:
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 *   VITE_SITE_URL            (optional; used for absolute asset/logo URLs)
 */

import emailjs from '@emailjs/browser'

const SERVICE_ID         = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID        = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const RESET_TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || ''
const STATUS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID || ''
const PUBLIC_KEY         = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

// Cafe inbox that receives a "new order placed" alert. When unset, the cafe
// notification simply no-ops (customer emails are unaffected).
const CAFE_NOTIFY_EMAIL  = import.meta.env.VITE_CAFE_NOTIFY_EMAIL || ''

// Where the email client should load images from. Never use localhost here —
// mail clients can't reach a dev machine, which is why logos/items show broken.
const ASSET_BASE = (import.meta.env.VITE_SITE_URL || 'https://www.mastermindbrews.com').replace(/\/$/, '')
const LOGO_URL   = `${ASSET_BASE}/logo.png`
// Kept for templates/links that still reference the live site root.
const SITE_URL   = ASSET_BASE

const BRAND = {
  ink:   '#2a1c10',
  gold:  '#B88E2F',
  cream: '#f3eee2',
  line:  '#eee4d2',
  muted: '#8a7a62',
}

const STATUS_HEADLINES = {
  confirmed:  'We received your order',
  processing: 'Your order is being prepared',
  shipped:    'Your order is on the way',
  delivered:  'Your order has been delivered',
  cancelled:  'Your order has been cancelled',
}

/** Format a number as Indian Rupees. Passes through FREE / N/A labels. */
function inr(value) {
  if (value === 'FREE' || value === 'N/A' || value === '' || value == null) return value
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value)
  return '₹' + num.toLocaleString('en-IN')
}

/** Make any image path absolute so mail clients can load it. */
function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) return path
  return `${ASSET_BASE}/${String(path).replace(/^\//, '')}`
}

/** Minimal HTML escaping for user-supplied text (names, product titles). */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Full branded HTML shell. All styling is inline + table-based for email clients. */
function emailShell({ heading, intro, bodyHtml }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BRAND.line};">
        <tr><td style="height:6px;background:linear-gradient(90deg,#8a6a1f,#B88E2F,#e8c896,#B88E2F);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:26px 32px 6px;">
          <img src="${LOGO_URL}" alt="Mastermind Brews" width="42" height="42" style="display:inline-block;vertical-align:middle;border:0;border-radius:8px;">
          <span style="font-size:18px;font-weight:bold;color:${BRAND.ink};vertical-align:middle;padding-left:10px;letter-spacing:.3px;">Mastermind Brews</span>
        </td></tr>
        <tr><td style="padding:14px 32px 0;">
          <h1 style="margin:0;font-size:22px;line-height:1.25;color:${BRAND.ink};">${esc(heading)}</h1>
          ${intro ? `<p style="margin:8px 0 0;color:${BRAND.muted};font-size:14px;line-height:1.6;">${esc(intro)}</p>` : ''}
        </td></tr>
        <tr><td style="padding:18px 32px 28px;">${bodyHtml}</td></tr>
        <tr><td style="padding:18px 32px;background:${BRAND.ink};color:#e8dcc8;font-size:12px;line-height:1.7;">
          You're receiving this email because of an order or enrolment at Mastermind Brews.<br>
          <a href="${SITE_URL}" style="color:#e8c896;text-decoration:none;">www.mastermindbrews.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/** Build the line-item rows for an order/course email. */
function itemRows(items) {
  return items.map((i) => {
    const img = assetUrl(i.image)
    const lineTotal = inr((Number(i.price) || 0) * (Number(i.qty) || 1))
    return `<tr>
      <td width="56" style="padding:12px 0;border-bottom:1px solid ${BRAND.line};">
        ${img ? `<img src="${img}" width="48" height="48" alt="" style="display:block;border-radius:8px;border:1px solid ${BRAND.line};object-fit:cover;">` : ''}
      </td>
      <td style="padding:12px 12px;border-bottom:1px solid ${BRAND.line};">
        <div style="color:${BRAND.ink};font-size:14px;font-weight:bold;">${esc(i.name)}</div>
        <div style="color:${BRAND.muted};font-size:12px;padding-top:2px;">Qty: ${esc(i.qty)}</div>
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.line};color:${BRAND.ink};font-size:14px;font-weight:bold;white-space:nowrap;">${lineTotal}</td>
    </tr>`
  }).join('')
}

/** A right-aligned totals row. `strong` makes it the grand-total style. */
function totalRow(label, value, strong = false) {
  const weight = strong ? 'bold' : 'normal'
  const color = strong ? BRAND.ink : BRAND.muted
  const size = strong ? '16px' : '13px'
  const border = strong ? `border-top:2px solid ${BRAND.ink};` : ''
  return `<tr>
    <td style="padding:7px 0;${border}color:${color};font-size:${size};">${esc(label)}</td>
    <td align="right" style="padding:7px 0;${border}color:${color};font-size:${size};font-weight:${weight};white-space:nowrap;">${value}</td>
  </tr>`
}

function orderBody({ orderId, items, subtotal, shipping, discount, total }) {
  const rows = itemRows(items)
  const totals = [
    subtotal != null ? totalRow('Subtotal', inr(subtotal)) : '',
    totalRow('Shipping', shipping > 0 ? inr(shipping) : 'FREE'),
    discount > 0 ? totalRow('Discount', '-' + inr(discount)) : '',
    totalRow('Order Total', inr(total), true),
  ].join('')

  return `
    <div style="font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.08em;">Order</div>
    <div style="font-size:15px;color:${BRAND.ink};font-weight:bold;padding:2px 0 14px;">#${esc(orderId)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${totals}</table>
    <p style="margin:22px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">We'll email you tracking details as soon as your order ships.</p>`
}

/**
 * Check if EmailJS is configured.
 */
export function isEmailConfigured() {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
}

/**
 * Send a product order confirmation email.
 * Fails silently so it never blocks the order flow.
 *
 * @param {Object} params
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.orderId
 * @param {Array}  params.items     [{ name, qty, price, image? }]
 * @param {number} [params.subtotal]
 * @param {number} params.shipping  shipping cost
 * @param {number} [params.discount]
 * @param {number} params.total     grand total
 */
export async function sendOrderEmail({
  customerName,
  customerEmail,
  orderId,
  items,
  subtotal,
  shipping = 0,
  discount = 0,
  total,
}) {
  if (!isEmailConfigured()) {
    console.info('EmailJS not configured. Skipping email. Set VITE_EMAILJS_* in .env.')
    return
  }

  const content_html = emailShell({
    heading: 'Thank you for your order',
    intro: `Hi ${customerName || 'there'}, your order is confirmed. Here's your receipt.`,
    bodyHtml: orderBody({ orderId, items, subtotal, shipping, discount, total }),
  })

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: customerEmail,
      to_name: customerName,
      subject: `Order confirmed · #${orderId}`,
      order_id: orderId,
      content_html,
      // Legacy fields kept so an un-migrated template still has data:
      logo_url: LOGO_URL,
      site_url: SITE_URL,
    }, PUBLIC_KEY)
    console.info('Order confirmation email sent to', customerEmail)
  } catch (err) {
    // Never block checkout on email failure
    console.warn('Failed to send confirmation email:', err)
  }
}

/** A label/value detail row for the cafe-facing order alert. */
function detailRow(label, value) {
  if (value == null || value === '') return ''
  return `<tr>
    <td style="padding:5px 12px 5px 0;color:${BRAND.muted};font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:5px 0;color:${BRAND.ink};font-size:13px;font-weight:bold;">${esc(value)}</td>
  </tr>`
}

/**
 * Notify the cafe/admin that a new order was placed.
 * Internal email, points staff to the admin panel for fulfilment.
 * No-ops when VITE_CAFE_NOTIFY_EMAIL isn't set. Fails silently so it never
 * blocks the customer's checkout.
 *
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} [params.customerPhone]
 * @param {Object} [params.shippingAddress]  { addressLine, city, state, pincode }
 * @param {Array}  params.items              [{ name, qty, price, image? }]
 * @param {number} [params.subtotal]
 * @param {number} [params.shipping]
 * @param {number} [params.discount]
 * @param {number} params.total
 */
export async function sendCafeOrderEmail({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items = [],
  subtotal,
  shipping = 0,
  discount = 0,
  total,
}) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_ID || !CAFE_NOTIFY_EMAIL) {
    console.info('Cafe notify email skipped (set VITE_CAFE_NOTIFY_EMAIL + EmailJS vars).')
    return
  }

  const addr = shippingAddress || {}
  const addressLine = [
    addr.line1 || addr.addressLine || addr.address,
    addr.line2,
    addr.city,
    addr.state,
    addr.pincode,
  ].filter(Boolean).join(', ')

  const detailsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      ${detailRow('Customer', customerName)}
      ${detailRow('Email', customerEmail)}
      ${detailRow('Phone', customerPhone)}
      ${detailRow('Ship to', addressLine)}
    </table>`

  const itemCount = items.reduce((n, i) => n + (Number(i.qty) || 1), 0)
  const totals = [
    subtotal != null ? totalRow('Subtotal', inr(subtotal)) : '',
    totalRow('Shipping', shipping > 0 ? inr(shipping) : 'FREE'),
    discount > 0 ? totalRow('Discount', '-' + inr(discount)) : '',
    totalRow('Order Total', inr(total), true),
  ].join('')

  const bodyHtml = `
    <div style="font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.08em;">New order</div>
    <div style="font-size:15px;color:${BRAND.ink};font-weight:bold;padding:2px 0 14px;">#${esc(orderId)} · ${itemCount} item${itemCount === 1 ? '' : 's'}</div>
    ${detailsHtml}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(items)}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${totals}</table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
      <tr><td style="border-radius:8px;background:${BRAND.gold};">
        <a href="${SITE_URL}/admin" style="display:inline-block;padding:12px 22px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none;">Open the admin panel →</a>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6;">Manage and fulfil this order from the Orders tab in the admin panel.</p>`

  const content_html = emailShell({
    heading: `New order placed · #${orderId}`,
    intro: `${customerName || 'A customer'} just placed an order. Full details are in the admin panel.`,
    bodyHtml,
  })

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: CAFE_NOTIFY_EMAIL,
      to_name: 'Mastermind Cafe',
      subject: `🛎️ New order #${orderId} · ${inr(total)}`,
      order_id: orderId,
      content_html,
      logo_url: LOGO_URL,
      site_url: SITE_URL,
    }, PUBLIC_KEY)
    console.info('Cafe new-order alert sent →', CAFE_NOTIFY_EMAIL)
  } catch (err) {
    console.warn('Failed to send cafe order alert:', err)
  }
}

/**
 * Send a course enrollment confirmation email.
 * Fails silently so it never blocks the enrollment flow.
 *
 * @param {Object} params
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.orderId
 * @param {string} params.courseTitle
 * @param {number} params.total
 * @param {string} [params.courseImage]
 */
export async function sendCourseEmail({
  customerName,
  customerEmail,
  orderId,
  courseTitle,
  total,
  courseImage,
}) {
  if (!isEmailConfigured()) {
    console.info('EmailJS not configured. Skipping email. Set VITE_EMAILJS_* in .env.')
    return
  }

  const isFree = !(Number(total) > 0)
  const bodyHtml = `
    <div style="font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.08em;">Enrolment</div>
    <div style="font-size:15px;color:${BRAND.ink};font-weight:bold;padding:2px 0 14px;">#${esc(orderId)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows([{ name: courseTitle, qty: 1, price: Number(total) || 0, image: courseImage }])}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      ${totalRow('Amount paid', isFree ? 'FREE' : inr(total), true)}
    </table>
    <p style="margin:22px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">You can start learning anytime from <a href="${SITE_URL}/my-courses" style="color:${BRAND.gold};text-decoration:none;">My Courses</a>.</p>`

  const content_html = emailShell({
    heading: "You're enrolled 🎉",
    intro: `Hi ${customerName || 'there'}, you now have access to ${courseTitle}.`,
    bodyHtml,
  })

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: customerEmail,
      to_name: customerName,
      subject: `You're enrolled · ${courseTitle}`,
      order_id: orderId,
      content_html,
      logo_url: LOGO_URL,
      site_url: SITE_URL,
    }, PUBLIC_KEY)
    console.info('Course confirmation email sent to', customerEmail)
  } catch (err) {
    console.warn('Failed to send confirmation email:', err)
  }
}

/**
 * Notify a customer that their order's status changed (e.g. shipped).
 * Falls back to the standard order template when the dedicated status
 * template is not configured. Fails silently, status updates must not
 * block the admin UI.
 */
export async function sendOrderStatusEmail({ order, status, customerEmail, customerName }) {
  if (!SERVICE_ID || !PUBLIC_KEY) return
  const templateId = STATUS_TEMPLATE_ID || TEMPLATE_ID
  if (!templateId) return
  const headline = STATUS_HEADLINES[status] || `Your order status is now ${status}`
  const items = Array.isArray(order?.items) ? order.items : []

  const content_html = emailShell({
    heading: headline,
    intro: `Hi ${customerName || 'there'}, here's the latest on your order.`,
    bodyHtml: orderBody({
      orderId: order?.id ? String(order.id) : '-',
      items,
      shipping: Number(order?.shipping) || 0,
      total: Number(order?.total || 0),
    }),
  })

  try {
    await emailjs.send(SERVICE_ID, templateId, {
      to_email: customerEmail,
      to_name: customerName || (customerEmail ? customerEmail.split('@')[0] : ''),
      subject: `${headline} · #${order?.id ?? ''}`,
      order_id: order?.id ? String(order.id) : '-',
      status,
      content_html,
      logo_url: LOGO_URL,
      site_url: SITE_URL,
    }, PUBLIC_KEY)
    console.info(`Order status email sent (${status}) →`, customerEmail)
  } catch (err) {
    console.warn('Failed to send order status email:', err)
  }
}

/**
 * Send a password reset link via EmailJS.
 * Uses the dedicated reset template (its own layout), so it is unaffected by
 * the content_html order template. Throws on failure so the caller can show
 * a clear error.
 */
export async function sendPasswordResetEmail({ toEmail, toName = '', resetLink }) {
  if (!SERVICE_ID || !PUBLIC_KEY || !(RESET_TEMPLATE_ID || TEMPLATE_ID)) {
    throw new Error('Email service is not configured. Please contact support.')
  }
  const templateId = RESET_TEMPLATE_ID || TEMPLATE_ID
  const friendlyName = toName || toEmail.split('@')[0]
  await emailjs.send(SERVICE_ID, templateId, {
    email: toEmail,
    to_email: toEmail,
    to_name: friendlyName,
    link: resetLink,
    logo_url: LOGO_URL,
    site_url: SITE_URL,
  }, PUBLIC_KEY)
}
