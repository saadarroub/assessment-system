import { useMemo } from "react";
import { Home, Download, BarChart3, Target, PieChart, AlertTriangle, Activity, TrendingUp, CheckCircle } from "lucide-react";

export type AssessmentResultsProps = {
  topicName?: string;
  onRestart?: () => void;
  onBackToTopics?: () => void;

  // harte Zahlen direkt aus deiner Page:
  answered: number;        // z.B. progress.answered
  total: number;           // z.B. progress.total
  totalScore: number;      // z.B. dein vorhandener Score-Wert
  maxTotalScore: number;   // z.B. dein vorhandener MaxScore-Wert

  // optional nette Extras, falls du sie hast:
  completedAt?: string;    // ISO
  overallLevel?: string;   // "niedrig" | "mittel" | "hoch" | ...
  percent?: number;        // falls du pct schon berechnet hast (0..100)
};

function levelColor(level?: string) {
  switch (level?.toLowerCase()) {
    case "niedrig": return "text-red-500";
    case "mittel":  return "text-sky-600";
    case "hoch":    return "text-blue-500";
    case "exzellent": return "text-indigo-700";
    default: return "text-slate-700";
  }
}
function levelIcon(level?: string) {
  const common = "w-5 h-5";
  switch (level?.toLowerCase()) {
    case "niedrig": return <AlertTriangle className={`${common} text-red-500`} />;
    case "mittel":  return <Activity className={`${common} text-sky-600`} />;
    case "hoch":    return <TrendingUp className={`${common} text-blue-500`} />;
    default:        return <CheckCircle className={`${common} text-indigo-700`} />;
  }
}

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
    topicName, onRestart, onBackToTopics,
    answered, total, totalScore, maxTotalScore,
    completedAt, overallLevel, percent,
  } = props;

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
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-100">
            <Home className="w-5 h-5" />
            Zur Übersicht
          </a>
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
                ? new Date(completedAt).toLocaleDateString("de-DE", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })
                : "—"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {onRestart && (
            <button onClick={onRestart} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 hover:bg-slate-50">
              Assessment wiederholen
            </button>
          )}
          {onBackToTopics && (
            <button onClick={onBackToTopics} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800">
              <Home className="w-5 h-5" />
              Weitere Assessments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
