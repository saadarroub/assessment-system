// src/main/react/features/assessments/AssessmentPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Query-Helper */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** Typen */
type Question =
  | { id: number; text: string; type: "radio"; options: string[] }
  | { id: number; text: string; type: "checkbox"; options: string[] }
  | { id: number; text: string; type: "slider"; min: number; max: number; labels: [string, string] }
  | { id: number; text: string; type: "textarea"; placeholder?: string }
  | { id: number; text: string; type: "text"; placeholder?: string };

type AssessmentConfig = { title: string; subtitle: string; questions: Question[] };

/** Inhalte (unverändert) */
const assessmentConfigs: Record<string, AssessmentConfig> = {
  "it-strategy": {
    title: "IT-Strategie Grundlagen",
    subtitle: "Bewerten Sie Ihre IT-Strategie und -Infrastruktur",
    questions: [
      { id: 1, text: "Wie würden Sie den aktuellen Reifegrad Ihrer IT-Strategie bewerten?", type: "radio", options: [
        "Keine formale IT-Strategie vorhanden","Grundlegende IT-Strategie definiert","Gut dokumentierte und kommunizierte IT-Strategie","Vollständig integrierte und regelmäßig aktualisierte IT-Strategie",
      ]},
      { id: 2, text: "Wie gut ist Ihre IT-Strategie mit den Geschäftszielen abgestimmt?", type: "slider", min: 0, max: 10, labels: ["Nicht abgestimmt","Vollständig abgestimmt"] },
      { id: 3, text: "Welche der folgenden IT-Governance-Frameworks nutzen Sie? (Mehrfachauswahl möglich)", type: "checkbox", options: ["ITIL","COBIT","ISO/IEC 27001","TOGAF","Keine formalen Frameworks"] },
      { id: 4, text: "Wie häufig wird Ihre IT-Strategie überprüft und aktualisiert?", type: "radio", options: ["Nie oder sehr selten","Jährlich","Halbjährlich","Quartalsweise","Bei Bedarf und mindestens quartalsweise"] },
      { id: 5, text: "Beschreiben Sie kurz die größten Herausforderungen Ihrer aktuellen IT-Infrastruktur:", type: "textarea", placeholder: "Ihre Antwort..." },
      { id: 6, text: "Wie bewerten Sie die Skalierbarkeit Ihrer IT-Infrastruktur?", type: "slider", min: 0, max: 10, labels: ["Nicht skalierbar","Sehr skalierbar"] },
      { id: 7, text: "Welche Cloud-Services nutzen Sie derzeit?", type: "checkbox", options: ["Infrastructure as a Service (IaaS)","Platform as a Service (PaaS)","Software as a Service (SaaS)","Keine Cloud-Services"] },
      { id: 8, text: "Wie hoch ist der Automatisierungsgrad Ihrer IT-Prozesse?", type: "radio", options: ["Vollständig manuell (0-20%)","Teilweise automatisiert (21-50%)","Überwiegend automatisiert (51-80%)","Vollständig automatisiert (81-100%)"] },
    ],
  },
  cybersecurity: {
    title: "Cybersecurity Assessment",
    subtitle: "Erhebung des Reifegrads Ihrer Informationssicherheit",
    questions: [
      { id: 1, text: "Wie würden Sie den aktuellen Sicherheitsreifegrad Ihres Unternehmens bewerten?", type: "radio", options: [
        "Initial - Ad-hoc Sicherheitsmaßnahmen","Entwickelt - Grundlegende Sicherheitsrichtlinien","Definiert - Dokumentierte Sicherheitsprozesse","Verwaltet - Gemessene und kontrollierte Sicherheit","Optimiert - Kontinuierliche Verbesserung",
      ]},
      { id: 2, text: "Wie häufig führen Sie Sicherheitsaudits durch?", type: "radio", options: ["Nie","Jährlich","Halbjährlich","Quartalsweise","Monatlich oder häufiger"] },
      { id: 3, text: "Welche Sicherheitsstandards oder -frameworks haben Sie implementiert?", type: "checkbox", options: ["ISO/IEC 27001","NIST Cybersecurity Framework","CIS Controls","BSI IT-Grundschutz","TISAX","Keine formalen Standards"] },
      { id: 4, text: "Bewerten Sie Ihr Risikomanagement:", type: "slider", min: 0, max: 10, labels: ["Nicht vorhanden","Umfassend implementiert"] },
      { id: 5, text: "Welche technischen Sicherheitsmaßnahmen haben Sie implementiert?", type: "checkbox", options: [
        "Endpoint Protection","Network Segmentation","SIEM (Security Information & Event Management)","Vulnerability Management","Security Orchestration (SOAR)","Zero Trust Architecture",
      ] },
      { id: 6, text: "Wie bewerten Sie Ihr Incident Response Management?", type: "slider", min: 0, max: 10, labels: ["Nicht vorhanden","Vollständig etabliert"] },
      { id: 7, text: "Beschreiben Sie Ihre größten Sicherheitsbedenken:", type: "textarea", placeholder: "Ihre Antwort..." },
    ],
  },
  "digital-transformation": {
    title: "Digital Transformation",
    subtitle: "Bewertung des Digitalisierungsgrads im Branchenvergleich",
    questions: [
      { id: 1, text: "Auf welcher Stufe der digitalen Transformation befindet sich Ihr Unternehmen?", type: "radio", options: [
        "Digital Beginner - Erste Schritte","Digital Follower - Grundlegende Digitalisierung","Digital Leader - Fortgeschrittene Digitalisierung","Digital Champion - Vollständig digitalisiert",
      ]},
      { id: 2, text: "Wie stark ist die Digitalisierung in Ihrer Geschäftsstrategie verankert?", type: "slider", min: 0, max: 10, labels: ["Nicht verankert","Zentral verankert"] },
      { id: 3, text: "Welche digitalen Technologien setzen Sie ein?", type: "checkbox", options: [
        "Cloud Computing","Big Data Analytics","Künstliche Intelligenz","IoT (Internet of Things)","Mobile-First Ansatz","API-basierte Integration",
      ]},
      { id: 4, text: "Wie digital sind Ihre Kundenkontaktpunkte?", type: "slider", min: 0, max: 10, labels: ["Vollständig analog","Vollständig digital"] },
      { id: 5, text: "Welche Geschäftsprozesse haben Sie bereits digitalisiert?", type: "checkbox", options: [
        "Vertrieb & Marketing","Kundenservice","Produktion & Logistik","HR & Personalwesen","Finanzen & Controlling","Einkauf & Beschaffung",
      ]},
      { id: 6, text: "Beschreiben Sie Ihre Digitalisierungsziele für die nächsten 2 Jahre:", type: "textarea", placeholder: "Ihre Antwort..." },
    ],
  },
  "data-management": {
    title: "Data Management",
    subtitle: "Bewertung Ihrer Datenmanagement-Prozesse und -Strategie",
    questions: [
      { id: 1, text: "Wie bewerten Sie die Qualität Ihrer Unternehmensdaten?", type: "radio", options: [
        "Sehr niedrig - Viele Fehler und Inkonsistenzen","Niedrig - Häufige Qualitätsprobleme","Mittel - Akzeptable Qualität","Hoch - Gute Datenqualität","Sehr hoch - Exzellente Datenqualität",
      ]},
      { id: 2, text: "Haben Sie eine Data Governance Strategie implementiert?", type: "radio", options: [
        "Nein, nicht vorhanden","In Planung","Teilweise implementiert","Vollständig implementiert","Vollständig implementiert und kontinuierlich optimiert",
      ]},
      { id: 3, text: "Welche Datenmanagement-Tools nutzen Sie?", type: "checkbox", options: [
        "Master Data Management (MDM)","Data Quality Tools","Data Catalog","ETL/ELT Tools","Data Warehouse","Data Lake",
      ]},
      { id: 4, text: "Wie bewerten Sie Ihre Datenschutz-Compliance (DSGVO)?", type: "slider", min: 0, max: 10, labels: ["Nicht compliant","Vollständig compliant"] },
      { id: 5, text: "Welche Analytics-Fähigkeiten haben Sie aufgebaut?", type: "checkbox", options: [
        "Descriptive Analytics (Reporting)","Diagnostic Analytics (Ursachenanalyse)","Predictive Analytics (Vorhersagen)","Prescriptive Analytics (Empfehlungen)","Real-time Analytics","Self-Service Analytics",
      ]},
      { id: 6, text: "Beschreiben Sie Ihre größten Herausforderungen im Datenmanagement:", type: "textarea", placeholder: "Ihre Antwort..." },
    ],
  },
};

type Answers = Record<string, any>;

/** Mapping für „alte“ Dashboard-Keys, wenn KEIN Topic übergeben ist */
const DASH_KEY_MAP: Record<string, string> = {
  "it-strategy": "it-strategy",
  "cybersecurity": "cybersec",
  "digital-transformation": "dx",
  "data-management": "data-mgmt",
};

export default function AssessmentPage() {
  const query = useQuery();
  const type = query.get("type") || "it-strategy";

  // >>> Neu: Topic-Infos aus der URL
  const topicId = query.get("topicId") || "";
  const topicName = query.get("topicName") || "";

  const navigate = useNavigate();

  const baseConfig = assessmentConfigs[type] || assessmentConfigs["it-strategy"];
  const questions = baseConfig.questions;

  // >>> Neu: Storage-Keys pro Topic (falls vorhanden)
  const dashKey = topicId ? `topic:${topicId}` : (DASH_KEY_MAP[type] ?? type);
  const storageKey = topicId
    ? `assessment-progress-${type}|${dashKey}`
    : `assessment-progress-${type}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSaved, setShowSaved] = useState(false);
  const [completed, setCompleted] = useState(false);

  /** ---------- Persistenz/Sync ---------- */
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  /** Fortschritt ins Dashboard spiegeln (min. 1%, optional 100%) */
  const STORAGE_KEY_DASH = "assessments" as const;
  const syncDashboard = (force100 = false) => {
    const pack = JSON.parse(localStorage.getItem(STORAGE_KEY_DASH) || "{}");
    const pct = force100
      ? 100
      : Math.max(1, Math.min(100, Math.round(((currentIndex + 1) / questions.length) * 100)));

    pack[dashKey] = {
      started: pack[dashKey]?.started || new Date().toISOString(),
      progress: pct,
      currentQuestion: currentIndex,
      // optional hilfreich:
      topicId: topicId || undefined,
      topicName: topicName || undefined,
      assessmentType: type,
    };

    localStorage.setItem(STORAGE_KEY_DASH, JSON.stringify(pack));
  };

  /** Einzel-Assessment speichern + Dashboard syncen */
  const saveProgress = (showToast = false) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        currentIndex,
        startTime,
        assessmentType: type,
        topicId: topicId || undefined,
        topicName: topicName || undefined,
      })
    );

    syncDashboard(false);

    if (showToast) {
      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), 1500);
    }
  };

  /** ---------- Laden ---------- */
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setAnswers(data.answers || {});
        setCurrentIndex(data.currentIndex || 0);
        setStartTime(data.startTime || Date.now());
      } catch {}
    } else {
      // bei erster Öffnung sofort einen Laufende-Eintrag erzeugen (progress = 1)
      syncDashboard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /** Autosave bei Änderungen (still) */
  useEffect(() => {
    saveProgress(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentIndex, startTime]);

  /** Sicherheits-Intervall */
  useEffect(() => {
    const id = setInterval(() => saveProgress(false), 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- UI-Hilfen ---------- */
  const setAnswer = (qid: number, val: any, mode: Question["type"]) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (mode === "checkbox") {
        const arr = Array.isArray(prev[qid]) ? [...prev[qid]] : [];
        const idx = arr.indexOf(val);
        if (idx > -1) arr.splice(idx, 1);
        else arr.push(val);
        next[qid] = arr;
      } else {
        next[qid] = val;
      }
      return next;
    });
  };

  const next = () =>
    currentIndex < questions.length - 1 ? setCurrentIndex((i) => i + 1) : complete();

  const prev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const complete = () => {
    setCompleted(true);
    syncDashboard(true); // auf 100% setzen
    saveProgress(true);
  };

  const answeredCount = Object.keys(answers).length;
  const completionPercent = Math.round((answeredCount / questions.length) * 100);
  const durationMin = Math.round((Date.now() - startTime) / 60000);

  const downloadResults = () => {
    const payload = {
      assessment: baseConfig.title, // Katalog/Fragenset
      assessmentType: type,
      topicId: topicId || undefined,
      topicName: topicName || undefined,
      completedAt: new Date().toISOString(),
      duration: durationMin,
      answers,
      questions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}${topicId ? `-${topicId}` : ""}-results-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const q = questions[currentIndex];

  /** ---------- UI (Layout unverändert, nur Titel/Badge angepasst) ---------- */
  const headerTitle = topicName || baseConfig.title; // <<< Topicname hat Priorität
  const headerSubtitle = topicName
    ? `Thema: ${topicName} — ${baseConfig.subtitle}`
    : baseConfig.subtitle;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
      <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.08)] overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
                {headerTitle}
              </div>
              <div className="text-sm text-[#666] mt-1">{headerSubtitle}</div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app/dashboard")}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-800 border border-[#ddd] transition hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1f2a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11l9-7 9 7" />
                <path d="M9 22V12h6v10" />
              </svg>
              Zur Übersicht
            </button>
          </div>
        </div>

        {/* Progress-Zeile */}
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[18px] font-semibold text-[#1a1a1a]">Assessment läuft</div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-[#0f172a] bg-[#f8fafc] px-3.5 py-1.5 rounded-full border border-gray-200">
                {`Frage ${Math.min(currentIndex + 1, questions.length)} von ${questions.length}`}
              </span>
              <button
                type="button"
                onClick={() => saveProgress(true)}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-white text-[#0f172a] border border-gray-300 hover:bg-gray-50 transition"
                title="Speichern"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h11l5 5v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                  <path d="M12 4v5" />
                  <rect x="6" y="13" width="12" height="7" rx="2" />
                </svg>
                Speichern
              </button>
            </div>
          </div>

          <div className="w-full h-2.5 bg-gray-200 rounded-[10px] overflow-hidden mb-2">
            <div className="h-full bg-blue-500 transition-[width] duration-300 ease-out rounded-[10px]" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-sm text-[#666]">{progressPct}% abgeschlossen</div>
        </div>

        {/* Inhalt */}
        {!completed ? (
          <>
            <div className="px-6 pb-2">
              <div className="text-[18px] font-semibold text-[#1a1a1a] mb-6 leading-relaxed">{q.text}</div>

              <div>
                {q.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options.map((opt) => {
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
                    {q.options.map((opt) => {
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
                      value={answers[q.id] ?? Math.floor((((q as any).min + (q as any).max) / 2))}
                      onChange={(e) => setAnswer(q.id, Number(e.target.value), "slider")}
                      className="w-full h-2 rounded bg-gray-200 outline-none
                                 [accent-color:#3b82f6]
                                 [&::-webkit-slider-thumb]:appearance-none
                                 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                                 [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:bg-[#3b82f6]
                                 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                                 [&::-moz-range-thumb]:rounded-full
                                 [&::-moz-range-thumb]:bg-[#3b82f6] [&::-moz-range-thumb]:border-0"
                    />
                    <div className="text-center text-[18px] font-semibold text-blue-500 mt-2">
                      {answers[q.id] ?? Math.floor((((q as any).min + (q as any).max) / 2))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-[#666]">
                      <span>{(q as any).labels[0]}</span>
                      <span>{(q as any).labels[1]}</span>
                    </div>
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
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#666] border border-[#ddd] hover:bg-[#f5f5f5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={prev}
                disabled={currentIndex === 0}
              >
                ← Zurück
              </button>
              <div className="text-center text-[#666] text-sm flex-1">
                Ihre Antworten werden automatisch gespeichert
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#6b7280] hover:bg-[#4b5563] transition"
                onClick={next}
              >
                {currentIndex === questions.length - 1 ? "Abschließen ✓" : "Weiter →"}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-10 text-center">
            <div className="text-6xl mb-5">✓</div>
            <div className="text-[28px] font-bold text-[#1a1a1a] mb-4">Assessment Abgeschlossen!</div>
            <div className="text-[16px] text-[#666] mb-8">
              {`Vielen Dank für die Teilnahme am ${topicName || baseConfig.title}. Ihre Antworten wurden erfolgreich gespeichert.`}
            </div>

            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] mb-8">
              <div className="bg-[#f5f5f5] p-5 rounded-lg border border-gray-200">
                <div className="text-[32px] font-bold text-blue-500 mb-1">
                  {answeredCount}/{questions.length}
                </div>
                <div className="text-sm text-[#666]">Beantwortete Fragen</div>
              </div>
              <div className="bg-[#f5f5f5] p-5 rounded-lg border border-gray-200">
                <div className="text-[32px] font-bold text-blue-500 mb-1">{completionPercent}%</div>
                <div className="text-sm text-[#666]">Vollständigkeit</div>
              </div>
              <div className="bg-[#f5f5f5] p-5 rounded-lg border border-gray-200">
                <div className="text-[32px] font-bold text-blue-500 mb-1">{durationMin}m</div>
                <div className="text-sm text-[#666]">Benötigte Zeit</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
                onClick={downloadResults}
              >
                📥 Ergebnisse herunterladen
              </button>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#d4af37] text-[#333] hover:bg-[#c29d2f] transition"
                onClick={() => navigate("/app/dashboard")}
              >
                🏠 Zur Übersicht
              </button>
            </div>
          </div>
        )}
      </div>

      {/* kurzer Save-Toast */}
      <div
        className={`fixed bottom-6 right-6 items-center gap-2 px-5 py-3 rounded-lg text-white bg-emerald-500 shadow-lg transition ${showSaved ? "flex" : "hidden"}`}
        style={{ animation: "slideIn .3s ease" } as React.CSSProperties}
      >
        ✓ Gespeichert
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateY(100px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}
