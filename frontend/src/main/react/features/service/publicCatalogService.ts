
const PUB_BASE =
  (import.meta as any)?.env?.VITE_PUBLIC_BASE ?? "http://localhost:8080";

/** Ein Thema aus der Public-API */
export type PublicThemaDto = {
  id: string;
  name: string;
  description?: string;
};

/** Payload der Public-API: Katalog + Themen */
export type PublicCatalogPayload = {
  catalog: {
    id: string;
    title: string;
    description?: string;
  };
  themas: PublicThemaDto[];
};

/**
 * Lädt den Katalog (Titel/Desc/ID) und **alle zugehörigen Themen**
 * für einen gültigen Public-Access-Token.
 *
 * GET /public/access/{token}/catalog
 */
export async function fetchPublicCatalogWithThemas(
  accessToken: string
): Promise<PublicCatalogPayload> {
  if (!accessToken) {
    throw new Error("accessToken fehlt");
  }

  const url = `${PUB_BASE}/public/access/${encodeURIComponent(
    accessToken
  )}/catalog`;

  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `HTTP ${resp.status} beim Laden des Katalogs`);
  }
  const data = (await resp.json()) as PublicCatalogPayload;

  // Minimal-Validierung (hilft bei Debug)
  if (!data?.catalog?.id || !Array.isArray(data?.themas)) {
    throw new Error("Unerwartetes Format der Public-Katalog-Antwort");
  }

  return data;
}

