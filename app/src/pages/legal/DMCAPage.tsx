import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

export default function DMCAPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">DMCA Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: March 31, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                MemberDate respects the intellectual property rights of others and expects its users 
                to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we 
                will respond promptly to claims of copyright infringement committed using our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Reporting Copyright Infringement</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you believe that your copyrighted work has been copied in a way that constitutes 
                copyright infringement, please provide us with the following information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing</li>
                <li>Your contact information (address, telephone number, email)</li>
                <li>A statement that you have a good faith belief that the use is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Where to Send Notices</h2>
              <p className="text-gray-600 leading-relaxed">
                DMCA notices should be sent to our designated agent at:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-gray-700 font-medium">MemberDate DMCA Agent</p>
                <p className="text-gray-600">Email: dmca@memberdate.com</p>
                <p className="text-gray-600">Address: 123 Dating Street, San Francisco, CA 94102</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Counter-Notification</h2>
              <p className="text-gray-600 leading-relaxed">
                If you believe that your content was removed or disabled by mistake or misidentification, 
                you may submit a counter-notification containing:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-4">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that has been removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                <li>Your contact information</li>
                <li>A statement that you consent to the jurisdiction of the federal court in your district</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Repeat Infringers</h2>
              <p className="text-gray-600 leading-relaxed">
                MemberDate reserves the right to terminate accounts of users who are found to be 
                repeat infringers of copyright.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed">
                This DMCA policy is provided for informational purposes and does not constitute 
                legal advice. For legal questions, please consult with an attorney.
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
