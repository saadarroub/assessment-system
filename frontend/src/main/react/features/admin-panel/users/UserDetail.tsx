// src/features/admin-panel/users/UserDetailsPage.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";
import "@/styles/adminUserDetails.css";
import { getUser, getUserRoles, type UserApi } from "@/features/service/userService";

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(+dt) ? "—" : dt.toLocaleDateString("de-DE");
}
function fmtTime(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(+dt) ? "—" : dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserApi | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User laden
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) throw new Error("Keine User-ID in der URL gefunden.");
        const u = await getUser(id);
        if (alive) setUser(u);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Rollen laden
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setRolesLoading(true);
    (async () => {
      try {
        const r = await getUserRoles(id);
        if (alive) setRoles(r);
      } finally {
        if (alive) setRolesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const displayName = loading ? "Loading…" : (user?.name || "—");

  return (
    <AdminPanelHeader>
      {/* ===== Hero ===== */}
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

      <main className="admin-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <Link to="/admin/adminPanel/users">Users</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{displayName}</span>
        </nav>

        {/* Kopf mit Zurück-Button */}
        <div className="page-header details-page-header">
          <Link to="/admin/adminPanel/users" className="back-btn" aria-label="Zurück zu Users">←</Link>
          <div>
            <h2 className="page-title">{displayName}</h2>
            <p className="page-description">User Details &amp; Management</p>
          </div>
        </div>

        {/* 2-Spalten Inhalt */}
        <div className="content-grid">
          {/* Hauptspalte */}
          <div className="main-column">
            {/* User Information (nur API; Fallbacks = "—") */}
            <section className="admin-card info-section">
              <div className="section-header">
                <h3 className="section-title">User Information</h3>
              </div>

              {error && (
                <div className="admin-error" role="alert" style={{ marginBottom: 12 }}>
                  Fehler: {error}
                </div>
              )}

              <div className="info-grid">
                <div>
                  <div className="info-item">
                    <span className="info-icon" aria-hidden>👤</span>
                    <div className="info-content">
                      <p>Name</p>
                      <p>{loading ? "…" : (user?.name || "—")}</p>
                    </div>
                  </div>

                  <div className="spacer-12" />

                  <div className="info-item">
                    <span className="info-icon" aria-hidden>✉️</span>
                    <div className="info-content">
                      <p>Email</p>
                      <p>{loading ? "…" : (user?.email || "—")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p className="label-compact">Roles</p>
                    <div className="role-badges">
                      {rolesLoading ? (
                        <span className="cell-muted">…</span>
                      ) : roles.length ? (
                        roles.map(r => <span key={r} className="role-badge">{r}</span>)
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon" aria-hidden>📅</span>
                    <div className="info-content">
                      <p>Created</p>
                      <p>{loading ? "…" : fmtDate(user?.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Associated Companies – Struktur bleibt, Inhalte = "—" solange keine API */}
            <section className="admin-card info-section">
              <div className="section-row">
                <span aria-hidden>🏢</span>
                <h3 className="section-title">Associated Companies</h3>
              </div>

              <div className="company-list">
                <div className="company-item">
                  <div className="company-info">
                    <h4>—</h4>
                    <p>—</p>
                  </div>
                  <button className="company-link" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    View Company
                  </button>
                </div>
              </div>
            </section>

            {/* Recent Activities – Struktur bleibt, Inhalte = "—" solange keine API */}
            <section className="admin-card info-section">
              <h3 className="section-title" style={{ marginBottom: "1rem" }}>
                Recent Activities
              </h3>

              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot" aria-hidden />
                  <div className="activity-content">
                    <p><strong>—</strong> on <span className="muted">—</span></p>
                    <p className="muted">{fmtDate()} , {fmtTime()}</p>
                    <p className="muted">—</p>
                  </div>
                  <span className="outcome-badge outcome-success">—</span>
                </div>
              </div>
            </section>
          </div>

          {/* Rechte Spalte (unverändert) */}
          <aside className="sidebar-column">
            <section className="admin-card actions-card">
              <h3 className="actions-title">Actions</h3>
              <div className="actions-list">
                <button type="button" className="btn btn-secondary">
                  <span aria-hidden>🔄</span> Reset Password
                </button>
                <button type="button" className="btn btn-destructive">
                  <span aria-hidden>🚫</span> Disable User
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminPanelHeader>
  );
}
