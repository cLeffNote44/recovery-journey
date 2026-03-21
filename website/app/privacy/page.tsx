import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Recovery Journey',
  description: 'Privacy Policy for Recovery Journey recovery management platform.',
};

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24 lg:pt-44 lg:pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">
          Last updated: March 21, 2026
        </p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Introduction
            </h2>
            <p>
              Recovery Journey (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
              protecting the privacy and security of your personal information.
              This Privacy Policy describes how we collect, use, disclose, and
              safeguard information when you visit our website at
              recoverjourney.com or use our platform services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>Name, email address, phone number, and organization details when you request a demo or contact us</li>
              <li>Account information when you register for our platform</li>
              <li>Billing and payment information processed through secure third-party payment processors</li>
              <li>Communications you send to us via email, forms, or support channels</li>
            </ul>
            <p className="mt-3">
              We also collect certain information automatically when you visit
              our website, including IP address, browser type, operating system,
              referring URLs, and pages visited. We use cookies and similar
              technologies for analytics and to improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Protected Health Information
            </h2>
            <p>
              As a HIPAA-compliant platform, we may process Protected Health
              Information (PHI) on behalf of our covered entity customers. PHI
              is handled in accordance with HIPAA regulations and applicable
              Business Associate Agreements. We do not use PHI for marketing
              purposes and access is strictly limited to authorized personnel
              for operational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>To provide, maintain, and improve our platform services</li>
              <li>To process demo requests and communicate about our services</li>
              <li>To send administrative notifications such as service updates and security alerts</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To analyze usage patterns and improve our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Data Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third
              parties. We may share information with trusted service providers
              who assist in operating our platform, subject to confidentiality
              obligations. We may disclose information when required by law or to
              protect rights, safety, or property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Data Security
            </h2>
            <p>
              We implement administrative, technical, and physical safeguards to
              protect your information, including AES-256 encryption at rest,
              TLS 1.3 encryption in transit, role-based access controls,
              comprehensive audit logging, and regular security assessments.
              While we strive to protect your data, no method of transmission or
              storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes described in this
              policy. PHI is retained in accordance with applicable healthcare
              regulations and our Business Associate Agreements. Upon account
              termination, data is retained for 90 days before secure deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              information. You may opt out of marketing communications at any
              time. To exercise these rights, contact us at
              privacy@recoverjourney.com. We will respond to your request within
              30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our services are not directed to individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              we become aware that a child has provided us with personal
              information, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the updated policy on
              our website and updating the effective date. Your continued use of
              our services after changes are posted constitutes acceptance of the
              revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our privacy
              practices, contact us at:
            </p>
            <p className="mt-2 text-sm">
              Recovery Journey
              <br />
              Email: privacy@recoverjourney.com
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
