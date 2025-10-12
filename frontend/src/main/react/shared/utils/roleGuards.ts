// src/main/react/shared/utils/roleGuards.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['admin:dashboard:view'],
  user: ['user:dashboard:view'],
};

export function hasPermission(roles: unknown, permission?: string): boolean {
  if (!permission) return true; // wenn keine Permission gefordert ist

  // Rollen sicher normalisieren (Array + lowercase)
  const list = Array.isArray(roles) ? roles : [];
  const norm = list.map(r => (typeof r === 'string' ? r.toLowerCase() : ''));

  // check
  return norm.some(role => (ROLE_PERMISSIONS[role] || []).includes(permission));
}
