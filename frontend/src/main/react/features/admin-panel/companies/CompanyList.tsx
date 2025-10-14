// src/features/admin-area/companies/CompaniesList.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, ArrowUpDown, Eye, Building2 } from "lucide-react";
import "@/styles/adminPanel.css";
import "@/styles/adminCompanies.css";
import { getCompanies, getWorkersByCompany } from "@/features/service/companyService";

type CompanyApi = { id: string; name: string; description?: string; created_at?: string; };
type Company = { id: string; name: string; status?: "active" | "inactive"; created: string; };

type SortKey = "name" | "workers" | "catalogs" | "status" | "created";

function mapApiToCompany(x: CompanyApi): Company {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: "active",
    created: x.created_at ? new Date(x.created_at).toISOString() : new Date().toISOString(),
  };
}

export default function CompaniesList() {
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Worker-Counts je Company
  const [workerCounts, setWorkerCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Companies laden
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getCompanies();
        const list = Array.isArray(raw) ? raw : (raw.content ?? []);
        const mapped = (list as CompanyApi[]).map(mapApiToCompany);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Worker-Anzahlen nachladen (parallel)
  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setCountsLoading(true);
    (async () => {
      try {
        const entries = await Promise.all(
          items.map(async (c) => {
            try {
              const data = await getWorkersByCompany(c.id);
              const count = Array.isArray(data) ? data.length : (Number(data?.total) || 0);
              return [c.id, count] as const;
            } catch {
              return [c.id, 0] as const;
            }
          })
        );
        if (alive) setWorkerCounts(Object.fromEntries(entries));
      } finally {
        if (alive) setCountsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [items]);

  // Suche + Sortierung
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? items.filter(c => c.name.toLowerCase().includes(term)) : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (c: Company): string | number => {
        if (sortKey === "workers")    return workerCounts[c.id] ?? -1;
        if (sortKey === "catalogs") return -1; // derzeit nicht vorhanden
        if (sortKey === "status")   return (c.status ?? "active");
        if (sortKey === "created")  return new Date(c.created).getTime();
        return c.name.toLowerCase(); // name
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc, workerCounts]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc(v => !v);
    else { setSortKey(key); setAsc(true); }
  };

  return (
    <AdminPanelHeader>
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Companies</h1>
              <p>Manage company settings, Workers, and configurations.</p>
            </div>
          </div>
          <div className="header-right" />
        </div>
      </header>

      <main className="admin-main">
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Companies</span>
        </nav>

        <header className="page-header">
          <h2 className="page-title">Companies</h2>
          <p className="page-description">Manage company settings, Workers, and configurations.</p>
        </header>
        <section className="admin-card">
          <div className="table-controls">
            <div className="controls-row">
              <div className="search-input">
                <span className="search-icon" aria-hidden><Search size={16} /></span>
                <input
                  type="text"
                  placeholder="Search companies by name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search companies"
                />
              </div>
              <div className="pagination-info">
                {loading ? "Loading…" : error ? "Error" : `Showing ${filtered.length} companies`}
              </div>
            </div>
          </div>

          {error && <div className="admin-error" role="alert" style={{ margin: "0.75rem 0" }}>Fehler: {error}</div>}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <button className="sort-button" onClick={() => setSort("name")} type="button">
                      <span>Company</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("workers")} type="button">
                      <span>Workers</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("catalogs")} type="button">
                      <span>Catalogs</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("status")} type="button">
                      <span>Status</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("created")} type="button">
                      <span>Created</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "1rem" }}>Lade Companies…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "1rem" }}>Keine Einträge gefunden.</td></tr>
                ) : (
                  filtered.map(c => {
                    const uCount = workerCounts[c.id];
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="company-cell">
                            <div className="company-icon"><Building2 size={16} /></div>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td> 
                          {countsLoading && !(c.id in workerCounts) ? (
                            <span className="cell-muted">…</span>
                          ) : (typeof uCount === "number" ? (
                            <span className="count-badge">{uCount} worker</span>
                          ) : (
                            <span className="cell-muted">—</span>
                          ))}
                        </td>
                        <td><span className="cell-muted">—</span></td>
                        <td>
                          <span className={"status-badge " + ((c.status ?? "active") === "active" ? "status-active" : "status-inactive")}>
                            {(c.status ?? "active") === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="cell-muted">
                          {new Date(c.created).toLocaleDateString("de-DE")}
                        </td>
                        <td>
                          {/* Unverändert lassen! */}
                          <Link to={`/admin/adminPanel/companies/${c.id}`} className="btn btn-primary">
                            <Eye size={14} /> View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminPanelHeader>
  );
}
