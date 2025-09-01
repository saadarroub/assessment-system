import { Link, NavLink } from "react-router-dom";
import AdminLayout from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";
import { Users, Building2, ClipboardList, ArrowRight } from "lucide-react";

type Panel = {
  title: string;
  desc: string;
  count: number | string;
  to: string;
  icon: React.ComponentType<{ size?: number }>;
};

const PANELS: Panel[] = [
  {
    title: "Users",
    desc: "Manage user accounts and permissions",
    count: 4,
    to: "/admin/adminPanel/users",
    icon: Users,
  },
  {
    title: "Companies",
    desc: "Manage company settings and users",
    count: 3,
    to: "/admin/adminPanel/companies",
    icon: Building2,
  },
  {
    title: "Audit Logs",
    desc: "View system activity and changes",
    count: 5,
    to: "/admin/adminPanel/audit",
    icon: ClipboardList,
  },
];

export default function AdminPanelPage() {
  return (
    <AdminLayout>
      {/* ===== Hero wie im Fragenkatalog/Admin-Bereich ===== */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Admin Panel</h1>
              <p>Manage users, companies, and monitor system activities.</p>
            </div>
          </div>
          <div className="header-right" />
        </div>
      </header>

      {/* ===== Inhalt: kompakte Surface, Titel/Desc, Karten, Actions ===== */}
      <div className="admin-main">
        <div className="admin-surface">
          {/* Breadcrumb (klickbar) */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {/* Falls du keine /admin Route hast, ändere das auf /admin/adminPanel */}
            <NavLink to="/admin" end className="crumb">
              Admin
            </NavLink>
            <span className="crumb-sep">›</span>
           Panel
          </nav>

          <div className="page-header">
            <h2 className="page-title">Admin Panel</h2>
            <p className="page-description">
              Manage users, companies, and monitor system activities.
            </p>
          </div>

          {/* Karten */}
          <div className="stats-grid">
            {PANELS.map(({ title, desc, count, to, icon: Icon }) => (
              <Link key={title} to={to} className="admin-card stats-card">
                <div className="stats-header">
                  <div className="stats-info">
                    <div className="stats-icon">
                      <Icon size={18} />
                    </div>
                    <div className="stats-text">
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="stats-arrow" size={18} />
                </div>
                <div className="stats-number">{count}</div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="admin-card quick-actions" style={{ marginTop: 16 }}>
            <h3 className="actions-title">Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/admin/adminPanel/users" className="action-item">
                <span className="action-icon">
                  <Users size={16} />
                </span>
                <span>View All Users</span>
              </Link>
              <Link to="/admin/adminPanel/companies" className="action-item">
                <span className="action-icon">
                  <Building2 size={16} />
                </span>
                <span>Manage Companies</span>
              </Link>
              <Link to="/admin/adminPanel/audit" className="action-item">
                <span className="action-icon">
                  <ClipboardList size={16} />
                </span>
                <span>View Audit Trail</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
