// AdminLayout (Tailwind CSS) — v2 Fixes
// -------------------------------------------------------------
// • Dunklere Sidebar (wie Screenshot 3), kein "ausgewaschener" Look
// • Stärkere Kontraste für Icons/Text
// • Linke Gold-Akzentlinie reagiert sauber auf Hover/Active (expanded)
// • Topnav mit Gradient-Underline (Hover/Active) wie im Design
// • Kleine Bugfixes (calc-Layout, z-index, focus states)
// -------------------------------------------------------------

import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Settings,
} from "lucide-react";
import capLogo from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";

// Farbpalette
const CAP = {
  dark: "#264555",
  mid: "#56768f",
  gold: "#E3BB62",
  gray: "#808080",
  sand: "#d2c9b9",
  mute: "#ebebec",
};

const SIDEBAR_OPEN = 320; // px
const SIDEBAR_CLOSED = 72; // px

// Hilfsfunktionen für Gradients
const sidebarBg = () => ({
  backgroundColor: CAP.dark, // Fallback, damit es nie zu hell wirkt
  backgroundImage:
    `linear-gradient(180deg, rgba(38,69,85,0.98), rgba(38,69,85,0.96)),` +
    `radial-gradient(120% 80% at 0% 0%, rgba(227,185,98,0.10) 0%, transparent 55%)`,
  borderRightColor: "rgba(210,201,185,.28)",
});

const underlineGradient = `linear-gradient(90deg, ${CAP.gold}, rgba(227,185,98,.55))`;

/* ================================ */
/*           Component              */
/* ================================ */

type AdminLayoutProps = { children?: ReactNode };

const MENU = [
  { to: "/admin/adminPanel", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/adminPanel/users", label: "Users", icon: Users },
  { to: "/admin/adminPanel/companies", label: "Companies", icon: Building2 },
  { to: "/admin/adminPanel/audit", label: "Audit", icon: ClipboardList },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const PRIMARY = MENU[0];
  const SECONDARY = MENU.slice(1);

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* ===== Sidebar ===== */}
      <aside
        className="fixed inset-y-0 left-0 z-50 text-white flex flex-col overflow-hidden border-r transition-[width] duration-200"
        style={{
          ...sidebarBg(),
          width: collapsed ? SIDEBAR_CLOSED : SIDEBAR_OPEN,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between h-16 px-4 border-b"
          style={{ borderBottomColor: "rgba(210,201,185,.28)" }}
        >
          <div className={[
            "flex items-center gap-3 transition-opacity duration-200 select-none",
            collapsed ? "opacity-0 invisible" : "opacity-100 visible",
          ].join(" ")}
          >
            <div
              className="w-[34px] h-[34px] rounded-[10px] grid place-items-center text-white shadow-[0_8px_20px_-8px_rgba(86,118,143,0.35)]"
              style={{ background: `linear-gradient(135deg, ${CAP.mid}, ${CAP.dark})` }}
            >
              <Settings size={18} />
            </div>
            <div>
              <h2 className="m-0 text-white text-[0.95rem] font-extrabold tracking-[0.02em] leading-tight">
                Admin Panel
              </h2>
              <p className="m-0 text-white/85 font-semibold italic text-[0.82rem] leading-tight">
                Assessment System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Seitenleiste öffnen" : "Seitenleiste schließen"}
            title={collapsed ? "Öffnen" : "Schließen"}
            className="w-[34px] h-[34px] rounded-xl border grid place-items-center cursor-pointer transition-all duration-150 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{ borderColor: "rgba(210,201,185,.28)", background: "rgba(255,255,255,.06)" }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Inhalt */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {/* Overview */}
          <nav className="flex flex-col gap-2 px-4 pt-3 pb-5" aria-label="Schnellzugriff">
            <NavItem to={PRIMARY.to} exact={!!PRIMARY.exact} icon={PRIMARY.icon} label={PRIMARY.label} collapsed={collapsed} />
          </nav>

          {/* Titel */}
          {!collapsed && (
            <div className="mx-4 mt-1 mb-0.5 select-none" aria-hidden>
              <div className="text-white/70 text-[0.72rem] tracking-[0.12em] font-extrabold uppercase">
                NAVIGATION
              </div>
            </div>
          )}

          {/* Hauptnavigation */}
          <nav className={[
            "flex flex-col gap-2",
            collapsed ? "px-0 pt-2 pb-2" : "px-4 pt-1 pb-5",
          ].join(" ")} aria-label="Hauptnavigation">
            {SECONDARY.map(({ to, label, icon }) => (
              <NavItem key={to} to={to} icon={icon} label={label} collapsed={collapsed} />
            ))}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="mt-auto p-4">
              <div className="text-white/85 font-bold leading-4">
                <div>Admin</div>
                <div>Panel</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Main + Top-Nav ===== */}
      <main
        className="min-h-screen flex flex-col w-full transition-[margin-left] duration-200"
        style={{ marginLeft: collapsed ? SIDEBAR_CLOSED : SIDEBAR_OPEN }}
      >
        {/* Topnav */}
        <div
          role="navigation"
          aria-label="Obere Navigation"
          className="h-16 flex items-center border-b bg-white/90 [backdrop-filter:saturate(1.4)_blur(6px)]"
          style={{ borderColor: CAP.mute }}
        >
          <div className="h-full w-full max-w-[1280px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-6">
            {/* links */}
            <div>
              <ul className="list-none flex gap-5 m-0 p-0">
                <li>
                  <TopNavLink to="/admin" end>
                    Start
                  </TopNavLink>
                </li>
                <li>
                  <TopNavLink to="/admin/catalogs">Kataloge</TopNavLink>
                </li>
              </ul>
            </div>

            {/* mitte Avatar */}
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 p-[2px] rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                   style={{ background: `linear-gradient(180deg,#fff, ${CAP.mute})` }}>
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profil"
                  className="w-full h-full rounded-full block"
                />
              </div>
            </div>

            {/* rechts */}
            <div className="flex items-center gap-4">
              <ul className="list-none flex gap-5 m-0 p-0">
                <li>
                  <TopNavLink to="/admin/results">Ergebnisse</TopNavLink>
                </li>
                <li>
                  <TopNavLink to="/admin/help">Hilfe</TopNavLink>
                </li>
              </ul>
              <img src={capLogo} alt="CAP consulting" className="h-[38px] ml-auto opacity-95 transition-all hover:-translate-y-[1px] hover:opacity-100" />
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

/* --------------------------- Hilfs-Komponenten --------------------------- */

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
  collapsed?: boolean;
};

function NavItem({ to, label, icon: Icon, exact, collapsed }: NavItemProps) {
  // group für Hover-Steuerung der Pseudo-Leiste
  return (
    <NavLink
      to={to}
      end={!!exact}
      className={({ isActive }) => [
        "relative group select-none",
        collapsed
          ? "flex justify-center py-2 my-[0.45rem] rounded-[14px]"
          : "flex items-center gap-3 py-[0.85rem] pl-5 pr-4 my-[0.35rem] rounded-xl",
        "text-white/95 transition-all",
        isActive
          ? "bg-[rgba(86,118,143,0.24)] shadow-[inset_0_0_0_1px_rgba(227,185,98,0.35)]"
          : "hover:bg-[rgba(86,118,143,0.16)] hover:shadow-[inset_0_0_0_1px_rgba(210,201,185,0.25)] hover:translate-x-[1px]",
      ].join(" ")}
    >
      {/* Icon-Wrapper */}
      <span
        className={[
          "inline-flex items-center justify-center text-[#ebf2f7]",
          collapsed
            ? "w-9 h-9 rounded-[10px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_14px_-8px_rgba(0,0,0,0.45)] bg-white/15 border-white/20"
            : "w-7 h-7 rounded-[8px]",
        ].join(" ")}
      >
        <Icon size={18} />
      </span>

      {/* Linke Akzent-Linie (nur expanded) */}
      {!collapsed && (
        <span
          aria-hidden
          className="absolute left-3 top-2.5 bottom-2.5 w-1 rounded-[6px] opacity-0 scale-y-40 transition-all duration-200 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${CAP.gold}, ${CAP.mid})` }}
        />
      )}

      {/* Text */}
      {!collapsed && <span className="font-extrabold">{label}</span>}

      {/* Hover/Active Effekte steuern (nur expanded) */}
      {!collapsed && (
        <style>{`
          .group:hover > span[aria-hidden] { opacity: 1; transform: scaleY(1); box-shadow: 0 0 12px rgba(227,185,96,.40); }
          .group[aria-current="page"] > span[aria-hidden] { opacity: 1; transform: scaleY(1); box-shadow: 0 0 16px rgba(227,185,96,.48); }
        `}</style>
      )}
    </NavLink>
  );
}

function TopNavLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => [
        "relative text-[#264555] font-extrabold px-3 py-1.5 rounded-[10px] transition-colors",
        "hover:bg-[#ebebec]",
        isActive ? "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-[10px] after:h-[3px] after:rounded-[3px]" : "",
      ].join(" ")}
      style={
        // Gradient-Underline (wird über ::after gesetzt wenn active)
        {} as React.CSSProperties
      }
    >
      <span className="relative group/lnk">
        {children}
        {/* Hover-Underline */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 right-3 -bottom-[10px] h-[3px] rounded-[3px] opacity-0 transition-opacity duration-150 group-hover/lnk:opacity-100"
          style={{ background: underlineGradient }}
        />
      </span>
      {/* Active-Underline via extra style-Tag, um den Linear-Gradient sicher zu setzen */}
      <style>{`
        a[aria-current="page"]::after { background: ${underlineGradient}; }
      `}</style>
    </NavLink>
  );
}

/*
// tailwind.config.js (optional)
export default {
  theme: {
    extend: {
      colors: {
        cap: {
          dark: '#264555',
          mid: '#56768f',
          gold: '#E3BB62',
          gray: '#808080',
          sand: '#d2c9b9',
          mute: '#ebebec',
        },
      },
      zIndex: { 60: '60' }, // falls du z-60 als Utility brauchst
    },
  },
};
*/
