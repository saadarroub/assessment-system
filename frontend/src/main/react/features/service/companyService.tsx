// src/services/companyService.ts
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