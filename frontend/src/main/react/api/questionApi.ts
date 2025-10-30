// src/main/react/api/questionApi.ts
import axios from "axios";

const API_BASE = "http://localhost:8080/api"; // ggf. anpassen falls dein Backend anders läuft

// 🟢 Alle Fragen abrufen
export async function getAllQuestions() {
  const response = await axios.get(`${API_BASE}/questions`);
  return response.data;
}

// ✅ Neue Frage erstellen
export async function createQuestion(newQuestion: any) {
  try {
    const response = await axios.post(`${API_BASE}/questions`, newQuestion, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Fehler beim Erstellen der Frage:", error);
    throw error;
  }
}

// ✅ Alle Fragetypen abrufen
export async function getQuestionTypes() {
  try {
    const response = await axios.get(`${API_BASE}/question-types`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Fehler beim Laden der Fragetypen:", error);
    throw error;
  }
}

// 🟢 Frage löschen
export async function deleteQuestion(id: string) {
  await axios.delete(`${API_BASE}/questions/${id}`);
}

// 🟢 Frage aktualisieren
export async function updateQuestion(id: string, question: any) {
  const response = await axios.put(`${API_BASE}/questions/${id}`, question, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// 🟢 Alle QuestionNodes laden
export async function getAllQuestionNodes() {
  const response = await axios.get(`${API_BASE}/question-nodes`);
  return response.data;
}

// 🔹 Holt alle Root-Fragen eines bestimmten Themas
export async function getRootQuestionsByThema(themaId: string) {
  const response = await fetch(`http://localhost:8080/api/question-nodes/thema/${themaId}/root`);
  if (!response.ok) throw new Error("Fehler beim Laden der Fragen");
  return await response.json();
}



// 🔹 Holt alle Unterfragen einer bestimmten Parent-Frage
export async function getChildrenByParent(parentId: string) {
  const response = await fetch(`http://localhost:8080/api/question-nodes/parent/${parentId}/children`);

  if (response.status === 204) {
    console.log("ℹ️ Keine Unterfragen für:", parentId);
    return [];
  }

  if (!response.ok) {
    throw new Error("❌ Fehler beim Laden der Unterfragen");
  }

  const data = await response.json();
  console.log("📥 Unterfragen von", parentId, "=", data);
  return data;
}

