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
import AssessmentCompleted from "@/features/worker-area/AssessmentCompleted";
import aa from '@/assets/aa.gif';

//Test
import AssessmentResults from "@/features/worker-area/AssessmentResults";


const STORAGE_KEY = "assessments";

function readStore(): any {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function writeStore(store: any) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { }
}

function resolveAssignmentId(query: URLSearchParams): string {
  const fromUrl = (query.get("assignmentId") || "").trim();
  if (fromUrl) return fromUrl;

  try {
    const raw = localStorage.getItem("activeAssignmentMeta");
    if (!raw) return "unknown";
    const meta = JSON.parse(raw);
    return (meta?.assignmentId || "unknown").trim() || "unknown";
  } catch {
    return "unknown";
  }
}

function makeDashKey(assignmentId: string, topicId: string) {
  return `assignment:${assignmentId}:topic:${topicId}`;
}


/** Query-Helper */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AssessmentPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const catalogId = query.get("catalogId") || "";
  const catalogTitle = query.get("catalogTitle") || "";
  const assignmentKeyId = resolveAssignmentId(query);
  const THEMEN_ROUTE = "/app/katalog-themen-public";

  // Einheitliche Rücknavigation zur Themenliste (mit ALLEN Parametern)
  function goBackToTopics() {
    const qs = new URLSearchParams({
      token: accessToken, // in der Public-Route heißt der Param "token"
      ...(catalogId ? { catalogId } : {}),
      ...(catalogTitle ? { catalogTitle } : {}),
      ...(assignmentKeyId ? { assignmentId: assignmentKeyId } : {}),
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
  const [progress, setProgress] = useState<{ answered: number; total: number }>({ answered: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [score, setScore] = useState<{ totalScore: number | null; maxTotalScore: number | null }>({
    totalScore: null,
    maxTotalScore: null,
  });


  const q: UiQuestion | null = pos >= 0 ? trail[pos] : null;
  const step = progress.total
    ? Math.min((progress.answered ?? 0) + 1, progress.total)
    : (pos >= 0 ? pos + 1 : 1);
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

  const bootstrapOrResume = useCallback(async (token: string, tid: string) => {
    setLoading(true);
    setFatal(null);
    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, tid);
      const existingSid: string | undefined = store?.[dashKey]?.sessionId;

      // Falls es bereits eine Session gibt → fortsetzen
      if (existingSid) {
        setSessionId(existingSid);
        await refreshState(token, existingSid);

        // „Nächste Frage“ vom Server holen => das ist genau die offene Frage
        const apiQ = await getNextQuestion(token, existingSid);
        if (apiQ) {
          const uiQ = normalizeApiQuestion(apiQ);
          setTrail([uiQ]);
          setPos(0);
        } else {
          setCompleted(true);
          setStatus("completed");
        }
        return;
      }

      //  Sonst neue Session starten
      const s = await startSession(token, tid);
      setSessionId(s.sessionId);
      setStatus(s.status);

      // Session speichern
      const prev = store[dashKey] ?? {};
      store[dashKey] = { ...prev, sessionId: s.sessionId, started: prev.started ?? new Date().toISOString() };
      writeStore(store);

      let first: UiQuestion | null = null;
      if (s.firstOrNextQuestion) first = normalizeApiQuestion(s.firstOrNextQuestion);
      else {
        const apiQ = await getNextQuestion(token, s.sessionId);
        if (apiQ) first = normalizeApiQuestion(apiQ);
      }

      if (first) {
        setTrail([first]);
        setPos(0);
      } else {
        setCompleted(true);
        setStatus("completed");
      }
      refreshState(token, s.sessionId);
    } catch (e: any) {
      setFatal(e?.message ?? "Konnte die Session nicht starten/fortsetzen.");
    } finally {
      setLoading(false);
    }
  }, [refreshState, assignmentKeyId]);


  /* -------- Initial Load -------- */
  useEffect(() => {
    if (!accessToken || !themaId) return;
    // Session starten
    bootstrapOrResume(accessToken, themaId);
  }, [accessToken, themaId, bootstrapOrResume]);

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
      // Fortschritt + sessionId persistieren (für Resume und Dashboard)
      refreshState(accessToken, sessionId);
      try {
        const store = readStore();
        const dashKey = makeDashKey(assignmentKeyId, themaId);
        const prev = store[dashKey] ?? {};
        // progress.answered ist VOR dem aktuellen Save evtl. noch „alt“,
        // aber refreshState() oben holt den neuen Wert asynchron nach.
        store[dashKey] = { ...prev, sessionId };
        writeStore(store);
      } catch { }

      // Wenn wir uns in der Mitte des Trails befinden → nur im Trail vorwärts springen
      if (pos < trail.length - 1) {
        setPos(p => p + 1);
        return;
      }

      // Sonst nächste Frage vom Server holen
      const apiQ = await getNextQuestion(accessToken, sessionId);
      if (!apiQ) {
        try {
          const done = await completeSession(accessToken, sessionId);
          setScore({
            totalScore: done?.totalScore ?? null,
            maxTotalScore: done?.maxPossibleScore ?? null,
          });
        } catch { }
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
    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, themaId);
      delete store[dashKey];
      writeStore(store);
    } catch { }
    await bootstrapOrResume(accessToken, themaId);
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
  if (completed) {
    const totalScore = score.totalScore ?? 0;       // <-- nur Score, keine Fragenzahl!
    const maxTotalScore = score.maxTotalScore ?? 0;

    const percent = maxTotalScore > 0
      ? Math.round((totalScore / maxTotalScore) * 100)
      : pct;

    return (
      <AssessmentResults
        topicName={topicName}
        onRestart={restart}
        onBackToTopics={goBackToTopics}

        answered={progress.answered}   // nur für „Beantwortete Fragen“
        total={progress.total}
        totalScore={totalScore}         // echter Score
        maxTotalScore={maxTotalScore}   // echtes Max

        percent={percent}
        overallLevel="Abgeschlossen"
        completedAt={new Date().toISOString()}
      />
    );
  }



  /* -------- Render -------- */
  return (
    <div className=" relative min-h-screen overflow-hidden
      bg-[radial-gradient(circle_at_top,_#f9fafb_0%,_#e5e7eb_40%,_#f9fafb_100%)]">

      {/* Deko-Layer im Hintergrund */}
      <div className="pointer-events-none absolute inset-0 ">
        {/* Dunkelblauer Blob oben links */}
        <div
          className="
          absolute -top-40 -left-24 h-72 w-72
          rounded-full blur-3xl
          bg-[hsla(215,60%,25%,0.22)]
        "
        />

        {/* Goldener Glow rechts */}
        <div
          className="
          absolute top-1/3 -right-32 h-80 w-80
          rounded-full blur-3xl
          bg-[hsla(45,70%,60%,0.25)]
        "
        />

        {/* Halbtransparentes “Kärtchen” unten – leicht animiert */}
        <div
          className="
          absolute -bottom-40 left-1/4
          h-64 w-64 rounded-[32px]
          border border-white/50
          bg-[hsla(0,0%,100%,0.35)]
          backdrop-blur-xl
          rotate-[-8deg]
          shadow-[0_24px_60px_rgba(15,23,42,0.18)]
          animate-[spin_40s_linear_infinite]
        "
        />

        {/* Zweites, kleineres Rechteck */}
        <div
          className="
          absolute -bottom-24 right-1/5
          h-40 w-40 rounded-[28px]
          border border-white/40
          bg-[hsla(215,40%,30%,0.25)]
          backdrop-blur-md
          rotate-[12deg]
          shadow-[0_20px_50px_rgba(15,23,42,0.22)]
          animate-[spin_55s_linear_infinite_reverse]
        "
        />

        {/* Zweites, kleineres Rechteck */}
        <div
          className="
          absolute -bottom-24 right-1/5
          h-40 w-40 rounded-[28px]
          border border-white/40
          bg-[hsla(215,40%,30%,0.25)]
          backdrop-blur-md
          rotate-[12deg]
          shadow-[0_20px_50px_rgba(15,23,42,0.22)]
          animate-[spin_55s_linear_infinite_reverse]
        "
        />

        {/* ===== Quadrat-Stack links wie im Lovable-Hero ===== */}
        <div
          className="
          absolute
          left-[6%] top-[22%]
          h-56 w-56
          sm:h-64 sm:w-64
          lg:h-72 lg:w-72
        "
        >
          {/* äußerer Rahmen – #d2c9b9 */}
          <div
            className="
            absolute inset-0
            rounded-[32px]
            border border-[rgba(210,201,185,0.7)]
            bg-transparent
            rotate-[-4deg]
            animate-[spin_55s_linear_infinite_reverse]
          "
          />

          {/* mittleres Quadrat */}
          <div
            className="
            absolute inset-3
            rounded-[28px]
            border border-[rgba(210,201,185,0.45)]
            bg-[rgba(18,27,38,0.18)]
            rotate-[8deg]
            animate-[spin_40s_linear_infinite]
          "
          />

          {/* inneres, weiches Quadrat */}
          <div
            className="
            absolute inset-8
            rounded-[26px]
            border border-[rgba(210,201,185,0.35)]
            bg-[radial-gradient(circle_at_top,#d2c9b9_0%,transparent_65%)]
            opacity-75
          "
          />

          {/* kleiner goldener Punkt */}
          <div
            className="
            absolute
            left-1/2 top-[72%]
            h-3 w-3
            -translate-x-1/2
            rounded-full
            bg-[#E3BB62]
            shadow-[0_0_16px_rgba(227,187,98,0.9)]
            animate-[ping_8s_linear_infinite]
          "
          />
        </div>

        {/* ein paar kleine „Sternchen“-Punkte */}
        <div
          className="
          absolute left-[18%] top-[50%]
          h-2 w-2 rounded-full
          bg-[#E3BB62]
          opacity-80
          animate-[ping_10s_linear_infinite]
        "
        />
        <div
          className="
          absolute left-[12%] top-[36%]
          h-1.5 w-1.5 rounded-full
          bg-[#d2c9b9]
          opacity-70
          animate-[ping_12s_linear_infinite]
        "
        />
        <div
          className="
          absolute right-[26%] top-[58%]
          h-1.5 w-1.5 rounded-full
          bg-[#E3BB62]
          opacity-65
          animate-[ping_14s_linear_infinite]
        "
        />
        <div
          className="
    absolute left-[25%] top-[30%]
    h-1.5 w-1.5 rounded-full
    bg-[#E3BB62]
    opacity-70
    animate-[ping_9s_linear_infinite]
  "
        />

        <div
          className="
    absolute right-[12%] top-[40%]
    h-2 w-2 rounded-full
    bg-[#d2c9b9]
    opacity-75
    animate-[ping_11s_linear_infinite]
  "
        />

        <div
          className="
    absolute right-[8%] top-[65%]
    h-1 w-1 rounded-full
    bg-[#E3BB62]
    opacity-60
    animate-[ping_13s_linear_infinite]
  "
        />

        {/* zusätzliche Shapes NUR für große Screens  */}
        {/* Extra-Blob oben rechts – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute -top-32 right-1/4
          h-52 w-52 rounded-full blur-3xl
          bg-[hsla(215,45%,35%,0.18)]
        "
        />

        {/* zusätzliche Shapes NUR für große Screens  */}

        {/* Extra-Blob oben rechts – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute -top-32 right-1/4
          h-52 w-52 rounded-full blur-3xl
          bg-[hsla(215,45%,35%,0.18)]
        "
        />

        {/* Goldene „Scheibe“ unten links – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute bottom-10 left-10
          h-28 w-28 rounded-full blur-2xl
          bg-[hsla(45,75%,62%,0.28)]
        "
        />

        {/* Schwebende Card links unten – nur ab xl */}
        <div
          className="
          hidden xl:block
          absolute bottom-40 left-[18%]
          h-32 w-52
          rounded-[24px]
          border border-white/50
          bg-[#d2c9b9]
          backdrop-blur-xl
          shadow-[0_18px_45px_rgba(15,23,42,0.16)]
          rotate-[-4deg]
          animate-[spin_70s_linear_infinite]
        "
        />

        {/* Schmale, vertikale goldene Leiste rechts – nur ab xl */}
        <div
          className="
          hidden xl:block
          absolute top-24 right-[14%]
          h-40 w-16
          rounded-[999px]
          bg-[linear-gradient(180deg,#E3BB62_0%,rgba(227,187,98,0)_100%)]
          opacity-70
          blur-[1px]
        "
        />
      </div>
      <div
        className="
    relative z-[1]
    flex flex-col items-center
    pt-16 pb-16 px-5
  "
      >
        {/* Logo-Badge – groß & sichtbar */}
        <div
          className="
      relative
      -mb-10
      inline-flex items-center justify-center
      h-24 sm:h-28 md:h-32          /* etwas höher = mehr Platz fürs GIF */
      w-[210px] sm:w-[240px] md:w-[270px]
      rounded-[32px]
      bg-white/98
      border border-[#e4e4e7]
      shadow-[0_26px_70px_rgba(15,23,42,0.30)]
      overflow-hidden
    "
        >
          <img
            src={aa}
            alt="ICA³ – Integrated Customer Assessments &amp; Advanced Analytics"
            className="
        max-h-full w-auto            /* GANZES GIF sichtbar */
        object-contain
      "
          />
        </div>

        {/* weißer Haupt-Container */}
        <div
          className="
      w-full max-w-[980px]
      rounded-3xl
      bg-gradient-to-b from-white to-[#f5f5f7]
      border border-white/80
      shadow-[0_24px_80px_rgba(15,23,42,0.16)]
      overflow-hidden
    "
        >

          {/* Header */}
          <div className=" p-6
    bg-white/95
    backdrop-blur-sm
    border-b border-[#e4e4e7]
    shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">{headerTitle}</div>
                {headerSubtitle && <div className="text-sm text-[#666] mt-1">{headerSubtitle}</div>}
              </div>

              <button
                type="button"
                onClick={goBackToTopics}
                className=" group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
  bg-white text-slate-800 border border-[#ddd]
  shadow-sm
  transition-all duration-150 ease-out transform
  hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1f2a37]
  hover:-translate-y-[1px] hover:shadow-md
  active:translate-y-[0px] active:shadow-sm"
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
            <div className="px-6 py-4 bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[18px] font-semibold text-[#1a1a1a]">Assessment läuft</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#0f172a] bg-[#f8fafc] px-3.5 py-1.5 rounded-full border border-gray-200">
                    {`Frage ${Math.max(1, step)}${progress.total ? ` von ${progress.total}` : ""}`}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-[#ebebec] rounded-[10px] overflow-hidden mb-2">
                <div
                  className="h-full transition-[width] duration-300 ease-out rounded-[10px]
               bg-[linear-gradient(90deg,#E3BB62_0%,#d2c9b9_100%)]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-sm text-[#666]">{pct}% abgeschlossen</div>
            </div>
          )}

          {/* Inhalt !completed*/}
          {q && (
            <>
              <div className=" px-6 pt-6 pb-6
    bg-white/98
    shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
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
                          ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"                         // ausgewählt: Gold-Rahmen + hellgoldener Hintergrund
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]" // Hover: Navy-Rand
                            }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"  // Kreis in CAP-Navy
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
                          ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
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
                      className=" w-full h-2 rounded bg-[#ebebec] outline-none
    [accent-color:#56768f]
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#56768f]
    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-[#56768f] [&::-moz-range-thumb]:border-0"
                    />
                    <div className="text-center text-[18px] font-semibold text-[#56768f] mt-2">
                      {answers[q.id] ?? Math.floor((((q as any).min ?? 0) + ((q as any).max ?? 10)) / 2)}
                    </div>
                    {(q as any).labels && (
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
  bg-[#E3BB62] text-[#264555]
  shadow-sm border border-transparent
  transition-all duration-150 ease-out transform
  hover:bg-[#d7a548] hover:border-[#d7a548]
  hover:-translate-y-[1px] hover:shadow-md
  active:translate-y-[0px] active:shadow-sm"
                    onClick={next}
                  >
                    {status === "completed" || (progress.total && progress.answered + 1 >= progress.total && pos >= trail.length - 1)
                      ? "Abschließen ✓"
                      : "Weiter →"}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>

  );

}
