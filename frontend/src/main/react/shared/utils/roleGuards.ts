// src/main/react/shared/utils/roleGuards.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['admin:dashboard:view'],
  user: [],
};

export const hasPermission = (roles: string[], permission: string) =>
  roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
