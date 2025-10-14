import { useEffect, useState } from "react";
import { getCompanies } from "@/features/service/companyService";

export default function CompanyListtest() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCompanies()
      .then(setItems)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div>Fehler: {error}</div>;
  if (!items.length) return <div>Lade…</div>;

  return (
    <ul>
      {items.map((c: any) => (
        <li key={c.id ?? c.name}>{c.name ?? JSON.stringify(c)}</li>
      ))}
    </ul>
  );
}
