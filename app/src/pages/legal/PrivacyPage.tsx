import LegalDocumentShell from '@/components/legal/LegalDocumentShell';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function PrivacyPage() {
  return (
    <LegalDocumentShell title="Privacy Policy" lastUpdated="May 19, 2026">
      <p className="mb-8 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm leading-relaxed text-gray-600">
        This Privacy Policy describes how MemberDate handles information on our adults-only dating
        platform. It is provided as a general template and should be reviewed by legal counsel for
        your region.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            We collect information you provide directly to us, including:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-gray-600">
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
          <h2 className="mb-4 text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p className="mb-4 leading-relaxed text-gray-600">We use the information we collect to:</p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-gray-600">
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
          <h2 className="mb-4 text-xl font-semibold text-gray-900">3. Information Sharing</h2>
          <p className="leading-relaxed text-gray-600">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="ml-4 mt-4 list-inside list-disc space-y-2 text-gray-600">
            <li>Other users (as part of your public profile)</li>
            <li>Service providers who assist our operations</li>
            <li>Law enforcement when required by law</li>
            <li>Other parties with your consent</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p className="leading-relaxed text-gray-600">
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet is 100% secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">5. Your Rights</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            Depending on your location, you may have the right to:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-gray-600">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Object to certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">6. Cookies &amp; Local Storage</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            We use cookies, local storage, and similar technologies to keep you signed in, remember
            preferences, analyze usage, and record that you confirmed you are 18+ on the
            age-verification screen. You can clear this data through your browser settings; doing so
            may require you to sign in again and re-confirm your age.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">7. Adult Content &amp; Sensitive Data</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            Because MemberDate allows adult-oriented photos, videos, and private communication, you
            may upload or transmit sensitive personal content. You choose what to share. Public
            profile fields are visible to other members; private media may require coins to unlock as
            described in the app.
          </p>
          <p className="leading-relaxed text-gray-600">
            Do not upload content involving minors or non-consenting persons. We may remove content
            and report illegal material to authorities where required.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">8. Children&apos;s Privacy</h2>
          <p className="leading-relaxed text-gray-600">
            MemberDate is strictly for adults 18 and older. We do not knowingly collect personal
            information from anyone under 18. If we learn that a minor has registered, we will delete
            the account and associated data where reasonably possible.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">9. Changes to This Policy</h2>
          <p className="leading-relaxed text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new policy on this page.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">10. Contact Us</h2>
          <p className="leading-relaxed text-gray-600">
            Privacy questions:{' '}
            <a href={SUPPORT_MAILTO} className="text-green-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </LegalDocumentShell>
  );
}
