import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  getDashboardStats,
  getRecentAssignments,
  getRecentSessions,
  getStatusDistribution,
  getTopCompanies,
} from "@/features/service/dashboardService";
import type {
  DashboardStats,
  AssignmentSummary,
  SessionSummary,
  StatusDistribution,
  CompanyActivity,
} from "@/features/service/dashboardService";
import { StatusDistributionChart } from "@/shared/components/StatusDistributionChart";
import { TopCompaniesChart } from "@/shared/components/TopCompaniesChart";
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
} from "lucide-react";
import { formatDistanceToNow } from "@/shared/utils/dateUtils";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

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
  const accentBg =
    accent === "gold"
      ? "linear-gradient(135deg, rgba(227,187,98,0.16), rgba(227,187,98,0.05))"
      : "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.05))";

  const accentDot =
    accent === "gold" ? BRAND.gold : "rgb(56 189 248 / 1)";

  return (
    <div
      className="
        group
        relative overflow-hidden
        rounded-2xl border
        px-4 py-4
        shadow-[0_8px_22px_rgba(0,0,0,0.06)]
        transition
        hover:-translate-y-[2px]
        hover:shadow-[0_16px_38px_rgba(0,0,0,0.10)]
      "
      style={{
        borderColor: CSS.border,
        background:
          "radial-gradient(circle at 0 0, rgba(255,255,255,0.7) 0, transparent 55%)," +
          "radial-gradient(circle at 120% 0, rgba(0,0,0,0.03) 0, transparent 55%)," +
          "#ffffff",
      }}
    >
      {/* Glow oben rechts */}
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-70 blur-sm transition group-hover:opacity-100"
        style={{ background: accentBg }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: accentDot }}
            />
            <span style={{ color: CSS.mutedFg }}>{label}</span>
          </div>
          <div
            className="text-3xl font-extrabold leading-none"
            style={{ color: BRAND.navy }}
          >
            {value.toLocaleString("de-DE")}
          </div>
        </div>

        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-2xl border
            bg-white/90
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
          style={{ borderColor: BRAND.sand, color: "#64748B" }}
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
        rounded-2xl border
        px-4 py-4
        shadow-[0_8px_22px_rgba(0,0,0,0.05)]
      "
      style={{ borderColor: CSS.border, background: "#ffffff" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<
    AssignmentSummary[]
  >([]);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);
  const [statusDistribution, setStatusDistribution] =
    useState<StatusDistribution | null>(null);
  const [topCompanies, setTopCompanies] =
    useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        ] = await Promise.all([
          getDashboardStats(),
          getRecentAssignments(10),
          getRecentSessions(10),
          getStatusDistribution(),
          getTopCompanies(5),
        ]);

        setStats(statsData);
        setRecentAssignments(assignmentsData);
        setRecentSessions(sessionsData);
        setStatusDistribution(distributionData);
        setTopCompanies(companiesData);
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

      {/* ===== Hintergrund unterhalb des Headers ===== */}
      <main
        className="mt-0 min-h-[calc(100vh-64px)] px-6 pb-10 pt-20"
       
      >
          {/* ===== Top-Row: KPIs ===== */}
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="m-0 text-xl font-semibold" style={{ color: BRAND.navy }}>
                System-Übersicht
              </h2>
              <span
                className="
                  inline-flex items-center gap-2 rounded-full
                  px-3 py-1.5 text-xs font-medium
                "
                style={{
                  background: BRAND.navy,
                  color: "white",
                }}
              >
                <Activity size={12} />
                Live-Status
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatCard
                    label="Firmen"
                    value={stats.totalCompanies}
                    icon={<Building2 size={26} />}
                    accent="gold"
                  />
                  <StatCard
                    label="Kataloge"
                    value={stats.totalCatalogs}
                    icon={<Folder size={26} />}
                    accent="blue"
                  />
                  <StatCard
                    label="Themen"
                    value={stats.totalThemes}
                    icon={<BookOpen size={26} />}
                    accent="gold"
                  />
                  <StatCard
                    label="Mitarbeiter"
                    value={stats.totalWorkers}
                    icon={<Users size={26} />}
                    accent="blue"
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* ===== Aktivitäten-Row ===== */}
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="m-0 text-xl font-semibold" style={{ color: BRAND.navy }}>
                Aktivitäten
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatCard
                    label="Zuweisungen gesamt"
                    value={stats.totalAssignments}
                    icon={<ClipboardList size={26} />}
                    accent="gold"
                  />
                  <StatCard
                    label="Aktive Zuweisungen"
                    value={stats.activeAssignments}
                    icon={<Activity size={26} />}
                    accent="blue"
                  />
                  <StatCard
                    label="Abgeschlossen"
                    value={stats.completedAssignments}
                    icon={<CheckCircle2 size={26} />}
                    accent="gold"
                  />
                  <StatCard
                    label="Abgeschlossene Sessions"
                    value={stats.completedSessions}
                    icon={<TrendingUp size={26} />}
                    accent="blue"
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* ===== Charts ===== */}
          <section className="mb-8 grid gap-5 lg:grid-cols-2">
            {loading ? (
              <>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="
                      rounded-2xl border
                      p-5
                      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                    "
                    style={{ borderColor: CSS.border, background: "#ffffff" }}
                  >
                    <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
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
                      p-5
                      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                      bg-white
                    "
                    style={{ borderColor: CSS.border }}
                  >
                    <StatusDistributionChart
                      data={statusDistribution.sessionsByStatus}
                      title="Session-Status"
                      description="Verteilung der Assessment-Sessions nach Status"
                    />
                  </div>
                )}

                {topCompanies.length > 0 && (
                  <div
                    className="
                      rounded-2xl border
                      p-5
                      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                      bg-white
                    "
                    style={{ borderColor: CSS.border }}
                  >
                    <TopCompaniesChart
                      data={topCompanies}
                      title="Top 5 Firmen"
                      description="Firmen mit den meisten Zuweisungen"
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {/* ===== Recent Activity ===== */}
          <section className="grid gap-5 lg:grid-cols-2">
            {/* Letzte Zuweisungen */}
            <div
              className="
                rounded-2xl border
                p-5
                shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: CSS.border }}
            >
              <h3
                className="mb-1 text-lg font-semibold"
                style={{ color: BRAND.navy }}
              >
                Letzte Zuweisungen
              </h3>
              <p
                className="mb-4 text-xs md:text-sm"
                style={{ color: CSS.mutedFg }}
              >
                Kürzlich zugewiesene Kataloge im System.
              </p>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : recentAssignments.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Keine Daten vorhanden.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentAssignments.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="
                        rounded-xl border px-3 py-3
                        bg-slate-50
                      "
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="mb-1 flex items-center gap-2 text-sm">
                        <Users size={14} className="text-slate-500" />
                        <span className="font-semibold text-slate-800">
                          {a.workerName}
                        </span>
                        <span className="ml-auto">
                          <span
                            className="rounded-full px-2 py-[2px] text-[11px] font-semibold"
                            style={{
                              background:
                                a.status === "completed"
                                  ? "#d1fae5"
                                  : a.status === "in_progress"
                                  ? "#dbeafe"
                                  : "#e5e7eb",
                              color:
                                a.status === "completed"
                                  ? "#065f46"
                                  : a.status === "in_progress"
                                  ? "#1e40af"
                                  : "#374151",
                            }}
                          >
                            {a.status === "completed"
                              ? "Abgeschlossen"
                              : a.status === "in_progress"
                              ? "In Bearbeitung"
                              : "Zugewiesen"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-slate-600">
                        <Folder size={12} />
                        <span>{a.catalogTitle}</span>
                      </div>
                      <div className="mt-[2px] flex items-center gap-2 text-[12px] text-slate-600">
                        <Building2 size={12} />
                        <span>{a.companyName}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock size={11} />
                        <span>{formatDistanceToNow(a.assignedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Abgeschlossene Sessions */}
            <div
              className="
                rounded-2xl border
                p-5
                shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: CSS.border }}
            >
              <h3
                className="mb-1 text-lg font-semibold"
                style={{ color: BRAND.navy }}
              >
                Abgeschlossene Sessions
              </h3>
              <p
                className="mb-4 text-xs md:text-sm"
                style={{ color: CSS.mutedFg }}
              >
                Kürzlich abgeschlossene Assessments der Mitarbeiter.
              </p>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Keine Daten vorhanden.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentSessions.slice(0, 5).map((s) => {
                    const pct =
                      s.maxPossibleScore > 0
                        ? (s.totalScore / s.maxPossibleScore) * 100
                        : 0;
                    return (
                      <div
                        key={s.id}
                        className="
                          rounded-xl border px-3 py-3
                          bg-slate-50
                        "
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        <div className="mb-1 flex items-center gap-2 text-sm">
                          <Users size={14} className="text-slate-500" />
                          <span className="font-semibold text-slate-800">
                            {s.workerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-slate-600">
                          <BookOpen size={12} />
                          <span>{s.themeName}</span>
                        </div>
                        <div className="mt-[2px] flex items-center gap-2 text-[12px] text-slate-600">
                          <Building2 size={12} />
                          <span>{s.companyName}</span>
                        </div>

                        {/* Score-Bar */}
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-600">
                            <div className="flex items-center gap-1">
                              <Award
                                size={12}
                                className="text-amber-500"
                              />
                              <span>
                                {s.totalScore} / {s.maxPossibleScore} Punkte
                              </span>
                            </div>
                            <span className="font-semibold text-slate-700">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full transition-[width] duration-500"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                background:
                                  "linear-gradient(90deg,#fbbf24,#f59e0b)",
                              }}
                            />
                          </div>
                        </div>

                        {s.completedAt && (
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock size={11} />
                            <span>
                              {formatDistanceToNow(s.completedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        
      </main>
    </AdminLayout>
  );
}
