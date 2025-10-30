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
  // Wenn du Vite-Proxy nutzt, nimm:
  // const url = `/api/thema-catalogs/catalog/${encodeURIComponent(catalogId)}/themas`;
  const url = `http://localhost:8080/api/thema-catalogs/catalog/${encodeURIComponent(catalogId)}/themas`;
 
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[fetchThemenByCatalog] HTTP", res.status, res.statusText, body);
      return [];
    }

    const data = await res.json().catch((e) => {
      console.error("[fetchThemenByCatalog] JSON parse error:", e);
      return null;
    });

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
  const url = "http://localhost:8080/api/thema-catalogs"; // ggf. /api/... via Proxy
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${text ? ` – ${text}` : ""}`);
  }
  return res.json(); // { themaId, catalogId, orderIndex }
}
export async function assignTopicsToCatalog(catalogId: string, topicIds: string[]) {
  await Promise.all(
    topicIds.map((themaId, i) =>
      createThemaCatalog({ themaId, catalogId, orderIndex: i })
    )
  );
}

