// src/features/service/publicAssessmentService.ts

/* =========================
   API Types (roh vom Backend)
========================= */
export type ApiStartResponse = {
  sessionId: string;
  themaId: string;
  firstOrNextQuestion?: ApiQuestion;
  status: "in_progress" | "completed";
};

export type ApiQuestion = {
  questionTypeName?: string;          // z.B. "Multiple Choice"
  questionId: string;
  answered: boolean;
  scoringSchema?: string;             // evtl. JSON-String
  options?: string | string[];        // kann als JSON-String kommen
  index?: number;
  inputType: string;                  // "radio" | "checkbox" | "text" | "date" | ...
  text: string;
  min?: number; max?: number; step?: number;
  labels?: [string, string];
  required?: boolean;
};

export type ApiState = {
  sessionId?: string;
  themaId?: string;
  status: "in_progress" | "completed";
  answeredCount: number;
  totalCount: number;
};

/* =========================
   HTTP Helper (ABSOLUTE BASE-URL)
========================= */
// Per .env steuerbar, sonst localhost:8080
const BACKEND_BASE =
  (import.meta as any).env?.VITE_BACKEND_BASE || "http://localhost:8080";

// Hilfsfunktion, damit wir sauber zusammensetzen
const join = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    // versuche Fehlermeldung zu lesen, sonst Status
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
  // @ts-expect-error – bei 204 gibt's kein JSON
  return res.status === 204 ? undefined : res.json();
}

/* =========================
   Endpoints (mit absoluter URL)
========================= */

const accessRoot = (accessToken: string) =>
  join(BACKEND_BASE, `/public/access/${encodeURIComponent(accessToken)}`);

// START oder RESUME
export async function startSession(
  accessToken: string,
  themaId: string
): Promise<ApiStartResponse> {
  const url = join(
    accessRoot(accessToken),
    `/themas/${encodeURIComponent(themaId)}/start`
  );
  return http<ApiStartResponse>(url, { method: "POST" });
}

// Nächste unbeantwortete Frage
export async function getNextQuestion(
  accessToken: string,
  sessionId: string
): Promise<ApiQuestion | undefined> {
  const url = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/next`
  );
  return http<ApiQuestion | undefined>(url, { method: "GET" });
}

// Session-Status/Progress
export async function getState(
  accessToken: string,
  sessionId: string
): Promise<ApiState> {
  const url = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/state`
  );
  return http<ApiState>(url, { method: "GET" });
}

//  Prozent berechnen
export const calcProgressPct = (s: ApiState) =>
  s.totalCount ? Math.round((s.answeredCount / s.totalCount) * 100) : 0;

// Antwort speichern 
export async function saveAnswer(
  accessToken: string,
  sessionId: string,
  questionId: string,
  value: string | number | string[]
): Promise<{ saved: boolean; answerId?: string; score?: number; answeredCount?: number }> {
  const url = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/answers/${encodeURIComponent(questionId)}`
  );
  return http(url, { method: "PUT", body: JSON.stringify({ value }) });
}

// Session abschließen
export async function completeSession(
  accessToken: string,
  sessionId: string
): Promise<{ status: "completed"; totalScore?: number; maxPossibleScore?: number; completed?: boolean }> {
  const url = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/complete`
  );
  return http(url, { method: "POST" });
}

/* 
   UI-Types & Normalizer
 */
export type UiQuestion =
  | { id: string; text: string; type: "radio"; options: string[] }
  | { id: string; text: string; type: "checkbox"; options: string[] }
  | { id: string; text: string; type: "slider"; min: number; max: number; labels?: [string, string] }
  | { id: string; text: string; type: "textarea"; placeholder?: string }
  | { id: string; text: string; type: "text"; placeholder?: string }
  | { id: string; text: string; type: "select"; options: string[]; required?: boolean }
  | { id: string; text: string; type: "number"; min?: number; max?: number; step?: number; placeholder?: string }
  | { id: string; text: string; type: "date"; min?: string; max?: string }
  | { id: string; text: string; type: "order"; options: string[] };

export function normalizeApiQuestion(q: ApiQuestion): UiQuestion {
  const parseMaybeJsonArray = (src?: string | string[]): string[] => {
    if (!src) return [];
    if (Array.isArray(src)) return src;
    try {
      const arr = JSON.parse(src);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const t = q.inputType?.toLowerCase();

  if (t === "radio" || t === "multiple-choice") {
    return { id: q.questionId, text: q.text, type: "radio", options: parseMaybeJsonArray(q.options) };
  }
  if (t === "checkbox" || t === "multiple-select") {
    return { id: q.questionId, text: q.text, type: "checkbox", options: parseMaybeJsonArray(q.options) };
  }
  if (t === "select" || t === "dropdown") {
    return { id: q.questionId, text: q.text, type: "select", options: parseMaybeJsonArray(q.options), required: q.required };
  }
  if (t === "number") {
    return { id: q.questionId, text: q.text, type: "number", min: q.min, max: q.max, step: q.step };
  }
  if (t === "date") {
    return { id: q.questionId, text: q.text, type: "date" };
  }
  if (t === "range" || t === "slider") {
    return { id: q.questionId, text: q.text, type: "slider", min: q.min ?? 0, max: q.max ?? 5, labels: q.labels };
  }
  if (t === "order") {
    return { id: q.questionId, text: q.text, type: "order", options: parseMaybeJsonArray(q.options) };
  }
  if (t === "textarea") {
    return { id: q.questionId, text: q.text, type: "textarea" };
  }
  // Fallback
  return { id: q.questionId, text: q.text, type: "text" };
}

/* =========================
   Helper: UI-Wert -> value
========================= */
export function buildSaveValue(
  q: UiQuestion,
  raw: any
): string | number | string[] {
  switch (q.type) {
    case "checkbox":
    case "order":
      return Array.isArray(raw) ? raw : [];
    case "slider":
    case "number":
      return Number(raw);
    case "date":
    case "select":
    case "textarea":
    case "text":
    case "radio":
      return String(raw);
    default:
      return String(raw);
  }
}
