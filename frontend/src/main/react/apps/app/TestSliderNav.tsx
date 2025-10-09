import React, { useEffect, useMemo, useState } from "react";
import "@/styles/Test.css";
import {
  Settings,
  BarChart3,
  FileText,
  ShoppingCart,
  Building2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// kleine Helper-Funktion für Klassen
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type NavId =
  | "overview"
  | "catalog"
  | "enterprise"
  | "operating"
  | "sourcing"
  | "project";

const NAV_PRIMARY: Array<{ id: NavId; label: string; Icon: React.FC<any> }> = [
  { id: "overview", label: "Übersicht", Icon: BarChart3 },
  { id: "catalog", label: "Katalog zuweisen", Icon: FileText },
];

const NAV_THEMES: Array<{ id: NavId; label: string; sub: string; Icon: React.FC<any> }> = [
  {
    id: "operating",
    label: "IT Operating Model",
    sub: "Organisationsstrukturen und Prozesse",
    Icon: Building2,
  },
  {
    id: "enterprise",
    label: "Enterprise Architecture Management",
    sub: "Strategische IT-Planung und -Ausrichtung",
    Icon: BarChart3,
  },
  {
    id: "sourcing",
    label: "IT Sourcing",
    sub: "Beschaffung & Lieferantenmanagement",
    Icon: ShoppingCart,
  },
  {
    id: "project",
    label: "IT Project Management",
    sub: "Projektplanung und -durchführung",
    Icon: FileText,
  },
];

export default function AdminHeaderNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<NavId>("overview");

  // Immer offen starten; aktiven Tab ggf. wiederherstellen (nur erlaubte IDs)
  useEffect(() => {
    const saved = localStorage.getItem("activeNav");
    const allowed: NavId[] = ["overview","catalog","enterprise","operating","sourcing","project"];
    if (saved && (allowed as string[]).includes(saved)) {
      setActive(saved as NavId);
    }
    setCollapsed(false);
    localStorage.setItem("sidebarCollapsed", "false");
  }, []);

  useEffect(() => { localStorage.setItem("sidebarCollapsed", String(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem("activeNav", active); }, [active]);

  const showChevron = useMemo(() => !collapsed, [collapsed]);

  return (
    <div className="fk-admin admin-shell">
      <aside aria-label="Admin Sidebar" className={cx("sidebar", collapsed && "collapsed")}>
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
            aria-label={collapsed ? "Sidebar erweitern" : "Sidebar einklappen"}
            className="icon-btn toggle-btn"
            onClick={() => setCollapsed(v => !v)}
          >
            {collapsed ? <ChevronRight className="icon" /> : <ChevronLeft className="icon" />}
          </button>
        </div>

        {/* Inhalt */}
        <div className="sidebar-content">
          {/* Navigation */}
          <div>
            <h3 className="section-title">Navigation</h3>
            <nav className="nav-list">
              {NAV_PRIMARY.map(({ id, label, Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={cx("nav-btn", isActive && "is-active")}
                  >
                    <Icon className="icon" />
                    <span className="label">{label}</span>
                    {showChevron && isActive && <ChevronRight className="chevron icon" />}
                  </button>
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
                    className={cx("nav-btn theme", `theme--${id}`, isActive && "is-active")}
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
    </div>
  );
}
