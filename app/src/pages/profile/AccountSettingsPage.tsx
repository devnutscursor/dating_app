import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye, EyeOff, LogOut, Mail, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';

function focusMobileInput(e: React.FocusEvent<HTMLInputElement>) {
  requestAnimationFrame(() => {
    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  const area = user.role === 'female' ? 'woman' : 'man';
  const profileBase = `/${area}/profile`;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Enter your current and new password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await apiPost('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          to={profileBase}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and security</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Name</p>
              <p className="truncate font-medium text-gray-900">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <p className="truncate font-medium text-gray-900">{user.email ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Member ID</p>
              <p className="truncate font-mono text-sm font-medium text-gray-900">{user.id}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 p-6">
          <Link
            to={`${profileBase}/edit`}
            className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Edit profile</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4 p-6">
          <p className="text-xs text-gray-500">
            We never store or show your password on this page. Type the password you use to sign in to MemberDate.
          </p>
          <div>
            <label htmlFor="settings-current-password" className="mb-1 block text-sm font-medium text-gray-700">
              Current password
            </label>
            <div className="relative">
              <Input
                id="settings-current-password"
                name="settings-current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onFocus={focusMobileInput}
                autoComplete="current-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="Enter your current login password"
                className="pr-10 text-base"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="settings-new-password" className="mb-1 block text-sm font-medium text-gray-700">
              New password
            </label>
            <div className="relative">
              <Input
                id="settings-new-password"
                name="settings-new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={focusMobileInput}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                minLength={8}
                placeholder="At least 8 characters"
                className="pr-10 text-base"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="settings-confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <Input
              id="settings-confirm-password"
              name="settings-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={focusMobileInput}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Repeat new password"
              className="text-base"
            />
          </div>
          <Button type="submit" disabled={savingPassword} className="w-full bg-rose-600 hover:bg-rose-700">
            {savingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Legal</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { to: '/terms', label: 'Terms of Service' },
            { to: '/privacy', label: 'Privacy Policy' },
            { to: '/rules', label: 'Community Rules' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              {item.label}
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
