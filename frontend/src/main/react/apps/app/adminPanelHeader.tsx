import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "@/styles/adminPanelHeader.css";
import capLogo from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Settings,
} from "lucide-react";

type AdminLayoutProps = { children?: ReactNode };

const MENU = [
  { to: "/admin/adminPanel", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/adminPanel/users", label: "Users", icon: Users },
  { to: "/admin/adminPanel/companies", label: "Companies", icon: Building2 },
  { to: "/admin/adminPanel/audit", label: "Audit", icon: ClipboardList },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarCn = `sidebar${collapsed ? " collapsed" : ""}`;
  const mainCn = `main-content${collapsed ? " collapsed" : ""}`;

  const PRIMARY = MENU[0];
  const SECONDARY = MENU.slice(1);

  return (
    <div className="admin-container">
      {/* ===== Sidebar ===== */}
      <aside className={sidebarCn}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon"><Settings size={18} /></div>
            <div className="brand-text">
              <h2>Admin Panel</h2>
              <p>Assessment System</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? "Seitenleiste öffnen" : "Seitenleiste schließen"}
            title={collapsed ? "Öffnen" : "Schließen"}
            type="button"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-content">
          {/* Overview */}
          <nav className="nav-menu nav-menu-simple" aria-label="Schnellzugriff">
            <NavLink
              to={PRIMARY.to}
              end={!!PRIMARY.exact}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="nav-icon"><PRIMARY.icon aria-hidden size={18} /></span>
              <span className="nav-text">{PRIMARY.label}</span>
            </NavLink>
          </nav>

          {/* Titel */}
          <div className="nav-section" aria-hidden={collapsed}>
            <div className="nav-title">NAVIGATION</div>
          </div>

          {/* Hauptnavigation */}
          <nav className="nav-menu nav-menu-simple" aria-label="Hauptnavigation">
            {SECONDARY.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <span className="nav-icon"><Icon aria-hidden size={18} /></span>
                <span className="nav-text">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="footer-text">
              <div>Admin</div>
              <div>Panel</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main + Top-Nav (aus layouts/AdminLayout übernommen) ===== */}
      <main className={mainCn}>
        <div className="admin-topnav" role="navigation" aria-label="Obere Navigation">
          <div className="topnav-container">
            {/* links: Start/Kataloge */}
            <div className="topnav-left">
              <ul className="topnav-links">
                <li>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `topnav-link${isActive ? " topnav-link-active" : ""}`
                    }
                  >
                    Start
                  </NavLink>
                </li>
                <li><NavLink to="/admin/catalogs" className="topnav-link">Kataloge</NavLink></li>
              </ul>
            </div>

            {/* mitte: Avatar */}
            <div className="topnav-center">
              <div className="topnav-avatar">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profil"
                />
              </div>
            </div>

            {/* rechts: Ergebnisse/Hilfe + Logo */}
            <div className="topnav-right">
              <ul className="topnav-links-right">
                <li>
                  <NavLink
                    to="/admin/results"
                    className={({ isActive }) =>
                      `topnav-link${isActive ? " topnav-link-active" : ""}`
                    }
                  >
                    Ergebnisse
                  </NavLink>
                </li>
                <li><NavLink to="/admin/help" className="topnav-link">Hilfe</NavLink></li>
              </ul>
              <img className="brand-logo" src={capLogo} alt="CAP consulting" />
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
