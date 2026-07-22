import LegalDocumentShell from '@/components/legal/LegalDocumentShell';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

export default function RulesPage() {
  return (
    <LegalDocumentShell title="Community Rules" lastUpdated="March 31, 2026">
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">1. Be Respectful</h2>
          <p className="leading-relaxed text-gray-600">
            Treat all members with respect and kindness. Harassment, hate speech, bullying, or any
            form of abusive behavior will not be tolerated. Remember that there is a real person
            behind every profile.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">2. Be Authentic</h2>
          <p className="leading-relaxed text-gray-600">
            Use your real photos and accurate information. Catfishing, using fake photos, or
            impersonating others is strictly prohibited. Verified profiles help create a safer
            community for everyone.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">3. Stay Safe</h2>
          <p className="leading-relaxed text-gray-600">
            Protect your personal information. Never share financial details, passwords, or sensitive
            personal information with other users. Be cautious when moving conversations to other
            platforms.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">4. No Solicitation</h2>
          <p className="leading-relaxed text-gray-600">
            MemberDate is for dating and meaningful connections. Using the platform for commercial
            purposes, promoting services, or soliciting money is not allowed.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">5. Appropriate Content</h2>
          <p className="mb-4 leading-relaxed text-gray-600">
            All content must comply with our content guidelines:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-gray-600">
            <li>No nudity or sexually explicit content in public photos</li>
            <li>No violent, graphic, or disturbing content</li>
            <li>No content promoting illegal activities</li>
            <li>No copyrighted material without permission</li>
            <li>No spam or repetitive content</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">6. One Account Per Person</h2>
          <p className="leading-relaxed text-gray-600">
            Each person is allowed only one account. Creating multiple accounts, using bots, or
            artificially inflating engagement is prohibited.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">7. Report Violations</h2>
          <p className="leading-relaxed text-gray-600">
            Help keep our community safe by reporting any violations you encounter. Our moderation
            team reviews all reports and takes appropriate action.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">8. Consequences</h2>
          <p className="leading-relaxed text-gray-600">
            Violations of these rules may result in warnings, temporary suspension, or permanent
            account termination depending on the severity and frequency of the violation.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">9. Changes to Rules</h2>
          <p className="leading-relaxed text-gray-600">
            We may update these Community Rules from time to time. Continued use of MemberDate after
            changes constitutes acceptance of the updated rules.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">10. Contact</h2>
          <p className="leading-relaxed text-gray-600">
            If you have questions about these rules or need to report a violation, please contact us
            at{' '}
            <a href={SUPPORT_MAILTO} className="text-green-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </LegalDocumentShell>
  );
}
