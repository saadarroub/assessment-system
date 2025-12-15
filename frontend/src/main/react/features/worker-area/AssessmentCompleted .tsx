import ica3logo from "@/assets/ica3-logo.png";

export default function AssessmentCompleted() {
  return (
    <div
      className="
        relative min-h-screen overflow-hidden
        bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
        text-[hsl(215_80%_15%)]
      "
    >
      {/* Deko (dezent, wie bei dir) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-14 right-[-6rem] h-[28rem] w-[28rem] rounded-full blur-[90px] bg-[hsla(45,60%,55%,0.18)]" />
        <div className="absolute bottom-[-7rem] left-[-7rem] h-[34rem] w-[34rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.08)]" />
        <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-[90rem] items-center justify-center px-6 py-14">
        <div className="w-full max-w-[52rem]">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[hsla(45,60%,55%,0.16)] blur-[34px]" />
              <img
                src={ica3logo}
                alt="ICA³"
                className="relative h-20 md:h-24 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>

          {/* Card */}
          <div
            className="
              overflow-hidden rounded-[26px]
              border border-[hsla(215,20%,88%,0.75)]
              bg-white/86 backdrop-blur-2xl
              shadow-[0_35px_90px_-45px_rgba(23,37,84,.28)]
            "
          >
            {/* Top accent (Gold) */}
            <div className="h-[5px] bg-[linear-gradient(90deg,transparent,#E3BB62,transparent)]" />

            <div className="p-7 md:p-10 text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[hsla(45,60%,55%,.16)] border border-[hsla(45,60%,55%,.40)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-[#264555]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-[#264555]">
                Vielen Dank für Ihre Teilnahme!
              </h1>

              <p className="mt-4 text-base md:text-lg text-[hsl(215_20%_45%)]">
                Sie haben alle Assessments erfolgreich abgeschlossen.
                <br />
                In den nächsten Tagen erhalten Sie eine E-Mail mit den Ergebnissen.
              </p>

              {/* Mini Info Chips */}
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {["Abgeschlossen", "Ergebnisse per E-Mail", "Keine weiteren Schritte nötig"].map((t) => (
                  <span
                    key={t}
                    className="
                      inline-flex items-center rounded-full
                      bg-white/70 px-3 py-1
                      text-[11px] font-semibold uppercase tracking-[0.14em]
                      border border-[hsla(215,20%,88%,0.9)]
                      text-slate-500
                    "
                  >
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    {t}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-sm text-slate-400">
                Sie können diese Seite jetzt schließen.
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400 text-center">
            ICA³ – Survey Platform · CAP Consulting
          </p>
        </div>
      </main>
    </div>
  );
}
