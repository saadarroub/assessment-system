// src/features/public/InviteGate.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchInviteMeta,
  verifyInvite,
  type InviteMeta,
  fetchAssignmentByAccessCode,
} from "@/features/service/inviteService";
import { KeyRound, Loader2 } from "lucide-react";
import ica3logo from "@/assets/ica3-logo.png";

export default function InviteGate() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<InviteMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Ziel, wohin wir nach Erfolg leiten
  const TARGET = "/app/katalog-themen-public";

  // --- Navigation (unverändert, nur für Optik ergänzt) ---
  async function navigateToTopics(opts: { token: string; accessCode?: string }) {
    const { token, accessCode } = opts;

    let assignmentId = "";
    let catalogId = "";
    let catalogTitle = "";
    let workerName = "";

    if (accessCode && accessCode.trim()) {
      const assign = await fetchAssignmentByAccessCode(accessCode.trim());
      assignmentId = assign?.id || "";
      catalogId = assign?.catalog?.id || "";
      catalogTitle = assign?.catalog?.title || "";
      workerName = assign?.worker?.name || "";
    }

    // Alles in sessionStorage legen
    const sessionPayload = {
      token,
      assignmentId,
      catalogId,
      catalogTitle,
      workerName,
      accessCode: accessCode?.trim() || "",
    };
    sessionStorage.setItem("publicAssessmentSession", JSON.stringify(sessionPayload));

    // URL jetzt nur noch sehr schlank
    navigate(`${TARGET}?token=${encodeURIComponent(token)}`, { replace: true });
  }

  // --- Meta laden & ggf. direkt weiterleiten (unverändert) ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const m = await fetchInviteMeta(token);


        if (!alive) return;

        const accessCode = m?.accessCode?.trim();
        if (accessCode) {
          const assignment = await fetchAssignmentByAccessCode(accessCode);
          if (!alive) return;

          if ((assignment?.status || "").toUpperCase() === "COMPLETED") {
            navigate("/public/invite-invalid?reason=completed", { replace: true });

            return;
          }
        }

        if (m.status && m.status.toLowerCase() === "expired") {
          throw new Error("Einladung ist abgelaufen.");
        }
        if (m.expiresAt && new Date(m.expiresAt).getTime() < Date.now()) {
          throw new Error("Einladung ist abgelaufen.");
        }

        setMeta(m);

        if (!m.requiresCode) {
          setVerifying(true);
          await verifyInvite(token);
          await navigateToTopics({ token, accessCode: m.accessCode });

          try {
            const accessCode = m.accessCode?.trim();
            if (accessCode) {
              const assign = await fetchAssignmentByAccessCode(accessCode);
              const assignmentId = assign?.id;
              if (assignmentId) {
                localStorage.setItem(`unlock:assignment:${assignmentId}`, "true");
                navigate(
                  `${TARGET}?token=${encodeURIComponent(token)}&assignmentId=${encodeURIComponent(
                    assignmentId
                  )}`,
                  { replace: true }
                );
                return;
              }
            }
          } catch {
            /* weiter ohne assignmentId */
          }

          navigate(`${TARGET}?token=${encodeURIComponent(token)}`, { replace: true });
          return;
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
        if (alive) setVerifying(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, navigate]);

  // --- Submit (unverändert) ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setVerifying(true);
      setError(null);

      const clean = code.trim();

      await verifyInvite(token, clean);

      let assignmentId: string | undefined;
      try {
        const assign = await fetchAssignmentByAccessCode(clean);
        assignmentId = assign?.id;
        if (assignmentId) {
          localStorage.setItem(`unlock:assignment:${assignmentId}`, "true");
        }
      } catch {
        /* navigieren wir trotzdem weiter */
      }

      await navigateToTopics({ token, accessCode: clean });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setVerifying(false);
    }
  }

  if (loading)
    return (
      <div
        className="
        min-h-screen flex items-center justify-center
        bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
      "
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="
            h-12 w-12 rounded-full
            border-4 border-[hsla(215,20%,88%,0.9)]
            border-t-[#E3BB62]
            animate-spin
          "
          />
          <div className="text-sm font-medium text-slate-600">
            Einladung wird geprüft…
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div
        className="
        relative min-h-screen overflow-hidden
        bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
        text-[hsl(215_80%_15%)]
      "
      >
        {/* Keyframes nur hier (keine Globals) */}
        <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fade-in { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes scale-in { 0%{transform:scale(.96);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

        {/* Deko */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-14 right-[-6rem] h-[28rem] w-[28rem] rounded-full blur-[90px] bg-[hsla(45,60%,55%,0.20)]" />
          <div className="absolute bottom-[-7rem] left-[-7rem] h-[34rem] w-[34rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.08)]" />
          <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
          <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
        </div>

        <main className="relative mx-auto flex min-h-screen max-w-[90rem] items-center justify-center px-6 py-14">
          <div className="w-full max-w-[64rem]">
            {/* Logo */}
            <div className="mb-10 flex justify-center [animation:scale-in_.4s_ease-out_both]">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[hsla(45,60%,55%,0.18)] blur-[36px]" />
                <img
                  src={ica3logo}
                  alt="ICA³ – Integrated Customer Assessments & Advanced Analytics"
                  className="relative h-20 md:h-24 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)]"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="mx-auto max-w-4xl text-center [animation:fade-in_.6s_ease-out_.1s_both]">
              <h1
                className="
                text-3xl md:text-5xl font-extrabold tracking-tight
                bg-gradient-to-br from-[hsl(215_80%_15%)] via-[hsl(215_80%_15%)] to-[hsl(45_60%_55%)]
                bg-clip-text text-transparent
                drop-shadow-[0_6px_24px_rgba(0,0,0,.08)]
              "
              >
                Einladung nicht mehr gültig
              </h1>
              <div className="mx-auto mt-4 h-[5px] w-52 rounded-full bg-[linear-gradient(90deg,transparent,hsl(45_60%_55%),transparent)]" />
              <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg text-[hsl(215_20%_45%)]">
                Der Link ist abgelaufen, ungültig oder wurde bereits genutzt. Bitte kontaktieren Sie Ihre Ansprechperson.
              </p>
            </div>

            {/* Quick-Info Cards */}
            <div
              className="
              mx-auto mt-10 grid max-w-[52rem] grid-cols-1 gap-4
              sm:grid-cols-3
              [animation:fade-in_.6s_ease-out_.25s_both]
            "
            >
              {[
                { title: "Sicher", text: "Einladungen sind nur einmal nutzbar." },
                { title: "Datenschutz", text: "Zugriff endet nach Abschluss / Ablauf." },
                { title: "Support", text: "Wir helfen bei neuen Links." },
              ].map((c) => (
                <div
                  key={c.title}
                  className="
                  rounded-2xl border border-[hsla(215,20%,88%,0.65)]
                  bg-white/80 backdrop-blur-md p-5
                  shadow-[0_10px_25px_-8px_rgba(15,23,42,.10)]
                  transition hover:scale-[1.02]
                "
                >
                  <div className="text-sm font-semibold text-[#264555]">{c.title}</div>
                  <div className="mt-2 text-sm text-slate-600">{c.text}</div>
                </div>
              ))}
            </div>

            {/* Error Card (Premium) – nicer, NO black, 1 button */}
            <div
              className="
              mx-auto mt-6 max-w-[52rem]
              overflow-hidden rounded-[22px]
              border border-[hsla(215,20%,88%,0.75)]
              bg-white/86 backdrop-blur-2xl
              shadow-[0_40px_90px_-45px_rgba(23,37,84,.32)]
              [animation:scale-in_.35s_ease-out_.35s_both]
            "
            >
              {/* Shine (dezent) */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,hsla(45,60%,55%,.08),transparent)] bg-[length:200%_100%] [animation:shine_2.8s_linear_infinite]" />

              <div className="relative p-6 md:p-8">
                {/* Kopfzeile der Card */}
                <div className="flex items-start gap-4">
                  <div
                    className="
                    grid h-12 w-12 shrink-0 place-items-center rounded-2xl
                    bg-[hsla(45,60%,55%,.16)]
                    border border-[hsla(45,60%,55%,.40)]
                    shadow-[0_12px_24px_-16px_rgba(227,187,98,.9)]
                  "
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#264555]" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6" />
                      <path d="M9 9l6 6" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-[#264555]">Details (für Debug / Support)</div>

                      {/* kleines Badge */}
                      <span
                        className="
                        inline-flex items-center gap-2 rounded-full
                        bg-white/70 px-3 py-1
                        text-[11px] font-semibold uppercase tracking-[0.16em]
                        border border-[hsla(215,20%,88%,0.85)]
                        text-slate-400
                      "
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                        Info
                      </span>
                    </div>

                    {/* Error message – hell, clean, kein schwarz */}
                    <div
                      className="
                      mt-3 rounded-2xl
                      border border-[hsla(215,20%,88%,0.85)]
                      bg-[linear-gradient(135deg,hsla(0,0%,100%,.75)_0%,hsla(215,20%,98%,.85)_100%)]
                      p-4
                      shadow-inner
                    "
                    >
                      <p className="text-sm text-slate-700 break-words">
                        {error}
                      </p>

                      {/* mini hint */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                          Bitte Screenshot + Fehlermeldung an Support senden.
                        </span>
                      </div>
                    </div>

                    {/* 1 Button only */}
                    <div className="mt-6 flex justify-center sm:justify-end">
                      <a
                        href="mailto:kontakt@cap-consulting.de"
                        className="
                        inline-flex items-center justify-center
                        rounded-2xl px-6 py-3 text-sm font-semibold
                        bg-[#E3BB62] text-[#264555]
                        shadow-[0_14px_32px_-12px_rgba(0,0,0,.25)]
                        hover:brightness-95 hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,.28)]
                        active:scale-[.99]
                        transition
                      "
                      >
                        Kontakt aufnehmen
                      </a>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-xs text-slate-400 text-center">
                  ICA³ – Survey Platform · CAP Consulting
                </p>
              </div>
            </div>

            {/* Mini footer hint (dezent) */}
            <div className="mt-8 text-center text-xs text-slate-400 [animation:fade-in_.6s_ease-out_.5s_both]">
              Tipp: Wenn du denkst, das ist ein Fehler, bitte Screenshot + Zeitstempel an den Support senden.
            </div>
          </div>
        </main>
      </div>
    );


  // --- Keyframes nur für Animationen (keine Globals) ---
  const Animations = (
    <style>{`
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes fade-in { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes scale-in { 0%{transform:scale(.95);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
`}</style>
  );

  // --- UI (nur Styling/Markup angepasst) ---
  if (meta?.requiresCode) {
    return (
      <div
        className="
          relative min-h-screen overflow-hidden
          bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
          text-[hsl(215_80%_15%)]
        "
      >
        {Animations}

        {/* Deko-Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-16 right-[-5rem] h-[26rem] w-[26rem] rounded-full blur-[90px] bg-[hsla(45,60%,55%,0.20)] " />
          <div className="absolute bottom-[-6rem] left-[-6rem] h-[32rem] w-[32rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />
        </div>

        {/* HERO */}
        <section className="relative mx-auto max-w-[90rem] px-6 pt-16 md:pt-24">
          <div className="mb-10 md:mb-12 flex justify-center [animation:scale-in_.4s_ease-out_both]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[hsla(45,60%,55%,0.2)] blur-[36px]" />
              <img
                src={ica3logo}
                alt="ICA3 – Integrated Customer Assessments & Advanced Analytics"
                className="relative h-24 md:h-32 w-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <h1
              className="
                text-4xl md:text-6xl font-extrabold tracking-tight
                bg-gradient-to-br from-[hsl(215_80%_15%)] via-[hsl(215_80%_15%)] to-[hsl(45_60%_55%)]
                bg-clip-text text-transparent
                drop-shadow-[0_6px_24px_rgba(0,0,0,.08)]
              "
            >
              Assessment Platform
            </h1>
            <div className="mx-auto mt-4 h-[5px] w-56 rounded-full bg-[linear-gradient(90deg,transparent,hsl(45_60%_55%),transparent)]" />
            <p className="mx-auto mt-6 max-w-3xl text-base md:text-xl text-[hsl(215_20%_45%)]">
              Bewerten Sie Ihre Unternehmensreife in verschiedenen Bereichen durch interaktive Umfragen
              und erhalten Sie detaillierte Analysen.
            </p>
          </div>

          {/* Feature-Cards */}
          <div
            className="
              mx-auto mt-10 md:mt-14 grid max-w-[52rem] grid-cols-2 gap-4
              md:max-w-[64rem] md:grid-cols-4
              [animation:fade-in_.6s_ease-out_.3s_both]
            "
          >
            {[
              {
                label: "Präzise Bewertung",
                icon: (
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
              },
              {
                label: "Detaillierte Analysen",
                icon: (
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
              },
              {
                label: "Wachstumspotenzial",
                icon: (
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
              },
              {
                label: "Sofort einsetzbar",
                icon: (
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
              },
            ].map((f, i) => (
              <div
                key={i}
                className="
                  rounded-xl border border-[hsla(215,20%,88%,0.6)]
                  bg-white/80 backdrop-blur-md
                  px-6 py-5 text-center
                  shadow-[0_10px_25px_-8px_rgba(15,23,42,.10)]
                  transition hover:scale-[1.05]
                  hover:border-[hsla(45,60%,55%,0.5)]
                  hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,.18)]
                "
              >
                <div className="flex flex-col items-center gap-2">
                  {f.icon}
                  <span className="text-sm font-medium text-[hsl(215_80%_15%)]">{f.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Access-Code Card */}
        <section className="relative mx-auto mt-10 md:mt-16 mb-10 max-w-[72rem] px-6">
          <form
            onSubmit={onSubmit}
            className="
              relative overflow-hidden rounded-[22px]
              border border-[hsla(215,20%,88%,0.6)]
              bg-white/82 backdrop-blur-2xl p-6 md:p-8
              shadow-[0_35px_80px_-30px_rgba(23,37,84,.35)]
              [animation:scale-in_.35s_ease-out_both]
            "
          >
            {/* Shine */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,hsla(45,60%,55%,.06),transparent)] bg-[length:200%_100%]" />

            <div className="relative flex items-center gap-3 font-semibold">
              <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-[hsla(45,60%,55%,.15)]">
                <KeyRound className="h-5 w-5 text-[hsl(45_60%_55%)]" />
              </span>
              <h2 className="text-2xl md:text-3xl">Access-Code eingeben</h2>
            </div>

            <p className="relative mt-4 text-[hsl(215_20%_45%)] md:text-lg">
              Gib deinen zugewiesenen Code ein, um deine Themen zu sehen. Den Code hast du per E-Mail erhalten.
            </p>

            <div className="relative mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(215_20%_45%)]" />
                <input
                  id="access-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code eingeben"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  required
                  className="
                    h-14 w-full rounded-2xl border border-[hsla(215,20%,88%,0.7)]
                    bg-white/60 pl-12 pr-4 text-[15px] text-[hsl(215_80%_15%)]
                    shadow-inner outline-none transition
                    placeholder:text-[hsl(215_20%_45%)]
                    focus:border-[hsl(45_60%_55%)]
                    focus:shadow-[0_0_0_4px_hsla(45,60%,55%,.12)]
                  "
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="
                  h-14 min-w-[160px] rounded-2xl px-8 text-[15px] font-semibold
                  text-[hsl(215_80%_15%)]
                  bg-[linear-gradient(135deg,hsl(45_60%_55%)_0%,hsl(45_60%_50%)_100%)]
                  shadow-[0_12px_28px_-10px_rgba(0,0,0,.28)]
                  transition
                  enabled:hover:scale-[1.04]
                  enabled:hover:shadow-[0_24px_44px_-14px_rgba(0,0,0,.30)]
                  active:scale-[.98]
                  disabled:opacity-60
                "
              >
                {verifying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Prüfe…
                  </span>
                ) : (
                  "Bestätigen"
                )}
              </button>
            </div>

            {error && <p className="relative mt-3 text-sm text-rose-600">{error}</p>}
          </form>

          <div className="relative mt-6 text-center text-sm">
            <div className="mx-auto inline-flex flex-col items-center gap-2 rounded-full border border-[hsla(215,20%,88%,0.7)] bg-white/80 px-6 py-3 backdrop-blur md:flex-row md:gap-6">
              {meta.catalogTitle ? (
                <div className="flex items-center gap-2 text-[hsl(215_20%_45%)]">
                  <span>Katalog:</span>
                  <span className="font-semibold text-[hsl(215_80%_15%)]">{meta.catalogTitle}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative mt-6 text-center text-sm">
            <div className="mx-auto inline-flex flex-col items-center gap-2 rounded-full border border-[hsla(215,20%,88%,0.7)] bg-white/80 px-6 py-3 backdrop-blur md:flex-row md:gap-6">
              {meta.companyName ? (
                <div className="flex items-center gap-2 text-[hsl(215_20%_45%)]">
                  <span>Firma:</span>
                  <span className="font-semibold text-[hsl(215_80%_15%)]">{meta.companyName}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Fallback (sollte wegen Auto-Redirect kaum sichtbar sein)
  return <div className="p-6">Weiterleitung…</div>;
}
