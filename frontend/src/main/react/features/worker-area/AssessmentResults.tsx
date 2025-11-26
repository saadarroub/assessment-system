import { useMemo, useState } from "react";
import { Home, Download, BarChart3, Target, PieChart } from "lucide-react";
import type { ApiSummaryResponse, UiQuestion } from "@/features/service/publicAssessmentService";


export type AssessmentResultsProps = {
  topicName?: string;
  onRestart?: () => void;
  onBackToTopics?: () => void;
  onComplete?: () => void;   // Klick auf "Abschließen"
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


  // optional nette Extras, falls du sie hast:
  completedAt?: string;    // ISO
  overallLevel?: string;   // "niedrig" | "mittel" | "hoch" | ...
  percent?: number;        // falls du pct schon berechnet hast (0..100)
  summary?: ApiSummaryResponse | null;
};

function downloadJSON(payload: AssessmentResultsProps) {
  const reportData = {
    topic: payload.topicName,
    datum: new Date().toLocaleDateString("de-DE"),
    answered: payload.answered,
    total: payload.total,
    totalScore: payload.totalScore,
    maxTotalScore: payload.maxTotalScore,
    overallLevel: payload.overallLevel,
    completedAt: payload.completedAt ?? new Date().toISOString(),
  };
  const dataStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `assessment-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AssessmentResults(props: AssessmentResultsProps) {
  const {
    topicName, onBackToTopics, onComplete, onChangeAnswer, questionsById, answerValues,          // <<<<<< HIER hinzufügen

    answered, total, totalScore, maxTotalScore,
    completedAt, overallLevel, percent, summary,
  } = props;


  const [editQuestion, setEditQuestion] = useState<UiQuestion | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
        const max = (q as any).max ?? 10;
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

    const autoIds = new Set(
      summary.automatischBewerteteFragen.map(q => q.questionId)
    );

    return summary.answeredQuestions
      .map(q => ({
        ...q,
        isAuto: autoIds.has(q.questionId),  // true = automatisch, false = manuell
      }))
      // optional sortieren nach orderIndex
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [summary]);


  // Prozentanzeige: bevorzugt dein percent; sonst aus Score; sonst aus answered/total
  const overallPct = useMemo(() => {
    if (typeof percent === "number") return Math.max(0, Math.min(100, Math.round(percent)));
    if (maxTotalScore > 0) return Math.round((totalScore / maxTotalScore) * 100);
    if (total > 0) return Math.round((answered / total) * 100);
    return 0;
  }, [percent, totalScore, maxTotalScore, answered, total]);

  const answeredPct = useMemo(() => {
    return total > 0 ? (answered / total) * 100 : 0;
  }, [answered, total]);

  const heroTitle = (topicName ?? "ASSESSMENT").replace(/-/g, " ").toUpperCase();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`
        @keyframes stamp-appear {
          0% { transform: rotate(25deg) scale(0) translateY(-100px); opacity: 0; }
          50% { transform: rotate(25deg) scale(1.1) translateY(0); opacity: 1; }
          100% { transform: rotate(25deg) scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="max-w-[1152px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onBackToTopics ? (
            <button
              onClick={onBackToTopics}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
            >
              <Home className="w-5 h-5" />
              Zur Übersicht
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
            >
              <Home className="w-5 h-5" />
              Zur Übersicht
            </a>
          )}

          {/* Download-Button bleibt */}
          <button
            onClick={() => downloadJSON(props)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 hover:bg-slate-50"
          >
            <Download className="w-5 h-5" />
            Report herunterladen
          </button>
        </div>


        {/* Hero */}
        <div className="relative rounded-2xl border border-slate-200 shadow bg-gradient-to-br from-slate-900 to-blue-500 text-white p-8 mb-8 overflow-hidden">
          <div className="absolute top-5 -right-10 opacity-0 animate-[stamp-appear_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.3s_forwards] rotate-[25deg] z-10">
            <div className="inline-block px-10 py-3 text-2xl font-black tracking-widest uppercase rounded-xl border-[6px] border-white/40 shadow-[0_0_0_3px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.3)] relative bg-white/10 backdrop-blur-[2px]">
              <span>COMPLETED</span>
              <span className="pointer-events-none absolute inset-[-8px] rounded-2xl border-[3px] border-white/30 border-dashed" />
              <span className="pointer-events-none absolute inset-[-2px] rounded-xl bg-gradient-to-br from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Assessment Abgeschlossen!</h1>
              <p className="text-lg/7 text-white/90">Ihre Bewertung für {heroTitle}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold leading-none">
                {totalScore}
              </div>
              <div className="text-base md:text-lg">Punkte</div>
              {overallLevel && (
                <div className="mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full border border-white/30 bg-white/20">
                  {overallLevel}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-indigo-700" />
              <h3 className="text-sm font-semibold">Gesamtscore</h3>
            </div>
            <div className="text-2xl font-bold text-indigo-700 mb-3">
              {totalScore}/{maxTotalScore}
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-[width] duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-sky-600" />
              <h3 className="text-sm font-semibold">Beantwortete Fragen</h3>
            </div>
            <div className="text-2xl font-bold text-sky-600 mb-3">
              {answered}/{total}
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 transition-[width] duration-700" style={{ width: `${answeredPct}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex items-center gap-3 mb-3">
              <PieChart className="w-6 h-6 text-blue-500" />
              <h3 className="text-sm font-semibold">Abgeschlossen am</h3>
            </div>
            <div className="text-[18px] font-medium mt-2">
              {completedAt
                ? new Date(completedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "—"}
            </div>
          </div>
        </div>
        {/* Kleine /summary-Box */}

        {summary && (
          <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-indigo-700" />
                <div>
                  <h3 className="text-sm font-semibold">
                    Zusammenfassung Ihres Assessments
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thema: {summary.themaName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                <div>
                  <span className="font-semibold">
                    {summary.automatischBewertetAnzahl}
                  </span>{" "}
                  automatisch bewertet
                </div>
                <div>
                  <span className="font-semibold">
                    {summary.manuellZuBewertenAnzahl}
                  </span>{" "}
                  manuell zu bewerten
                </div>
                <div>
                  <span className="font-semibold">
                    {summary.uebersprungenAnzahl}
                  </span>{" "}
                  übersprungen
                </div>
              </div>
            </div>

            {/* Erste 5 automatisch bewertete Fragen anzeigen */}
            {/* Fragen-Tabelle: ALLE beantworteten Fragen */}
            {rows.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="py-2 pr-4">Frage</th>
                        <th className="py-2 pr-4">Antwort</th>
                        <th className="py-2 pr-4">Punkte</th>
                        <th className="py-2 pr-4">Erfüllung</th>
                        <th className="py-2 pr-4">Bewertung</th>
                        <th className="py-2">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(q => {
                        const pct =
                          q.maxScore > 0
                            ? Math.round((q.score / q.maxScore) * 100)
                            : 0;

                        const isPerfect = q.score === q.maxScore;

                        const answeredValue =
                          Array.isArray(q.answeredValue)
                            ? q.answeredValue.join(", ")
                            : (q.answeredValue === "" || q.answeredValue == null)
                              ? "Keine Antwort"
                              : String(q.answeredValue);

                        return (
                          <tr key={q.questionId} className="border-b border-slate-50 last:border-0">
                            <td className="py-2 pr-4 align-top">
                              <div className="font-medium text-slate-800">
                                {q.questionText}
                              </div>
                            </td>

                            <td className="py-2 pr-4 align-top text-slate-700">
                              {answeredValue}
                            </td>

                            <td className="py-2 pr-4 align-top text-slate-800">
                              {q.score}/{q.maxScore}
                            </td>

                            <td className="py-2 align-top">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full ${isPerfect ? "bg-emerald-500" : "bg-indigo-600"
                                      }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600">
                                  {pct}%
                                </span>
                              </div>
                            </td>

                            {/* NEU: automatisch / manuell Badge */}
                            <td className="py-2 pr-4 align-top">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${q.isAuto
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}
                              >
                                {q.isAuto ? "automatisch" : "manuell"}
                              </span>
                            </td>

                            {/* Aktion: Frage bearbeiten (dein bestehender Code, nur auf rows angepasst) */}
                            <td className="py-2 align-top">
                              <button
                                type="button"
                                className="text-xs font-medium text-sky-600 hover:underline"
                                onClick={() => {
                                  if (!questionsById) return;

                                  const qMeta = questionsById[String(q.questionId)];
                                  if (!qMeta) {
                                    console.warn("Kein UiQuestion-Meta für", q.questionId);
                                    return;
                                  }

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
                                Frage bearbeiten
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">

          {/*  Abschließen -> completeSession */}
          {onComplete && (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Ab­schließen
            </button>
          )}

        </div>
      </div>
      {/* ===== Bearbeiten-Modal ===== */}
      {editQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Frage bearbeiten</h2>
            <p className="text-sm text-slate-600 mb-4">
              {editQuestion.text}
            </p>

            {/* === gleiche Darstellung je nach Typ === */}
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
                  min={(editQuestion as any).min}
                  max={(editQuestion as any).max}
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
              <input
                type="number"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                min={(editQuestion as any).min}
                max={(editQuestion as any).max}
                step={(editQuestion as any).step ?? 1}
                value={editValue ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setEditValue(raw === "" ? "" : Number(raw));
                }}
              />
            )}

            {editQuestion.type === "date" && (
              <input
                type="date"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                value={editValue ?? ""}
                onChange={(e) => setEditValue(e.target.value)}
              />
            )}

            {editQuestion.type === "order" && (() => {
              const base = (editQuestion as any).options || [];
              const current: string[] = Array.isArray(editValue)
                ? editValue
                : base;

              const move = (idx: number, dir: -1 | 1) => {
                const ni = idx + dir;
                if (ni < 0 || ni >= current.length) return;
                const arr = [...current];
                [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
                setEditValue(arr);
              };

              return (
                <ul className="space-y-2">
                  {current.map((opt, i) => (
                    <li
                      key={opt}
                      className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg bg-white"
                    >
                      <span className="text-[15px] text-[#333]">
                        {i + 1}. {opt}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() => move(i, +1)}
                          disabled={i === current.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}

            {editError && (
              <p className="mt-3 text-xs text-red-600">{editError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => !savingEdit && setEditQuestion(null)}
                disabled={savingEdit}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
                disabled={savingEdit || !onChangeAnswer}
                onClick={async () => {
                  if (!editQuestion || !onChangeAnswer) return;
                  try {
                    setSavingEdit(true);
                    setEditError(null);
                    await onChangeAnswer(String(editQuestion.id), editValue);
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
              >
                {savingEdit ? "Speichere …" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
