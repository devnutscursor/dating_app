import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

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
          <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using MemberDate, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 leading-relaxed">
                You must be at least 18 years old to use MemberDate. By using our service, you 
                represent and warrant that you are at least 18 years old and have the legal capacity 
                to enter into these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed">
                To use certain features of MemberDate, you must register for an account. You agree 
                to provide accurate and complete information during registration and to keep your 
                account information updated. You are responsible for maintaining the confidentiality 
                of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Content</h2>
              <p className="text-gray-600 leading-relaxed">
                You retain ownership of any content you post on MemberDate. However, by posting 
                content, you grant us a non-exclusive, royalty-free license to use, display, and 
                distribute your content in connection with our service. We reserve the right to 
                remove any content that violates these terms or our community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payments</h2>
              <p className="text-gray-600 leading-relaxed">
                Certain features of MemberDate require payment. Coin packs are purchased with
                cryptocurrency only through our secure checkout provider. All purchases are final
                and non-refundable unless otherwise specified. Prices are subject to change without
                notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for any 
                reason, including violation of these terms. Upon termination, your right to use 
                MemberDate will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed">
                MemberDate is provided &quot;as is&quot; without warranties of any kind. We do not 
                guarantee that our service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at 
                support@memberdate.com.
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
