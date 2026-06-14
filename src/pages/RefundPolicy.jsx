import { usePageMeta } from '../lib/usePageMeta'
import PolicyLayout from '../components/PolicyLayout'

export default function RefundPolicy() {
  usePageMeta({
    title: 'Return & Refund Policy',
    description: 'Return and refund policy for Mastermind Brews orders, academy courses, and barista directory access.',
  })
  return (
    <PolicyLayout
      eyebrow="Legal · Mastermind Brews"
      title="Return & Refund Policy"
      updated="Last updated: 30 April 2026"
    >
        <section>
          <h2>1. Overview</h2>
          <p>
            At Mastermind Brews, we take great care in sourcing and packaging our coffee products.
            This policy outlines the terms for returns and refunds for purchases made on
            mastermindbrews.com. Once an order is placed, it is treated as final and moves into
            fulfilment immediately.
          </p>
        </section>

        <section>
          <h2>2. Returns - Physical Products (Coffee Beans & Powder)</h2>
          <h3>Eligible for Return</h3>
          <ul>
            <li>Damaged or defective products received upon delivery</li>
            <li>Wrong product delivered (different from what was ordered)</li>
            <li>Product received past its best-before date</li>
          </ul>

          <h3>Not Eligible for Return</h3>
          <ul>
            <li>Products that have been opened, used, or tampered with</li>
            <li>Products damaged due to mishandling after delivery</li>
            <li>Change of mind or taste preference</li>
            <li>Products where the seal is broken</li>
          </ul>

          <h3>How to Initiate a Return</h3>
          <ol>
            <li>Contact us within <strong>48 hours</strong> of receiving the product at <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></li>
            <li>Include your order number, photos of the damaged/wrong product, and a description of the issue</li>
            <li>Our team will review your request within <strong>24-48 hours</strong> and provide return instructions if approved</li>
            <li>Return shipping for eligible claims will be arranged by us at no cost to you</li>
          </ol>
        </section>

        <section>
          <h2>3. Refund - Physical Products</h2>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Refund</th>
                <th>Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Damaged / defective product</td>
                <td>Full refund or free replacement</td>
                <td>5-7 business days after inspection</td>
              </tr>
              <tr>
                <td>Wrong product delivered</td>
                <td>Full refund or correct product shipped</td>
                <td>5-7 business days after inspection</td>
              </tr>
              <tr>
                <td>Delivery refused by customer</td>
                <td>Refund minus shipping charges</td>
                <td>7-10 business days after return</td>
              </tr>
              <tr>
                <td>Payment deducted but order failed</td>
                <td>Full refund (automatic)</td>
                <td>5-7 business days</td>
              </tr>
            </tbody>
          </table>
          <p>All refunds will be credited to the <strong>original payment method</strong> used during purchase.</p>
        </section>

        <section>
          <h2>4. Refund - Digital Courses (Barista Academy)</h2>
          <ul>
            <li><strong>Free courses:</strong> No payment involved, no refund applicable.</li>
            <li><strong>Paid courses:</strong> Due to the digital nature of course content, all sales are <strong>final and non-refundable</strong> once access has been granted.</li>
            <li><strong>Exception:</strong> If you are unable to access the course due to a technical issue on our end that we cannot resolve within 72 hours, you are eligible for a full refund.</li>
          </ul>
        </section>

        <section>
          <h2>4A. Refund - Barista Directory Access (for hiring cafes)</h2>
          <ul>
            <li>The one-time directory access fee is a service fee for operating, hosting and moderating the Barista Directory. Once access is activated against your account, the service has been delivered.</li>
            <li><strong>All directory access purchases are final and non-refundable</strong> once access is activated, except in the cases below.</li>
            <li><strong>Duplicate / accidental charge:</strong> If you have been charged twice for the same account due to a system error, the duplicate amount will be fully refunded within 5&ndash;7 business days of being reported.</li>
            <li><strong>Service unavailability:</strong> If the directory is inaccessible to you for more than 7 consecutive days because of a fault on our end that we cannot resolve, you are eligible for a full refund.</li>
            <li><strong>No refund for:</strong> change of mind, no suitable barista found, low number of profiles in your city, baristas not responding, or successful hire elsewhere. The fee buys access to the directory; it does not guarantee a hire.</li>
          </ul>
        </section>

        <section>
          <h2>4B. Refund - Barista Profile Submissions</h2>
          <p>
            Submitting a barista profile is and remains <strong>free of charge</strong>. We
            do not collect any payment from baristas at any stage and therefore no refund
            applies. Profile removal requests are handled under our{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2>5. Non-Delivery / Lost Shipment</h2>
          <p>
            If your order is not delivered within the estimated delivery time, please contact us.
            We will coordinate with our shipping partner to trace the shipment. If the order is
            confirmed lost in transit, we will offer a <strong>full refund or re-shipment</strong> at no extra cost.
          </p>
        </section>

        <section>
          <h2>6. Disputes</h2>
          <p>
            If you have a payment-related dispute, please contact us first at{' '}
            <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>{' '}
            before raising a dispute with your bank or payment provider. We aim to resolve all
            issues amicably within <strong>48 hours</strong>.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>For any refund or return queries:</p>
          <div className="policy-contact">
            <p><strong>Mastermind Bicycle Cafe & Bar (Mastermind Brews)</strong></p>
            <p>Avior Corporate Park, LBS Marg, Mulund West, Mumbai - 400080, Maharashtra, India</p>
            <p>Email: <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
            <p>Phone: <a href="tel:+918591850161">+91 85918 50161</a></p>
          </div>
        </section>
    </PolicyLayout>
  )
}
