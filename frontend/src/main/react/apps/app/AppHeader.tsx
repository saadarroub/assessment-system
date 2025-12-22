import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logoCap from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import { buildCatalogUrl, type CatalogLinkMeta } from "@/core/router/buildCatalogUrl";

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [reveal, setReveal] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [wasScrollingDown, setWasScrollingDown] = useState(false);


  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      // "scrolled" 
      setScrolled(y > 20);

      // Scrollrichtung bestimmen (mit kleiner Deadzone)
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        const dir = delta > 0 ? "down" : "up";
        setScrollDir(dir);

        // Reveal-Animation nur wenn wir NACH OBEN scrollen
        if (dir === "down") {
          setWasScrollingDown(true);
        }

        if (dir === "up" && wasScrollingDown && y > 120) {
          setReveal(true);
          requestAnimationFrame(() => setReveal(false));
          setWasScrollingDown(false);
        }


      }

      lastY = y;
    };

    onScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const baseNavLink =
    "relative text-[15px] font-medium px-1 py-1 text-[#264555]/80 hover:text-[#264555] transition-colors";
  const activeNavLink =
    "text-[#264555] font-semibold after:absolute after:left-1/2 after:-bottom-1.5 " +
    "after:h-[2px] after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-[#264555]";
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `${baseNavLink} ${isActive ? activeNavLink : ""}`;
  const themenCls = `${baseNavLink} ${isThemenActive ? activeNavLink : ""}`;
  const headerBase =
    "sticky top-0 z-40 bg-gradient-to-b from-white to-[#f7f7f5] transition-[box-shadow,background-color,backdrop-filter] duration-300";


  const headerNotScrolledShadow =
    "shadow-[0_1px_0_rgba(38,69,85,0.08),0_6px_12px_rgba(0,0,0,0.04)]";

  const headerScrolledExtra =
    "bg-white/95 backdrop-blur shadow-[0_6px_18px_rgba(0,0,0,0.08)]";

  return (
    <header
      className={[
        headerBase,
        scrolled ? headerScrolledExtra : headerNotScrolledShadow,
        "transform-gpu will-change-transform transition-all duration-200 ease-out",
        reveal ? "-translate-y-[10px]" : "translate-y-0",

      ].join(" ")}
    >

      {/* dünne CAP-Gold-Linie oben */}
      <div className="h-[2px] w-full bg-[#E3BB62]/80" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* eine Reihe: Logo | Nav | Textblock */}
        <div className="flex items-center justify-between gap-6 py-3 md:py-7">

          {/* LINKS: Logo */}
          <div className="flex items-center flex-none">
            <img
              src={logoCap}
              alt="CAP consulting"
              className={`w-auto transition-all duration-300 ${scrolled ? "h-8 md:h-9" : "h-9 md:h-10"
                }`}
            />
          </div>

          {/* MITTE: Navigation */}
          <div className="hidden lg:flex flex-none">
            <nav className="flex items-center gap-7">
              <NavLink to="/startseite" className={linkCls} end>
                Startseite
              </NavLink>

              <button
                type="button"
                className={themenCls}
                onClick={handleThemenClick}
              >
                Themen
              </button>

              <NavLink to="/app/help" className={linkCls} end>
                Hilfe
              </NavLink>

              <NavLink
                to="/app/contact"
                end
                className="
                  inline-flex items-center justify-center
                  rounded-full bg-[#E3BB62]
                  px-5 py-2
                  text-[14px] font-semibold text-[#264555]
                  shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                  transition-all duration-200
                  hover:brightness-105 hover:-translate-y-[1px]
                  active:translate-y-0 active:shadow-sm
                "
              >
                Kontakt
              </NavLink>
            </nav>
          </div>

          {/* RECHTS: ICA³-Textblock – zentriert + animiert */}
          <div className="hidden sm:flex flex-col items-center text-center leading-tight flex-none w-[320px]">
            {/* Kopfzeile mit Linien links/rechts */}
            <div className="mb-1 inline-flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#808080]">
              <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
              <span>ICA³ – Survey Plattform</span>
              <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
            </div>

            {/* Haupttitel mit Gradient-Underline + leichter Animation */}
            <h1
              className={`relative mt-[2px] font-semibold text-[#264555] transition-all duration-300 ${scrolled ? "text-[17px]" : "text-[19px]"
                }`}
            >
              <span className="relative z-10 px-1">Umfrage Plattform</span>
              <span
                className="
                  pointer-events-none absolute -bottom-2 left-1/2 h-[3px] w-24 -translate-x-1/2
                  rounded-full bg-gradient-to-r from-[#56768f] via-[#E3BB62] to-[#264555]
                  animate-pulse
                "
              />
            </h1>

            {/* Untertitel */}
            <p className="mt-2 text-[11px] text-[#808080] max-w-xs">
              <span className="font-medium text-[#264555]">
                Wählen Sie einen Katalog
              </span>{" "}
              und starten Sie Ihre{" "}
              <span className="font-medium text-[#264555]">
                ICA³-Bewertung
              </span>
              .
            </p>
          </div>

          {/* Mobile-Burger für kleine Screens */}
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ebebec] bg-white text-[#264555] shadow-sm hover:bg-[#f5f5f5] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Navigation umschalten"
            aria-expanded={mobileOpen}
            aria-controls="mobileNav"
          >
            <div className="flex flex-col gap-[3px]">
              <span
                className={`h-[2px] w-5 rounded-full bg-[#264555] transition-transform ${mobileOpen ? "translate-y-[5px] rotate-45" : ""
                  }`}
              />
              <span
                className={`h-[2px] w-4 rounded-full bg-[#264555] transition-opacity ${mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
              />
              <span
                className={`h-[2px] w-5 rounded-full bg-[#264555] transition-transform ${mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <div
        id="mobileNav"
        className={`lg:hidden border-t border-[#ebebec] bg-white shadow-sm transition-all duration-200 origin-top ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
      >
        <nav className="flex flex-col py-2 px-4 gap-1">
          {/* Textblock im Mobile-Menü – gleiche Optik wie Desktop, nur linksbündig */}
          <div className="mb-2 flex flex-col items-start text-left leading-tight">
            <div className="mb-1 inline-flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#808080]">
              <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
              <span>ICA³ – Survey Plattform</span>
            </div>
            <h2 className="relative mt-[2px] text-[16px] font-semibold text-[#264555]">
              <span className="relative z-10 px-[2px]">Umfrage Plattform</span>
              <span
                className="
                  pointer-events-none absolute -bottom-2 left-0 h-[3px] w-20
                  rounded-full bg-gradient-to-r from-[#56768f] via-[#E3BB62] to-[#264555]
                  animate-pulse
                "
              />
            </h2>
            <p className="mt-2 text-[11px] text-[#808080] max-w-sm">
              <span className="font-medium text-[#264555]">
                Wählen Sie einen Katalog
              </span>{" "}
              und starten Sie Ihre{" "}
              <span className="font-medium text-[#264555]">
                ICA³-Bewertung
              </span>
              .
            </p>
          </div>

          <NavLink
            to="/startseite"
            end
            className={({ isActive }) =>
              `px-2 py-2 text-sm rounded-md ${isActive
                ? "text-[#264555] font-semibold bg-[#ebebec]/60"
                : "text-[#264555]/80 hover:bg-[#ebebec]/40"
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            Startseite
          </NavLink>

          <button
            className="mt-1 rounded-md bg-[#264555] text-white text-sm font-semibold py-2 px-2 text-left hover:bg-[#1f3846]"
            onClick={() => {
              setMobileOpen(false);
              handleThemenClick();
            }}
          >
            Themen öffnen
          </button>

          <NavLink
            to="/app/help"
            end
            className={({ isActive }) =>
              `mt-1 px-2 py-2 text-sm rounded-md ${isActive
                ? "text-[#264555] font-semibold bg-[#ebebec]/60"
                : "text-[#264555]/80 hover:bg-[#ebebec]/40"
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            Hilfe
          </NavLink>

          <NavLink
            to="/app/contact"
            end
            className={({ isActive }) =>
              `mt-1 px-2 py-2 text-sm rounded-full ${isActive
                ? "bg-[#E3BB62] text-[#264555] font-semibold shadow-md"
                : "bg-[#E3BB62]/90 text-[#264555] font-semibold hover:bg-[#E3BB62]"
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            Kontakt
          </NavLink>
        </nav>
      </div>
      <div className="
  pointer-events-none
  h-[1px]
  w-full
  bg-gradient-to-r
  from-transparent
  via-[#264555]/20
  to-transparent
" />
    </header>
  );
}
