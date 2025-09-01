import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import "@/styles/adminPanel.css";   // Grundlayout & Tokens inkl. Hero
import "@/styles/adminAudit.css";   // Seite/Toolbar/Tabelle

type ActionKey =
  | "login"
  | "invite"
  | "assign_role"
  | "create_catalog"
  | "update_company";

type OutcomeKey = "success" | "error";

type AuditRow = {
  id: string;
  ts: string;             // ISO
  actorName: string;
  actorEmail: string;
  action: ActionKey;
  resource: string;       // z.B. "user:u2"
  outcome: OutcomeKey;
  details: string;
};

const DATA: AuditRow[] = [
  {
    id: "a2",
    ts: "2025-08-29T12:30:00Z",
    actorName: "Jane Doe",
    actorEmail: "jane@acme.com",
    action: "login",
    resource: "portal",
    outcome: "success",
    details: "-",
  },
  {
    id: "a1",
    ts: "2025-08-29T11:10:00Z",
    actorName: "Max Mustermann",
    actorEmail: "max@acme.com",
    action: "invite",
    resource: "user:u2",
    outcome: "success",
    details: "Invited new user to company ACME GmbH",
  },
  {
    id: "a3",
    ts: "2025-08-28T18:45:00Z",
    actorName: "Max Mustermann",
    actorEmail: "max@acme.com",
    action: "assign_role",
    resource: "user:u3",
    outcome: "success",
    details: "Assigned editor role to Alice Schmidt",
  },
  {
    id: "a4",
    ts: "2025-08-28T16:20:00Z",
    actorName: "Alice Schmidt",
    actorEmail: "alice@globex.com",
    action: "create_catalog",
    resource: "catalog:cat123",
    outcome: "success",
    details: "Created new assessment catalog",
  },
  {
    id: "a5",
    ts: "2025-08-27T13:15:00Z",
    actorName: "Max Mustermann",
    actorEmail: "max@acme.com",
    action: "update_company",
    resource: "company:c1",
    outcome: "error",
    details: "Failed to update company settings - validation error",
  },
];

type SortKey = "ts" | "actor" | "action" | "outcome";

const ACTION_OPTIONS: { value: "all" | ActionKey; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "login", label: "login" },
  { value: "invite", label: "invite" },
  { value: "assign_role", label: "assign role" },
  { value: "create_catalog", label: "create catalog" },
  { value: "update_company", label: "update company" },
];

const OUTCOME_OPTIONS: { value: "all" | OutcomeKey; label: string }[] = [
  { value: "all", label: "All Outcomes" },
  { value: "success", label: "success" },
  { value: "error", label: "error" },
];

export default function AuditPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState<"all" | ActionKey>("all");
  const [outcome, setOutcome] = useState<"all" | OutcomeKey>("all");

  const [sortKey, setSortKey] = useState<SortKey>("ts");
  const [asc, setAsc] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    let rows = DATA.filter((r) => {
      const matchesSearch =
        term.length === 0 ||
        r.actorName.toLowerCase().includes(term) ||
        r.actorEmail.toLowerCase().includes(term) ||
        actionLabel(r.action).includes(term) ||
        r.resource.toLowerCase().includes(term) ||
        r.details.toLowerCase().includes(term);

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
          case "action":  return actionLabel(r.action);
          case "outcome": return r.outcome;
        }
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return rows;
  }, [q, action, outcome, sortKey, asc]);

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
    <AdminPanelHeader>
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

        {/* Card mit Controls + Tabelle */}
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
                {ACTION_OPTIONS.map((o) => (
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
                        <span className={`badge ${actionClass(row.action)}`}>{actionLabel(row.action)}</span>
                      </td>
                      <td className="cell-mono">{row.resource}</td>
                      <td>
                        <span className={`badge ${row.outcome === "success" ? "outcome-success" : "outcome-error"}`}>
                          {row.outcome}
                        </span>
                      </td>
                      <td className="cell-clip">{row.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminPanelHeader>
  );
}

/* Helpers */
function actionLabel(a: ActionKey): string {
  switch (a) {
    case "assign_role":     return "assign role";
    case "create_catalog":  return "create catalog";
    case "update_company":  return "update company";
    default:                return a; // login / invite
  }
}

function actionClass(a: ActionKey) {
  switch (a) {
    case "login":           return "action-login";
    case "invite":          return "action-invite";
    case "assign_role":     return "action-assign";
    case "create_catalog":  return "action-create";
    case "update_company":  return "action-update";
    default:                return "";
  }
}
