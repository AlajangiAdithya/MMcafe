import { usePageMeta } from '../lib/usePageMeta'

export default function TermsOfService() {
  usePageMeta({
    title: 'Terms & Conditions',
    description: 'Terms of service for Mastermind Brews: orders, payments, courses, account use, and Barista Directory.',
  })
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Terms & Conditions</h1>
        <p className="policy-updated">Last updated: 30 April 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to mastermindcafe.in (the "Site"), operated by Mastermind Bicycle Cafe
            & Bar, trading as <strong>Mastermind Brews</strong> ("we", "us", "our"). By
            accessing or using our Site, placing an order, enrolling in any course through
            our Barista Academy, submitting a profile to our Barista Directory, or
            purchasing access to our Barista Directory, you agree to be bound by these
            Terms & Conditions. If you do not agree, please do not use our Site.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <ul>
            <li>You must be at least 18 years of age to make a purchase or enrol in a course.</li>
            <li>By using our Site, you represent that you have the legal capacity to enter into a binding agreement.</li>
            <li>Our products and services are available only for delivery/access within India.</li>
          </ul>
        </section>

        <section>
          <h2>3. Products & Pricing</h2>
          <ul>
            <li>All product prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
            <li>We reserve the right to modify prices at any time without prior notice. The price at the time of order placement will be honoured.</li>
            <li>Product images are for illustrative purposes. Actual product packaging and appearance may vary slightly.</li>
            <li>We make every effort to ensure product availability, but items may go out of stock without notice.</li>
          </ul>
        </section>

        <section>
          <h2>4. Orders & Payments</h2>
          <ul>
            <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or reject any order.</li>
            <li>All payments are processed securely through <strong>Razorpay</strong>. We accept UPI, credit/debit cards, net banking, and wallets.</li>
            <li>You agree to provide current, complete, and accurate billing and payment information.</li>
            <li>An order is confirmed only after successful payment and an order confirmation email from us.</li>
            <li>In case of payment failure, the amount (if debited) will be refunded to your original payment method within 5–7 business days.</li>
          </ul>
        </section>

        <section>
          <h2>5. Barista Academy - Digital Courses</h2>
          <ul>
            <li>Course access is granted after successful payment and is tied to your registered account.</li>
            <li><strong>Each course enrollment grants 30 days of access</strong> from the date of enrollment. After 30 days, the enrollment expires and you will need to enroll again to continue watching. This applies to both paid and free courses.</li>
            <li>Course content is for personal, non-commercial use only. You may not record, redistribute, or share course materials.</li>
            <li>We reserve the right to update, modify, or discontinue course content at any time.</li>
            <li>Free courses may be removed or converted to paid courses at our discretion.</li>
            <li>Course completion certificates (if offered) are for personal development and do not constitute professional certification.</li>
          </ul>
        </section>

        <section>
          <h2>5A. Barista Directory</h2>
          <p>
            The Barista Directory is a paid hiring service that connects baristas with
            cafes that wish to hire them. The following terms apply in addition to the
            general terms above.
          </p>

          <h3>5A.1 For baristas (profile submitters)</h3>
          <ul>
            <li>You must be at least 18 years of age and legally entitled to work in India.</li>
            <li>You must submit only your own information, and the information must be true, current and accurate. Submitting another person&rsquo;s details or fabricated experience is grounds for immediate removal.</li>
            <li>Submitting a profile is <strong>free</strong>. We do not charge baristas any fee at any stage and do not take any commission on hires made through the directory.</li>
            <li>By submitting your profile, you grant us a non-exclusive, royalty-free, worldwide licence to display, transmit, and disclose the submitted information to access purchasers, as set out in our <a href="/privacy">Privacy Policy</a>.</li>
            <li>Your profile becomes visible only after our team approves it.</li>
            <li>You may request removal of your profile at any time by emailing <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>. Removal stops further disclosures but cannot recall information already viewed by access purchasers.</li>
            <li>The hiring relationship, if any, is solely between you and the cafe; we are not a party to it. We do not guarantee that any cafe will contact you, or that any contact will result in employment.</li>
          </ul>

          <h3>5A.2 For hiring cafes (access purchasers)</h3>
          <ul>
            <li>The access fee grants the registered account a personal, non-transferable licence to view a curated selection of up to 5 approved barista profiles assigned to you, and to contact those baristas for legitimate recruitment purposes only.</li>
            <li><strong>Directory access is valid for 20 days</strong> from the date of payment. Within this window, you must finalise any hiring decision and notify us by marking the relevant barista as &ldquo;hired&rdquo; in your account. After 20 days, or if your access is revoked by us following a hire, your access lapses and you must pay again to resume access. We may also revoke access manually at any time once a hire is confirmed.</li>
            <li>You may not scrape, bulk-export, redistribute, resell, or republish the contents of the directory in any form. You may not use the directory to send unsolicited marketing, spam, or any communication unrelated to recruitment.</li>
            <li>Access is tied to a single account. Sharing credentials, reselling access, or aggregating profiles into a competing service is a material breach of these terms and will result in immediate termination without refund.</li>
            <li>Mastermind Brews is not an employment agency or labour contractor and does not perform background checks beyond visual review of the submitted profile. You are solely responsible for verifying any candidate&rsquo;s identity, qualifications, and eligibility to work before extending an offer.</li>
            <li>The directory access fee is a service fee for operating, hosting and moderating the directory. It is <strong>non-refundable</strong> once access has been activated, except as expressly provided in our <a href="/refund-policy">Return & Refund Policy</a>.</li>
          </ul>

          <h3>5A.3 No employer-employee relationship with us</h3>
          <p>
            Mastermind Brews provides only the technology platform and listing service.
            We are not the employer of any barista listed in the directory and have no
            authority over the wages, working conditions, or any other terms of any
            employment that may result from a connection made through the directory.
          </p>
        </section>

        <section>
          <h2>6. Shipping & Delivery</h2>
          <p>
            Please refer to our{' '}
            <a href="/shipping">Shipping & Delivery Policy</a>{' '}
            for detailed information on shipping methods, timelines, and charges.
          </p>
        </section>

        <section>
          <h2>7. Returns & Refunds</h2>
          <p>
            Please refer to our{' '}
            <a href="/refund-policy">Return & Refund Policy</a>{' '}
            for complete details.
          </p>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <ul>
            <li>All content on this Site - including logos, text, images, graphics, course videos, and software - is the property of Mastermind Bicycle Cafe & Bar and is protected under Indian copyright and intellectual property laws.</li>
            <li>You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.</li>
            <li>"Mastermind Brews", "Mastermind Bicycle Cafe & Bar", and associated logos are trademarks of our business.</li>
          </ul>
        </section>

        <section>
          <h2>9. User Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activities that occur under your account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</li>
          </ul>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Mastermind Bicycle Cafe & Bar shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of the Site, products, or courses. Our total liability shall
            not exceed the amount paid by you for the specific product or service in question.
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Mastermind Bicycle Cafe & Bar, its owners,
            employees, and partners from any claims, damages, or expenses arising from your
            violation of these Terms or misuse of the Site.
          </p>
        </section>

        <section>
          <h2>12. Governing Law & Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India.
            Any disputes arising from these Terms shall be subject to the exclusive jurisdiction
            of the courts in Mumbai, Maharashtra, India.
          </p>
        </section>

        <section>
          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Changes will be effective
            immediately upon posting. Continued use of the Site after changes constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2>14. Grievance Officer</h2>
          <p>
            For complaints under the Information Technology Act, 2000 and the DPDP Act,
            2023, please contact our Grievance Officer at the address below with the
            subject line "Grievance". We will acknowledge within 48 hours and resolve
            within 30 days.
          </p>
        </section>

        <section>
          <h2>15. Contact Us</h2>
          <p>For questions regarding these Terms & Conditions, contact us at:</p>
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
