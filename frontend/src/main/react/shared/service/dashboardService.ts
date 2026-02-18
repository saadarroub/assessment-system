// Dashboard types and API methods
import { apiClient } from "@/shared/service/api/client";

export type DashboardStats = {
  totalCompanies: number;
  totalCatalogs: number;
  totalThemes: number;
  totalWorkers: number;
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  totalSessions: number;
  completedSessions: number;
};

export type AssignmentSummary = {
  id: string;
  workerName: string;
  workerEmail: string;
  catalogTitle: string;
  companyName: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
};

export type SessionSummary = {
  id: string;
  workerName: string;
  themeName: string;
  companyName: string;
  status: string;
  totalScore: number;
  maxPossibleScore: number;
  createdAt: string;
  completedAt: string | null;
};

export type StatusDistribution = {
  assignmentsByStatus: Record<string, number>;
  sessionsByStatus: Record<string, number>;
};

export type CompanyActivity = {
  name: string;
  count: number;
};

// Neue Typen für Reifegradmodell-Anzeige
export type MaturityInterval = {
  name: string;
  start: number;
  end: number;
  color: string | null; // Hex-Farbe aus dem Modell
};

export type CompletedCatalogMaturity = {
  assignmentId: string;
  workerName: string;
  companyName: string;
  catalogTitle: string;
  avgScore: number;
  totalMaxScore: number;
  percentage: number;
  completedAt: string | null;
  sessionCount: number;
  reifegradModelId: string | null;
  reifegradModelName: string | null;
  intervals: MaturityInterval[] | null;
  currentIntervalName: string | null;
  currentIntervalIndex: number | null;
  currentIntervalColor: string | null; // Farbe des aktuellen Intervalls
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats/overview");
  return data;
}

export async function getTopCompanies(limit: number = 5): Promise<CompanyActivity[]> {
  const { data } = await apiClient.get<CompanyActivity[]>(
    `/dashboard/stats/top-companies?limit=${limit}`
  );
  return data;
}

export async function getRecentAssignments(limit: number = 10): Promise<AssignmentSummary[]> {
  const { data } = await apiClient.get<AssignmentSummary[]>(
    `/dashboard/stats/recent-assignments?limit=${limit}`
  );
  return data;
}

export async function getRecentSessions(limit: number = 10): Promise<SessionSummary[]> {
  const { data } = await apiClient.get<SessionSummary[]>(
    `/dashboard/stats/recent-sessions?limit=${limit}`
  );
  return data;
}

export async function getStatusDistribution(): Promise<StatusDistribution> {
  const { data } = await apiClient.get<StatusDistribution>("/dashboard/stats/status-distribution");
  return data;
}

export async function getCompletedWithMaturity(limit: number = 10): Promise<CompletedCatalogMaturity[]> {
  const { data } = await apiClient.get<CompletedCatalogMaturity[]>(
    `/dashboard/stats/completed-with-maturity?limit=${limit}`
  );
  return data;
}
