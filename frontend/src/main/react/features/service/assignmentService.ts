// src/features/service/assignmentService.ts

export type AssignmentWorker = {
  id: string;
  name?: string | null;
  workSpaceRef?: string | null;
  companyId?: string | null;
  email?: string | null;
  company?: { id: string; name?: string | null } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AssignmentCatalog = {
  id: string;
  title?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AssignmentCompany = {
  id: string;
  name?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AssignmentApi = {
  id: string;
  worker?: AssignmentWorker | null;
  catalog?: AssignmentCatalog | null;
  company?: AssignmentCompany | null;

  accessCode?: string | null;
  accessToken?: string | null;
  status?: string | null;

  assignedAt?: string | null;
  expiresAt?: string | null;
  firstAccessAt?: string | null;
  lastAccessAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
};

/** DTO wie vorher – dein Bulk-POST */
export type AssignWorkerCatalogBulkDto = {
  workerIds: string[];
  catalogId: string;
  expiresAt: string;      // ISO oder 'YYYY-MM-DDTHH:mm:ss' → Backend akzeptiert beides
  assignedById: string;
  notes?: string;
};

export type AssignWorkerCatalogBulkResponse = {
  success: number;
  total: number;
  assignments: AssignmentApi[];
};

/** POST /worker-catalog/assign/bulk */
export async function assignWorkerCatalogBulk(
  payload: AssignWorkerCatalogBulkDto
): Promise<AssignWorkerCatalogBulkResponse> {
  const resp = await fetch("http://localhost:8080/api/worker-catalog/assign/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}${text ? ` – ${text}` : ""}`);
  }
  return resp.json();
}
 
/** GET /worker-catalog → alle Zuweisungen (verschachtelte Objekte!) */
export async function listAssignments(): Promise<AssignmentApi[]> {
  const resp = await fetch("http://localhost:8080/api/worker-catalog", {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}${text ? ` – ${text}` : ""}`);
  }
  // Response ist ein Array aus AssignmentApi
  return resp.json();
}
