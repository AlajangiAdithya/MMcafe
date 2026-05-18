/**
 * EmailJS transactional email helpers.
 *
 * Setup steps:
 *   1. Sign up at https://www.emailjs.com
 *   2. Add an Email Service (Gmail recommended). Note the Service ID.
 *   3. Use the built-in "Order Confirmation" template or create your own.
 *   4. Go to Account > API Keys. Note your Public Key.
 *   5. Add all three to .env (see VITE_EMAILJS_* vars).
 *
 * Template variables used:
 *   {{to_name}}        customer name
 *   {{to_email}}       customer email (recipient)
 *   {{order_id}}       order or payment ID
 *   {{#orders}}        loop over items:
 *     {{name}}         item name
 *     {{units}}        quantity
 *     {{price}}        item price
 *   {{/orders}}
 *   {{cost.shipping}}  shipping cost
 *   {{cost.tax}}       tax (0 for now)
 *   {{cost.total}}     grand total
 *
 * Required env vars:
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 */

import emailjs from '@emailjs/browser'

const SERVICE_ID         = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID        = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const RESET_TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || ''
const STATUS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID || ''
const PUBLIC_KEY         = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const SITE_URL           = import.meta.env.VITE_SITE_URL || window.location.origin
const LOGO_URL           = `${SITE_URL}/logo.png`

const STATUS_HEADLINES = {
  confirmed:  'We received your order',
  processing: 'Your order is being prepared',
  shipped:    'Your order is on the way',
  delivered:  'Your order has been delivered',
  cancelled:  'Your order has been cancelled',
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
 * @param {Array}  params.items     [{ name, qty, price }]
 * @param {number} params.shipping  shipping cost
 * @param {number} params.total     grand total
 */
export async function sendOrderEmail({
  customerName,
  customerEmail,
  orderId,
  items,
  shipping = 0,
  total,
}) {
  if (!isEmailConfigured()) {
    console.info('EmailJS not configured. Skipping email. Set VITE_EMAILJS_* in .env.')
    return
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: customerEmail,
      to_name: customerName,
      logo_url: LOGO_URL,
      site_url: SITE_URL,
      order_id: orderId,
      orders: items.map(i => ({
        name: i.name,
        units: i.qty,
        price: (i.price * i.qty).toLocaleString(),
      })),
      cost: {
        shipping: shipping > 0 ? shipping.toLocaleString() : 'FREE',
        total: Number(total).toLocaleString(),
      },
    }, PUBLIC_KEY)
    console.info('Order confirmation email sent to', customerEmail)
  } catch (err) {
    // Never block checkout on email failure
    console.warn('Failed to send confirmation email:', err)
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
 */
export async function sendCourseEmail({
  customerName,
  customerEmail,
  orderId,
  courseTitle,
  total,
}) {
  if (!isEmailConfigured()) {
    console.info('EmailJS not configured. Skipping email. Set VITE_EMAILJS_* in .env.')
    return
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: customerEmail,
      to_name: customerName,
      logo_url: LOGO_URL,
      site_url: SITE_URL,
      order_id: orderId,
      orders: [{
        name: courseTitle,
        units: 1,
        price: total > 0 ? Number(total).toLocaleString() : 'FREE',
      }],
      cost: {
        shipping: 'N/A',
        total: total > 0 ? Number(total).toLocaleString() : 'FREE',
      },
    }, PUBLIC_KEY)
    console.info('Course confirmation email sent to', customerEmail)
  } catch (err) {
    console.warn('Failed to send confirmation email:', err)
  }
}

/**
 * Send a password reset link via EmailJS.
 * Template variables sent (match the MMCafe reset template):
 *   {{email}}      recipient address (also used as the EmailJS "To" field
 *                  if your template is configured that way)
 *   {{to_email}}   same as above (for templates using "To Email" = {{to_email}})
 *   {{to_name}}    recipient display name
 *   {{link}}       full reset URL (with token query param)
 *   {{logo_url}}   site logo
 *   {{site_url}}   site root
 *
 * Throws on failure so the caller can show a clear error.
 */
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
  try {
    await emailjs.send(SERVICE_ID, templateId, {
      to_email: customerEmail,
      to_name: customerName || (customerEmail ? customerEmail.split('@')[0] : ''),
      logo_url: LOGO_URL,
      site_url: SITE_URL,
      order_id: order?.id ? String(order.id) : '-',
      status,
      headline,
      orders: items.map((i) => ({
        name: i.name,
        units: i.qty,
        price: ((Number(i.price) || 0) * (Number(i.qty) || 0)).toLocaleString(),
      })),
      cost: {
        shipping: 'N/A',
        total: Number(order?.total || 0).toLocaleString(),
      },
    }, PUBLIC_KEY)
    console.info(`Order status email sent (${status}) →`, customerEmail)
  } catch (err) {
    console.warn('Failed to send order status email:', err)
  }
}

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
