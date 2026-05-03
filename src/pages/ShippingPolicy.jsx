import { usePageMeta } from '../lib/usePageMeta'

export default function ShippingPolicy() {
  usePageMeta({
    title: 'Shipping & Delivery',
    description: 'Shipping, delivery times, and coverage areas for Mastermind Brews orders.',
  })
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Shipping & Delivery Policy</h1>
        <p className="policy-updated">Last updated: 15 April 2026</p>

        <section>
          <h2>1. Shipping Coverage</h2>
          <p>
            We currently ship to all serviceable pin codes across <strong>India</strong>.
            We do not offer international shipping at this time. If your pin code is not
            serviceable, you will be notified during checkout.
          </p>
        </section>

        <section>
          <h2>2. Shipping Charges</h2>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Order Value</th>
                <th>Shipping Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Above ₹999</td>
                <td><strong>FREE</strong></td>
              </tr>
              <tr>
                <td>Below ₹999</td>
                <td>₹79 flat rate</td>
              </tr>
            </tbody>
          </table>
          <p>Shipping charges (if applicable) are calculated and displayed at checkout before payment.</p>
        </section>

        <section>
          <h2>3. Processing Time</h2>
          <ul>
            <li>Orders are processed within <strong>1–2 business days</strong> after payment confirmation.</li>
            <li>Orders placed on weekends or public holidays will be processed on the next business day.</li>
            <li>You will receive an email with tracking details once your order is dispatched.</li>
          </ul>
        </section>

        <section>
          <h2>4. Estimated Delivery Time</h2>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Estimated Delivery</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mumbai & Mumbai Metropolitan Region</td>
                <td>1–3 business days</td>
              </tr>
              <tr>
                <td>Metro cities (Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune)</td>
                <td>3–5 business days</td>
              </tr>
              <tr>
                <td>Tier 2 & Tier 3 cities</td>
                <td>5–7 business days</td>
              </tr>
              <tr>
                <td>Remote / North-East India</td>
                <td>7–10 business days</td>
              </tr>
            </tbody>
          </table>
          <p>
            <em>Note: Delivery timelines are estimates and may vary due to courier partner performance,
            weather conditions, or unforeseen circumstances. These are business days and exclude
            Sundays and public holidays.</em>
          </p>
        </section>

        <section>
          <h2>5. Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive an email and/or SMS with a tracking
            number and a link to track your shipment in real time. You can also check your
            order status by logging into your account on our Site.
          </p>
        </section>

        <section>
          <h2>6. Delivery Issues</h2>
          <ul>
            <li><strong>Failed Delivery Attempt:</strong> If the courier is unable to deliver, they will make up to 2 additional attempts. If all attempts fail, the package will be returned to us.</li>
            <li><strong>Incorrect Address:</strong> Please ensure your shipping address is complete and accurate. We are not responsible for delays or non-delivery due to incorrect address details provided by the customer.</li>
            <li><strong>Damaged in Transit:</strong> If your package arrives damaged, please contact us within 48 hours with photos of the damaged package. We will arrange a replacement or refund as per our <a href="/refund-policy">Return & Refund Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2>7. Digital Products (Barista Academy Courses)</h2>
          <p>
            Digital courses purchased through our Barista Academy are delivered <strong>instantly</strong>.
            Course access is granted immediately upon successful payment and is available via
            your account on the Site. No physical shipping is involved for digital products.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>For any shipping or delivery queries:</p>
          <div className="policy-contact">
            <p><strong>Mastermind Bicycle Cafe & Bar (Mastermind Brews)</strong></p>
            <p>Avior Corporate Park, LBS Marg, Mulund West, Mumbai - 400080, Maharashtra, India</p>
            <p>Email: <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
            <p>Phone: <a href="tel:+918591850161">+91 85918 50161</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}
