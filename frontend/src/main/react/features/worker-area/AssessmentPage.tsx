// src/main/react/features/assessments/AssessmentPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  startSession,
  getNextQuestion,
  saveAnswer,
  completeSession,
  getState,
  normalizeApiQuestion,
  buildSaveValue,
  type UiQuestion,
  type ApiState,
} from "@/features/service/publicAssessmentService";

/** Query-Helper */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AssessmentPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const catalogId    = query.get("catalogId")    || ""; // optional
const catalogTitle = query.get("catalogTitle") || ""; // optional
const assignmentId = query.get("assignmentId") || ""; // optional
const THEMEN_ROUTE = "/app/katalog-themen-public";

// Einheitliche Rücknavigation zur Themenliste (mit ALLEN Parametern)
function goBackToTopics() {
  const qs = new URLSearchParams({
    token: accessToken, // in der Public-Route heißt der Param "token"
    ...(catalogId ? { catalogId } : {}),
    ...(catalogTitle ? { catalogTitle } : {}),
    ...(assignmentId ? { assignmentId } : {}),
     ...(name ? { name } : {}),         
    ...(code ? { code } : {}),
  });
  navigate(`${THEMEN_ROUTE}?${qs.toString()}`);
}


  /* -------- URL-Parameter -------- */
  const type = query.get("type") || "";                 // optional
  //const topicId = query.get("topicId") || "";           // optional
  const topicName = query.get("topicName") || "";       // optional
  const accessToken = query.get("accessToken") || "";   // erforderlich
  const themaId = query.get("themaId") || query.get("topicId") || ""; // erforderlich
  const name = query.get("name") || "";
const code = query.get("code") || "";

  /* -------- UI/Flow-States -------- */
  const [sessionId, setSessionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [trail, setTrail] = useState<UiQuestion[]>([]); // Verlauf der bereits geladenen Fragen
  const [pos, setPos] = useState<number>(-1);           // Index im Trail (aktuelle Frage)
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<"in_progress" | "completed">("in_progress");
  const [progress, setProgress] = useState<{answered: number; total: number}>({ answered: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);

  const q: UiQuestion | null = pos >= 0 ? trail[pos] : null;
  const step = pos + 1;
  const pct = progress.total ? Math.round((progress.answered / progress.total) * 100) : (step > 0 ? step * 5 : 0);

  /* -------- Helpers -------- */
  const refreshState = useCallback(async (token: string, sid: string) => {
    try {
      const s: ApiState = await getState(token, sid);
      setProgress({ answered: s.answeredCount, total: s.totalCount });
      setStatus(s.status);
    } catch {
    }
  }, []);

  const bootstrap = useCallback(async (token: string, tid: string) => {
    setLoading(true);
    setFatal(null);
    try {
      const s = await startSession(token, tid);
      setSessionId(s.sessionId);
      setStatus(s.status);

      /* 
         MINIMALE ERGÄNZUNG: sessionId persistieren,
         damit die Themenliste Live-Progress per getState() ziehen kann.
       */
      try {
        const dashKey = `topic:${tid}`;
        const raw = localStorage.getItem("assessments");
        const store: Record<string, { started?: string; progress?: number; currentQuestion?: number; sessionId?: string }> =
          raw ? JSON.parse(raw) : {};
        const prev = store[dashKey] ?? {};
        store[dashKey] = {
          ...prev,
          sessionId: s.sessionId,
          started: prev.started ?? new Date().toISOString(),
        };
        localStorage.setItem("assessments", JSON.stringify(store));
      } catch {}

      let first: UiQuestion | null = null;
      if (s.firstOrNextQuestion) {
        first = normalizeApiQuestion(s.firstOrNextQuestion);
      } else {
        const apiQ = await getNextQuestion(token, s.sessionId);
        if (apiQ) first = normalizeApiQuestion(apiQ);
      }

      if (first) {
        setTrail([first]);
        setPos(0);
      } else {
        // keine Frage → fertig
        setCompleted(true);
        setStatus("completed");
      }
      refreshState(token, s.sessionId);
    } catch (e: any) {
      setFatal(e?.message ?? "Konnte die Session nicht starten.");
    } finally {
      setLoading(false);
    }
  }, [refreshState]);

  /* -------- Initial Load -------- */
  useEffect(() => {
    if (!accessToken || !themaId) return;
    // Session starten
    bootstrap(accessToken, themaId);
  }, [accessToken, themaId, bootstrap]);

  /* -------- Antworten setzen -------- */
  const setAnswer = (qid: string | number, val: any, mode: any) => {
    setAnswers(prev => {
      const id = String(qid);
      const next: any = { ...prev };
      if (mode === "checkbox" || mode === "order") {
        const arr = Array.isArray(prev[id]) ? [...prev[id]] : [];
        const i = arr.indexOf(val);
        if (i > -1) arr.splice(i, 1);
        else arr.push(val);
        next[id] = arr;
      } else {
        next[id] = val;
      }
      return next;
    });
  };

  /* -------- Navigation -------- */
  const prev = () => {
    if (pos > 0) setPos(p => p - 1);
  };

  const next = async () => {
    if (!q || !sessionId) return;
    try {
      // aktuelle Antwort speichern
      const value = buildSaveValue(q, answers[String(q.id)] ?? "");
      await saveAnswer(accessToken, sessionId, String(q.id), value);

      // Fortschritt aktualisieren
      refreshState(accessToken, sessionId);

      // Wenn wir uns in der Mitte des Trails befinden → nur im Trail vorwärts springen
      if (pos < trail.length - 1) {
        setPos(p => p + 1);
        return;
      }

      // Sonst nächste Frage vom Server holen
      const apiQ = await getNextQuestion(accessToken, sessionId);
      if (!apiQ) {
        try { await completeSession(accessToken, sessionId); } catch {}
        setCompleted(true);
        setStatus("completed");
        refreshState(accessToken, sessionId);
        return;
      }

      const uiQ = normalizeApiQuestion(apiQ);
      setTrail(t => [...t, uiQ]);
      setPos(p => p + 1);
    } catch (e) {
      console.error("save/next failed", e);
    }
  };

  /* -------- Restart (Assessment nochmal machen) -------- */
  const restart = async () => {
    // State auf Anfang zurücksetzen und Session neu starten
    setAnswers({});
    setTrail([]);
    setPos(-1);
    setCompleted(false);
    setProgress({ answered: 0, total: 0 });
    await bootstrap(accessToken, themaId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* -------- UI-Texte -------- */
  const headerTitle = topicName || "Assessment";
  const headerSubtitle = topicName ? `Thema: ${topicName}` : (type ? `Typ: ${type}` : "");

  /* -------- Guards / Loader -------- */
  if (!accessToken || !themaId) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6">
          <div className="font-semibold mb-2">Ungültiger Link</div>
          <div className="text-sm text-[#666]">
            Es fehlen Parameter (<code>accessToken</code> oder <code>themaId</code>). Bitte den Einladungslink erneut öffnen.
          </div>
        </div>
      </div>
    );
  }

  if (loading || (!completed && !q && !fatal)) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6">Lädt …</div>
      </div>
    );
  }

  if (fatal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6 text-red-600">
          {fatal}
        </div>
      </div>
    );
  }

  /* -------- Render -------- */
  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
      <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.08)] overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">{headerTitle}</div>
              {headerSubtitle && <div className="text-sm text-[#666] mt-1">{headerSubtitle}</div>}
            </div>

            <button
              type="button"
              onClick={goBackToTopics}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-800 border border-[#ddd] transition hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1f2a37]"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11l9-7 9 7" />
                <path d="M9 22V12h6v10" />
              </svg>
              Zur Übersicht
            </button>
          </div>
        </div>
 
        {/* Progress */}
        {!completed && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[18px] font-semibold text-[#1a1a1a]">Assessment läuft</div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#0f172a] bg-[#f8fafc] px-3.5 py-1.5 rounded-full border border-gray-200">
                  {`Frage ${Math.max(1, step)}${progress.total ? ` von ${progress.total}` : ""}`}
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-[10px] overflow-hidden mb-2">
              <div
                className="h-full bg-blue-500 transition-[width] duration-300 ease-out rounded-[10px]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-sm text-[#666]">{pct}% abgeschlossen</div>
          </div>
        )}

        {/* Inhalt */}
        {!completed && q ? (
          <>
            <div className="px-6 pt-6">
              <div className="text-[18px] font-semibold text-[#1a1a1a] mb-6 leading-relaxed">{q.text}</div>

              {/* Eingabetypen */}
              {q.type === "radio" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt: string) => {
                    const checked = answers[q.id] === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                        ${checked ? "border-blue-500 bg-[#eff6ff]" : "border-gray-200 hover:border-blue-500 hover:bg-[#f8faff]"}`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="mr-3 w-[18px] h-[18px] cursor-pointer accent-blue-500"
                          checked={checked}
                          onChange={() => setAnswer(q.id, opt, "radio")}
                        />
                        <span className="text-[15px] text-[#333]">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "checkbox" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt: string) => {
                    const list: string[] = answers[q.id] || [];
                    const checked = list.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                        ${checked ? "border-blue-500 bg-[#eff6ff]" : "border-gray-200 hover:border-blue-500 hover:bg-[#f8faff]"}`}
                      >
                        <input
                          type="checkbox"
                          className="mr-3 w-[18px] h-[18px] cursor-pointer accent-blue-500"
                          checked={checked}
                          onChange={() => setAnswer(q.id, opt, "checkbox")}
                        />
                        <span className="text-[15px] text-[#333]">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "slider" && (
                <div className="py-5">
                  <input
                    type="range"
                    min={(q as any).min}
                    max={(q as any).max}
                    value={answers[q.id] ?? Math.floor((((q as any).min ?? 0) + ((q as any).max ?? 10)) / 2)}
                    onChange={(e) => setAnswer(q.id, Number(e.target.value), "slider")}
                    className="w-full h-2 rounded bg-gray-200 outline-none [accent-color:#3b82f6]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[#3b82f6] [&::-moz-range-thumb]:border-0"
                  />
                  <div className="text-center text-[18px] font-semibold text-blue-500 mt-2">
                    {answers[q.id] ?? Math.floor((((q as any).min ?? 0) + ((q as any).max ?? 10)) / 2)}
                  </div>
                  { (q as any).labels && (
                    <div className="flex justify-between mt-2 text-sm text-[#666]">
                      <span>{(q as any).labels[0]}</span>
                      <span>{(q as any).labels[1]}</span>
                    </div>
                  )}
                </div>
              )}

              {q.type === "textarea" && (
                <textarea
                  className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg text-[15px] resize-y outline-none focus:border-blue-500"
                  placeholder={(q as any).placeholder || ""}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value, "textarea")}
                />
              )}

              {q.type === "text" && (
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                  placeholder={(q as any).placeholder || ""}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value, "text")}
                />
              )}

              {q.type === "select" && (
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500 bg-white"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value, "select")}
                >
                  <option value="" disabled>Bitte auswählen …</option>
                  {q.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === "number" && (
                <input
                  type="number"
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                  min={(q as any).min}
                  max={(q as any).max}
                  step={(q as any).step ?? 1}
                  placeholder={(q as any).placeholder || ""}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setAnswer(q.id, raw === "" ? "" : Number(raw), "number");
                  }}
                />
              )}

              {q.type === "date" && (
                <input
                  type="date"
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                  min={(q as any).min}
                  max={(q as any).max}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value, "date")}
                />
              )}

              {q.type === "order" && (() => {
                const base = (q as any).options || [];
                const current: string[] = Array.isArray(answers[q.id]) ? answers[q.id] : base;

                const move = (idx: number, dir: -1 | 1) => {
                  const ni = idx + dir;
                  if (ni < 0 || ni >= current.length) return;
                  const arr = [...current];
                  [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
                  setAnswer(q.id, arr, "order");
                };

                return (
                  <ul className="space-y-2">
                    {current.map((opt, i) => (
                      <li key={opt} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg bg-white">
                        <span className="text-[15px] text-[#333]">{i + 1}. {opt}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                          <button className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50" onClick={() => move(i, +1)} disabled={i === current.length - 1}>↓</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()}

              {/* Navigation */}
              <div className="pb-6 pt-6 flex items-center justify-between gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#666] border border-[#ddd] hover:bg-[#f5f5f5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={prev}
                  disabled={pos <= 0}
                >
                  ← Zurück
                </button>

                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#6b7280] hover:bg-[#4b5563] transition"
                  onClick={next}
                >
                  {status === "completed" || (progress.total && progress.answered + 1 >= progress.total && pos >= trail.length - 1)
                    ? "Abschließen ✓"
                    : "Weiter →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-10 text-center">
            <div className="text-6xl mb-5">✓</div>
            <div className="text-[28px] font-bold text-[#1a1a1a] mb-2">Assessment abgeschlossen</div>
            <div className="text-[16px] text-[#666] mb-8">
              {`Vielen Dank für die Teilnahme am ${topicName || "Assessment"}. Ihre Antworten wurden gespeichert.`}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={restart}
              >
                Assessment erneut starten
              </button>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#d4af37] text-[#333] hover:bg-[#c29d2f] transition"
               onClick={goBackToTopics}
              >
                🏠 Zur Übersicht
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
