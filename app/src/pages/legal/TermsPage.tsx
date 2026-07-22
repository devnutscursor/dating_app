import { Link } from 'react-router-dom';
import LegalDocumentShell from '@/components/legal/LegalDocumentShell';
import { legalHref, useLegalArea } from '@/lib/legalPaths';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function TermsPage() {
  const area = useLegalArea();
  const privacyTo = legalHref(area, 'privacy');

  return (
    <LegalDocumentShell title="Terms of Service" lastUpdated="May 19, 2026">
      <p className="mb-8 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm leading-relaxed text-gray-600">
        MemberDate is an adults-only platform. These Terms are a general template for operating the
        service. They are not legal advice — have a qualified attorney review them for your
        jurisdiction before relying on them in production.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p className="leading-relaxed text-gray-600">
            By accessing or using MemberDate (&quot;we&quot;, &quot;us&quot;, or &quot;the
            Platform&quot;), you agree to be bound by these Terms of Service and our{' '}
            <Link to={privacyTo} className="text-green-600 hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">2. Eligibility &amp; Age</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            You must be at least <strong>18 years of age</strong> (or the age of legal majority in
            your jurisdiction, whichever is higher) to register, browse, or communicate on
            MemberDate. By using the Platform you represent and warrant that you meet this
            requirement.
          </p>
          <p className="leading-relaxed text-gray-600">
            You agree to communicate only with other adults on the Platform and not to assist minors
            in accessing the service. We may suspend or terminate accounts we reasonably believe
            belong to or are used by persons under 18.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">3. Adult Content</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            MemberDate may display adult-oriented material, including photos and videos of a sexual
            or suggestive nature, and allows private messaging and video communication between
            members. You access such content voluntarily and at your own discretion.
          </p>
          <p className="leading-relaxed text-gray-600">
            If you are offended by adult material, or if such material is illegal where you are
            located, you must leave the Platform immediately and not use our services.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">4. Account Registration</h2>
          <p className="leading-relaxed text-gray-600">
            To use certain features of MemberDate, you must register for an account. You agree to
            provide accurate and complete information during registration and to keep your account
            information updated. You are responsible for maintaining the confidentiality of your
            account credentials.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">5. User Conduct</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            You agree not to use MemberDate for any unlawful purpose or in any way that could damage,
            disable, overburden, or impair our service. Prohibited activities include:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-gray-600">
            <li>Harassment, abuse, or harm to other users</li>
            <li>Posting false, misleading, or fraudulent content</li>
            <li>Impersonating another person or entity</li>
            <li>Collecting personal information of other users without consent</li>
            <li>Using automated systems or software to extract data</li>
            <li>Uploading viruses or malicious code</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">6. Content</h2>
          <p className="leading-relaxed text-gray-600">
            You retain ownership of any content you post on MemberDate. However, by posting content,
            you grant us a non-exclusive, royalty-free license to use, display, and distribute your
            content in connection with our service. We reserve the right to remove any content that
            violates these terms or our community guidelines.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">7. Payments &amp; Virtual Currency</h2>
          <p className="leading-relaxed text-gray-600">
            Certain features of MemberDate require payment. Coin packs are purchased with
            cryptocurrency only through our secure checkout provider. All purchases are final and
            non-refundable unless otherwise specified. Prices are subject to change without notice.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">8. Termination</h2>
          <p className="leading-relaxed text-gray-600">
            We reserve the right to suspend or terminate your account at any time for any reason,
            including violation of these terms. Upon termination, your right to use MemberDate will
            immediately cease.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">9. Disclaimer &amp; Limitation of Liability</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            MemberDate is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind. We do not guarantee uninterrupted, secure, or error-free operation, nor do
            we guarantee the conduct, identity, or age of any user.
          </p>
          <p className="leading-relaxed text-gray-600">
            To the fullest extent permitted by law, MemberDate and its operators shall not be liable
            for any indirect, incidental, or consequential damages arising from your use of the
            Platform or interactions with other members, including where a user misrepresents their
            age. You use the Platform at your own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">10. Contact</h2>
          <p className="leading-relaxed text-gray-600">
            Questions about these Terms:{' '}
            <a href={SUPPORT_MAILTO} className="text-green-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </LegalDocumentShell>
  );
}
