import { useMemo } from "react";
import { getSessionPermissions, getSessionRoles } from "@/shared/auth/authSession";

export function useHasPermission() {
  // permissions/roles ändern sich in der Praxis selten – memo reicht
  const permissions = useMemo(() => new Set(getSessionPermissions()), []);
  const roles = useMemo(() => new Set(getSessionRoles()), []);

  const has = (p: string) => permissions.has(p);

  // Optional: mehrere Permissions
  const hasAny = (perms: string[]) => perms.some((p) => permissions.has(p));
  const hasAll = (perms: string[]) => perms.every((p) => permissions.has(p));

  // Optional: role check
  const hasRole = (r: string) => roles.has(r);

  return { has, hasAny, hasAll, hasRole };
}
