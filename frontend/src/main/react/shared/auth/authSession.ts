export type AuthSession = {
  accessToken?: string;
  expiresAt?: number;
  rememberMe?: boolean;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    permissions?: string[];
    roles?: string[];
  };
};

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null; // SSR-safe
  const raw = sessionStorage.getItem("auth_session");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getSessionPermissions(): string[] {
  const session = readAuthSession();
  const perms = session?.user?.permissions;
  return Array.isArray(perms) ? perms : [];
}

export function getSessionRoles(): string[] {
  const session = readAuthSession();
  const roles = session?.user?.roles;
  return Array.isArray(roles) ? roles : [];
}
