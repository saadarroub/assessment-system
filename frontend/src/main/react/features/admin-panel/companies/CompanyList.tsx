import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, ArrowUpDown, Eye, Building2 } from "lucide-react";
import "@/styles/adminPanel.css";        // Grundtokens/Layout (Hero etc.)
import "@/styles/adminCompanies.css";    // Tabellen-/Seiten-Styles

type Company = {
  id: string;
  name: string;
  domain: string;
  users: number;
  catalogs: number;
  status: "active" | "inactive";
  created: string; // ISO
};

const DATA: Company[] = [
  { id: "c1", name: "ACME GmbH",    domain: "acme.com",     users: 12, catalogs: 4, status: "active",   created: "2024-01-10" },
  { id: "c2", name: "Globex AG",    domain: "globex.com",   users: 7,  catalogs: 2, status: "active",   created: "2024-01-20" },
  { id: "c3", name: "TechCorp Ltd", domain: "techcorp.com", users: 3,  catalogs: 1, status: "inactive", created: "2024-02-01" },
];

type SortKey = "name" | "domain" | "users" | "catalogs" | "status" | "created";

export default function CompaniesList() {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? DATA.filter(c => c.name.toLowerCase().includes(term) || c.domain.toLowerCase().includes(term))
      : DATA.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (c: Company): string | number => {
        if (sortKey === "users")    return c.users;
        if (sortKey === "catalogs") return c.catalogs;
        if (sortKey === "status")   return c.status;
        if (sortKey === "created")  return new Date(c.created).getTime();
        if (sortKey === "domain")   return c.domain.toLowerCase();
        return c.name.toLowerCase();
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
      {/* === Hero-Header direkt unter der Top-Nav === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Companies</h1>
              <p>Manage company settings, users, and configurations.</p>
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
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Companies</span>
        </nav>

        {/* Untertitel-Header (zentriert mit max-width) */}
        <header className="page-header">
          <h2 className="page-title">Companies</h2>
          <p className="page-description">
            Manage company settings, users, and configurations.
          </p>
        </header>

        {/* Tabelle in Card */}
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
                  placeholder="Search companies by name or domain..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search companies"
                />
              </div>
              <div className="pagination-info">
                Showing {filtered.length} companies
              </div>
            </div>
          </div>

          {/* Tabelle */}
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
                    <button className="sort-button" onClick={() => setSort("domain")} type="button">
                      <span>Domain</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("users")} type="button">
                      <span>Users</span><ArrowUpDown size={14} />
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
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="company-cell">
                        <div className="company-icon"><Building2 size={16} /></div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="cell-muted">{c.domain}</td>
                    <td><span className="count-badge">{c.users} users</span></td>
                    <td><span className="count-badge">{c.catalogs} catalogs</span></td>
                    <td>
                      <span className={"status-badge " + (c.status === "active" ? "status-active" : "status-inactive")}>
                        {c.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {new Date(c.created).toLocaleDateString("de-DE")}
                    </td>
                    <td>
                      <Link to={`/admin/adminPanel/companies/${c.id}`} className="btn btn-primary">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminPanelHeader>
  );
}
