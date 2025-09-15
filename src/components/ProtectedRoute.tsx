import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { IS_FIREBASE_CONFIGURED, onAuthStateChanged, type User } from '../lib/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ children, redirectPath = '/login' }: ProtectedRouteProps) {
  const location = useLocation();

  // If Firebase auth not configured, allow access (legacy behavior)
  if (!IS_FIREBASE_CONFIGURED) return <>{children}</>;

  const [user, setUser] = useState<User | undefined>(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged((u) => setUser(u));
    return () => { try { unsub && (unsub as any)(); } catch { /* ignore */ } };
  }, []);

  if (user === undefined) {
    return <div className="container-xl py-12 text-center text-slate-500">Checking access…</div>;
  }
  if (!user) {
    return <Navigate to={redirectPath} replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
