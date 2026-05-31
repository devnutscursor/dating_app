import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { acceptAgeGate, hasAcceptedAgeGate } from '@/lib/ageGate';
import BrandLogo from '@/components/BrandLogo';

const EXIT_URL = 'https://www.google.com';

function AgeVerificationModal({
  onAccept,
  onLeave,
}: {
  onAccept: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" aria-hidden />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-gray-200/80 bg-[#f3f3f3] px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="sm" tone="dark" />
        </div>

        <h1
          id="age-gate-title"
          className="mb-5 text-center font-serif text-lg font-semibold uppercase tracking-wide text-gray-900 sm:text-xl"
        >
          Adult content &amp; communication access
        </h1>

        <p id="age-gate-desc" className="mb-6 text-center text-sm leading-relaxed text-gray-800 sm:text-[15px]">
          This website contains adult-oriented content, including photos and videos of a sexual nature, and
          allows communication with other members who are adults. By clicking &ldquo;Enter&rdquo;, you
          represent and warrant that you are at least <strong>18 years of age</strong> (or the legal age of
          majority in your jurisdiction), that you will only communicate with other adults on this platform,
          and that you consent to viewing such material and participating in adult conversations. If you are
          under 18, or find such material offensive, please leave this site immediately.
        </p>

        <button
          type="button"
          onClick={onAccept}
          className="mx-auto block w-full max-w-sm rounded-full border-2 border-gray-900 bg-white px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          I am 18+ | Enter
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="mt-4 w-full text-center text-xs text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
        >
          I am under 18 — exit site
        </button>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-500">
          See our{' '}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline-offset-2 hover:underline"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function AgeVerificationGate({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(() => hasAcceptedAgeGate());

  useEffect(() => {
    if (!verified) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [verified]);

  const handleAccept = () => {
    acceptAgeGate();
    setVerified(true);
  };

  const handleLeave = () => {
    window.location.href = EXIT_URL;
  };

  return (
    <>
      <div className={verified ? undefined : 'pointer-events-none select-none blur-md'} aria-hidden={!verified}>
        {children}
      </div>
      {!verified && <AgeVerificationModal onAccept={handleAccept} onLeave={handleLeave} />}
    </>
  );
}
