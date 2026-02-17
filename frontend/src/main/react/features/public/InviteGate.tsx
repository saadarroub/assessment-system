// src/features/public/InviteGate.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "@/shared/app/AppHeader";
import patternUrl from "@/assets/footer-pattern.svg";

import {
  fetchInviteMeta,
  verifyInvite,
  type InviteMeta,
  fetchAssignmentByAccessCode,
} from "@/shared/service/inviteService";
import { KeyRound, Loader2 } from "lucide-react";
import ica3logo from "@/assets/ICA3_Logo.jpg";

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
    <div className="relative min-h-screen overflow-hidden bg-gray-200 text-[hsl(215_80%_15%)]">
      {/* Background wie “neuer InviteGate” (Hex + Gold Glow, keine Flecken) */}
      <style>{`
        @keyframes fade-in { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes scale-in { 0%{transform:scale(.96);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes shine { 0%{background-position:200% center} 100%{background-position:-200% center} }

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
        <div className="absolute inset-0 opacity-[0.16] hex-bg fade-top" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(227,187,98,0.22)_0%,rgba(227,187,98,0.10)_25%,rgba(255,255,255,0)_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.10)_78%)]" />
      </div>

      <main className="relative px-5 py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1040px]">
          {/* HERO (gleiches Feeling wie InviteGate) */}
          <div className="text-center [animation:fade-in_.5s_ease-out_both]">
            {/* Framed Logo */}
            <div className="mx-auto inline-flex items-center justify-center">
              <div className="rounded-[30px] bg-gradient-to-br from-white via-white/60 to-[hsla(45,60%,55%,0.25)] p-[1px] shadow-[0_26px_70px_-40px_rgba(15,23,42,0.35)]">
                <div className="rounded-[29px] bg-white/70 backdrop-blur-xl px-6 py-5">
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 px-6 py-4 shadow-sm">
                    <img
                      src={ica3logo}
                      alt="ICA³"
                      className="h-16 md:h-20 w-auto drop-shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="mt-8 text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-br from-[hsl(215_80%_15%)] via-[hsl(215_80%_15%)] to-[hsl(45_60%_55%)] bg-clip-text text-transparent">
                Einladung nicht mehr gültig
              </span>
            </h1>

            <div className="mx-auto mt-4 h-[5px] w-52 rounded-full bg-[linear-gradient(90deg,transparent,hsl(45_60%_55%),transparent)]" />

            <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg text-[hsl(215_20%_45%)]">
              Der Link ist abgelaufen, ungültig oder wurde bereits genutzt. Bitte kontaktieren Sie Ihre Ansprechperson.
            </p>
          </div>

          {/* ERROR CARD (im gleichen Card-Stil wie InviteGate Form) */}
          <section className="mt-10 md:mt-12">
            <div
              className="
                relative overflow-hidden rounded-3xl
                border border-slate-200/70 bg-white/70 backdrop-blur-2xl
                shadow-[0_30px_90px_-55px_rgba(15,23,42,0.45)]
                p-6 md:p-10
                [animation:scale-in_.35s_ease-out_both]
              "
            >
              {/* inner highlight + dezent gold shine */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(227,187,98,0.10),rgba(255,255,255,0),rgba(38,69,85,0.06))]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,hsla(45,60%,55%,.10),transparent)] bg-[length:200%_100%] [animation:shine_3.2s_linear_infinite]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#264555]">
                      Details (für Debug / Support)
                    </div>
                    <div className="mt-1 text-sm text-[hsl(215_20%_45%)]">
                      Bitte Screenshot + Fehlermeldung an Support senden.
                    </div>
                  </div>

                  <span
                    className="
                      inline-flex items-center gap-2 rounded-full
                      bg-white/70 px-3 py-1
                      text-[11px] font-semibold uppercase tracking-[0.16em]
                      border border-slate-200/80 text-slate-400
                    "
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    Info
                  </span>
                </div>

                <div
                  className="
                    mt-5 rounded-2xl
                    border border-slate-200/80 bg-white/80
                    p-4 shadow-inner
                  "
                >
                  <p className="text-sm text-slate-700 break-words">{error}</p>
                </div>

                <div className="mt-6 flex justify-center sm:justify-end">
                  <a
                    href="mailto:kontakt@cap-consulting.de"
                    className="
                      inline-flex items-center justify-center
                      rounded-2xl px-6 py-3 text-sm font-extrabold
                      text-[hsl(215_80%_15%)]
                      bg-[linear-gradient(135deg,#E3BB62_0%,#f1d18a_42%,#E3BB62_100%)]
                      shadow-[0_22px_60px_-30px_rgba(15,23,42,0.35)]
                      transition
                      hover:translate-y-[-1px]
                      hover:shadow-[0_30px_80px_-38px_rgba(15,23,42,0.42)]
                      active:translate-y-[0px]
                    "
                  >
                    Kontakt aufnehmen
                  </a>
                </div>

                <p className="mt-8 text-xs text-slate-400 text-center">
                  ICA³ – Survey Platform · CAP Consulting
                </p>
              </div>
            </div>
          </section>
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
    <div className="relative min-h-screen overflow-hidden bg-gray-200 text-[hsl(215_80%_15%)]">
      {Animations}

      {/* Light Premium Background: subtle hex + clean glow (keine Flecken) */}
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
        {/* base wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-100 to-gray-200" />

        {/* hex pattern – ähnlich wie KatalogThemen, nur cleaner */}
        <div className="absolute inset-0 opacity-[0.16] hex-bg fade-top" />

        {/* gold glow – dezent, premium */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(227,187,98,0.22)_0%,rgba(227,187,98,0.10)_25%,rgba(255,255,255,0)_58%)]" />

        {/* very light vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.10)_78%)]" />
      </div>

      <main className="relative px-5 py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1040px]">
          {/* HERO */}
          <div className="text-center">
            {/* Logo: Premium Frame (ohne Logo zu verändern) */}
            <div className="mx-auto inline-flex items-center justify-center">
              <div className="rounded-[30px] bg-gradient-to-br from-white via-white/60 to-[hsla(45,60%,55%,0.25)] p-[1px] shadow-[0_26px_70px_-40px_rgba(15,23,42,0.35)]">
                <div className="rounded-[29px] bg-white/70 backdrop-blur-xl px-6 py-5">
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 px-6 py-4 shadow-sm">
                    <img
                      src={ica3logo}
                      alt="ICA³"
                      className="h-16 md:h-20 w-auto drop-shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="mt-8 text-4xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-br from-[hsl(215_80%_15%)] via-[hsl(215_80%_15%)] to-[hsl(45_60%_55%)] bg-clip-text text-transparent">
                Assessment Platform
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base md:text-lg text-[hsl(215_20%_45%)]">
              Bewerten Sie Ihre Unternehmensreife in verschiedenen Bereichen durch interaktive Umfragen
              und erhalten Sie detaillierte Analysen.
            </p>

            {/* Modern “chips” – clean & passend */}
            <div className="mx-auto mt-7 flex flex-wrap justify-center gap-3">
              {["Präzise Bewertung", "Detaillierte Analysen", "Wachstumspotenzial", "Sofort einsetzbar"].map((t) => (
                <span
                  key={t}
                  className="
                    inline-flex items-center gap-2 rounded-full
                    border border-slate-200/70 bg-white/70 px-4 py-2
                    text-sm font-semibold text-[hsl(215_80%_15%)]
                    shadow-[0_14px_40px_-28px_rgba(15,23,42,0.25)]
                    backdrop-blur
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* FORM CARD */}
          <section className="mt-10 md:mt-14">
            <form
              onSubmit={onSubmit}
              className="
                relative overflow-hidden rounded-3xl
                border border-slate-200/70 bg-white/70 backdrop-blur-2xl
                shadow-[0_30px_90px_-55px_rgba(15,23,42,0.45)]
                p-6 md:p-10
              "
            >
              {/* inner highlight – clean */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(227,187,98,0.08),rgba(255,255,255,0),rgba(38,69,85,0.06))]" />

              <div className="relative flex items-center gap-3">
                <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-[#E3BB62]/15 ring-1 ring-[#E3BB62]/20 shadow-[0_14px_40px_-26px_rgba(227,187,98,0.55)]">
                  <KeyRound className="h-5 w-5 text-[#b8902f]" />
                </span>

                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-bold">Access-Code eingeben</h2>
                  <p className="mt-1 text-[hsl(215_20%_45%)]">Den Code hast du per E-Mail erhalten.</p>
                </div>
              </div>

              <div className="relative mt-7 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="access-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code eingeben"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    required
                    className="
                      h-14 w-full rounded-2xl
                      border border-slate-200/90 bg-white/80
                      pl-12 pr-4 text-[15px] text-[hsl(215_80%_15%)]
                      outline-none transition shadow-inner
                      placeholder:text-slate-400
                      focus:border-[#E3BB62]/70
                      focus:ring-4 focus:ring-[#E3BB62]/15
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="
                    h-14 min-w-[180px] rounded-2xl px-8 text-[15px] font-extrabold
                    text-[hsl(215_80%_15%)]
                    bg-[linear-gradient(135deg,#E3BB62_0%,#f1d18a_42%,#E3BB62_100%)]
                    shadow-[0_22px_60px_-30px_rgba(15,23,42,0.35)]
                    transition
                    enabled:hover:translate-y-[-2px]
                    enabled:hover:shadow-[0_30px_80px_-38px_rgba(15,23,42,0.42)]
                    enabled:active:translate-y-[0px]
                    disabled:opacity-60 disabled:cursor-not-allowed
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

              {error && (
                <p className="relative mt-4 text-sm font-semibold text-rose-600">
                  {error}
                </p>
              )}

            {(meta.catalogTitle || meta.companyName) && (
  <div className="relative mt-7 mx-auto max-w-3xl">
    <div className="h-1.5 rounded-full bg-[linear-gradient(90deg,transparent,#E3BB62,transparent)] opacity-80" />

    <div
      className="
        mt-3 rounded-2xl border border-slate-200/70 bg-white/75
        px-5 py-5 shadow-sm backdrop-blur
      "
    >
      <div className="grid gap-4 md:grid-cols-2">
        {meta.catalogTitle ? (
          <div className="rounded-xl bg-white/70 ring-1 ring-slate-200/70 p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-500">KATALOG</div>
            <div className="mt-1 font-bold text-[hsl(215_80%_15%)]">{meta.catalogTitle}</div>
          </div>
        ) : null}

        {meta.companyName ? (
          <div className="rounded-xl bg-white/70 ring-1 ring-slate-200/70 p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-500">FIRMA</div>
            <div className="mt-1 font-bold text-[hsl(215_80%_15%)]">{meta.companyName}</div>
          </div>
        ) : null}
      </div>
    </div>
  </div>
)}

            </form>
          </section>
        </div>
      </main>
    </div>
  );
}


  // Fallback (sollte wegen Auto-Redirect kaum sichtbar sein)
  return <div className="p-6">Weiterleitung…</div>;
}
