import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

type Role = 'male' | 'female' | 'admin' | 'moderator';

function SuspendedMemberScreen({ reason }: { reason?: string }) {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Account suspended</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Your access to MemberDate dating features has been suspended for violating our Terms of Service or Community
          Guidelines. If you believe this is a mistake, contact support through the email on our website — do not create
          another account to bypass this suspension.
        </p>
        {reason?.trim() ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
            <span className="font-medium text-gray-900">Reason: </span>
            {reason.trim()}
          </p>
        ) : null}
        <Button type="button" className="mt-6 w-full bg-gray-900 hover:bg-gray-800" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = user.role as Role | undefined;
  if (!role || !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'moderator') return <Navigate to="/moderator/dashboard" replace />;
    if (role === 'male') return <Navigate to="/man/home" replace />;
    if (role === 'female') return <Navigate to="/woman/home" replace />;
    return <Navigate to="/" replace />;
  }

  if ((role === 'male' || role === 'female') && user.emailVerificationRequired) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }

  if ((role === 'male' || role === 'female') && user.isBlocked) {
    return <SuspendedMemberScreen reason={user.platformSuspendedReason} />;
  }

  return <>{children}</>;
}
