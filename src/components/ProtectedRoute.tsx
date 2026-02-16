import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Where to redirect unauthenticated users (default: /join) */
  redirectTo?: string;
}

/**
 * Route guard — blocks rendering of children until auth is
 * resolved, then redirects unauthenticated users to login.
 */
export const ProtectedRoute = ({
  children,
  redirectTo = '/join',
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="flex items-center gap-3 text-cyan-500 text-sm animate-pulse">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
          AUTHENTICATING...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
