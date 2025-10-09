// oben:
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthCtx } from '@/core/auth/AuthContext';
import { hasPermission } from '@/shared/utils/roleGuards';
import type { ReactElement } from 'react';   // 👈 type-only import

export default function ProtectedRoute({
  permission,
  children,
}: {
  permission?: string;
  children: ReactElement;         // 👈 statt JSX.Element
}) {
  const { isAuthenticated, roles } = useAuthCtx();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (permission && !hasPermission(roles, permission)) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}
