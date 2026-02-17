
const MOCK_DATA = [
  {
    categoryName: "Netzwerksicherheit",
    items: [
      { questionId: "q1", questionText: "Ist die Firewall aktiviert?", answerText: "Ja, alle Regeln sind aktiv.", score: 100 },
      { questionId: "q2", questionText: "Werden Passwörter regelmäßig geändert?", answerText: "Nein, nur einmal im Jahr.", score: 0 },
    ]
  },
  {
    categoryName: "Physische Sicherheit",
    items: [
      { questionId: "q3", questionText: "Gibt es Zugangskontrollen?", answerText: "Ja, mit Kartenleser.", score: 80 },
      { questionId: "q4", questionText: "Werden Besucher protokolliert?", answerText: "Manchmal, nicht immer.", score: null }, 
    ]
  }
];

export const getManualScoring = async (sessionId: string) => {
  console.log(`[Mock] Fetching data for session: ${sessionId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_DATA;
};

export const updateAnswerScore = async (sessionId: string, questionId: string, score: number) => {
  console.log(`[Mock] Updating score: Session ${sessionId}, Question ${questionId} -> ${score}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true };
};

export const getQuestionsTimeline = async (sessionId: string) => {
    return [];
}
