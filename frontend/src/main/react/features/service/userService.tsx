import { apiClient } from "@/api/client";

export type UserApi = {
  id: string;
  name: string;
  email: string;
  roles?: any;
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

/** Holt Rollen für einen User und gibt Role-IDs oder Namen zurück */
export async function getUserRoles(userId: string): Promise<string[]> {
  const { data } = await apiClient.get(
    `/users/${encodeURIComponent(userId)}/roles`,
    { headers: { Accept: "application/json" } }
  );

  console.log("getUserRoles raw", userId, data);

  // Rekursiv durch das JSON laufen und alle roleId-Strings einsammeln
  const collectRoleIds = (value: any, acc: Set<string>) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach((v) => collectRoleIds(v, acc));
      return;
    }

    if (typeof value === "object") {
      for (const [key, v] of Object.entries(value)) {
        if (key === "roleId" && typeof v === "string") {
          acc.add(v); // roleId gefunden
        }
        collectRoleIds(v, acc); // weiter ins nächste Level
      }
    }
  };

  const ids = new Set<string>();
  collectRoleIds(data, ids);

  const result = Array.from(ids);
  console.log("getUserRoles parsed IDs", userId, result);

  return result;
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

export type UpdateUserDto = { name: string; email: string; password?: string ;};

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
export async function deleteUserRole(userId: string, roleId: string): Promise<void> {
  const res = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
  if (res.status !== 204) {
    throw new Error(`Rolle konnte nicht entfernt werden (Status ${res.status})`);
  }
}
export async function assignUserRole(userId: string, roleId: string): Promise<void> {
  const res = await apiClient.post(
    `/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    null, // kein Body
    {
      headers: { Accept: "application/json" },
    }
  );

  if (![200, 201, 204].includes(res.status)) {
    throw new Error(`Rolle konnte nicht zugewiesen werden (Status ${res.status})`);
  }
}
