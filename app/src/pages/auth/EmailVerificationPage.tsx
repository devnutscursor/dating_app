import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';

export default function EmailVerificationPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = () => {
    setVerified(true);
    setTimeout(() => {
      window.location.href = '/profile-setup';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex">
            <BrandLogo size="sm" tone="dark" />
          </Link>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {!verified ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-500">
                  We've sent a verification code to{' '}
                  <span className="font-medium text-gray-700">user@example.com</span>
                </p>
              </div>

              {/* Code Input */}
              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button 
                onClick={handleVerify}
                className="w-full bg-green-500 hover:bg-green-600 py-3"
              >
                Verify Email
              </Button>

              {/* Resend */}
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  Didn't receive the code?{' '}
                  {timer > 0 ? (
                    <span className="text-gray-400">Resend in {timer}s</span>
                  ) : (
                    <button className="text-green-500 hover:text-green-600 font-medium">
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-500">Redirecting you to complete your profile...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
