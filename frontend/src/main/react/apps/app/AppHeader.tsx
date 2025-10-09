import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logoCap from '@/assets/Logo_cap_consulting_RGB_Darkblue.svg';
import '@/styles/worker.css';

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        {/* Links: CAP Logo (größer per CSS) */}
        <div className="logo-section">
          <img src={logoCap} alt="CAP consulting" className="brand-left-logo" />
        </div>

        {/* Mitte: Navigation */}
        <nav className="navigation">
          {/* StartSeite: einfacher Link -> kein Active-State */}
          <Link to="/app/dashboard" className="nav-link">StartSeite</Link>

          {/* Jetzt testen: bleibt NavLink -> Active-Underline */}
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            end
          >
            Jetzt testen
          </NavLink>

          <NavLink
            to="/app/results/demo-session"
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
          >
            Ergebnisse
          </NavLink>

          <NavLink
            to="/app/help"
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
          >
            Hilfe
          </NavLink>

          <NavLink to="/app/contact" className="nav-button">Kontakt</NavLink>
        </nav>

        {/* Rechts: erst Profil, dann Titel/Untertitel (neu) */}
        <div className="right-section">
          <div className="profile-container">
            <div className="parallelogram-bg" />
            <div className="profile-content">
              <div className="profile-avatar">
                <img
                  className="avatar-img"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                  alt="Profil"
                />
              </div>
              <svg width="12" height="6" viewBox="0 0 16 10" className="dropdown-icon" aria-hidden>
                <path d="M2 2L8 8L14 2" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menü"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-nav ${mobileOpen ? 'show' : ''}`} id="mobileNav">
        <nav className="mobile-nav-content">
          <Link to="/app/dashboard" className="mobile-nav-link">StartSeite</Link>
          <button className="mobile-nav-button" onClick={() => navigate('/app/dashboard')}>Jetzt testen</button>
          <NavLink to="/app/results/demo-session" className="mobile-nav-link">Ergebnisse</NavLink>
          <NavLink to="/app/help" className="mobile-nav-link">Hilfe</NavLink>
          <NavLink to="/app/contact" className="mobile-nav-link">Kontakt</NavLink>
        </nav>
      </div>
    </header>
  );
}
