// src/main/react/features/service/scoringService.ts

import { apiClient } from "@/api/client"; 

const BASE_URL = "/scoring/admin/sessions";

// 1. Timeline (Mock)
export const getQuestionsTimeline = async (sessionId: string) => {
  // [Real API Call] 
  // const response = await apiClient.get(`${BASE_URL}/${sessionId}/questions-timeline`);
  // return response.data;

  // [Mock Data] 
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      questionId: "q1",
      questionText: "Wie bewerten Sie die aktuelle IT-Sicherheit?",
      answerText: "Wir haben grundlegende Maßnahmen ergriffen.",
      timestamp: "2025-01-10 10:15",
    },
    {
      questionId: "q2",
      questionText: "Nutzen Sie 2-Faktor-Authentifizierung?",
      answerText: "Ja, für alle Administratoren.",
      timestamp: "2025-01-10 10:18",
    }
  ];
};

// 2. Manual Scoring (Mock)
export const getManualScoring = async (sessionId: string) => {
  // const response = await apiClient.get(`${BASE_URL}/${sessionId}/manual-scoring`);
  // return response.data;

  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      categoryName: "IT-Sicherheit",
      items: [
        {
          questionId: "q1",
          questionText: "Wie bewerten Sie die aktuelle IT-Sicherheit?",
          answerText: "Wir haben grundlegende Maßnahmen ergriffen.",
          score: 5.0,
        },
        {
          questionId: "q2",
          questionText: "Nutzen Sie 2-Faktor-Authentifizierung?",
          answerText: "Ja, für alle Administratoren.",
          score: 10.0,
        }
      ]
    }
  ];
};

// 3. Update Score (Mock)
export const updateAnswerScore = async (sessionId: string, questionId: string, score: number) => {
  // return apiClient.put(`${BASE_URL}/${sessionId}/answers/${questionId}/score`, { score });
  
  console.log(`[Mock] Updated score for ${questionId}: ${score}`);
  return { success: true };
};
