import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectPath = '/admin' 
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate(redirectPath);
      }
    });

    return () => unsubscribe();
  }, [navigate, redirectPath]);

  return <>{children}</>;
}
