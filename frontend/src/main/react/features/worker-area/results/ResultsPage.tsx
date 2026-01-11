import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { getManualScoringView, updateManualScore, getQuestionsTimeline } from "@/api/scoringApi";
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

  // Function to fetch/refresh data
  const fetchData = async () => {
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
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [sessionId]);

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
      // Refresh data to get updated scores and timeline from backend
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
            <p className="mt-4 text-sm text-gray-500">Lade Daten...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold text-gray-800">Fehler beim Laden</p>
            <p className="text-sm mt-2 text-gray-500">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
              style={{ background: BRAND.navy }}
            >
              Zurück
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <PageHeader
        title="Manuelle Bewertung & Report"
        subtitle="Bewerte offene Antworten und exportiere den Bericht als PDF"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern
        center={false}
      />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
          <span className="text-gray-400">›</span>
          <span className="font-semibold" style={{ color: BRAND.navy }}>
            Results
          </span>
        </div>
      </div>

      {/* Session Info Header */}
      {sessionInfo && (
        <div className="max-w-6xl mx-auto mb-6 px-6">
          <div
            className="rounded-2xl border p-5 shadow-sm bg-white flex flex-wrap gap-6"
            style={{ borderColor: BRAND.sand }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-[180px]">
              <User size={20} style={{ color: BRAND.navy }} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Bewerter</p>
                <p className="font-semibold" style={{ color: BRAND.navy }}>
                  {sessionInfo.workerName || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-[180px]">
              <BookOpen size={20} style={{ color: BRAND.navy }} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Thema</p>
                <p className="font-semibold" style={{ color: BRAND.navy }}>
                  {sessionInfo.themaName || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-[150px]">
              <Calendar size={20} style={{ color: BRAND.navy }} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background:
                      sessionInfo.status === "completed"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(227,187,98,0.25)",
                    color: sessionInfo.status === "completed" ? "rgb(22,101,52)" : BRAND.navy,
                  }}
                >
                  {sessionInfo.status === "completed" ? "Abgeschlossen" : sessionInfo.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-[120px]">
              <div>
                <p className="text-xs text-gray-500 uppercase">Fragen</p>
                <p className="font-semibold" style={{ color: BRAND.navy }}>
                  {sessionInfo.totalQuestions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-10">
        {/* Success Message */}
        {successMessage && (
          <div
            className="mb-4 rounded-xl border p-4 flex items-center gap-3 animate-fade-in"
            style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgb(34,197,94)" }}
          >
            <CheckSquare size={24} style={{ color: "rgb(22,101,52)" }} />
            <div>
              <p className="font-semibold" style={{ color: "rgb(22,101,52)" }}>
                {successMessage}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Die Timeline und der Gesamtscore wurden aktualisiert.
              </p>
            </div>
          </div>
        )}

        {/* Breadcrumb + Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
         

          <button
            onClick={() => alert("PDF Export kommt bald")}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: BRAND.gold, color: BRAND.navy }}
          >
            <FileText size={16} />
            PDF
          </button>
        </div>

        {/* Info Banner - shows different content based on state */}
        <div
          className="rounded-2xl border p-4 mb-6 flex flex-wrap items-center justify-between gap-4"
          style={{ 
            background: manualQuestions.length === 0 
              ? "linear-gradient(to right, rgba(34,197,94,0.05), rgba(34,197,94,0.1))" 
              : openCount === 0 
                ? "linear-gradient(to right, rgba(34,197,94,0.05), rgba(34,197,94,0.1))" 
                : "linear-gradient(to right, #fff, #f9f9f9)", 
            borderColor: manualQuestions.length === 0 || openCount === 0 ? "rgb(34,197,94)" : BRAND.sand 
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ background: manualQuestions.length === 0 || openCount === 0 ? "rgba(34,197,94,0.15)" : "rgba(38,69,85,0.08)" }}
            >
              {manualQuestions.length === 0 || openCount === 0 ? (
                <CheckSquare size={18} style={{ color: "rgb(22,101,52)" }} />
              ) : (
                <AlertTriangle size={18} style={{ color: BRAND.navy }} />
              )}
            </div>
            <div>
              {manualQuestions.length === 0 ? (
                <>
                  <p className="font-semibold" style={{ color: "rgb(22,101,52)" }}>
                    Keine manuellen Bewertungen erforderlich
                  </p>
                  <p className="text-xs text-gray-500">
                    Alle Fragen wurden bewertet.
                  </p>
                </>
              ) : openCount === 0 ? (
                <>
                  <p className="font-semibold" style={{ color: "rgb(22,101,52)" }}>
                    Alle manuellen Bewertungen abgeschlossen
                  </p>
                  <p className="text-xs text-gray-500">
                    Alle {manualQuestions.length} manuellen Fragen wurden bewertet.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold" style={{ color: BRAND.navy }}>
                    Offene Bewertungen
                  </p>
                  <p className="text-xs text-gray-500">
                    Bitte bewerte die offenen Fragen (0–6) und speichere die Bewertungen.
                  </p>
                </>
              )}
            </div>
          </div>
          {manualQuestions.length > 0 && (
            <div className="flex gap-3">
              <span className="rounded-full px-3 py-1 text-sm" style={{ background: "rgba(38,69,85,0.08)", color: BRAND.navy }}>
                Gesamt: <strong>{manualQuestions.length}</strong>
              </span>
              {openCount > 0 ? (
                <span className="rounded-full px-3 py-1 text-sm text-white" style={{ background: BRAND.navy }}>
                  <strong>{openCount}</strong> Offen
                </span>
              ) : (
                <span className="rounded-full px-3 py-1 text-sm text-white" style={{ background: "rgb(22,101,52)" }}>
                  <CheckSquare size={12} className="inline mr-1" /> Alle bewertet
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manual Scoring Section */}
            <section className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: BRAND.sand }}>
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: BRAND.fog, borderBottom: `2px solid ${BRAND.sand}` }}
              >
                <h2 className="font-semibold flex items-center gap-2" style={{ color: BRAND.navy }}>
                  {manualQuestions.length === 0 || openCount === 0 ? (
                    <CheckSquare size={18} style={{ color: "rgb(22,101,52)" }} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  Manuelle Bewertung
                </h2>
                {manualQuestions.length > 0 && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ 
                      background: openCount === 0 ? "rgba(34,197,94,0.15)" : "rgba(227,187,98,0.25)", 
                      color: openCount === 0 ? "rgb(22,101,52)" : BRAND.navy 
                    }}
                  >
                    {openCount === 0 ? "✓ Alle bewertet" : `${openCount} Offen`}
                  </span>
                )}
              </div>

              <div className="p-6">
                {manualQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare size={40} className="mx-auto mb-3" style={{ color: "rgb(34,197,94)" }} />
                    <p className="font-semibold" style={{ color: BRAND.navy }}>Keine manuellen Bewertungen erforderlich</p>
                    <p className="text-sm text-gray-500 mt-1">Alle Fragen wurden bewertet.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {manualQuestions.map((q) => {
                      const isScored = q.score !== null && q.score > 0;
                      return (
                        <div key={q.id} className="border-b last:border-0 pb-5 last:pb-0" style={{ borderColor: BRAND.sand }}>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-xs rounded-full px-2 py-0.5 font-medium"
                              style={{ background: "rgba(38,69,85,0.08)", color: BRAND.navy }}
                            >
                              {getTypeDisplayName(q.inputType)}
                            </span>
                            {isScored ? (
                              <span className="text-xs font-semibold flex items-center gap-1 text-green-700">
                                <CheckSquare size={12} />
                                Bewertet
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-red-600">Nicht bewertet</span>
                            )}
                          </div>

                          <p className="font-semibold mb-2" style={{ color: BRAND.navy }}>
                            {q.question}
                          </p>

                          <div
                            className="p-3 rounded mb-3 text-sm italic border-l-4"
                            style={{ background: "rgba(38,69,85,0.04)", borderLeftColor: BRAND.sand }}
                          >
                            „{formatAnswer(q.answer)}"
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium" style={{ color: BRAND.navy }}>
                              Score (0–6):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="6"
                              step="1"
                              className="w-20 h-9 rounded-full border px-3 text-center font-bold outline-none"
                              style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                              value={q.score === null || q.score === 0 ? "" : q.score}
                              placeholder="-"
                              onChange={(e) => handleScoreChange(q.id, e.target.value)}
                            />
                            <span className="text-sm text-gray-500">/ {q.maxScore || 6}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Save Button */}
                    <div className="pt-4 border-t" style={{ borderColor: BRAND.sand }}>
                      <button
                        onClick={onSave}
                        disabled={!canSave || isSaving}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                        style={{ background: canSave ? BRAND.navy : "rgba(38,69,85,0.4)" }}
                      >
                        <Save size={18} />
                        {isSaving ? "Speichern..." : isSaved ? "✓ Gespeichert" : `Alle ${openCount} Bewertungen speichern`}
                      </button>
                      {!canSave && openCount > 0 && (
                        <p className="text-xs text-center mt-2 text-red-600">
                          Bitte alle {openCount} offenen Fragen bewerten.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Timeline Section */}
            <section className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: BRAND.sand }}>
              <div
                className="px-6 py-4"
                style={{ background: BRAND.fog, borderBottom: `2px solid ${BRAND.sand}` }}
              >
                <h2 className="font-semibold" style={{ color: BRAND.navy }}>
                  Alle Antworten <span className="opacity-60">(Timeline)</span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr className="text-left text-xs uppercase tracking-wide" style={{ color: BRAND.navy }}>
                      <th className="px-5 py-3">Frage</th>
                      <th className="px-5 py-3">Typ</th>
                      <th className="px-5 py-3">Antwort</th>
                      <th className="px-5 py-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineQuestions.map((q) => (
                      <tr key={q.id} className="border-t hover:bg-gray-50" style={{ borderColor: BRAND.sand }}>
                        <td className="px-5 py-4">
                          <p className="font-medium" style={{ color: BRAND.navy }}>
                            {q.question}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-block rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ background: "rgba(38,69,85,0.08)", color: BRAND.navy }}
                          >
                            {getTypeDisplayName(q.inputType)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm" style={{ color: BRAND.steel }}>
                            {formatAnswer(q.answer)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {q.status === "manual" ? (
                            // Manual review type - show score if > 0, otherwise "manueller Score erforderlich"
                            q.score !== null && q.score > 0 ? (
                              <span
                                className="inline-block rounded-full px-3 py-1 text-sm font-bold"
                                style={{ background: "rgba(34,197,94,0.15)", color: "rgb(22,101,52)" }}
                              >
                                {q.score} / {q.maxScore || 6}
                              </span>
                            ) : (
                              <span
                                className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                                style={{ background: "rgba(239,68,68,0.1)", color: "rgb(185,28,28)" }}
                              >
                                Manueller Score erforderlich
                              </span>
                            )
                          ) : q.status === "automatic" ? (
                            // Auto-scored type - show score
                            <span
                              className="inline-block rounded-full px-3 py-1 text-sm font-bold"
                              style={{ background: "rgba(227,187,98,0.2)", color: BRAND.navy }}
                            >
                              {q.score ?? 0} / {q.maxScore}
                            </span>
                          ) : q.status === "skipped" ? (
                            // Skipped question
                            <span className="text-xs italic text-gray-400">übersprungen</span>
                          ) : (
                            // Not scorable (status === "not_scorable")
                            <span className="text-xs italic text-gray-400">nicht bewertbar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Score Card */}
            <section className="rounded-2xl border p-5 bg-white" style={{ borderColor: BRAND.sand }}>
              <p className="text-sm text-gray-500">Aktueller Gesamtscore</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-5xl font-extrabold" style={{ color: BRAND.navy }}>
                  {overallScore}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: BRAND.navy }}
                >
                  / 100
                </span>
              </div>
              <div className="mt-4 w-full rounded-full h-2.5" style={{ background: "rgba(38,69,85,0.1)" }}>
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{ width: `${overallScore}%`, background: BRAND.gold }}
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminLayout>
  );
}
