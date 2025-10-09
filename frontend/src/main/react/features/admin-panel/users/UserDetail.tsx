import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";        // enthält .main-header, .header-content, ...
import "@/styles/adminUserDetails.css";  // Seitenspezifische Styles

type Activity = {
  action: string;
  resource: string;
  ts: string;
  details: string;
  outcome: "success" | "error";
};

type Company = { id: string; name: string; domain: string };

type UserDetails = {
  id: string;
  name: string;
  email: string;
  created: string;
  lastLogin: string; // ISO | "Never"
  roles: string[];
  status: "active" | "disabled" | "invited";
  companies: Company[];
  activities: Activity[];
};

// ---- Demo-Daten (später via API ersetzen) ----
export const MOCK_USERS: Record<string, UserDetails> = {
  u1: {
    id: "u1",
    name: "Max Mustermann",
    email: "max@acme.com",
    created: "2024-01-15T10:00:00Z",
    lastLogin: "2025-08-29T09:10:00Z",
    roles: ["admin"],
    status: "active",
    companies: [{ id: "c1", name: "ACME GmbH", domain: "acme.com" }],
    activities: [
      {
        action: "invite",
        resource: "user:u2",
        ts: "2025-08-29T09:10:00Z",
        details: "Invited new user to company ACME GmbH",
        outcome: "success",
      },
      {
        action: "assign_role",
        resource: "user:u3",
        ts: "2025-08-28T16:45:00Z",
        details: "Assigned editor role to Alice Schmidt",
        outcome: "success",
      },
    ],
  },
  u2: {
    id: "u2",
    name: "Jane Doe",
    email: "jane@acme.com",
    created: "2024-03-02T09:00:00Z",
    lastLogin: "Never",
    roles: ["viewer"],
    status: "invited",
    companies: [{ id: "c1", name: "ACME GmbH", domain: "acme.com" }],
    activities: [
      { action: "login", resource: "portal", ts: "2025-08-29T12:30:00Z", details: "-", outcome: "success" },
    ],
  },
  u3: {
    id: "u3",
    name: "Alice Schmidt",
    email: "alice@globex.com",
    created: "2024-02-10T11:00:00Z",
    lastLogin: "2025-08-28T08:05:00Z",
    roles: ["editor"],
    status: "active",
    companies: [{ id: "c2", name: "Globex AG", domain: "globex.com" }],
    activities: [
      { action: "update_profile", resource: "user:u3", ts: "2025-08-28T08:05:00Z", details: "Changed display name", outcome: "success" },
    ],
  },
  u4: {
    id: "u4",
    name: "Bob Johnson",
    email: "bob@techcorp.com",
    created: "2024-05-01T08:30:00Z",
    lastLogin: "2025-08-25T15:40:00Z",
    roles: ["admin", "editor"],
    status: "disabled",
    companies: [{ id: "c3", name: "TechCorp Ltd", domain: "techcorp.com" }],
    activities: [
      { action: "disable_user", resource: "user:u4", ts: "2025-08-25T15:45:00Z", details: "Account disabled by admin", outcome: "success" },
    ],
  },
};

function formatDate(d: string) {
  if (d.toLowerCase?.() === "never") return "Never";
  const date = new Date(d);
  return date.toLocaleDateString("de-DE");
}
function formatTime(d: string) {
  if (d.toLowerCase?.() === "never") return "—";
  const date = new Date(d);
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailsPage() {
  const { id = "u1" } = useParams();
  const user = MOCK_USERS[id] ?? MOCK_USERS["u1"];

  return (
    <AdminPanelHeader>
      {/* ===== Hero direkt NACH der Top-Navigation ===== */}
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

      {/* ===== Inhalts-Surface ===== */}
      <main className="admin-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <Link to="/admin/adminPanel/users">Users</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>
            {user.name}
          </span>
        </nav>

        {/* Kopf mit Zurück-Button */}
        <div className="page-header details-page-header">
          <Link to="/admin/adminPanel/users" className="back-btn" aria-label="Zurück zu Users">
            ←
          </Link>
          <div>
            <h2 className="page-title">{user.name}</h2>
            <p className="page-description">User Details &amp; Management</p>
          </div>
        </div>

        {/* 2-Spalten Inhalt */}
        <div className="content-grid">
          {/* Hauptspalte */}
          <div className="main-column">
            {/* User Information */}
            <section className="admin-card info-section">
              <div className="section-header">
                <h3 className="section-title">User Information</h3>
                <span
                  className={`status-badge ${
                    user.status === "active"
                      ? "status-active"
                      : user.status === "invited"
                      ? "status-invited"
                      : "status-disabled"
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <div className="info-grid">
                <div>
                  <div className="info-item">
                    <span className="info-icon" aria-hidden>✉️</span>
                    <div className="info-content">
                      <p>Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="spacer-12" />

                  <div className="info-item">
                    <span className="info-icon" aria-hidden>📅</span>
                    <div className="info-content">
                      <p>Created</p>
                      <p>{formatDate(user.created)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p className="label-compact">Roles</p>
                    <div className="role-badges">
                      {user.roles.map((r) => (
                        <span key={r} className="role-badge">{r}</span>
                      ))}
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon" aria-hidden>⚡</span>
                    <div className="info-content">
                      <p>Last Login</p>
                      <p>
                        {user.lastLogin === "Never"
                          ? "Never"
                          : `${formatDate(user.lastLogin)} ${formatTime(user.lastLogin)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Associated Companies */}
            <section className="admin-card info-section">
              <div className="section-row">
                <span aria-hidden>🏢</span>
                <h3 className="section-title">Associated Companies</h3>
              </div>

              <div className="company-list">
                {user.companies.map((c) => (
                  <div key={c.id} className="company-item">
                    <div className="company-info">
                      <h4>{c.name}</h4>
                      <p>{c.domain}</p>
                    </div>
                    <Link to={`/admin/companies/${c.id}`} className="company-link">
                      View Company
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activities */}
            <section className="admin-card info-section">
              <h3 className="section-title" style={{ marginBottom: "1rem" }}>
                Recent Activities
              </h3>

              <div className="activity-list">
                {user.activities.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" aria-hidden />
                    <div className="activity-content">
                      <p>
                        <strong>{a.action}</strong> on <span className="muted">{a.resource}</span>
                      </p>
                      <p className="muted">
                        {formatDate(a.ts)}, {formatTime(a.ts)}
                      </p>
                      <p className="muted">{a.details}</p>
                    </div>
                    <span
                      className={`outcome-badge ${
                        a.outcome === "success" ? "outcome-success" : "outcome-error"
                      }`}
                    >
                      {a.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Aktionen (rechte Spalte) */}
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
  