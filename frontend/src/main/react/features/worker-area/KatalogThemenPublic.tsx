import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "@/apps/app/AppHeader";
import { fetchThemenByCatalog } from "@/features/service/themaCatalogService";
import type { ThemaDto } from "@/features/service/themaCatalogService";
import { getState, calcProgressPct } from "@/features/service/publicAssessmentService";
import { fetchAssignmentByAccessCode, fetchInviteMeta } from "@/features/service/inviteService";
import CountdownTimer from "@/features/worker-area/CountdownTimer";
import GreetingBanner from "@/features/worker-area/begruessung";
import patternUrl from "@/assets/footer-pattern.svg";
import type { CatalogLinkMeta } from "@/core/router/buildCatalogUrl";

/* ========= Session-Meta aus InviteGate ========= */
const SESSION_KEY = "publicAssessmentSession";

type PublicAssessmentSession = {
  token: string;
  assignmentId: string;
  catalogId: string;
  catalogTitle: string;
  workerName: string;
  accessCode?: string;
};

/* ================== Style-/Card-Texte ================== */
const DEFAULT_EST = "15–20 Min";
const DEFAULT_FEATURES = ["Dynamische Fragentiefe", "Echtzeit-Fortschritt", "Adaptive Felder"];

/* ================== Snapshot-Helper ================== */
const SNAP_PREFIX = "snapshot:themas:";
function readSnapshotIds(assignmentId: string): string[] | null {
  try {
    const raw = localStorage.getItem(`${SNAP_PREFIX}${assignmentId}`);
    if (!raw) return null;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? (ids as string[]) : null;
  } catch {
    return null;
  }
}
function writeSnapshotIds(assignmentId: string, ids: string[]) {
  try {
    localStorage.setItem(`${SNAP_PREFIX}${assignmentId}`, JSON.stringify(ids));
  } catch { }
}

/* ================== Types ================== */
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
};

type AssessEntry = {
  started?: string;
  progress?: number;
  currentQuestion?: number;
  sessionId?: string; // <- wichtig fürs Live-Update
};

function CompletedRibbon() {
  return (
    <div className="pointer-events-none absolute right-[-28px] top-[-10px] rotate-[-24deg] z-0">
      <div
        className="
          px-14 py-2
          rounded-full
          border border-white/40
          bg-white/12
          shadow-[0_18px_45px_rgba(15,23,42,0.55)]
          backdrop-blur-sm
        "
      >
        <span
          className="
            text-[10px]
            font-semibold
            tracking-[0.35em]
            uppercase
            text-white/85
            whitespace-nowrap
          "
        >
          Abgeschlossen
        </span>
      </div>
    </div>
  );
}


/* ================== Card ================== */
function CatalogCard({ data, onStart }: { data: TopicCardModel; onStart: () => void }) {
  const p = Math.max(0, Math.min(100, Math.round(data.effectiveProgress)));
  const running = p > 0 && p < 100;
  const completed = p >= 100;

  const btnLabel = running ? "Umfrage fortsetzen →" : "Umfrage starten →";

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, [p]);

  // === Status-abhängige Basis-Styles (nur Blautöne + Gold) ===
  const cardClass = [
    "catalog-card relative overflow-hidden flex flex-col",
    "rounded-[22px] bg-white/90 backdrop-blur-xl",
    "shadow-[0_35px_80px_-30px_rgba(23,37,84,.35)]",
    "transition-all duration-300",
    "hover:-translate-y-1 hover:shadow-[0_40px_90px_-35px_rgba(23,37,84,.45)]",
    "min-h-[520px]",
    completed
      ? "border border-[#d7c69a]"                     // Goldlichter Rand
      : running
      ? "border border-[#E3BB62]/80"                  // leicht goldener Rand
      : "border border-[hsla(215,20%,88%,0.9)]",      // neutrales Hellgrau
  ].join(" ");

  // Header immer in der gleichen Blau-Familie (wie dein mittleres Beispiel)
  const headerClass = [
    "card-header p-6 text-white relative",
    completed
      ? "bg-[linear-gradient(135deg,#48566f_0%,#264555_100%)]" // etwas grauer/ruhiger
      : running
      ? "bg-[linear-gradient(135deg,#3f6aa5_0%,#264555_100%)]" // mittleres Blau (wie Mitte)
      : "bg-[linear-gradient(135deg,#345c8c_0%,#264555_100%)]", // leicht heller für „neu“
  ].join(" ");

  return (
    <div className={cardClass} data-assessment-id={data.dashKey}>
      <div className={headerClass}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

        <div className="relative z-[1] flex items-center justify-between gap-2 flex-wrap mb-3">
          {/* Kategorie-Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/18 backdrop-blur">
            {data.tag}
          </span>

          {/* Status-Badges – alle in Blau/Gold, kein Grün */}
          {completed && (
            <span
              className="
                inline-flex items-center gap-1
                rounded-full bg-white/12 px-3 py-1
                text-[11px] font-semibold uppercase tracking-[0.16em]
                border border-[#E3BB62]/70
              "
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
              Abgeschlossen
            </span>
          )}

          {running && !completed && (
            <span
              className="
                inline-flex items-center gap-1
                rounded-full bg-black/10 px-3 py-1
                text-[11px] font-semibold uppercase tracking-[0.16em]
                border border-white/30
              "
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-200" />
              Laufend
            </span>
          )}
        </div>

        <div className="relative z-[1]">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">{data.title}</h2>
          <p className="text-sm/6 opacity-95 line-clamp-2">{data.subtitle}</p>
        </div>
      </div>

      {/* Fortschritt – immer blau, bei 100% nur Label anders */}
      {p > 0 && (
        <div className="progress-section px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 mb-2 font-medium">
            <span>{completed ? "Abgeschlossen" : "Fortschritt"}</span>
            <span className={`progress-percent ${completed ? "text-[#E3BB62]" : ""}`}>{p}%</span>
          </div>

          <div className="h-2 bg-slate-200 rounded-xl overflow-hidden">
            <div
              className="
                progress-bar h-full rounded-xl
                transition-all duration-500 ease-in-out
                bg-[linear-gradient(90deg,#4f88d2_0%,#264555_100%)]
              "
              style={{ width: `${animate ? p : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Info-Zeile */}
        <div className="flex flex-wrap gap-5 mb-5 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {completed ? (
              <span>Umfrage abgeschlossen</span>
            ) : (
              <span>Fragen : noch nicht implementiert</span>
            )}
          </div>
        </div>

        {/* Features – bei Abgeschlossen minimal dezenter */}
        <h3 className="font-semibold mb-3 text-slate-800 text-sm">Umfrage-Features:</h3>
        <ul className={`list-none mb-6 space-y-1.5 ${completed ? "opacity-85" : ""}`}>
          {data.features.map((f) => (
            <li
              key={f}
              className="py-1.5 flex items-center gap-2.5 text-sm text-slate-700"
            >
              <span
                className={`
                  w-[18px] h-[18px] rounded-full grid place-items-center text-[12px] font-bold shrink-0
                  bg-sky-50 text-[#264555]
                `}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Button nur, wenn noch nicht abgeschlossen */}
        {!completed && (
          <button
            onClick={onStart}
            className="
              w-full py-3 rounded-lg text-white font-semibold transition-all mt-auto shadow-sm
              bg-[linear-gradient(135deg,#315c8c_0%,#264555_100%)]
              hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
            "
          >
            {btnLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="
        rounded-xl border border-[hsla(215,20%,88%,0.6)]
        bg-white/80 backdrop-blur-md
        px-6 py-5 text-center
        shadow-[0_10px_25px_-8px_rgba(15,23,42,.10)]
        transition
        hover:scale-[1.05]
        hover:border-[hsla(45,60%,55%,0.5)]
        hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,.18)]
      "
    >
      <div className="text-[28px] font-extrabold text-[#1e3a8a]">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-[hsl(215_20%_45%)]">
        {label}
      </div>
    </div>
  );
}

/* ================== Seite: KatalogThemenPublic ================== */
export default function KatalogThemenPublic() {
  type TabKey = "available" | "planned" | "done";
  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [tick, setTick] = useState(0);
  const [themen, setThemen] = useState<ThemaDto[] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  /* --- Query einmal memoizen (nur noch für token / refresh etc.) --- */
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tokenFromUrl = useMemo(
    () => (query.get("token") || query.get("accessToken") || "").trim(),
    [query]
  );
  const assignmentIdFromQuery = useMemo(
    () => (query.get("assignmentId") || "").trim(),
    [query]
  );

  /* --- Session-Meta aus InviteGate lesen --- */
  const [sessionMeta, setSessionMeta] = useState<PublicAssessmentSession | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PublicAssessmentSession;
      setSessionMeta(parsed);
    } catch (e) {
      console.warn("Fehler beim Lesen von publicAssessmentSession", e);
    }
  }, []);

  /* --- Effektive Werte (Session > URL) --- */
  const token = sessionMeta?.token || tokenFromUrl;
  const accessCode = sessionMeta?.accessCode || (query.get("code") || "").trim();
  const assignmentIdEffective = sessionMeta?.assignmentId || assignmentIdFromQuery;

  /* --- Willkommen-Name --- */
  const [nameFromAssignment, setNameFromAssignment] = useState<string>("");

  const welcomeName = useMemo(() => {
    // Priorität: Name aus Session (workerName), dann evtl. Name aus Assignment-Fetch
    return sessionMeta?.workerName || nameFromAssignment || "Teilnehmer";
  }, [sessionMeta, nameFromAssignment]);

  //const sp = new URLSearchParams(location.search);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
{/*
  const daysLeft = useMemo(() => {
    if (!expiresAt) return null;

    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return null;

    const diffMs = target - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }, [expiresAt]);
   */}

  //in expiresAt muss Z.b: 2025-11-05T18:00:00Z
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (token) {
          const meta = await fetchInviteMeta(token);
          if (!alive) return;
          if (meta?.expiresAt) setExpiresAt(meta.expiresAt);
        } else if (accessCode) {
          const a = await fetchAssignmentByAccessCode(accessCode);
          if (!alive) return;
          if (a?.expiresAt) setExpiresAt(a.expiresAt);
        }
      } catch (e) {
        console.warn("Kein expiresAt gefunden", e);
      }
    })();
    return () => { alive = false; };
  }, [token, accessCode]);

  // Falls ein ?code= vorhanden ist, Worker-Namen einmal holen
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!accessCode) return;
      try {
        const a = await fetchAssignmentByAccessCode(accessCode);
        if (!alive) return;
        setNameFromAssignment(a?.worker?.name || "");
      } catch {
        /* fallback bleibt "Teilnehmer" */
      }
    })();
    return () => {
      alive = false;
    };
  }, [accessCode]);

  /* --- Themen laden: per ?catalogId=... (+ assignmentId Snapshot) --- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const catalogId = (sessionMeta?.catalogId || query.get("catalogId") || "").trim();
        const wantsRefresh = (query.get("refresh") || "").trim() === "1";

        if (!catalogId) {
          setThemen([]);
          return;
        }
        setThemen(null);

        const assignmentIdSafe = (assignmentIdEffective || "").trim();
        const live = await fetchThemenByCatalog(catalogId);
        if (!alive) return;
        const list = Array.isArray(live) ? live : [];

        if (assignmentIdSafe) {
          if (wantsRefresh) {
            writeSnapshotIds(assignmentIdSafe, list.map((t) => t.id));
            setThemen(list);
            return;
          }
          const snapIds = readSnapshotIds(assignmentIdSafe);
          if (snapIds && snapIds.length) {
            const setIds = new Set(snapIds);
            setThemen(list.filter((t) => setIds.has(t.id)));
            return;
          } else {
            writeSnapshotIds(assignmentIdSafe, list.map((t) => t.id));
            setThemen(list);
            return;
          }
        }
        setThemen(list);
      } catch {
        if (alive) setThemen([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [query, sessionMeta, assignmentIdEffective]);

  /* --- assessments aus localStorage --- */
  const assessments = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("assessments") || "{}") as Record<string, AssessEntry>;
    } catch {
      return {};
    }
  }, [tick]);

  /* --- Cards bauen + Live-Progress mit sessionId vom Backend --- */
  const topicCards: TopicCardModel[] = useMemo(() => {
    const list = Array.isArray(themen) ? themen : [];
    const assignmentId = assignmentIdEffective || "unknown";

    return list.map((t) => {
      const dashKey = `assignment:${assignmentId}:topic:${t.id}`;
      const entry = assessments[dashKey] ?? {};
      let effectiveProgress = typeof entry.progress === "number" ? entry.progress : 0;

      if (token && entry.sessionId) {
        getState(token, entry.sessionId)
          .then((state) => {
            const newProgress = calcProgressPct(state);
            if (newProgress !== effectiveProgress) {
              const next = { ...assessments, [dashKey]: { ...entry, progress: newProgress } };
              localStorage.setItem("assessments", JSON.stringify(next));
              setTick((t) => t + 1);
            }
          })
          .catch(() => { });
      }

      return {
        dashKey,
        tag: "Thema",
        title: t.name || "Unbenanntes Thema",
        questionsLabel: "Thema",
        subtitle: t.description || "Kein Beschreibungstext vorhanden.",
        est: DEFAULT_EST,
        features: DEFAULT_FEATURES,
        theme: "blue",
        effectiveProgress,
        topicId: t.id,
        topicName: t.name || "",
      };
    });
  }, [themen, assessments, token, assignmentIdEffective]);


  /* --- Tabs --- */
  const available = topicCards.filter((c) => !(c.effectiveProgress > 0 && c.effectiveProgress < 100) && c.effectiveProgress < 100);
  const planned = topicCards.filter((c) => c.effectiveProgress > 0 && c.effectiveProgress < 100);
  const done = topicCards.filter((c) => c.effectiveProgress >= 100);

  /* --- Start/Fortsetzen: bestehenden sessionId-Wert NICHT überschreiben --- */
  const handleStart = (card: TopicCardModel) => {
    const dashKey = card.dashKey;
    const storeRaw = localStorage.getItem("assessments");
    const store: Record<string, AssessEntry> = storeRaw ? JSON.parse(storeRaw) : {};
    const prev = store[dashKey] ?? {};
    const current = typeof prev.progress === "number" && prev.progress > 0 ? prev.progress : 1;

    store[dashKey] = {
      started: prev.started ?? new Date().toISOString(),
      progress: current,
      currentQuestion: prev.currentQuestion ?? 0,
      sessionId: prev.sessionId, // beibehalten
    };
    localStorage.setItem("assessments", JSON.stringify(store));

    // Original-Query übernehmen + Name weiterreichen
    const qp = new URLSearchParams({
      topicId: card.topicId,
      topicName: card.topicName,
    });

    navigate(`/app/assessments?${qp.toString()}`);
  };

  useEffect(() => {
    // wir lesen alles, was wir brauchen, aus der URL
    const tokenInUrl = (query.get("token") || "").trim();
    const accessTokenInUrl = (query.get("accessToken") || tokenInUrl).trim();
    const catalogId = (query.get("catalogId") || "").trim();
    const catalogTitle = (query.get("catalogTitle") || "").trim();
    const assignmentId = (query.get("assignmentId") || "").trim();
    const name = (query.get("name") || welcomeName || "Teilnehmer").trim();
    const code = (query.get("code") || "").trim();

    // nur speichern, wenn die wichtigsten Felder da sind
    if ((tokenInUrl || accessTokenInUrl) && catalogId && assignmentId) {
      const meta: CatalogLinkMeta = {
        token: tokenInUrl || accessTokenInUrl,
        accessToken: accessTokenInUrl || tokenInUrl,
        catalogId,
        catalogTitle,
        assignmentId,
        name,
        code,
      };
      localStorage.setItem("activeAssignmentMeta", JSON.stringify(meta));
    }
  }, [query, welcomeName]);

  /* --- Storage-/Visibility-Listener --- */
  useEffect(() => {
    const onShow = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "assessments") setTick((t) => t + 1);
    };
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* --- UI --- */
  const tabBtnBase =
    "relative -bottom-[2px] px-6 py-3 border-b-[3px] font-medium transition-all";

  const tabBtn = (key: TabKey) =>
    `${tabBtnBase} ${activeTab === key
      ? "border-[#E3BB62] text-[#264555] bg-white rounded-t-xl"  // bg-white
      : "border-transparent text-slate-500 hover:text-[#264555]/80"
    }`;


  const Grid = ({ list }: { list: TopicCardModel[] }) => (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(350px,1fr))]">
      {list.map((c) => (
        <CatalogCard key={c.dashKey} data={c} onStart={() => handleStart(c)} />
      ))}
    </div>
  );


  return (

    <div className="
        relative min-h-screen overflow-hidden
        bg-[linear-gradient(135deg,hsl(0_0%_98%)_0%,hsl(215_20%_96%)_50%,hsl(0_0%_98%)_100%)]
        text-[hsl(215_80%_15%)]
      "
    >
      {/* Deko nur im Content-Bereich, NICHT hinter dem Footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-64">

        {/* Goldener Glow oben rechts */}
        <div className="absolute top-40 right-[-5rem] h-[26rem] w-[26rem] rounded-full blur-[90px] bg-[hsla(45,60%,55%,0.20)]" />
        {/* Dunklerer blauer Glow unten links */}
        <div className="absolute bottom-10 left-[-6rem] h-[22rem] w-[22rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />

        {/* Pünktchen */}
        <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute left-[26%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
        <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#E3BB62] opacity-70" />

        {/*
        <div
          className="
           hidden lg:block absolute lg:bottom-[210px] lg:right-[-4rem] xl:bottom-[195px] xl:right-[2%] 2xl:bottom-[180px] 2xl:right-[8%] h-40 w-40"
        >
          {daysLeft !== null && (
            <div
              className="
              hidden lg:block
              absolute bottom-[180px] right-[8%]
            "
            >
              <CircleTimer daysLeft={daysLeft} />
            </div>
          )}
        </div>
          */}
        {/* Kreis + Rechtecke – unten rechts, auf kleineren Screens weiter draußen */}
        <div
          className="
    hidden lg:block
    absolute
    lg:bottom-[210px] lg:right-[-4rem]
    xl:bottom-[195px] xl:right-[2%]
    2xl:bottom-[180px] 2xl:right-[8%]
    h-40 w-40
  "
        >
          {/* äußerer Ring (Gold) */}
          <div
            className="
      absolute inset-0
      rounded-full
      border border-[#E3BB62]
      bg-transparent
      opacity-90
    "
          />

          {/* innerer Kreis */}
          <div
            className="
      absolute inset-3
      rounded-full
      bg-[#314856]
      border border-[rgba(210,201,185,0.45)]
      shadow-[0_18px_40px_rgba(15,23,42,0.32)]
    "
          />

          {/* schmales Rechteck rechts oben */}
          <div
            className="
      absolute -right-8 top-4
      h-20 w-8
      rounded-[999px]
      bg-[#fff]
      border border-white/40
      backdrop-blur-[2px]
      shadow-[0_14px_28px_rgba(15,23,42,0.28)]
    "
          />

          {/* langes Rechteck unten links */}
          <div
            className="
      absolute -left-6 bottom-[-6px]
      h-7 w-24
      rounded-[999px]
      bg-[rgba(227,187,98,0.20)]
      border border-[rgba(227,187,98,0.55)]
      shadow-[0_10px_24px_rgba(15,23,42,0.25)]
    "
          />
        </div>
        <div className=" hidden lg:block absolute bottom-[180px] right-[8%] /* Position: unten rechts, über dem Footer */ h-40 w-40 " ></div>
      </div>
      {/* bg-[#f7f8fb] text-[#333] min-h-screen*/}

      <AppHeader />

      <section className="pt-10 pb-8 px-5">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
          {/* Greeting + Timer zusammen */}
          <div className="relative">
            <GreetingBanner firstName={welcomeName} />

            {expiresAt && (
              <div className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-1/2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-md text-sm text-slate-700">
                  <CountdownTimer expiresAt={expiresAt} />
                </div>
              </div>
            )}
          </div>

          {/* Stats-Cards direkt unter dem Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <StatsCard value={available.length} label="Verfügbare Themen" />
            <StatsCard value={planned.length} label="Laufende Themen" />
            <StatsCard value={done.length} label="Abgeschlossene Themen" />
          </div>
        </div>
      </section>


      <section className="mb-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center border-b-2 border-slate-200">
            <button className={tabBtn("available")} onClick={() => setActiveTab("available")}>
              Verfügbare Themen
            </button>
            <button className={tabBtn("planned")} onClick={() => setActiveTab("planned")}>
              Laufende Themen
            </button>
            <button className={tabBtn("done")} onClick={() => setActiveTab("done")}>
              Abgeschlossene Themen
            </button>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1280px] mx-auto px-4">
          {!themen ? (
            <div className="text-center text-slate-500 py-20">Lade Themen …</div>
          ) : themen.length === 0 ? (
            <div className="text-center text-slate-500 py-20">Keine Themen im Katalog gefunden.</div>
          ) : (
            <>
              {activeTab === "available" &&
                (available.length ? (
                  <Grid list={available} />
                ) : (
                  <div className="text-center py-20 text-slate-500">
                    <svg className="w-24 h-24 mx-auto mb-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    </svg>
                    <h2 className="text-xl font-semibold">Keine neuen Themen</h2>
                    <p>Gibt es keine Themen hier</p>
                  </div>
                ))}
              {activeTab === "planned" &&
                (planned.length ? (
                  <Grid list={planned} />
                ) : (
                  <div className="text-center py-20 text-slate-500">
                    <svg className="w-24 h-24 mx-auto mb-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    </svg>
                    <h2 className="text-xl font-semibold">Keine laufenden Themen</h2>
                    <p>Starten Sie ein Thema, um es hier zu sehen</p>
                  </div>
                ))}
              {activeTab === "done" &&
                (done.length ? (
                  <Grid list={done} />
                ) : (
                  <div className="text-center py-20 text-slate-500">
                    <svg className="w-24 h-24 mx-auto mb-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h2 className="text-xl font-semibold">Noch nichts abgeschlossen</h2>
                    <p>Abgeschlossene Themen erscheinen hier</p>
                  </div>
                ))}
            </>
          )}
        </div>
      </section>

      <footer
        id="cap-footer"
        style={{ ["--cap-pattern" as any]: `url(${patternUrl})` }}
        className="
        text-white
        bg-[#264555]                    /* CAP primary */
        [background-image:var(--cap-pattern)]
        bg-repeat bg-left-top
        [background-size:170px]         
        py-16 pb-8
      "
      >
        <div className="container mx-auto px-6">
          {/* Headline */}
          <div className="pb-6 text-center">
            <h4 className="text-2xl font-semibold">cap consulting GmbH</h4>
          </div>

          {/* zwei Spalten */}
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Adresse / Kontakt */}
            <div className="text-center md:text-left">
              <p className="leading-relaxed">
                Potsdamer Str. 150
                <br />
                33719 Bielefeld
              </p>

              <p className="mt-3">
                <a
                  href="tel:+4952199988300"
                  className="underline-offset-2 hover:underline"
                >
                  Tel.: +49 521 999 883 00
                </a>
              </p>

              <p className="mt-1">
                <a
                  href="mailto:kontakt@cap-consulting.de"
                  className="underline-offset-2 hover:underline"
                >
                  kontakt@cap-consulting.de
                </a>
              </p>
            </div>

            {/* Newsletter CTA */}
            <div className="text-center md:text-right">
              <p className="font-semibold">
                Up-to-date mit unserem IT-Newsletter
              </p>
              <a
                href="https://www.cap-consulting.de/newsletter-anmeldung/"
                className="
                mt-2 inline-flex items-center
                rounded-md bg-[#E3BB62] px-5 py-2
                font-medium text-[#264555]
                shadow hover:brightness-95
              "
              >
                Ich möchte aktuell bleiben
              </a>
            </div>
          </div>

          {/* Untere Link-Leiste */}
          <div className="mt-10  border-white/20 pt-4">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center text-white/90 lg:flex-row lg:justify-evenly">
              <p className="m-0">©2022 cap consulting GmbH</p>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/impressum/">
                Impressum
              </a>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/datenschutzerklaerung/">
                Datenschutz
              </a>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/haftungsausschluss/">
                Haftungsausschluss
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
