export type ThemaApi = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getThemen(): Promise<ThemaApi[]> {
  const resp = await fetch("http://localhost:8080/api/themas", {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}