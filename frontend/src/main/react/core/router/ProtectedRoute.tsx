// src/main/react/core/router/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { hasPermission } from "@/shared/utils/roleGuards";
import type { ReactNode } from "react";

type Props = {
  permission?: string;
  children: ReactNode;
  /** erlaubt Zugang, wenn ?token (und optional ?code) in der URL stehen */
  allowWithToken?: boolean;
};

export default function ProtectedRoute({ permission, children, allowWithToken = false }: Props) {
  const { isAuthenticated, roles } = useAuthCtx();
  const location = useLocation();

  // Invite-Bypass prüfen
  const qs = new URLSearchParams(location.search);
  const inviteToken = qs.get("token");
  const inviteCode  = qs.get("code"); // optional

  // Wenn Route für Invite-Flow freigegeben ist und ein Token vorhanden ist → durchlassen
  // (Wenn du strenger sein willst: !!inviteToken && !!inviteCode)
  if (allowWithToken && !!inviteToken) {
    return <>{children}</>;
  }

  // Normale Auth nötig
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Permission prüfen
  if (permission && !hasPermission(roles, permission)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
