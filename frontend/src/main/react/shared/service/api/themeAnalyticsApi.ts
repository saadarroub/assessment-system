// 
// Theme Analytics API
// 

import { apiClient } from "./client";
import type {
  ThemeOption,
  ThemeTimeSeriesResponse,
  ThemeQuestionExtremes,
  ThemeAnalyticsFilter,
  TimeBucket,
} from "./types";

/**
 * Fetch list of themes with session statistics
 */
export async function fetchThemes(): Promise<ThemeOption[]> {
  const { data } = await apiClient.get<ThemeOption[]>(
    "/dashboard/analytics/themes"
  );
  return data;
}

/**
 * Fetch time series data for selected themes (avg score over time)
 */
export async function fetchThemeTimeSeries(
  filter: ThemeAnalyticsFilter
): Promise<ThemeTimeSeriesResponse> {
  const params = new URLSearchParams();
  
  filter.themeIds.forEach((id) => params.append("themeIds", id));
  params.append("startDate", filter.startDate);
  params.append("endDate", filter.endDate);
  params.append("timeBucket", filter.timeBucket);

  const { data } = await apiClient.get<ThemeTimeSeriesResponse>(
    `/dashboard/analytics/theme-timeseries?${params.toString()}`
  );
  return data;
}

/**
 * Fetch best and worst questions for selected themes
 */
export async function fetchThemeQuestionExtremes(
  themeIds: string[],
  startDate: string,
  endDate: string,
  limit: number = 3
): Promise<ThemeQuestionExtremes[]> {
  const params = new URLSearchParams();
  
  themeIds.forEach((id) => params.append("themeIds", id));
  params.append("startDate", startDate);
  params.append("endDate", endDate);
  params.append("limit", String(limit));

  const { data } = await apiClient.get<ThemeQuestionExtremes[]>(
    `/dashboard/analytics/theme-question-extremes?${params.toString()}`
  );
  return data;
}

// 
// Mock Data (for development/testing when backend is not ready)
// 

export function getMockThemes(): ThemeOption[] {
  return [
    {
      id: "theme-1",
      name: "Arbeitssicherheit Grundlagen",
      catalogName: "Sicherheit 2025",
      totalSessions: 45,
      avgScorePercent: 72,
    },
    {
      id: "theme-2",
      name: "Datenschutz DSGVO",
      catalogName: "Compliance 2025",
      totalSessions: 38,
      avgScorePercent: 81,
    },
    {
      id: "theme-3",
      name: "Brandschutz",
      catalogName: "Sicherheit 2025",
      totalSessions: 52,
      avgScorePercent: 68,
    },
    {
      id: "theme-4",
      name: "Erste Hilfe",
      catalogName: "Sicherheit 2025",
      totalSessions: 29,
      avgScorePercent: 85,
    },
    {
      id: "theme-5",
      name: "IT-Sicherheit Basics",
      catalogName: "IT Security 2025",
      totalSessions: 61,
      avgScorePercent: 76,
    },
  ];
}

export function getMockThemeTimeSeries(
  themeIds: string[],
  startDate: string,
  endDate: string,
  timeBucket: TimeBucket
): ThemeTimeSeriesResponse {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const colors = ["#3b82f6", "#22d3ee", "#8b5cf6"]; // Blue, Sky, Purple (3 themes)
  const themeNames: Record<string, string> = {
    "theme-1": "Arbeitssicherheit",
    "theme-2": "Datenschutz DSGVO",
    "theme-3": "Brandschutz",
    "theme-4": "Erste Hilfe",
    "theme-5": "IT-Sicherheit",
  };

  const workerNames = ["Max Müller", "Anna Schmidt", "Peter Weber", "Lisa Braun", "Tom Fischer"];
  const companyNames = ["TechCorp GmbH", "Safety First AG", "Industrie Plus", "Green Energy", "BuildMax"];
  
  const series = themeIds.map((id, idx) => {
    // Generate random session points
    const dataPoints = [];
    const numPoints = Math.floor(5 + Math.random() * 15); // 5-20 sessions
    
    for (let i = 0; i < numPoints; i++) {
      // Random timestamp between start and end
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      const timestamp = new Date(randomTime);
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        scorePercent: Math.floor(30 + Math.random() * 65), // 30-95%
        workerName: workerNames[Math.floor(Math.random() * workerNames.length)],
        companyName: companyNames[Math.floor(Math.random() * companyNames.length)],
        questionCount: Math.floor(10 + Math.random() * 20),
      });
    }
    
    // Sort by timestamp
    dataPoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return {
      themeId: id,
      themeName: themeNames[id] || `Thema ${idx + 1}`,
      themeColor: colors[idx % colors.length],
      data: dataPoints,
    };
  });

  return {
    series,
    overallAveragePercent: 50,
  };
}

export function getMockThemeQuestionExtremes(
  themeIds: string[]
): ThemeQuestionExtremes[] {
  const themeNames: Record<string, string> = {
    "theme-1": "Arbeitssicherheit",
    "theme-2": "Datenschutz DSGVO",
    "theme-3": "Brandschutz",
    "theme-4": "Erste Hilfe",
    "theme-5": "IT-Sicherheit",
  };

  return themeIds.map((id) => ({
    themeId: id,
    themeName: themeNames[id] || `Thema`,
    worstQuestions: [
      {
        id: `${id}-q1`,
        questionText: "Was ist bei der Verwendung von Leitern zu beachten?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 23,
        totalAnswers: 145,
        correctAnswers: 33,
      },
      {
        id: `${id}-q2`,
        questionText: "Welche PSA ist in der Werkstatt Pflicht?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 34,
        totalAnswers: 138,
        correctAnswers: 47,
      },
      {
        id: `${id}-q3`,
        questionText: "Wie oft muss eine Unterweisung erfolgen?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 41,
        totalAnswers: 152,
        correctAnswers: 62,
      },
    ],
    bestQuestions: [
      {
        id: `${id}-q4`,
        questionText: "Wer ist für die Arbeitssicherheit verantwortlich?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 95,
        totalAnswers: 148,
        correctAnswers: 141,
      },
      {
        id: `${id}-q5`,
        questionText: "Was bedeutet das Gebotszeichen 'Schutzbrille tragen'?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 89,
        totalAnswers: 142,
        correctAnswers: 126,
      },
      {
        id: `${id}-q6`,
        questionText: "Wo befindet sich der nächste Feuerlöscher?",
        themeId: id,
        themeName: themeNames[id] || "Thema",
        avgScorePercent: 82,
        totalAnswers: 155,
        correctAnswers: 127,
      },
    ],
  }));
}
