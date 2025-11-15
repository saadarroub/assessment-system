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

/* ================== Card ================== */
function CatalogCard({ data, onStart }: { data: TopicCardModel; onStart: () => void }) {
  const p = Math.max(0, Math.min(100, Math.round(data.effectiveProgress)));
  const running = p > 0 && p < 100;
  const completed = p >= 100;

  const btnLabel = completed ? "Neu starten →" : running ? "Umfrage fortsetzen →" : "Umfrage starten →";

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, [p]);

  return (
    <div
      className="
        catalog-card bg-white rounded-xl overflow-hidden
        shadow-[0_4px_16px_rgba(0,0,0,.05)]
        transition-all flex flex-col
        hover:shadow-[0_10px_25px_rgba(0,0,0,.10)] hover:-translate-y-1.5
        border border-black/5
        min-h-[520px]
      "
      data-assessment-id={data.dashKey}
    >
      <div className="card-header p-6 text-white relative bg-[#264555]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="relative z-[1] flex items-center justify-between gap-2 flex-wrap mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
            {data.tag}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
            {data.questionsLabel}
          </span>
        </div>

        {p >= 100 && (
          <span className="absolute right-4 top-4 rotate-[-13deg] bg-red-500 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded shadow-md">
            COMPLETED
          </span>
        )}

        <div className="relative z-[1]">
          <h2 className="text-xl font-bold mb-2">{data.title}</h2>
          <p className="text-sm/6 opacity-95 line-clamp-2">{data.subtitle}</p>
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

      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-5 mb-5 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Fragen : noch nicht implementiert</span>
          </div>
        </div>

        <h3 className="font-semibold mb-3 text-slate-800 text-sm">Umfrage-Features:</h3>
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

/* ================== Seite: KatalogThemenPublic ================== */
export default function KatalogThemenPublic() {
  type TabKey = "available" | "planned" | "done";
  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [tick, setTick] = useState(0);
  const [themen, setThemen] = useState<ThemaDto[] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* --- Query einmal memoizen --- */
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = useMemo(() => (query.get("token") || query.get("accessToken") || "").trim(), [query]);
  const accessCode = useMemo(() => (query.get("code") || "").trim(), [query]);
  //const catalogTitleFromQuery = useMemo(() => (query.get("catalogTitle") || "").trim(), [query]);
  const assignmentIdFromQuery = useMemo(() => (query.get("assignmentId") || "").trim(), [query]);

  /* --- Willkommen-Name --- */
  const [nameFromAssignment, setNameFromAssignment] = useState<string>("");
  const welcomeName = useMemo(() => {
    const nameInUrl = (query.get("name") || "").trim();
    return nameInUrl || nameFromAssignment || "Teilnehmer";
  }, [query, nameFromAssignment]);

  // Token & Code aus der URL

  //const sp = new URLSearchParams(location.search);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
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
        const catalogId = (query.get("catalogId") || "").trim();
        const wantsRefresh = (query.get("refresh") || "").trim() === "1";

        if (!catalogId) {
          setThemen([]);
          return;
        }
        setThemen(null);

        const live = await fetchThemenByCatalog(catalogId);
        if (!alive) return;
        const list = Array.isArray(live) ? live : [];

        if (assignmentIdFromQuery) {
          if (wantsRefresh) {
            writeSnapshotIds(assignmentIdFromQuery, list.map((t) => t.id));
            setThemen(list);
            return;
          }
          const snapIds = readSnapshotIds(assignmentIdFromQuery);
          if (snapIds && snapIds.length) {
            const setIds = new Set(snapIds);
            setThemen(list.filter((t) => setIds.has(t.id)));
            return;
          } else {
            writeSnapshotIds(assignmentIdFromQuery, list.map((t) => t.id));
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
  }, [query, assignmentIdFromQuery]);

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
    return list.map((t) => {
      //const dashKey = `topic:${t.id}`;
      const assignmentId = assignmentIdFromQuery || "unknown";
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
  },[themen, assessments, token, assignmentIdFromQuery]);

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
      ...(token ? { accessToken: token } : {}),
      ...(query.get("catalogId") ? { catalogId: (query.get("catalogId") || "").trim() } : {}),
      ...(query.get("catalogTitle") ? { catalogTitle: (query.get("catalogTitle") || "").trim() } : {}),
      ...(query.get("assignmentId") ? { assignmentId: (query.get("assignmentId") || "").trim() } : {}),
      ...(welcomeName ? { name: welcomeName } : {}),
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
  const tabBtnBase = "relative -bottom-[2px] px-6 py-3 border-b-[3px] font-medium transition-all";
  const tabBtn = (key: TabKey) =>
    `${tabBtnBase} ${activeTab === key ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`;

  const Grid = ({ list }: { list: TopicCardModel[] }) => (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(350px,1fr))]">
      {list.map((c) => (
        <CatalogCard key={c.dashKey} data={c} onStart={() => handleStart(c)} />
      ))}
    </div>
  );


  return (
    <div className="bg-[#f7f8fb] text-[#333] min-h-screen">
      <AppHeader />

      {/* EIN gemeinsamer Intro-Header mit Willkommen + optionalem Katalogtitel */}
      <section className="text-center pt-10 pb-2 px-5">
        <GreetingBanner firstName={welcomeName} />
        {/**<p className="max-w-[740px] mx-auto text-slate-600">
          Sie sehen den Katalog <strong>{catalogTitleFromQuery}</strong>. Wählen Sie unten ein Thema, um zu starten oder fortzusetzen.
        </p> */}
      </section>
      <section>
        {/* Countdown nur anzeigen, wenn wir expiresAt haben */}
        {expiresAt && (
          <div className="mt-1 flex items-center justify-center">
            <CountdownTimer expiresAt={expiresAt} />
          </div>
        )}
      </section>

      <section className="pt-6 pb-6">
        <div className="max-w-[1120px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.06)] border border-slate-100 py-6 text-center">
            <div className="text-[28px] font-extrabold text-[#1e3a8a]">{available.length}</div>
            <div className="text-slate-600">Offene Themen</div>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.06)] border border-slate-100 py-6 text-center">
            <div className="text-[28px] font-extrabold text-[#1e3a8a]">{planned.length}</div>
            <div className="text-slate-600">Laufende Themen</div>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.06)] border border-slate-100 py-6 text-center">
            <div className="text-[28px] font-extrabold text-[#1e3a8a]">{done.length}</div>
            <div className="text-slate-600">Abgeschlossene Themen</div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center border-b-2 border-slate-200">
            <button className={tabBtn("available")} onClick={() => setActiveTab("available")}>
              Offene Themen
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
                    <p>kein themen hier.</p>
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
                    <p>Starten Sie ein Thema, um es hier zu sehen.</p>
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
                    <p>Abgeschlossene Themen erscheinen hier.</p>
                  </div>
                ))}
            </>
          )}
        </div>
      </section>

      <footer
        id="cap-footer"
        // wir übergeben die URL in eine CSS-Variable und lesen sie in der Klasse aus
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
