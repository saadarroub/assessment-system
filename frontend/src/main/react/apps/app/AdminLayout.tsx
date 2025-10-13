import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink ,useLocation } from 'react-router-dom';

import '@/styles/Test.css';    // NEUE Sidebar-/Nav-Styles

import capLogo from '@/assets/Logo_cap_consulting_RGB_Darkblue.svg';
import {
  Settings, BarChart3, FileText, ShoppingCart, Building2,
  ChevronRight, ChevronLeft
} from 'lucide-react';

type AdminLayoutProps = { children?: ReactNode };

/* ===== Helper ===== */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type NavId =
  | 'overview'
  | 'catalog'
  | 'enterprise'
  | 'operating'
  | 'sourcing'
  | 'project';

const NAV_PRIMARY: Array<{ id: NavId; label: string; Icon: React.FC<any> ; to: string }> = [
  { id: 'overview', label: 'Übersicht', Icon: BarChart3 ,to: '/admin'},
  { id: 'catalog', label: 'Katalog zuweisen', Icon: FileText , to: '/admin/katalogzuweisen'},
];

const NAV_THEMES: Array<{ id: NavId; label: string; sub: string; Icon: React.FC<any> }> = [
  { id: 'operating', label: 'IT Operating Model', sub: 'Organisationsstrukturen und Prozesse', Icon: Building2 },
  { id: 'enterprise', label: 'Enterprise Architecture Management', sub: 'Strategische IT-Planung und -Ausrichtung', Icon: BarChart3 },
  { id: 'sourcing', label: 'IT Sourcing', sub: 'Beschaffung & Lieferantenmanagement', Icon: ShoppingCart },
  { id: 'project', label: 'IT Project Management', sub: 'Projektplanung und -durchführung', Icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  // collapsible Sidebar
  const [collapsed, setCollapsed] = useState(false);
  // aktive Auswahl (nur lokal, fürs visuelle Highlight)
  const [active, setActive] = useState<NavId>('overview');

  // Sidebar + Active-Tab aus localStorage wiederherstellen
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed != null) setCollapsed(savedCollapsed === 'true');

    const savedActive = localStorage.getItem('activeNav');
    const allowed: string[] = ['overview', 'catalog', 'enterprise', 'operating', 'sourcing', 'project'];
    if (savedActive && allowed.includes(savedActive)) {
      setActive(savedActive as NavId);
    }
  }, []);

  useEffect(() => { localStorage.setItem('sidebarCollapsed', String(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem('activeNav', active); }, [active]);

  const showChevron = useMemo(() => !collapsed, [collapsed]);

  // Behalte deine ursprüngliche Main-Class-Logik bei
  const mainCn = `main-content${collapsed ? ' collapsed' : ''}`;

  return (
    <div className="admin-container fk-admin admin-shell">
      {/* ===== Neue Sidebar (ersetzt alten Slider-Teil) ===== */}
      <aside aria-label="Admin Sidebar" className={cx('sidebar', collapsed && 'collapsed')}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="brand" aria-hidden={collapsed}>
            <div className="logo-tile"><Settings className="icon" /></div>
            <div className="brand-text">
              <h2 className="brand-title">Fragenkatalog</h2>
              <p className="brand-sub">Administrator</p>
            </div>
          </div>

          <button
            aria-label={collapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}
            className="icon-btn toggle-btn"
            onClick={() => setCollapsed(v => !v)}
            type="button"
          >
            {collapsed ? <ChevronRight className="icon" /> : <ChevronLeft className="icon" />}
          </button>
        </div>

        {/* Inhalt */}
        <div className="sidebar-content">
          {/* Navigation (Übersicht / Katalog)*/}
          <div>
            <h3 className="section-title">Navigation</h3>
            <nav className="nav-list">
              {NAV_PRIMARY.map(({ id, label, Icon, to }) => {
                const isActive = active === id;
                return (
                  <NavLink
                    key={id}
                    to={to}
                    onClick={() => setActive(id)}
                    className={cx('nav-btn nav-btn--primary', isActive && 'is-active')}
                    type="button"
                    title={label}
                    aria-label={label}
                  >
                    <span className="nav-icon">
                      <Icon className="icon" />
                    </span>
                    <span className="label">{label}</span>
                    {showChevron && isActive && <ChevronRight className="chevron icon" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Themen */}
          <div>
            <h3 className="section-title">Themenschwerpunkte</h3>
            <nav className="nav-list">
              {NAV_THEMES.map(({ id, label, sub, Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={cx('nav-btn nav-btn--theme', `theme--${id}`, isActive && 'is-active')}
                    type="button"
                    title={label}
                    aria-label={label}
                  >
                    <div className="theme-dot"><Icon className="icon" /></div>
                    <div className="text">
                      <div className="label">{label}</div>
                      <div className="sub">{sub}</div>
                    </div>
                    {showChevron && isActive && <ChevronRight className="chevron icon" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <div>Fragenkatalog</div>
            <div>Admin</div>
          </div>
        </div>
      </aside>

      {/* ===== Main + Top-Nav (unverändert) ===== */}
      <main className={mainCn}>
        <div className="admin-topnav">
          <div className="topnav-container">
            <div className="topnav-left">
              <ul className="topnav-links">
                <li>
                  <NavLink to="/admin" end className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
                    Start
                  </NavLink>
                </li>
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
                <li><NavLink to="/admin/results" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>Ergebnisse</NavLink></li>
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
