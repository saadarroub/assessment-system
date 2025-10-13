// src/main/react/features/admin-panel/companies/CompanyDetails.tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";
import "@/styles/adminCompanyDetails.css";

type CompanyUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type CompanyDetailsT = {
  id: string;
  name: string;
  domain: string;
  status: "active" | "inactive";
  created: string; // ISO
  usersCount: number;
  catalogsCount: number;
  users: CompanyUser[];
};

// ----- Demo-Daten (später via API ersetzen) -----
const MOCK_COMPANIES: Record<string, CompanyDetailsT> = {
  c1: {
    id: "c1",
    name: "ACME GmbH",
    domain: "acme.com",
    status: "active",
    created: "2024-01-10T00:00:00Z",
    usersCount: 12,
    catalogsCount: 4,
    users: [
      { id: "u1", name: "Max Mustermann", email: "max@acme.com", roles: ["admin"] },
      { id: "u2", name: "Jane Doe", email: "jane@acme.com", roles: ["viewer"] },
    ],
  },
  c2: {
    id: "c2",
    name: "Globex AG",
    domain: "globex.com",
    status: "active",
    created: "2024-01-20T00:00:00Z",
    usersCount: 7,
    catalogsCount: 2,
    users: [{ id: "u3", name: "Alice Schmidt", email: "alice@globex.com", roles: ["editor"] }],
  },
  c3: {
    id: "c3",
    name: "TechCorp Ltd",
    domain: "techcorp.com",
    status: "inactive",
    created: "2024-02-01T00:00:00Z",
    usersCount: 3,
    catalogsCount: 1,
    users: [{ id: "u4", name: "Bob Johnson", email: "bob@techcorp.com", roles: ["admin", "editor"] }],
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE");
}

type TabKey = "users" | "catalogs" | "settings";

export default function CompanyDetails() {
  const { id } = useParams(); // c1 | c2 | c3
  const company = (id && MOCK_COMPANIES[id]) || undefined;
  const [tab, setTab] = useState<TabKey>("users");

  if (!company) {
    return (
      <AdminPanelHeader>
        {/* === Hero-Header === */}
        <header className="main-header">
          <div className="header-content">
            <div className="header-left" />
            <div className="header-center">
              <div className="header-text">
                <h1>Companies</h1>
                <p>Company not found. Check the URL or go back to the list.</p>
              </div>
            </div>
            <div className="header-right" />
          </div>
        </header>

        <main className="admin-main">
          <nav className="breadcrumb">
            <Link to="/admin/adminPanel">Admin Panel</Link>
            <span>›</span>
            <Link to="/admin/adminPanel/companies">Companies</Link>
            <span>›</span>
            <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Not found</span>
          </nav>

          <div className="admin-card" style={{ padding: "1.25rem", maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ margin: 0 }}>Company wurde nicht gefunden</h2>
            <p className="page-description" style={{ marginTop: ".5rem" }}>
              Prüfe die URL oder wähle eine Firma in der Liste.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link to="/admin/adminPanel/companies" className="btn btn-secondary" style={{ width: "auto" }}>
                ← Zur Übersicht
              </Link>
            </div>
          </div>
        </main>
      </AdminPanelHeader>
    );
  }

  return (
    <AdminPanelHeader>
      {/* === Hero-Header direkt unter der Top-Nav === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Company: {company.name}</h1>
              <p>{company.domain} • Details &amp; management</p>
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
          <Link to="/admin/adminPanel/companies">Companies</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{company.name}</span>
        </nav>

        {/* Kopf mit Zurück-Button */}
        <div className="page-header details-page-header">
          <Link to="/admin/adminPanel/companies" className="back-btn" aria-label="Zurück zu Companies">
            ←
          </Link>
          <div>
            <h2 className="page-title">Company Details &amp; Management</h2>
            <p className="page-description">{company.name} – {company.domain}</p>
          </div>
        </div>

        <div className="content-grid">
          {/* Hauptspalte */}
          <div className="main-column">
            <section className="admin-card company-section">
              {/* Header-Zeile */}
              <div className="company-header">
                <div className="company-info">
                  <div className="company-icon" aria-hidden>🏢</div>
                  <div className="company-text">
                    <h2>{company.name}</h2>
                    <p>{company.domain}</p>
                  </div>
                </div>
                <span className={"status-badge " + (company.status === "active" ? "status-active" : "status-inactive")}>
                  {company.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon" aria-hidden>👥</span>
                  <span className="stat-number">{company.usersCount}</span>
                  <div className="stat-label">Users</div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon" aria-hidden>📂</span>
                  <span className="stat-number">{company.catalogsCount}</span>
                  <div className="stat-label">Catalogs</div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon" aria-hidden>📅</span>
                  <div className="stat-number stat-number-compact">{formatDate(company.created)}</div>
                  <div className="stat-label">Created</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs" role="tablist" aria-label="Company Tabs">
                <div className="tab-list">
                  <button
                    type="button"
                    className={`tab-button ${tab === "users" ? "active" : ""}`}
                    aria-selected={tab === "users"}
                    onClick={() => setTab("users")}
                  >
                    <span aria-hidden>👥</span> Users ({company.users.length})
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${tab === "catalogs" ? "active" : ""}`}
                    aria-selected={tab === "catalogs"}
                    onClick={() => setTab("catalogs")}
                  >
                    <span aria-hidden>📂</span> Catalogs ({company.catalogsCount})
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${tab === "settings" ? "active" : ""}`}
                    aria-selected={tab === "settings"}
                    onClick={() => setTab("settings")}
                  >
                    <span aria-hidden>⚙️</span> Settings
                  </button>
                </div>
              </div>

              {/* Tab-Inhalte */}
              {tab === "users" && (
                <div className="user-list">
                  {company.users.map((u) => (
                    <div key={u.id} className="user-item">
                      <div className="user-left">
                        <div className="user-avatar-item" aria-hidden>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h3>{u.name}</h3>
                          <p><span aria-hidden>✉️</span>{u.email}</p>
                        </div>
                      </div>

                      <div className="user-right">
                        <div className="role-badges">
                          {u.roles.map((r) => (
                            <span key={r} className="role-badge">{r}</span>
                          ))}
                        </div>
                        <Link to={`/admin/adminPanel/users/${u.id}`} className="user-link">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "catalogs" && (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden>📁</div>
                  <p className="empty-title">Catalog management would be implemented here.</p>
                  <p className="empty-sub">This company has {company.catalogsCount} catalogs.</p>
                </div>
              )}

              {tab === "settings" && (
                <div className="settings-wrap">
                  <div className="settings-grid">
                    <div className="input-ctrl">
                      <label htmlFor="c-name">Company Name</label>
                      <input id="c-name" value={company.name} readOnly />
                    </div>
                    <div className="input-ctrl">
                      <label htmlFor="c-domain">Domain</label>
                      <input id="c-domain" value={company.domain} readOnly />
                    </div>
                  </div>
                  <p className="settings-hint">
                    Settings management would be implemented here in a real application.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Rechte Spalte */}
          <aside className="sidebar-column">
            <section className="admin-card actions-card">
              <h2 className="actions-title">Actions</h2>
              <div className="actions-list">
                <button type="button" className="btn btn-primary">
                  <span aria-hidden>👤➕</span> Invite User
                </button>
                <button type="button" className="btn btn-secondary">
                  <span aria-hidden>⚙️</span> Edit Settings
                </button>
              </div>
            </section>

            <section className="admin-card stats-card">
              <h2 className="stats-title">Company Stats</h2>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label-row">Total Users:</span>
                  <span className="stat-value">{company.usersCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-row">Total Catalogs:</span>
                  <span className="stat-value">{company.catalogsCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-row">Status:</span>
                  <span className="stat-value">{company.status === "active" ? "Active" : "Inactive"}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-row">Created:</span>
                  <span className="stat-value">{formatDate(company.created)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminPanelHeader>
  ); 
}
