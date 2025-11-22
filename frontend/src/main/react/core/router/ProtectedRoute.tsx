// src/main/react/core/router/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { hasPermission } from "@/shared/utils/roleGuards";
import { PermissionEventBus } from "@/core/auth/PermissionEventBus";

type Props = {
  permission?: string | string[];
  children: ReactNode;
  /** erlaubt Zugang, wenn ?token (und optional ?code) in der URL stehen */
  allowWithToken?: boolean;
};

export default function ProtectedRoute({ permission, children, allowWithToken = false }: Props) {
  const { isAuthenticated, permissions } = useAuthCtx();
  const location = useLocation();

  // Invite-Bypass prüfen
  const qs = new URLSearchParams(location.search);
  const inviteToken = qs.get("token");
  //const inviteCode  = qs.get("code"); // optional

  // Wenn Route für Invite-Flow freigegeben ist und ein Token vorhanden ist → durchlassen
  if (allowWithToken && !!inviteToken) {
    return <>{children}</>;
  }

  // Normale Auth nötig
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Alle authentifizierten User können alle Seiten besuchen
  // Permission-Checks erfolgen auf API/Daten-Ebene
  return <>{children}</>;
}
