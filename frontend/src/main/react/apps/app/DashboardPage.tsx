import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import "@/styles/admin.css";
import { 
  getDashboardStats, 
  getRecentAssignments, 
  getRecentSessions, 
  getStatusDistribution,
  getTopCompanies
} from "@/features/service/dashboardService";
import type {
  DashboardStats,
  AssignmentSummary,
  SessionSummary,
  StatusDistribution,
  CompanyActivity
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
  Award
} from "lucide-react";
import { formatDistanceToNow } from "@/shared/utils/dateUtils";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode; 
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value.toLocaleString("de-DE")}</div>
        </div>
        <div style={{ color: '#64748B', opacity: 0.7 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <div>
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2" />
          <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<AssignmentSummary[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution | null>(null);
  const [topCompanies, setTopCompanies] = useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, assignmentsData, sessionsData, distributionData, companiesData] = await Promise.all([
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
        <div className="dashboard-content">
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>❌ Fehler</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Neu laden
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
       {/* Header */}
            <PageHeader
      
              title="Dashboard"
              subtitle="Übersicht über das Assessment-System"
              icon={<Network size={40} />}
              gradient="navy"
              height="280px"
              showPattern={true}
      
            />

      <div style={{ 
        background: 'hsl(0 0% 92%)', 
        minHeight: 'calc(100vh - 64px)',
        marginTop: '0.5rem',
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: '#f5f6f7',
          borderRadius: '12px',
          border: '1px solid hsl(30 15% 85%)',
          boxShadow: '0 1px 0 rgba(0,0,0,.02), 0 12px 30px -20px rgba(38,69,85,.25)',
          padding: '1.5rem',
          color: 'hsl(205 35% 24%)'
        }}>
          
          {/* System Overview */}
          <div className="stats-panel">
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#264555' }}>
              System-Übersicht
            </h2>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))' }}>
              {loading ? (
                <>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</>
              ) : stats ? (
                <>
                  <StatCard label="Firmen" value={stats.totalCompanies} icon={<Building2 size={40} />} />
                  <StatCard label="Kataloge" value={stats.totalCatalogs} icon={<Folder size={40} />} />
                  <StatCard label="Themen" value={stats.totalThemes} icon={<BookOpen size={40} />} />
                  <StatCard label="Mitarbeiter" value={stats.totalWorkers} icon={<Users size={40} />} />
                </>
              ) : null}
            </div>
          </div>

          {/* Activity */}
          <div className="stats-panel" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#264555' }}>
              Aktivitäten
            </h2>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))' }}>
              {loading ? (
                <>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</>
              ) : stats ? (
                <>
                  <StatCard label="Zuweisungen" value={stats.totalAssignments} icon={<ClipboardList size={40} />} />
                  <StatCard label="Aktive" value={stats.activeAssignments} icon={<Activity size={40} />} />
                  <StatCard label="Abgeschlossen" value={stats.completedAssignments} icon={<CheckCircle2 size={40} />} />
                  <StatCard label="Sessions" value={stats.completedSessions} icon={<TrendingUp size={40} />} />
                </>
              ) : null}
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {loading ? (
              <>{[1,2].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem' }}>
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}</>
            ) : (
              <>
                {statusDistribution && (
                  <StatusDistributionChart
                    data={statusDistribution.sessionsByStatus}
                    title="Session-Status"
                    description="Verteilung der Assessment-Sessions nach Status"
                  />
                )}
                {topCompanies.length > 0 && (
                  <TopCompaniesChart
                    data={topCompanies}
                    title="Top 5 Firmen"
                    description="Firmen mit den meisten Zuweisungen"
                  />
                )}
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Assignments */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#264555' }}>
                Letzte Zuweisungen
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Kürzlich zugewiesene Kataloge
              </p>
              {loading ? (
                <div>{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse mb-3" />)}</div>
              ) : recentAssignments.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Keine Daten</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentAssignments.slice(0, 5).map((a) => (
                    <div key={a.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={14} style={{ color: '#6b7280' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.workerName}</span>
                        <span style={{
                          marginLeft: 'auto', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                          background: a.status === 'completed' ? '#d1fae5' : a.status === 'in_progress' ? '#dbeafe' : '#e5e7eb',
                          color: a.status === 'completed' ? '#065f46' : a.status === 'in_progress' ? '#1e40af' : '#374151'
                        }}>
                          {a.status === 'completed' ? 'Abgeschlossen' : a.status === 'in_progress' ? 'In Bearbeitung' : 'Zugewiesen'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#6b7280' }}>
                        <Folder size={12} /><span>{a.catalogTitle}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        <Building2 size={12} /><span>{a.companyName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        <Clock size={11} /><span>{formatDistanceToNow(a.assignedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sessions */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#264555' }}>
                Abgeschlossene Sessions
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Kürzlich abgeschlossene Assessments
              </p>
              {loading ? (
                <div>{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse mb-3" />)}</div>
              ) : recentSessions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Keine Daten</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentSessions.slice(0, 5).map((s) => {
                    const pct = s.maxPossibleScore > 0 ? (s.totalScore / s.maxPossibleScore) * 100 : 0;
                    return (
                      <div key={s.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Users size={14} style={{ color: '#6b7280' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.workerName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#6b7280' }}>
                          <BookOpen size={12} /><span>{s.themeName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          <Building2 size={12} /><span>{s.companyName}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                              <Award size={12} style={{ color: '#f59e0b' }} />
                              <span>{s.totalScore} / {s.maxPossibleScore} Punkte</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{pct.toFixed(0)}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', width: `${Math.min(pct, 100)}%`, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                        {s.completedAt && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            <Clock size={11} /><span>{formatDistanceToNow(s.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
