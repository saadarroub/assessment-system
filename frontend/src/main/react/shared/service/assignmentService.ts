import { apiClient } from "@/shared/service/api/client";

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
  const { data } = await apiClient.post<AssignWorkerCatalogBulkResponse>(
    "/worker-catalog/assign/bulk",
    payload,
    {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    }
  );
  return data;
}
 
/** GET /worker-catalog → alle Zuweisungen (verschachtelte Objekte!) */
export async function listAssignments(): Promise<AssignmentApi[]> {
  const { data } = await apiClient.get<AssignmentApi[]>("/worker-catalog", {
    headers: { Accept: "application/json" },
  });
  return data;
}
export async function deleteAssignment(id: string): Promise<void> {
  await apiClient.delete(
    `/worker-catalog/${encodeURIComponent(id)}`,
    { headers: { Accept: "application/json" } }
  );
}
export type UpdateAssignmentExpiresDto = {
  expiresAt: string;
};

export async function updateAssignmentExpires(
  id: string,
  payload: UpdateAssignmentExpiresDto
): Promise<AssignmentApi> {
  const { data } = await apiClient.patch<AssignmentApi>(
    `/worker-catalog/${encodeURIComponent(id)}/expires`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return data;
}
