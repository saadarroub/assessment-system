import { apiClient } from "@/api/client";

export type CatalogApi = {
  id: string;
  title: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogWithModelApi = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  reifegradModelId?: string | null;
  reifegradModelName?: string | null;
};

export type CreateCatalogDto = {
  title: string;
  description?: string;
};

export type CreateCatalogWithModelDto = {
  title: string;
  description?: string;
  reifegradModelId?: string | null;
};

export type UpdateCatalogDto = {
  title?: string;
  description?: string | null;
};

/** Alle Kataloge laden */
export async function getCatalogs(): Promise<CatalogApi[]> {
  const { data } = await apiClient.get<CatalogApi[]>("/catalogs", {
    headers: { Accept: "application/json" },
  });
  return data;
}

/** Alle Kataloge mit Reifegradmodell-Info laden */
export async function getCatalogsWithModels(): Promise<CatalogWithModelApi[]> {
  const { data } = await apiClient.get<CatalogWithModelApi[]>("/catalogs/with-models", {
    headers: { Accept: "application/json" },
  });
  return data;
}

/** Einzelnen Katalog laden */
export async function getCatalog(id: string): Promise<CatalogApi> {
  const { data } = await apiClient.get<CatalogApi>(
    `/catalogs/${encodeURIComponent(id)}`,
    { headers: { Accept: "application/json" } }
  );
  return data;
}

/** Katalog anlegen (Legacy) */
export async function createCatalog(payload: CreateCatalogDto): Promise<CatalogApi> {
  const { data } = await apiClient.post<CatalogApi>(
    "/catalogs",
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

/** Katalog mit optionalem Reifegradmodell anlegen */
export async function createCatalogWithModel(payload: CreateCatalogWithModelDto): Promise<CatalogWithModelApi> {
  const { data } = await apiClient.post<CatalogWithModelApi>(
    "/catalogs/with-model",
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

/** Reifegradmodell für einen Katalog setzen oder entfernen */
export async function setCatalogReifegradModel(catalogId: string, reifegradModelId: string | null): Promise<CatalogWithModelApi> {
  const url = reifegradModelId 
    ? `/catalogs/${encodeURIComponent(catalogId)}/reifegrad-model?reifegradModelId=${encodeURIComponent(reifegradModelId)}`
    : `/catalogs/${encodeURIComponent(catalogId)}/reifegrad-model`;
  
  const { data } = await apiClient.patch<CatalogWithModelApi>(url, null, {
    headers: { Accept: "application/json" },
  });
  return data;
}

/** Katalog updaten */
export async function updateCatalog(id: string, payload: UpdateCatalogDto): Promise<CatalogApi> {
  const { data } = await apiClient.put<CatalogApi>(
    `/catalogs/${encodeURIComponent(id)}`,
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

/** Katalog löschen */
export async function deleteCatalog(id: string): Promise<void> {
  await apiClient.delete(`/catalogs/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
}
