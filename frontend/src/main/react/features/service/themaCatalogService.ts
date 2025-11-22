import { apiClient } from "@/api/client";

export type ThemaDto = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateThemaCatalogDto = {
  themaId: string;
  catalogId: string;
  orderIndex?: number;
};

/**
 * Holt alle Themen (Topics) eines Katalogs.
 * Endpoint:
 * GET http://localhost:8080/api/thema-catalogs/catalog/{catalogId}/themas
 *
 * Tipp: Wenn du Vite-Proxy verwendest, kannst du unten stattdessen "/api/..." nutzen.
 */
export async function fetchThemenByCatalog(catalogId: string): Promise<ThemaDto[]> {
  try {
    const { data } = await apiClient.get<ThemaDto[]>(
      `/thema-catalogs/catalog/${encodeURIComponent(catalogId)}/themas`,
      { headers: { Accept: "application/json" } }
    );

    if (!Array.isArray(data)) {
      console.error("[fetchThemenByCatalog] Expected array, got:", data);
      return [];
    }

    return data.map((x: any) => ({
      id: String(x?.id ?? ""),
      name: String(x?.name ?? ""),
      description: x?.description ? String(x.description) : "",
      createdAt: x?.createdAt ? String(x.createdAt) : undefined,
      updatedAt: x?.updatedAt ? String(x.updatedAt) : undefined,
    }));
  } catch (err) {
    console.error("[fetchThemenByCatalog] Network/Unknown error:", err);
    return [];
  }
}

export async function createThemaCatalog(payload: CreateThemaCatalogDto) {
  const res = await apiClient.post(
    "/thema-catalogs",
    payload,
    {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    }
  );
  return res.data;
}
export async function assignTopicsToCatalog(catalogId: string, topicIds: string[]) {
  await Promise.all(
    topicIds.map((themaId, i) =>
      createThemaCatalog({ themaId, catalogId, orderIndex: i })
    )
  );
}
// themaCatalogService.ts
export async function getTopicCountForCatalog(catalogId: string): Promise<number> {
  const resp = await apiClient.get(
    `/thema-catalogs/catalog/${encodeURIComponent(catalogId)}/count`,
    { headers: { Accept: "application/json" } }
  );

  const data = resp.data;
  return typeof data === "number" ? data : (data?.count ?? 0);
}
/** Anzahl der Fragen für ein Thema (UUID) laden */
export async function getQuestionCountForThema(themaId: string): Promise<number> {
  const resp = await apiClient.get(
    `/question-nodes/count/thema/${encodeURIComponent(themaId)}`,
    { headers: { Accept: "application/json" }, responseType: "text" }
  );

  const text = typeof resp.data === "string" ? resp.data : String(resp.data ?? "");
  const n = Number(text);
  if (Number.isNaN(n)) throw new Error("Unerwartete Antwort (keine Zahl).");
  return n;
}
