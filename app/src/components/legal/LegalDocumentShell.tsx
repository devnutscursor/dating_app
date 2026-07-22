import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useLegalArea } from '@/lib/legalPaths';
import type { ReactNode } from 'react';

type LegalDocumentShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export default function LegalDocumentShell({ title, lastUpdated, children }: LegalDocumentShellProps) {
  const area = useLegalArea();

  if (area) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500">Last updated: {lastUpdated}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex">
              <BrandLogo size="sm" tone="dark" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mb-8 text-gray-500">Last updated: {lastUpdated}</p>
          {children}
        </div>
      </main>

      <footer className="bg-gray-900 py-8 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-gray-400">&copy; 2026 MemberDate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
