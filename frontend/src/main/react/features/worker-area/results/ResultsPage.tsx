import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import {
  getManualScoringView,
  updateManualScore,
  getQuestionsTimeline,
} from "@/api/scoringApi";
import type { SessionQuestionsTimeline } from "@/api/scoringApi";

import {
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  FileText,
  Network,
  Save,
  User,
  Calendar,
  BookOpen,
} from "lucide-react";

// ---- Types ----
interface Question {
  id: number;
  inputType: string;
  question: string;
  answer: string | number | object | null;
  score: number | null;
  questionId?: string;
  maxScore?: number;
  status?: "automatic" | "manual" | "skipped" | "not_scorable";
}

// HSL-Token-Fallbacks (wie in deiner UserList)
const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
  primary: "hsl(var(--primary,205 35% 24%))",
  primaryFg: "hsl(var(--primary-foreground,0 0% 98%))",
  muted: "hsl(var(--muted,210 40% 97%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

// Helper: Get input type display name
const getTypeDisplayName = (inputType: string) => {
  const typeMap: Record<string, string> = {
    text: "Freitext",
    number: "Zahl",
    date: "Datum",
    radio: "Single-Choice",
    checkbox: "Multi-Choice",
    select: "Dropdown",
    range: "Bewertung",
    order: "Sortierung",
  };
  return typeMap[inputType?.toLowerCase()] || inputType || "-";
};

// Helper: Format answer for display
const formatAnswer = (answer: string | number | object | null): string => {
  if (answer === null || answer === undefined) return "-";
  if (typeof answer === "string") return answer || "-";
  if (typeof answer === "number") return String(answer);
  if (Array.isArray(answer)) return answer.join(", ");
  return JSON.stringify(answer);
};

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [timelineQuestions, setTimelineQuestions] = useState<Question[]>([]);
  const [manualQuestions, setManualQuestions] = useState<Question[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionQuestionsTimeline | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to fetch/refresh data (LOGIK BLEIBT 1:1)
  const fetchData = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);

      const [timelineData, manualScoringData] = await Promise.all([
        getQuestionsTimeline(sessionId),
        getManualScoringView(sessionId),
      ]);

      setSessionInfo(timelineData);

      // Map timeline data (ALL questions) - use status from backend
      const timeline = (timelineData.questions || []).map((q, idx) => ({
        id: idx,
        inputType: q.inputType,
        question: q.questionText,
        answer: q.answeredValue,
        score: q.score,
        questionId: q.questionId,
        maxScore: q.maxScore,
        status: q.status, // "automatic", "manual", "skipped", "not_scorable"
      }));

      // Map manual scoring data (nur Fragen die tatsächlich manuell bewertet werden müssen)
      const manual = (manualScoringData.manuellZuBewertendeFragen || []).map((q, idx) => ({
        id: 1000 + idx,
        inputType: q.inputType,
        question: q.questionText,
        answer: q.answeredValue,
        score: q.score,
        questionId: q.questionId,
        maxScore: q.maxScore,
        status: "manual" as const,
      }));

      setTimelineQuestions(timeline);
      setManualQuestions(manual);
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err?.response?.data?.message || err?.message || "Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const openCount = useMemo(
    () => manualQuestions.filter((q) => q.score === null || q.score === 0).length,
    [manualQuestions]
  );

  const overallScore = useMemo(() => {
    if (!sessionInfo) return 0;
    return Math.round(sessionInfo.percentageScore || 0);
  }, [sessionInfo]);

  const canSave = useMemo(() => {
    return manualQuestions.length > 0 && manualQuestions.every((q) => q.score !== null && q.score > 0);
  }, [manualQuestions]);

  const handleScoreChange = (id: number, val: string) => {
    const numVal = val === "" ? null : Math.min(6, Math.max(0, Number(val)));
    setManualQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, score: numVal } : q)));
    setIsSaved(false);
  };

  const onSave = async () => {
    if (!canSave) {
      alert("Bitte bewerte alle Fragen bevor du speicherst.");
      return;
    }
    if (!sessionId) return;

    setIsSaving(true);
    try {
      // Nur Fragen mit Score > 0 speichern
      for (const q of manualQuestions) {
        if (q.questionId && q.score !== null && q.score > 0) {
          await updateManualScore(sessionId, q.questionId, q.score);
        }
      }
      setIsSaved(true);
      setSuccessMessage(`${manualQuestions.length} Bewertungen erfolgreich gespeichert!`);
      await fetchData();

      setTimeout(() => {
        setIsSaved(false);
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to save scores:", err);
      alert("Fehler beim Speichern der Bewertungen");
    } finally {
      setIsSaving(false);
    }
  };

  // ====== Loading / Error (nur optisch CAP-Style) ======
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-300 border-r-transparent" />
            <p className="mt-4 text-sm" style={{ color: BRAND.gray }}>
              Lade Daten…
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[70vh] px-6">
          <div
            className="w-full max-w-[720px] rounded-2xl border px-6 py-6 shadow-[0_10px_28px_rgba(0,0,0,0.08)] bg-white"
            style={{ borderColor: BRAND.sand }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)", color: "rgb(185,28,28)" }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: BRAND.navy }}>
                  Fehler beim Laden
                </p>
                <p className="text-sm mt-0.5" style={{ color: BRAND.gray }}>
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
              style={{
                background: BRAND.gold,
                color: BRAND.navy,
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <ArrowLeft size={16} />
              Zurück
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ====== UI ======
  const bannerIsDone = manualQuestions.length === 0 || openCount === 0;

  return (
    <AdminLayout>
      {/* HERO Header (wie Code 2) */}
      <PageHeader
        title="Manuelle Bewertung & Report"
        subtitle="Bewerte offene Antworten und exportiere den Bericht als PDF"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern
        center={false}
      />

      {/* Hintergrund unterhalb des Headers (wie Code 2) */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-10 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/* Top-Bar: Breadcrumb + Actions (CAP-Style wie Code 2) */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between gap-3">
          <nav className="flex items-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                text-xs sm:text-sm
                bg-white/80
                backdrop-blur-[2px]
              "
              style={{ borderColor: BRAND.sand }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                >
                  <ArrowLeft size={14} />
                </span>
                Zurück
              </button>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
                Admin Panel
              </Link>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Results
              </span>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("PDF Export kommt bald")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
              style={{
                background: BRAND.gold,
                color: BRAND.navy,
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Session Info Card (optisch wie Code 2 Cards) */}
        {sessionInfo && (
          <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-5">
            <div
              className="
                rounded-[18px] border
                px-5 py-5
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: BRAND.sand }}
            >
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: BRAND.gray }}>
                      Bewerter
                    </p>
                    <p className="font-semibold" style={{ color: BRAND.navy }}>
                      {sessionInfo.workerName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: BRAND.gray }}>
                      Thema
                    </p>
                    <p className="font-semibold" style={{ color: BRAND.navy }}>
                      {sessionInfo.themaName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[170px]">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: BRAND.gray }}>
                      Status
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background:
                          sessionInfo.status === "completed"
                            ? "rgba(34,197,94,0.14)"
                            : "rgba(227,187,98,0.22)",
                        color: sessionInfo.status === "completed" ? "rgb(22,101,52)" : BRAND.navy,
                        border: `1px solid ${
                          sessionInfo.status === "completed"
                            ? "rgba(34,197,94,0.22)"
                            : "rgba(227,187,98,0.28)"
                        }`,
                      }}
                    >
                      {sessionInfo.status === "completed" ? "Abgeschlossen" : sessionInfo.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[120px]">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: BRAND.gray }}>
                      Fragen
                    </p>
                    <p className="font-semibold" style={{ color: BRAND.navy }}>
                      {sessionInfo.totalQuestions || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* kleine Linie wie “sauberer Block” */}
              <div
                className="mt-4 h-px w-full"
                style={{
                  background:
                    "linear-gradient(to right, rgba(210,201,185,0.9), rgba(210,201,185,0.25), transparent)",
                }}
              />
            </div>
          </div>
        )}

        {/* Success Message (CAP-Card Look) */}
        {successMessage && (
          <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4">
            <div
              className="rounded-[18px] border px-5 py-4 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center gap-3"
              style={{ borderColor: "rgba(34,197,94,0.40)" }}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.14)", color: "rgb(22,101,52)" }}
              >
                <CheckSquare size={18} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "rgb(22,101,52)" }}>
                  {successMessage}
                </p>
                <p className="text-xs mt-0.5" style={{ color: BRAND.gray }}>
                  Die Timeline und der Gesamtscore wurden aktualisiert.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info-Leiste (wie Code 2) */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-5
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: bannerIsDone ? "rgba(34,197,94,0.45)" : BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: bannerIsDone ? "rgba(34,197,94,0.14)" : "rgba(38,69,85,0.06)",
                  color: bannerIsDone ? "rgb(22,101,52)" : BRAND.navy,
                }}
              >
                {bannerIsDone ? <CheckSquare size={18} /> : <AlertTriangle size={18} />}
              </div>

              <div>
                <div className="text-sm font-semibold" style={{ color: CSS.fg }}>
                  {manualQuestions.length === 0
                    ? "Keine manuellen Bewertungen erforderlich"
                    : openCount === 0
                      ? "Alle manuellen Bewertungen abgeschlossen"
                      : "Offene Bewertungen"}
                </div>
                <div className="text-xs" style={{ color: CSS.mutedFg }}>
                  {manualQuestions.length === 0
                    ? "Alle Fragen wurden bereits bewertet."
                    : openCount === 0
                      ? `Alle ${manualQuestions.length} manuellen Fragen wurden bewertet.`
                      : "Bitte bewerte die offenen Fragen (0–6) und speichere die Bewertungen."}
                </div>
              </div>
            </div>

            {manualQuestions.length > 0 && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm font-medium"
                style={{ background: BRAND.navy, color: "white" }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                <span>
                  <span className="font-semibold">{openCount}</span> Offen
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid (wie Code 2): 2 Spalten + Sidebar */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT / MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manuelle Bewertung Card */}
            <section
              className="
                rounded-[12px] border overflow-hidden
                shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
              "
              style={{ borderColor: CSS.border, background: BRAND.fog }}
            >
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                }}
              >
                <h2 className="font-semibold flex items-center gap-2" style={{ color: BRAND.navy }}>
                  {bannerIsDone ? <CheckSquare size={18} style={{ color: "rgb(22,101,52)" }} /> : <AlertTriangle size={18} />}
                  Manuelle Bewertung
                </h2>

                {manualQuestions.length > 0 && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{
                      background: bannerIsDone ? "rgba(34,197,94,0.14)" : "rgba(227,187,98,0.22)",
                      color: bannerIsDone ? "rgb(22,101,52)" : BRAND.navy,
                      border: `1px solid ${bannerIsDone ? "rgba(34,197,94,0.25)" : "rgba(227,187,98,0.28)"}`,
                    }}
                  >
                    {bannerIsDone ? "✓ Alles bewertet" : `${openCount} Offen`}
                  </span>
                )}
              </div>

              <div className="p-6 bg-white">
                {manualQuestions.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckSquare size={42} className="mx-auto mb-3" style={{ color: "rgb(34,197,94)" }} />
                    <p className="font-semibold" style={{ color: BRAND.navy }}>
                      Keine manuellen Bewertungen erforderlich
                    </p>
                    <p className="text-sm mt-1" style={{ color: BRAND.gray }}>
                      Alle Fragen wurden bewertet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {manualQuestions.map((q) => {
                      const isScored = q.score !== null && q.score > 0;

                      return (
                        <div
                          key={q.id}
                          className="border-b last:border-0 pb-5 last:pb-0"
                          style={{ borderColor: BRAND.sand }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-xs rounded-full px-2 py-0.5 font-semibold"
                              style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                            >
                              {getTypeDisplayName(q.inputType)}
                            </span>

                            {isScored ? (
                              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "rgb(22,101,52)" }}>
                                <CheckSquare size={12} />
                                Bewertet
                              </span>
                            ) : (
                              <span className="text-xs font-semibold" style={{ color: "rgb(185,28,28)" }}>
                                Nicht bewertet
                              </span>
                            )}
                          </div>

                          <p className="font-semibold mb-2" style={{ color: BRAND.navy }}>
                            {q.question}
                          </p>

                          <div
                            className="p-3 rounded mb-3 text-sm italic border-l-4"
                            style={{
                              background: "rgba(38,69,85,0.04)",
                              borderLeftColor: BRAND.sand,
                              color: BRAND.steel,
                            }}
                          >
                            „{formatAnswer(q.answer)}“
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-medium" style={{ color: BRAND.navy }}>
                              Score (0–6):
                            </label>

                            <input
                              type="number"
                              min="0"
                              max="6"
                              step="1"
                              className="
                                w-20 h-10
                                rounded-full border px-3
                                text-center font-extrabold
                                outline-none transition bg-white
                              "
                              style={{
                                borderColor: BRAND.sand,
                                color: BRAND.navy,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                              }}
                              value={q.score === null || q.score === 0 ? "" : q.score}
                              placeholder="-"
                              onChange={(e) => handleScoreChange(q.id, e.target.value)}
                              onFocus={(e) => {
                                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(227,187,98,0.75)";
                                e.currentTarget.style.borderColor = BRAND.gold;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                                e.currentTarget.style.borderColor = BRAND.sand;
                              }}
                            />

                            <span className="text-sm" style={{ color: BRAND.gray }}>
                              / {q.maxScore || 6}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Save Button (Logik bleibt 1:1) */}
                    <div className="pt-4 border-t" style={{ borderColor: BRAND.sand }}>
                      <button
                        onClick={() => void onSave()}
                        disabled={!canSave || isSaving}
                        className="
                          w-full inline-flex items-center justify-center gap-2
                          rounded-full px-6 py-3 text-sm font-semibold
                          transition disabled:opacity-50 disabled:cursor-not-allowed
                          hover:-translate-y-[1px]
                        "
                        style={{
                          background: canSave ? BRAND.navy : "rgba(38,69,85,0.35)",
                          color: "white",
                          boxShadow: canSave ? "0 10px 22px rgba(0,0,0,0.10)" : "none",
                        }}
                      >
                        <Save size={18} />
                        {isSaving ? "Speichern…" : isSaved ? "✓ Gespeichert" : `Alle ${openCount} Bewertungen speichern`}
                      </button>

                      {!canSave && openCount > 0 && (
                        <p className="text-xs text-center mt-2" style={{ color: "rgb(185,28,28)" }}>
                          Bitte alle {openCount} offenen Fragen bewerten.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Timeline Section (CAP-Table Card wie Code 2) */}
            <section
              className="
                rounded-[12px] border overflow-hidden
                shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
              "
              style={{ borderColor: CSS.border, background: BRAND.fog }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                }}
              >
                <h2 className="font-semibold" style={{ color: BRAND.navy }}>
                  Alle Antworten <span className="opacity-60">(Timeline)</span>
                </h2>
              </div>

              <div className="bg-white px-4 sm:px-6 py-6">
                <div
                  className="
                    mx-auto w-full
                    rounded-2xl border overflow-hidden
                    shadow-[0_10px_24px_rgba(0,0,0,0.06)]
                  "
                  style={{
                    borderColor: BRAND.sand,
                    background: "linear-gradient(to bottom, #ffffff, #fbfbfb)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead
                        className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                        style={{
                          background: "linear-gradient(to right, #f1f2f4, #ffffff)",
                          borderBottom: `1px solid ${CSS.border}`,
                          color: BRAND.navy,
                        }}
                      >
                        <tr>
                          <th className="px-5 py-3 text-[0.82rem]" style={{ color: CSS.fg }}>
                            Frage
                          </th>
                          <th className="px-5 py-3 text-[0.82rem]" style={{ color: CSS.fg }}>
                            Typ
                          </th>
                          <th className="px-5 py-3 text-[0.82rem]" style={{ color: CSS.fg }}>
                            Antwort
                          </th>
                          <th className="px-5 py-3 text-[0.82rem] text-right" style={{ color: CSS.fg }}>
                            Score
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {timelineQuestions.map((q) => (
                          <tr
                            key={q.id}
                            className="bg-white transition hover:bg-[#fff9ec]"
                            style={{ borderTop: `1px solid ${CSS.border}` }}
                          >
                            <td className="px-5 py-4 align-top">
                              <div className="font-semibold" style={{ color: BRAND.navy }}>
                                {q.question}
                              </div>
                            </td>

                            <td className="px-5 py-4 align-top">
                              <span
                                className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy, border: `1px solid rgba(38,69,85,0.10)` }}
                              >
                                {getTypeDisplayName(q.inputType)}
                              </span>
                            </td>

                            <td className="px-5 py-4 align-top">
                              <span className="text-sm" style={{ color: BRAND.steel }}>
                                {formatAnswer(q.answer)}
                              </span>
                            </td>

                            <td className="px-5 py-4 align-top text-right">
                              {q.status === "manual" ? (
                                q.score !== null && q.score > 0 ? (
                                  <span
                                    className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-extrabold"
                                    style={{
                                      background: "rgba(34,197,94,0.14)",
                                      color: "rgb(22,101,52)",
                                      border: "1px solid rgba(34,197,94,0.22)",
                                      minWidth: 84,
                                    }}
                                  >
                                    {q.score} / {q.maxScore || 6}
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{
                                      background: "rgba(239,68,68,0.10)",
                                      color: "rgb(185,28,28)",
                                      border: "1px solid rgba(239,68,68,0.18)",
                                    }}
                                  >
                                    Manueller Score erforderlich
                                  </span>
                                )
                              ) : q.status === "automatic" ? (
                                <span
                                  className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-extrabold"
                                  style={{
                                    background: "rgba(227,187,98,0.22)",
                                    color: BRAND.navy,
                                    border: "1px solid rgba(227,187,98,0.30)",
                                    minWidth: 84,
                                  }}
                                >
                                  {q.score ?? 0} / {q.maxScore}
                                </span>
                              ) : q.status === "skipped" ? (
                                <span className="text-xs italic" style={{ color: BRAND.gray }}>
                                  übersprungen
                                </span>
                              ) : (
                                <span className="text-xs italic" style={{ color: BRAND.gray }}>
                                  nicht bewertbar
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {timelineQuestions.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.gray }}>
                              Keine Timeline-Daten vorhanden.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT / SIDEBAR (wie Code 2) */}
          <aside className="space-y-6">
            <section
              className="
                rounded-[18px] border
                px-5 py-5
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: BRAND.sand }}
            >
              <p className="text-sm" style={{ color: CSS.mutedFg }}>
                Aktueller Gesamtscore
              </p>

              <div className="mt-2 flex items-end justify-between">
                <div className="text-5xl font-extrabold" style={{ color: BRAND.navy }}>
                  {overallScore}
                </div>

                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: BRAND.navy, color: "white" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                  <span>/ 100</span>
                </div>
              </div>

              <div className="mt-4 w-full rounded-full h-2.5" style={{ background: "rgba(38,69,85,0.10)" }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${overallScore}%`,
                    background: BRAND.gold,
                  }}
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminLayout>
  );
}
