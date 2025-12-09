import React, { useEffect, useState, useRef, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { AuthService } from "@/core/auth/AuthService";
import { logoutApi } from "@/features/auth/logoutService";
import ProfileStrip from "@/apps/app/ProfileStrip";

import {
  Settings,
  FileText,
  ShoppingCart,
  Building2,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Shield,
} from "lucide-react";

/* ===== Tokens (ex-CSS-Variablen) ===== */
const TOKENS = {
  sidebarHSL: "210 25% 27%", // --admin-sidebar
  sidebarStrong: "210 25% 29%", // --admin-sidebar-strong
  sidebarWeak: "210 25% 31%", // --admin-sidebar-weak
  sidebarFg: "210 40% 96%", // --admin-sidebar-foreground
  sidebarMuted: "210 16% 80%", // --admin-sidebar-muted
  sidebarBorder: "210 14% 37%", // --admin-sidebar-border
  primary: "215 84% 56%", // --primary
  ring: "215 90% 62%", // --ring
  activeBg: "hsla(0, 0%, 0%, 0.22)",
  hoverBg: "hsla(0, 0%, 100%, 0.06)",
  theme: {
    enterprise: "#56768f",
    sourcing: "#264555",
    operating: "#808080",
    project: "#d2c9b9",
  },
  sizes: {
    sidebarOpen: 320, // 20rem
    sidebarClosed: 80, // 5rem
    header: 64,
    rowH: 64,
    tile: 38,
    tileRadius: 12,
    collapsedTile: 48, // Kachelgröße im collapsed-State
  },
};

type AdminLayoutProps = { children?: ReactNode };

function cx(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

type NavId =
  | "dashboard"
  | "Themen Verwalten"
  | "catalog"
  | "Admin-Panel"
  | "Ergebnis Analysieren"
  | "users"
  | "companies"
  | "roles"
  | "Zuweisungen"
  | "sessions"
  | "Audit-log";

const NAV_PRIMARY: Array<{
  id: NavId;
  label: string;
  Icon: React.FC<any>;
  to: string;
}> = [
    {
      id: "dashboard",
      label: "Dashboard",
      Icon: LayoutDashboard,
      to: "/admin/dashboard",
    },
    {
      id: "Themen Verwalten",
      label: "Themen Verwalten",
      Icon: Settings,
      to: "/admin",
    },
    {
      id: "catalog",
      label: "Katalogen",
      Icon: FileText,
      to: "/admin/katalogzuweisen",
    },
  ];

const NAV_Panel: Array<{
  id: NavId;
  label: string;
  Icon: React.FC<any>;
  to: string;
}> = [
    { id: "users", label: "Users", Icon: ShoppingCart, to: "/admin/adminPanel/users" },
    {
      id: "companies",
      label: "Firmen",
      Icon: Building2,
      to: "/admin/adminPanel/companies",
    },
    { id: "roles", label: "Rollen", Icon: Shield, to: "/admin/adminPanel/roles" },
    {
      id: "Zuweisungen",
      label: "Zuweisungen",
      Icon: FileText,
      to: "/admin/adminPanel/zuweisungen",
    },
  ];

const NAV_Analyse: Array<{
  id: NavId;
  label: string;
  Icon: React.FC<any>;
  to: string;
}> = [
    {
      id: "Ergebnis Analysieren",
      label: "Ergebnisse Analysieren",
      Icon: ShoppingCart,
      to: "/app/companylist",
    },
  ];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const mainStyle = {
    marginLeft: `${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen
      }px`,
    width: `calc(100% - ${collapsed ? TOKENS.sizes.sidebarClosed : TOKENS.sizes.sidebarOpen
      }px)`,
  } as React.CSSProperties;

  // genaue Position/Ausrichtung des Toggle-Buttons im collapsed State
  // Toggle im collapsed-State etwas kleiner als die 48px-Kacheln,
  // damit er optisch gleich groß wirkt wie die Icons
  const collapsedToggleSize = TOKENS.sizes.tile + 4; // 38 + 4 = 42

  const collapsedLeft = (TOKENS.sizes.sidebarClosed - collapsedToggleSize) / 2;
  const collapsedTop = (TOKENS.sizes.header - collapsedToggleSize) / 2;


  const { isAuthenticated, logout } = useAuthCtx();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState<{
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    roles?: string[];
  } | null>(null);

  function readSessionUser(): any | null {
    try {
      const raw = window.sessionStorage.getItem("auth_session");
      console.log("[AdminLayout] auth_session raw =", raw);
      if (!raw) return null;

      let parsed: any = JSON.parse(raw);

      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      console.log("[AdminLayout] auth_session parsed =", parsed);

      const user = parsed?.user ?? parsed;
      if (!user || typeof user !== "object") return null;

      return user;
    } catch (err) {
      console.error("[AdminLayout] Konnte auth_session nicht parsen:", err);
      return null;
    }
  }

  // ⬇⬇ DAS FEHLTE
  useEffect(() => {
    const u = readSessionUser();
    setSessionUser(u);
  }, []);
  // ⬆⬆

  const displayName =
    sessionUser?.username ||
    sessionUser?.name ||
    "admin";

  const displayEmail = sessionUser?.email || "admin@example.com";




  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
    const t = AuthService.getAccessToken ? AuthService.getAccessToken() : null;
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
    <div
      className={cx(
        "min-h-screen transition-colors",
        isDarkMode
          ? "bg-slate-900 text-slate-100"
          : "bg-slate-50 text-slate-900"
      )}
    >
      {/* ===== Sidebar ===== */}
      <aside
        aria-label="Admin Sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-[60] flex flex-col overflow-hidden border-r shadow-[10px_0_40px_-18px_rgba(0,0,0,.55)] transition-[width,background-color,color] duration-300"
        )}
        style={{
          width: collapsed
            ? TOKENS.sizes.sidebarClosed
            : TOKENS.sizes.sidebarOpen,
          background: isDarkMode
            ? "radial-gradient(circle at top left, rgba(148,163,184,0.18), transparent 55%), linear-gradient(180deg, hsl(215 19% 14%), hsl(215 25% 10%))"
            : "radial-gradient(circle at top left, rgba(227,187,98,0.20), transparent 55%), linear-gradient(180deg, hsl(210 28% 24%), hsl(210 26% 18%))",
          color: isDarkMode ? "#e5e7eb" : `hsl(${TOKENS.sidebarFg})`,
        }}
      >
        {/* =====  Dekoration im Hintergrund (Glow + feine Linien + Sterne)  ===== */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        >
          {/* sanfte Scanlines */}
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* kleiner Gold-Glow oben links */}
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#E3BB62]/55 blur-3xl" />
          {/* blauer Glow unten */}
          <div className="absolute -right-16 bottom-[-40px] h-40 w-40 rounded-full bg-sky-500/40 blur-3xl" />
          {/* Sternchen */}
          <div className="absolute inset-0">
            <span className="absolute left-6 top-16 h-[3px] w-[3px] rounded-full bg-white/65" />
            <span className="absolute left-16 top-32 h-[2px] w-[2px] rounded-full bg-white/55" />
            <span className="absolute right-10 top-24 h-[3px] w-[3px] rounded-full bg-white/70" />
          </div>
        </div>

        {/* ===== Inhalt: alles relativ mit höherem z-Index ===== */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div
            className="relative flex items-center justify-between border-b px-3"
            style={{
              height: TOKENS.sizes.header,
              borderColor: `hsl(${TOKENS.sidebarBorder})`,
              borderTopRightRadius: 14,
              background:
                "linear-gradient(90deg, rgba(15,23,42,0.10), rgba(15,23,42,0))",
            }}
          >
            {/* Brand / Admin Area */}
            <div
              aria-hidden={collapsed}
              className={cx(
                "transition-[visibility,opacity,transform] duration-200",
                collapsed
                  ? "invisible opacity-0 -translate-x-2"
                  : "visible opacity-100 translate-x-0"
              )}
            >
              <div
                className="inline-flex items-center gap-3 rounded-6xl border px-3 py-3 bg-white/8 border-white/25 backdrop-blur-[8px] shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
              >
                {/* Icon-Kreis (etwas kleiner, cleaner) */}
                <div className="relative">
                  <div className="absolute inset-[-5px] rounded-full border border-white/25 opacity-80" />
                  <span className="absolute -top-0.5 right-0.5 h-[4px] w-[4px] rounded-full bg-[#E3BB62]" />
                  <span className="absolute bottom-0 left-0 h-[3px] w-[3px] rounded-full bg-sky-300" />
                  <div className="relative grid h-7 w-7 place-items-center rounded-full bg-white/15 border border-white/50 text-white shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
                    <Settings className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/80">
                    SYSTEM · MANAGEMENT
                  </span>
                  <span className="text-[11px] text-white/90">
                    Management & Administration
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle */}
            <button
              type="button"
              aria-label={collapsed ? "Sidebar erweitern" : "Sidebar einklappen"}
              onClick={() => setCollapsed((v) => !v)}
              className={
                collapsed
                  ? "absolute z-20 grid place-items-center rounded-xl border bg-white/12 border-white/35 text-white shadow-[0_4px_12px_rgba(0,0,0,0.65)] focus:outline-none backdrop-blur-sm"
                  : "grid place-items-center rounded-xl border shadow-[0_4px_12px_rgba(0,0,0,0.55)] focus:outline-none bg-white/14 border-white/30 text-white"
              }
              style={
                collapsed
                  ? {
                    left: collapsedLeft,
                    top: collapsedTop,
                    width: collapsedToggleSize,
                    height: collapsedToggleSize,
                  }
                  : {
                    width: "2.5rem",   // vorher ~2.2rem → größer
                    height: "2.5rem",
                  }
              }
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:none] [-ms-overflow-style:none] flex flex-col min-h-0">
            {/* Navigation Titel */}
            <div className={cx(collapsed && "invisible")} aria-hidden={collapsed}>
              <h3
                className="mt-3 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
                style={{
                  color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))`,
                }}
              >
                Navigation
              </h3>
            </div>

            {/* ===== Primary nav ===== */}
            <nav
              className={cx(
                "flex flex-col",
                collapsed ? "items-center gap-4" : "gap-2"
              )}
            >
              {NAV_PRIMARY.map(({ id, label, Icon, to }) => {
                const baseCn = collapsed
                  ? "relative w-[48px] h-[48px] p-0 rounded-[14px] border border-transparent flex items-center justify-center transition"
                  : "relative w-full flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-left transition";

                return (
                  <NavLink
                    key={id}
                    to={to}
                    end={to === "/admin" || to === "/admin/adminPanel"}
                    className={({ isActive }) =>
                      cx(
                        baseCn,
                        !collapsed &&
                        "hover:bg:white/5 hover:border-white/15 hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)]",
                        !collapsed && isActive && "border-white/25",
                        collapsed &&
                        "hover:bg-white/10 hover:border-white/25 hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                      )
                    }
                    style={({ isActive }) => ({
                      background: !collapsed
                        ? isActive
                          ? "linear-gradient(90deg, rgba(15,23,42,0.65), rgba(15,23,42,0.35))"
                          : "rgba(15,23,42,0.25)"
                        : isActive
                          ? "rgba(15,23,42,0.65)"
                          : "transparent",
                    })}
                    title={label}
                    aria-label={label}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="grid place-items-center rounded-[12px] border shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
                          style={{
                            width: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            height: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            background: isActive
                              ? "radial-gradient(circle at 30% 20%, rgba(227,187,98,0.45), rgba(15,23,42,0.92))"
                              : "rgba(15,23,42,0.75)",
                            borderColor: isActive
                              ? "rgba(227,187,98,0.7)"
                              : "rgba(148,163,184,0.6)",
                            color: isActive ? "#fff" : `hsl(${TOKENS.sidebarMuted})`,
                          }}
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </span>

                        {!collapsed && (
                          <>
                            <span className="flex-1 font-semibold text-[0.95rem] text-white">
                              {label}
                            </span>
                            {/* kleiner leuchtender Balken links bei Active */}
                            <span
                              aria-hidden
                              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-[22px] w-[3px] rounded-full bg-[#E3BB62]"
                              style={{
                                opacity: isActive ? 1 : 0,
                                boxShadow: isActive
                                  ? "0 0 12px rgba(227,187,98,0.9)"
                                  : "none",
                                transition: "opacity .18s ease",
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
                  className="mt-4 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
                  style={{
                    color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))`,
                  }}
                >
                  Admin-Panel
                </h3>
              </div>

              {NAV_Panel.map(({ id, label, Icon, to }) => {
                const baseCn = collapsed
                  ? "relative w-[48px] h-[48px] p-0 rounded-[14px] border border-transparent flex items-center justify-center transition"
                  : "relative w-full flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-left transition";

                return (
                  <NavLink
                    key={id}
                    to={to}
                    end={to === "/admin" || to === "/admin/adminPanel"}
                    className={({ isActive }) =>
                      cx(
                        baseCn,
                        !collapsed &&
                        "hover:bg:white/5 hover:border-white/15 hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)]",
                        !collapsed && isActive && "border-white/25",
                        collapsed &&
                        "hover:bg-white/10 hover:border-white/25 hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                      )
                    }
                    style={({ isActive }) => ({
                      background: !collapsed
                        ? isActive
                          ? "linear-gradient(90deg, rgba(15,23,42,0.68), rgba(15,23,42,0.4))"
                          : "rgba(15,23,42,0.24)"
                        : isActive
                          ? "rgba(15,23,42,0.7)"
                          : "transparent",
                    })}
                    title={label}
                    aria-label={label}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="grid place-items-center rounded-[12px] border shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
                          style={{
                            width: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            height: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            background: isActive
                              ? "radial-gradient(circle at 30% 20%, rgba(227,187,98,0.45), rgba(15,23,42,0.92))"
                              : "rgba(15,23,42,0.75)",
                            borderColor: isActive
                              ? "rgba(227,187,98,0.7)"
                              : "rgba(148,163,184,0.6)",
                            color: isActive ? "#fff" : `hsl(${TOKENS.sidebarMuted})`,
                          }}
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </span>

                        {!collapsed && (
                          <>
                            <span className="flex-1 font-semibold text-[0.95rem] text-white">
                              {label}
                            </span>
                            <span
                              aria-hidden
                              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-[22px] w-[3px] rounded-full bg-[#E3BB62]"
                              style={{
                                opacity: isActive ? 1 : 0,
                                boxShadow: isActive
                                  ? "0 0 12px rgba(227,187,98,0.9)"
                                  : "none",
                                transition: "opacity .18s ease",
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* Analyse */}
              <div className={cx(collapsed && "invisible")} aria-hidden={collapsed}>
                <h3
                  className="mt-4 mb-2 text-[0.72rem] font-bold tracking-[.12em] uppercase"
                  style={{
                    color: `color-mix(in hsl, hsl(${TOKENS.primary}) 55%, hsl(${TOKENS.sidebarMuted}))`,
                  }}
                >
                  Analyse
                </h3>
              </div>

              {NAV_Analyse.map(({ id, label, Icon, to }) => {
                const baseCn = collapsed
                  ? "relative w-[48px] h-[48px] p-0 rounded-[14px] border border-transparent flex items-center justify-center transition"
                  : "relative w-full flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-left transition";

                return (
                  <NavLink
                    key={id}
                    to={to}
                    end={to === "/admin" || to === "/admin/adminPanel"}
                    className={({ isActive }) =>
                      cx(
                        baseCn,
                        !collapsed &&
                        "hover:bg:white/5 hover:border-white/15 hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)]",
                        !collapsed && isActive && "border-white/25",
                        collapsed &&
                        "hover:bg-white/10 hover:border-white/25 hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                      )
                    }
                    style={({ isActive }) => ({
                      background: !collapsed
                        ? isActive
                          ? "linear-gradient(90deg, rgba(15,23,42,0.7), rgba(15,23,42,0.45))"
                          : "rgba(15,23,42,0.25)"
                        : isActive
                          ? "rgba(15,23,42,0.7)"
                          : "transparent",
                    })}
                    title={label}
                    aria-label={label}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="grid place-items-center rounded-[12px] border shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
                          style={{
                            width: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            height: collapsed
                              ? TOKENS.sizes.collapsedTile
                              : TOKENS.sizes.tile,
                            background: isActive
                              ? "radial-gradient(circle at 30% 20%, rgba(227,187,98,0.45), rgba(15,23,42,0.92))"
                              : "rgba(15,23,42,0.75)",
                            borderColor: isActive
                              ? "rgba(227,187,98,0.7)"
                              : "rgba(148,163,184,0.6)",
                            color: isActive ? "#fff" : `hsl(${TOKENS.sidebarMuted})`,
                          }}
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </span>

                        {!collapsed && (
                          <>
                            <span className="flex-1 font-semibold text-[0.95rem] text-white">
                              {label}
                            </span>
                            <span
                              aria-hidden
                              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-[22px] w-[3px] rounded-full bg-[#E3BB62]"
                              style={{
                                opacity: isActive ? 1 : 0,
                                boxShadow: isActive
                                  ? "0 0 12px rgba(227,187,98,0.9)"
                                  : "none",
                                transition: "opacity .18s ease",
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
          </div>
          {/* Profil-Leiste / Footer */}
          <div className="mt-auto px-3 pb-3 relative">
            {!collapsed && (
              <div
                className="pt-2 border-t text-[0.8rem]"
                style={{
                  borderColor: `hsl(${TOKENS.sidebarBorder})`,
                  color: `hsl(${TOKENS.sidebarMuted})`,
                }}
              />
            )}

            <div ref={menuRef} className="relative">
              {collapsed ? (
                // Nur Avatar, wenn Sidebar zu ist
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="
      relative
      w-[48px] h-[48px]
      rounded-[16px]
      border border-white/30
      bg-black/15
      shadow-[0_8px_20px_rgba(0,0,0,0.55)]
      flex items-center justify-center
      hover:bg-white/10
      transition
    "
                  aria-label="Profilmenü öffnen"
                >
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                      alt="Profil"
                      className="h-9 w-9 rounded-full border border-white/40 shadow"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                  </div>
                </button>
              ) : (
                // Neuer, kompletter Profil-Strip im offenen Zustand
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="
      group
      relative flex w-full items-center gap-3
      rounded-[22px]
      border border-white/12
      bg-gradient-to-r
      from-[rgba(15,23,42,0.98)]      /* links: dunkles Navy */
      via-[rgba(21,36,57,0.96)]       /* Mitte: etwas heller */
      to-[rgba(76,134,191,0.9)]       /* rechts: deutlich heller, bläulich */
      px-3.5 py-2.5
      shadow-[0_16px_34px_rgba(0,0,0,0.75)]
      hover:from-[rgba(18,30,46,1)]
      hover:via-[rgba(29,52,82,0.98)]
      hover:to-[rgba(110,171,215,0.98)]
      hover:border-[#E3BB62]/80
      transition
    "
                >
                  {/* dünner innerer Glow-Rand */}
                  <div className="pointer-events-none absolute inset-[1px] rounded-[20px] border border-white/10 opacity-70" />

                  {/* Avatar links */}
                  <div className="relative shrink-0 z-10">
                    <div className="absolute inset-[-4px] rounded-full border border-white/25 opacity-70" />
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
                      alt="Profil"
                      className="h-9 w-9 rounded-full border border-white/60 shadow"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                  </div>

                  {/* Name + Mail */}
                  <div className="min-w-0 flex-1 text-left z-10">
                    <p className="text-sm font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-100/80 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  {/* Settings-Icon rechts – bewusst heller gemacht */}
                  <div
                    className="
        z-10
        shrink-0 grid place-items-center
        h-9 w-9 rounded-2xl
        border border-white/40
        bg-white/15
        shadow-[0_8px_20px_rgba(0,0,0,0.55)]
        group-hover:border-[#E3BB62]/80
        group-hover:bg-[#E3BB62]/30
        transition
      "
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                </button>
              )}

              {menuOpen && !collapsed && (
                <div
                  className="absolute bottom-[calc(100%+0.6rem)] left-0 right-0 z-[80]"
                  role="menu"
                >
                  <div
                    className="
        overflow-hidden rounded-2xl
        border border-black/5
        bg-white/95
        shadow-[0_20px_45px_rgba(15,23,42,0.55)]
        backdrop-blur-xl
        dark:bg-slate-900/95 dark:border-slate-700
        text-sm
      "
                  >
                    {/* Header mit Avatar + leichtem Gold-Glow */}
                    <div
                      className="
          flex items-center gap-3 px-4 py-3
          bg-gradient-to-r
          from-[#F4E9D4] via-white to-white
          dark:from-slate-800 dark:via-slate-900
          border-b border-black/5 dark:border-slate-700
        "
                    >
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                        alt="Profil"
                        className="h-9 w-9 rounded-full border border-white/70 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {displayEmail}
                        </p>
                      </div>
                      <span
                        className="
            inline-flex items-center rounded-full
            bg-black/5 text-[10px] font-semibold
            px-2 py-0.5 uppercase tracking-wide
            text-slate-600 dark:bg-slate-800/70 dark:text-slate-200
          "
                      >
                        Admin
                      </span>
                    </div>

                    {/* Menü-Einträge */}
                    <div className="px-2 py-2 space-y-1 bg-white/95 dark:bg-slate-900">
                      <button
                        type="button"
                        className="
            flex w-full items-center justify-between
            rounded-xl px-3 py-2
            text-[0.9rem]
            text-slate-700 dark:text-slate-100
            hover:bg-slate-50 hover:text-slate-900
            dark:hover:bg-slate-800/80
            transition-colors
          "
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin/profile");
                        }}
                      >
                        <span>Profil</span>
                      </button>

                      <div
                        className="
            flex items-center justify-between
            rounded-xl px-3 py-2
            text-[0.9rem]
            text-slate-700 dark:text-slate-100
            hover:bg-slate-50 dark:hover:bg-slate-800/80
            transition-colors
          "
                      >
                        <span>Dark Mode</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isDarkMode}
                          onClick={() => setIsDarkMode((v) => !v)}
                          className={cx(
                            "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                            isDarkMode
                              ? "bg-slate-900 border-slate-600"
                              : "bg-slate-200 border-slate-300"
                          )}
                        >
                          <span
                            className={cx(
                              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                              isDarkMode ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Logout-Zeile unten mit rotem Akzent */}
                    {isAuthenticated && (
                      <div className="border-t border-black/5 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
                        <button
                          type="button"
                          className="
              flex w-full items-center px-4 py-2.5
              text-[0.9rem] font-semibold
              text-red-600 hover:text-red-700
              hover:bg-red-50/80 dark:hover:bg-red-900/25
              transition-colors
            "
                          onClick={async () => {
                            await handleLogout();
                            setMenuOpen(false);
                          }}
                        >
                          Abmelden
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main + TopNav ===== */}
      <main
        className="relative min-h-screen transition-[margin-left,width] duration-300"
        style={mainStyle}
      >
        {children}
      </main>
    </div>
  );
}
