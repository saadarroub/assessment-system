import { CheckCircle2 } from "lucide-react";
import ica3logo from "@/assets/ICA3_Logo.jpg";

export default function AssessmentCompleted() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-200 text-[hsl(215_80%_15%)]">
      {/* Background bleibt wie bei dir */}
      <style>{`
        .hex-bg{
          background-image:
            conic-gradient(from 60deg, rgba(38,69,85,0.14) 0 60deg, transparent 0 360deg),
            conic-gradient(from 60deg, rgba(38,69,85,0.10) 0 60deg, transparent 0 360deg);
          background-size: 520px 450px;
          background-position: 0 0, 260px 225px;
        }
        .fade-top{
          mask-image: radial-gradient(circle at 50% 0%, black 0%, black 55%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at 50% 0%, black 0%, black 55%, transparent 85%);
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-100 to-gray-200" />
        <div className="absolute inset-0 opacity-[0.14] hex-bg fade-top" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(227,187,98,0.18)_0%,rgba(227,187,98,0.08)_25%,rgba(255,255,255,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.10)_78%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-[76rem] items-center justify-center px-6 py-14">
        <div className="relative w-full max-w-3xl">
          {/* weicher outer glow */}
          <div className="pointer-events-none absolute -inset-6 rounded-[34px] bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.10)_0%,transparent_60%)] blur-2xl" />

          {/* frame */}
          <div className="rounded-[30px] p-[1px] bg-[linear-gradient(135deg,rgba(148,163,184,0.55),rgba(255,255,255,0.9),rgba(148,163,184,0.45))] shadow-[0_30px_90px_-55px_rgba(15,23,42,0.55)]">
            <div
              className="
                relative overflow-hidden rounded-[29px]
                border border-white/30 bg-white/75 backdrop-blur-2xl
                transition-shadow duration-300
                hover:shadow-[0_36px_110px_-70px_rgba(15,23,42,0.60)]
              "
            >
              <div className="h-[4px] bg-[linear-gradient(90deg,transparent,#E3BB62,transparent)] opacity-80" />

              {/* subtle inner highlight */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-44 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(38,69,85,0.10)_0%,transparent_62%)] blur-2xl" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/55" />
              </div>

              {/* Logo Badge: mobile centered, md top-right */}
              <div className="relative z-10 px-6 pt-6 md:px-0 md:pt-0">
                <div className="flex justify-center md:justify-end md:absolute md:right-4 md:top-4">
                  <div className="relative">
  {/* subtle gold glow (sehr dezent) */}
  <div className="pointer-events-none absolute -inset-3 rounded-[18px] bg-[hsla(45,60%,55%,0.16)] blur-xl" />

  <div className="overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl ring-1 ring-slate-200/70 shadow-sm">
    {/* tiny gold accent line */}
    <div className="h-[3px] bg-[linear-gradient(90deg,transparent,#E3BB62,transparent)] opacity-85" />

    <div className="px-5 py-3">
      <img
        src={ica3logo}
        alt="ICA³"
        className="h-10 md:h-12 w-auto object-contain opacity-95"
      />
    </div>
  </div>
</div>

                </div>
              </div>

              {/* Header */}
              <div className="relative px-7 pt-7 pb-6 md:px-10 md:pt-10">
                {/* status pill */}
                <div className="mb-5 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    Abgeschlossen
                  </div>
                </div>

                {/* Hero icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(38,69,85,0.14)_0%,transparent_60%)] blur-xl" />
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/85 ring-1 ring-slate-200/70 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.45)]">
                      <CheckCircle2 className="h-8 w-8 text-[#264555]" />
                    </div>
                  </div>
                </div>

                <h1 className="mt-6 text-center text-2xl md:text-4xl font-extrabold tracking-tight text-[#264555]">
                  Vielen Dank für Ihre Teilnahme!
                </h1>

                <p className="mt-3 text-center text-sm md:text-base text-slate-600">
                  Sie haben alle Assessments erfolgreich abgeschlossen.
                  <br />
                  In den nächsten Tagen erhalten Sie eine E-Mail mit den Ergebnissen.
                </p>

                {/* divider */}
                <div className="mt-7 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.65),transparent)]" />
              </div>

              {/* Body (clean, weniger “Boxen”) */}
              <div className="relative px-7 pb-9 md:px-10 md:pb-10">
                {/* info strip */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/65 backdrop-blur-xl p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Zusammenfassung
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Ergebnisse per E-Mail", "Keine weiteren Schritte", "Seite kann geschlossen werden"].map((t) => (
                      <span
                        key={t}
                        className="
                          inline-flex items-center rounded-full
                          border border-slate-200/70 bg-white/70
                          px-3 py-1 text-xs font-semibold text-slate-600
                        "
                      >
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Falls Sie keine E-Mail erhalten, prüfen Sie bitte Ihren Spam-Ordner.
                  </p>
                </div>

                <p className="mt-7 text-xs text-slate-400 text-center">
                  ICA³ – Survey Platform · CAP Consulting
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
