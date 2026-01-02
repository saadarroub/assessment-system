// apps/app/AdminLayout.tsx — AdminPanel (Style identisch, nur Spacing + Footer fix)
import React, { useState, useMemo, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronRight, ChevronLeft,
  LayoutDashboard, Users, Building2, ClipboardList, Settings, ChevronRight as Caret, FileText
} from "lucide-react";
import capLogo from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";

/* ===== Tokens (wie dein anderes AdminLayout) ===== */
const TOKENS = {
  sidebarHSL: "210 25% 27%",
  sidebarStrong: "210 25% 29%",
  sidebarFg: "210 40% 96%",
  sidebarMuted: "210 16% 80%",
  sidebarBorder: "210 14% 37%",
  primary: "215 84% 56%",
  activeBg: "hsla(0,0%,0%,.22)",
  hoverBg: "hsla(0,0%,100%,.06)",
  sizes: {
    sidebarOpen: 320,
    sidebarClosed: 80,
    header: 64,
    rowH: 64,
    tile: 38,
    collapsedTile: 48,
    tileRadius: 12,
  },
};

type AdminLayoutProps = { children?: ReactNode };

const MENU = [
  { to: "/admin/adminPanel", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { to: "/admin/adminPanel/users", label: "Users", icon: Users },
  { to: "/admin/adminPanel/companies", label: "Companies", icon: Building2 },
  { to: "/admin/adminPanel/audit", label: "Audit Logs", icon: FileText },
]; 

export default function AdminPanelLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Toggle mittig im collapsed-Header
  const collapsedLeft = (TOKENS.sizes.sidebarClosed - TOKENS.sizes.collapsedTile) / 2; // 16px
  const collapsedTop  = (TOKENS.sizes.header        - TOKENS.sizes.collapsedTile) / 2; // 8px

  const mainStyle = {
    marginLeft: `${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen}px`,
    transition: "margin-left .2s ease",
  } as React.CSSProperties;

  const showChevron = useMemo(() => !collapsed, [collapsed]);

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-white">
      {/* ===== Sidebar ===== */}
      <aside
        className="fixed inset-y-0 left-0 z-[60] flex flex-col overflow-hidden border-r shadow-[8px_0_32px_-18px_rgba(0,0,0,.35)] transition-[width] duration-200"
        style={{
          width: collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen,
          background: `hsl(${TOKENS.sidebarHSL})`,
          color: `hsl(${TOKENS.sidebarFg})`,
          borderColor: `hsl(${TOKENS.sidebarBorder})`,
          borderTopRightRadius: collapsed ? TOKENS.sizes.tileRadius : 14,
          borderBottomRightRadius: 14,
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between border-b px-3"
          style={{
            height: TOKENS.sizes.header,
            background: `hsl(${TOKENS.sidebarHSL})`,
            borderColor: `hsl(${TOKENS.sidebarBorder})`,
            borderTopRightRadius: 14,
          }}
        >
          {/* Brand */}
          <div
            aria-hidden={collapsed}
            className={[
              "flex items-center gap-3 transition-[visibility,opacity] duration-150",
              collapsed ? "invisible opacity-0" : "visible opacity-100",
            ].join(" ")}
          >
            <div
              className="grid place-items-center rounded-xl border shadow-[0_10px_22px_-14px_rgba(0,0,0,.35)]"
              style={{
                width: "2.2rem",
                height: "2.2rem",
                color: "#fff",
                background: `linear-gradient(135deg, #56768f, #264555)`,
                borderColor: "rgba(255,255,255,.15)",
              }}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="m-0 text-[0.95rem] font-extrabold" style={{ color: `hsl(${TOKENS.sidebarFg})` }}>
                Admin Panel
              </h2>
              <p className="m-0 text-[0.82rem]" style={{ color: `hsl(${TOKENS.sidebarMuted})` }}>
                Assessment System
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? "Seitenleiste öffnen" : "Seitenleiste schließen"}
            className={
              collapsed
                ? "absolute z-20 grid place-items-center rounded-xl border bg-white/10 border-white/20 text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,.35)] focus:outline-none"
                : "grid place-items-center rounded-xl border shadow-[0_2px_6px_-2px_rgba(0,0,0,.35)] focus:outline-none"
            }
            style={
              collapsed
                ? { left: collapsedLeft, top: collapsedTop, width: TOKENS.sizes.collapsedTile, height: TOKENS.sizes.collapsedTile }
                : {
                    width: "2.2rem",
                    height: "2.2rem",
                    background: `hsl(${TOKENS.sidebarStrong})`,
                    borderColor: `hsl(${TOKENS.sidebarBorder})`,
                    color: `hsl(${TOKENS.sidebarMuted})`,
                  }
            }
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Inhalt (jetzt Column + Footer am Boden) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col">
          {/* PRIMARY / Übersicht */}
          <nav className={collapsed ? "flex flex-col items-center gap-4 mb-0" : "mt-10 flex flex-col gap-2 mb-10"} aria-label="Schnellzugriff">
            <SideItem
              to={MENU[0].to}
              exact
              label={MENU[0].label}
              Icon={MENU[0].icon}
              collapsed={collapsed}
              showChevron={showChevron}
            />
          </nav>

          {/* Titel (nur expanded) – Abstand bleibt, aber etwas luftiger nach „Übersicht“ */}
          {!collapsed && (
            <div className="mt-1 mb-2 select-none">
              <div
                className="text-[0.72rem] font-extrabold tracking-[.12em] uppercase"
                style={{ color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))` }}
              >
                Navigation
              </div>
            </div>
          )}

          {/* SECONDARY */}
          <nav className={collapsed ? "flex flex-col items-center gap-4" : "flex flex-col gap-2"} aria-label="Hauptnavigation">
            {MENU.slice(1).map((m) => (
              <SideItem key={m.to} to={m.to} label={m.label} Icon={m.icon} collapsed={collapsed} showChevron={showChevron} />
            ))}
          </nav>

          {/* Footer: fix unten */}
          {!collapsed && (
            <div
              className="mt-auto pt-4 border-t text-[0.8rem]"
              style={{ borderColor: `hsl(${TOKENS.sidebarBorder})`, color: `hsl(${TOKENS.sidebarMuted})` }}
            >
              <div>Admin</div>
              <div>Panel</div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Main + Top-Nav ===== */}
      <main className="flex-1 min-h-screen flex flex-col" style={mainStyle}>
        <div
          className="sticky top-0 z-[60] h-[64px] border-b bg-white/85 backdrop-blur-[6px] [backdrop-filter:saturate(140%)]"
          style={{ borderColor: `hsl(${TOKENS.sidebarBorder})` }}
        >
          <div className="mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6">
            {/* links */}
            <div className="justify-self-end">
              <ul className="m-0 flex list-none items-center gap-5">
                <li><TopNavLink to="/admin" end>Start</TopNavLink></li>
                <li><TopNavLink to="/admin/catalogs">Kataloge</TopNavLink></li>
              </ul>
            </div>
            {/* Avatar */}
            <div className="flex items-center justify-center px-2">
              <div className="h-10 w-10 rounded-full bg-[linear-gradient(180deg,#E2E8F0,#CBD5E1)] p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profil"
                  className="h-full w-full rounded-full"
                />
              </div>
            </div>
            {/* rechts */}
            <div className="flex items-center gap-5">
              <ul className="m-0 flex list-none items-center gap-5">
                <li><TopNavLink to="/admin/results">Ergebnisse</TopNavLink></li>
                <li><TopNavLink to="/admin/help">Hilfe</TopNavLink></li>
              </ul>
              <img
                src={capLogo}
                alt="CAP consulting"
                className="ml-auto h-[38px] w-auto opacity-95 transition-all hover:-translate-y-[1px] hover:opacity-100"
              />
            </div>
          </div>
        </div>

        {children}
      </main>

     
    </div>
  );
}

/* ===== Sidebar-Item (unverändert: Styles/Animationen) ===== */
function SideItem({
  to, label, Icon, exact, collapsed, showChevron,
}: {
  to: string; label: string; Icon: React.FC<any>; exact?: boolean; collapsed: boolean; showChevron: boolean;
}) {
  const baseCn = collapsed
    ? "relative w-[48px] h-[48px] p-0 rounded-[12px] border border-transparent flex items-center justify-center transition"
    : "relative w-full flex items-center gap-3 rounded-[18px] border border-transparent px-4 py-3 text-left transition";

  return (
    <NavLink
      to={to}
      end={!!exact}
      className={({ isActive }) =>
        [
          baseCn,
          !collapsed && !isActive ? "hover:[background:var(--tw-hover-bg)] hover:border-white/10" : "",
          !collapsed && isActive ? "border-white/20" : "",
        ].join(" ")
      }
      style={{
        // @ts-ignore
        ["--tw-hover-bg"]: TOKENS.hoverBg,
        ...(collapsed ? {} : { minHeight: TOKENS.sizes.rowH }),
      }}
    >
      {({ isActive }) => (
        <>
          <span
            className="grid place-items-center rounded-[12px] border shadow-[0_8px_18px_-12px_rgba(0,0,0,.45)]"
            style={{
              width: collapsed ? TOKENS.sizes.collapsedTile : TOKENS.sizes.tile,
              height: collapsed ? TOKENS.sizes.collapsedTile : TOKENS.sizes.tile,
              background: isActive ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.06)",
              borderColor: isActive ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.18)",
              color: isActive ? "#fff" : `hsl(${TOKENS.sidebarMuted})`,
            }}
          >
            <Icon className="w-[18px] h-[18px]" />
          </span>

          {!collapsed && (
            <>
              <span className="flex-1 font-extrabold text-[0.95rem]">{label}</span>
              {showChevron && isActive && <Caret className="w-4 h-4 opacity-85" />}
            </>
          )}

          {!collapsed && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-[22px] w-1 rounded-[6px]"
              style={{
                background: `linear-gradient(180deg, hsl(${TOKENS.primary}/.9), hsl(${TOKENS.primary}/.55))`,
                opacity: isActive ? 1 : 0,
                transition: "opacity .15s ease",
              }}
            />
          )}

          <span
            aria-hidden
            className="absolute inset-0 rounded-[18px] -z-10"
            style={{ background: isActive ? TOKENS.activeBg : "transparent" }}
          />
        </>
      )}
    </NavLink>
  );
}

function TopNavLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "relative rounded-[10px] px-3 py-1.5 font-extrabold text-[#0F263A] transition-colors hover:bg-[hsl(210_40%_96%)]",
          isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-[10px] after:h-[3px] after:rounded-[3px]" : "",
        ].join(" ")
      }
    >
      <span className="relative group/lnk">
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 right-3 -bottom-[10px] h-[3px] rounded-[3px] opacity-0 transition-opacity duration-150 group-hover/lnk:opacity-100 bg-[linear-gradient(90deg,hsl(215_84%_56%),hsl(215_84%_56%/.55))]"
        />
      </span>
    </NavLink>
  );
}
