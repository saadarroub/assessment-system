import { useMemo, useState, useEffect } from "react";
import { Home, BarChart3, Target, PieChart, AlertTriangle } from "lucide-react";
import type { ApiSummaryResponse, UiQuestion } from "@/shared/service/publicAssessmentService";
import confetti from "canvas-confetti";
import ConfirmModal from "@/shared/components/ConfirmModal";
import FancyDatePicker from "@/shared/components/FancyDatePicker";
import SimpleNumberField from "@/shared/components/NumberField";



export type AssessmentResultsProps = {
  topicName?: string;
  onRestart?: () => void;
  onBackToTopics?: () => void;
  onComplete?: () => Promise<void> | void;
  // onChangeAnswer?: (questionId: string, newValue: string) => Promise<void> | void; 
  //  für Bearbeiten
  questionsById?: Record<string, UiQuestion>;
  answerValues?: Record<string, any>;
  onChangeAnswer?: (questionId: string, uiValue: any) => Promise<void> | void;

  // harte Zahlen direkt aus deiner Page:
  answered: number;        // z.B. progress.answered
  total: number;           // z.B. progress.total
  totalScore: number;      // z.B. dein vorhandener Score-Wert
  maxTotalScore: number;   // z.B. dein vorhandener MaxScore-Wert

  completedAt?: string;    // ISO
  overallLevel?: string;   // "niedrig" | "mittel" | "hoch" | ...
  percent?: number;        // falls du pct schon berechnet hast (0..100)
  summary?: ApiSummaryResponse | null;
};

export default function AssessmentResults(props: AssessmentResultsProps) {
  const {
    topicName, onBackToTopics, onComplete, onChangeAnswer, questionsById, answerValues,

    answered, total, totalScore, maxTotalScore,
    completedAt, percent, summary,
  } = props;


  const [editQuestion, setEditQuestion] = useState<UiQuestion | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});

  function toggleAnswer(id: string) {
    setOpenAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const defaults = {
      spread: 80,
      ticks: 90,
      gravity: 1,
      zIndex: 9999,
    };

    // großer Puff in der Mitte (3 Bursts)
    const centerBursts = () => {
      confetti({
        ...defaults,
        startVelocity: 45,
        particleCount: 140,
        origin: { x: 0.5, y: 0.6 },
      });

      confetti({
        ...defaults,
        startVelocity: 40,
        particleCount: 90,
        origin: { x: 0.3, y: 0.55 },
      });

      confetti({
        ...defaults,
        startVelocity: 40,
        particleCount: 90,
        origin: { x: 0.7, y: 0.55 },
      });
    };

    // kurzer „Regen“ von oben
    const duration = 900;
    const animationEnd = Date.now() + duration;

    const topRain = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(topRain);
        return;
      }

      confetti({
        ...defaults,
        startVelocity: 25,
        particleCount: 35,
        gravity: 1.2,
        origin: {
          x: 0.2 + Math.random() * 0.6, // irgendwo über der Mitte
          y: 0,                          // von ganz oben
        },
      });
    }, 200);

    centerBursts();

    // Celebration nach 4s ausblenden (für Ballons)
    const hideTimeout = setTimeout(() => setShowCelebration(false), 4000);

    return () => {
      clearInterval(topRain);
      clearTimeout(hideTimeout);
    };
  }, []);

  function getInitialUiValueForQuestion(
    q: UiQuestion,
    answerValues?: Record<string, any>,
    fallbackAnsweredValue?: any
  ) {
    const raw = answerValues?.[String(q.id)] ?? fallbackAnsweredValue;

    switch (q.type) {
      case "checkbox":
      case "order":
        if (Array.isArray(raw)) return [...raw];
        if (raw === null || raw === undefined || raw === "") return [];
        return [String(raw)];

      case "slider":
      case "number": {
        if (typeof raw === "number") return raw;
        const min = (q as any).min ?? 0;
        const max = (q as any).max ?? 6;
        return Math.floor((min + max) / 2);
      }

      case "radio":
      case "select":
      case "text":
      case "textarea":
      case "date":
      default:
        if (raw === null || raw === undefined) return "";
        if (Array.isArray(raw)) return raw[0] ?? "";
        return String(raw);
    }
  }
  const rows = useMemo(() => {
    if (!summary) return [];

    const answered = summary.answeredQuestions ?? [];

    return answered
      .map(q => ({
        ...q,
        
        isAuto: q.isAutoScored,
      }))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [summary]);
  //  Counts aus summary ableiten 
  const totalFromSummary = summary?.answeredQuestions?.length ?? 0;
  const skippedFromSummary = summary?.uebersprungenAnzahl ?? 0;

  const answeredFromSummary =
    totalFromSummary > 0
      ? Math.max(totalFromSummary - skippedFromSummary, 0)
      : 0;

  // Fallback: wenn summary nicht da ist, nimm die Props
  const effectiveTotal = totalFromSummary || total;
  const effectiveAnswered = totalFromSummary ? answeredFromSummary : answered;

  const overallPct = useMemo(() => {
    if (typeof percent === "number") return Math.max(0, Math.min(100, Math.round(percent)));
    if (maxTotalScore > 0) return Math.round((totalScore / maxTotalScore) * 100);
    if (total > 0) return Math.round((answered / total) * 100);
    return 0;
  }, [percent, totalScore, maxTotalScore, answered, total]);

  const answeredPct = useMemo(() => {
    return effectiveTotal > 0 ? (effectiveAnswered / effectiveTotal) * 100 : 0;
  }, [effectiveAnswered, effectiveTotal]);

  const countRequired = summary?.answeredQuestions?.filter(q => q.isRequired).length ?? 0;
  const countNotRequired = summary?.answeredQuestions?.filter(q => !q.isRequired).length ?? 0;

  function parseIsoDateNoTz(raw: string): Date | undefined {
    if (!raw) return undefined;
    // erwartet "YYYY-MM-DD"
    const y = Number(raw.slice(0, 4));
    const m = Number(raw.slice(5, 7));
    const d = Number(raw.slice(8, 10));
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }

  function toIsoDateNoTz(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return (
    <div
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-[radial-gradient(circle_at_top,_#f9fafb_0%,_#e5e7eb_40%,_#f9fafb_100%)]
      text-slate-900
    "
    >
      <style>{`
      @keyframes stamp-appear {
        0% { transform: rotate(25deg) scale(0) translateY(-100px); opacity: 0; }
        50% { transform: rotate(25deg) scale(1.1) translateY(0); opacity: 1; }
        100% { transform: rotate(25deg) scale(1) translateY(0); opacity: 1; }
      }

      @keyframes balloon-pop {
        0%   { transform: scale(0.2) translateY(20px); opacity: 0; }
        60%  { transform: scale(1.05) translateY(-4px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }

      @keyframes balloon-float-small {
        0%   { transform: translateY(0); }
        100% { transform: translateY(-12px); }
      }
        @keyframes floaty {
    0%   { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.10; }
    50%  { transform: translate3d(0,-18px,0) rotate(4deg); opacity: 0.14; }
    100% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.10; }
  }

  @keyframes drift {
    0%   { transform: translate3d(0,0,0) rotate(0deg); }
    50%  { transform: translate3d(16px, -10px,0) rotate(-3deg); }
    100% { transform: translate3d(0,0,0) rotate(0deg); }
  }

    .hex-bg{
    /* etwas dunkler, damit man es auf hellen Gradients sieht */
    background-image:
      conic-gradient(from 60deg, rgba(38,69,85,0.16) 0 60deg, transparent 0 360deg),
      conic-gradient(from 60deg, rgba(38,69,85,0.10) 0 60deg, transparent 0 360deg);

    /* größere Hexagons wie im Beispiel */
    background-size: 520px 450px;
    background-position: 0 0, 260px 225px;

    /* minimal, nicht “matschig” */
    filter: blur(0.2px);
  }
`}</style>

      {/* Deko nur im Content-Bereich, NICHT hinter dem Footer */}
      <div className="pointer-events-none absolute inset-0">
        {/* Hexagon Pattern (CSS-only) */}
        <div className="absolute inset-0 opacity-[0.14] hex-bg" />

        {/* leichte “Wash” oben */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%)]" />

        {/* Dunklerer blauer Glow unten links */}
        <div className="absolute bottom-10 left-[-6rem] h-[22rem] w-[22rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />

        {/* Pünktchen */}
        <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute left-[26%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
        <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#E3BB62] opacity-70" />
      </div>
      {/*  Ballons – nur zeigen, solange showCelebration true ist */}
      {showCelebration && (
        <div className="pointer-events-none fixed inset-0 z-30 flex justify-center mt-20">
          <div className="relative w-[260px] h-[160px]">
            {/* blauer Ballon links */}
            <div className="absolute left-0 bottom-6 w-10 h-10 rounded-full bg-blue-400 shadow-md animate-[balloon-pop_0.4s_ease-out,balloon-float-small_2s_ease-in-out_0.4s_infinite_alternate]" />

            {/* grüner Ballon rechts */}
            <div className="absolute right-2 bottom-3 w-11 h-11 rounded-full bg-green-400 shadow-md animate-[balloon-pop_0.45s_ease-out_0.05s,balloon-float-small_2.2s_ease-in-out_0.5s_infinite_alternate]" />

            {/* gelbes Konfetti-Blättchen */}
            <div className="absolute left-10 top-4 w-2 h-5 bg-yellow-300 rounded-sm rotate-6 animate-[balloon-pop_0.35s_ease-out_0.1s]" />

            {/* rotes Konfetti-Blättchen */}
            <div className="absolute right-10 top-10 w-2 h-5 bg-red-400 rounded-sm -rotate-12 animate-[balloon-pop_0.35s_ease-out_0.15s]" />
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[1152px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onBackToTopics ? (
            <button
              onClick={onBackToTopics}
              className="
        inline-flex items-center gap-2
        rounded-full
        border border-[#E3BB62]/70
        bg-white/95
        px-4 py-2
        text-sm font-semibold text-[#264555]
        shadow-[0_10px_25px_-15px_rgba(15,23,42,.35)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#E3BB62]
        hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,.45)]
        focus:outline-none focus:ring-2 focus:ring-[#E3BB62]/50
      "
            >
              <Home className="h-4 w-4 text-[#E3BB62]" />
              Zur Übersicht
            </button>
          ) : (
            <a
              href="/"
              className="
        inline-flex items-center gap-2
        rounded-full
        border border-[#E3BB62]/70
        bg-white/95
        px-4 py-2
        text-sm font-semibold text-[#264555]
        shadow-[0_10px_25px_-15px_rgba(15,23,42,.35)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#E3BB62]
        hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,.45)]
        focus:outline-none focus:ring-2 focus:ring-[#E3BB62]/50
      "
            >
              <Home className="h-4 w-4 text-[#E3BB62]" />
              Zur Übersicht
            </a>
          )}
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div
            className="
      relative overflow-hidden
      rounded-2xl
      border border-white/40
      bg-[linear-gradient(100deg,#1b2f5a_0%,#2f5aa8_55%,#3b82f6_100%)]
      px-8 py-8
      shadow-[0_26px_60px_-34px_rgba(15,23,42,.55)]
    "
          >

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[#E3BB62]/80" />

            <div className="relative pr-28">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                Assessment Abgeschlossen!
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/85">
                Übersicht Ihrer Antworten zum Thema{" "}
                <span className="font-semibold text-white">
                  IT-Sicherheit und Penetration Testing
                </span>
              </p>
            </div>
          </div>

          {/*  COMPLETED */}
          <div className="pointer-events-none absolute right-7 -top-1 rotate-12 opacity-100 z-0">
            <div className="relative h-[140px] w-[140px] rounded-full border-[3px] border-[#E3BB62]">
              <div className="absolute inset-[12px] rounded-full border-2 border-dashed border-emerald-300/" />
              <div className="absolute -inset-10 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="absolute left-1/2 top-1/2 w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-2xl border border-[#E3BB62] bg-emerald px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-extrabold tracking-[0.22em] text-white">
                    COMPLETED
                  </span>
                  <span className="pointer-events-none absolute inset-[-8px] rounded-3xl border-[3px] border-[#E3BB62] border-dashed" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Card 1 */}
          <div
            className="
      group relative overflow-hidden
      rounded-2xl border border-slate-200/80 bg-white
      p-6
      shadow-[0_14px_32px_-18px_rgba(15,23,42,.28)]
      transition-all duration-300
      hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-22px_rgba(15,23,42,.36)]
    "
          >
            {/* Gold Accent oben */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#E3BB62]/80" />
            {/* leichte “Sheen” */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
      bg-[radial-gradient(circle_at_20%_0%,rgba(227,187,98,0.18)_0%,transparent_45%)]"
            />

            <div className="relative flex items-center gap-3 mb-3">
              <div className="rounded-xl p-2.5 bg-indigo-50 border border-indigo-100">
                <BarChart3 className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Bearbeitungsstand</h3>
            </div>

            <div className="relative text-2xl font-extrabold tracking-tight text-indigo-700">
              Auf der Zielgeraden
            </div>

            <div className="relative mt-2 text-xs text-slate-500">
              Status Ihres Assessments
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="
      group relative overflow-hidden
      rounded-2xl border border-slate-200/80 bg-white
      p-6
      shadow-[0_14px_32px_-18px_rgba(15,23,42,.28)]
      transition-all duration-300
      hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-22px_rgba(15,23,42,.36)]
    "
          >
            {/* Blue Accent oben */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-sky-500/70" />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
      bg-[radial-gradient(circle_at_25%_0%,rgba(14,165,233,0.18)_0%,transparent_45%)]"
            />

            <div className="relative flex items-center gap-3 mb-3">
              <div className="rounded-xl p-2.5 bg-sky-50 border border-sky-100">
                <Target className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Beantwortete Fragen</h3>
            </div>

            <div className="relative flex items-end justify-between gap-4 mb-3">
              <div className="text-2xl font-extrabold tracking-tight text-sky-700">
                {effectiveAnswered}/{effectiveTotal}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {Math.round(answeredPct)}%
              </div>
            </div>

            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out
          bg-[linear-gradient(90deg,#38bdf8_0%,#1d4ed8_100%)]"
                style={{ width: `${answeredPct}%` }}
              />
            </div>

            <div className="relative mt-2 text-xs text-slate-500">
              Fortschritt Ihrer Antworten
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="
      group relative overflow-hidden
      rounded-2xl border border-slate-200/80 bg-white
      p-6
      shadow-[0_14px_32px_-18px_rgba(15,23,42,.28)]
      transition-all duration-300
      hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-22px_rgba(15,23,42,.36)]
    "
          >
            {/* Neutral Accent oben */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#264555]/40" />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
      bg-[radial-gradient(circle_at_20%_0%,rgba(38,69,85,0.14)_0%,transparent_45%)]"
            />

            <div className="relative flex items-center gap-3 mb-3">
              <div className="rounded-xl p-2.5 bg-blue-50 border border-blue-100">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Abgeschlossen am</h3>
            </div>

            <div className="relative text-[18px] font-semibold text-[#264555]">
              {completedAt
                ? new Date(completedAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "—"}
            </div>

            <div className="relative mt-2 text-xs text-slate-500">
              Zeitpunkt des Abschlusses
            </div>
          </div>
        </div>

        {/* Kleine /summary-Box */}
        {summary && (
          <section className="mb-10">
            {/* OUTER WRAP */}
            <div className="relative rounded-[28px] border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-[0_22px_60px_-38px_rgba(15,23,42,.45)] overflow-hidden">
              {/* gold top accent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[#E3BB62]/85" />

              {/* HEADER */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Zusammenfassung Ihres Assessments
                      </h3>
                      <p className="text-xs text-slate-500">
                        Thema:{" "}
                        <span className="font-medium text-slate-700">
                          {summary.themaName}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* CHIPS */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {countRequired} Pflichtfragen
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 text-amber-800 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {countNotRequired} Optionale Fragen
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      {summary.uebersprungenAnzahl} übersprungen
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLE AREA */}
              {rows.length > 0 && (
                <div className="border-t border-slate-200/70">
                  <div className="px-4 pb-5">
                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          {/* THEAD */}
                          <thead className="bg-slate-50/80 border-b border-slate-200/70">
                            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                              <th className="py-3.5 pl-5 pr-4 font-semibold w-[46%]">Frage</th>
                              <th className="py-3.5 px-4 font-semibold w-[32%]">Antwort</th>
                              <th className="py-3.5 px-4 font-semibold w-[12%]">Required</th>
                              <th className="py-3.5 pr-5 pl-4 font-semibold text-right w-[10%]">Aktion</th>
                            </tr>
                          </thead>

                          {/* TBODY */}
                          <tbody className="[&>tr]:border-b [&>tr]:border-slate-100 last:[&>tr]:border-b-0">
                            {rows.map((q, idx) => {
                              const raw: unknown = q.answeredValue;

                              let answeredValue: string;
                              if (q.isSkipped || raw === "" || raw == null) {
                                answeredValue = "übersprungen";
                              } else if (
                                q.inputType === "ordering" ||
                                q.questionTypeName === "Ordering"
                              ) {
                                if (Array.isArray(raw)) {
                                  const first = raw[0];
                                  if (Array.isArray(first)) {
                                    const last = raw[raw.length - 1];
                                    answeredValue = Array.isArray(last)
                                      ? (last as unknown[]).map(String).join(", ")
                                      : "übersprungen";
                                  } else {
                                    answeredValue = (raw as unknown[]).map(String).join(", ");
                                  }
                                } else {
                                  answeredValue = String(raw);
                                }
                              } else if (Array.isArray(raw)) {
                                answeredValue = (raw as unknown[]).map(String).join(", ");
                              } else {
                                answeredValue = String(raw);
                              }

                              const isSkipped = q.isSkipped || answeredValue === "übersprungen";

                              return (
                                <tr
                                  key={q.questionId}
                                  className={[
                                    "group transition",
                                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                                    "hover:bg-[#FFFAEB]/40",
                                  ].join(" ")}
                                >
                                  {/* Frage */}
                                  <td className="py-4 pl-5 pr-4 align-top">
                                    <div className="flex items-start gap-3">
                                      <span className="mt-2 h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                                      <div className="min-w-0">
                                        <div className="font-semibold text-slate-900 leading-5">
                                          {q.questionText}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Antwort (clean, normal) */}
                                  <td className="py-4 px-4 align-top">
                                    {(() => {
                                      const id = String(q.questionId);
                                      const expanded = !!openAnswers[id];
                                      const isLong = !isSkipped && answeredValue.length > 90;

                                      return (
                                        <div className="max-w-[560px]">
                                          <div className={isSkipped ? "text-slate-500" : "text-slate-700"}>
                                            <div
                                              className={[
                                                "text-sm leading-6 whitespace-pre-wrap break-words",
                                                !expanded && isLong ? "line-clamp-2" : "",
                                              ].join(" ")}
                                              title={answeredValue}
                                            >
                                              {answeredValue}
                                            </div>
                                          </div>

                                          {isLong && (
                                            <button
                                              type="button"
                                              onClick={() => toggleAnswer(id)}
                                              className="
              mt-2 inline-flex items-center gap-2
              text-xs font-semibold text-sky-700
              hover:text-sky-800 hover:underline
              focus:outline-none focus:ring-2 focus:ring-sky-200 rounded
            "
                                              aria-expanded={expanded}
                                            >
                                              {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </td>


                                  {/* Required */}
                                  <td className="py-4 px-4 align-top">
                                    <span
                                      className={[
                                        "inline-flex items-center gap-2",
                                        "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                                        "border",
                                        q.isRequired
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                          : "bg-amber-50 text-amber-800 border-amber-100",
                                      ].join(" ")}
                                    >
                                      <span
                                        className={[
                                          "h-1.5 w-1.5 rounded-full",
                                          q.isRequired ? "bg-emerald-500" : "bg-amber-500",
                                        ].join(" ")}
                                      />
                                      {q.isRequired ? "Ja" : "Nein"}
                                    </span>
                                  </td>

                                  {/* Aktion */}
                                  <td className="py-4 pr-5 pl-4 align-top text-right">
                                    <button
                                      type="button"
                                      className="
                                inline-flex items-center justify-center
                                rounded-full
                                border border-slate-200
                                bg-white
                                px-3 py-1.5
                                text-xs font-semibold text-sky-700
                                shadow-sm
                                transition-all
                                hover:border-sky-200 hover:bg-sky-50
                                hover:-translate-y-[1px]
                                focus:outline-none focus:ring-2 focus:ring-sky-200
                              "
                                      onClick={() => {
                                        if (!questionsById) return;
                                        const qMeta = questionsById[String(q.questionId)];
                                        if (!qMeta) return;

                                        const fallbackValue = Array.isArray(q.answeredValue)
                                          ? q.answeredValue
                                          : q.answeredValue;

                                        const initial = getInitialUiValueForQuestion(
                                          qMeta,
                                          answerValues,
                                          fallbackValue
                                        );

                                        setEditQuestion(qMeta);
                                        setEditValue(initial);
                                        setEditError(null);
                                      }}
                                    >
                                      Bearbeiten
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}


        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">

          {/*  Abschließen -> completeSession */}
          {onComplete && (
            <button
              //onClick={onComplete}
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
              style={{
                background: "hsl(40,60%,63%)",           // Gelb wie Users/Zuweisungen
                color: "hsl(200,32%,22%)",               // dunkles Blau-Grau
                boxShadow: "0 1px 2px rgba(0,0,0,.05)"
              }}
              aria-label="New Company"
            >
              Ab­schließen
            </button>
          )}

        </div>
      </div>
      {/*  Bearbeiten-Modal  */}
      {editQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl px-4 sm:px-0">
            {/* OBERER CARD-BLOCK – nur Inhalt */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* gleiche Glows wie beim Abschluss-Dialog */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  Frage bearbeiten
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  {editQuestion.text}
                </p>

                {/*  alle deine Eingabetypen – unverändert übernommen */}
                {editQuestion.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editQuestion.options.map((opt: string) => {
                      const checked = editValue === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition bg-white
                      ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                            }`}
                        >
                          <input
                            type="radio"
                            name={`edit-q-${editQuestion.id}`}
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
                            checked={checked}
                            onChange={() => setEditValue(opt)}
                          />
                          <span className="text-[15px] text-[#333]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {editQuestion.type === "checkbox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editQuestion.options.map((opt: string) => {
                      const list: string[] = Array.isArray(editValue)
                        ? editValue
                        : [];
                      const checked = list.includes(opt);

                      const toggle = () => {
                        const next = [...list];
                        const idx = next.indexOf(opt);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(opt);
                        setEditValue(next);
                      };

                      return (
                        <label
                          key={opt}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition bg-white
                      ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
                            checked={checked}
                            onChange={toggle}
                          />
                          <span className="text-[15px] text-[#333]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {editQuestion.type === "slider" && (
                  <div className="py-4">
                    <input
                      type="range"
                      min={(editQuestion as any).min ?? 0}
                      max={(editQuestion as any).max ?? 6}
                      value={
                        typeof editValue === "number"
                          ? editValue
                          : getInitialUiValueForQuestion(editQuestion, answerValues)
                      }
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="w-full h-2 rounded bg-[#ebebec] outline-none
                  [accent-color:#56768f]
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#56768f]
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[#56768f] [&::-moz-range-thumb]:border-0"
                    />
                    <div className="text-center text-[18px] font-semibold text-[#56768f] mt-2">
                      {String(editValue)}
                    </div>
                    {(editQuestion as any).labels && (
                      <div className="flex justify-between mt-2 text-sm text-[#666]">
                        <span>{(editQuestion as any).labels[0]}</span>
                        <span>{(editQuestion as any).labels[1]}</span>
                      </div>
                    )}
                  </div>
                )}

                {editQuestion.type === "textarea" && (
                  <textarea
                    className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg text-[15px] resize-y outline-none focus:border-blue-500"
                    value={editValue ?? ""}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                )}

                {editQuestion.type === "text" && (
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    value={editValue ?? ""}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                )}

                {editQuestion.type === "select" && (
                  <select
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500 bg-white"
                    value={editValue ?? ""}
                    onChange={(e) => setEditValue(e.target.value)}
                  >
                    <option value="" disabled>
                      Bitte auswählen …
                    </option>
                    {editQuestion.options.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {editQuestion.type === "number" && (
                  <SimpleNumberField
                    value={typeof editValue === "number" || editValue === "" ? editValue : (editValue ? Number(editValue) : "")}
                    min={(editQuestion as any).min}
                    max={(editQuestion as any).max}
                    step={(editQuestion as any).step ?? 1}
                    placeholder="z.B. 1980"
                    onChange={(v) => setEditValue(v)}
                  />
                )}


                {editQuestion.type === "date" && (() => {
                  const raw = typeof editValue === "string" ? editValue : "";
                  const dateValue = parseIsoDateNoTz(raw);

                  return (
                    <FancyDatePicker
                      minYear={1850}
                      maxYear={new Date().getFullYear()}
                      value={dateValue}
                      onChange={(d) => setEditValue(d ? toIsoDateNoTz(d) : "")}
                      placeholder="TT.MM.JJJJ"
                    />
                  );
                })()}

                {editQuestion.type === "order" && (() => {
                  const baseRaw = (editQuestion as any).options;

                  const options: string[] =
                    typeof baseRaw === "string"
                      ? (() => { try { return JSON.parse(baseRaw); } catch { return []; } })()
                      : Array.isArray(baseRaw)
                        ? baseRaw
                        : [];

                  return (
                    <OrderQuestionModal
                      options={options}
                      value={editValue ?? (editQuestion as any).answeredValue}
                      onChange={(val) => setEditValue(val)}
                    />
                  );
                })()}

                {editError && (
                  <p className="mt-3 text-xs text-red-600">{editError}</p>
                )}
              </div>
            </div>

            {/* KLEINER ABSTAND – wie beim Abschluss-Dialog */}
            <div className="h-3" />

            {/* UNTERE BUTTON-LEISTE – 1:1 wie beim Abschluss-Dialog, nur mit 'Speichern' */}
            <div className="mt-1 flex gap-2">
              {/* Abbrechen */}
              <button
                type="button"
                onClick={() => !savingEdit && setEditQuestion(null)}
                disabled={savingEdit}
                className="
            flex-1
            h-12
            text-sm font-medium
            text-slate-800
            bg-[#f3f3f3]
            hover:bg-[#e5e5e5]
            border border-slate-200
            rounded-xl
          "
              >
                Abbrechen
              </button>

              {/* Speichern */}
              <button
                type="button"
                disabled={savingEdit || !onChangeAnswer}
                onClick={async () => {
                  if (!editQuestion || !onChangeAnswer) return;
                  try {
                    setSavingEdit(true);
                    setEditError(null);
                    const payload =
                      editQuestion.type === "order"
                        ? normalizeOrderValue(editValue)
                        : editValue;

                    await onChangeAnswer(String(editQuestion.id), payload);
                    setEditQuestion(null);
                  } catch (e) {
                    console.error(e);
                    setEditError(
                      "Konnte die Antwort nicht speichern. Bitte versuchen Sie es erneut."
                    );
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                className="
            flex-1
            h-12
            text-sm font-semibold
            rounded-xl
            bg-[#E3BB62]
            text-[#264555]
            hover:bg-[#d8ac55]
            disabled:opacity-60
            shadow-[0_10px_30px_rgba(0,0,0,0.18)]
            transition
            hover:-translate-y-[1px]
          "
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirmModal}
        title="Assessment endgültig abschließen?"
        description={
          <>
            Bitte bestätigen Sie, dass Sie dieses Assessment endgültig
            abschließen möchten.
          </>
        }
        hintTitle="Hinweis"
        hintText={
          <>
            Nach dem endgültigen Abschluss können die gegebenen Antworten{" "}
            <span className="font-semibold text-sky-700">
              nicht mehr geändert
            </span>{" "}
            werden.
          </>
        }
        cancelLabel="Abbrechen"
        confirmLabel="Ja, endgültig abschließen"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          setShowConfirmModal(false);

          try {
            await Promise.resolve(onComplete?.());
          } catch (e) {
            console.error(e);
          }
        }}

      />


    </div>
  );
}
import {
  DndContext,
  closestCorners,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";


export function normalizeOrderValue(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const first = raw[0];

  // Historie: string[][]
  if (Array.isArray(first)) {
    const last = raw[raw.length - 1];
    return Array.isArray(last) ? (last as unknown[]).map(String) : [];
  }

  // normal: string[]
  return (raw as unknown[]).map(String);
}

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function OrderItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "flex items-center gap-4 p-4",
        "rounded-xl border bg-white",
        "shadow-[0_8px_22px_rgba(15,23,42,0.08)]",
        "border-[#e5e7eb]",
        "transition-all duration-150 ease-out",
        isDragging ? "opacity-70" : "hover:border-[#E3BB62] hover:bg-[#FFFAEB] hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(15,23,42,0.16)]",
      ].join(" ")}
    >
      {/* DRAG HANDLE LINKS */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#9ca3af] shrink-0"
        aria-label="Ziehen"
      >
        <GripVertical size={22} />
      </div>

      {/* LABEL */}
      <span className="text-gray-800 text-sm font-medium">{label}</span>
    </div>
  );
}

export function OrderQuestionModal({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: unknown; // kann string[] oder string[][]
  onChange: (val: string[]) => void;
}) {
  const initial = useMemo(() => {
    const normalized = normalizeOrderValue(value);
    return normalized.length ? normalized : options;
  }, [value, options]);

  const [items, setItems] = useState<string[]>(initial);

  // wenn Modal geöffnet wird / value sich ändert -> syncen
  useEffect(() => {
    const next = normalizeOrderValue(value);
    setItems(next.length ? next : options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value), JSON.stringify(options)]);

  // nach oben melden
  useEffect(() => {
    onChange(items);
  }, [items, onChange]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 mt-4">
          {items.map((opt) => (
            <OrderItem key={opt} id={opt} label={opt} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}