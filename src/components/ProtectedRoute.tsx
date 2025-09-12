import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectPath = '/admin' 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  console.log('ProtectedRoute: Rendering, current path:', location.pathname);

  useEffect(() => {
    console.log('ProtectedRoute: Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('ProtectedRoute: Auth state changed, user:', user ? user.email : 'No user');
      if (!user) {
        console.log('ProtectedRoute: No user');
        setIsAuthenticated(false);
      } else if (user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        console.log('ProtectedRoute: Admin authenticated:', user.email);
        setIsAuthenticated(true);
      } else {
        console.log('ProtectedRoute: Non-admin user, redirecting to home');
        setIsAuthenticated(false);
        navigate('/', { replace: true });
      }
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [navigate, redirectPath]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    console.log('ProtectedRoute: Auth check in progress, showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Đang kiểm tra quyền truy cập...</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug: Checking authentication...</p>
            <p>Current path: {location.pathname}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    navigate('/admin', { replace: true });
    return null;
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
}
