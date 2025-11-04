export type CatalogLinkMeta = {
  token: string;
  accessToken?: string;
  catalogId: string;
  catalogTitle: string;
  assignmentId: string;
  name: string;   // "Nurse Patricia Davis"
  code: string;   // z.B. "6ZZS8F"
};

export function buildCatalogUrl(meta: CatalogLinkMeta): string {
  const qs = new URLSearchParams({
    token: meta.token,
    accessToken: meta.accessToken ?? meta.token,
    catalogId: meta.catalogId,
    catalogTitle: meta.catalogTitle,
    assignmentId: meta.assignmentId,
    name: meta.name,
    code: meta.code,
  });
  return `/app/katalog-themen-public?${qs.toString()}`;
}
