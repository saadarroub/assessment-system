import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";
import ica3logo from "@/assets/ica3-logo.png";

export default function InviteInvalid() {
  const nav = useNavigate();
  const location = useLocation();

  const reason = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return (q.get("reason") || "").toLowerCase();
  }, [location.search]);

  const title =
    reason === "completed"
      ? "Diese Einladung wurde bereits genutzt"
      : "Diese Einladung ist nicht mehr gültig";

  const subtitle =
    reason === "completed"
      ? "Das Assessment wurde bereits abgeschlossen. Der Link kann nicht erneut verwendet werden."
      : "Der Link ist abgelaufen oder ungültig. Bitte fordern Sie eine neue Einladung an.";

  return (
    <div
      className="
        relative min-h-screen overflow-hidden
        bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
        text-[hsl(215_80%_15%)]
      "
    >
      {/* Deko */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-14 right-[-6rem] h-[28rem] w-[28rem] rounded-full blur-[90px] bg-[hsla(45,60%,55%,0.20)]" />
        <div className="absolute bottom-[-7rem] left-[-7rem] h-[34rem] w-[34rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />
        <div className="absolute left-[18%] top-[34%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute right-[20%] top-[38%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-[76rem] items-center justify-center px-6 py-14">
        <div
          className="
            relative w-full max-w-3xl overflow-hidden rounded-[26px]
            border border-[hsla(215,20%,88%,0.7)]
            bg-white/80 backdrop-blur-2xl
            shadow-[0_35px_90px_-35px_rgba(23,37,84,.35)]
          "
        >
          {/* Header strip */}
          <div className="relative px-7 py-7 md:px-10 md:py-9 bg-[linear-gradient(135deg,#315c8c_0%,#264555_100%)] text-white">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 border border-white/20">
                <ShieldX className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
                <p className="text-white/85 text-sm md:text-base mt-1">
                  {subtitle}
                </p>
              </div>

              <img
                src={ica3logo}
                alt="ICA³"
                className="hidden md:block h-10 w-auto opacity-95"
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-7 md:px-10 md:py-9">
            <div className="grid gap-4 md:gap-5">
              <div className="rounded-2xl border border-[hsla(215,20%,88%,0.7)] bg-white/70 p-5">
                <h2 className="font-semibold text-[#264555]">
                  Was Sie jetzt tun können
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    Wenn Sie die Ergebnisse erwarten: Bitte warten Sie auf die E-Mail in den nächsten Tagen.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    Falls Sie eine neue Einladung benötigen: Kontaktieren Sie Ihre Ansprechperson.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between">
                <button
                  onClick={() => nav("/", { replace: true })}
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-2xl px-5 py-3 text-sm font-semibold
                    border border-[hsla(215,20%,88%,0.9)]
                    bg-white/70 text-[#264555]
                    hover:bg-white transition
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Zur Startseite
                </button>

                <a
                  href="mailto:kontakt@cap-consulting.de"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-2xl px-5 py-3 text-sm font-semibold
                    bg-[#E3BB62] text-[#264555]
                    shadow hover:brightness-95 transition
                  "
                >
                  <Mail className="h-4 w-4" />
                  Kontakt aufnehmen
                </a>
              </div>

              <p className="text-xs text-slate-400 text-center">
                ICA³ – Survey Platform · CAP Consulting
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
