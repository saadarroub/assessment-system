import { Navigate, useLocation } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { hasPermission } from "@/shared/utils/roleGuards";
import type { ReactNode } from "react";

type Props = {
  permission?: string;
  children: ReactNode;
};

export default function ProtectedRoute({ permission, children }: Props) {
  const { isAuthenticated, roles } = useAuthCtx();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (permission && !hasPermission(roles, permission)) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}
