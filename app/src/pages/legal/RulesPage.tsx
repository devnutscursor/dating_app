import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">MemberDate</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Community Rules</h1>
          <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Be Respectful</h2>
              <p className="text-gray-600 leading-relaxed">
                Treat all members with respect and kindness. Harassment, hate speech, bullying, 
                or any form of abusive behavior will not be tolerated. Remember that there is a 
                real person behind every profile.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Be Authentic</h2>
              <p className="text-gray-600 leading-relaxed">
                Use your real photos and accurate information. Catfishing, using fake photos, 
                or impersonating others is strictly prohibited. Verified profiles help create 
                a safer community for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Stay Safe</h2>
              <p className="text-gray-600 leading-relaxed">
                Protect your personal information. Never share financial details, passwords, 
                or sensitive personal information with other users. Be cautious when moving 
                conversations to other platforms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. No Solicitation</h2>
              <p className="text-gray-600 leading-relaxed">
                MemberDate is for dating and meaningful connections. Using the platform for 
                commercial purposes, promoting services, or soliciting money is not allowed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Appropriate Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All content must comply with our content guidelines:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>No nudity or sexually explicit content in public photos</li>
                <li>No violent, graphic, or disturbing content</li>
                <li>No content promoting illegal activities</li>
                <li>No copyrighted material without permission</li>
                <li>No spam or repetitive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. One Account Per Person</h2>
              <p className="text-gray-600 leading-relaxed">
                Each person is allowed only one account. Creating multiple accounts, using 
                bots, or artificially inflating engagement is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Report Violations</h2>
              <p className="text-gray-600 leading-relaxed">
                Help keep our community safe by reporting any violations you encounter. Our 
                moderation team reviews all reports and takes appropriate action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Consequences</h2>
              <p className="text-gray-600 leading-relaxed">
                Violations of these rules may result in warnings, temporary suspension, or 
                permanent account termination depending on the severity and frequency of the 
                violation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Rules</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update these Community Rules from time to time. Continued use of 
                MemberDate after changes constitutes acceptance of the updated rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about these rules or need to report a violation, please 
                contact us at support@memberdate.com.
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
