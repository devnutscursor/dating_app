import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'male' | 'female' | 'admin' | 'moderator';

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

  if ((role === 'male' || role === 'female') && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }

  return <>{children}</>;
}
