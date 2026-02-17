import { apiClient } from "@/shared/service/api/client";

const API_BASE = ""; 

//  Alle Fragen abrufen
export async function getAllQuestions() {
  const response = await apiClient.get(`${API_BASE}/questions`);
  return response.data;
}   



// Alle Fragetypen abrufen
export async function getQuestionTypes() {
  try {
    const response = await apiClient.get(`${API_BASE}/question-types`);
    return response.data;
  } catch (error: any) {
    console.error("Fehler beim Laden der Fragetypen:", error);
    throw error;
  }
}

// Frage löschen
export async function deleteQuestion(id: string) {
  try {
    await apiClient.delete(`${API_BASE}/questions/${id}`);
  } catch (error) {
    console.error("Fehler beim Löschen der Frage:", error);
    throw error;
  }
}


// Frage aktualisieren
export async function updateQuestion(id: string, question: any) {
  const response = await apiClient.put(`${API_BASE}/questions/${id}`, question, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// QuestionNode Required Status aktualisieren
export async function updateQuestionNodeRequired(nodeId: string, isRequired: boolean) {
  const response = await apiClient.patch(
    `${API_BASE}/question-nodes/${nodeId}/required?isRequired=${isRequired}`,
    {},
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

// Alle QuestionNodes laden
export async function getAllQuestionNodes() {
  try {
    const response = await apiClient.get(`${API_BASE}/question-nodes`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 204) {
      return [];
    }
    console.error("Fehler beim Laden der QuestionNodes:", error);
    return [];
  }
}

// Holt ALLE Themen 
export async function getAllThemas() {
  try {
    const response = await apiClient.get(`${API_BASE}/themas`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 204) {
      return [];
    }
    console.error("Fehler beim Laden der Themen:", error);
    return [];
  }
}


// Holt alle Root-Fragen eines bestimmten Themas
export async function getRootQuestionsByThema(themaId: string) {
  const response = await apiClient.get(`${API_BASE}/question-nodes/thema/${themaId}/root`);
  return response.data;
}



// Holt alle Unterfragen einer bestimmten Parent-Frage
export async function getChildrenByParent(parentId: string) {
  try {
    const response = await apiClient.get(`${API_BASE}/question-nodes/parent/${parentId}/children`);
    if (response.status === 204) {
      return [];
    }
    return response.data ?? [];
  } catch (error) {
    console.error("Fehler beim Laden der Unterfragen:", error);
    throw error;
  }
}

// Holt Details eines Themas (Name + Beschreibung)
export async function getThemaById(themaId: string) {
  const response = await apiClient.get(`${API_BASE}/themas/${themaId}`);
  return response.data;
}

//Neues Thema anlegen
export async function createThema(themaData: { name: string; description: string }) {
  const response = await apiClient.post(`${API_BASE}/themas`, themaData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}


// Thema löschen
export async function deleteThema(id: string) {
  const response = await apiClient.delete(`${API_BASE}/themas/${id}`);
  if (response.status >= 400) throw new Error("Fehler beim Löschen des Themas");
  return true;
}

// Thema aktualisieren
export async function updateThema(id: string, themaData: { name: string; description: string }) {
  const response = await apiClient.put(`${API_BASE}/themas/${id}`, themaData, {
    headers: { "Content-Type": "application/json" },
  });

  if (response.status >= 400) throw new Error("Fehler beim Aktualisieren des Themas");
  return response.data;
}

//  Neue Frage erstellen
export async function createQuestion(questionData: any) {
  try {
    const response = await apiClient.post(`${API_BASE}/questions`, questionData);
    return response.data;
  } catch (error: any) {
    console.error("Fehler beim Erstellen der Frage:", error);
    throw error;
  }
}

// 🔹 QuestionNode erstellen
export async function createQuestionNode(
  themaId: string,
  questionId: string,
  parentNodeId?: string | null,
  isRequired?: boolean
) {
  const payload = {
    thema: { id: themaId },
    question: { id: questionId },
    parentNode: parentNodeId ? { id: parentNodeId } : null,
    isRequired: isRequired !== undefined ? isRequired : true, // Standard: true
  };

  const response = await apiClient.post(`${API_BASE}/question-nodes`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

// Frage verschieben (root)
export async function moveRootNode(nodeId: string, position: number) {
  const url = `${API_BASE}/question-nodes/${nodeId}/move?position=${position}`;
  await apiClient.patch(url);
}



// Unterfrage verschieben (parent bleibt gleich)
export async function moveChildNode(
  nodeId: string,
  parentId: string,
  position: number
) {
  const url = `${API_BASE}/question-nodes/${nodeId}/move?newParentId=${parentId}&position=${position}`;
  await apiClient.patch(url);
}

export async function duplicateThema(id: string) {
  try {
    const res = await apiClient.post(`${API_BASE}/themas/${id}/duplicate`);
    return res.data;
  } catch (error) {
    console.error("Fehler beim Duplizieren des Themas:", error);
    throw error;
  }
}
// Thema-Status ändern (aktiv/inaktiv)
export async function changeThemaStatus(id: string) {
  const url = `${API_BASE}/themas/status/change/${id}`;
  const res = await apiClient.patch(url);
  return res.data;
}
// Alle aktiven Themen abrufen
export async function getActiveThemas() {
  const response = await apiClient.get(`${API_BASE}/themas/status/active`);
  return response.data;
}
// Alle inaktiven Themen abrufen
export async function getInactiveThemas() {
  const response = await apiClient.get(`${API_BASE}/themas/status/inactive`);
  return response.data;
}








