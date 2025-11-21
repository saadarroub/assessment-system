import { apiClient } from "@/api/client";

export type UserApi = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updatedAt?: string;
};

export async function getUsers(): Promise<UserApi[]> {
  const { data } = await apiClient.get<UserApi[]>("/users", {
    headers: { Accept: "application/json" },
  });
  return data;
}

export async function getUser(id: string): Promise<UserApi> {
  const { data } = await apiClient.get<UserApi>(`/users/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  return data;
}

/** Holt Rollen für einen User und gibt nur die Namen zurück */
export async function getUserRoles(userId: string): Promise<string[]> {
  const { data } = await apiClient.get<any[]>(`/users/${encodeURIComponent(userId)}/roles`, {
    headers: { Accept: "application/json" },
  });

  if (!Array.isArray(data)) return [];
  return data
    .map((x: any) => x?.role?.name)
    .filter((r: unknown): r is string => typeof r === "string" && r.length > 0);
}

export type CreateUserDto = { name: string; email: string; password: string; roleId: string };

export async function createUser(payload: CreateUserDto): Promise<UserApi> {
  const { data } = await apiClient.post<UserApi>("/users", payload, {
    headers: { Accept: "application/json" },
  });
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${encodeURIComponent(userId)}`, {
    headers: { Accept: "application/json" },
  });
}

export type UpdateUserDto = { name: string; email: string; password?: string };

export async function updateUser(userId: string, payload: UpdateUserDto): Promise<UserApi> {
  const { data } = await apiClient.put<UserApi>(
    `/users/${encodeURIComponent(userId)}`,
    payload,
    {
      headers: { Accept: "application/json" },
    }
  );

  if (data && typeof data === "object") {
    return data;
  }

  return { id: userId, ...payload } as UserApi;
}
