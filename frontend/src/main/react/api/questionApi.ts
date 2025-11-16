// src/main/react/api/questionApi.ts
import axios from "axios";

const API_BASE = "http://localhost:8080/api"; // ggf. anpassen falls dein Backend anders läuft

// 🟢 Alle Fragen abrufen
export async function getAllQuestions() {
  const response = await axios.get(`${API_BASE}/questions`);
  return response.data;
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
  try {
    await axios.delete(`${API_BASE}/questions/${id}`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen der Frage:", error);
    throw error;
  }
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
  try {
    const response = await axios.get(`${API_BASE}/question-nodes`);
    // ✅ Sicherstellen, dass immer ein Array zurückgegeben wird
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    // Wenn 204 NO_CONTENT oder Fehler → leeres Array zurückgeben
    if (error.response?.status === 204) {
      return [];
    }
    console.error("❌ Fehler beim Laden der QuestionNodes:", error);
    return []; // Fallback: leeres Array statt null
  }
}

// 🔹 Holt ALLE Themen 
export async function getAllThemas() {
  try {
    const response = await axios.get(`${API_BASE}/themas`);
    // ✅ Sicherstellen, dass immer ein Array zurückgegeben wird
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    // Wenn 204 NO_CONTENT oder Fehler → leeres Array zurückgeben
    if (error.response?.status === 204) {
      return [];
    }
    console.error("❌ Fehler beim Laden der Themen:", error);
    return []; // Fallback: leeres Array statt null
  }
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

// 🔹 Holt Details eines Themas (Name + Beschreibung)
export async function getThemaById(themaId: string) {
  const response = await fetch(`http://localhost:8080/api/themas/${themaId}`);
  if (!response.ok) throw new Error("Fehler beim Laden des Themas");
  return await response.json();
}

// 🔹 Neues Thema anlegen
export async function createThema(themaData: { name: string; description: string }) {
  const response = await axios.post(`${API_BASE}/themas`, themaData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}


// 🔹 Thema löschen
export async function deleteThema(id: string) {
  const response = await fetch(`http://localhost:8080/api/themas/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Fehler beim Löschen des Themas");
  return true;
}

// 🔹 Thema aktualisieren
export async function updateThema(id: string, themaData: { name: string; description: string }) {
  const response = await fetch(`http://localhost:8080/api/themas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(themaData),
  });

  if (!response.ok) throw new Error("Fehler beim Aktualisieren des Themas");
  return await response.json();
}

// ✅ Neue Frage erstellen
export async function createQuestion(questionData: any) {
  try {
    const response = await axios.post(`${API_BASE}/questions`, questionData);
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

  const response = await axios.post(`${API_BASE}/question-nodes`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

// 🔧 Frage verschieben (root)
export async function moveRootNode(nodeId: string, position: number) {
  const url = `${API_BASE}/question-nodes/${nodeId}/move?position=${position}`;
  await axios.patch(url);
}



// 🔧 Unterfrage verschieben (parent bleibt gleich)
export async function moveChildNode(
  nodeId: string,
  parentId: string,
  position: number
) {
  const url = `${API_BASE}/question-nodes/${nodeId}/move?newParentId=${parentId}&position=${position}`;
  await axios.patch(url);
}









