import { useState, type FormEvent } from "react";
import ica3logo from "@/assets/ica3-logo.png";

export default function Ica3LandingTailwindOnly() {
  const [code, setCode] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = code.trim();
    if (clean) {
      alert("Code erfolgreich eingereicht: " + clean);
      setCode("");
    } else {
      alert("Bitte geben Sie einen gültigen Code ein.");
    }
  }

  return (
    <>
      {/* Nur die Keyframes – alles andere ist Tailwind */}
      <style>{`
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes fade-in { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes scale-in { 0%{transform:scale(0.95);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

      <div
        className="
          relative min-h-screen overflow-hidden
          bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
          text-[hsl(215_80%_15%)]
        "
      >
        {/* dekorative Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              absolute top-20 right-20 w-72 h-72 rounded-full blur-[60px]
              bg-[hsla(45,60%,55%,0.10)]
              [animation:float_3s_ease-in-out_infinite]
            "
          />
          <div
            className="
              absolute bottom-20 left-20 w-96 h-96 rounded-full blur-[60px]
              bg-[hsla(215,80%,15%,0.05)]
              [animation:float_3s_ease-in-out_infinite]
              [animation-delay:1s]
            "
          />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-[56rem] [animation:fade-in_.6s_ease-out_both]">
            {/* Logo */}
            <div className="mb-12 flex justify-center [animation:scale-in_.4s_ease-out_both]">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[hsla(45,60%,55%,0.2)] blur-[40px]" />
                <img
                  src={ica3logo}
                  alt="ICA3 - Integrated Customer Assessments & Advanced Analytics"
                  className="relative h-32 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] md:h-40"
                />
              </div>
            </div>

            {/* Text */}
            <div className="mb-12 text-center [animation:fade-in_.6s_ease-out_.2s_both]">
              <div className="mb-6">
                <h1
                  className="
                    mb-3 font-bold leading-[1.1]
                    text-4xl md:text-5xl lg:text-6xl
                    bg-gradient-to-br from-[hsl(215_80%_15%)] via-[hsl(215_80%_15%)] to-[hsl(45_60%_55%)]
                    bg-clip-text text-transparent
                  "
                >
                  Assessment Platform
                </h1>
                <div className="mx-auto h-1 w-32 bg-[linear-gradient(90deg,transparent_0%,hsl(45_60%_55%)_50%,transparent_100%)]" />
              </div>
              <p className="mx-auto max-w-[42rem] text-[hsl(215_20%_45%)] text-[1.125rem] leading-7 md:text-xl md:leading-8">
                Bewerten Sie Ihre Unternehmensreife in verschiedenen Bereichen durch
                interaktive Umfragen und erhalten Sie detaillierte Analysen.
              </p>
            </div>

            {/* Features */}
            <div
              className="
                mx-auto mb-12 grid max-w-[48rem] grid-cols-2 gap-4 md:grid-cols-4
                [animation:fade-in_.6s_ease-out_.3s_both]
              "
            >
              {[
                {
                  svg: (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-[hsl(45_60%_55%)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  ),
                  text: "Präzise Bewertung",
                },
                {
                  svg: (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-[hsl(45_60%_55%)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="20" x2="12" y2="10" />
                      <line x1="18" y1="20" x2="18" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                  ),
                  text: "Detaillierte Analysen",
                },
                {
                  svg: (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-[hsl(45_60%_55%)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  ),
                  text: "Wachstumspotenzial",
                },
                {
                  svg: (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-[hsl(45_60%_55%)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                  text: "Sofort einsetzbar",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="
                    flex flex-col items-center gap-2 rounded-md p-4
                    bg-white/50 backdrop-blur-md
                    border border-[hsla(215,20%,88%,0.5)]
                    transition
                    hover:border-[hsla(45,60%,55%,0.5)]
                    hover:scale-[1.05]
                    hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]
                  "
                >
                  {f.svg}
                  <span className="text-center text-sm font-medium">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Access Code Card */}
            <div
              className="
                relative mb-12 overflow-hidden rounded-xl
                border border-[hsla(215,20%,88%,0.5)]
                bg-white/80 backdrop-blur-2xl
                p-6 md:p-10
                shadow-[0_20px_60px_-15px_hsla(215,80%,15%,0.3)]
                [animation:scale-in_.4s_ease-out_.4s_both]
              "
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsla(45,60%,55%,0.05)_50%,transparent_100%)] bg-[length:200%_100%] [animation:shine_8s_linear_infinite]" />
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-md bg-[hsla(45,60%,55%,0.1)] p-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-[hsl(45_60%_55%)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                      <path d="m21 2-9.6 9.6" />
                      <circle cx="7.5" cy="15.5" r="5.5" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[hsl(215_80%_15%)]">
                    Access-Code eingeben
                  </h2>
                </div>

                <p className="mb-6 text-[1.125rem] text-[hsl(215_20%_45%)]">
                  Gib deinen zugewiesenen Code ein, um deine Themen zu sehen. Den
                  Code hast du per E-Mail erhalten.
                </p>

                <form onSubmit={onSubmit} className="m-0">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(215_20%_45%)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                        <path d="m21 2-9.6 9.6" />
                        <circle cx="7.5" cy="15.5" r="5.5" />
                      </svg>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Code eingeben"
                        required
                        className="
                          h-14 w-full rounded-md border border-[hsla(215,20%,88%,0.5)]
                          bg-white/50 pl-12 pr-4 text-[1.125rem]
                          text-[hsl(215_80%_15%)] outline-none transition
                          placeholder:text-[hsl(215_20%_45%)]
                          focus:border-[hsl(45_60%_55%)]
                          focus:shadow-[0_0_0_3px_hsla(45,60%,55%,0.10)]
                        "
                      />
                    </div>
                    <button
                      type="submit"
                      className="
                        h-14 rounded-md px-10 font-semibold text-[1.125rem]
                        text-[hsl(215_80%_15%)]
                        bg-[linear-gradient(135deg,hsl(45_60%_55%)_0%,hsl(45_60%_50%)_100%)]
                        shadow-[0_10px_25px_-5px_rgba(0,0,0,0.10)] transition
                        hover:scale-[1.05]
                        hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.20)]
                        hover:bg-[linear-gradient(135deg,hsl(45_60%_50%)_0%,hsl(45_60%_55%)_100%)]
                        active:scale-[0.98]
                      "
                    >
                      Bestätigen
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center [animation:fade-in_.6s_ease-out_.5s_both]">
              <div
                className="
                  inline-flex flex-col items-center gap-2 rounded-full border
                  border-[hsla(215,20%,88%,0.5)] bg-white/50 px-6 py-3 text-sm
                  backdrop-blur-md sm:flex-row sm:gap-6
                "
              >
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(215_20%_45%)]">Katalog:</span>
                  <span className="font-semibold">Full-Stack Web Development Expertise</span>
                </div>
                <span className="hidden h-1 w-1 rounded-full bg-[hsl(215_20%_88%)] sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(215_20%_45%)]">Firma:</span>
                  <span className="font-semibold">TechCorp Deutschland GmbH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>    
    </>
  );
}
