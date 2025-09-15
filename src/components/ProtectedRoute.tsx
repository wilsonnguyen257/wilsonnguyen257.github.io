import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // With database/auth removed, always render children.
  return <>{children}</>;
}
