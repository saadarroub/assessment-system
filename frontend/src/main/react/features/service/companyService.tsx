import { apiClient } from "@/api/client";

//worker pro companies 
export type WorkerApi = {
  id: string;
  name: string;
  workSpaceRef?: string;
  companyId: string;
  email: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}; 

// Company aus Backend
export type CompanyApi = {
  id: string;
  name: string;
  description?: string | null;
  status?: "active" | "inactive" | string;
  street?: string | null; 
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  createdAt?: string;   // aus deinem JSON
  updatedAt?: string;
};



export async function getCompanies(): Promise<CompanyApi[]> {
  const { data } = await apiClient.get<CompanyApi[]>("/companies", {
    headers: { Accept: "application/json" },
  });
  return data ?? [];
}
export async function getActiveCompanies(): Promise<CompanyApi[]> {
  const { data } = await apiClient.get<CompanyApi[]>("/companies/status/active", {
    headers: { Accept: "application/json" },
  });
  return data ?? [];
}

export async function getCompany(id: string): Promise<CompanyApi> {
  const { data } = await apiClient.get<CompanyApi>(
    `/companies/${encodeURIComponent(id)}`,
    { headers: { Accept: "application/json" } }
  );
  return data;
}

 
export async function getWorkersByCompany(companyId: string) {
  const resp = await apiClient.get(`/workers/company/${encodeURIComponent(companyId)}`, {
    headers: { Accept: "application/json" },
  });
  if (resp.status === 204) return [];
  return resp.data;
} 
// Create company
export type CreateCompanyDto = {
  name: string;
  description?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
};
export async function createCompany(payload: CreateCompanyDto) {
  const { data } = await apiClient.post("/companies", payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return data;
}
// Delete company
export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
}
// --- Update company (PUT /companies/{id}) ---
export type UpdateCompanyDto = {
  name: string;
  description?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
};

export async function updateCompany(id: string, payload: UpdateCompanyDto) {
  const resp = await apiClient.put(`/companies/${encodeURIComponent(id)}`, payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (resp.data && typeof resp.data === "object") {
    return resp.data;
  }

  return { id, ...payload };
}

export type CreateWorkerDto = {
  name: string;
  workSpaceRef?: string;
  companyId: string;
  email: string;
};

export async function createWorker(payload: CreateWorkerDto): Promise<WorkerApi> {
  const { data } = await apiClient.post<WorkerApi>("/workers", payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return data;
}

// NEU: volles Update-DTO
export type UpdateWorkerDto = {
  name: string;
  workSpaceRef: string;   // exakt wie im Backend (case!)
  companyId: string;
  email: string;
};

export async function updateWorker(id: string, payload: UpdateWorkerDto): Promise<WorkerApi> {
  const { data } = await apiClient.put<WorkerApi>(`/workers/${encodeURIComponent(id)}`, payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return data;
}

//  Delete worker
export async function deleteWorker(id: string): Promise<void> {
  await apiClient.delete(`/workers/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
}

// ========= Worker–Catalog Assignments einer Company =========
export type AssignmentApi = {
  id: string;
  worker: {
    id: string;
    name: string;
    email: string;
    workSpaceRef?: string;
  };
  catalog: {
    id: string;
    title: string;
    description?: string;
  };
  status: "assigned" | "in_progress" | "completed" | "expired" | "blocked";
  accessCode?: string;
  accessToken?: string;
  assignedAt?: string;
  expiresAt?: string;
  firstAccessAt?: string | null;
  lastAccessAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
};

export async function getAssignmentsByCompany(companyId: string): Promise<AssignmentApi[]> {
  const resp = await apiClient.get(
    `/worker-catalog/company/${encodeURIComponent(companyId)}`,
    { headers: { Accept: "application/json" } }
  );
  if (resp.status === 204) return [];
  return resp.data ?? [];
}
// Toggle Status (active <-> inactive)
export async function changeCompanyStatus(id: string): Promise<CompanyApi> {
  const { data } = await apiClient.patch<CompanyApi>(
    `/companies/status/change/${encodeURIComponent(id)}`,
    null,
    { headers: { Accept: "application/json" } }
  );
  return data;
}
export async function getCompaniesActive(): Promise<CompanyApi[]> {
  const { data } = await apiClient.get<CompanyApi[]>("/companies/status/active", {
    headers: { Accept: "application/json" },
  });
  return data ?? [];
}

export async function getCompaniesInactive(): Promise<CompanyApi[]> {
  const { data } = await apiClient.get<CompanyApi[]>("/companies/status/inactive", {
    headers: { Accept: "application/json" },
  });
  return data ?? [];
}

// Toggle Worker Status (active <-> inactive)
export async function changeWorkerStatus(id: string): Promise<WorkerApi> {
  const { data } = await apiClient.patch<WorkerApi>(
    `/workers/${encodeURIComponent(id)}/status/change`,
    null,
    { headers: { Accept: "application/json" } }
  );
  return data;
}

// Get Worker Assignment Count
export async function getWorkerAssignmentCount(id: string): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(
    `/workers/${encodeURIComponent(id)}/assignment-count`,
    { headers: { Accept: "application/json" } }
  );
  return data?.count ?? 0;
}
// ===== Scoring =====
export type CompanyOverallScoreApi = {
  companyId: string;
  companyName: string;
  averagePercentageScore: number; // z.B. 75.5
  totalCompletedSessions: number;
  totalSessions: number;
  totalWorkers: number;
  totalCatalogs: number;
  catalogScores: any[]; // kannst du später typisieren, für CompanyList nicht nötig
};

// WICHTIG:
// Wenn dein apiClient baseURL schon ".../api" enthält (so wie bei /companies),
// dann ist der Pfad HIER nur "/scoring/..."
// Falls nicht, dann nimm "/api/scoring/..."
export async function getCompanyOverallScore(companyId: string): Promise<CompanyOverallScoreApi> {
  const { data } = await apiClient.get<CompanyOverallScoreApi>(
    `/scoring/company/${encodeURIComponent(companyId)}/overall`,
    { headers: { Accept: "application/json" } }
  );
  return data;
}

export type CompanyOverallApi = {
  companyId: string;
  companyName: string;
  averagePercentageScore: number;
  totalCompletedSessions: number;
  totalSessions: number;
  totalWorkers: number;
  totalCatalogs: number;
  catalogScores: Array<{
    catalogId: string;
    catalogTitle: string;
    percentageScore: number;
    completedSessions: number;
    totalSessions: number;
  }>;
};

export type CatalogWithWorkersApi = {
  catalogId: string;
  catalogTitle: string;
  percentageScore: number;
  completedSessions: number;
  totalSessions: number;
  workerScores: Array<{
    workerId: string;
    workerName: string;
    workerEmail: string;
    percentageScore: number;
    completedThemas: number;
    totalThemas: number;
    status: "assigned" | "in_progress" | "completed";
  }>;
};

// Du hast getCompanyOverallScore schon – falls nicht, so sollte es aussehen:
// export async function getCompanyOverallScore(companyId: string): Promise<CompanyOverallApi> { ... }

export async function getCompanyCatalogScoreWithWorkers(
  companyId: string,
  catalogId: string
): Promise<CatalogWithWorkersApi> {
  const { data } = await apiClient.get<CatalogWithWorkersApi>(
    `/scoring/company/${encodeURIComponent(companyId)}/catalog/${encodeURIComponent(catalogId)}/workers`,
    { headers: { Accept: "application/json" } }
  );
  return data;
}
export async function getWorker(id: string): Promise<WorkerApi> {
  const { data } = await apiClient.get<WorkerApi>(`/workers/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  return data;
}

export type WorkerCatalogScoreApi = {
  catalogId: string;
  catalogTitle: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  completedSessions: number;
  totalSessions: number;
  themaScores: Array<{
    themaId: string;
    themaName: string;
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    completedSessions: number;
    totalSessions: number;
  }>;
};

export async function getWorkerCatalogScore(
  workerId: string,
  catalogId: string
): Promise<WorkerCatalogScoreApi> {
  const { data } = await apiClient.get<WorkerCatalogScoreApi>(
    `/scoring/worker/${encodeURIComponent(workerId)}/catalog/${encodeURIComponent(catalogId)}`,
    { headers: { Accept: "application/json" } }
  );
  return data;
}


