import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  startSession,
  getNextQuestion,
  saveAnswer,
  completeSession,
  getPreviousQuestion,
  getState,
  normalizeApiQuestion,
  buildSaveValue,
  type UiQuestion,
  type ApiState,
  type ApiQuestion,
  getSummary,
  summaryRowToUiQuestion,
  type ApiSummaryResponse,
} from "@/features/service/publicAssessmentService";
import aa from '@/assets/aa.gif';
import {
  DndContext,
  closestCorners,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";


//Test
import AssessmentResults from "@/features/worker-area/AssessmentResults";


const STORAGE_KEY = "assessments";

/* ========= Session-Meta aus InviteGate ========= */
const SESSION_KEY = "publicAssessmentSession";
type PublicAssessmentSession = {
  token: string;
  assignmentId: string;
  catalogId: string;
  catalogTitle: string;
  workerName: string;
  accessCode?: string;
};

function readStore(): any {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function writeStore(store: any) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { }
}

function resolveAssignmentId(query: URLSearchParams): string {
  const fromUrl = (query.get("assignmentId") || "").trim();
  if (fromUrl) return fromUrl;

  try {
    const raw = localStorage.getItem("activeAssignmentMeta");
    if (!raw) return "unknown";
    const meta = JSON.parse(raw);
    return (meta?.assignmentId || "unknown").trim() || "unknown";
  } catch {
    return "unknown";
  }
}

function makeDashKey(assignmentId: string, topicId: string) {
  return `assignment:${assignmentId}:topic:${topicId}`;
}
function persistUiQuestionMeta(
  assignmentId: string,
  topicId: string,
  uiQ: UiQuestion
) {
  try {
    const store = readStore();
    const dashKey = makeDashKey(assignmentId, topicId);
    const prev = store[dashKey] ?? {};
    const existingMap = prev.uiQuestionsById ?? {};

    store[dashKey] = {
      ...prev,
      uiQuestionsById: {
        ...existingMap,
        [String(uiQ.id)]: uiQ,
      },
    };

    writeStore(store);
  } catch {
    // im Zweifel einfach ignorieren
  }
}
type TrailSnapshot = {
  sessionId: string;
  trailOrder: string[];
  currentPos: number;
};

function persistTrailSnapshot(
  assignmentId: string,
  topicId: string,
  sessionId: string,
  trail: UiQuestion[],
  pos: number
) {
  try {
    const store = readStore();
    const dashKey = makeDashKey(assignmentId, topicId);
    const prev = store[dashKey] ?? {};

    // Map aus dem aktuellen Trail bauen
    const fromTrail: Record<string, UiQuestion> = {};
    for (const q of trail) {
      fromTrail[String(q.id)] = q;
    }

    const existingMap = (prev as any).uiQuestionsById ?? {};

    store[dashKey] = {
      ...prev,
      sessionId,
      trailOrder: trail.map(q => String(q.id)),
      currentPos: pos,
      // HIER: nichts verlieren, immer alles mergen
      uiQuestionsById: {
        ...existingMap,
        ...fromTrail,
      },
    };

    writeStore(store);
  } catch {
    // ignore
  }
}


function restoreTrailSnapshot(
  assignmentId: string,
  topicId: string,
  sessionId: string
): { trail: UiQuestion[]; pos: number; uiMap: Record<string, UiQuestion> } | null {
  try {
    const store = readStore();
    const dashKey = makeDashKey(assignmentId, topicId);
    const snap = store[dashKey] as (TrailSnapshot & {
      uiQuestionsById?: Record<string, UiQuestion>;
    }) | undefined;

    if (!snap) return null;
    if (snap.sessionId !== sessionId) return null;
    if (!Array.isArray(snap.trailOrder)) return null;

    const uiMap = snap.uiQuestionsById || {};
    const trail = snap.trailOrder
      .map(id => uiMap[id])
      .filter(Boolean);

    if (!trail.length) return null;

    const pos = Math.min(
      Math.max(snap.currentPos ?? (trail.length - 1), 0),
      trail.length - 1
    );

    return { trail, pos, uiMap };
  } catch {
    return null;
  }
}

/** Query-Helper */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AssessmentPage() {
  const query = useQuery();
  const navigate = useNavigate();

  /* -------- Session-Meta aus sessionStorage lesen -------- */ // NEU
  const [sessionMeta, setSessionMeta] = useState<PublicAssessmentSession | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PublicAssessmentSession;
      setSessionMeta(parsed);
    } catch (e) {
      console.warn("Fehler beim Lesen von publicAssessmentSession", e);
    }
  }, []);


  const assignmentKeyIdFromLocal = resolveAssignmentId(query);
  const THEMEN_ROUTE = "/app/katalog-themen-public";

  /* -------- URL + Session kombinieren -------- */

  // wichtig: .trim(), damit du keine " " drin hast
  const accessToken =
    (sessionMeta?.token || query.get("accessToken") || "").trim();



  const assignmentKeyId =
    (sessionMeta?.assignmentId || assignmentKeyIdFromLocal || "").trim();

  /* -------- URL-Parameter, die wirklich nur aus der URL kommen -------- */
  const type = (query.get("type") || "").trim();               // optional
  const topicName = (query.get("topicName") || "").trim();     // optional
  const themaId = (
    query.get("themaId") ||
    query.get("topicId") ||
    ""
  ).trim(); // erforderlich

  // Einheitliche Rücknavigation zur Themenliste (mit ALLEN Parametern)
  function goBackToTopics() {
    const qs = new URLSearchParams({
      token: accessToken, // in der Public-Route heißt der Param "token"
      //...(catalogId ? { catalogId } : {}),
      //...(catalogTitle ? { catalogTitle } : {}),
      //...(assignmentKeyId ? { assignmentId: assignmentKeyId } : {}),
      //...(name ? { name } : {}),
      //...(code ? { code } : {}),
    });
    navigate(`${THEMEN_ROUTE}?${qs.toString()}`);
  }


  /* -------- UI/Flow-States -------- */
  const [sessionId, setSessionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [trail, setTrail] = useState<UiQuestion[]>([]); // Verlauf der bereits geladenen Fragen
  const [questionsById, setQuestionsById] = useState<Record<string, UiQuestion>>({});
  //const [questionOrder, setQuestionOrder] = useState<string[] | null>(null);
  const [pos, setPos] = useState<number>(-1);           // Index im Trail (aktuelle Frage)
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<"in_progress" | "completed">("in_progress");
  const [progress, setProgress] = useState<{ answered: number; total: number }>({ answered: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [score, setScore] = useState<{ totalScore: number | null; maxTotalScore: number | null }>({
    totalScore: null,
    maxTotalScore: null,
  });
  // Summary / Review-Modus
  const [summary, setSummary] = useState<ApiSummaryResponse | null>(null);
  //const [showSummary, setShowSummary] = useState(false);
  //const [summaryError, setSummaryError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const [canGoBack, setCanGoBack] = useState(false);

  //Wenn man die Seite neu lädst (gleiche assignmentId + themaId),
  //dann ist questionsById sofort wieder gefüllt.
  useEffect(() => {
    if (!assignmentKeyId || !themaId) return;

    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, themaId);
      const uiMap = store[dashKey]?.uiQuestionsById;

      if (uiMap && typeof uiMap === "object") {
        setQuestionsById(uiMap);
      }
    } catch {
      // ignore
    }
  }, [assignmentKeyId, themaId]);
  // direkt nach dem useEffect, der questionsById bei Mount aus dem Store lädt,
  // noch einen zweiten Effekt:
  useEffect(() => {
    if (!completed) return;
    if (!assignmentKeyId || !themaId) return;

    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, themaId);
      const fromStore = store?.[dashKey]?.uiQuestionsById;

      if (fromStore && typeof fromStore === "object") {
        // alles aus LocalStorage in den State mergen
        setQuestionsById(prev => ({
          ...fromStore,
          ...prev, // State darf überschreiben
        }));
      }
    } catch (e) {
      console.warn("Konnte uiQuestionsById aus LocalStorage nicht mergen", e);
    }
  }, [completed, assignmentKeyId, themaId]);



  const q: UiQuestion | null = pos >= 0 ? trail[pos] : null;

  const step = progress.total
    ? Math.min((progress.answered ?? 0) + 1, progress.total)
    : (pos >= 0 ? pos + 1 : 1);
  const pct = progress.total ? Math.round((progress.answered / progress.total) * 100) : (step > 0 ? step * 5 : 0);

  /*  Helpers  */
  const refreshState = useCallback(async (token: string, sid: string) => {
    try {
      const s: ApiState = await getState(token, sid);
      setProgress({ answered: s.answeredCount, total: s.totalCount });
      setStatus(s.status);
    } catch {
    }
  }, []);

  function applyApiQuestion(
    apiQ: ApiQuestion,
    mode: "replace" | "append" | "prepend"
  ) {
    const uiQ = normalizeApiQuestion(apiQ);

    // currentAnswer → answers-State mappen (dein alter Code)
    if (apiQ.currentAnswer && apiQ.currentAnswer.value !== undefined) {
      const raw = apiQ.currentAnswer.value;

      setAnswers(prev => {
        let mapped: any = raw;

        switch (uiQ.type) {
          case "checkbox":
          case "order":
            mapped = Array.isArray(raw)
              ? raw
              : raw !== undefined && raw !== null && raw !== ""
                ? [String(raw)]
                : [];
            break;

          case "slider":
          case "number":
            mapped =
              typeof raw === "number"
                ? raw
                : raw === "" || raw === null || raw === undefined
                  ? ""
                  : Number(raw);
            break;

          case "radio":
          case "select":
          case "text":
          case "textarea":
          case "date":
          default:
            mapped = Array.isArray(raw) ? (raw[0] ?? "") : String(raw);
            break;
        }

        return {
          ...prev,
          [uiQ.id]: mapped,
        };
      });
    }

    // trail + pos aktualisieren + Snapshot speichern
    setTrail(prevTrail => {
      let nextTrail: UiQuestion[];

      if (mode === "replace") nextTrail = [uiQ];
      else if (mode === "append") nextTrail = [...prevTrail, uiQ];
      else nextTrail = [uiQ, ...prevTrail]; // "prepend"

      const nextPos = mode === "append" ? nextTrail.length - 1 : 0;
      setPos(nextPos);

      if (sessionId) {
        persistTrailSnapshot(
          assignmentKeyId,
          themaId,
          sessionId,
          nextTrail,
          nextPos
        );
      }

      return nextTrail;
    });
  }

  const bootstrapOrResume = useCallback(async (token: string, tid: string) => {
    setLoading(true);
    setFatal(null);
    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, tid);
      const meta = store?.[dashKey] ?? {};
      const existingSid: string | undefined = meta.sessionId;
      const storedView: string | undefined = meta.view;

      // ==== Session existiert schon -> fortsetzen / Summary laden ====
      if (existingSid) {
        setSessionId(existingSid);
        // 🔹 Fall 1: wir waren zuletzt in der Result-Ansicht
        if (storedView === "results") {
          try {
            const s = await getSummary(token, existingSid);
            setSummary(s);
            setScore({
              totalScore: s.totalScore,
              maxTotalScore: s.maxPossibleScore,
            });

            const allRows = s.answeredQuestions ?? [];
            const uiFromSummary: Record<string, UiQuestion> = {};

            for (const row of allRows) {
              const uiQ = summaryRowToUiQuestion(row);
              uiFromSummary[String(uiQ.id)] = uiQ;
              persistUiQuestionMeta(assignmentKeyId, tid, uiQ);
            }

            setQuestionsById(prev => ({
              ...uiFromSummary,
              ...prev,
            }));

            setCompleted(true);      // -> AssessmentResults wird angezeigt
            // status kann „in_progress“ bleiben, weil noch nicht finalisiert
          } catch (e) {
            console.error("getSummary (resume results) failed", e);
            // Fallback: wenn Summary schiefgeht, kannst du hier optional normal weitermachen
          }
          return;
        }
        await refreshState(token, existingSid);

        //  kompletten Verlauf aus localStorage wiederherstellen
        const snap = restoreTrailSnapshot(assignmentKeyId, tid, existingSid);
        if (snap) {
          // uiMap auch in den State schreiben, damit changeAnswerFromResults etc. weiter funktionieren
          setQuestionsById(snap.uiMap);
          setTrail(snap.trail);
          setPos(snap.pos);
          setCanGoBack(snap.pos > 0);
          return;
        }

        //wie bisher – nur nächste offene Frage laden
        const apiQ = await getNextQuestion(token, existingSid);

        if (apiQ) {
          const uiQ = normalizeApiQuestion(apiQ);
          setTrail([uiQ]);
          setPos(0);

          setQuestionsById(prev => ({
            ...prev,
            [String(uiQ.id)]: uiQ,
          }));

          persistUiQuestionMeta(assignmentKeyId, tid, uiQ);
          setCanGoBack(true);
        } else {
          try {
            const s = await getSummary(token, existingSid);
            setSummary(s);
            setScore({
              totalScore: s.totalScore,
              maxTotalScore: s.maxPossibleScore,
            });
            // alle Summary-Fragen -> UiQuestion und in questionsById + LocalStorage
            const allRows = s.answeredQuestions ?? [];
            const uiFromSummary: Record<string, UiQuestion> = {};

            for (const row of allRows) {
              const uiQ = summaryRowToUiQuestion(row);
              uiFromSummary[String(uiQ.id)] = uiQ;

              // auch im LocalStorage merken, damit es bei Reload nicht verloren geht
              persistUiQuestionMeta(assignmentKeyId, tid, uiQ);
            }

            setQuestionsById(prev => ({
              ...uiFromSummary, // Summary-Fragen rein …
              ...prev,          // … aber vorhandene Metas (Trail/LocalStorage) dürfen überschreiben
            }));

          } catch (e) {
            console.error("getSummary (resume) failed", e);
          }

          setCompleted(true);
          setStatus("completed");
        }
        return;
      }
      //  Keine Session -> neue starten (dein vorhandener Code) 
      const s = await startSession(token, tid);
      setSessionId(s.sessionId);
      setStatus(s.status);

      const prev = store[dashKey] ?? {};
      store[dashKey] = { ...prev, sessionId: s.sessionId, started: prev.started ?? new Date().toISOString() };
      writeStore(store);

      let first: UiQuestion | null = null;
      if (s.firstOrNextQuestion) first = normalizeApiQuestion(s.firstOrNextQuestion);
      else {
        const apiQ = await getNextQuestion(token, s.sessionId);
        if (apiQ) first = normalizeApiQuestion(apiQ);
      }

      if (first) {
        setTrail([first]);
        setPos(0);

        // erste Frage ebenfalls merken
        setQuestionsById(prev => ({
          ...prev,
          [String(first.id)]: first,
        }));

        persistUiQuestionMeta(assignmentKeyId, tid, first);
        // Erste Frage eines neuen Assessments -> kein Zurück
        setCanGoBack(false);
      } else {
        setCompleted(true);
        setStatus("completed");
      }
      refreshState(token, s.sessionId);

    } catch (e: any) {
      setFatal(e?.message ?? "Konnte die Session nicht starten/fortsetzen.");
    } finally {
      setLoading(false);
    }
  }, [refreshState, assignmentKeyId]);



  /*  Initial Load  */
  useEffect(() => {
    if (!accessToken || !themaId) return;
    // Session starten
    bootstrapOrResume(accessToken, themaId);
  }, [accessToken, themaId, bootstrapOrResume]);

  /*  Antworten setzen  */
  const setAnswer = (qid: string | number, val: any, mode: any) => {
    setAnswers(prev => {
      const id = String(qid);
      const next: any = { ...prev };
      if (mode === "checkbox" || mode === "order") {
        const arr = Array.isArray(prev[id]) ? [...prev[id]] : [];
        const i = arr.indexOf(val);
        if (i > -1) arr.splice(i, 1);
        else arr.push(val);
        next[id] = arr;
      } else {
        next[id] = val;
      }
      return next;
    });
  };

  /*  Navigation  */
  const prev = async () => {
    if (!sessionId || !q) return;
    if (!canGoBack) return;  // wenn wir sicher wissen, dass es nichts gibt

    try {
      const prevResp = await getPreviousQuestion(
        accessToken,
        sessionId,
        String(q.id)   // currentQuestionId
      );

      // Wir sind an der ersten Frage – nichts mehr zum Zurückgehen
      if (prevResp.atStart && !(prevResp as any).questionId) {
        setCanGoBack(false);
        return;
      }

      const apiQ = prevResp as ApiQuestion;

      applyApiQuestion(apiQ, "replace");

      const uiQ = normalizeApiQuestion(apiQ);
      setQuestionsById(prev => ({
        ...prev,
        [String(uiQ.id)]: uiQ,
      }));
      persistUiQuestionMeta(assignmentKeyId, themaId, uiQ);
    } catch (e) {
      console.error("getPreviousQuestion failed", e);
    }
  };

  const next = async () => {
    if (!q || !sessionId) return;

    try {
      const uiVal = answers[String(q.id)];

      let valueForApi: any;
      const isRequired = q.isRequired === true;

      // OPTIONAL + LEER → "null" schicken
      if (!isRequired && isUiValueEmpty(q, uiVal)) {
        valueForApi = "null";          // <-- ganz bewusst der String "null"
      } else {
        // normaler Weg
        valueForApi = buildSaveValue(q, uiVal ?? "");
      }

      await saveAnswer(accessToken, sessionId, String(q.id), valueForApi);

      // ab hier dein bisheriger Code (canGoBack, refreshState, trail, getNextQuestion, Summary, …)
      setCanGoBack(true);

      // Fortschritt aktualisieren + LocalStorage
      refreshState(accessToken, sessionId);
      try {
        const store = readStore();
        const dashKey = makeDashKey(assignmentKeyId, themaId);
        const prev = store[dashKey] ?? {};
        store[dashKey] = { ...prev, sessionId };
        writeStore(store);
      } catch { }

      // Wenn wir im Trail noch vorwärts können → nur pos++ (History)
      if (pos < trail.length - 1) {
        setPos(p => {
          const nextPos = p + 1;
          if (sessionId) {
            persistTrailSnapshot(assignmentKeyId, themaId, sessionId, trail, nextPos);
          }
          return nextPos;
        });
        return;
      }


      // Nächste Frage vom Server holen
      const apiQ = await getNextQuestion(accessToken, sessionId);

      // ======= KEINE NÄCHSTE FRAGE: Summary holen & ResultPage zeigen =======
      if (!apiQ) {
        try {
          const s = await getSummary(accessToken, sessionId);
          setSummary(s);

          // Score direkt aus /summary übernehmen
          setScore({
            totalScore: s.totalScore,
            maxTotalScore: s.maxPossibleScore,
          });

          // alle Summary-Fragen -> UiQuestion und in questionsById + LocalStorage
          const allRows = s.answeredQuestions ?? [];
          const uiFromSummary: Record<string, UiQuestion> = {};

          for (const row of allRows) {
            const uiQ = summaryRowToUiQuestion(row);
            uiFromSummary[String(uiQ.id)] = uiQ;

            // LocalStorage aktualisieren
            persistUiQuestionMeta(assignmentKeyId, themaId, uiQ);
          }

          setQuestionsById(prev => ({
            ...uiFromSummary,
            ...prev,
          }));
          // 🔹 NEU: merken, dass wir gerade die Result-Preview anzeigen
          try {
            const store = readStore();
            const dashKey = makeDashKey(assignmentKeyId, themaId);
            const prevMeta = store[dashKey] ?? {};
            store[dashKey] = {
              ...prevMeta,
              sessionId,
              view: "results",   // <--- wichtig
            };
            writeStore(store);
          } catch {
            // Fehler im LocalStorage ignorieren
          }

        } catch (e) {
          console.error("getSummary failed", e);
          // zur Not: ohne Score, nur „completed“ → Page rendert trotzdem
        }

        // → jetzt in den „completed“-Zweig springen (ResultPage)
        setCompleted(true);
        return;
      }

      // Es gibt noch eine Frage → normal weiter
      const uiQ = normalizeApiQuestion(apiQ);

      setTrail(prevTrail => {
        const nextTrail = [...prevTrail, uiQ];
        const nextPos = nextTrail.length - 1;

        setPos(nextPos);

        if (sessionId) {
          persistTrailSnapshot(
            assignmentKeyId,
            themaId,
            sessionId,
            nextTrail,
            nextPos
          );
        }

        return nextTrail;
      });

      setQuestionsById(prev => ({
        ...prev,
        [String(uiQ.id)]: uiQ,
      }));
      persistUiQuestionMeta(assignmentKeyId, themaId, uiQ);

    } catch (e) {
      console.error("save/next failed", e);
    }
  };
  const changeAnswerFromResults = async (questionId: string, uiValue: any) => {
    if (!sessionId) return;

    let qMeta = questionsById[String(questionId)];

    // Meta ggf. aus summary rekonstruieren (dein Fallback)
    if (!qMeta && summary) {
      const row = (summary.answeredQuestions ?? []).find(
        (r: any) => String(r.questionId) === String(questionId)
      );

      if (row) {
        const uiQ = summaryRowToUiQuestion(row);
        qMeta = uiQ;

        setQuestionsById(prev => ({
          ...prev,
          [String(uiQ.id)]: uiQ,
        }));
        persistUiQuestionMeta(assignmentKeyId, themaId, uiQ);
      }
    }

    if (!qMeta) {
      console.warn("Keine UiQuestion-Meta für", questionId);
      return;
    }

    try {
      const isRequired = qMeta.isRequired === true;
      const valueForApi =
        !isRequired && isUiValueEmpty(qMeta, uiValue)
          ? "null"
          : buildSaveValue(qMeta, uiValue);

      await saveAnswer(accessToken, sessionId, String(questionId), valueForApi);


      // Local answers-State aktualisieren,
      //    damit beim nächsten Öffnen der Dialog den neuen Wert zeigt
      setAnswers(prev => ({
        ...prev,
        [String(questionId)]: uiValue,
      }));

      //  Summary & Score nochmal vom Backend holen
      const s = await getSummary(accessToken, sessionId);
      setSummary(s);
      setScore({
        totalScore: s.totalScore,
        maxTotalScore: s.maxPossibleScore,
      });

      // Fragen-Meta aus neuer Summary mergen 
      const allRows = s.answeredQuestions ?? [];
      const uiFromSummary: Record<string, UiQuestion> = {};

      for (const row of allRows) {
        const uiQ = summaryRowToUiQuestion(row);
        uiFromSummary[String(uiQ.id)] = uiQ;
        persistUiQuestionMeta(assignmentKeyId, themaId, uiQ);
      }

      setQuestionsById(prev => ({
        ...prev,
        ...uiFromSummary,
      }));

    } catch (e) {
      console.error("changeAnswerFromResults / save failed", e);

    }
  };

  const finalizeSession = async () => {
    if (!sessionId || finalizing) return;

    try {
      setFinalizing(true);

      await completeSession(accessToken, sessionId);

      setStatus("completed");
      setProgress(prev => ({
        ...prev,
        answered: prev.total || prev.answered,
      }));

      try {
        const store = readStore();
        const dashKey = makeDashKey(assignmentKeyId, themaId);
        const prev = store[dashKey] ?? {};
        store[dashKey] = {
          ...prev,
          progress: 100,
          completedAt: new Date().toISOString(),
          sessionId,
        };
        writeStore(store);
      } catch {
        // ignore
      }

      window.alert("Katalog erfolgreich abgeschlossen.");
      goBackToTopics();
    } catch (e) {
      console.error("completeSession failed", e);
      window.alert(
        "Das Assessment konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setFinalizing(false);
    }
  };


  /*  Restart (Assessment nochmal machen)  */
  const restart = async () => {
    // State auf Anfang zurücksetzen und Session neu starten
    setAnswers({});
    setTrail([]);
    setPos(-1);
    setCompleted(false);
    setProgress({ answered: 0, total: 0 });
    setSummary(null);
    setQuestionsById({});
    try {
      const store = readStore();
      const dashKey = makeDashKey(assignmentKeyId, themaId);
      delete store[dashKey];
      writeStore(store);
    } catch { }
    await bootstrapOrResume(accessToken, themaId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /*  UI-Texte  */
  const headerTitle = topicName || "Assessment";
  const headerSubtitle = topicName ? `Thema: ${topicName}` : (type ? `Typ: ${type}` : "");

  /*  Guards / Loader  */
  if (!accessToken || !themaId) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6">
          <div className="font-semibold mb-2">Ungültiger Link</div>
          <div className="text-sm text-[#666]">
            Es fehlen Parameter (<code>accessToken</code> oder <code>themaId</code>). Bitte den Einladungslink erneut öffnen.
          </div>
        </div>
      </div>
    );
  }

  if (loading || (!completed && !q && !fatal)) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6">Lädt …</div>
      </div>
    );
  }

  if (fatal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-12 pb-16 px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow p-6 text-red-600">
          {fatal}
        </div>
      </div>
    );
  }
  if (completed) {
    const totalScore =
      score.totalScore ?? summary?.totalScore ?? 0;
    const maxTotalScore =
      score.maxTotalScore ?? summary?.maxPossibleScore ?? 0;

    const percent = maxTotalScore > 0
      ? Math.round((totalScore / maxTotalScore) * 100)
      : (progress.total
        ? Math.round((progress.answered / progress.total) * 100)
        : pct);

    // Sicherstellen, dass wir ALLE UiQuestion-Metas haben
    return (
      <AssessmentResults
        topicName={topicName}
        onRestart={restart}
        onBackToTopics={goBackToTopics}
        onComplete={finalizeSession}
        onChangeAnswer={changeAnswerFromResults}
        questionsById={questionsById}
        answerValues={answers}

        answered={progress.answered}
        total={progress.total}
        totalScore={totalScore}
        maxTotalScore={maxTotalScore}

        percent={percent}
        // Noch nicht „serverseitig completed“, eher vorläufige Auswertung
        overallLevel="Vorläufige Auswertung"
        completedAt={new Date().toISOString()}
        summary={summary}
      />
    );
  }
  console.log("Aktuelle Frage:", q);
  const isCurrentRequiredUnanswered = (() => {
    if (!q) return false;

    // nur blockieren, wenn required = true
    if (!q.isRequired) return false;

    const val = answers[q.id];
    return isUiValueEmpty(q, val);
  })();

  function isUiValueEmpty(q: UiQuestion, val: any): boolean {
    switch (q.type) {
      case "radio":
      case "select":
      case "text":
      case "textarea":
      case "date":
        return val === undefined || val === null || val === "";

      case "checkbox":
      case "order":
        return !Array.isArray(val) || val.length === 0;

      case "slider":
      case "number":
        return (
          val === undefined ||
          val === null ||
          val === "" ||
          Number.isNaN(Number(val))
        );

      default:
        return val === undefined || val === null || val === "";
    }
  }


  /* -------- Render -------- */
  return (
    <div className=" relative min-h-screen overflow-hidden
      bg-[radial-gradient(circle_at_top,_#f9fafb_0%,_#e5e7eb_40%,_#f9fafb_100%)]">

      {/* Deko-Layer im Hintergrund */}
      <div className="pointer-events-none absolute inset-0 ">
        {/* Dunkelblauer Blob oben links */}
        <div
          className="
          absolute -top-40 -left-24 h-72 w-72
          rounded-full blur-3xl
          bg-[hsla(215,60%,25%,0.22)]
        "
        />

        {/* Goldener Glow rechts */}
        <div
          className="
          absolute top-1/3 -right-32 h-80 w-80
          rounded-full blur-3xl
          bg-[hsla(45,70%,60%,0.25)]
        "
        />

        {/* Halbtransparentes “Kärtchen” unten – leicht animiert */}
        <div
          className="
          absolute -bottom-40 left-1/4
          h-64 w-64 rounded-[32px]
          border border-white/50
          bg-[hsla(0,0%,100%,0.35)]
          backdrop-blur-xl
          rotate-[-8deg]
          shadow-[0_24px_60px_rgba(15,23,42,0.18)]
          animate-[spin_40s_linear_infinite]
        "
        />

        {/* Zweites, kleineres Rechteck */}
        <div
          className="
          absolute -bottom-24 right-1/5
          h-40 w-40 rounded-[28px]
          border border-white/40
          bg-[hsla(215,40%,30%,0.25)]
          backdrop-blur-md
          rotate-[12deg]
          shadow-[0_20px_50px_rgba(15,23,42,0.22)]
          animate-[spin_55s_linear_infinite_reverse]
        "
        />

        {/* Zweites, kleineres Rechteck */}
        <div
          className="
          absolute -bottom-24 right-1/5
          h-40 w-40 rounded-[28px]
          border border-white/40
          bg-[hsla(215,40%,30%,0.25)]
          backdrop-blur-md
          rotate-[12deg]
          shadow-[0_20px_50px_rgba(15,23,42,0.22)]
          animate-[spin_55s_linear_infinite_reverse]
        "
        />

        {/* ===== Quadrat-Stack links wie im Lovable-Hero ===== */}
        <div
          className="
          absolute
          left-[6%] top-[22%]
          h-56 w-56
          sm:h-64 sm:w-64
          lg:h-72 lg:w-72
        "
        >
          {/* äußerer Rahmen – #d2c9b9 */}
          <div
            className="
            absolute inset-0
            rounded-[32px]
            border border-[rgba(210,201,185,0.7)]
            bg-transparent
            rotate-[-4deg]
            animate-[spin_55s_linear_infinite_reverse]
          "
          />

          {/* mittleres Quadrat */}
          <div
            className="
            absolute inset-3
            rounded-[28px]
            border border-[rgba(210,201,185,0.45)]
            bg-[rgba(18,27,38,0.18)]
            rotate-[8deg]
            animate-[spin_40s_linear_infinite]
          "
          />

          {/* inneres, weiches Quadrat */}
          <div
            className="
            absolute inset-8
            rounded-[26px]
            border border-[rgba(210,201,185,0.35)]
            bg-[radial-gradient(circle_at_top,#d2c9b9_0%,transparent_65%)]
            opacity-75
          "
          />

          {/* kleiner goldener Punkt */}
          <div
            className="
            absolute
            left-1/2 top-[72%]
            h-3 w-3
            -translate-x-1/2
            rounded-full
            bg-[#E3BB62]
            shadow-[0_0_16px_rgba(227,187,98,0.9)]
            animate-[ping_8s_linear_infinite]
          "
          />
        </div>

        {/* ein paar kleine „Sternchen“-Punkte */}
        <div
          className="
          absolute left-[18%] top-[50%]
          h-2 w-2 rounded-full
          bg-[#E3BB62]
          opacity-80
          animate-[ping_10s_linear_infinite]
        "
        />
        <div
          className="
          absolute left-[12%] top-[36%]
          h-1.5 w-1.5 rounded-full
          bg-[#d2c9b9]
          opacity-70
          animate-[ping_12s_linear_infinite]
        "
        />
        <div
          className="
          absolute right-[26%] top-[58%]
          h-1.5 w-1.5 rounded-full
          bg-[#E3BB62]
          opacity-65
          animate-[ping_14s_linear_infinite]
        "
        />
        <div
          className="
    absolute left-[25%] top-[30%]
    h-1.5 w-1.5 rounded-full
    bg-[#E3BB62]
    opacity-70
    animate-[ping_9s_linear_infinite]
  "
        />

        <div
          className="
    absolute right-[12%] top-[40%]
    h-2 w-2 rounded-full
    bg-[#d2c9b9]
    opacity-75
    animate-[ping_11s_linear_infinite]
  "
        />

        <div
          className="
    absolute right-[8%] top-[65%]
    h-1 w-1 rounded-full
    bg-[#E3BB62]
    opacity-60
    animate-[ping_13s_linear_infinite]
  "
        />

        {/* zusätzliche Shapes NUR für große Screens  */}
        {/* Extra-Blob oben rechts – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute -top-32 right-1/4
          h-52 w-52 rounded-full blur-3xl
          bg-[hsla(215,45%,35%,0.18)]
        "
        />

        {/* zusätzliche Shapes NUR für große Screens  */}

        {/* Extra-Blob oben rechts – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute -top-32 right-1/4
          h-52 w-52 rounded-full blur-3xl
          bg-[hsla(215,45%,35%,0.18)]
        "
        />

        {/* Goldene „Scheibe“ unten links – nur ab lg */}
        <div
          className="
          hidden lg:block
          absolute bottom-10 left-10
          h-28 w-28 rounded-full blur-2xl
          bg-[hsla(45,75%,62%,0.28)]
        "
        />

        {/* Schwebende Card links unten – nur ab xl */}
        <div
          className="
          hidden xl:block
          absolute bottom-40 left-[18%]
          h-32 w-52
          rounded-[24px]
          border border-white/50
          bg-[#d2c9b9]
          backdrop-blur-xl
          shadow-[0_18px_45px_rgba(15,23,42,0.16)]
          rotate-[-4deg]
          animate-[spin_70s_linear_infinite]
        "
        />

        {/* Schmale, vertikale goldene Leiste rechts – nur ab xl */}
        <div
          className="
          hidden xl:block
          absolute top-24 right-[14%]
          h-40 w-16
          rounded-[999px]
          bg-[linear-gradient(180deg,#E3BB62_0%,rgba(227,187,98,0)_100%)]
          opacity-70
          blur-[1px]
        "
        />
      </div>
      <div
        className="
    relative z-[1]
    flex flex-col items-center
    pt-16 pb-16 px-5
  "
      >
        {/* Logo-Badge – groß & sichtbar */}
        <div
          className="
      relative
      -mb-10
      inline-flex items-center justify-center
      h-24 sm:h-28 md:h-32          /* etwas höher = mehr Platz fürs GIF */
      w-[210px] sm:w-[240px] md:w-[270px]
      rounded-[32px]
      bg-white/98
      border border-[#e4e4e7]
      shadow-[0_26px_70px_rgba(15,23,42,0.30)]
      overflow-hidden
    "
        >
          <img
            src={aa}
            alt="ICA³ – Integrated Customer Assessments &amp; Advanced Analytics"
            className="
        max-h-full w-auto            /* GANZES GIF sichtbar */
        object-contain
      "
          />
        </div>

        {/* weißer Haupt-Container */}
        <div
          className="
      w-full max-w-[980px]
      rounded-3xl
      bg-gradient-to-b from-white to-[#f5f5f7]
      border border-white/80
      shadow-[0_24px_80px_rgba(15,23,42,0.16)]
      overflow-hidden
    "
        >

          {/* Header */}
          <div className=" p-6
    bg-white/95
    backdrop-blur-sm
    border-b border-[#e4e4e7]
    shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">{headerTitle}</div>
                {headerSubtitle && <div className="text-sm text-[#666] mt-1">{headerSubtitle}</div>}
              </div>

              <button
                type="button"
                onClick={goBackToTopics}
                className=" group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
  bg-white text-slate-800 border border-[#ddd]
  shadow-sm
  transition-all duration-150 ease-out transform
  hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1f2a37]
  hover:-translate-y-[1px] hover:shadow-md
  active:translate-y-[0px] active:shadow-sm"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11l9-7 9 7" />
                  <path d="M9 22V12h6v10" />
                </svg>
                Zur Übersicht
              </button>
            </div>
          </div>

          {/* Progress */}
          {!completed && (
            <div className="px-6 py-4 bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[18px] font-semibold text-[#1a1a1a]">Assessment läuft</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#0f172a] bg-[#f8fafc] px-3.5 py-1.5 rounded-full border border-gray-200">
                    {`Frage ${Math.max(1, step)}${progress.total ? ` von ${progress.total}` : ""}`}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-[#ebebec] rounded-[10px] overflow-hidden mb-2">
                <div
                  className="h-full transition-[width] duration-300 ease-out rounded-[10px]
               bg-[linear-gradient(90deg,#E3BB62_0%,#d2c9b9_100%)]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-sm text-[#666]">{pct}% abgeschlossen</div>
            </div>
          )}

          {/* Inhalt !completed*/}
          {q && (
            <>
              <div className=" px-6 pt-6 pb-6
    bg-white/98
    shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
                <div className="text-[18px] font-semibold text-[#1a1a1a] mb-6 leading-relaxed">{q.text}</div>

                {/* Eingabetypen */}
                {q.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options.map((opt: string) => {
                      const checked = answers[q.id] === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                          ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"                         // ausgewählt: Gold-Rahmen + hellgoldener Hintergrund
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]" // Hover: Navy-Rand
                            }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"  // Kreis in CAP-Navy
                            checked={checked}
                            onChange={() => setAnswer(q.id, opt, "radio")}
                          />

                          <span className="text-[15px] text-[#333]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "checkbox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options.map((opt: string) => {
                      const list: string[] = answers[q.id] || [];
                      const checked = list.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                          ${checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
                            checked={checked}
                            onChange={() => setAnswer(q.id, opt, "checkbox")}
                          />
                          <span className="text-[15px] text-[#333]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "slider" && (
                  <div className="py-5">
                    <input
                      type="range"
                      min={(q as any).min}
                      max={(q as any).max}
                      value={answers[q.id] ?? Math.floor((((q as any).min ?? 0) + ((q as any).max ?? 10)) / 2)}
                      onChange={(e) => setAnswer(q.id, Number(e.target.value), "slider")}
                      className=" w-full h-2 rounded bg-[#ebebec] outline-none
    [accent-color:#56768f]
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#56768f]
    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-[#56768f] [&::-moz-range-thumb]:border-0"
                    />
                    <div className="text-center text-[18px] font-semibold text-[#56768f] mt-2">
                      {answers[q.id] ?? Math.floor((((q as any).min ?? 0) + ((q as any).max ?? 10)) / 2)}
                    </div>
                    {(q as any).labels && (
                      <div className="flex justify-between mt-2 text-sm text-[#666]">
                        <span>{(q as any).labels[0]}</span>
                        <span>{(q as any).labels[1]}</span>
                      </div>
                    )}
                  </div>
                )}

                {q.type === "textarea" && (
                  <textarea
                    className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg text-[15px] resize-y outline-none focus:border-blue-500"
                    placeholder={(q as any).placeholder || ""}
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value, "textarea")}
                  />
                )}

                {q.type === "text" && (
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    placeholder={(q as any).placeholder || ""}
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value, "text")}
                  />
                )}

                {q.type === "select" && (
                  <select
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500 bg-white"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value, "select")}
                  >
                    <option value="" disabled>Bitte auswählen …</option>
                    {q.options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {q.type === "number" && (
                  <input
                    type="number"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    min={(q as any).min}
                    max={(q as any).max}
                    step={(q as any).step ?? 1}
                    placeholder={(q as any).placeholder || ""}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setAnswer(q.id, raw === "" ? "" : Number(raw), "number");
                    }}
                  />
                )}

                {q.type === "date" && (
                  <input
                    type="date"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    min={(q as any).min}
                    max={(q as any).max}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value, "date")}
                  />
                )}

                {q.type === "order" && (
                  <OrderQuestion
                    q={q}
                    value={answers[q.id] ?? []}
                    onChange={(arr) => setAnswer(q.id, arr, "order")}
                  />
                )}


                {/* Navigation */}
                <div className="pb-6 pt-6 flex items-center justify-between gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#666] border border-[#ddd] hover:bg-[#f5f5f5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={prev}
                    disabled={!sessionId || !q || !canGoBack}   // nur deaktivieren, wenn wir gar nichts haben
                  >
                    ← Zurück
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
    bg-[#E3BB62] text-[#264555]
    shadow-sm border border-transparent
    transition-all duration-150 ease-out transform
    hover:bg-[#d7a548] hover:border-[#d7a548]
    hover:-translate-y-[1px] hover:shadow-md
    active:translate-y-[0px] active:shadow-sm
    disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={next}
                    disabled={!sessionId || !q || isCurrentRequiredUnanswered}
                  >
                    {status === "completed" || (progress.total && progress.answered + 1 >= progress.total && pos >= trail.length - 1)
                      ? "Abschließen ✓"
                      : "Weiter →"}
                  </button>

                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>

  );

}
function OrderItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        flex items-center gap-4 p-4 rounded-xl border shadow-sm
        bg-gradient-to-br from-[#ece9df] to-[#f5f3eb]
      "
    >
      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400"
      >
        <GripVertical size={22} />
      </div>

      {/* Label */}
      <span className="text-gray-800 text-sm font-medium">{label}</span>
    </div>
  );
}
function OrderQuestion({
  q,
  value,
  onChange,
}: {
  q: UiQuestion;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  // options sicher rausziehen
  const base = q.type === "order"
    ? ((q as any).options as string[] || [])
    : [];

  const initial = value && value.length ? value : base;

  const [items, setItems] = useState<string[]>(initial);

  useEffect(() => {
    onChange(items);
  }, [items]);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((x) => x === active.id);
        const newIndex = items.findIndex((x) => x === over.id);

        setItems(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 mt-3">
          {items.map((opt) => (
            <OrderItem key={opt} id={opt} label={opt} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}


