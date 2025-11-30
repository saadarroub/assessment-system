import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { AuthService } from "@/core/auth/AuthService";
import { logoutApi } from "@/features/auth/logoutService";
import logoCap from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import "@/styles/worker.css";
import { buildCatalogUrl, type CatalogLinkMeta } from "@/core/router/buildCatalogUrl";

// Klassen-Helferhier methode wie bei NavLink
const navCls = (active: boolean) =>
  `nav-link${active ? " nav-link-active" : ""}`;

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuthCtx();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function getActiveAssignment(): CatalogLinkMeta | null {
   
  try {
    const raw = localStorage.getItem("activeAssignmentMeta");
    return raw ? (JSON.parse(raw) as CatalogLinkMeta) : null;
  } catch {
    return null;
  }

  }
 
  const handleThemenClick = () => {
    const meta = getActiveAssignment();
    if (!meta) {
      // Fallback, falls nichts vorhanden ist:
      navigate("/app/help");
      return;
    }
    const url = buildCatalogUrl(meta);
    navigate(url);
  };

   const isThemenActive =
    location.pathname.startsWith("/app/katalog-themen-public") ||
    location.pathname.startsWith("/app/dashboard") ||
    location.pathname.startsWith("/app/assessments");

  /**
   * Logout Handler - Refactored für neues Auth-System
   * 
   * Flow:
   * 1. Cleanup: activeAssignmentMeta aus localStorage
   * 2. Get Token from AuthService (single source of truth)
   * 3. Backend-Logout-API-Call (löscht httpOnly Cookie)
   * 4. AuthService.clearTokens() (löscht Token + User in Memory)
   * 5. AuthContext.logout() (updated React State)
   * 6. Navigate zu /login
   */
  const handleLogout = async () => {
    // Cleanup: Assignment-Meta
    localStorage.removeItem("activeAssignmentMeta");
    
    // Get Token from AuthService (nicht mehr aus localStorage!)
    const token = AuthService.getAccessToken();
    
    // Backend-Logout (optional, kann fehlschlagen)
    if (token) {
      try {
        await logoutApi(token);
      } catch (error) {
        console.warn('Backend logout failed, continuing with local logout', error);
      }
    }
    
    // Clear Tokens in AuthService (Memory + localStorage)
    AuthService.clearTokens();
    
    // Update React Context
    logout();
    
    // Close Menu & Navigate
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Links: Logo */}
        <div className="logo-section">
          <img src={logoCap} alt="CAP consulting" className="brand-left-logo" />
        </div>

        {/* Mitte: Navigation */}
        <nav className="navigation">
          <NavLink to="/startseite" className={linkCls} end>
            StartSeite
          </NavLink>
          
          <button type="button" className={navCls(isThemenActive)} onClick={handleThemenClick}>
            Themen
          </button>

          {isAuthenticated ? (
            <NavLink to="/app/results/demo-session" className={linkCls}>
              Ergebnisse
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              state={{ from: "/app/results/demo-session" }}
              className={linkCls}
            >
              Ergebnisse
            </NavLink>
          )}

          <NavLink to="/app/help" className={linkCls} end>
            Hilfe
          </NavLink>

          <NavLink to="/app/contact" className="nav-button" end>
            Kontakt
          </NavLink>
        </nav>

        {/* Rechts: Titel + Profil */}
        <div className="right-section">
          {/* Avatar + Dropdown */}
          <div className="profile-container" ref={menuRef}>
            <div className="parallelogram-bg" />
            <button
              type="button"
              className="profile-content"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <div className="profile-avatar">
                <img
                  className="avatar-img"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                  alt="Profilmenü öffnen"
                />
              </div>
              <svg width="12" height="6" viewBox="0 0 16 10" className="dropdown-icon" aria-hidden>
                <path d="M2 2L8 8L14 2" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div className="profile-menu" role="menu">
                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    //navigate("/profile");
                    alert("Profil ansehen - Funktion noch nicht implementiert.");
                  }}
                >
                  Profil
                </button>
              </div>
            )}
          </div>
          <div className="title-section">
            <h1 className="main-title">Umfrage Platform</h1>
            <p className="subtitle-main">Wählen Sie einen Katalog für Ihre Bewertung</p>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menü"
          aria-expanded={mobileOpen}
          aria-controls="mobileNav"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-nav ${mobileOpen ? "show" : ""}`} id="mobileNav">
        <nav className="mobile-nav-content">
          <NavLink to="/" className="mobile-nav-link" end>
            StartSeite
          </NavLink>

          <button className="mobile-nav-button" onClick={handleThemenClick}>
            Jetzt testen
          </button>

          <NavLink to="/app/results/demo-session" className="mobile-nav-link">
            Ergebnisse
          </NavLink>
          <NavLink to="/app/help" className="mobile-nav-link" end>
            Hilfe
          </NavLink>
          <NavLink to="/app/contact" className="mobile-nav-link" end>
            Kontakt
          </NavLink>

          {isAuthenticated && (
            <button className="mobile-nav-link" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
