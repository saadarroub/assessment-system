/**Mini-Helper zum Lesen des Tokens */
export function getQueryParam(name: string, search: string = window.location.search): string | null {
  const qs = new URLSearchParams(search);
  const v = qs.get(name);
  return v && v.trim() ? v.trim() : null;
}
