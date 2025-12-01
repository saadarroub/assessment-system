export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Woche${Math.floor(diffDays / 7) > 1 ? "n" : ""}`;
  if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monat${Math.floor(diffDays / 30) > 1 ? "en" : ""}`;
  return `vor ${Math.floor(diffDays / 365)} Jahr${Math.floor(diffDays / 365) > 1 ? "en" : ""}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
