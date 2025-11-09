//worker pro companies 
export type WorkerApi = {
  id: string;
  name: string;
  workSpaceRef?: string;
  companyId: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}; 


export async function getCompanies() {
  const resp = await fetch("http://localhost:8080/api/companies", {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
export async function getCompany(id: string) {
  const resp = await fetch(`http://localhost:8080/api/companies/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
 
export async function getWorkersByCompany(companyId: string) {
  const resp = await fetch(`http://localhost:8080/api/workers/company/${encodeURIComponent(companyId)}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json(); // Array von Workern (wir zählen length)
} 
// NEW: Create company
export type CreateCompanyDto = { name: string; description?: string };
export async function createCompany(payload: CreateCompanyDto) {
  const resp = await fetch("http://localhost:8080/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json(); // erwartet: neu erstelltes Company-Objekt
}
// NEW: Delete company
export async function deleteCompany(id: string): Promise<void> {
  const resp = await fetch(`http://localhost:8080/api/companies/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}
// --- Update company (PUT /companies/{id}) ---
export type UpdateCompanyDto = { name: string; description?: string };

export async function updateCompany(id: string, payload: UpdateCompanyDto) {
  const resp = await fetch(`http://localhost:8080/api/companies/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  // 200 mit JSON oder 204 ohne Body beides unterstützen
  const text = await resp.text();
  return text ? JSON.parse(text) : { id, ...payload };
}

export type CreateWorkerDto = {
  name: string;
  workSpaceRef?: string;
  companyId: string;
  email: string;
};

export async function createWorker(payload: CreateWorkerDto): Promise<WorkerApi> {
  const resp = await fetch("http://localhost:8080/api/workers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// NEU: volles Update-DTO
export type UpdateWorkerDto = {
  name: string;
  workSpaceRef: string;   // exakt wie im Backend (case!)
  companyId: string;
  email: string;
};

export async function updateWorker(id: string, payload: UpdateWorkerDto): Promise<WorkerApi> {
  const r = await fetch(`http://localhost:8080/api/workers/${encodeURIComponent(id)}`, {
    method: "PUT", // falls dein Backend PATCH unterstützt, kannst du das alternativ nutzen
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// NEW: Delete worker
export async function deleteWorker(id: string): Promise<void> {
  const r = await fetch(`http://localhost:8080/api/workers/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
  status: "assigned" | "in_progress" | "completed" | "expired";
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
  const resp = await fetch(
    `http://localhost:8080/api/worker-catalog/company/${encodeURIComponent(companyId)}`,
    { headers: { Accept: "application/json" } }
  );
   // 204 oder 200 mit leerem Body => als []
  if (resp.status === 204) return [];
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
