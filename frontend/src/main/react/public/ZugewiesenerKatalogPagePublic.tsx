import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "@/apps/app/AppHeader";

// Nur noch fetchAssignmentByAccessCode nutzen
import { fetchAssignmentByAccessCode } from "@/features/service/inviteService";
import { getQuestionCountForThema } from "@/features/service/themaCatalogService";

/* ================== Style-/Card-Texte ================== */
const DEFAULT_EST = "15–20 Min";
const DEFAULT_FEATURES = ["Dynamische Fragentiefe", "Echtzeit-Fortschritt", "Adaptive Felder"];
const KATALOG_THEMEN_ROUTE = "/app/katalog-themen-public";

/* ================== Typen ================== */
type TopicCardModel = {
  dashKey: string;           
  tag: string;
  title: string;
  questionsLabel: string;
  subtitle: string;
  est: string;
  features: string[];
  theme: "blue";
  effectiveProgress: number;
  topicId: string;
  topicName: string;
  assignmentId?: string;
};
 
/* ================== Karten-Komponente ================== */
function CatalogCard({ data, onStart }: { data: TopicCardModel; onStart: () => void }) {
  const [animate, setAnimate] = useState(false);
  const p = Math.max(0, Math.min(100, Math.round(data.effectiveProgress)));
  const running = p > 0 && p < 100;
  const completed = p >= 100;

  const btnLabel = completed ? "Neu starten →" : running ? "Fortsetzen →" : "Öffnen →";

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, [p]);

  return (
    <div
      className="catalog-card bg-white rounded-xl overflow-hidden
             shadow-[0_4px_16px_rgba(0,0,0,.05)] transition-all flex flex-col
             hover:shadow-[0_10px_25px_rgba(0,0,0,.10)] hover:-translate-y-1.5
             border border-black/5"
      data-assessment-id={data.dashKey}
    >
      <div className="card-header p-4 text-white relative bg-[#264555]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="relative z-[1] flex items-center justify-between gap-2 flex-wrap mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
            {data.tag}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
            {data.questionsLabel}
          </span>
        </div>

        {completed && (
          <span className="absolute right-4 top-4 rotate-[-13deg] bg-red-500 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded shadow-md">
            COMPLETED
          </span>
        )}

        <div className="relative z-[1]">
          <h2 className="text-xl font-bold mb-2">{data.title}</h2>
          <p className="text-sm/6 opacity-95">{data.subtitle}</p>
        </div>
      </div>

      {p > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2 font-medium">
            <span>Fortschritt</span>
            <span className="progress-percent">{p}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-xl overflow-hidden">
            <div
              className="h-full rounded-xl bg-white transition-all duration-500 ease-in-out"
              style={{ width: `${animate ? p : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-5 mb-5 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Geschätzte Zeit: {data.est}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
            </svg>
            <span>Interaktiv</span>
          </div>
        </div>

        <h3 className="font-semibold mb-3 text-slate-800 text-sm">Eigenschaften:</h3>
        <ul className="list-none mb-6">
          {data.features.map((f) => (
            <li key={f} className="py-1.5 flex items-center gap-2.5 text-sm text-slate-700">
              <span className="w-[18px] h-[18px] rounded-full grid place-items-center text-[12px] font-bold bg-sky-50 text-blue-700 shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={onStart}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all mt-auto shadow-sm bg-[#264555] hover:bg-[#1f3846] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

/* ================== Seite ================== */
export default function ZugewiesenerKatalog() {
  const [thema, setThema] = useState<{ id: string; name: string; description?: string; assignmentId?: string } | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Token & Code aus der URL
  const sp = new URLSearchParams(location.search);
  const accessCode = sp.get("code") ?? "";
  const accessToken = sp.get("token") ?? "";

  // Willkommen-Name: aus Query (?name=...) oder vom Assignment
  const [nameFromAssignment, setNameFromAssignment] = useState<string>("");
  const welcomeName = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return p.get("name")?.trim() || nameFromAssignment || "Teilnehmer";
  }, [location.search, nameFromAssignment]);

  /* --- Nur einen Katalog laden --- */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!accessCode) { setThema(null); return; }

      const first = await fetchAssignmentByAccessCode(accessCode);
      if (!alive) return;

      setNameFromAssignment(first?.worker?.name || "");

      if (first?.catalog?.id) {
        setThema({
          id: first.catalog.id,
          name: first.catalog.title || "Unbenannter Katalog",
          description: first.catalog.description || "",
          assignmentId: first.id,
        });
        
        // Anzahl der Fragen laden
        try {
          const count = await getQuestionCountForThema(first.catalog.id);
          if (alive) setQuestionCount(count);
        } catch (err) {
          console.error("Fehler beim Laden der Fragenanzahl:", err);
          if (alive) setQuestionCount(0);
        }
      } else {
        setThema(null);
      }
    })().catch(() => setThema(null));

    return () => { alive = false; };
  }, [accessCode]);

  /* --- localStorage für Fortschritt --- */
  const assessments = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("assessments") || "{}") as Record<
        string,
        { started?: string; progress?: number; currentQuestion?: number }
      >;
    } catch {
      return {};
    }
  }, []);

  /* --- Card bauen --- */
  const card: TopicCardModel | null = useMemo(() => {
    if (!thema) return null;
    const dashKey = `topic:${thema.id}`;
    const entry = assessments[dashKey] ?? {};
    const effectiveProgress = typeof entry.progress === "number" ? entry.progress : 0;
    return {
      dashKey,
      tag: "Katalog",
      title: thema.name,
      questionsLabel: questionCount > 0 ? `${questionCount} Fragen` : "Katalog",
      subtitle: thema.description || "Keine Beschreibung vorhanden.",
      est: DEFAULT_EST,
      features: DEFAULT_FEATURES,
      theme: "blue",
      effectiveProgress,
      topicId: thema.id,
      topicName: thema.name,
      assignmentId: thema.assignmentId,
    };
  }, [thema, assessments, questionCount]);

  /* --- Button: direkt zum Themen-Snapshot --- */
  const handleStart = (card: TopicCardModel) => {
    const dashKey = card.dashKey;
    const storeRaw = localStorage.getItem("assessments");
    const store = storeRaw ? JSON.parse(storeRaw) : {};
    const prev = store[dashKey] ?? {};
    const current = typeof prev.progress === "number" && prev.progress > 0 ? prev.progress : 1;

    store[dashKey] = {
      started: prev.started ?? new Date().toISOString(),
      progress: current,
      currentQuestion: prev.currentQuestion ?? 0,
    };
    localStorage.setItem("assessments", JSON.stringify(store));

    const qs = new URLSearchParams({
      token: accessToken,
      catalogId: card.topicId,
      catalogTitle: card.topicName,
      ...(card.assignmentId ? { assignmentId: card.assignmentId } : {}),
    });
    navigate(`${KATALOG_THEMEN_ROUTE}?${qs.toString()}`);
  };

  /* --- Render --- */
  return (
    <div className="bg-[#f7f8fb] text-[#333] min-h-screen">
      <AppHeader />

      <section className="text-center pt-10 pb-2 px-5">
        <h1 className="text-[28px] sm:text-[32px] font-bold mb-3">
          Willkommen, {welcomeName}!
        </h1>
        <p className="max-w-[740px] mx-auto text-slate-600">
          Hier finden Sie Ihren <strong>zugewiesenen Katalog</strong>. Öffnen Sie ihn, um die Inhalte einzusehen oder fortzusetzen.
        </p>
      </section>

     <section className="pb-16">
  <div className="max-w-[1280px] mx-auto px-4 flex justify-center">
    {!card ? (
      <div className="text-center text-slate-500 py-20">Kein Katalog gefunden.</div>
    ) : (
      <div className="w-full max-w-md">
        <CatalogCard data={card} onStart={() => handleStart(card)} />
      </div>
    )}
  </div>
</section>


      <footer className="text-center bg-white py-8 shadow-[0_-2px_5px_rgba(0,0,0,.03)]">
        <p>Ihr <strong>Katalog</strong> wurde geladen.</p>
        <div className="inline-block mt-2 bg-[#e6ffed] text-[#15803d] text-[14px] py-2 px-5 rounded-xl">
          ✅ Ihre Daten sind sicher und werden vertraulich behandelt
        </div>
      </footer>
    </div>
  );
}
