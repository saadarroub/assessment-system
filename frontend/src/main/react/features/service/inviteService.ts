/* ===================== BASE URLs ===================== */
const PUB_BASE = import.meta.env.VITE_PUBLIC_BASE ?? "http://localhost:8080"; // /public
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:8080/api";     // /api

/* ===================== Invite Meta ===================== */
export type InviteMeta = {
  workerRef?: string;
  companyName?: string;
  catalogTitle?: string;
  catalogDescription?: string;
  requiresCode: boolean;
  expiresAt?: string;  // ISO
  status?: string;     // "assigned" | "expired" | ...
  accessCode?: string; // optional – falls Backend es liefert
};
 
export async function fetchInviteMeta(token: string): Promise<InviteMeta> {
  const resp = await fetch(`${PUB_BASE}/public/access/${encodeURIComponent(token)}/meta`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`Meta failed: ${resp.status}`);
  return resp.json();
}

/* ===================== Verify Invite ===================== */
export async function verifyInvite(token: string, code?: string): Promise<any> {
  const body = code ? { code } : {};
  const resp = await fetch(`${PUB_BASE}/public/access/${encodeURIComponent(token)}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `Verify failed: ${resp.status}`);
  }
  return resp.json(); // hier bekommst du workerId, catalogId, status, etc.
}

/* ===================== Assignment ===================== */
export type AssignmentApi = {
  id: string;
  worker: {
    id: string;
    name: string;
    workSpaceRef?: string | null;
    companyId?: string | null;
    company?: { id: string; name: string; description?: string | null; createdAt?: string; updatedAt?: string } | null;
    email?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  catalog?: { id: string; title: string; description?: string | null; createdAt?: string; updatedAt?: string } | null;
  company?: { id: string; name: string; description?: string | null; createdAt?: string; updatedAt?: string } | null;
  assignedBy?: string | null;
  accessCode: string;
  accessToken?: string | null;
  status?: "assigned" | "in_progress" | "completed" | string;
  assignedAt?: string;
  expiresAt?: string;
  firstAccessAt?: string | null;
  lastAccessAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
};

export async function fetchAssignmentByAccessCode(accessCode: string): Promise<AssignmentApi> {
  const resp = await fetch(`${API_BASE}/worker-catalog/code/${encodeURIComponent(accessCode)}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `Assignment failed: ${resp.status}`);
  }
  return resp.json();
}
