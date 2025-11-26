// src/main/react/core/router/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuthCtx } from "@/core/auth/AuthContext";
// import { hasPermission } from "@/shared/utils/roleGuards";
// import { PermissionEventBus } from "@/core/auth/PermissionEventBus";

type Props = {
  permission?: string | string[];
  children: ReactNode;
  /** erlaubt Zugang, wenn ?token (und optional ?code) in der URL stehen
   *  ODER wenn eine publicAssessmentSession im sessionStorage liegt
   */
  allowWithToken?: boolean;
};

const SESSION_KEY = "publicAssessmentSession";

export default function ProtectedRoute({
  permission,
  children,
  allowWithToken = false,
}: Props) {
  const { isAuthenticated, permissions } = useAuthCtx();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const inviteToken = (qs.get("token") || qs.get("accessToken") || "").trim();

  // 🔹 NEU: Token aus publicAssessmentSession lesen
  let sessionToken: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string };
        const t = (parsed?.token || "").trim();
        sessionToken = t || null;
      }
    } catch {
      sessionToken = null;
    }
  }

  //  Wenn Invite-Flow erlaubt ist und WIRKLICH ein Token existiert
  if (allowWithToken && (inviteToken || sessionToken)) {
    return <>{children}</>;
  }

  // Normale Auth nötig
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Aktuell keine Permission-Checks auf Routenebene
  return <>{children}</>;
}
