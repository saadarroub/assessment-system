import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, ArrowUpDown, Eye } from "lucide-react";
import "@/styles/adminPanel.css";     // Basis (Hero, Tokens, Buttons, Karten)
import "@/styles/adminUsers.css";     // Tabellen/Controls für Users

type UserRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "invited" | "disabled";
  lastLogin: string | null; // ISO-Date oder null für "Never"
};

const DATA: UserRow[] = [
  { id: "u1", name: "Max Mustermann", email: "max@acme.com", roles: ["admin"], status: "active",   lastLogin: "2025-08-29" },
  { id: "u2", name: "Jane Doe",       email: "jane@acme.com", roles: ["viewer"], status: "invited", lastLogin: null },
  { id: "u3", name: "Alice Schmidt",  email: "alice@globex.com", roles: ["editor"], status: "active", lastLogin: "2025-08-28" },
  { id: "u4", name: "Bob Johnson",    email: "bob@techcorp.com", roles: ["admin", "editor"], status: "disabled", lastLogin: "2025-08-25" },
];

type SortKey = "name" | "email" | "status" | "lastLogin";

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? DATA.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      : DATA.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (u: UserRow): string | number => {
        if (sortKey === "lastLogin") return u.lastLogin ? new Date(u.lastLogin).getTime() : -Infinity;
        if (sortKey === "status")    return u.status;
        if (sortKey === "email")     return u.email.toLowerCase();
        return u.name.toLowerCase();
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [q, sortKey, asc]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc(v => !v);
    else { setSortKey(key); setAsc(true); }
  };

  return (
    <AdminPanelHeader>
      {/* === Hero-Header (wie bei Admin-Panel & Details) === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Users</h1>
              <p>Manage user accounts, roles, and permissions.</p>
            </div>
          </div>
          <div className="header-right" />
        </div>
      </header>

      {/* === Inhalt === */}
      <main className="admin-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Users</span>
        </nav>

        {/* Seitenkopf unter dem Hero */}
        <header className="page-header">
          <h2 className="page-title">Users</h2>
          <p className="page-description">Manage user accounts, roles, and permissions.</p>
        </header>

        {/* Tabelle in einer Card */}
        <section className="admin-card">
          {/* Controls */}
          <div className="table-controls">
            <div className="controls-row">
              <div className="search-input">
                <span className="search-icon" aria-hidden>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search users"
                />
              </div>
              <div className="pagination-info">
                Showing {filtered.length} of {DATA.length} users
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <button className="sort-button" onClick={() => setSort("name")} type="button">
                      <span>Name</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("email")} type="button">
                      <span>Email</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Roles</th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("status")} type="button">
                      <span>Status</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("lastLogin")} type="button">
                      <span>Last Login</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="cell-muted">{u.email}</td>
                    <td>
                      <div className="role-badges">
                        {u.roles.map(r => <span key={r} className="role-badge">{r}</span>)}
                      </div>
                    </td>
                    <td>
                      <span className={
                        "status-badge " +
                        (u.status === "active" ? "status-active" :
                         u.status === "invited" ? "status-invited" : "status-disabled")
                      }>
                        {u.status}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("de-DE") : "Never"}
                    </td>
                    <td>
                      <Link to={`/admin/adminPanel/users/${u.id}`} className="btn btn-primary">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* (Optional) Footer/Pagination */}
          <div className="pagination">
            <div className="pagination-controls">
              <button className="pagination-btn disabled" disabled>Prev</button>
              <button className="pagination-btn disabled" disabled>Next</button>
            </div>
          </div>
        </section>
      </main>
    </AdminPanelHeader>
  );
}
