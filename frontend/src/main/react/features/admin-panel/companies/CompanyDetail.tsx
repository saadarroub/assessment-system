// src/main/react/features/admin-panel/companies/CompanyDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";
import "@/styles/adminCompanyDetails.css";
import { getCompany } from "@/features/service/companyService";

/* ---------- API & UI Types ---------- */
type CompanyApi = {
  id: string;
  name: string;
  description?: string;
  created_at?: string; // oder created
  // Falls dein /companies/{id} später mehr liefert (users, catalogs, status...), hier ergänzen
};

type CompanyUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type CompanyDetailsT = {
  id: string;
  name: string;
  status?: "active" | "inactive";
  created: string;       // ISO
  usersCount?: number;   // optional
  catalogsCount?: number;// optional
  users?: CompanyUser[]; // optional
};

function mapApiToDetails(x: CompanyApi): CompanyDetailsT {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: "active", // Platzhalter bis Feld existiert
    created: x.created_at ? new Date(x.created_at).toISOString() : new Date().toISOString(),
    usersCount: undefined,     // später via Endpoint füllen
    catalogsCount: undefined,  // später via Endpoint füllen
    users: undefined,          // später via Endpoint füllen
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE");
}

type TabKey = "users" | "catalogs" | "settings";

/* ---------- Component ---------- */
export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetailsT | null>(null);
  const [tab, setTab] = useState<TabKey>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!id) {
      setError("Keine ID in der URL gefunden.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const raw = await getCompany(id);
        const mapped = mapApiToDetails(raw);
        if (alive) setCompany(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <AdminPanelHeader>
        <header className="main-header">
          <div className="header-content">
            <div className="header-center">
              <div className="header-text">
                <h1>Company</h1>
                <p>Laden…</p>
              </div>
            </div>
          </div>
        </header>
      </AdminPanelHeader>
    );
  }

  if (error || !company) {
    return (
      <AdminPanelHeader>
        <header className="main-header">
          <div className="header-content">
            <div className="header-center">
              <div className="header-text">
                <h1>Companies</h1>
                <p>{error ?? "Company not found. Check the URL or go back to the list."}</p>
              </div>
            </div>
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

  // Fallbacks für optionale Daten
  const users = company.users ?? [];
  const usersCount = typeof company.usersCount === "number" ? company.usersCount : users.length || 0;
  const catalogsCount = typeof company.catalogsCount === "number" ? company.catalogsCount : 0;
  const statusLabel = (company.status ?? "active") === "active" ? "Active" : "Inactive";
  const statusClass = (company.status ?? "active") === "active" ? "status-active" : "status-inactive";

  return (
    <AdminPanelHeader>
      {/* === Hero-Header === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-text">
              <h1>Company: {company.name}</h1>
              <p>Details &amp; management</p>
            </div>
          </div>
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
            <p className="page-description">{company.name}</p>
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
                    {/* Domain entfernt */}
                  </div>
                </div>
                <span className={`status-badge ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon" aria-hidden>👥</span>
                  <span className="stat-number">{usersCount}</span>
                  <div className="stat-label">Users</div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon" aria-hidden>📂</span>
                  <span className="stat-number">{catalogsCount}</span>
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
                    <span aria-hidden>👥</span> Users ({usersCount})
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${tab === "catalogs" ? "active" : ""}`}
                    aria-selected={tab === "catalogs"}
                    onClick={() => setTab("catalogs")}
                  >
                    <span aria-hidden>📂</span> Catalogs ({catalogsCount})
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
                users.length ? (
                  <div className="user-list">
                    {users.map((u) => (
                      <div key={u.id} className="user-item">
                        <div className="user-left">
                          <div className="user-avatar-item" aria-hidden>
                            {u.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </div>
                          <div className="user-details">
                            <h3>{u.name}</h3>
                            <p><span aria-hidden>✉️</span>{u.email}</p>
                          </div>
                        </div>

                        <div className="user-right">
                          <div className="role-badges">
                            {(u.roles ?? []).map((r) => (
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
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon" aria-hidden>👥</div>
                    <p className="empty-title">Keine User-Daten verfügbar.</p>
                    <p className="empty-sub">Binde später den passenden Endpoint an.</p>
                  </div>
                )
              )}

              {tab === "catalogs" && (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden>📁</div>
                  <p className="empty-title">Catalog management would be implemented here.</p>
                  <p className="empty-sub">This company has {catalogsCount} catalogs.</p>
                </div>
              )}

              {tab === "settings" && (
                <div className="settings-wrap">
                  <div className="settings-grid">
                    <div className="input-ctrl">
                      <label htmlFor="c-name">Company Name</label>
                      <input id="c-name" value={company.name} readOnly />
                    </div>
                  </div>
                  <p className="settings-hint">
                    Settings management würde hier später implementiert.
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
                  <span className="stat-value">{usersCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-row">Total Catalogs:</span>
                  <span className="stat-value">{catalogsCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-row">Status:</span>
                  <span className="stat-value">{statusLabel}</span>
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
