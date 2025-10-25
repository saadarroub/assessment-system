// src/main/react/features/worker-area/WorkerDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/apps/app/AppHeader";
import { fetchThemenByCatalog } from "@/features/service/themaCatalogService";
import type { ThemaDto } from "@/features/service/themaCatalogService";

/* ================== Konfiguration ================== */
/** Platzhalter – später durch echte, pro User zugewiesene Katalog-ID ersetzen */
const CATALOG_ID = "10000001-2222-3333-4444-555555555555";

/**
 * Wohin der Start/Fortsetzen-Button verlinken soll,
 * bis eine echte Topic-Assessment-Route existiert.
 * Erlaubt: "it-strategy" | "cybersecurity" | "digital-transformation" | "data-management"
 */
const ASSESSMENT_ROUTE_TYPE:
  | "it-strategy"
  | "cybersecurity"
  | "digital-transformation"
  | "data-management" = "it-strategy";

/* ================== Style-/Card-Texte (Konstanten) ================== */
const DEFAULT_EST = "15–20 Min";
const DEFAULT_FEATURES = ["Dynamische Fragentiefe", "Echtzeit-Fortschritt", "Adaptive Felder"];

/* ================== Typen ================== */
type TopicCardModel = {
  /** Key im localStorage.assessments – pro Thema eindeutig */
  dashKey: string; // z.B. "topic:3fa8-..."
  tag: string; // "Thema"
  title: string; // Thema-Name
  questionsLabel: string; // z.B. "Thema"
  subtitle: string; // Thema-Description
  est: string; // "15–20 Min"
  features: string[]; // Feature-Liste
  theme: "blue"; // Farbe NICHT ändern -> bleibt Blau
  effectiveProgress: number; // aus localStorage
  topicId: string;
  topicName: string;
};

/* ================== Karten-Komponente (Style unverändert) ================== */
function CatalogCard({
  data,
  onStart,
}: {
  data: TopicCardModel;
  onStart: () => void;
}) {
  const p = Math.max(0, Math.min(100, Math.round(data.effectiveProgress)));
  const running = p > 0 && p < 100;
  const completed = p >= 100;

  const btnLabel = completed
    ? "Neu starten →"
    : running
    ? "Umfrage fortsetzen →"
    : "Umfrage starten →";

  // sanfte Progress-Animation
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
      {/* Header – Farbe unverändert (#264555) */}
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

      {/* Progress */}
      {p > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2 font-medium">
            <span>Fortschritt</span>
            <span className="progress-percent">{p}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-xl overflow-hidden">
            <div
              className="
                h-full rounded-xl
                bg-white
                transition-all duration-500 ease-in-out
              "
              style={{ width: `${animate ? p : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
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
          className="
            w-full py-3 rounded-lg text-white font-semibold transition-all mt-auto shadow-sm
            bg-[#264555] hover:bg-[#1f3846]
            hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
          "
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

/* ================== Seite ================== */
export default function WorkerDashboard() {
  type TabKey = "available" | "planned" | "done";
  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [tick, setTick] = useState(0);
  const [themen, setThemen] = useState<ThemaDto[] | null>(null);
  const navigate = useNavigate();

  /* --- Themen laden --- */
  useEffect(() => {
    let mounted = true;
    fetchThemenByCatalog(CATALOG_ID)
      .then((list) => mounted && setThemen(list))
      .catch(() => setThemen([]));
    return () => {
      mounted = false;
    };
  }, []);

  /* --- localStorage lesen --- */
  const assessments = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("assessments") || "{}") as Record<
        string,
        { started?: string; progress?: number; currentQuestion?: number }
      >;
    } catch {
      return {};
    }
  }, [tick]);

  /* --- Kartenmodell bauen --- */
  const topicCards: TopicCardModel[] = useMemo(() => {
    const list = Array.isArray(themen) ? themen : [];
    return list.map((t) => {
      const dashKey = `topic:${t.id}`;
      const entry = assessments[dashKey] ?? {};
      const effectiveProgress = typeof entry.progress === "number" ? entry.progress : 0;
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
  }, [themen, assessments]);

  /* --- Tabs --- */
  const available = topicCards.filter(
    (c) => !(c.effectiveProgress > 0 && c.effectiveProgress < 100) && c.effectiveProgress < 100
  );
  const planned = topicCards.filter((c) => c.effectiveProgress > 0 && c.effectiveProgress < 100);
  const done = topicCards.filter((c) => c.effectiveProgress >= 100);

  /* --- Start/Fortsetzen: 1% setzen + zur Assessment-Seite navigieren --- */
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

    // topicId & topicName an die AssessmentPage mitgeben
    const qp = new URLSearchParams({
      type: ASSESSMENT_ROUTE_TYPE,
      topicId: card.topicId,
      topicName: card.topicName, // URLSearchParams encodet automatisch
    });
    navigate(`/app/assessments?${qp.toString()}`);
  };

  /* --- Sichtbarkeit/Storage-Änderungen beobachten --- */
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

  /* --- UI Bits --- */
  const tabBtnBase =
    "relative -bottom-[2px] px-6 py-3 border-b-[3px] font-medium transition-all";
  const tabBtn = (key: TabKey) =>
    `${tabBtnBase} ${
      activeTab === key
        ? "border-blue-700 text-blue-700"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  const Grid = ({ list }: { list: TopicCardModel[] }) => (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(350px,1fr))]">
      {list.map((c) => (
        <CatalogCard key={c.dashKey} data={c} onStart={() => handleStart(c)} />
      ))}
    </div>
  );

  /* ================== Render ================== */
  return (
    <div className="bg-[#f7f8fb] text-[#333] min-h-screen">
      <AppHeader />

      {/* Intro */}
      <section className="text-center pt-10 pb-2 px-5">
        <h1 className="text-[24px] font-semibold mb-3">Assessment Plattform</h1>
        <p className="max-w-[620px] mx-auto text-slate-600">
          Bewerten Sie Ihre Unternehmensreife in verschiedenen Bereichen durch
          interaktive Umfragen und erhalten Sie detaillierte Analysen.
        </p>
      </section>

      {/* KPI-Cards */}
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

      {/* Tabs */}
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

      {/* Inhalte je Tab */}
      <section className="pb-16">
        <div className="max-w-[1280px] mx-auto px-4">
          {!themen ? (
            <div className="text-center text-slate-500 py-20">Lade Themen …</div>
          ) : themen.length === 0 ? (
            <div className="text-center text-slate-500 py-20">
              Keine Themen im Katalog gefunden.
            </div>
          ) : (
            <>
              {activeTab === "available" && <Grid list={available} />}
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

      {/* Footer */}
      <footer className="text-center bg-white py-8 shadow-[0_-2px_5px_rgba(0,0,0,.03)]">
        <p>
          Bereit loszulegen?
          <br />
          Wählen Sie eines der obigen Themen und starten Sie die Bewertung.
        </p>
        <div className="inline-block mt-2 bg-[#e6ffed] text-[#15803d] text-[14px] py-2 px-5 rounded-xl">
          ✅ Ihre Daten sind sicher und werden vertraulich behandelt
        </div>
      </footer>
    </div>
  );
}
