export type CatalogApi = {
  id: string;
  title: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCatalogDto = {
  title: string;
  description?: string;
};

export type UpdateCatalogDto = {
  title?: string;
  description?: string | null;
};

/** Alle Kataloge laden */
export async function getCatalogs(): Promise<CatalogApi[]> {
  const resp = await fetch("http://localhost:8080/api/catalogs", {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/** Einzelnen Katalog laden */
export async function getCatalog(id: string): Promise<CatalogApi> {
  const resp = await fetch(
    `http://localhost:8080/api/catalogs/${encodeURIComponent(id)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/** Katalog anlegen */
export async function createCatalog(payload: CreateCatalogDto): Promise<CatalogApi> {
  const resp = await fetch("http://localhost:8080/api/catalogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}${text ? ` – ${text}` : ""}`);
  }
  return resp.json();
}

/** Katalog updaten */
export async function updateCatalog(id: string, payload: UpdateCatalogDto): Promise<CatalogApi> {
  const resp = await fetch(`http://localhost:8080/api/catalogs/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}${text ? ` – ${text}` : ""}`);
  }
  return resp.json();
}

/** Katalog löschen */
export async function deleteCatalog(id: string): Promise<void> {
  const resp = await fetch(`http://localhost:8080/api/catalogs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}${text ? ` – ${text}` : ""}`);
  }
}
