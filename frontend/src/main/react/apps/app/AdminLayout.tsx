// src/main/react/layouts/AdminLayout.tsx
import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import '@/styles/admin.css';
import capLogo from '@/assets/Logo_cap_consulting_RGB_Darkblue.svg';
import {
  Settings, BarChart3, FileText, ShoppingCart, Building2,
  ChevronRight, ChevronLeft
} from 'lucide-react';

type AdminLayoutProps = {
  children?: ReactNode; // <-- NEU
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarCn = `sidebar${collapsed ? ' collapsed' : ''}`;
  const mainCn    = `main-content${collapsed ? ' collapsed' : ''}`;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={sidebarCn}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon"><Settings size={18} /></div>
            <div className="brand-text">
              <h2>Fragenkatalog</h2>
              <p>Administrator</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Seitenleiste öffnen' : 'Seitenleiste schließen'}
            title={collapsed ? 'Öffnen' : 'Schließen'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-content">
          <div className="nav-section">
            <h3 className="nav-title">Navigation</h3>
            <nav className="nav-menu">
              <NavLink to="/admin" end className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
                <BarChart3 size={16} />
                <span className="nav-text">Übersicht</span>
              </NavLink>
              <NavLink to="/admin/catalogs" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
                <FileText size={16} />
                <span className="nav-text">Katalog zuweisen</span>
              </NavLink>
            </nav>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">Themenschwerpunkte</h3>
            <nav className="nav-menu">
              <button className="nav-item theme-item">
                <div className="theme-icon business"><Building2 size={12} /></div>
                <div className="theme-content">
                  <div className="theme-label">IT Operating Model</div>
                  <div className="theme-subtitle">Organisationsstrukturen und Prozesse</div>
                </div>
              </button>
              <button className="nav-item theme-item">
                <div className="theme-icon strategy"><BarChart3 size={12} /></div>
                <div className="theme-content">
                  <div className="theme-label">Enterprise Architecture Management</div>
                  <div className="theme-subtitle">Strategische IT-Planung und -Ausrichtung</div>
                </div>
              </button>
              <button className="nav-item theme-item">
                <div className="theme-icon sourcing"><ShoppingCart size={12} /></div>
                <div className="theme-content">
                  <div className="theme-label">IT Sourcing</div>
                  <div className="theme-subtitle">Beschaffung & Lieferanten</div>
                </div>
              </button>
              <button className="nav-item theme-item">
                <div className="theme-icon project"><FileText size={12} /></div>
                <div className="theme-content">
                  <div className="theme-label">IT Project Management</div>
                  <div className="theme-subtitle">Projektplanung und -durchführung</div>
                </div>
              </button>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="footer-text">
              <div>Fragenkatalog</div>
              <div>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main + Top-Nav */}
      <main className={mainCn}>
        <div className="admin-topnav">
          <div className="topnav-container">
            <div className="topnav-left">
              <ul className="topnav-links">
                <li><NavLink to="/admin" end className={({isActive}) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>Start</NavLink></li>
                <li><NavLink to="/admin/catalogs" className="topnav-link">Kataloge</NavLink></li>
              </ul>
            </div>

            <div className="topnav-center">
              <div className="topnav-avatar">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profil"
                />
              </div>
            </div>

            <div className="topnav-right">
              <ul className="topnav-links-right">
                <li><NavLink to="/admin/results" className={({isActive}) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>Ergebnisse</NavLink></li>
                <li><NavLink to="/admin/help" className="topnav-link">Hilfe</NavLink></li>
              </ul>
              <img className="brand-logo" src={capLogo} alt="CAP consulting" />
            </div>
          </div>
        </div>

        {/* HIER kommt der Seiteninhalt rein */}
        {children} {/* <-- statt <Outlet /> */}
      </main>
    </div>
  );
}
