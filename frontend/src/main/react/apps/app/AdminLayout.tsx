import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import capLogo from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import {
  Settings, BarChart3, FileText, ShoppingCart, Building2,
  ChevronRight, ChevronLeft
} from "lucide-react";

/* ===== Tokens (ex-CSS-Variablen) ===== */
const TOKENS = {
  sidebarHSL: "210 25% 27%",       // --admin-sidebar
  sidebarStrong: "210 25% 29%",    // --admin-sidebar-strong
  sidebarWeak: "210 25% 31%",      // --admin-sidebar-weak
  sidebarFg: "210 40% 96%",        // --admin-sidebar-foreground
  sidebarMuted: "210 16% 80%",     // --admin-sidebar-muted
  sidebarBorder: "210 14% 37%",    // --admin-sidebar-border
  primary: "215 84% 56%",          // --primary
  ring: "215 90% 62%",             // --ring
  activeBg: "hsla(0,0%,0%,.22)",
  hoverBg: "hsla(0,0%,100%,.06)",
  theme: {
    enterprise: "#56768f",
    sourcing: "#264555",
    operating: "#808080",
    project: "#d2c9b9",
  },
  sizes: {
    sidebarOpen: 320,   // 20rem
    sidebarClosed: 80,  // 5rem
    header: 64,
    rowH: 64,
    tile: 38,
    tileRadius: 12,
    collapsedTile: 48,  // Kachelgröße im collapsed-State
  },
};

type AdminLayoutProps = { children?: ReactNode };

function cx(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

type NavId =
  | "overview"
  | "catalog"
  | "enterprise"
  | "operating"
  | "sourcing"
  | "project";

const NAV_PRIMARY: Array<{ id: NavId; label: string; Icon: React.FC<any>; to: string }> = [
  { id: "overview", label: "Übersicht", Icon: BarChart3, to: "/admin" },
  { id: "catalog",  label: "Katalog zuweisen", Icon: FileText, to: "/admin/katalogzuweisen" },
];

const NAV_THEMES: Array<{ id: NavId; label: string; sub: string; Icon: React.FC<any> }> = [
  { id: "operating",  label: "IT Operating Model", sub: "Organisationsstrukturen und Prozesse", Icon: Building2 },
  { id: "enterprise", label: "Enterprise Architecture Management", sub: "Strategische IT-Planung und -Ausrichtung", Icon: BarChart3 },
  { id: "sourcing",   label: "IT Sourcing", sub: "Beschaffung & Lieferantenmanagement", Icon: ShoppingCart },
  { id: "project",    label: "IT Project Management", sub: "Projektplanung und -durchführung", Icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<NavId>("overview");

  useEffect(() => {
    const sc = localStorage.getItem("sidebarCollapsed");
    if (sc != null) setCollapsed(sc === "true");
    const sa = localStorage.getItem("activeNav");
    const ok = ["overview","catalog","enterprise","operating","sourcing","project"];
    if (sa && ok.includes(sa)) setActive(sa as NavId);
  }, []);
  useEffect(() => { localStorage.setItem("sidebarCollapsed", String(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem("activeNav", active); }, [active]);

  const showChevron = useMemo(() => !collapsed, [collapsed]);

  const mainStyle = {
    marginLeft: `${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen}px`,
    width: `calc(100% - ${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen}px)`,
  } as React.CSSProperties;

  // ▼▼ NEU: genaue Position/Ausrichtung des Toggle-Buttons im collapsed State
  const collapsedSize = TOKENS.sizes.collapsedTile; // 48
  const collapsedLeft = (TOKENS.sizes.sidebarClosed - collapsedSize) / 2; // 80 - 48 = 32 / 2 = 16
  const collapsedTop  = (TOKENS.sizes.header        - collapsedSize) / 2; // 64 - 48 = 16 / 2 = 8
  // ▲▲ NEU

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Sidebar ===== */}
      <aside
        aria-label="Admin Sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-[60] flex flex-col overflow-hidden border-r shadow-[8px_0_32px_-18px_rgba(0,0,0,.35)] transition-[width] duration-300",
        )}
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
            className={cx(
              "flex items-center gap-3 transition-[visibility,opacity] duration-150",
              collapsed ? "invisible opacity-0" : "visible opacity-100"
            )}
          >
            <div
              className="grid place-items-center rounded-xl border shadow-[0_10px_22px_-14px_rgba(0,0,0,.35)]"
              style={{
                width: "2.2rem",
                height: "2.2rem",
                color: "#fff",
                background: `linear-gradient(135deg, hsl(${TOKENS.primary}), hsl(215 100% 70%))`,
                borderColor: "rgba(255,255,255,.15)",
              }}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="m-0 text-[0.95rem] font-bold" style={{ color: `hsl(${TOKENS.sidebarFg})` }}>
                Fragenkatalog
              </h2>
              <p className="m-0 text-[0.78rem]" style={{ color: `hsl(${TOKENS.sidebarMuted})` }}>
                Administrator
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            aria-label={collapsed ? "Sidebar erweitern" : "Sidebar einklappen"}
            onClick={() => setCollapsed(v => !v)}
            className={
              collapsed
                ? "absolute z-20 grid place-items-center rounded-xl border bg-white/10 border-white/20 text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,.35)] focus:outline-none"
                : "grid place-items-center rounded-xl border shadow-[0_2px_6px_-2px_rgba(0,0,0,.35)] focus:outline-none"
            }
            style={
              collapsed
                ? {
                    left:  collapsedLeft,   // 16px – mittig im 80px Streifen
                    top:   collapsedTop,    // 8px  – mittig im 64px Header
                    width: collapsedSize,   // 48px
                    height: collapsedSize,  // 48px
                  }
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:none] [-ms-overflow-style:none]">
          {/* Navigation */}
          <div className={cx(collapsed && "invisible")} aria-hidden={collapsed}>
            <h3
              className="mt-3 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
              style={{ color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))` }}
            >
              Navigation
            </h3>
          </div>

          {/* ===== Primary nav ===== */}
          <nav className={cx("flex flex-col", collapsed ? "items-center gap-4" : "gap-2")}>
            {NAV_PRIMARY.map(({ id, label, Icon, to }) => {
              const isActive = active === id;

              const baseCn = collapsed
                ? "relative w-[48px] h-[48px] p-0 rounded-[12px] border border-transparent flex items-center justify-center transition"
                : "relative w-full flex items-center gap-3 rounded-[18px] border border-transparent px-4 py-3 text-left transition";

              return (
                <NavLink
                  key={id}
                  to={to}
                  onClick={() => setActive(id)}
                  title={label}
                  aria-label={label}
                  className={cx(
                    baseCn,
                    !collapsed && !isActive && "hover:[background:var(--tw-hover-bg)] hover:border-white/10",
                    !collapsed && isActive && "border-white/20"
                  )}
                  style={{
                    background: !collapsed && isActive ? TOKENS.activeBg : "transparent",
                    // @ts-ignore
                    ["--tw-hover-bg" as any]: TOKENS.hoverBg,
                    ...(collapsed ? {} : { minHeight: TOKENS.sizes.rowH }),
                  }}
                >
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
                      <span className="flex-1 font-bold text-[0.95rem]">{label}</span>
                      {showChevron && isActive && <ChevronRight className="w-4 h-4 opacity-85" />}
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
                </NavLink>
              );
            })}
          </nav>

          {/* Themes Title */}
          <div className={cx(!collapsed && "mt-4", collapsed && "invisible")} aria-hidden={collapsed}>
            <h3
              className="mt-3 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
              style={{ color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))` }}
            >
              Themenschwerpunkte
            </h3>
          </div>

          {/* ===== Themes ===== */}
          <nav className={cx("flex flex-col", collapsed ? "items-center gap-4" : "gap-2")}>
            {NAV_THEMES.map(({ id, label, sub, Icon }) => {
              const isActive = active === id;
              const bg =
                id === "enterprise" ? TOKENS.theme.enterprise :
                id === "sourcing"   ? TOKENS.theme.sourcing   :
                id === "operating"  ? TOKENS.theme.operating  :
                TOKENS.theme.project;

              const baseCn = collapsed
                ? "relative w-[48px] h-[48px] p-0 rounded-[12px] border border-transparent flex items-center justify-center transition"
                : "relative w-full flex items-center gap-3 rounded-[18px] border border-transparent px-4 py-3 text-left transition";

              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  type="button"
                  title={label}
                  aria-label={label}
                  className={cx(
                    baseCn,
                    !collapsed && !isActive && "hover:[background:var(--tw-hover-bg)] hover:border-white/10",
                    !collapsed && isActive && "border-white/20"
                  )}
                  style={{
                    background: !collapsed && isActive ? TOKENS.activeBg : "transparent",
                    // @ts-ignore
                    ["--tw-hover-bg" as any]: TOKENS.hoverBg,
                    ...(collapsed ? {} : { minHeight: TOKENS.sizes.rowH }),
                  }}
                >
                  <div
                    className="grid place-items-center rounded-[12px] border shadow-[0_8px_18px_-12px_rgba(0,0,0,.45)]"
                    style={{
                      width: collapsed ? TOKENS.sizes.collapsedTile : TOKENS.sizes.tile,
                      height: collapsed ? TOKENS.sizes.collapsedTile : TOKENS.sizes.tile,
                      background: bg,
                      color: "#fff",
                      borderColor: id === "project" ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.18)",
                    }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>

                  {!collapsed && (
                    <>
                      <div className="flex-1">
                        <div className="font-bold text-[0.95rem]">{label}</div>
                        <div className="text-[0.8rem]" style={{ color: `hsl(${TOKENS.sidebarMuted})` }}>
                          {sub}
                        </div>
                      </div>
                      {showChevron && isActive && <ChevronRight className="w-4 h-4 opacity-85" />}
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
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div
              className="mt-[34rem] pt-4 border-t text-[0.8rem]"
              style={{ borderColor: `hsl(${TOKENS.sidebarBorder})`, color: `hsl(${TOKENS.sidebarMuted})` }}
            >
              <div>Fragenkatalog</div>
              <div>Admin</div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Main + TopNav ===== */}
      <main className="min-h-screen transition-[margin-left,width] duration-300" style={mainStyle}>
        <div
          className="sticky top-0 z-[60] h-[64px] border-b bg-white/85 backdrop-blur-[6px] [backdrop-filter:saturate(140%)]"
          style={{ borderColor: `hsl(${TOKENS.sidebarBorder})` }}
        >
          <div className="mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6">
            {/* left */}
            <div className="justify-self-end">
              <ul className="m-0 flex list-none items-center gap-5">
                <li>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      cx(
                        "relative rounded-[10px] px-3 py-1.5 font-bold text-[#0F263A] transition-colors hover:bg-[hsl(210_40%_96%)]",
                        isActive && "after:absolute after:left-3 after:right-3 after:-bottom-[10px] after:h-[3px] after:rounded-[3px]"
                      )
                    }
                  >
                    Start
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/catalogs"
                    className="relative rounded-[10px] px-3 py-1.5 font-bold text-[#0F263A] transition-colors hover:bg-[hsl(210_40%_96%)]"
                  >
                    Kataloge
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* center avatar */}
            <div className="flex items-center justify-center px-2">
              <div className="h-10 w-10 rounded-full bg-[linear-gradient(180deg,#E2E8F0,#CBD5E1)] p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profil"
                  className="h-full w-full rounded-full"
                />
              </div>
            </div>

            {/* right */}
            <div className="flex items-center gap-5">
              <ul className="m-0 flex list-none items-center gap-5">
                <li>
                  <NavLink
                    to="/admin/results"
                    className={({ isActive }) =>
                      cx(
                        "relative rounded-[10px] px-3 py-1.5 font-bold text-[#0F263A] transition-colors hover:bg-[hsl(210_40%_96%)]",
                        isActive && "after:absolute after:left-3 after:right-3 after:-bottom-[10px] after:h-[3px] after:rounded-[3px]"
                      )
                    }
                  >
                    Ergebnisse
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/help"
                    className="relative rounded-[10px] px-3 py-1.5 font-bold text-[#0F263A] transition-colors hover:bg-[hsl(210_40%_96%)]"
                  >
                    Hilfe
                  </NavLink>
                </li>
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
