import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { logoutApi } from "@/features/auth/logoutService";
import logoCap from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import "@/styles/worker.css";

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated , token ,logout} = useAuthCtx(); // falls token nicht im ctx: via localStorage holen
  // gemeinsame Klasse für Links mit Active-State
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

   const handleLogout = async () => {
    const t = token ?? localStorage.getItem("accessToken") ?? localStorage.getItem("token");
    await logoutApi(token);  // Server abmelden (wenn Token da)
    logout();                // lokal aufräumen (dein AuthContext tut das)
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
          {/* StartSeite: nur exakt "/" ist aktiv */}
          <NavLink to="/" className={linkCls} end>
            StartSeite
          </NavLink>

          {/* Jetzt testen: Dashboard und alle Unterseiten */}
          {isAuthenticated ? (
            <NavLink to="/app/dashboard" className={linkCls}>
              Jetzt testen
            </NavLink>
          ) : (
            <NavLink to="/login" state={{ from: "/app/dashboard" }} className={linkCls}>Jetzt testen</NavLink>
          )}

          {/* Ergebnisse: gesamte Results-Section */}
          {isAuthenticated ? (
            <NavLink to="/app/results/demo-session" className={linkCls}>
              Ergebnisse
            </NavLink>
          ) : (
            <NavLink to="/login" state={{ from: "/app/results/demo-session" }} className={linkCls}>Ergebnisse</NavLink>
          )}

          {/* Hilfe: nur exakt /app/help */}
          <NavLink to="/app/help" className={linkCls} end>
            Hilfe
          </NavLink>

          {/* Kontakt: Button-Styling, eigener Active-State nicht nötig */}
          <NavLink to="/app/contact" className="nav-button" end>
            Kontakt
          </NavLink>
        </nav>

        {/* Rechts: Profil + Titel */}
        <div className="right-section">
          <div className="profile-container">
            <div className="parallelogram-bg" />
            <div className="profile-content">
              {isAuthenticated && (
                <button className="nav-button ml-2" onClick={handleLogout}>
                  Abmelden
                </button>
              )}
              <div className="profile-avatar">
                <img
                  className="avatar-img"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                  alt="Profil"
                />
              </div>
              <svg
                width="12"
                height="6"
                viewBox="0 0 16 10"
                className="dropdown-icon"
                aria-hidden
              >
                <path
                  d="M2 2L8 8L14 2"
                  stroke="#1E1E1E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
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
          <button
            className="mobile-nav-button"
            onClick={() => navigate("/app/dashboard")}
          >
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
        </nav>
      </div>
    </header>
  );
}
