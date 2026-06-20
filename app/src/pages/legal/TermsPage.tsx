import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex">
              <BrandLogo size="sm" tone="dark" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: May 19, 2026</p>

          <p className="text-gray-600 leading-relaxed mb-8 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm">
            MemberDate is an adults-only platform. These Terms are a general template for operating
            the service. They are not legal advice — have a qualified attorney review them for your
            jurisdiction before relying on them in production.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using MemberDate (&quot;we&quot;, &quot;us&quot;, or &quot;the
                Platform&quot;), you agree to be bound by these Terms of Service and our{' '}
                <Link to="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility &amp; Age</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You must be at least <strong>18 years of age</strong> (or the age of legal majority
                in your jurisdiction, whichever is higher) to register, browse, or communicate on
                MemberDate. By using the Platform you represent and warrant that you meet this
                requirement.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You agree to communicate only with other adults on the Platform and not to assist
                minors in accessing the service. We may suspend or terminate accounts we reasonably
                believe belong to or are used by persons under 18.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Adult Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                MemberDate may display adult-oriented material, including photos and videos of a
                sexual or suggestive nature, and allows private messaging and video communication
                between members. You access such content voluntarily and at your own discretion.
              </p>
              <p className="text-gray-600 leading-relaxed">
                If you are offended by adult material, or if such material is illegal where you are
                located, you must leave the Platform immediately and not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed">
                To use certain features of MemberDate, you must register for an account. You agree 
                to provide accurate and complete information during registration and to keep your 
                account information updated. You are responsible for maintaining the confidentiality 
                of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use MemberDate for any unlawful purpose or in any way that could 
                damage, disable, overburden, or impair our service. Prohibited activities include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Harassment, abuse, or harm to other users</li>
                <li>Posting false, misleading, or fraudulent content</li>
                <li>Impersonating another person or entity</li>
                <li>Collecting personal information of other users without consent</li>
                <li>Using automated systems or software to extract data</li>
                <li>Uploading viruses or malicious code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Content</h2>
              <p className="text-gray-600 leading-relaxed">
                You retain ownership of any content you post on MemberDate. However, by posting 
                content, you grant us a non-exclusive, royalty-free license to use, display, and 
                distribute your content in connection with our service. We reserve the right to 
                remove any content that violates these terms or our community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Payments &amp; Virtual Currency</h2>
              <p className="text-gray-600 leading-relaxed">
                Certain features of MemberDate require payment. Coin packs are purchased with
                cryptocurrency only through our secure checkout provider. All purchases are final
                and non-refundable unless otherwise specified. Prices are subject to change without
                notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for any 
                reason, including violation of these terms. Upon termination, your right to use 
                MemberDate will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimer &amp; Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                MemberDate is provided &quot;as is&quot; and &quot;as available&quot; without
                warranties of any kind. We do not guarantee uninterrupted, secure, or error-free
                operation, nor do we guarantee the conduct, identity, or age of any user.
              </p>
              <p className="text-gray-600 leading-relaxed">
                To the fullest extent permitted by law, MemberDate and its operators shall not be
                liable for any indirect, incidental, or consequential damages arising from your use
                of the Platform or interactions with other members, including where a user
                misrepresents their age. You use the Platform at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Questions about these Terms:{' '}
                <a href={SUPPORT_MAILTO} className="text-green-600 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2026 MemberDate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
