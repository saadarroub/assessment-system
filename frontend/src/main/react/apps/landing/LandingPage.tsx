// src/apps/landing/LandingPage.tsx
import AppHeader from "../app/AppHeader";

const VIDEO_SRC =
  "https://www.cap-consulting.de/wp-content/uploads/2022/12/Starseitengrafik-2.mp4";

export default function LandingPage() {
  return (
    <>
      <AppHeader />

      <section className="mt-20 relative overflow-hidden pt-8 md:pt-12">
        {/* Deko-Blöcke im Hintergrund */}
        <div className="pointer-events-none absolute left-[26%] -top-6 h-44 w-64 rounded-2xl bg-brand-ice/60 sm:h-56 sm:w-80" />
        <div className="pointer-events-none absolute left-[10%] top-[26%] hidden h-64 w-[36rem] rounded-3xl bg-brand-ice/80 md:block" />
        <div className="pointer-events-none absolute right-[26%] -top-10 hidden h-[22rem] w-[26rem] rounded-3xl bg-brand-ice/60 lg:block" />
        

        {/* Inhalt */}
        <div className="relative container mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:py-20 lg:grid-cols-2">
          {/* Text */}
          <div className="max-w-[48rem]">
            <h1 className="text-[42px] leading-[1.05] font-bold tracking-tight text-brand-navy sm:text-6xl">
              GANZHEITLICHE
              <br />
              IT-BERATUNG FÜR DEN
              <br />
              MITTELSTAND
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-700">
              Wir analysieren Ihre IT-Struktur auf Grundlage der vier Schwerpunkte{" "}
              <span className="font-semibold text-brand-gray/90">IT Operating Model</span>,{" "}
              <span className="font-semibold text-brand-steel/90">Enterprise Architecture Management</span>,{" "}
              <span className="font-semibold text-brand-navy/90">IT Sourcing</span> und{" "}
              <span className="font-semibold text-brand-sand/90">IT Project Management</span>, um optimale
              IT-Lösungen für Ihr Unternehmen zu finden.
            </p>
          </div>

          {/* Rechte Spalte: reine Video-Kachel (dekorativ) */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-[#f6f5f3]" />
              <video
                className="relative z-10 h-64 w-64 rounded-xl object-cover shadow-sm sm:h-72 sm:w-72 md:h-80 md:w-80 pointer-events-none"
                src={VIDEO_SRC}
                muted
                playsInline
                // @ts-ignore (für iOS Safari)
                webkit-playsinline="true"
                autoPlay
                loop
                controls={false}
                // @ts-ignore
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
                tabIndex={-1}
                aria-hidden="true"
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
