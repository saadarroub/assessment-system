import { useEffect, useState, useRef, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import {
  getDashboardStats,
  getRecentAssignments,
  getRecentSessions,
  getStatusDistribution,
  getTopCompanies,
  getCompletedWithMaturity,
} from "@/features/service/dashboardService";
import type {
  DashboardStats,
  AssignmentSummary,
  SessionSummary,
  StatusDistribution,
  CompanyActivity,
  CompletedCatalogMaturity,
} from "@/features/service/dashboardService";
import { StatusDistributionChart } from "@/shared/components/StatusDistributionChart";
import { TopCompaniesChart } from "@/shared/components/TopCompaniesChart";
import { SessionAnalyticsSection } from "@/shared/components/SessionAnalyticsSection";
import {
  Building2,
  Folder,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Activity,
  Users,
  TrendingUp,
  Clock,
  Award,
  BarChart2,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "@/shared/utils/dateUtils";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

/* ===== Farb-Tokens  */
const CSS = {
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

const BRAND = {
  navy: "#264555",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "gold" | "blue";
};

function StatCard({ label, value, icon, accent = "gold" }: StatCardProps) {
  const accentDot = accent === "gold" ? BRAND.gold : "rgb(56 189 248 / 1)";
  const accentGlow =
    accent === "gold" ? "rgba(227,187,98,0.22)" : "rgba(56,189,248,0.22)";

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-[18px] border
        px-5 py-4
        shadow-[0_10px_22px_rgba(0,0,0,0.06)]
        transition
        hover:shadow-[0_16px_34px_rgba(0,0,0,0.10)]
      "
      style={{
        borderColor: BRAND.sand,
        background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
      }}
    >
      {/* sehr dezenter Glow (nicht zu viel Farbe) */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-2xl opacity-60 transition group-hover:opacity-80"
        style={{
          background: `radial-gradient(circle, ${accentGlow} 0, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentDot }} />
            <span className="truncate" style={{ color: CSS.mutedFg }}>
              {label}
            </span>
          </div>

          <div
            className="mt-1 text-[34px] font-extrabold leading-none"
            style={{ color: BRAND.navy }}
          >
            {value.toLocaleString("de-DE")}
          </div>
        </div>

        <div
          className="
            flex h-11 w-11 items-center justify-center
            rounded-2xl border
            bg-white/90
            shadow-[0_6px_16px_rgba(0,0,0,0.06)]
          "
          style={{
            borderColor: BRAND.sand,
            color: "#64748B",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="
        rounded-[18px] border
        px-5 py-4
        shadow-[0_10px_22px_rgba(0,0,0,0.05)]
      "
      style={{
        borderColor: BRAND.sand,
        background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
function SectionHeader({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-2xl border bg-white/80
            shadow-[0_6px_16px_rgba(0,0,0,0.06)]
          "
          style={{ borderColor: BRAND.sand, color: BRAND.navy }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="m-0 text-lg font-semibold leading-tight" style={{ color: BRAND.navy }}>
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-snug" style={{ color: CSS.mutedFg }}>
              {subtitle}
            </p>
          ) : null}

          {/* dezente Linie (wie “sauberer Block”) */}
          <div
            className="mt-3 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, rgba(210,201,185,0.9), rgba(210,201,185,0.25), transparent)",
            }}
          />
        </div>
      </div>

      {right ? <div className="pt-0.5">{right}</div> : null}
    </div>
  );
}



export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<
    AssignmentSummary[]
  >([]);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);
  const [completedWithMaturity, setCompletedWithMaturity] = useState<CompletedCatalogMaturity[]>([]);
  const [statusDistribution, setStatusDistribution] =
    useState<StatusDistribution | null>(null);
  const [topCompanies, setTopCompanies] =
    useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lazy loading states - show 4 initially, load more on scroll
  const [visibleAssignments, setVisibleAssignments] = useState(4);
  const [visibleSessions, setVisibleSessions] = useState(4);
  const [visibleMaturity, setVisibleMaturity] = useState(4);
  const assignmentsRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<HTMLDivElement>(null);
  const maturityRef = useRef<HTMLDivElement>(null);

  // Scroll handler for lazy loading
  const handleAssignmentsScroll = useCallback(() => {
    const el = assignmentsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // Load more when scrolled near bottom (within 50px)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleAssignments(prev => Math.min(prev + 3, recentAssignments.length));
    }
  }, [recentAssignments.length]);

  const handleSessionsScroll = useCallback(() => {
    const el = sessionsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleSessions(prev => Math.min(prev + 3, recentSessions.length));
    }
  }, [recentSessions.length]);

  const handleMaturityScroll = useCallback(() => {
    const el = maturityRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleMaturity(prev => Math.min(prev + 3, completedWithMaturity.length));
    }
  }, [completedWithMaturity.length]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          statsData,
          assignmentsData,
          sessionsData,
          distributionData,
          companiesData,
          maturityData,
        ] = await Promise.all([
          getDashboardStats(),
          getRecentAssignments(10),
          getRecentSessions(10),
          getStatusDistribution(),
          getTopCompanies(5),
          getCompletedWithMaturity(10),
        ]);

        setStats(statsData);
        setRecentAssignments(assignmentsData);
        setRecentSessions(sessionsData);
        setStatusDistribution(distributionData);
        setTopCompanies(companiesData);
        setCompletedWithMaturity(maturityData);
      } catch (err: any) {
        console.error("❌ Dashboard error:", err);
        setError(`Fehler: ${err?.message || "Unbekannt"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <AdminLayout>
        <div className="px-6 py-8">
          <div
            className="
              mx-auto max-w-[800px]
              rounded-2xl border
              px-6 py-5
              shadow-lg
            "
            style={{
              background: "#fee2e2",
              borderColor: "#fca5a5",
              color: "#991b1b",
            }}
          >
            <h3 className="mb-2 text-lg font-semibold">❌ Fehler</h3>
            <p className="mb-4 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="
                inline-flex items-center justify-center
                rounded-full px-4 py-2
                text-sm font-semibold
              "
              style={{
                background: BRAND.gold,
                color: BRAND.navy,
                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
              }}
            >
              Neu laden
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* ===== Hero Header (PageHeader wie bei anderen Seiten) ===== */}
      <PageHeader
        title="Dashboard"
        subtitle="Übersicht über das Assessment-System"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/*  Hintergrund unterhalb des Headers  */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >

        {/*  Top-Row: KPIs  */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto">

          <section
            className="
    mb-6
    rounded-2xl border
    bg-white/55 backdrop-blur-[2px]
    p-4
    shadow-[0_10px_26px_rgba(0,0,0,0.06)]
  "
            style={{ borderColor: BRAND.sand }}
          >
            <SectionHeader
              title="System-Übersicht"
              subtitle="Schneller Überblick über Kernobjekte im System."
              icon={<BarChart2 size={18} />}
              right={
                <span
                  className="
          inline-flex items-center gap-2 rounded-full
          px-3 py-1.5 text-xs font-semibold
          border bg-white/80 backdrop-blur-[2px]
          shadow-[0_4px_10px_rgba(0,0,0,0.06)]
        "
                  style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                  Live-Status
                </span>
              }
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatCard label="Firmen" value={stats.totalCompanies} icon={<Building2 size={26} />} accent="gold" />
                  <StatCard label="Kataloge" value={stats.totalCatalogs} icon={<Folder size={26} />} accent="blue" />
                  <StatCard label="Themen" value={stats.totalThemes} icon={<BookOpen size={26} />} accent="gold" />
                  <StatCard label="Mitarbeiter" value={stats.totalWorkers} icon={<Users size={26} />} accent="blue" />
                </>
              ) : null}
            </div>
          </section>


          <section
            className="
    mb-8
    rounded-2xl border
    bg-white/55 backdrop-blur-[2px]
    p-4
    shadow-[0_10px_26px_rgba(0,0,0,0.06)]
  "
            style={{ borderColor: BRAND.sand }}
          >
            <SectionHeader
              title="Aktivitäten"
              subtitle="Zuweisungen und Sessions auf einen Blick."
              icon={<Activity size={18} />}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatCard label="Zuweisungen gesamt" value={stats.totalAssignments} icon={<ClipboardList size={26} />} accent="gold" />
                  <StatCard label="Aktive Zuweisungen" value={stats.activeAssignments} icon={<Activity size={26} />} accent="blue" />
                  <StatCard label="Abgeschlossen" value={stats.completedAssignments} icon={<CheckCircle2 size={26} />} accent="gold" />
                  <StatCard label="Abgeschlossene Sessions" value={stats.completedSessions} icon={<TrendingUp size={26} />} accent="blue" />
                </>
              ) : null}
            </div>
          </section>

          {/*  Charts  */}
          <section className="mb-8 grid gap-5 lg:grid-cols-2">
            {loading ? (
              <>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="
            rounded-2xl border
            bg-white/55 backdrop-blur-[2px]
            p-4
            shadow-[0_10px_26px_rgba(0,0,0,0.06)]
          "
                    style={{ borderColor: BRAND.sand }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-2xl border bg-white/80
                           shadow-[0_6px_16px_rgba(0,0,0,0.06)] animate-pulse"
                          style={{ borderColor: BRAND.sand }}
                        />
                        <div className="min-w-0 w-full">
                          <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
                          <div className="mt-2 h-4 w-56 rounded bg-slate-100 animate-pulse" />
                          <div
                            className="mt-3 h-px w-full"
                            style={{
                              background:
                                "linear-gradient(to right, rgba(210,201,185,0.9), rgba(210,201,185,0.25), transparent)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {statusDistribution && (
                  <div
                    className="
            rounded-2xl border
            bg-white/55 backdrop-blur-[2px]
            p-4
            shadow-[0_10px_26px_rgba(0,0,0,0.06)]
          "
                    style={{ borderColor: BRAND.sand }}
                  >
                    <SectionHeader
                      title="Session-Status"
                      subtitle="Verteilung der Assessment-Sessions nach Status"
                      icon={<Activity size={18} />}
                    />

                    <div className="mt-4 rounded-2xl border bg-white p-4"
                      style={{ borderColor: CSS.border }}>
                      <StatusDistributionChart
                        data={statusDistribution.sessionsByStatus}
                        title="Session-Status"
                        description="Verteilung der Assessment-Sessions nach Status"
                      />
                    </div>
                  </div>
                )}

                {topCompanies.length > 0 && (
                  <div
                    className="
            rounded-2xl border
            bg-white/55 backdrop-blur-[2px]
            p-4
            shadow-[0_10px_26px_rgba(0,0,0,0.06)]
          "
                    style={{ borderColor: BRAND.sand }}
                  >
                    <SectionHeader
                      title="Top 5 Firmen"
                      subtitle="Firmen mit den meisten Zuweisungen"
                      icon={<Building2 size={18} />}
                    />

                    <div className="mt-4 rounded-2xl border bg-white p-4"
                      style={{ borderColor: CSS.border }}>
                      <TopCompaniesChart
                        data={topCompanies}
                        title="Top 5 Firmen"
                        description="Firmen mit den meisten Zuweisungen"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </section>


          {/* ===== Session Analytics (Area Chart) ===== */}
          <SessionAnalyticsSection />

          {/* ===== Recent Activity ===== */}
          <section className="grid gap-5 grid-cols-3">
            {/* Letzte Zuweisungen */}
            <div
              className="
      rounded-2xl border
      bg-white/55 backdrop-blur-[2px]
      p-4
      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
              style={{ borderColor: BRAND.sand }}
            >
              <SectionHeader
                title="Letzte Zuweisungen"
                subtitle="Kürzlich zugewiesene Kataloge."
                icon={<ClipboardList size={18} />}
              />

              <div
                className="mt-4 rounded-2xl border bg-white p-4 overflow-hidden"
                style={{ borderColor: CSS.border }}
              >
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : recentAssignments.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Keine Daten vorhanden.
                  </div>
                ) : (
                  <div
                    ref={assignmentsRef}
                    onScroll={handleAssignmentsScroll}
                    className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
                    style={{ maxHeight: "350px" }}
                  >
                    {recentAssignments.slice(0, visibleAssignments).map((a) => (
                      <div
                        key={a.id}
                        className="
                rounded-xl border px-4 py-3
                bg-white
                transition-all duration-200
                hover:shadow-md hover:border-amber-300
                hover:bg-amber-50/30
              "
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        {/* Header: Name + Status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="font-semibold text-slate-800 text-sm">
                              {a.workerName}
                            </span>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              background:
                                a.status === "completed"
                                  ? "#d1fae5"
                                  : a.status === "in_progress"
                                    ? "#dbeafe"
                                    : a.status === "expired"
                                      ? "#fee2e2"
                                      : a.status === "revoked"
                                        ? "#fecaca"
                                        : "#fef3c7",
                              color:
                                a.status === "completed"
                                  ? "#065f46"
                                  : a.status === "in_progress"
                                    ? "#1e40af"
                                    : a.status === "expired"
                                      ? "#991b1b"
                                      : a.status === "revoked"
                                        ? "#7f1d1d"
                                        : "#92400e",
                            }}
                          >
                            {a.status === "completed"
                              ? "Abgeschlossen"
                              : a.status === "in_progress"
                                ? "In Bearbeitung"
                                : a.status === "expired"
                                  ? "Abgelaufen"
                                  : a.status === "revoked"
                                    ? "Widerrufen"
                                    : "Zugewiesen"}
                          </span>
                        </div>

                        {/* Catalog + Company */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Folder size={12} />
                            <span className="truncate max-w-[120px]">{a.catalogTitle}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 size={12} />
                            <span className="truncate max-w-[100px]">{a.companyName}</span>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={10} />
                          <span>{formatDistanceToNow(a.assignedAt)}</span>
                        </div>
                      </div>
                    ))}

                    {visibleAssignments < recentAssignments.length && (
                      <div className="py-2 text-center text-xs text-slate-400">
                        ↓ Mehr laden
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Abgeschlossene Sessions */}
            <div
              className="
      rounded-2xl border
      bg-white/55 backdrop-blur-[2px]
      p-4
      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
              style={{ borderColor: BRAND.sand }}
            >
              <SectionHeader
                title="Abgeschlossene Sessions"
                subtitle="Kürzlich abgeschlossene Assessments der Mitarbeiter."
                icon={<CheckCircle2 size={18} />}
              />

              <div
                className="mt-4 rounded-2xl border bg-white p-4 overflow-hidden"
                style={{ borderColor: CSS.border }}
              >
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Keine Daten vorhanden.
                  </div>
                ) : (
                  <div
                    ref={sessionsRef}
                    onScroll={handleSessionsScroll}
                    className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
                    style={{ maxHeight: "380px" }}
                  >
                    {recentSessions.slice(0, visibleSessions).map((s) => {
                      const pct =
                        s.maxPossibleScore > 0
                          ? (s.totalScore / s.maxPossibleScore) * 100
                          : 0;

                      return (
                        <div
                          key={s.id}
                          onClick={() => (window.location.href = `/app/results/${s.id}`)}
                          className="
                  rounded-xl border px-4 py-3
                  bg-white
                  cursor-pointer
                  transition-all duration-200
                  hover:shadow-md hover:border-blue-300
                  hover:bg-blue-50/30
                  group
                "
                          style={{ borderColor: "#e5e7eb" }}
                        >
                          {/* Header: Name + Company */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-slate-500" />
                              <span className="font-semibold text-slate-800 text-sm">
                                {s.workerName}
                              </span>
                            </div>
                            <ArrowRight
                              size={14}
                              className="text-slate-400 group-hover:text-blue-500 transition-colors"
                            />
                          </div>

                          {/* Theme + Company */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen size={12} />
                              <span className="truncate max-w-[150px]">{s.themeName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 size={12} />
                              <span className="truncate max-w-[100px]">{s.companyName}</span>
                            </div>
                          </div>

                          {/* Score-Bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                              <div className="flex items-center gap-1">
                                <Award size={12} className="text-amber-500" />
                                <span>
                                  {s.totalScore} / {s.maxPossibleScore}
                                </span>
                              </div>
                              <span className="font-bold text-slate-700">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background:
                                    pct >= 70
                                      ? "linear-gradient(90deg,#22c55e,#16a34a)"
                                      : pct >= 40
                                        ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                                        : "linear-gradient(90deg,#ef4444,#dc2626)",
                                }}
                              />
                            </div>
                          </div>

                          {s.completedAt && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock size={10} />
                              <span>{formatDistanceToNow(s.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {visibleSessions < recentSessions.length && (
                      <div className="py-2 text-center text-xs text-slate-400">
                        ↓ Scrollen für mehr
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reifegrad-Analyse */}
            <div
              className="
      rounded-2xl border
      bg-white/55 backdrop-blur-[2px]
      p-4
      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
              style={{ borderColor: BRAND.sand }}
            >
              <SectionHeader
                title="Reifegrad-Analyse"
                subtitle="Abgeschlossene Kataloge mit Reifegradmodell-Bewertung."
                icon={<BarChart2 size={18} />}
              />

              <div
                className="mt-4 rounded-2xl border bg-white p-4 overflow-hidden"
                style={{ borderColor: CSS.border }}
              >
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : completedWithMaturity.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Keine Daten vorhanden.
                  </div>
                ) : (
                  <div
                    ref={maturityRef}
                    onScroll={handleMaturityScroll}
                    className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
                    style={{ maxHeight: "380px" }}
                  >
                    {completedWithMaturity.slice(0, visibleMaturity).map((item) => (
                      <div
                        key={item.assignmentId}
                        className="
                rounded-xl border px-4 py-3
                bg-white
                transition-all duration-200
                hover:shadow-md hover:border-amber-300
                hover:bg-amber-50/30
              "
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        {/* ✅ ab hier ist dein Reifegrad-Inhalt 1:1 unverändert */}
                        {/* Header: Worker + Aktuelles Intervall Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="font-semibold text-slate-800 text-sm truncate max-w-[120px]">
                              {item.workerName}
                            </span>
                          </div>
                          {item.currentIntervalName && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: item.currentIntervalColor || "#E3BB62",
                                color: "#fff",
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                              }}
                            >
                              {item.currentIntervalName}
                            </span>
                          )}
                        </div>

                        {/* Catalog + Company */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Folder size={12} />
                            <span className="truncate max-w-[100px]">{item.catalogTitle}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 size={12} />
                            <span className="truncate max-w-[80px]">{item.companyName}</span>
                          </div>
                        </div>

                        {/* Score Info */}
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Award size={12} className="text-amber-500" />
                            <span>{item.avgScore} / {item.totalMaxScore}</span>
                            {item.sessionCount > 0 && (
                              <span className="text-slate-400 ml-1">({item.sessionCount} Sessions)</span>
                            )}
                          </div>
                          <span className="font-bold text-slate-700">
                            {item.percentage?.toFixed(0) || 0}%
                          </span>
                        </div>

                        {/* Maturity Progress Bar - nur wenn Modell vorhanden */}
                        {item.intervals && item.intervals.length > 0 ? (
                          <div className="mb-2">
                            <div className="relative h-5 rounded-full bg-slate-100 overflow-hidden">
                              <div className="absolute inset-0 flex">
                                {item.intervals.map((interval, idx) => {
                                  const width = interval.end - interval.start;
                                  const isCurrentInterval = idx === item.currentIntervalIndex;
                                  const fallbackColors = ["#ef4444", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7"];
                                  const intervalColor = interval.color || fallbackColors[idx % fallbackColors.length];

                                  const hexToRgba = (hex: string, alpha: number) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `rgba(${r},${g},${b},${alpha})`;
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="h-full border-r border-white/60 last:border-r-0 flex items-center justify-center"
                                      style={{
                                        width: `${width}%`,
                                        background: isCurrentInterval
                                          ? hexToRgba(intervalColor, 0.85)
                                          : hexToRgba(intervalColor, 0.2),
                                      }}
                                    >
                                      <span
                                        className="text-[8px] font-medium truncate px-1"
                                        style={{
                                          color: isCurrentInterval ? "#fff" : "#64748b",
                                          textShadow: isCurrentInterval ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                                        }}
                                      >
                                        {interval.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <p className="text-[10px] text-slate-400 italic">
                              Kein Reifegradmodell zugewiesen
                            </p>
                          </div>
                        )}

                        {/* Model Name + Time */}
                        <div className="flex items-center justify-between mt-1">
                          {item.reifegradModelName && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600">
                              <BarChart2 size={10} />
                              <span className="truncate max-w-[100px]">{item.reifegradModelName}</span>
                            </div>
                          )}
                          {item.completedAt && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                              <Clock size={10} />
                              <span>{formatDistanceToNow(item.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {visibleMaturity < completedWithMaturity.length && (
                      <div className="py-2 text-center text-xs text-slate-400">
                        ↓ Scrollen für mehr
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </AdminLayout>
  );
}
