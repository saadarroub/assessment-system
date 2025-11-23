import { apiClient } from "@/api/client";

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
  const { data } = await apiClient.get<CatalogApi[]>("/catalogs", {
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

/** Katalog anlegen */
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
