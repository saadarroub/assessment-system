// src/main/react/features/service/roleService.ts
import { apiClient } from "@/api/client";

/* ==================== Types ==================== */

export interface RoleApi {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

export interface PermissionApi {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

export interface RolePermissionApi {
  roleId: string;
  roleName: string;
  permissionId: string;
  permissionName: string;
  permissionDescription?: string;
  grantedAt?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

/* ==================== Role CRUD ==================== */

/**
 * GET /roles - Get all roles
 */
export async function getRoles(): Promise<RoleApi[]> {
  const res = await apiClient.get("/roles");
  return res.data;
}

/**
 * GET /roles/{id} - Get role by ID
 */
export async function getRole(id: string): Promise<RoleApi> {
  const res = await apiClient.get(`/roles/${id}`);
  return res.data;
}

/**
 * POST /roles - Create new role
 */
export async function createRole(dto: CreateRoleDto): Promise<RoleApi> {
  const res = await apiClient.post("/roles", dto);
  return res.data;
}

/**
 * PUT /roles/{id} - Update role
 */
export async function updateRole(id: string, dto: UpdateRoleDto): Promise<RoleApi> {
  const res = await apiClient.put(`/roles/${id}`, dto);
  return res.data;
}

/**
 * DELETE /roles/{id} - Delete role
 */
export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}

/* ==================== Permissions ==================== */

/**
 * GET /permissions - Get all permissions
 */
export async function getAllPermissions(): Promise<PermissionApi[]> {
  const res = await apiClient.get("/permissions");
  return res.data;
}

/* ==================== Role-Permission Management ==================== */

/**
 * GET /role-permissions/roles/{roleId}/permissions - Get all permissions for a role
 */
export async function getRolePermissions(roleId: string): Promise<RolePermissionApi[]> {
  const res = await apiClient.get(`/role-permissions/roles/${roleId}/permissions`);
  return res.data;
}

/**
 * POST /role-permissions/grant-multiple - Grant multiple permissions to role
 */
export async function grantPermissions(
  roleId: string,
  permissionIds: string[]
): Promise<RolePermissionApi[]> {
  const res = await apiClient.post("/role-permissions/grant-multiple", {
    roleId,
    permissionIds,
  });
  return res.data;
}

/**
 * DELETE /role-permissions/revoke-multiple - Revoke multiple permissions from role
 */
export async function revokePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<void> {
  await apiClient.delete("/role-permissions/revoke-multiple", {
    data: { roleId, permissionIds },
  });
}
