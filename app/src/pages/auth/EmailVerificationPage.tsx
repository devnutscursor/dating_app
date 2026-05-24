import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';

export default function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const emailFromState = (location.state as { email?: string } | null)?.email;
  const displayEmail = emailFromState ?? user?.email ?? '';

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error('Please sign in or register again.');
      navigate('/login', { replace: true });
      return;
    }
    if (user && !user.emailVerificationRequired) {
      navigate('/profile-setup', { replace: true });
    }
  }, [token, user, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!raw) return;
    const next = [...code];
    for (let i = 0; i < 6; i += 1) next[i] = raw[i] ?? '';
    setCode(next);
    const focusAt = Math.min(raw.length, 5);
    inputsRef.current[focusAt]?.focus();
  };

  const handleVerify = async () => {
    const joined = code.join('');
    if (joined.length !== 6) {
      toast.error('Enter the full 6-digit code');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/auth/verify-email', { code: joined });
      await refreshUser();
      setVerified(true);
      toast.success('Email verified');
      window.setTimeout(() => {
        navigate('/profile-setup', { replace: true });
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await apiPost('/auth/resend-verification');
      setTimer(60);
      toast.success('A new code has been sent. Check your inbox (or server logs if SMTP is not set up).');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex">
            <BrandLogo size="sm" tone="dark" />
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {!verified ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <p className="text-gray-500">
                  We&apos;ve sent a verification code to{' '}
                  <span className="font-medium text-gray-700 break-all">
                    {displayEmail || 'the address you used to register'}
                  </span>
                </p>
              </div>

              <div className="mb-6 flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-12 rounded-lg border-2 border-gray-200 text-center text-2xl font-bold outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={() => void handleVerify()}
                disabled={submitting}
                className="w-full bg-green-500 py-3 hover:bg-green-600"
              >
                {submitting ? 'Verifying…' : 'Verify Email'}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the code?{' '}
                  {timer > 0 ? (
                    <span className="text-gray-400">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      disabled={resending}
                      onClick={() => void handleResend()}
                      className="font-medium text-green-500 hover:text-green-600 disabled:opacity-50"
                    >
                      {resending ? 'Sending…' : 'Resend Code'}
                    </button>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-500">Redirecting you to complete your profile…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
