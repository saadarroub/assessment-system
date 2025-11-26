
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
  currentAnswer?: ApiCurrentAnswer;
};
export type ApiCurrentAnswer = {
  answerId: string;
  value: string | number | string[];    
  score?: number;
  answeredAt?: string;
};
export type ApiPreviousResponse =
  | ({ atStart: true } & Partial<ApiQuestion>)
  | ({ atStart?: false } & ApiQuestion);



export type ApiState = {
  sessionId?: string;
  themaId?: string;
  status: "in_progress" | "completed";
  answeredCount: number;
  totalCount: number;
};

/* 
   HTTP Helper 
 */
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

/* 
   Endpoints (mit absoluter URL)
 */

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
// Vorherige Frage
// Vorherige Frage (mit currentQuestionId als Query-Param)
export async function getPreviousQuestion(
  accessToken: string,
  sessionId: string,
  currentQuestionId: string
): Promise<ApiPreviousResponse> {
  // Basis-URL
  const base = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/previous`
  );

  // Query-Param anhängen
  const url = `${base}?currentQuestionId=${encodeURIComponent(
    currentQuestionId
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Fall 1: 204 = wir sind an der ersten Frage
  if (res.status === 204) {
    try {
      const body = await res.json();
      if (body && typeof body.atStart === "boolean") {
        return { atStart: body.atStart } as ApiPreviousResponse;
      }
    } catch {
      // 204 ohne Body → interpretieren wir als "am Start"
    }
    return { atStart: true } as ApiPreviousResponse;
  }

  // Fehlerfälle
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if ((data as any)?.message) msg = (data as any).message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  // Normale 200-Antwort mit Frage
  const data = (await res.json()) as ApiQuestion;
  // atStart explizit false markieren
  return { ...data, atStart: false };
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
export type ApiSummaryQuestion = {
  questionId: string;
  questionText: string;
  inputType: string;
  answeredValue: string | number | string[];
  score: number;
  maxScore: number;
  answeredAt: string;
  orderIndex: number;
  isRequired: boolean;
};

export type ApiSummaryResponse = {
  sessionId: string;
  status: "in_progress" | "completed";
  themaId: string;
  themaName: string;
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  totalScore: number;
  maxPossibleScore: number;
  answeredQuestions: ApiSummaryQuestion[];
  automatischBewerteteFragen: ApiSummaryQuestion[];
  manuellZuBewertendeFragen: ApiSummaryQuestion[];
  uebersprungeneFragen: ApiSummaryQuestion[];
  automatischBewertetAnzahl: number;
  manuellZuBewertenAnzahl: number;
  uebersprungenAnzahl: number;
};

// Hilfsfunktion: eine Summary-Zeile -> UiQuestion (über normalizeApiQuestion)
export function summaryRowToUiQuestion(row: ApiSummaryQuestion): UiQuestion {
  // Wir bauen uns ein "ApiQuestion"-ähnliches Objekt
  const apiLike: ApiQuestion = {
    questionId: row.questionId,
    text: row.questionText,
    inputType: row.inputType,
    answered: true,
    options: undefined,           // Summary liefert i.d.R. keine Options mehr
    questionTypeName: undefined,
    scoringSchema: undefined,
    index: row.orderIndex,
    min: (row as any).min,
    max: (row as any).max,
    step: (row as any).step,
    labels: (row as any).labels,
    required: row.isRequired,
    currentAnswer: {
      answerId: "",               // kennen wir nicht, ist hier egal
      value: row.answeredValue,   // das ist die gegebene Antwort aus Summary
      score: row.score,
      answeredAt: row.answeredAt,
    },
  };

  // und schicken das durch deinen existierenden Normalizer
  return normalizeApiQuestion(apiLike);
}

// GET /public/access/{token}/sessions/{id}/summary
export async function getSummary(
  accessToken: string,
  sessionId: string
): Promise<ApiSummaryResponse> {
  const url = join(
    accessRoot(accessToken),
    `/sessions/${encodeURIComponent(sessionId)}/summary`
  );
  return http<ApiSummaryResponse>(url, { method: "GET" });
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
  | { id: string; text: string; type: "radio"; options: string[]; required?: boolean }
  | { id: string; text: string; type: "checkbox"; options: string[]; required?: boolean }
  | { id: string; text: string; type: "slider"; min: number; max: number; labels?: [string, string]; required?: boolean }
  | { id: string; text: string; type: "textarea"; placeholder?: string; required?: boolean }
  | { id: string; text: string; type: "text"; placeholder?: string; required?: boolean }
  | { id: string; text: string; type: "select"; options: string[]; required?: boolean }
  | { id: string; text: string; type: "number"; min?: number; max?: number; step?: number; placeholder?: string; required?: boolean }
  | { id: string; text: string; type: "date"; min?: string; max?: string; required?: boolean }
  | { id: string; text: string; type: "order"; options: string[]; required?: boolean };


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

  const tRaw = q.inputType || "";
  const t = tRaw.toLowerCase().replace(/[_\s]+/g, "-");

  if (t === "radio" || t === "multiple-choice" || t === "single-choice") {
    return {
      id: q.questionId,
      text: q.text,
      type: "radio",
      options: parseMaybeJsonArray(q.options),
      required: q.required,
    };
  }

  if (t === "checkbox" || t === "multiple-select") {
    return {
      id: q.questionId,
      text: q.text,
      type: "checkbox",
      options: parseMaybeJsonArray(q.options),
      required: q.required,
    };
  }

  if (t === "select" || t === "dropdown") {
    return {
      id: q.questionId,
      text: q.text,
      type: "select",
      options: parseMaybeJsonArray(q.options),
      required: q.required,
    };
  }

  // ⬇️ NEU: number_input mit abdecken
  if (t === "number" || t === "number-input") {
    return {
      id: q.questionId,
      text: q.text,
      type: "number",
      min: q.min,
      max: q.max,
      step: q.step,
      required: q.required,
    };
  }

  // ⬇️ NEU: date_input mit abdecken
  if (t === "date" || t === "date-input") {
    return {
      id: q.questionId,
      text: q.text,
      type: "date",
      required: q.required,
    };
  }

  // rating_scale wie Slider
  if (t === "range" || t === "slider" || t === "rating-scale") {
    return {
      id: q.questionId,
      text: q.text,
      type: "slider",
      min: q.min ?? 1,
      max: q.max ?? 5,
      labels: q.labels,
      required: q.required,
    };
  }

  // ordering mit abdecken
  if (t === "order" || t === "ordering") {
    return {
      id: q.questionId,
      text: q.text,
      type: "order",
      options: parseMaybeJsonArray(q.options),
      required: q.required,
    };
  }

  if (t === "textarea") {
    return {
      id: q.questionId,
      text: q.text,
      type: "textarea",
      required: q.required,
    };
  }

  // Fallback
  return {
    id: q.questionId,
    text: q.text,
    type: "text",
    required: q.required,
  };
}



/* 
   Helper: UI-Wert -> value
 */
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
