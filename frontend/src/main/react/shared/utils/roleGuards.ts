
function toPermissionList(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is string => typeof item === "string");
}

export function hasPermission(
  permissions: unknown,
  permission?: string | string[]
): boolean {
  if (!permission) {
    return true;
  }

  const list = toPermissionList(permissions);
  
  // Support both single permission and array of permissions
  const required = Array.isArray(permission) ? permission : [permission];
  
  // Check if user has at least one of the required permissions
  return required.some(perm => list.includes(perm));
}
