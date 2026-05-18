import { usePageMeta } from '../lib/usePageMeta'

export default function PrivacyPolicy() {
  usePageMeta({
    title: 'Privacy Policy',
    description: 'How Mastermind Brews collects, uses, stores, shares, and protects your data. DPDP Act 2023 compliant. Includes the Barista Directory data-sharing terms.',
  })
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Privacy Policy</h1>
        <p className="policy-updated">Last updated: 30 April 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Mastermind Bicycle Cafe & Bar ("we", "us", "our"), trading as
            <strong> Mastermind Brews</strong>, operates the website mastermindcafe.in
            (the "Site"). This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our Site, place an order,
            enrol in a course, or use our Barista Directory.
          </p>
          <p>
            This policy is published in compliance with Rule 3(1) of the Information
            Technology (Reasonable Security Practices and Procedures and Sensitive
            Personal Data or Information) Rules, 2011, and the Digital Personal Data
            Protection Act, 2023 ("DPDP Act").
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Customers (store and academy buyers)</h3>
          <p>When you register, place an order, or enrol in a course, we collect:</p>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping and billing address</li>
            <li>Payment information (processed securely via Razorpay, we do not store card or bank details on our servers)</li>
          </ul>

          <h3>2.2 Baristas (Barista Directory submissions)</h3>
          <p>
            When you submit your profile to the Barista Directory at <em>/barista-signup</em>,
            you are voluntarily providing the following information for the express purpose
            of being discovered and contacted by hiring cafes:
          </p>
          <ul>
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Current city / location</li>
            <li>Years of barista experience</li>
            <li>Free-text experience summary</li>
            <li>Training, courses or certificates (if any)</li>
            <li>Skills</li>
          </ul>
          <p>
            Submissions are reviewed by our team before being made visible. Submission of
            this form constitutes your <strong>explicit consent</strong> under Section 6
            of the DPDP Act for the data-sharing described in Section 5 of this policy.
          </p>

          <h3>2.3 Hiring cafes (directory access purchasers)</h3>
          <p>
            When a cafe owner or hiring manager pays for directory access, we collect their
            account email and the Razorpay payment reference for the transaction.
          </p>

          <h3>2.4 Automatically collected information</h3>
          <p>When you browse our Site, we may automatically collect:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited, time spent, and navigation paths</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To process and fulfil your orders and course enrolments</li>
            <li>To send order confirmations, shipping updates, and receipts</li>
            <li>To provide customer support</li>
            <li>To operate, review, and moderate the Barista Directory</li>
            <li>To make barista profiles available to paying hiring cafes (see Section 5)</li>
            <li>To send promotional emails and offers (you can opt out at any time)</li>
            <li>To improve our website, products, and services</li>
            <li>To prevent fraud and ensure security</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Payment Security</h2>
          <p>
            All payments are processed through <strong>Razorpay</strong>, a PCI-DSS compliant
            payment gateway. We do not store your credit/debit card details or banking
            information on our servers. Razorpay's privacy policy governs the handling
            of your payment data. For more information, visit{' '}
            <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">
              Razorpay's Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2>5. Sharing of Information</h2>
          <p>We share your information only as described below:</p>
          <ul>
            <li><strong>Payment Processors:</strong> Razorpay Software Pvt. Ltd., for processing transactions</li>
            <li><strong>Shipping Partners:</strong> Courier services for order delivery</li>
            <li><strong>Service Providers (sub-processors):</strong> Hosting and CDN (Netlify, Inc., USA), database and authentication (Supabase Inc., USA), video hosting and streaming for academy courses (Bunny.net / BunnyWay d.o.o., Slovenia/EU), transactional and notification email (EmailJS Pty Ltd, AU/USA), and, where you have given analytics consent, web analytics (Google LLC, USA, via Google Analytics 4). All sub-processors operate under their respective privacy and data-processing terms and only process the personal data necessary for the service they provide.</li>
            <li><strong>Legal Authorities:</strong> When required by law, court order, or government regulation</li>
          </ul>
          <p>
            Some of these sub-processors store data outside India. By using the
            Site you consent to the cross-border transfer of your personal data
            for the purposes set out in this policy, on the basis of contractual
            and security safeguards offered by these providers and as permitted
            under Section 16 of the DPDP Act, 2023.
          </p>

          <h3>5.1 Barista Directory, data sharing with hiring cafes</h3>
          <p>
            <strong>Important:</strong> The Barista Directory is a paid hiring service.
            Where you have submitted your details as a barista (Section 2.2), your profile
           , including <strong>your full name, phone number, email, city, years of
            experience, experience summary, training and skills</strong>, will be made
            available for viewing and direct contact by any user of the Site who has paid
            the one-time access fee for directory access.
          </p>
          <ul>
            <li>Access purchasers are not pre-screened or vetted by us. They are typically cafe owners, hiring managers and recruiters, but we cannot guarantee the identity, conduct, or intent of any access purchaser.</li>
            <li>The directory access fee is paid to Mastermind Brews for the service of operating, hosting and moderating the directory; it is <strong>not</strong> a commission on hires, and we do not take any payment from your eventual employment.</li>
            <li>Once a paying user has viewed your profile, we cannot recall information they have already seen, downloaded, or copied. Treat directory submission as a public-facing listing of your professional contact details.</li>
            <li>By submitting the barista form you grant us a non-exclusive, royalty-free, worldwide licence to display, transmit, and disclose the submitted information to access purchasers for the purposes of recruitment outreach.</li>
          </ul>

          <h3>5.2 No marketing-purpose sale</h3>
          <p>
            Other than the Barista Directory data-sharing described above, we do not
            sell, rent, or trade your personal information to third parties for
            marketing purposes.
          </p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>
            Our Site uses cookies to enhance your browsing experience, remember your preferences,
            and analyse site traffic. You can control cookies through your browser settings.
            Disabling cookies may affect the functionality of certain features.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this policy, comply with legal obligations, resolve disputes, and
            enforce our agreements. Order records are retained for a minimum of 8 years as
            required under Indian tax laws.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>Under the DPDP Act, 2023, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate or outdated information</li>
            <li>Request deletion of your account, personal data, or barista profile</li>
            <li>Opt out of marketing communications</li>
            <li>Withdraw consent for data processing (including barista directory listing) at any time, with prospective effect</li>
            <li>Nominate another individual to exercise these rights on your behalf in the event of death or incapacity</li>
            <li>Lodge a grievance with our Grievance Officer (Section 12) and, if unresolved, with the Data Protection Board of India</li>
          </ul>
          <p>
            To exercise any of these rights, email{' '}
            <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>{' '}
            with the subject line "Data Request, [Access/Correction/Deletion]".
            We will respond within 30 days. Note that withdrawal of consent for the
            Barista Directory takes effect from the date we remove your profile;
            information already disclosed to access purchasers cannot be recalled.
          </p>
        </section>

        <section>
          <h2>9. Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites. We are not responsible for
            the privacy practices of those websites. We encourage you to review their privacy
            policies before providing any personal information.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on
            this page with an updated "Last updated" date. Continued use of the Site after
            changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2>11. Children</h2>
          <p>
            Our Site, store, academy and Barista Directory are intended for users aged
            18 and above. We do not knowingly collect personal data from minors. If we
            learn that we have collected personal data from a minor, we will delete it
            promptly.
          </p>
        </section>

        <section>
          <h2>12. Grievance Officer</h2>
          <p>
            In accordance with the Information Technology Act, 2000 and the DPDP Act,
            2023, the Grievance Officer designated to address data and content concerns is:
          </p>
          <div className="policy-contact">
            <p><strong>Grievance Officer, Mastermind Brews</strong></p>
            <p>Mastermind Bicycle Cafe & Bar</p>
            <p>Avior Corporate Park, LBS Marg, Mulund West, Mumbai - 400080, Maharashtra, India</p>
            <p>Email: <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a> (subject line: "Grievance")</p>
            <p>Phone: <a href="tel:+918591850161">+91 85918 50161</a></p>
            <p>Working hours: Monday &ndash; Saturday, 10:00 &ndash; 19:00 IST</p>
          </div>
          <p>
            We will acknowledge grievances within 48 hours and resolve them within 30 days.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, contact us at:</p>
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
