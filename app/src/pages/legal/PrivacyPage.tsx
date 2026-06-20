import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: May 19, 2026</p>

          <p className="text-gray-600 leading-relaxed mb-8 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm">
            This Privacy Policy describes how MemberDate handles information on our adults-only
            dating platform. It is provided as a general template and should be reviewed by legal
            counsel for your region.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Account information (name, email, date of birth, gender)</li>
                <li>Profile information (photos, videos, bio, interests, location)</li>
                <li>Communication data (messages, gifts, video or voice calls)</li>
                <li>Payment and virtual currency (coin) transaction records</li>
                <li>Verification data (e.g. email verification codes, optional identity checks)</li>
                <li>Device, browser, and usage information (IP address, logs, cookies)</li>
                <li>Age-gate confirmation stored locally in your browser (see Section 6)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Match you with other users</li>
                <li>Process transactions</li>
                <li>Communicate with you</li>
                <li>Improve our platform</li>
                <li>Ensure safety and security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-4">
                <li>Other users (as part of your public profile)</li>
                <li>Service providers who assist our operations</li>
                <li>Law enforcement when required by law</li>
                <li>Other parties with your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your 
                personal information. However, no method of transmission over the internet is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your personal information</li>
                <li>Object to certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies &amp; Local Storage</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies, local storage, and similar technologies to keep you signed in,
                remember preferences, analyze usage, and record that you confirmed you are 18+ on
                the age-verification screen. You can clear this data through your browser settings;
                doing so may require you to sign in again and re-confirm your age.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Adult Content &amp; Sensitive Data</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Because MemberDate allows adult-oriented photos, videos, and private communication,
                you may upload or transmit sensitive personal content. You choose what to share.
                Public profile fields are visible to other members; private media may require coins
                to unlock as described in the app.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Do not upload content involving minors or non-consenting persons. We may remove
                content and report illegal material to authorities where required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                MemberDate is strictly for adults 18 and older. We do not knowingly collect personal
                information from anyone under 18. If we learn that a minor has registered, we will
                delete the account and associated data where reasonably possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                Privacy questions:{' '}
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
