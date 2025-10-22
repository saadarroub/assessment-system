export type UserApi = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updatedAt?:string;
};

const BASE = "http://localhost:8080/api";

export async function getUsers(): Promise<UserApi[]> {
  const resp = await fetch(`${BASE}/users`, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
export async function getUser(id: string): Promise<UserApi> {
  const r = await fetch(`${BASE}/users/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
} 

/** Holt Rollen für einen User und gibt nur die Namen zurück */
export async function getUserRoles(userId: string): Promise<string[]> {
  const resp = await fetch(`${BASE}/users/${encodeURIComponent(userId)}/roles`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();

  // Erwartet: Array von { role: { name: string } }
  if (!Array.isArray(data)) return [];
  return data
    .map((x: any) => x?.role?.name)
    .filter((r: unknown): r is string => typeof r === "string" && r.length > 0);
}

// NEW: Create user
export type CreateUserDto = { name: string; email: string; password: string };
export async function createUser(payload: CreateUserDto): Promise<UserApi> {
  const r = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json(); // erwartet: { id, name, email, ... }
}
// NEW: Delete user
export async function deleteUser(userId: string): Promise<void> {
  const r = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} 
// **NEW: Update user**
// Passwort ist optional, damit man beim reinen Namen/Email-Update nicht zwingend ein neues PW setzen muss.
export type UpdateUserDto = { name: string; email: string; password?: string };

export async function updateUser(userId: string, payload: UpdateUserDto): Promise<UserApi> {
  const r = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);

  // Manche Backends geben 204 (leer) zurück – sicher parsen:
  const text = await r.text();
  return text ? JSON.parse(text) : ({ id: userId, ...payload } as UserApi);
}
