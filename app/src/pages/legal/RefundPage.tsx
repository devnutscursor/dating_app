import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function RefundPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. General Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                At MemberDate, we strive to ensure your satisfaction with our services. All purchases 
                of coins and premium features are generally final and non-refundable. However, we 
                understand that exceptional circumstances may occur, and we review refund requests 
                on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligible Refund Cases</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may consider refunds in the following situations:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Technical errors that prevented service delivery</li>
                <li>Unauthorized transactions (subject to investigation)</li>
                <li>Duplicate charges</li>
                <li>Service not delivered as described due to platform error</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Non-Refundable Items</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The following are generally not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Coins that have been used or spent</li>
                <li>Completed video calls</li>
                <li>Unlocked content (photos/videos)</li>
                <li>Gifts sent to other users</li>
                <li>Profile boosts that have been activated</li>
                <li>Change of mind after purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                <li>Contact us at {SUPPORT_EMAIL} within 14 days of the transaction</li>
                <li>Provide your transaction ID and reason for the refund</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, refunds will be sent to the same cryptocurrency wallet or payment used for the purchase, where technically possible</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Refund Timeline</h2>
              <p className="text-gray-600 leading-relaxed">
                Approved refunds are typically processed within 5-10 business days. The time it
                takes for funds to appear depends on the cryptocurrency network and your wallet
                provider and may take additional time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Disputes and Chargebacks</h2>
              <p className="text-gray-600 leading-relaxed">
                We encourage users to contact us directly for refund requests before disputing a
                crypto payment with their wallet or exchange. Unauthorized or abusive disputes may
                result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For refund requests or questions about this policy, please contact us at{' '}
                <a href={SUPPORT_MAILTO} className="text-green-600 hover:underline">
                  {SUPPORT_EMAIL}
                </a>{' '}
                with the subject line &quot;Refund Request&quot;.
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
