// Dashboard types and API methods
import { apiClient } from "@/api/client";

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
