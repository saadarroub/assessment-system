// src/main/react/api/questionApi.ts
import { apiClient } from "@/api/client";

const API_BASE = ""; // apiClient verwendet bereits http://localhost:8080/api als baseURL

// 🟢 Alle Fragen abrufen
export async function getAllQuestions() {
  const response = await apiClient.get(`${API_BASE}/questions`);
  return response.data;
}   



// ✅ Alle Fragetypen abrufen
export async function getQuestionTypes() {
  try {
    const response = await apiClient.get(`${API_BASE}/question-types`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Fehler beim Laden der Fragetypen:", error);
    throw error;
  }
}

// 🟢 Frage löschen
export async function deleteQuestion(id: string) {
  try {
    await apiClient.delete(`${API_BASE}/questions/${id}`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen der Frage:", error);
    throw error;
  }
}


// 🟢 Frage aktualisieren
export async function updateQuestion(id: string, question: any) {
  const response = await apiClient.put(`${API_BASE}/questions/${id}`, question, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// 🟢 Alle QuestionNodes laden
export async function getAllQuestionNodes() {
  try {
    const response = await apiClient.get(`${API_BASE}/question-nodes`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 204) {
      return [];
    }
    console.error("❌ Fehler beim Laden der QuestionNodes:", error);
    return [];
  }
}

// 🔹 Holt ALLE Themen 
export async function getAllThemas() {
  try {
    const response = await apiClient.get(`${API_BASE}/themas`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 204) {
      return [];
    }
    console.error("❌ Fehler beim Laden der Themen:", error);
    return [];
  }
}


// 🔹 Holt alle Root-Fragen eines bestimmten Themas
export async function getRootQuestionsByThema(themaId: string) {
  const response = await apiClient.get(`${API_BASE}/question-nodes/thema/${themaId}/root`);
  return response.data;
}



// 🔹 Holt alle Unterfragen einer bestimmten Parent-Frage
export async function getChildrenByParent(parentId: string) {
  try {
    const response = await apiClient.get(`${API_BASE}/question-nodes/parent/${parentId}/children`);
    if (response.status === 204) {
      return [];
    }
    return response.data ?? [];
  } catch (error) {
    console.error("❌ Fehler beim Laden der Unterfragen:", error);
    throw error;
  }
}

// 🔹 Holt Details eines Themas (Name + Beschreibung)
export async function getThemaById(themaId: string) {
  const response = await apiClient.get(`${API_BASE}/themas/${themaId}`);
  return response.data;
}

// 🔹 Neues Thema anlegen
export async function createThema(themaData: { name: string; description: string }) {
  const response = await apiClient.post(`${API_BASE}/themas`, themaData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}


// 🔹 Thema löschen
export async function deleteThema(id: string) {
  const response = await apiClient.delete(`${API_BASE}/themas/${id}`);
  if (response.status >= 400) throw new Error("Fehler beim Löschen des Themas");
  return true;
}

// 🔹 Thema aktualisieren
export async function updateThema(id: string, themaData: { name: string; description: string }) {
  const response = await apiClient.put(`${API_BASE}/themas/${id}`, themaData, {
    headers: { "Content-Type": "application/json" },
  });

  if (response.status >= 400) throw new Error("Fehler beim Aktualisieren des Themas");
  return response.data;
}

// ✅ Neue Frage erstellen
export async function createQuestion(questionData: any) {
  try {
    const response = await apiClient.post(`${API_BASE}/questions`, questionData);
    return response.data;
  } catch (error: any) {
    console.error("❌ Fehler beim Erstellen der Frage:", error);
    throw error;
  }
}

// 🔹 QuestionNode erstellen
export async function createQuestionNode(
  themaId: string,
  questionId: string,
  parentNodeId?: string | null
) {
  const payload = {
    thema: { id: themaId },
    question: { id: questionId },
    parentNode: parentNodeId ? { id: parentNodeId } : null,
  };

  const response = await apiClient.post(`${API_BASE}/question-nodes`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}









