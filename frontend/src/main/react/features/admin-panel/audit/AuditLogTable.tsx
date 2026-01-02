import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { apiClient } from "@/api/client";
import "@/styles/adminPanel.css";   // Grundlayout & Tokens inkl. Hero
import "@/styles/AdminAudit.css";   // Seite/Toolbar/Tabelle

type ActionKey = string;  // Dynamic from backend

type OutcomeKey = "success" | "error";

type AuditRow = {
  id: string;
  ts: string;             // ISO
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;       // z.B. "users:uuid"
  outcome: OutcomeKey;
  details?: string;       // Additional info about the action
};

export default function AuditPage() {
  const [data, setData] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [q, setQ] = useState("");
  const [action, setAction] = useState<"all" | string>("all");
  const [outcome, setOutcome] = useState<"all" | OutcomeKey>("all");

  const [sortKey, setSortKey] = useState<"ts" | "actor" | "action" | "outcome">("ts");
  const [asc, setAsc] = useState(false);

  // Fetch audit logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<AuditRow[]>("/audit-logs");
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch audit logs:", err);
        setError(err.response?.status === 403 
          ? "Keine Berechtigung für Audit-Logs" 
          : "Fehler beim Laden der Audit-Logs");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Get unique actions for filter dropdown
  const actionOptions = useMemo(() => {
    const actions = [...new Set(data.map(r => r.action))];
    return [{ value: "all", label: "All Actions" }, ...actions.map(a => ({ value: a, label: a }))];
  }, [data]);

const OUTCOME_OPTIONS: { value: "all" | OutcomeKey; label: string }[] = [
  { value: "all", label: "All Outcomes" },
  { value: "success", label: "success" },
  { value: "error", label: "error" },
];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    let rows = data.filter((r) => {
      const matchesSearch =
        term.length === 0 ||
        r.actorName.toLowerCase().includes(term) ||
        r.actorEmail.toLowerCase().includes(term) ||
        r.action.toLowerCase().includes(term) ||
        r.resource.toLowerCase().includes(term);

    const matchesAction = action === "all" || r.action === action;
    const matchesOutcome = outcome === "all" || r.outcome === outcome;
    return matchesSearch && matchesAction && matchesOutcome;
    });

    rows.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (r: AuditRow): number | string => {
        switch (sortKey) {
          case "ts":      return new Date(r.ts).getTime();
          case "actor":   return r.actorName.toLowerCase();
          case "action":  return r.action;
          case "outcome": return r.outcome;
        }
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return rows;
  }, [q, action, outcome, sortKey, asc, data]);

  type SortKey = "ts" | "actor" | "action" | "outcome";
  
  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc(v => !v);
    else {
      setSortKey(key);
      setAsc(key === "ts" ? false : true);
    }
  };

  const clearFilters = () => {
    setQ(""); setAction("all"); setOutcome("all");
  };

  return (
    <AdminLayout>
      {/* === Hero-Header (wie bei den anderen Admin-Seiten) === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Audit Logs</h1>
              <p>Monitor system activities and user actions across the platform.</p>
            </div>
          </div>
          <div className="header-right" />
        </div>
      </header>

      <main className="admin-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Audit Logs</span>
        </nav>

        {/* Untertitel-Header (kompakt unter dem Hero) */}
        <header className="page-header">
          <h2 className="page-title">Audit Logs</h2>
          <p className="page-description">
            Filter, search and sort events to trace changes & activities.
          </p>
        </header>

        {/* Loading / Error States */}
        {loading && (
          <div className="admin-card" style={{ padding: "2rem", textAlign: "center" }}>
            Lade Audit-Logs...
          </div>
        )}
        
        {error && (
          <div className="admin-card" style={{ padding: "2rem", textAlign: "center", color: "var(--destructive)" }}>
            {error}
          </div>
        )}

        {/* Card mit Controls + Tabelle */}
        {!loading && !error && (
        <section className="admin-card">
          {/* Toolbar */}
          <div className="audit-controls">
            <div className="audit-row">
              <div className="search-input">
                <span className="search-icon" aria-hidden><Search size={16} /></span>
                <input
                  type="text"
                  placeholder="Search logs by action, actor, resource…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search audit logs"
                />
              </div>

              <select
                className="select"
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                aria-label="Filter by action"
              >
                {actionOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <select
                className="select"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                aria-label="Filter by outcome"
              >
                {OUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button type="button" className="btn btn-outline" onClick={clearFilters}>
                <Filter size={16} />
                Clear Filters
              </button>
            </div>

            <div className="audit-meta">Showing {filtered.length} audit logs</div>
          </div>

          {/* Tabelle */}
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <button className="th-sort" onClick={() => setSort("ts")} type="button">
                      <span>Timestamp</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="th-sort" onClick={() => setSort("actor")} type="button">
                      <span>Actor</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="th-sort" onClick={() => setSort("action")} type="button">
                      <span>Action</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Resource</th>
                  <th>
                    <button className="th-sort" onClick={() => setSort("outcome")} type="button">
                      <span>Outcome</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const d = new Date(row.ts);
                  const date = d.toLocaleDateString("de-DE");
                  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

                  return (
                    <tr key={row.id}>
                      <td>
                        <div><strong>{date}</strong></div>
                        <div className="cell-subtle">{time}</div>
                      </td>
                      <td>
                        <div><strong>{row.actorName}</strong></div>
                        <div className="cell-subtle">{row.actorEmail}</div>
                      </td>
                      <td>
                        <span className={`badge action-${row.action.toLowerCase().replace('_', '-')}`}>{row.action}</span>
                      </td>
                      <td className="cell-mono">{row.resource}</td>
                      <td>
                        <span className={`badge ${row.outcome === "success" ? "outcome-success" : "outcome-error"}`}>
                          {row.outcome}
                        </span>
                      </td>
                      <td className="cell-clip" title={row.details || "-"}>{row.details || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        )}
      </main>
    </AdminLayout>
  );
}
