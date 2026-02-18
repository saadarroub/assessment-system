import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logoCap from "@/assets/Logo_cap_consulting_RGB_Darkblue.svg";
import { buildCatalogUrl, type CatalogLinkMeta } from "@/core/router/buildCatalogUrl";

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [reveal, setReveal] = useState(false);
  const lastYRef = useRef(0);
  const wasScrollingDownRef = useRef(false);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);

      const delta = y - lastYRef.current;
      if (Math.abs(delta) > 6) {
        const dir = delta > 0 ? "down" : "up";

        if (dir === "down") {
          wasScrollingDownRef.current = true;
        }

        if (dir === "up" && wasScrollingDownRef.current && y > 120) {
          setReveal(true);
          requestAnimationFrame(() => setReveal(false));
          wasScrollingDownRef.current = false;
        }

        lastYRef.current = y;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function getActiveAssignment(): CatalogLinkMeta | null {
    try {
      const raw = sessionStorage.getItem("publicAssessmentSession");
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
    navigate(buildCatalogUrl(meta));
  };

  const isThemenActive =
    location.pathname.startsWith("/app/katalog-themen-public") ||
    location.pathname.startsWith("/app/dashboard") ||
    location.pathname.startsWith("/app/assessments");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

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
    <>
      <header
        className={[
          headerBase,
          scrolled ? headerScrolledExtra : headerNotScrolledShadow,
          "transform-gpu will-change-transform transition-all duration-200 ease-out",
          reveal ? "-translate-y-[10px]" : "translate-y-0",
        ].join(" ")}
      >
        <div className="h-[2px] w-full bg-[#E3BB62]/80" />

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-6 py-3 md:py-7">
            <div className="flex items-center flex-none">
              <img
                src={logoCap}
                alt="CAP consulting"
                className={`w-auto transition-all duration-300 ${scrolled ? "h-8 md:h-9" : "h-9 md:h-10"
                  }`}
              />
            </div>

            <div className="hidden md:flex flex-none">
              <nav className="flex items-center gap-7">
                <NavLink to="/startseite" className={linkCls} end>
                  Startseite
                </NavLink>

                <button type="button" className={themenCls} onClick={handleThemenClick}>
                  Themen
                </button>

                <NavLink to="/help-faq" className={linkCls} end>
                  Hilfe
                </NavLink>

                <NavLink
                  to="/kontakt"
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

            <div className="hidden xl:flex flex-col items-center text-center leading-tight flex-none w-[320px]">
              <div className="mb-1 inline-flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#808080]">
                <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
                <span>ICA³ – Survey Plattform</span>
                <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
              </div>

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

              <p className="mt-2 text-[11px] text-[#808080] max-w-xs">
                <span className="font-medium text-[#264555]">Wählen Sie einen Katalog</span>{" "}
                und starten Sie Ihre <span className="font-medium text-[#264555]">ICA³-Bewertung</span>.
              </p>
            </div>

            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ebebec] bg-white text-[#264555] shadow-sm hover:bg-[#f5f5f5] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Navigation umschalten"
              aria-expanded={mobileOpen}
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

        <div
          className="
            pointer-events-none h-[1px] w-full
            bg-gradient-to-r from-transparent via-[#264555]/20 to-transparent
          "
        />
      </header>

      {/*  Overlay MUSS außerhalb vom transformierten Header liegen  */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[999]">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            aria-label="Menü schließen"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            className="
        absolute right-0 top-0 h-full
        w-[min(380px,92vw)]
        bg-white
        shadow-[0_24px_80px_rgba(0,0,0,0.28)]
        border-l border-[#ebebec]
        overflow-hidden
        rounded-l-2xl
        pt-[max(12px,env(safe-area-inset-top))]
      "
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <img src={logoCap} alt="CAP consulting" className="h-7 w-auto" />

              <button
                className="
            inline-flex h-10 w-10 items-center justify-center rounded-full
            border border-[#ebebec] bg-white text-[#264555]
            hover:bg-[#f5f5f5] transition-colors
          "
                onClick={() => setMobileOpen(false)}
                aria-label="Schließen"
              >
                <span className="text-[18px] leading-none">×</span>
              </button>
            </div>

            {/* Goldline + divider */}
            <div className="h-[2px] w-full bg-[#E3BB62]/80" />
            <div className="h-px w-full bg-[#ebebec]" />

            {/*  CONTENT   */}
            <div className="h-[calc(100%-56px-2px-1px)] px-4 py-4 flex flex-col">
              {/* Info-Block */}
         
              <div className="mb-4 text-center">
                {/* Kopfzeile mit Linien links/rechts*/}
                <div className="mb-1 inline-flex items-center justify-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#808080]">
                  <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
                  <span>ICA³ – Survey Plattform</span>
                  <span className="h-px w-8 rounded-full bg-[#d2c9b9]" />
                </div>

                {/* Titel + Gradient-Underline  */}
                <h2 className="relative mt-[2px] text-[18px] font-semibold text-[#264555]">
                  <span className="relative z-10 px-1">Umfrage Plattform</span>
                  <span
                    className="
        pointer-events-none absolute -bottom-2 left-1/2 h-[3px] w-24 -translate-x-1/2
        rounded-full bg-gradient-to-r from-[#56768f] via-[#E3BB62] to-[#264555]
      "
                  />
                </h2>

                {/* Untertitel (zentriert) */}
                <p className="mt-3 text-[12px] text-[#808080] leading-relaxed">
                  <span className="font-medium text-[#264555]">Wählen Sie einen Katalog</span>{" "}
                  und starten Sie Ihre{" "}
                  <span className="font-medium text-[#264555]">ICA³-Bewertung</span>.
                </p>

                {/* Divider */}
                <div className="mt-4 h-px w-full bg-[#ebebec]" />
              </div>



              {/* Navigation  */}
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1">
                  <NavLink
                    to="/startseite"
                    end
                    className={({ isActive }) =>
                      [
                        "rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                        isActive
                          ? "bg-[#ebebec]/60 text-[#264555] font-semibold"
                          : "text-[#264555]/80 hover:bg-[#ebebec]/40",
                      ].join(" ")
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    Startseite
                  </NavLink>

                  <button
                    type="button"
                    className={[
                      "rounded-xl px-3 py-2.5 text-[14px] font-medium text-left transition-colors",
                      isThemenActive
                        ? "bg-[#ebebec]/60 text-[#264555] font-semibold"
                        : "text-[#264555]/80 hover:bg-[#ebebec]/40",
                    ].join(" ")}
                    onClick={() => {
                      setMobileOpen(false);
                      handleThemenClick();
                    }}
                  >
                    Themen
                  </button>

                  <NavLink
                    to="/help-faq"
                    end
                    className={({ isActive }) =>
                      [
                        "rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                        isActive
                          ? "bg-[#ebebec]/60 text-[#264555] font-semibold"
                          : "text-[#264555]/80 hover:bg-[#ebebec]/40",
                      ].join(" ")
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    Hilfe
                  </NavLink>
                </nav>
              </div>

              {/* Kontakt unten fix */}
              <div className="mt-4 pt-3 border-t border-[#ebebec]">
                <NavLink
                  to="/kontakt"
                  end
                  className={({ isActive }) =>
                    [
                      "inline-flex w-full items-center justify-center rounded-full",
                      "bg-[#E3BB62] px-5 py-2.5 text-[14px] font-semibold text-[#264555]",
                      "shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-all duration-200",
                      "hover:brightness-105",
                      isActive ? "ring-1 ring-[#264555]/10" : "",
                    ].join(" ")
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Kontakt
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
