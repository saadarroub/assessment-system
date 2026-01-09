// frontend/src/main/react/features/service/scoringService.ts
import { apiClient } from "@/api/client"; 

const BASE_URL = "/scoring/admin/sessions";

export const getQuestionsTimeline = async (sessionId: string) => {
  // return apiClient.get(`${BASE_URL}/${sessionId}/questions-timeline`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { questionId: "q1", questionText: "Timeline Q1", answerText: "Ans 1", timestamp: "10:00" },
    { questionId: "q2", questionText: "Timeline Q2", answerText: "Ans 2", timestamp: "10:05" }
  ];
};

export const getManualScoring = async (sessionId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      categoryName: "Security (Mock)",
      items: [
        { questionId: "q1", questionText: "Manual Q1", answerText: "Ans 1", score: 8.5 }
      ]
    }
  ];
};

export const updateAnswerScore = async (sessionId: string, questionId: string, score: number) => {
  console.log(`[Mock Update] ID: ${questionId}, Score: ${score}`);
  return { success: true };
};
