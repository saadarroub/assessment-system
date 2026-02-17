import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "@/shared/app/AppHeader";
import { fetchThemenByCatalog, getQuestionCountForThema } from "@/shared/service/themaCatalogService";
import type { ThemaDto } from "@/shared/service/themaCatalogService";
import { getState, calcProgressPct } from "@/shared/service/publicAssessmentService";
import { fetchAssignmentByAccessCode, fetchInviteMeta } from "@/shared/service/inviteService";
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

/*  Style-/Card-Texte  */
const DEFAULT_EST = "15–20 Min";
const DEFAULT_FEATURES = ["Dynamische Fragentiefe", "Echtzeit-Fortschritt", "Adaptive Felder"];

/*  Snapshot-Helper  */
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
  statusFromApi?: string | null;
};

type AssessEntry = {
  started?: string;
  progress?: number;
  currentQuestion?: number;
  sessionId?: string; // <- wichtig fürs Live-Update
  completedAt?: string;
  status?: string;
};

function CatalogCard({ data, onStart }: { data: TopicCardModel; onStart: () => void }) {
  const p = Math.max(0, Math.min(100, Math.round(data.effectiveProgress)));
  const status = (data.statusFromApi || "").toLowerCase();

  const isApiCompleted = status === "completed";
  const isFullyAnswered = p >= 100;
  const hasProgress = p > 0;

  // Fall 2 – wirklich fertig
  const completed = isFullyAnswered && isApiCompleted;

  // Fall 1 – „Pseudo fertig“ (100 %, aber kein completed)
  const pseudoCompleted = isFullyAnswered && !isApiCompleted;

  // "running" = alles mit Fortschritt, das nicht wirklich completed ist
  const running = hasProgress && !completed;

  // Button-Label je nach Zustand
  let btnLabel: string | null = null;

  if (pseudoCompleted) {
    // Fall 1 – Pseudo fertig: 100 %, aber kein completed → Button "Zusammenfassung ..."
    btnLabel = "Zusammenfassung Ihres Assessments →";
  } else if (running) {
    // normal laufend
    btnLabel = "Umfrage fortsetzen →";
  } else if (!hasProgress) {
    // noch gar nicht angefangen
    btnLabel = "Umfrage starten →";
  }


  const [animate, setAnimate] = useState(false);

  const prevP = useRef<number>(p);

  useEffect(() => {
    prevP.current = p;
  }, [p]);

  //  Status-abhängige Basis-Styles (nur Blautöne + Gold) 
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

          {/* Status-Badges  */}
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

      {/* Fortschritt*/}
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
              style={{ width: `${p}%` }}

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
              <span>{data.questionsLabel}</span>
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
        {btnLabel && !completed && (
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
        {completed && (
          <div className="mt-auto pt-2 text-sm text-slate-500">

          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="
        min-w-0
        rounded-2xl border border-[hsla(215,20%,88%,0.65)]
        bg-white/80 backdrop-blur-md
        px-4 py-4 sm:px-6 sm:py-5
        text-center
        shadow-[0_10px_22px_-10px_rgba(15,23,42,.12)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-[hsla(45,60%,55%,0.55)]
        hover:shadow-[0_18px_38px_-14px_rgba(15,23,42,.18)]
      "
    >
      <div className="text-[22px] sm:text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
        {value}
      </div>

      <div className="mt-1 text-[11px] sm:text-sm font-medium text-[hsl(215_20%_45%)] leading-snug">
        {label}
      </div>
    </div>
  );
}
export default function KatalogThemenPublic() {
  type TabKey = "available" | "planned" | "done";
  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [tick, setTick] = useState(0);
  const [themen, setThemen] = useState<ThemaDto[] | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  const navigate = useNavigate();
  const location = useLocation();
  /*  Query einmal memoizen (nur noch für token / refresh etc.)  */
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tokenFromUrl = useMemo(
    () => (query.get("token") || query.get("accessToken") || "").trim(),
    [query]
  );
  const assignmentIdFromQuery = useMemo(
    () => (query.get("assignmentId") || "").trim(),
    [query]
  );

  /*  Session-Meta aus InviteGate lesen  */
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

  /*  Effektive Werte (Session > URL)  */
  const token = sessionMeta?.token || tokenFromUrl;
  const accessCode = sessionMeta?.accessCode || (query.get("code") || "").trim();
  const assignmentIdEffective = sessionMeta?.assignmentId || assignmentIdFromQuery;

  /*  Willkommen-Name  */
  const [nameFromAssignment, setNameFromAssignment] = useState<string>("");

  const welcomeName = useMemo(() => {
    // Priorität: Name aus Session (workerName), dann evtl. Name aus Assignment-Fetch
    return sessionMeta?.workerName || nameFromAssignment || "Teilnehmer";
  }, [sessionMeta, nameFromAssignment]);

  //const sp = new URLSearchParams(location.search);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);


  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [bubbleActive, setBubbleActive] = useState(false);
  const [mobileTimeExpanded, setMobileTimeExpanded] = useState(false);
  const EXP_TOTAL_PREFIX = "publicExpireTotalMs:";
  const [expiresTotalMs, setExpiresTotalMs] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return;

    const key = `${EXP_TOTAL_PREFIX}${token || accessCode || assignmentIdEffective || "default"}`;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const v = Number(raw);
        if (Number.isFinite(v) && v > 0) {
          setExpiresTotalMs(v);
          return;
        }
      }

      // erster Besuch: total = Restzeit JETZT
      const total = Math.max(1, target - Date.now());
      localStorage.setItem(key, String(total));
      setExpiresTotalMs(total);
    } catch {
      setExpiresTotalMs(Math.max(1, target - Date.now()));
    }
  }, [expiresAt, token, accessCode, assignmentIdEffective]);


  //  neu (Meta/Messenger Verhalten)
  const PADDING = 8;
  const DRAG_THRESHOLD = 8;

  // responsive Bubble-Größe
  const [vw, setVw] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const BUBBLE_SIZE = useMemo(() => {
    if (vw < 520) return 120;   // sehr klein
    if (vw < 1024) return 140;  // Tablet
    return 160;                // Desktop
  }, [vw]);


  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>(() => {
    const fallback = {
      x: window.innerWidth - 240,
      y: window.innerHeight - 360,
    };

    try {
      const raw = localStorage.getItem("publicBubblePos");
      if (!raw) return clampPos(fallback.x, fallback.y, 160, 160);

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
        return clampPos(parsed.x, parsed.y, 160, 160);
      }
    } catch { }

    return clampPos(fallback.x, fallback.y, 160, 160);
  });
  const dragRef = useRef({
    dragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Position speichern 
  useEffect(() => {
    try {
      localStorage.setItem("publicBubblePos", JSON.stringify(bubblePos));
    } catch { }
  }, [bubblePos]);

  function clampPos(x: number, y: number, w: number, h: number) {
    const maxX = window.innerWidth - w - PADDING;
    const maxY = window.innerHeight - h - PADDING;
    return {
      x: Math.max(PADDING, Math.min(maxX, x)),
      y: Math.max(PADDING, Math.min(maxY, y)),
    };
  }

  function snapToEdge(x: number, y: number, w: number, h: number) {
    const mid = window.innerWidth / 2;
    const maxX = window.innerWidth - w - PADDING;
    const targetX = x + w / 2 < mid ? PADDING : maxX;
    return clampPos(targetX, y, w, h);
  }
  useEffect(() => {
    setBubblePos((p) => clampPos(p.x, p.y, BUBBLE_SIZE, BUBBLE_SIZE));
  }, [BUBBLE_SIZE]);


  function onBubblePointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const el = bubbleRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;

    dragRef.current.dragging = false; // <- wichtig: erst nach threshold
    setBubbleActive(true);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onBubblePointerMove(e: React.PointerEvent) {
    const el = bubbleRef.current;
    if (!el) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    // erst nach threshold wirklich ziehen
    if (!dragRef.current.dragging) {
      if (dist < DRAG_THRESHOLD) return;
      dragRef.current.dragging = true;
      setIsDragging(true);
    }

    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const x = e.clientX - dragRef.current.offsetX;
    const y = e.clientY - dragRef.current.offsetY;

    setBubblePos(clampPos(x, y, w, h));
  }

  function onBubblePointerUp(e: React.PointerEvent) {
    const el = bubbleRef.current;
    if (!el) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    const wasDragging = dragRef.current.dragging;

    dragRef.current.pointerId = -1;
    dragRef.current.dragging = false;
    setIsDragging(false);

    // Snap nur wenn wirklich gezogen wurde
    if (wasDragging) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setBubblePos((p) => snapToEdge(p.x, p.y, w, h));
    }

    setBubbleActive(false);
  }

  const remaining = useMemo(() => {
    if (!expiresAt) return null;

    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return null;

    const remainingMs = Math.max(0, target - now);

    const totalSec = Math.floor(remainingMs / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    return { d, h, m, s, expired: remainingMs <= 0, remainingMs };

  }, [expiresAt, now]);

  const ringPct = useMemo(() => {
    if (!remaining) return 0;
    const remainingInDaySec = remaining.h * 3600 + remaining.m * 60 + remaining.s;
    const pct = 1 - remainingInDaySec / 86400; // 0..1
    return Math.max(0, Math.min(100, pct * 100));
  }, [remaining]);

  const mobileRingPct = useMemo(() => {
    if (!remaining || !expiresTotalMs) return 0;
    const pct = 1 - remaining.remainingMs / expiresTotalMs; // 0..1
    return Math.max(0, Math.min(100, pct * 100));
  }, [remaining, expiresTotalMs]);

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

  /*  Themen laden: per ?catalogId=... (+ assignmentId Snapshot)  */
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
            // Fragenanzahl für alle Themen laden
            list.forEach(async (t) => {
              try {
                const count = await getQuestionCountForThema(t.id);
                setQuestionCounts((prev) => ({ ...prev, [t.id]: count }));
              } catch (e) {
                console.error("Fehler beim Laden der Fragenanzahl für Thema", t.id, e);
              }
            });
            return;
          }
          const snapIds = readSnapshotIds(assignmentIdSafe);
          if (snapIds && snapIds.length) {
            const setIds = new Set(snapIds);
            const filteredList = list.filter((t) => setIds.has(t.id));
            setThemen(filteredList);
            // Fragenanzahl für gefilterte Themen laden
            filteredList.forEach(async (t) => {
              try {
                const count = await getQuestionCountForThema(t.id);
                setQuestionCounts((prev) => ({ ...prev, [t.id]: count }));
              } catch (e) {
                console.error("Fehler beim Laden der Fragenanzahl für Thema", t.id, e);
              }
            });
            return;
          } else {
            writeSnapshotIds(assignmentIdSafe, list.map((t) => t.id));
            setThemen(list);
            // Fragenanzahl für alle Themen laden
            list.forEach(async (t) => {
              try {
                const count = await getQuestionCountForThema(t.id);
                setQuestionCounts((prev) => ({ ...prev, [t.id]: count }));
              } catch (e) {
                console.error("Fehler beim Laden der Fragenanzahl für Thema", t.id, e);
              }
            });
            return;
          }
        }
        setThemen(list);
        // Fragenanzahl für alle Themen laden
        list.forEach(async (t) => {
          try {
            const count = await getQuestionCountForThema(t.id);
            setQuestionCounts((prev) => ({ ...prev, [t.id]: count }));
          } catch (e) {
            console.error("Fehler beim Laden der Fragenanzahl für Thema", t.id, e);
          }
        });
      } catch {
        if (alive) setThemen([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [query, sessionMeta, assignmentIdEffective]);

  /*  assessments aus localStorage  */
  const assessments = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("assessments") || "{}") as Record<string, AssessEntry>;
    } catch {
      return {};
    }
  }, [tick]);

  /*  Cards bauen + Live-Progress mit sessionId vom Backend  */
  const topicCards: TopicCardModel[] = useMemo(() => {
    const list = Array.isArray(themen) ? themen : [];
    const assignmentId = assignmentIdEffective || "unknown";
    return list.map((t) => {
      const dashKey = `assignment:${assignmentId}:topic:${t.id}`;
      const entry = assessments[dashKey] ?? {};
      let effectiveProgress = typeof entry.progress === "number" ? entry.progress : 0;
      const statusFromApi = (entry as AssessEntry).status || null;

      if (token && entry.sessionId) {
        getState(token, entry.sessionId)
          .then((state) => {
            const newProgress = calcProgressPct(state);
            const newStatus = state.status ?? (entry as AssessEntry).status;
            // nur speichern, wenn sich etwas geändert hat
            if (newProgress !== effectiveProgress || newStatus !== (entry as AssessEntry).status) {
              const next: Record<string, AssessEntry> = {
                ...assessments,
                [dashKey]: {
                  ...(entry as AssessEntry),
                  progress: newProgress,
                  status: newStatus,
                },
              };
              localStorage.setItem("assessments", JSON.stringify(next));
              setTick((t) => t + 1);
            }
          })
          .catch(() => { });
      }

      const questionCount = questionCounts[t.id] ?? 0;
      return {
        dashKey,
        tag: "Thema",
        title: t.name || "Unbenanntes Thema",
        questionsLabel: questionCount > 0 ? `${questionCount} Fragen` : "Lade...",
        subtitle: t.description || "Kein Beschreibungstext vorhanden.",
        est: DEFAULT_EST,
        features: DEFAULT_FEATURES,
        theme: "blue",
        effectiveProgress,
        topicId: t.id,
        topicName: t.name || "",
        statusFromApi,
      };
    });
  }, [themen, assessments, token, assignmentIdEffective, questionCounts]);

  /*  Tabs  */
  const available = topicCards.filter((c) => c.effectiveProgress === 0);

  const isCompletedCard = (c: TopicCardModel) =>
    c.effectiveProgress >= 100 &&
    (
      (c.statusFromApi || "").toLowerCase() === "completed"
      || c.statusFromApi == null
    );

  const planned = topicCards.filter((c) => {
    if (c.effectiveProgress === 0) return false;
    if (isCompletedCard(c)) return false;
    return true;
  });

  const done = topicCards.filter(isCompletedCard);
  const allCompleted =
    topicCards.length > 0 &&
    done.length === topicCards.length;

  console.log(allCompleted);

  useEffect(() => {
    if (allCompleted) {
      navigate("/public/assessment-completed", { replace: true });
    }
  }, [allCompleted]);


  /*  Start/Fortsetzen: bestehenden sessionId-Wert NICHT überschreiben  */
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

  /*  Storage-/Visibility-Listener  */
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
        bg-gray-200

        text-[hsl(215_80%_15%)]
      "
    >
      <style>{`
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
     /* ===== Gold Shimmer (für Pill/Bubble) ===== */
  @keyframes capShimmer {
    0%   { background-position: 0% 50%; }
    100% { background-position: 220% 50%; }
  }
    @keyframes dialPulse {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(56,189,248,0.0)); }
  50%      { filter: drop-shadow(0 10px 22px rgba(56,189,248,0.22)); }
}

`}</style>


      {/* Deko nur im Content-Bereich, NICHT hinter dem Footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-64">
        {/*Hexagon Pattern (CSS-only) */}
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

      {/* bg-[#f7f8fb] text-[#333] min-h-screen*/}

      <AppHeader />
      <div
        ref={bubbleRef}
        onPointerDown={onBubblePointerDown}
        onPointerMove={onBubblePointerMove}
        onPointerUp={onBubblePointerUp}
        onMouseEnter={() => setBubbleActive(true)}
        onMouseLeave={() => {
          if (!dragRef.current.dragging) {
            setBubbleActive(false);
          }
        }}
        className={`
  fixed z-[999] select-none
  ${isDragging ? "cursor-grabbing" : "cursor-grab"}
`}

        style={{
          left: bubblePos.x,
          top: bubblePos.y,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          transition: isDragging ? "none" : "left 220ms ease, top 220ms ease",
          touchAction: "none",

        }}
      >
        {/* Progress-Ring (around the bubble) */}
        {(() => {
          const size = BUBBLE_SIZE;
          const stroke = 3;              // Ring-Dicke
          const r = (size / 2) - stroke; // Radius
          const c = 2 * Math.PI * r;     // Umfang
          const dash = bubbleActive ? (ringPct / 100) * c : 0;


          return (
            <svg
              className="absolute inset-0"
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Background Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(227,187,98,0.22)"
                strokeWidth={stroke}
              />

              {/* Progress Ring (only strong on hover) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(227,187,98,0.95)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: "stroke-dasharray 350ms ease, opacity 250ms ease",
                  opacity: bubbleActive ? 1 : 0,

                }}
              />
            </svg>
          );
        })()}
        {/* äußerer Ring + Glow */}
        <div
          className={`
    absolute inset-0 rounded-full
   
    ${bubbleActive ? "shadow-[0_0_0_6px_rgba(227,187,98,0.12),0_18px_60px_rgba(227,187,98,0.22)]" : "shadow-none"}
    transition-shadow duration-300
  `}
        />

        {/* subtiler Shine (nur hover) */}
        <div
          className={`
    pointer-events-none absolute inset-0 rounded-full
    bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_55%)]
    ${bubbleActive ? "opacity-100" : "opacity-0"}
    transition-opacity duration-300
  `}
        />

        {/* innerer Kreis */}
        <div
          className={`
    absolute inset-3 rounded-full
    bg-[#314856]
    border border-[rgba(210,201,185,0.45)]
    shadow-[0_18px_40px_rgba(15,23,42,0.32)]
    flex flex-col items-center justify-center
    text-center
    text-white

    transition-all duration-300 ease-out
    ${bubbleActive ? "scale-[1.06] shadow-[0_25px_55px_rgba(15,23,42,0.45)] " : "scale-100"}
  `}
        >

          {remaining ? (
            bubbleActive ? (
              /* HOVER: HH:MM:SS */
              <div className="flex flex-col items-center">
                <div className="text-[26px] font-bold tabular-nums leading-none">
                  {remaining.d}T{" "}
                  {String(remaining.h).padStart(2, "0")}:
                  {String(remaining.m).padStart(2, "0")}:
                  {String(remaining.s).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mt-1">
                  bis Ablauf
                </div>

              </div>
            ) : (
              /*  NORMAL: Tage */
              <>
                {remaining.d > 0 ? (
                  <>
                    <div
                      className={`
          text-[42px] font-extrabold leading-none
          ${remaining.d <= 2
                          ? "text-red-400"
                          : remaining.d <= 5
                            ? "text-[#E3BB62]"
                            : "text-white"
                        }
        `}
                    >
                      {remaining.d}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.2em] opacity-80 mt-1">
                      Tage
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[34px] font-extrabold leading-none tabular-nums text-white">
                      {remaining.h}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.2em] opacity-80 mt-1">
                      Stunden
                    </div>
                  </>
                )}
              </>

            )
          ) : (
            <div className="text-xs opacity-60">–</div>
          )}

        </div>
      </div>


      <section className="pt-10 pb-8 px-5">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
          {/* Greeting + Timer zusammen */}
          <div
            className="
    relative
    rounded-3xl
    border-2 border-slate-200/90
    bg-white/60
    shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]
    overflow-hidden
  "
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_55%)]" />

            <div className="relative p-3 sm:p-4">
              <GreetingBanner firstName={welcomeName} />
            </div>

            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-[calc(100%-24px)] sm:w-auto flex justify-center">
              <div
                className="
      inline-flex items-center justify-center gap-2
      rounded-full bg-white/85
      px-3 py-2 sm:px-4
      text-xs sm:text-sm
      text-slate-700
      border border-slate-200
      shadow-sm
      backdrop-blur
      max-w-full
    "
              >
                <span className="h-2 w-2 rounded-full bg-[#E3BB62] shrink-0" />
                <span className="font-medium text-center whitespace-nowrap">
                  Themen auswählen und starten
                </span>
              </div>
            </div>



          </div>


          <div className="grid grid-cols-2 min-[520px]:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
            <StatsCard value={available.length} label="Verfügbare Themen" />
            <StatsCard value={planned.length} label="Laufende Themen" />
            <StatsCard value={done.length} label="Abgeschlossene Themen" />
          </div>


        </div>
      </section>


      <section className="mb-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center border-b-2 border-slate-300">
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
    relative
    text-white
    bg-[#264555]
    [background-image:var(--cap-pattern)]
    bg-repeat bg-left-top
    [background-size:170px]
    py-16 pb-8

    border-t border-white/15
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
