import { apiClient } from "./client";

/* =========================================================
   Types
========================================================= */

export interface ManualScoringQuestion {
  questionId: string;
  questionText: string;
  inputType: string;
  answeredValue: string | null;
  score: number | null;
  maxScore: number;
  answeredAt: string | null;
  status: "automatic" | "manual" | "skipped" | "not_scorable";
}

export interface ManualScoringView {
  sessionId: string;
  status: string;
  workerId: string;
  workerName: string;
  themaId: string;
  themaName: string;
  companyName?: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  automatischBewerteteFragen: ManualScoringQuestion[];
  manuellZuBewertendeFragen: ManualScoringQuestion[];
  uebersprungeneFragen: ManualScoringQuestion[];
}

export interface UpdateScoreRequest {
  score: number;
}

export interface QuestionTimelineItem {
  questionId: string;
  questionText: string;
  inputType: string;
  answeredValue: string | null;
  score: number | null;
  maxScore: number;
  answeredAt: string | null;
  status: "automatic" | "manual" | "skipped" | "not_scorable";
}

export interface SessionQuestionsTimeline {
  sessionId: string;
  status: string;
  workerId: string;
  workerName: string;
  themaId: string;
  themaName: string;
  companyName?: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  questions: QuestionTimelineItem[];
  totalQuestions: number;
  answeredCount: number;
  skippedCount: number;
  automaticCount: number;
  manualCount: number;
}

/* =========================================================
   API Functions
========================================================= */

/**
 * Get all answers timeline (chronological order)
 */
export async function getQuestionsTimeline(
  sessionId: string
): Promise<SessionQuestionsTimeline> {
  const { data } = await apiClient.get<SessionQuestionsTimeline>(
    `/scoring/admin/sessions/${encodeURIComponent(sessionId)}/questions-timeline`
  );
  return data;
}

/**
 * Get manual scoring view (categorized into lists)
 */
export async function getManualScoringView(
  sessionId: string
): Promise<ManualScoringView> {
  const { data } = await apiClient.get<ManualScoringView>(
    `/scoring/admin/sessions/${encodeURIComponent(sessionId)}/manual-scoring`
  );
  return data;
}

/**
 * Update manual score for a question
 */
export async function updateManualScore(
  sessionId: string,
  questionId: string,
  score: number
): Promise<void> {
  await apiClient.put(
    `/scoring/admin/sessions/${encodeURIComponent(sessionId)}/answers/${encodeURIComponent(questionId)}/score`,
    { score }
  );
}
