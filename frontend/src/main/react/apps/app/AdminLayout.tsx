import React, { useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { logoutApi } from "@/features/auth/logoutService";
//import capLogo from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";

import {
  Settings, BarChart3, FileText, ShoppingCart, Building2,
  ChevronRight, ChevronLeft, LayoutDashboard
} from "lucide-react";
import BadgeWithAvatarMenu from "@/apps/app/BadgeWithAvatarMenu";


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
  activeBg: "hsla(0, 0%, 0%, 0.22)",
  hoverBg: "hsla(0, 0%, 100%, 0.06)",
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
  | "Admin-Area"
  | "catalog"
  | "Admin-Panel"
  | "users"
  | "companies"
  | "Alle Zuweisungen"
  | "Audit-log";

const NAV_PRIMARY: Array<{ id: NavId; label: string; Icon: React.FC<any>; to: string }> = [
  { id: "Admin-Area", label: "Admin-Area", Icon: LayoutDashboard, to: "/admin" },
  { id: "catalog", label: "Katalog zuweisen", Icon: FileText, to: "/admin/katalogzuweisen" },
];
const NAV_Panel: Array<{ id: NavId; label: string; Icon: React.FC<any>; to: string }> = [
  { id: "Admin-Panel", label: "Admin-Panel", Icon: BarChart3, to: "/admin/adminPanel" },
  { id: "users", label: "Users", Icon: ShoppingCart, to: "/admin/adminPanel/users" },
  { id: "companies", label: "Firmen", Icon: Building2, to: "/admin/adminPanel/companies" },
  { id: "Alle Zuweisungen", label: "Alle Zuweisungen", Icon: FileText, to: "/admin/adminPanel/zuweisungen" },
  { id: "Audit-log", label: "Audit-log", Icon: BarChart3, to: "/admin/adminPanel/audit" },
];


export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const mainStyle = {
    marginLeft: `${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen}px`,
    width: `calc(100% - ${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen}px)`,
  } as React.CSSProperties;

  //genaue Position/Ausrichtung des Toggle-Buttons im collapsed State
  const collapsedSize = TOKENS.sizes.collapsedTile; // 48
  const collapsedLeft = (TOKENS.sizes.sidebarClosed - collapsedSize) / 2; // 80 - 48 = 32 / 2 = 16
  const collapsedTop = (TOKENS.sizes.header - collapsedSize) / 2; // 64 - 48 = 16 / 2 = 8

  const { isAuthenticated, token, logout } = useAuthCtx();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // zeigt kompaktes Icon, wenn genug gescrollt
  const [badgeMini, setBadgeMini] = useState(false);

  // optional: Mini-Icon-Tooltip
  const [hoverMini, setHoverMini] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      // Schwelle nach Bedarf anpassen (z.B. 160)
      setBadgeMini(y > 160);
    };
    onScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);


  // Logout
  const handleLogout = async () => {
    localStorage.removeItem("activeAssignmentMeta"); // aufräumen
    const t =
      token ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token");
    if (t) {
      try {
        await logoutApi(t);
      } catch {
        // Backend-Logout kann scheitern -> lokal trotzdem abmelden
      }
    }
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

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
          //borderColor: `hsl(${TOKENS.sidebarBorder})`,
          border: "4px solid #a5a5a57f",
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
                  left: collapsedLeft,   // 16px – mittig im 80px Streifen
                  top: collapsedTop,    // 8px  – mittig im 64px Header
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
              const baseCn = collapsed
                ? "relative w-[48px] h-[48px] p-0 rounded-[12px] border border-transparent flex items-center justify-center transition"
                : "relative w-full flex items-center gap-3 rounded-[18px] border border-transparent px-4 py-3 text-left transition";

              return (
                <NavLink
                  key={id}
                  to={to}
                  end={to === "/admin" || to === "/admin/adminPanel"} //exakt nur für Übersicht
                  className={({ isActive }) =>
                    cx(
                      baseCn,
                      !collapsed && !isActive && "hover:[redbackground:var(--tw-hover-bg)] hover:border-white/10",
                      !collapsed && isActive && "border-white/20"
                    )
                  }
                  style={({ isActive }) => ({
                    background: !collapsed && isActive ? TOKENS.activeBg : "transparent",
                    // @ts-ignore: CSS var für Hover
                    ["--tw-hover-bg" as any]: TOKENS.hoverBg,
                    ...(collapsed ? {} : { minHeight: TOKENS.sizes.rowH }),
                  })}
                  title={label}
                  aria-label={label}
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
                          <span className="flex-1 font-bold text-[0.95rem]">{label}</span>
                          {/* kleiner Akzentbalken links; Sichtbarkeit über isActive */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-[22px] w-1 rounded-[6px]"
                            style={{
                              //background: "#d0d0d0",
                              opacity: isActive ? 1 : 0,
                              transition: "opacity .15s ease",
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
            {/* Admin-Panel */}
            <div className={cx(collapsed && "invisible")} aria-hidden={collapsed}>
              <h3
                className="mt-3 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
                style={{ color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))` }}
              >
                Admin-Panel
              </h3>
            </div>
            {NAV_Panel.map(({ id, label, Icon, to }) => {
              const baseCn = collapsed
                ? "relative w-[48px] h-[48px] p-0 rounded-[12px] border border-transparent flex items-center justify-center transition"
                : "relative w-full flex items-center gap-3 rounded-[18px] border border-transparent px-4 py-3 text-left transition";

              return (
                <NavLink
                  key={id}
                  to={to}
                  end={to === "/admin" || to === "/admin/adminPanel"} //exakt nur für Übersicht
                  className={({ isActive }) =>
                    cx(
                      baseCn,
                      !collapsed && !isActive && "hover:[background:var(--tw-hover-bg)] hover:border-white/10",
                      !collapsed && isActive && "border-white/20"
                    )
                  }
                  style={({ isActive }) => ({
                    background: !collapsed && isActive ? TOKENS.activeBg : "transparent",
                    // @ts-ignore: CSS var für Hover
                    ["--tw-hover-bg" as any]: TOKENS.hoverBg,
                    ...(collapsed ? {} : { minHeight: TOKENS.sizes.rowH }),
                  })}
                  title={label}
                  aria-label={label}
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
                          <span className="flex-1 font-bold text-[0.95rem]">{label}</span>
                          {/* kleiner Akzentbalken links; Sichtbarkeit über isActive */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-[22px] w-1 rounded-[6px]"
                            style={{
                              //background: `linear-gradient(180deg, hsl(${TOKENS.primary}/.9), hsl(${TOKENS.primary}/.55))`,
                              opacity: isActive ? 1 : 0,
                              transition: "opacity .15s ease",
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
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
      <main className="relative min-h-screen transition-[margin-left,width] duration-300 " style={mainStyle}>

        <div className="fixed right-0 top-0 z-[70] pointer-events-auto">

          {/* === Badge groß (oben fixiert), nur sichtbar wenn NICHT mini === */}
          {!badgeMini && (
            <div className="fixed right-0 top-0 z-[70] pointer-events-none">
              <div ref={menuRef} className="relative -mr-[2px] pointer-events-auto">
                {/* Klick-Zone: öffnet/schließt Menü */}
                <div className="cursor-pointer" onClick={() => setMenuOpen(v => !v)}>
                  <BadgeWithAvatarMenu
                    width={150}
                    height={90}
                    rightNotch={40}
                    bottomRightLen={130}
                    bevelHeight={100}
                    avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  />
                </div>

                {/* Dropdown direkt UNTER dem Badge ankoppeln */}
                {menuOpen && (
                  <div
                    className="absolute right-0 -mt-1 w-30 bg-[#ebebec] border border-[#a5a5a57f] rounded-lg shadow-lg z-[80]"
                    role="menu"
                  >
                    <button
                      className="block w-full text-left px-4 py-3 hover:bg-black/5"
                      onClick={() => {
                        setMenuOpen(false);
                        // navigate("/profile");
                        alert("Profil ansehen - Funktion noch nicht implementiert.");
                      }}
                    >
                      Profil ansehen
                    </button>
                    {isAuthenticated && (
                      <button
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          await handleLogout();
                          setMenuOpen(false);
                        }}
                      >
                        Abmelden
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === Mini-Icon bei Scroll (optional). Erscheint NUR wenn badgeMini === */}
          {badgeMini && (
            <button
              type="button"
              aria-label="Profilmenü öffnen"
              className="fixed right-0 top-4 z-[80] mr-[6px] h-12 w-12 rounded-full bg-white shadow-lg 
               border border-black/10 flex items-center justify-center group"
              onMouseEnter={() => setHoverMini(true)}
              onMouseLeave={() => setHoverMini(false)}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => setBadgeMini(false), 250);
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                alt="Profil"
                className="h-10 w-10 rounded-full"
              />

              {/* Tooltip */}
              <span
                className={`absolute right-[52px] top-1/2 -translate-y-1/2 
                  whitespace-nowrap rounded-lg bg-black text-white text-xs px-3 py-1 shadow
                  transition-opacity duration-150 ${hoverMini ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                Profil & Menü
                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 
                       border-8 border-transparent border-l-black"></span>
              </span>
            </button>
          )}


        </div>
        {/* Abstand zwischen Header/Grau und Content */}
        {children}

      </main>
    </div>
  );
}
