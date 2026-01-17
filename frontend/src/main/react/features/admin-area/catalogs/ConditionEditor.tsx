import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/shared/contexts/ToastContext";
import PageHeader from "./PageHeader";
import ConfirmModal from "@/shared/components/ConfirmModal";

// Icons
import AdminLayout from "@/apps/app/AdminLayout";
import "@/styles/admin.css";
import {
  ArrowLeft,
  Layers,
  Plus,
  X,
  MessageSquare,
  List,
  BarChart3,
  Calendar,
  Hash,
  CheckSquare,
  CircleDot,
  Trash2,
  ListOrdered,
  Edit3,
  GripVertical,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  Target,
  CheckCircle2,
  RefreshCcw,
  PlusCircle,
} from "lucide-react";

import {
  getRootQuestionsByThema,
  getChildrenByParent,
  getThemaById,
  deleteQuestion,
  createQuestion,
  createQuestionNode,
  getQuestionTypes,
  updateQuestion,
  updateQuestionNodeRequired,
  moveRootNode,
  moveChildNode,
  createQuestionCondition,getQuestionConditions,deleteAllQuestionConditions,deleteQuestionCondition
} from "@/api/questionApi";

// 🧩 Drag & Drop Imports
import { DndContext, closestCorners } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";

type ConditionItem = {
  operator: string;
  expectedValue: string;
  targetNodeId?: string;
  targetLabel?: string;
  persisted?: boolean;
};


const OPERATOR_BY_TYPE: Record<string, string[]> = {
  radio: ["==", "!="],
  select: ["==", "!="],
  number: ["==", "<", ">"],
  range: ["==", "<", ">"],
  date: ["==", "<", ">"],
};

export default function ConditionEditor() {
  const navigate = useNavigate();
  const { id: themaId } = useParams();
  const [thema, setThema] = useState<any>(null);

  // 🔍 Such-State
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchThemaDetails() {
      try {
        const data = await getThemaById(themaId!);
        setThema(data);
        console.log("📘 Thema geladen:", data);
      } catch (error) {
        console.error("❌ Fehler beim Laden des Themas:", error);
      }
    }

    if (themaId) fetchThemaDetails();
  }, [themaId]);

  // ✅ Holt die ID aus der URL
  useEffect(() => {
    console.log("🟢 Thema-ID aus URL:", themaId);
  }, [themaId]);

  // 🧩 States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [options, setOptions] = useState<
    { label: string; score: number | null }[]
  >([]);

  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionSourceQuestion, setConditionSourceQuestion] =
    useState<any>(null);

  // 🔀 Target-Pick-Mode
  const [isPickingTarget, setIsPickingTarget] = useState(false);
  const [pendingConditionIndex, setPendingConditionIndex] = useState<
    number | null
  >(null);

  // 🔀 Conditions (V1 simpel)
  const [conditions, setConditions] = useState<
    {
      operator: string;
      expectedValue: string;
      targetNodeId?: string;
      targetLabel?: string;
      persisted?: boolean; 
    }[]
  >([]);

  const allowedOperators = useMemo(() => {
    if (!conditionSourceQuestion) return [];
    return OPERATOR_BY_TYPE[conditionSourceQuestion.type] ?? [];
  }, [conditionSourceQuestion]);

  const usedOperators = useMemo(
    () => conditions.map((c) => c.operator).filter(Boolean),
    [conditions]
  );

  const [questions, setQuestions] = useState<any[]>([]);
  const [parentQuestion, setParentQuestion] = useState<any | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [questionTypes, setQuestionTypes] = useState<any[]>([]);

  // 👇 Scroll-Referenz für den Antwortmöglichkeiten-Block
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  // 🔀 Ref für aktuell bearbeitete (Source-)Frage

  // ❌ Fehlerzustände für Validierungen

  const [errorQuestionText, setErrorQuestionText] = useState<string | null>(
    null
  );
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorOptions, setErrorOptions] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [isRequired, setIsRequired] = useState(true); // Standard: true (Pflichtfrage)
  const [isScorable, setIsScorable] = useState(true); // Standard: true (bewertbar)

  // 👁️ Preview-State für Fragen-Simulation
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [previewAnswer, setPreviewAnswer] = useState<any>(null);

  const isOrderType = selectedType?.value === "order";
  const { showSuccess, showError } = useToast();
  const [isDeleteAllConditionsOpen, setIsDeleteAllConditionsOpen] = useState(false);


const [isDeleteConditionOpen, setIsDeleteConditionOpen] = useState(false);
const [conditionToDelete, setConditionToDelete] = useState<ConditionItem | null>(null);
const [conditionToDeleteIndex, setConditionToDeleteIndex] = useState<number | null>(null);



  // 🔁 Rekursive Funktion, die ALLE Kinder bis zur tiefsten Ebene lädt
  async function fetchChildrenRecursive(parentId: string): Promise<any[]> {
    try {
      const children = await getChildrenByParent(parentId);

      // Wenn keine Unterfragen -> gib leeres Array zurück
      if (!children || children.length === 0) return [];

      // Wenn es Kinder gibt -> lade auch deren Unterfragen rekursiv
      const enriched = await Promise.all(
        children.map(async (child: any) => {
          const rawOptions = child.question?.options;
          const rawScoring = child.question?.scoringSchema;

          let parsedOptions = [];
          let parsedScoring = {};

          try {
            parsedOptions =
              typeof rawOptions === "string"
                ? JSON.parse(rawOptions)
                : rawOptions || [];
          } catch {
            parsedOptions = [];
          }

          try {
            parsedScoring =
              typeof rawScoring === "string"
                ? JSON.parse(rawScoring)
                : rawScoring || {};
          } catch {
            parsedScoring = {};
          }

          return {
            id: child.id,
            questionId: child.question?.id,
            text: child.question?.text || "Ohne Text",
            type: child.question?.questionType?.inputType || "unknown",

            // ✅ Scores + Options immer zusammenführen
            options: normalizeOptions({
              options: parsedOptions,
              scoringSchema: parsedScoring,
            }),

            scoringSchema: parsedScoring,

            required: child.isRequired ?? true,
            isScorable: child.question?.isScorable ?? true, // ✅ isScorable Feld aus Backend
            expanded: false,
            children: await fetchChildrenRecursive(child.id),
          };
        })
      );

      return enriched;
    } catch (err) {
      console.error(`Fehler beim Laden der Unterfragen von ${parentId}:`, err);
      return [];
    }
  }

  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;

      // Scrollposition speichern
      document.body.dataset.scrollY = scrollY.toString();

      // Scroll blockieren OHNE Sprung
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.dataset.scrollY;

      // Styles zurücksetzen
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      // Scroll exakt wiederherstellen
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
        delete document.body.dataset.scrollY;
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // 🔹 frage Requiredn
  useEffect(() => {
    if (editingQuestion) {
      // Wenn required explizit gesetzt ist (true oder false), verwende diesen Wert
      // Ansonsten Standard: true
      const requiredValue =
        editingQuestion.required !== undefined &&
        editingQuestion.required !== null
          ? editingQuestion.required
          : true;
      setIsRequired(requiredValue);

      // isScorable aus editingQuestion laden (default: true)
      const scorableValue =
        editingQuestion.isScorable !== undefined &&
        editingQuestion.isScorable !== null
          ? editingQuestion.isScorable
          : true;
      setIsScorable(scorableValue);
    } else {
      // Beim Erstellen einer neuen Frage: Standard auf true setzen
      setIsRequired(true);
      setIsScorable(true);
    }
  }, [editingQuestion]);

  // 🔹 Wenn Fragetyp gewechselt wird → automatisch 2 leere Antwortoptionen erzeugen (wenn hasOptions = true)
  useEffect(() => {
    if (!selectedType) return;

    if (selectedType.hasOptions) {
      // 👇 Wenn schon Optionen vorhanden → nichts tun
      if (options.length === 0) {
        // Versuche, alte Optionen wiederherzustellen
        const saved = sessionStorage.getItem("lastOptions");
        if (saved) {
          setOptions(JSON.parse(saved));
          sessionStorage.removeItem("lastOptions");
        } else {
          // Wenn nichts gespeichert → Standardfelder setzen
          setOptions([
            { label: "", score: null },
            { label: "", score: null },
          ]);
        }
      }
    } else {
      // 👇 Nur speichern, wenn aktuell Optionen existieren
      if (options.length > 0) {
        sessionStorage.setItem("lastOptions", JSON.stringify(options));
        setOptions([]);
      }
    }
  }, [selectedType]);

  // 👇 Wenn wieder zu einem Typ mit Optionen gewechselt wird → alte Werte zurückholen
  useEffect(() => {
    if (selectedType?.hasOptions && options.length === 0) {
      const saved = sessionStorage.getItem("lastOptions");
      if (saved) {
        setOptions(JSON.parse(saved));
        sessionStorage.removeItem("lastOptions"); // 🧹 einmalig verwenden
      }
    }
  }, [selectedType]);

  // 🔹 Fragetypen aus der API laden (wie in CatalogList)
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getQuestionTypes();

        const mapped = types.map((t: any) => {
          let icon;
          switch (t.inputType) {
            case "text":
              icon = <MessageSquare size={18} />;
              break;
            case "radio":
              icon = <CircleDot size={18} />;
              break;
            case "select":
              icon = <List size={18} />;
              break;
            case "checkbox":
              icon = <CheckSquare size={18} />;
              break;
            case "number":
              icon = <Hash size={18} />;
              break;
            case "date":
              icon = <Calendar size={18} />;
              break;
            case "range":
              icon = <BarChart3 size={18} />;
              break;
            case "order":
              icon = <ListOrdered size={18} />;
              break;
            default:
              icon = <MessageSquare size={18} />;
          }

          let label;
          switch (t.inputType) {
            case "text":
              label = "Textfeld";
              break;
            case "radio":
              label = "Einzelauswahl";
              break;
            case "select":
              label = "Auswahl";
              break;
            case "checkbox":
              label = "Mehrfach";
              break;
            case "number":
              label = "Zahl Eingabe";
              break;
            case "date":
              label = "Datum";
              break;
            case "range":
              label = "Skala";
              break;
            case "order":
              label = "Reihenfolge";
              break;
            default:
              label = t.name;
          }

          return {
            id: t.id,
            label,
            value: t.inputType,
            hasOptions: t.hasOptions,
            icon,
          };
        });

        setQuestionTypes(mapped);
        console.log("✅ Fragetypen geladen:", mapped);
      } catch (err) {
        console.error("❌ Fehler beim Laden der Fragetypen:", err);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    async function fetchAllQuestions() {
      try {
        // 1️⃣ Root-Fragen laden
        const roots = await getRootQuestionsByThema(themaId!);
        console.log("📥 Root-Fragen:", roots);

        // 2️⃣ Für jede Root-Frage alle Kinder (rekursiv) laden
        const fullHierarchy = await Promise.all(
          roots.map(async (root: any) => {
            // 🧩 Prüfen, ob options/scoringSchema Strings sind:
            const rawOptions = root.question?.options;
            const rawScoring = root.question?.scoringSchema;

            let parsedOptions = [];
            let parsedScoring = {};

            try {
              parsedOptions =
                typeof rawOptions === "string"
                  ? JSON.parse(rawOptions)
                  : rawOptions || [];
            } catch {
              parsedOptions = [];
            }

            try {
              parsedScoring =
                typeof rawScoring === "string"
                  ? JSON.parse(rawScoring)
                  : rawScoring || {};
            } catch {
              parsedScoring = {};
            }

            return {
              id: root.id,
              questionId: root.question?.id,
              text: root.question?.text || "Ohne Text",
              type: root.question?.questionType?.inputType || "unknown",
              options: normalizeOptions({
                options: parsedOptions,
                scoringSchema: parsedScoring,
              }),
              required: root.isRequired ?? true, // ✅ isRequired Feld aus Backend
              isScorable: root.question?.isScorable ?? true, // ✅ isScorable Feld aus Backend
              expanded: false,
              children: await fetchChildrenRecursive(root.id),
            };
          })
        );

        // 3️⃣ In State speichern
        setQuestions(fullHierarchy);
      } catch (error) {
        console.error("❌ Fehler beim Laden aller Fragen:", error);
      }
    }

    if (themaId) fetchAllQuestions();
  }, [themaId]);

  const handleAddQuestion = () => {
    setParentQuestion(null);
    setIsRequired(true); // Standard: true beim Öffnen für neue Frage
    setIsScorable(true); // Standard: true beim Öffnen für neue Frage
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setParentQuestion(null);
    setEditingQuestion(null);
    setIsRequired(true); // Standard: true zurücksetzen
    setIsScorable(true); // Standard: true zurücksetzen

    // ❗❗ FIX: Fehlerstatus komplett zurücksetzen
    setHasSubmitted(false);
    setErrorQuestionText(null);
    setErrorType(null);
    setErrorOptions(null);

    setIsModalOpen(false);
  };

  // 🔁 Rekursiv Unterfrage einfügen
  const addChildToParent = (
    list: any[],
    parentId: string,
    child: any
  ): any[] => {
    return list.map((q) => {
      if (q.id === parentId) {
        return {
          ...q,
          expanded: true,
          children: [...(q.children || []), child],
        };
      }
      if (q.children?.length) {
        return {
          ...q,
          children: addChildToParent(q.children, parentId, child),
        };
      }
      return q;
    });
  };

  // 🗑️ Öffnet das Lösch-Modal
  const handleDeleteQuestion = (q: any) => {
    setQuestionToDelete(q);
    setIsDeleteModalOpen(true);
  };

  // ✅ Bestätigt das Löschen
  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      setIsDeleting(true);

      // ✅ Richtige Question-ID bestimmen
      const questionId = questionToDelete.questionId
        ? questionToDelete.questionId
        : questionToDelete.question?.id;

      console.log("📌 Lösche Frage mit ID:", questionId);

      if (!questionId) {
        throw new Error("Keine gültige Question-ID gefunden!");
      }

      // ✅ Backend-Aufruf
      await deleteQuestion(questionId);

      // ✅ Entferne gelöschte Frage aus der UI
      const removeRecursive = (list: any[]): any[] =>
        list
          .filter((q) => q.id !== questionToDelete.id)
          .map((q) => ({
            ...q,
            children: q.children ? removeRecursive(q.children) : [],
          }));

      setQuestions((prev) => removeRecursive(prev));
      showSuccess("Frage erfolgreich gelöscht!");

      console.log("✅ Frage erfolgreich gelöscht:", questionId);
    } catch (error) {
      showError("Fehler beim Löschen der Frage!");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleCreateQuestion = async () => {
    setHasSubmitted(true);
    let hasError = false;

    // 🔸 Frage prüfen
    if (!questionText.trim()) {
      setErrorQuestionText("Bitte Fragetext ausfüllen.");
      hasError = true;
    } else setErrorQuestionText(null);

    // 🔸 Typ prüfen
    if (!selectedType) {
      setErrorType("Bitte Fragetyp auswählen.");
      hasError = true;
    } else setErrorType(null);

    // 🔸 Antwortoptionen prüfen
    const hasOptions = selectedType?.hasOptions;
    if (hasOptions) {
      const missingLabel = options.some((o) => !o.label.trim());
      const missingScore =
        !isOrderType &&
        options.some((o) => o.score === null || isNaN(Number(o.score)));

      if (options.length < 2) {
        setErrorOptions("Mindestens zwei Antwortmöglichkeiten erforderlich.");
        hasError = true;
      } else if (missingLabel && missingScore) {
        setErrorOptions("Bitte alle Antworttexte und Scores ausfüllen.");
        hasError = true;
      } else if (missingLabel) {
        setErrorOptions("Bitte alle Antworttexte ausfüllen.");
        hasError = true;
      } else if (missingScore) {
        setErrorOptions("Bitte alle Scores ausfüllen.");
        hasError = true;
      } else {
        setErrorOptions(null);
      }
    } else setErrorOptions(null);

    if (hasError && modalRef.current) {
      let scrollPosition = 0;

      // 🔹 Falls Fragetext-Fehler → ganz oben scrollen
      if (errorQuestionText) {
        scrollPosition = 0;
      }
      // 🔹 Falls Fragetyp-Fehler → leicht nach unten (z. B. 200px)
      else if (errorType) {
        scrollPosition = 200;
      }
      // 🔹 Falls Antwortoptionen Fehler → weiter unten (z. B. 600px)
      else if (errorOptions) {
        scrollPosition = 600;
      }

      modalRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });

      return; // 🚫 Speichern abbrechen
    }

    // ✅ Da selectedType jetzt ein Objekt ist:
    const payload = {
      text: questionText,
      questionType: { id: selectedType.id },
      options: hasOptions ? options.map((o) => o.label) : null,
      scoringSchema:
        hasOptions && !isOrderType
          ? Object.fromEntries(options.map((o) => [o.label, Number(o.score)]))
          : null,
      isScorable: hasOptions ? true : isScorable, // Nur für Textfelder relevant
    };

    try {
      const question = await createQuestion(payload);
      const node = await createQuestionNode(
        themaId!,
        question.id,
        parentQuestion ? parentQuestion.id : null,
        isRequired // Verwende den isRequired State
      );

      const newQuestion = {
        id: node.id,
        questionId: question.id,
        text: question.text,
        type: selectedType.value,
        options: options, // 🔥 WICHTIG!
        scoringSchema: Object.fromEntries(
          options.map((o) => [o.label, o.score])
        ),
        required: isRequired, // ✅ isRequired Feld hinzufügen
        isScorable: hasOptions ? true : isScorable, // ✅ isScorable Feld hinzufügen
        children: [],
        expanded: false,
      };

      if (parentQuestion) {
        const updated = addChildToParent(
          questions,
          parentQuestion.id,
          newQuestion
        );
        setQuestions(updated);
      } else {
        setQuestions([...questions, newQuestion]);
      }

      // 🧹 Felder zurücksetzen
      setIsModalOpen(false);
      setQuestionText("");
      setSelectedType("");
      setOptions([]);
      setParentQuestion(null);
      setIsRequired(true); // Standard: true zurücksetzen
      setIsScorable(true); // Standard: true zurücksetzen

      showSuccess("Frage erfolgreich hinzugefügt!");
    } catch (error) {
      showError("Fehler beim Hinzufügen der Frage!");
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    setHasSubmitted(true);
    let hasError = false;

    // 🔸 Fragetext prüfen
    if (!questionText.trim()) {
      setErrorQuestionText("Bitte Fragetext ausfüllen.");
      hasError = true;
    } else {
      setErrorQuestionText(null);
    }

    // 🔸 Typ prüfen
    if (!selectedType) {
      setErrorType("Bitte Fragetyp auswählen.");
      hasError = true;
    } else {
      setErrorType(null);
    }

    // 🔸 Antwortoptionen prüfen (wenn Typ Optionen hat)
    const hasOptions = selectedType?.hasOptions;
    if (hasOptions) {
      const missingLabel = options.some((o) => !o.label.trim());
      const missingScore =
        !isOrderType &&
        options.some((o) => o.score === null || isNaN(Number(o.score)));

      if (options.length < 2) {
        setErrorOptions("Mindestens zwei Antwortmöglichkeiten erforderlich.");
        hasError = true;
      } else if (missingLabel && missingScore) {
        setErrorOptions("Bitte alle Antworttexte und Scores ausfüllen.");
        hasError = true;
      } else if (missingLabel) {
        setErrorOptions("Bitte alle Antworttexte ausfüllen.");
        hasError = true;
      } else if (missingScore) {
        setErrorOptions("Bitte alle Scores ausfüllen.");
        hasError = true;
      } else {
        setErrorOptions(null);
      }
    } else {
      setErrorOptions(null);
    }

    if (hasError && modalRef.current) {
      let scrollPosition = 0;

      // 🔹 Falls Fragetext-Fehler → ganz oben scrollen
      if (errorQuestionText) {
        scrollPosition = 0;
      }
      // 🔹 Falls Fragetyp-Fehler → leicht nach unten (z. B. 200px)
      else if (errorType) {
        scrollPosition = 200;
      }
      // 🔹 Falls Antwortoptionen Fehler → weiter unten (z. B. 600px)
      else if (errorOptions) {
        scrollPosition = 600;
      }

      modalRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });

      return; // 🚫 Speichern abbrechen
    }

    // ❌ Abbrechen, wenn Fehler existieren

    // ✅ Wenn alles korrekt, dann Update starten
    try {
      const payload = {
        text: questionText,
        questionType: { id: selectedType?.id },
        options: hasOptions ? options.map((o) => o.label) : null,
        scoringSchema:
          hasOptions && !isOrderType
            ? Object.fromEntries(options.map((o) => [o.label, Number(o.score)]))
            : null,
        isScorable: hasOptions ? true : isScorable, // Nur für Textfelder relevant
      };

      await updateQuestion(editingQuestion.questionId, payload);

      // 🔹 isRequired Status aktualisieren (wenn sich geändert hat)
      if (editingQuestion.required !== isRequired) {
        await updateQuestionNodeRequired(editingQuestion.id, isRequired);
      }

      // 🧱 UI aktualisieren (auch scoringSchema und required)
      const updateQuestionInTree = (list: any[]): any[] =>
        list.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                text: questionText,
                type: selectedType?.value || q.type,
                options: hasOptions ? options : [],
                scoringSchema: hasOptions
                  ? Object.fromEntries(options.map((o) => [o.label, o.score]))
                  : {},
                required: isRequired, // ✅ isRequired auch in UI aktualisieren
                isScorable: hasOptions ? true : isScorable, // ✅ isScorable auch in UI aktualisieren
              }
            : {
                ...q,
                children: q.children ? updateQuestionInTree(q.children) : [],
              }
        );

      setQuestions((prev) => updateQuestionInTree(prev));

      // 🧹 Felder & Fehler zurücksetzen
      handleCancel();
      showSuccess("Frage erfolgreich aktualisiert!");
    } catch (err) {
      console.error("❌ Fehler beim Bearbeiten der Frage:", err);
      showError("Fehler beim Aktualisieren der Frage!");
    }
  };

  function closeAllRootLists(questions: any[]) {
    return questions.map((q) => ({ ...q, expanded: false }));
  }

  function closeChildrenOfParent(list: any[], parentId: string): any[] {
    return list.map((q: any) => {
      // Wenn dies der Parent ist → Kinder einklappen
      if (q.id === parentId && q.children?.length > 0) {
        return {
          ...q,
          children: q.children.map((child: any) => ({
            ...child,
            expanded: false,
          })),
        };
      }

      // Rekursiv weitersuchen
      if (q.children?.length > 0) {
        return {
          ...q,
          children: closeChildrenOfParent(q.children, parentId),
        };
      }

      return q;
    });
  }

  // 🔁 Ein- & Ausklappen von Fragen (vollständig rekursiv)
  const toggleExpand = async (id: string) => {
    const updated = await Promise.all(
      questions.map(async (q) => {
        if (q.id === id) {
          // Wenn noch keine Kinder geladen sind → lade sie rekursiv
          if (!q.expanded && q.children.length === 0) {
            const children = await fetchChildrenRecursive(id);
            return { ...q, expanded: true, children };
          } else {
            // Wenn Kinder schon da sind → nur ein-/ausklappen
            return { ...q, expanded: !q.expanded };
          }
        }

        // 🔁 Falls Unterfragen vorhanden → rekursiv weitersuchen
        if (q.children?.length) {
          return {
            ...q,
            children: await Promise.all(
              q.children.map(async (child: any) =>
                child.id === id
                  ? !child.expanded
                    ? {
                        ...child,
                        expanded: true,
                        children: await fetchChildrenRecursive(child.id),
                      }
                    : { ...child, expanded: false }
                  : await toggleExpandInChild(child, id)
              )
            ),
          };
        }

        return q;
      })
    );

    setQuestions(updated);
  };

  function normalizeOptions(q: any) {
    // Beispiel: ["Ja","Nein"]
    if (Array.isArray(q.options) && typeof q.options[0] === "string") {
      return q.options.map((label: string) => ({
        label,
        score: q.scoringSchema?.[label] ?? null,
      }));
    }

    // Beispiel: { A: 1, B: 2 }
    if (!Array.isArray(q.options) && typeof q.scoringSchema === "object") {
      return Object.entries(q.scoringSchema).map(([label, score]) => ({
        label,
        score,
      }));
    }

    // Beispiel: []
    if (Array.isArray(q.options)) return q.options;

    return [];
  }

  // 🔁 Hilfsfunktion für rekursives Ein-/Ausklappen in Unterfragen
  async function toggleExpandInChild(node: any, id: string): Promise<any> {
    if (node.id === id) {
      if (!node.expanded && node.children.length === 0) {
        const children = await fetchChildrenRecursive(id);
        return { ...node, expanded: true, children };
      } else {
        return { ...node, expanded: !node.expanded };
      }
    }

    if (node.children?.length) {
      return {
        ...node,
        children: await Promise.all(
          node.children.map((child: any) => toggleExpandInChild(child, id))
        ),
      };
    }

    return node;
  }

  // 🔍 Filter-Logik: Rekursiv durch alle Fragen suchen
  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;

    const term = searchTerm.toLowerCase();

    // Rekursive Hilfsfunktion: Sucht in der Frage und ihren Kindern
    function filterRecursive(list: any[]): any[] {
      return list
        .map((q) => {
          const matches = q.text.toLowerCase().includes(term);
          const filteredChildren = q.children
            ? filterRecursive(q.children)
            : [];

          // Frage behalten, wenn sie selbst matched ODER wenn Kinder matchen
          if (matches || filteredChildren.length > 0) {
            return {
              ...q,
              children: filteredChildren,
              expanded: filteredChildren.length > 0, // Auto-expand wenn Kinder matchen
            };
          }

          return null;
        })
        .filter((q) => q !== null);
    }

    return filterRecursive(questions);
  }, [questions, searchTerm]);

  const flatQuestions = useMemo(() => {
    const result: any[] = [];

    const walk = (list: any[]) => {
      list.forEach((q) => {
        result.push(q);
        if (q.children?.length) walk(q.children);
      });
    };

    walk(filteredQuestions);
    return result;
  }, [filteredQuestions]);

  // 🔢 Rekursiv alle Fragen zählen (inkl. Unterfragen)
  const totalQuestionCount = useMemo(() => {
    function countRecursive(list: any[]): number {
      return list.reduce((count, q) => {
        return count + 1 + (q.children ? countRecursive(q.children) : 0);
      }, 0);
    }
    return countRecursive(filteredQuestions);
  }, [filteredQuestions]);

  // �🔹 Fragetypen
  const showOptions = selectedType?.hasOptions === true;

  // -----------------------------
  // 1️⃣ useSortable + Auto-Close
  // -----------------------------
  function SortableQuestion({ q, level = 0 }: { q: any; level?: number }) {
  

    const conditionTypes = ["radio", "select", "number", "range", "date"];
    const canHaveCondition = conditionTypes.includes(q.type);

    const isBlockedByConditionPick = useMemo(() => {
      if (!isPickingTarget || !conditionSourceQuestion) return false;

      const sourceIndex = flatQuestions.findIndex(
        (x) => x.id === conditionSourceQuestion.id
      );
      const currentIndex = flatQuestions.findIndex((x) => x.id === q.id);

      if (sourceIndex === -1 || currentIndex === -1) return false;

      // 🔥 NUR oberhalb der Linie blocken
      return currentIndex < sourceIndex;
    }, [isPickingTarget, conditionSourceQuestion, flatQuestions, q.id]);

    const parentId = q.parentId || "root";

    const { attributes, listeners, setNodeRef, transform } = useSortable({
      id: q.id,
      data: { parent: parentId, node: q },
    });

    const isThisDragging = draggingId === q.id;

    const style = {
      transform: CSS.Transform.toString(transform),
      marginLeft: level > 0 ? 25 : 0,
    };

    const childContainerStyle = {
      maxHeight: q.expanded && !isThisDragging ? "900px" : "0px",
      opacity: q.expanded && !isThisDragging ? 1 : 0,
      overflow: "hidden",
    };

    const handleGripDown = (e: any) => {
      const isFirstChild = level === 1;
      const isSecondChild = level === 2;

      console.log("====== GRIP CLICK =======");
      console.log("TEXT:", q.text);
      console.log("LEVEL:", level);
      console.log("expanded:", q.expanded);
      console.log("parentId:", parentId);

      if (isFirstChild) {
        console.log("👉 FIRST CHILD GRIP (LEVEL 1)");
      }

      if (isSecondChild) {
        console.log("👉 SECOND CHILD GRIP (LEVEL 2)");
      }

      console.log("=========================");

      // WICHTIG → Drag aktivieren
      listeners?.onPointerDown?.(e);
    };

    return (
      <div ref={setNodeRef} style={style} className="mt-3">
        {/* Karten-Header */}

        <div
          className={
            "group relative flex items-center justify-between rounded-xl px-4 py-3 border transition-colors duration-300 " +
            "border-[#e5dcc7]"
          }
          onClick={() => {
            if (!isPickingTarget) return;

            // ❌ gleiche Frage nicht erlaubt
            if (q.id === conditionSourceQuestion?.id) return;

            // ✅ Ziel setzen
            setConditions((prev) =>
              prev.map((c, i) =>
                i === pendingConditionIndex
                  ? { ...c, targetNodeId: q.id, targetLabel: q.text }
                  : c
              )
            );

            setIsPickingTarget(false);
            setPendingConditionIndex(null);
            setIsConditionModalOpen(true);
          }}
          style={{
            pointerEvents: isBlockedByConditionPick ? "none" : "auto",
            background: "linear-gradient(135deg, #fffdf7ff 0%, #fdf9efff 100%)",
            border: "1px solid #ddc691ff",
            boxShadow: "0 3px 10px rgba(0,0,0,0.03)",
          }}
        >
          {/* ✅ HIER */}
          {isThisDragging && (
            <div
              className="
      absolute inset-0
      rounded-xl
      z-10
      pointer-events-none
      drag-active-highlight
    "
            />
          )}

          {/* Goldener Hover-Glow */}
          <div
            className="
    absolute inset-0 rounded-xl
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  "
            style={{
              background: `
      radial-gradient(circle at top left, rgba(227,187,98,0.35), transparent 45%),
      radial-gradient(circle at top right, rgba(227,187,98,0.25), transparent 45%)
    `,
            }}
          />

          {/* 🔀 Condition Button – SEPARAT */}
          {canHaveCondition && (
            <button
              disabled={isPickingTarget}
             onClick={async (e) => {
  if (isPickingTarget) return;
  e.stopPropagation();

  setConditionSourceQuestion(q);

  try {
    const existing = await getQuestionConditions(q.questionId);

    if (Array.isArray(existing) && existing.length > 0) {
    setConditions(
  existing.map((c: any) => {
    const target = flatQuestions.find(
      (q) => q.id === c.targetNodeId
    );

    return {
      operator: c.operator,
      expectedValue: c.expectedValue,
      targetNodeId: c.targetNodeId,
      targetLabel: target?.text ?? "Unbekannte Frage",
      persisted: true, // ✅ WICHTIG
    };
  })
);

    } else {
      // ✅ KEINE CONDITIONS → LEER STARTEN
      setConditions([
        {
          operator: "",
          expectedValue: "",
          targetNodeId: undefined,
          targetLabel: "",
        },
      ]);
    }
  } catch {
    // ✅ 404 / 204 → KEINE CONDITIONS
    setConditions([
      {
        operator: "",
        expectedValue: "",
        targetNodeId: undefined,
        targetLabel: "",
      },
    ]);
  }

  setIsConditionModalOpen(true);
}}

              className={`
    absolute right-[210px] top-5 z-30
    h-9 w-9
    rounded-full
    flex items-center justify-center
    border border-[#e5dcc7]
    backdrop-blur
    text-[#264555]
    shadow-[0_8px_20px_rgba(0,0,0,0.12)]
    transition-all duration-200

    ${
      isPickingTarget
        ? "opacity-0 pointer-events-none"
        : "bg-white/80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-[#fff4d6]"
    }
  `}
              title="Bedingungen / Folgefragen"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div
            className="
    pointer-events-none
    absolute inset-0 rounded-xl
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  "
            style={{
              background: `
      radial-gradient(circle at top left, rgba(227,187,98,0.35), transparent 45%),
      radial-gradient(circle at top right, rgba(227,187,98,0.25), transparent 45%)
    `,
            }}
          />

          <div
            className="relative z-30 flex items-start gap-3 transition-all"
            style={{
              filter: isBlockedByConditionPick ? "blur(4px)" : "none",
              opacity: isBlockedByConditionPick ? 0.7 : 1,
            }}
          >
            {/* Grip */}
            <GripVertical
              size={20}
              className={`
    mt-1 transition-all duration-150
    ${
      isPickingTarget
        ? "text-gray-300 cursor-not-allowed pointer-events-none"
        : draggingId === q.id
        ? "text-green-500 scale-110 cursor-grab"
        : "text-gray-400 cursor-grab"
    }
  `}
              {...(!isPickingTarget ? attributes : {})}
              onPointerDown={isPickingTarget ? undefined : handleGripDown}
            />

            {/* Pfeil */}
            {q.children?.length > 0 ? (
              q.expanded ? (
                <ChevronDown
                  size={18}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 DAS ist der Fix
                    toggleExpand(q.id);
                  }}
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥
                    toggleExpand(q.id);
                  }}
                />
              )
            ) : (
              <div className="w-[18px]" />
            )}

            {/* Frage */}
            <div className="relative z-20 flex flex-col mt-0">
              <p className="font-semibold">{q.text}</p>

              <div className="relative z-20 flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 mt-0">
                  {/* Typ */}
                  <span
                    className="
      inline-flex items-center gap-1
      px-2.5 py-0.5
      text-xs font-medium
      rounded-full
      border
      transition-all
      bg-[#eef2ff] text-[#264555] border-[#d6ddff]
      group-hover:bg-[#e6edff]
      group-hover:border-[#c7d2fe]
    "
                  >
                    {questionTypes.find((t) => t.value === q.type)?.label}
                  </span>

                  {/* Pflicht / Optional */}
                  {q.required ? (
                    <span
                      className="
        inline-flex items-center gap-1
        px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        border
        transition-all
        bg-[#fff4d6] text-[#8b5d00] border-[#e8d8a8]
        group-hover:bg-[#ffedc2]
        group-hover:border-[#ddc691]
      "
                    >
                      Pflicht
                    </span>
                  ) : (
                    <span
                      className="
        inline-flex items-center gap-1
        px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        border
        transition-all
        bg-[#f0f0f0] text-[#555] border-[#d9d9d9]
        group-hover:bg-[#e6e6e6]
      "
                    >
                      Optional
                    </span>
                  )}

                  {/* Max Score */}
                  {/* Bewertung */}
                  {q.isScorable === false ? (
                    <span
                      className="
      inline-flex items-center gap-1
      px-2.5 py-0.5
      text-xs font-medium
      rounded-full
      border
      transition-all
      bg-[#f1f3f5] text-[#6c757d] border-[#dee2e6]
      group-hover:bg-[#e9ecef]
      group-hover:border-[#ced4da]
    "
                    >
                      Nicht bewertet
                    </span>
                  ) : (
                    <span
                      className="
      inline-flex items-center gap-1
      px-2.5 py-0.5
      text-xs font-medium
      rounded-full
      border
      transition-all
      bg-[#e6f4ea] text-[#0f5132] border-[#b7dfc2]
      group-hover:bg-[#d1e7dd]
      group-hover:border-[#a3cfbb]
    "
                    >
                      Max Score:{" "}
                      {(() => {
                        if (q.options && q.options.length > 0) {
                          const sum = q.options
                            .map((o: any) => Number(o.score))
                            .filter((n: number) => !isNaN(n))
                            .reduce((a: number, b: number) => a + b, 0);

                          return sum > 0 ? sum : 6;
                        }
                        return 6;
                      })()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rechts – Buttons nur bei Hover sichtbar */}
          {/* Rechts – Actions (Design passend zu Sand/Navy) */}
          <div
            className="
    flex items-center gap-2
    rounded-full
    px-2 py-1
    border border-[#e5dcc7]
    bg-white/70 backdrop-blur-md
    shadow-[0_10px_24px_rgba(0,0,0,0.10)]
    opacity-0 translate-x-2 pointer-events-none
    transition-all duration-200
    group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto
  "
          >
            {/* Preview */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewQuestion(q);
                setPreviewAnswer(null);
              }}
              className="
      h-9 w-9 rounded-full
      flex items-center justify-center
      border border-[#e5dcc7]
      bg-white/60 text-[#264555]
      transition-all
      hover:bg-[#f3ecff]
      hover:-translate-y-[1px]
      hover:shadow-[0_10px_20px_rgba(0,0,0,0.14)]
    "
            >
              <Eye size={18} />
            </button>

            {/* Add */}
            <button
              disabled={isPickingTarget}
              onClick={(e) => {
                e.stopPropagation();
                setParentQuestion(q);
                setIsRequired(true);
                setIsScorable(true);
                setIsModalOpen(true);
              }}
              className={`
    h-9 w-9 rounded-full
    flex items-center justify-center
    border border-[#e5dcc7]
    transition-all
    ${
      isPickingTarget
        ? "opacity-30 cursor-not-allowed"
        : "bg-white/60 text-[#264555] hover:bg-[#fff4d6] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
    }
  `}
            >
              <Plus size={18} />
            </button>

            {/* Edit */}
            <button
              disabled={isPickingTarget}
              onClick={(e) => {
                if (isPickingTarget) return;
                e.stopPropagation();
                setEditingQuestion(q);
                setParentQuestion(null);
                setQuestionText(q.text);
                setSelectedType(questionTypes.find((t) => t.value === q.type));
                setOptions(normalizeOptions(q));
                setIsModalOpen(true);
              }}
              className={`
    h-9 w-9 rounded-full
    flex items-center justify-center
    border border-[#e5dcc7]
    transition-all
    ${
      isPickingTarget
        ? "opacity-30 cursor-not-allowed"
        : "bg-white/60 text-[#264555] hover:bg-[#e6edff] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
    }
  `}
            >
              <Edit3 size={18} />
            </button>

            {/* Delete */}
            <button
              disabled={isPickingTarget}
              onClick={(e) => {
                if (isPickingTarget) return;
                e.stopPropagation();
                handleDeleteQuestion(q);
              }}
              className={`
    h-9 w-9 rounded-full
    flex items-center justify-center
    border border-[#e5dcc7]
    transition-all
    ${
      isPickingTarget
        ? "opacity-30 cursor-not-allowed"
        : "bg-white/60 hover:bg-[#ffecec] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
    }
  `}
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>

        {isPickingTarget && q.id === conditionSourceQuestion?.id && (
          <div className="my-6">
            {/* Trennlinie */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#E3BB62] to-transparent mb-4" />

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              {/* ZIEL AUSWÄHLEN */}
              <div
                className="
          flex items-center gap-3
          px-6 py-3
          rounded-full
          border
          bg-white/70 backdrop-blur-md
          shadow-[0_8px_24px_rgba(0,0,0,0.10)]
          cursor-default
        "
                style={{ borderColor: "#E3BB62" }}
              >
                <div
                  className="
            flex items-center justify-center
            w-8 h-8
            rounded-full
            bg-[#E3BB62]
            text-[#264555]
          "
                >
                  <ChevronDown size={18} />
                </div>

                <span className="text-sm font-semibold text-[#264555]">
                  Ziel-Frage auswählen
                </span>
              </div>

              {/* ABBRECHEN */}
              <button
                onClick={() => {
                  setIsPickingTarget(false);
                  setPendingConditionIndex(null);
                  setIsConditionModalOpen(true); // 🔥 ZURÜCK ZUM MODAL
                }}
                className="
          flex items-center gap-2
          px-5 py-3
          rounded-full
          border
          bg-white/60
          text-sm font-semibold
          text-gray-600
          hover:bg-white
          hover:text-gray-800
          transition
          shadow-sm
        "
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Kinder */}
        <div style={childContainerStyle}>
          {q.expanded && q.children?.length > 0 && (
            <div className="mt-2">
              <SortableContext
                id={q.id}
                items={q.children.map((c: any) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {q.children.map((child: any, index: number) => (
                  <SortableQuestion
                    key={child.id}
                    q={{
                      ...child,
                      parentId: q.id,
                      orderIndex: index, // ✅ HIER
                    }}
                    level={level + 1}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🔧 DragEnd Handler (Root + Child)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 🔥 HINZUGEFÜGT: Liste (Ebene) erkennen
    const fromList = active.data?.current?.sortable?.containerId;
    const toList = over.data?.current?.sortable?.containerId;

    // 🔥 HINZUGEFÜGT: Verschieben in andere Ebene blockieren
    if (fromList !== toList) {
      console.warn("⚠️ Verschieben in andere Parent-Ebene blockiert");
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // -----------------------------------------
    // 1. Helper: finde Node + parentId + index
    // -----------------------------------------
    const findNode = (
      list: any[],
      id: string,
      parentId: string | null = null
    ): { node: any; parentId: string | null; index: number } | null => {
      for (let i = 0; i < list.length; i++) {
        const q = list[i];
        if (q.id === id) return { node: q, parentId, index: i };

        if (q.children?.length) {
          const found = findNode(q.children, id, q.id);
          if (found) return found;
        }
      }
      return null;
    };

    const activeInfo = findNode(questions, activeId);
    const overInfo = findNode(questions, overId);

    if (!activeInfo || !overInfo) return;

    // -----------------------------------------
    // 2. UI bewegen
    // -----------------------------------------
    const reorder = (list: any[], activeId: string, overId: string): any[] => {
      const oldIndex = list.findIndex((x) => x.id === activeId);
      const newIndex = list.findIndex((x) => x.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(list, oldIndex, newIndex);
      }

      return list.map((q) =>
        q.children?.length
          ? { ...q, children: reorder(q.children, activeId, overId) }
          : q
      );
    };

    setQuestions((prev) => reorder(prev, activeId, overId));

    // -----------------------------------------
    // 3. Backend korrekt updaten
    // -----------------------------------------

    const newPosition = overInfo.index; // 0, 1, 2 ...

    try {
      // ROOT → ROOT
      if (!activeInfo.parentId && !overInfo.parentId) {
        await moveRootNode(activeId, newPosition);
        showSuccess("Frage erfolgreich verschoben!");

        return;
      }

      // CHILD → CHILD (gleiche Ebene)
      if (activeInfo.parentId === overInfo.parentId) {
        await moveChildNode(activeId, activeInfo.parentId!, newPosition);

        showSuccess("Unterfrage erfolgreich verschoben!");

        return;
      }
    } catch (err) {
      showError("Fehler beim Verschieben!");
    }
  };

  // 🔧 Verschieben (rekursiv)
  const moveQuestion = (
    list: any[],
    activeId: string,
    overId: string
  ): any[] => {
    const oldIndex = list.findIndex((item) => item.id === activeId);
    const newIndex = list.findIndex((item) => item.id === overId);

    if (oldIndex !== -1 && newIndex !== -1)
      return arrayMove(list, oldIndex, newIndex);

    return list.map((q) =>
      q.children?.length
        ? { ...q, children: moveQuestion(q.children, activeId, overId) }
        : q
    );
  };

  return (
    <AdminLayout>
      {/* Header */}

      {/* BACK BUTTON – oben links fixiert */}
      <div className="absolute left-10 top-10 z-20">
        <button
          onClick={() => navigate("/admin")}
          className="
      group flex items-center gap-2 
      bg-white/70 backdrop-blur-xl 
      border border-gray-300 
      px-5 py-2.5 rounded-xl 
      shadow-sm 
      hover:bg-white/90 
      transition-all
    "
        >
          <ArrowLeft
            size={20}
            className="text-[#264555] transition-all group-hover:-translate-x-1"
          />
          <span className="text-sm font-semibold text-[#264555]">
            Zurück zur Übersicht
          </span>
        </button>
      </div>

      <PageHeader
        title={thema?.name || "Lade Thema..."}
        subtitle="Bearbeiten · Fragen verwalten · Struktur aufbauen"
        icon={<Layers size={40} />}
        gradient="navy" // ⭐ Dein helles Sand-Design
        height="250px"
        center={true}
        showPattern={true}
      />

      {/* BODY - Grauer Hintergrund wie AdminDashboard */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/* Top-Bar: Neue Hauptfrage Button rechts */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-end">
          <button
            onClick={handleAddQuestion}
            type="button"
            aria-label="Neue Hauptfrage"
            className="
              inline-flex items-center gap-2
              rounded-full
              px-4 py-2
              text-sm font-semibold
              focus:outline-none
              transition
              hover:-translate-y-[1px]
            "
            style={{
              background: "hsl(40,60%,63%)",
              color: "hsl(200,32%,22%)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <Plus size={16} />
            <span>Neue Hauptfrage</span>
          </button>
        </div>
        {/* 🔍 SEARCH BOX */}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[18px] border px-4 py-3 md:px-5 md:py-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: "#d2c9b9",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#808080" }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Frage…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full h-10 md:h-11
                  rounded-[999px]
                  border
                  pl-10 pr-4
                  text-sm
                  outline-none
                  transition
                  bg-white
                "
                style={{
                  borderColor: "#d2c9b9",
                  color: "#264555",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = "#E3BB62";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = "#d2c9b9";
                }}
              />
            </div>

            {/* Zähler rechts – dezente Badge */}
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: "#264555",
                  color: "white",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "#E3BB62" }}
                />
                <span>
                  Zeige{" "}
                  <span className="font-semibold">{totalQuestionCount}</span>{" "}
                  Fragen
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Fragenliste mit DnD */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto pt-4 pb-10">
          <div style={{ position: "relative", overflow: "hidden" }}>
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={
                isPickingTarget
                  ? undefined
                  : ({ active }) => {
                      const parentId = active.data?.current?.parent;
                      const isRoot = parentId === "root";

                      setQuestions((prev) => {
                        if (isRoot) {
                          return closeAllRootLists(prev);
                        } else {
                          return closeChildrenOfParent(prev, parentId);
                        }
                      });

                      setDraggingId(String(active.id));
                    }
              }
              onDragEnd={
                isPickingTarget
                  ? undefined
                  : (event) => {
                      handleDragEnd(event);
                      setDraggingId(null);
                    }
              }
              modifiers={[restrictToParentElement]}
            >
              <SortableContext
                id="root"
                items={filteredQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredQuestions.map((q, index) => (
                  <SortableQuestion
                    key={q.id}
                    q={{
                      ...q,
                      parentId: "root",
                      orderIndex: index, // ✅ HIER
                    }}
                    level={0}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        {/* 🗑️ Lösch-Bestätigungs-Modal */}
        <ConfirmModal
          open={isDeleteModalOpen}
          title="Frage löschen?"
          description={
            <>
              Willst du die Frage{" "}
              <span className="font-semibold break-words overflow-wrap-anywhere">
                {questionToDelete?.text}
              </span>{" "}
              wirklich löschen?
            </>
          }
          hintTitle="Hinweis"
          hintText={
            <>
              Diese Aktion kann{" "}
              <span className="font-semibold text-red-700">
                nicht rückgängig gemacht
              </span>{" "}
              werden.
            </>
          }
          onConfirm={confirmDeleteQuestion}
          onCancel={() => setIsDeleteModalOpen(false)}
          confirmLabel={isDeleting ? "Lösche..." : "Löschen"}
          cancelLabel="Abbrechen"
          icon={<Trash2 className="text-red-500" />}
        />
        {/* 🧱 Modal: Neue Frage hinzufügen */}
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCancel();
            }}
          >
            <div
              className="w-full max-w-2xl px-4 sm:px-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Karten-Block mit Glow */}
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
                {/* Deko-Glows */}
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                  aria-hidden="true"
                />

                {/* Inhalt / Formular */}
                <div
                  className="relative px-6 pt-6 pb-5 max-h-[calc(100vh-150px)] overflow-y-auto"
                  ref={modalRef}
                >
                  {/* 🔹 Titelbereich */}
                  {editingQuestion ? (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                        Frage bearbeiten
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Felder mit <span className="text-red-500">*</span> sind
                        Pflichtfelder.
                      </p>
                    </>
                  ) : parentQuestion ? (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                        Neue Unterfrage hinzufügen
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        <span className="font-semibold text-slate-700">
                          Vaterfrage:
                        </span>{" "}
                        {parentQuestion.text}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                        Neue Hauptfrage hinzufügen
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Felder mit <span className="text-red-500">*</span> sind
                        Pflichtfelder.
                      </p>
                    </>
                  )}

                  {/* 🔸 Fragetext */}
                  <div>
                    <label
                      htmlFor="question-text"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Frage <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="question-text"
                      value={questionText}
                      onChange={(e) => {
                        setQuestionText(e.target.value);
                        if (errorQuestionText) setErrorQuestionText(null);
                      }}
                      placeholder="Frage eingeben..."
                      rows={3}
                      className={`
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                        resize-none
                        ${errorQuestionText ? "border-red-500" : ""}
                      `}
                    />
                    {errorQuestionText && (
                      <p className="text-red-500 text-xs mt-1">
                        {errorQuestionText}
                      </p>
                    )}
                  </div>

                  {/* 🔸 Fragetyp */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fragetyp <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {questionTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedType(type);
                            if (errorType) setErrorType(null);
                            setErrorOptions(null);
                            setHasSubmitted(false);
                            if (type.hasOptions) {
                              setTimeout(() => {
                                optionsRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 150);
                            }
                          }}
                          className={`flex items-center justify-start gap-3 border rounded-xl py-3 px-4 text-left font-medium text-sm transition-all duration-150 ${
                            selectedType?.id === type.id
                              ? "bg-[#E3BB62] border-[#E3BB62] text-[#264555] shadow-md"
                              : errorType
                              ? "border-red-500 text-slate-800 hover:bg-slate-50 bg-white"
                              : "border-slate-200 text-slate-800 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                    {errorType && (
                      <p className="text-red-500 text-xs mt-2">{errorType}</p>
                    )}
                  </div>

                  {/* 🔸 Pflichtfeld */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Antwort notwendig
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-700">
                          Diese Frage muss beantwortet werden
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRequired(!isRequired)}
                        className={`w-12 h-7 flex items-center rounded-full transition-all ${
                          isRequired ? "bg-[#E3BB62]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-all ${
                            isRequired ? "translate-x-6" : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>

                  {/* 🔸 Bewertbar */}
                  {selectedType && !selectedType.hasOptions && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bewertung
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm text-slate-700">
                            {isScorable
                              ? "Frage wird bewertet (manuelle Bewertung)"
                              : "Frage wird nicht bewertet"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsScorable(!isScorable)}
                          className={`w-12 h-7 flex items-center rounded-full transition-all ${
                            isScorable ? "bg-[#E3BB62]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 bg-white rounded-full shadow transform transition-all ${
                              isScorable ? "translate-x-6" : "translate-x-1"
                            }`}
                          ></span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🔸 Antwortoptionen */}
                  {showOptions && (
                    <div
                      ref={optionsRef}
                      className="border-t border-gray-200 pt-4 mt-4"
                    >
                      <h3 className="text-md font-semibold text-gray-800 mb-3">
                        Antwortmöglichkeiten
                      </h3>
                      {options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 mb-3 border border-gray-200 p-2 rounded-lg"
                        >
                          {/* Antworttext */}
                          <input
                            type="text"
                            placeholder="Antworttext..."
                            value={opt.label}
                            onChange={(e) => {
                              setOptions(
                                options.map((o, j) =>
                                  j === i ? { ...o, label: e.target.value } : o
                                )
                              );
                              if (errorOptions) setErrorOptions(null); // 🔥 hier hinzufügen
                            }}
                            className={`flex-1 border rounded-md px-2 py-1 focus:ring-1 focus:ring-brand-sand focus:outline-none ${
                              hasSubmitted && !opt.label.trim()
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />

                          {/* Score */}
                          {!isOrderType && (
                            <div className="relative w-24">
                              <input
                                type="text"
                                placeholder="Score"
                                className="w-full border rounded-md px-2 py-1 text-center pr-6"
                                value={opt.score ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;

                                  if (val === "") {
                                    setOptions(
                                      options.map((o, j) =>
                                        j === i ? { ...o, score: null } : o
                                      )
                                    );
                                    return;
                                  }

                                  // ⭐ 0–6 erlauben statt 0–5
                                  if (/^[0-6]$/.test(val)) {
                                    setOptions(
                                      options.map((o, j) =>
                                        j === i
                                          ? { ...o, score: Number(val) }
                                          : o
                                      )
                                    );
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "ArrowUp" ||
                                    e.key === "ArrowDown"
                                  ) {
                                    e.preventDefault();

                                    let current = opt.score;

                                    // ⭐ Start bei leerem Feld
                                    if (current == null)
                                      current = e.key === "ArrowUp" ? 0 : 6;
                                    else {
                                      // ⭐ Pfeile gehen bis 6 statt 5
                                      if (e.key === "ArrowUp")
                                        current = Math.min(6, current + 1);
                                      if (e.key === "ArrowDown")
                                        current = Math.max(0, current - 1);
                                    }

                                    setOptions(
                                      options.map((o, j) =>
                                        j === i ? { ...o, score: current } : o
                                      )
                                    );
                                  }
                                }}
                              />

                              {/* CUSTOM ARROW BUTTONS */}
                              <div
                                className="
                                      absolute right-1 top-1/2 -translate-y-1/2 
                                      flex flex-col 
                                      bg-gray-100 border border-gray-300 
                                      rounded-md overflow-hidden
                                    "
                                style={{ width: "24px", height: "32px" }}
                              >
                                <button
                                  type="button"
                                  className="flex-1 flex items-center justify-center hover:bg-gray-200"
                                  onClick={() => {
                                    let current = opt.score;

                                    // ⭐ Max = 6 statt 5
                                    current =
                                      current == null
                                        ? 0
                                        : Math.min(6, current + 1);

                                    setOptions(
                                      options.map((o, j) =>
                                        j === i ? { ...o, score: current } : o
                                      )
                                    );
                                  }}
                                >
                                  <ChevronUp
                                    size={14}
                                    className="text-gray-600"
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="flex-1 flex items-center justify-center hover:bg-gray-200"
                                  onClick={() => {
                                    let current = opt.score;

                                    // ⭐ Wenn leer → start = 6
                                    current =
                                      current == null
                                        ? 6
                                        : Math.max(0, current - 1);

                                    setOptions(
                                      options.map((o, j) =>
                                        j === i ? { ...o, score: current } : o
                                      )
                                    );
                                  }}
                                >
                                  <ChevronDown
                                    size={14}
                                    className="text-gray-600"
                                  />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Löschen */}
                          <button
                            onClick={() =>
                              setOptions(options.filter((_, j) => j !== i))
                            }
                            className="text-red-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      {errorOptions && (
                        <p className="text-red-500 text-xs mt-1">
                          {errorOptions}
                        </p>
                      )}
                      <button
                        onClick={() =>
                          setOptions([...options, { label: "", score: null }])
                        }
                        className="
    flex items-center gap-2
    mt-3
    text-sm font-semibold
    transition
    hover:underline
  "
                        style={{
                          color: "#b08d2a", // dunkles Gold → sehr gut lesbar
                        }}
                      >
                        <Plus size={16} className="text-[#b08d2a]" />
                        Neue Option hinzufügen
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* kleiner Abstand wie bei User-Modals */}
              <div className="h-3" />

              {/* Footer-Buttons – gleich wie Users (Abbrechen / Speichern) */}
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="
                    flex-1
                    h-12
                    text-sm font-medium
                    text-slate-800
                    bg-[#f3f3f3]
                    hover:bg-[#e5e5e5]
                    border border-slate-200
                    rounded-xl
                    transition
                  "
                >
                  Abbrechen
                </button>

                <button
                  type="button"
                  onClick={
                    editingQuestion
                      ? handleUpdateQuestion
                      : handleCreateQuestion
                  }
                  className="
                    flex-1
                    h-12
                    text-sm font-semibold
                    rounded-xl
                    bg-[#E3BB62]
                    text-[#264555]
                    hover:bg-[#d8ac55]
                    shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                    transition
                    hover:-translate-y-[1px]
                  "
                >
                  {editingQuestion ? "Speichern" : "Hinzufügen"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 👁️ Preview Modal - Zeigt wie die Frage im Assessment aussieht */}
        {previewQuestion && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-white to-[#f5f5f7] border border-white/80 shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 bg-white/95 backdrop-blur-sm border-b border-[#e4e4e7] rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-[#1a1a1a]">
                        Vorschau: So sieht die Frage aus
                      </h2>
                    </div>
                    <p className="text-sm text-[#666] mt-1">
                      Simulation der Frage im Assessment-Flow
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewQuestion(null);
                      setPreviewAnswer(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content - Question Preview */}
              <div className="p-6">
                {/* Frage-Text */}
                <div className="text-[18px] font-semibold text-[#1a1a1a] mb-6 leading-relaxed">
                  {previewQuestion.text}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="inline-block text-xs text-[#4a65b9] bg-[#e6edff] px-2 py-0.5 rounded-full">
                    {questionTypes.find((t) => t.value === previewQuestion.type)
                      ?.label || previewQuestion.type}
                  </span>
                  {previewQuestion.required ? (
                    <span className="inline-block text-xs text-[#8b5d00] bg-[#fff4d6] px-2 py-0.5 rounded-full">
                      Pflicht
                    </span>
                  ) : (
                    <span className="inline-block text-xs text-[#555] bg-[#eaeaea] px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  )}
                </div>

                {/* Radio */}
                {previewQuestion.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(previewQuestion.options || []).map((opt: any) => {
                      const optLabel =
                        typeof opt === "string" ? opt : opt.label;
                      const checked = previewAnswer === optLabel;
                      return (
                        <label
                          key={optLabel}
                          className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                          ${
                            checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="preview-radio"
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
                            checked={checked}
                            onChange={() => setPreviewAnswer(optLabel)}
                          />
                          <span className="text-[15px] text-[#333]">
                            {optLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Checkbox */}
                {previewQuestion.type === "checkbox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(previewQuestion.options || []).map((opt: any) => {
                      const optLabel =
                        typeof opt === "string" ? opt : opt.label;
                      const list: string[] = Array.isArray(previewAnswer)
                        ? previewAnswer
                        : [];
                      const checked = list.includes(optLabel);
                      return (
                        <label
                          key={optLabel}
                          className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                          ${
                            checked
                              ? "border-[#E3BB62] bg-[#FFFAEB]"
                              : "border-gray-200 hover:border-[#264555] hover:bg-[#f8fafc]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-3 w-[18px] h-[18px] cursor-pointer accent-[#56768f]"
                            checked={checked}
                            onChange={() => {
                              const next = [...list];
                              const idx = next.indexOf(optLabel);
                              if (idx >= 0) next.splice(idx, 1);
                              else next.push(optLabel);
                              setPreviewAnswer(next);
                            }}
                          />
                          <span className="text-[15px] text-[#333]">
                            {optLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Slider / Range (Skala) */}
                {(previewQuestion.type === "slider" ||
                  previewQuestion.type === "range") && (
                  <div className="py-5">
                    <input
                      type="range"
                      min={0}
                      max={6}
                      value={previewAnswer ?? 3}
                      onChange={(e) => setPreviewAnswer(Number(e.target.value))}
                      className="w-full h-2 rounded bg-[#ebebec] outline-none cursor-pointer
                        [accent-color:#56768f]
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#56768f] [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-[#56768f] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className="text-center text-[18px] font-semibold text-[#56768f] mt-2">
                      {previewAnswer ?? 3}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-[#666]">
                      <span>Niedrig</span>
                      <span>Hoch</span>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                {previewQuestion.type === "textarea" && (
                  <textarea
                    className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg text-[15px] resize-y outline-none focus:border-blue-500"
                    placeholder="Ihre Antwort hier eingeben..."
                    value={previewAnswer || ""}
                    onChange={(e) => setPreviewAnswer(e.target.value)}
                  />
                )}

                {/* Text */}
                {previewQuestion.type === "text" && (
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    placeholder="Ihre Antwort hier eingeben..."
                    value={previewAnswer || ""}
                    onChange={(e) => setPreviewAnswer(e.target.value)}
                  />
                )}

                {/* Select/Dropdown */}
                {previewQuestion.type === "select" && (
                  <select
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500 bg-white"
                    value={previewAnswer ?? ""}
                    onChange={(e) => setPreviewAnswer(e.target.value)}
                  >
                    <option value="" disabled>
                      Bitte auswählen …
                    </option>
                    {(previewQuestion.options || []).map((opt: any) => {
                      const optLabel =
                        typeof opt === "string" ? opt : opt.label;
                      return (
                        <option key={optLabel} value={optLabel}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Number */}
                {previewQuestion.type === "number" && (
                  <input
                    type="number"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    placeholder="Zahl eingeben..."
                    value={previewAnswer ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setPreviewAnswer(raw === "" ? "" : Number(raw));
                    }}
                  />
                )}

                {/* Date */}
                {previewQuestion.type === "date" && (
                  <input
                    type="date"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-500"
                    value={previewAnswer ?? ""}
                    onChange={(e) => setPreviewAnswer(e.target.value)}
                  />
                )}

                {/* Order (Sortierung) - Interaktiv mit Drag & Drop */}
                {previewQuestion.type === "order" && (
                  <PreviewOrderQuestion
                    options={(previewQuestion.options || []).map((opt: any) =>
                      typeof opt === "string" ? opt : opt.label
                    )}
                  />
                )}

                {/* Beispiel-Navigation (deaktiviert) */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#666] border border-[#ddd] opacity-50 cursor-not-allowed"
                    >
                      ← Zurück
                    </button>
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                        bg-[#E3BB62] text-[#264555] opacity-50 cursor-not-allowed"
                    >
                      Weiter →
                    </button>
                  </div>
                  <p className="text-center text-xs text-[#999] mt-3">
                    Dies ist nur eine Vorschau. Die Navigation ist deaktiviert.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t bg-white rounded-b-2xl">
                <button
                  onClick={() => {
                    setPreviewQuestion(null);
                    setPreviewAnswer(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Condition Modal  */}
        {isConditionModalOpen && conditionSourceQuestion && (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsConditionModalOpen(false);
              setIsPickingTarget(false);
              setPendingConditionIndex(null);
            }}
          >
            <div
              className="w-full max-w-3xl mx-4 flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
                {/* Deko-Glows */}
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                  aria-hidden="true"
                />

                {/* HEADER */}
                <div className="relative px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Bedingungen für diese Frage
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {conditionSourceQuestion.text}
                  </p>
                </div>

               {/* INFO-BADGES (wie auf der Frage-Karte) */}
<div className="px-6 py-3 flex flex-wrap items-center gap-2 bg-slate-50/50">
  {/* Fragetyp */}
  <span
    className="
      inline-flex items-center gap-1
      px-2.5 py-0.5
      text-xs font-medium
      rounded-full
      border
      bg-[#eef2ff]
      text-[#264555]
      border-[#d6ddff]
    "
  >
    {
      questionTypes.find(
        (t) => t.value === conditionSourceQuestion.type
      )?.label
    }
  </span>

  {/* Pflicht / Optional */}
  {conditionSourceQuestion.required ? (
    <span
      className="
        inline-flex items-center gap-1
        px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        border
        bg-[#fff4d6]
        text-[#8b5d00]
        border-[#e8d8a8]
      "
    >
      Pflicht
    </span>
  ) : (
    <span
      className="
        inline-flex items-center gap-1
        px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        border
        bg-[#f0f0f0]
        text-[#555]
        border-[#d9d9d9]
      "
    >
      Optional
    </span>
  )}
</div>


                {/* Modal von Innen */}
                <div className="relative px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
                  {conditions.map((c, index) => {
                    const remainingOperators = allowedOperators.filter(
                      (op) => op === c.operator || !usedOperators.includes(op)
                    );

                    return (
                      <div
                        key={index}
                        className="
                      rounded-xl
                      border
                      border-[#E3BB62]
                      bg-[#fffdf7]
                      px-4 py-4
                      space-y-3
                      shadow-sm
                    "
                      >
                        {/* OBERSTE ZEILE */}
                        <div className="grid grid-cols-[130px_1fr_250px_36px] gap-3 items-center">
                          {/* OPERATOR */}
                          <select
                            className="
    h-10
    rounded-lg
    border border-[#e6d8b5]
    px-3
    text-sm
    bg-white
    transition
    focus:outline-none
    focus:ring-1
    focus:ring-[#E3BB62]
    focus:border-[#E3BB62]
  "
                            value={c.operator}
                            onChange={(e) =>
                              setConditions((prev) =>
                                prev.map((x, i) =>
                                  i === index
                                    ? { ...x, operator: e.target.value }
                                    : x
                                )
                              )
                            }
                          >
                            <option value="" disabled hidden>
                              Operator
                            </option>

                            {remainingOperators.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>

                          {/* WERT */}
                 {/* WERT */}
{conditionSourceQuestion.type === "range" ? (
  /* SKALA 0–6 */
  <select
    className="
      h-10
      rounded-lg
      border border-[#e6d8b5]
      px-3
      text-sm
      bg-white
      transition
      focus:outline-none
      focus:ring-1
      focus:ring-[#E3BB62]
      focus:border-[#E3BB62]
    "
    value={c.expectedValue ?? ""}
    onChange={(e) =>
      setConditions((prev) =>
        prev.map((x, i) =>
          i === index ? { ...x, expectedValue: e.target.value } : x
        )
      )
    }
  >
    <option value="" disabled hidden>
      Wert auswählen
    </option>
    {[0, 1, 2, 3, 4, 5, 6].map((v) => (
      <option key={v} value={v}>
        {v}
      </option>
    ))}
  </select>

) : conditionSourceQuestion.type === "radio" ||
  conditionSourceQuestion.type === "select" ? (

  /* ✅ RADIO / SELECT → NUR ANTWORTOPTIONEN */
  <select
    className="
      h-10
      rounded-lg
      border border-[#e6d8b5]
      px-3
      text-sm
      bg-white
      transition
      focus:outline-none
      focus:ring-1
      focus:ring-[#E3BB62]
      focus:border-[#E3BB62]
    "
    value={c.expectedValue ?? ""}
    onChange={(e) =>
      setConditions((prev) =>
        prev.map((x, i) =>
          i === index ? { ...x, expectedValue: e.target.value } : x
        )
      )
    }
  >
    <option value="" disabled hidden>
      Antwort auswählen
    </option>

    {(conditionSourceQuestion.options || []).map((opt: any) => (
      <option key={opt.label} value={opt.label}>
        {opt.label}
      </option>
    ))}
  </select>

) : conditionSourceQuestion.type === "number" ? (

  /* 🔢 NUMBER → NUR ZAHLEN */
 <input
  type="number"
  inputMode="numeric"
  pattern="-?[0-9]*"
  className="
    h-10
    rounded-lg
    border border-[#e6d8b5]
    px-3
    text-sm
    bg-white
    transition
    focus:outline-none
    focus:ring-1
    focus:ring-[#E3BB62]
    focus:border-[#E3BB62]
  "
  placeholder="Zahl eingeben"
  value={c.expectedValue}
  onKeyDown={(e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
      "-",
    ];

    if (
      allowedKeys.includes(e.key) ||
      /^[0-9]$/.test(e.key)
    ) {
      return;
    }

    e.preventDefault(); // ❌ blockiert Buchstaben & Sonderzeichen
  }}
  onChange={(e) =>
    setConditions((prev) =>
      prev.map((x, i) =>
        i === index ? { ...x, expectedValue: e.target.value } : x
      )
    )
  }
/>


) : conditionSourceQuestion.type === "date" ? (

  /* 📅 DATE → DATUM */
  <input
    type="date"
    className="
      h-10
      rounded-lg
      border border-[#e6d8b5]
      px-3
      text-sm
      bg-white
      transition
      focus:outline-none
      focus:ring-1
      focus:ring-[#E3BB62]
      focus:border-[#E3BB62]
    "
    value={c.expectedValue}
    onChange={(e) =>
      setConditions((prev) =>
        prev.map((x, i) =>
          i === index ? { ...x, expectedValue: e.target.value } : x
        )
      )
    }
  />

) : (

  /* ✏️ ALLE ANDEREN TYPEN */
  <input
    className="
      h-10
      rounded-lg
      border border-[#e6d8b5]
      px-3
      text-sm
      bg-white
      transition
      focus:outline-none
      focus:ring-1
      focus:ring-[#E3BB62]
      focus:border-[#E3BB62]
    "
    placeholder="Wert eingeben"
    value={c.expectedValue}
    onChange={(e) =>
      setConditions((prev) =>
        prev.map((x, i) =>
          i === index ? { ...x, expectedValue: e.target.value } : x
        )
      )
    }
  />
)}



                          {/* ZIEL */}
                          {c.targetNodeId ? (
                            <div
                              className="
                            inline-flex items-center gap-2
                            h-10 px-3
                            rounded-lg
                            border
                            bg-[#eefaf1]
                            text-sm font-semibold
                            text-[#1f7a3f]
                            border-[#b7dfc2]
                          "
                            >
                              <CheckCircle2
                                size={18}
                                className="text-[#2e9f5e]"
                              />
                              Ziel gesetzt
                            </div>
                          ) : (
                            <button
                              className="
                            h-10
                            inline-flex items-center gap-2
                            px-3
                            rounded-lg
                            border
                            text-sm font-semibold
                            text-[#264555]
                            bg-white
                            hover:bg-[#fff4d6]
                            transition
                          "
                              onClick={() => {
                                setPendingConditionIndex(index);
                                setIsPickingTarget(true);
                                setIsConditionModalOpen(false);
                              }}
                            >
                              <Target size={18} className="text-[#b08d2a]" />
                              Ziel auswählen
                            </button>
                          )}

                          {/* DELETE */}
     <button
  type="button"
  title="Bedingung löschen"
onClick={() => {
  const c = conditions[index];

  // ✅ FALL 1: LEER → SOFORT LÖSCHEN (KEIN MODAL)
  if (!c.operator || !c.expectedValue) {
    setConditions((prev) => {
      const next = prev.filter((_, i) => i !== index);

      return next.length > 0
        ? next
        : [
            {
              operator: "",
              expectedValue: "",
              targetNodeId: undefined,
              targetLabel: "",
              persisted: false,
            },
          ];
    });
    return;
  }

  // ✅ FALL 2: AUSGEFÜLLT → CONFIRM MODAL
  setConditionToDelete(c);
  setConditionToDeleteIndex(index);
  setIsDeleteConditionOpen(true);
}}




  className="
    h-9 w-9
    flex items-center justify-center
    rounded-lg
    border
    border-[#f1c6c6]
    bg-white
    text-red-600
    transition-all
    hover:bg-[#ffecec]
    hover:shadow-[0_4px_10px_rgba(220,38,38,0.25)]
    hover:-translate-y-[1px]
    active:translate-y-0
  "
>
  <Trash2 size={18} />
</button>


                        </div>

                        {/* ZIEL-FRAGE – VOLLE BREITE */}
                        {c.targetNodeId && (
                          <div
                            className="
                          w-full
                          rounded-xl
                          border
                          bg-gradient-to-br from-[#fffdf7] to-[#fff8e8]
                          px-4 py-4
                          shadow-sm
                          flex flex-col gap-3
                        "
                            style={{ borderColor: "#eddcb8" }}
                          >
                            {/* HEADER */}
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold tracking-wide text-[#b08d2a]">
                                Ziel-Frage
                              </div>

                              {/* ZIEL ÄNDERN BUTTON */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPendingConditionIndex(index);
                                  setIsPickingTarget(true);
                                  setIsConditionModalOpen(false);
                                }}
                                className="
                              inline-flex items-center gap-2
                              text-xs font-semibold
                              text-[#264555]
                              px-3 py-1.5
                              rounded-full
                              border
                              bg-white
                              transition
                              hover:bg-[#fff4d6]
                              hover:-translate-y-[1px]
                            "
                                style={{ borderColor: "#e6d8b5" }}
                              >
                                <RefreshCcw
                                  size={14}
                                  className="text-[#b08d2a]"
                                />
                                Ziel ändern
                              </button>
                            </div>

                            {/* CONTENT */}
                            <div
                              className="
                            w-full
                            rounded-lg
                            bg-white
                            px-3 py-2.5
                            border
                            text-sm
                            text-[#264555]
                          "
                              style={{ borderColor: "#e6e0d2" }}
                            >
                              {c.targetLabel}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ADD CONDITION */}
 {conditions.length > 0 && (
  <div className="mt-4 flex items-center gap-3">
    {/* LINKE SEITE */}
    {conditions.length < allowedOperators.length ? (
      <button
        type="button"
        title="Neue Bedingung hinzufügen"
        onClick={() =>
          setConditions((prev) => [
            ...prev,
            {
              operator: "",
              expectedValue: "",
              targetNodeId: undefined,
              targetLabel: "",
            },
          ])
        }
        className="
          inline-flex items-center gap-2
          px-4 py-2
          rounded-full
          border
          bg-white
          text-sm font-semibold
          text-[#264555]
          transition-all
          hover:bg-[#fff4d6]
          hover:-translate-y-[1px]
          hover:shadow-[0_6px_14px_rgba(0,0,0,0.12)]
        "
        style={{ borderColor: "#e6d8b5" }}
      >
        <PlusCircle size={18} className="text-[#b08d2a]" />
        Neue Bedingung
      </button>
    ) : (
      /* ⬅️ PLATZHALTER, DAMIT RECHTS NICHT SPRINGT */
      <div />
    )}

    {/* 🔹 SPACER */}
    <div className="flex-1" />

    {/* RECHTE SEITE – IMMER GLEICH */}
   <button
  type="button"
  onClick={() => {
  setIsDeleteAllConditionsOpen(true);
}}

  className="
    inline-flex items-center gap-2
    px-4 py-2
    rounded-full
    border
    bg-white
    text-sm font-semibold
    text-red-700
    hover:bg-[#ffecec]
  "
>
  <Trash2 size={18} />
  Bedingungen entfernen
</button>

  </div>
)}


                </div>
              </div>

              {/* BUTTONS OUTSIDE THE CARD */}
              <div className="flex gap-3">
  {/* ABBRECHEN – LINKS */}
  <button
    type="button"
    className="
      flex-1
      h-12
      text-sm font-medium
      text-slate-800
      bg-[#f3f3f3]
      hover:bg-[#e5e5e5]
      border border-slate-200
      rounded-xl
      transition
    "
    onClick={() => {
      setIsConditionModalOpen(false);
      setIsPickingTarget(false);
      setPendingConditionIndex(null);
    }}
  >
    Abbrechen
  </button>

  <ConfirmModal
  open={isDeleteAllConditionsOpen}
  title="Alle Bedingungen löschen?"
  description={
    <>
      Willst du wirklich{" "}
      <span className="font-semibold text-red-700">
        alle Bedingungen
      </span>{" "}
      für diese Frage löschen?
    </>
  }
  hintTitle="Hinweis"
  hintText={
    <>
      Diese Aktion kann{" "}
      <span className="font-semibold text-red-700">
        nicht rückgängig gemacht
      </span>{" "}
      werden.
    </>
  }
  onConfirm={async () => {
    if (!conditionSourceQuestion) return;

    await deleteAllQuestionConditions(
      conditionSourceQuestion.questionId
    );

    // ✅ danach wieder leere Eingabe anzeigen
    setConditions([
      {
        operator: "",
        expectedValue: "",
        targetNodeId: undefined,
        targetLabel: "",
        persisted: false,
      },
    ]);

    setIsDeleteAllConditionsOpen(false);
  }}
  onCancel={() => setIsDeleteAllConditionsOpen(false)}
  confirmLabel="Alle löschen"
  cancelLabel="Abbrechen"
  icon={<Trash2 className="text-red-500" />}
/>


<ConfirmModal
  open={isDeleteConditionOpen}
  title="Bedingung löschen?"
  description={
    <>
      Willst du die Bedingung mit
      <span className="font-semibold"> Operator </span>
      <span className="font-mono bg-gray-100 px-1 rounded">
        {conditionToDelete?.operator}
      </span>
      <span className="font-semibold"> und Wert </span>
      <span className="font-mono bg-gray-100 px-1 rounded">
        {conditionToDelete?.expectedValue}
      </span>
      wirklich löschen?
    </>
  }
  hintTitle="Hinweis"
  hintText={
    <>
      Diese Aktion kann{" "}
      <span className="font-semibold text-red-700">
        nicht rückgängig gemacht
      </span>{" "}
      werden.
    </>
  }
  confirmLabel="Löschen"
  cancelLabel="Abbrechen"
  icon={<Trash2 className="text-red-500" />}
  onCancel={() => {
    setIsDeleteConditionOpen(false);
    setConditionToDelete(null);
    setConditionToDeleteIndex(null);
  }}
  onConfirm={async () => {
    if (
      !conditionSourceQuestion ||
      !conditionToDelete ||
      conditionToDeleteIndex === null
    )
      return;

    // 🔹 Backend nur wenn gespeichert
    if (conditionToDelete.persisted) {
      await deleteQuestionCondition(
        conditionSourceQuestion.questionId,
        conditionToDelete.operator as "==" | "!=" | "<" | ">"
      );
    }

    // 🔹 UI aktualisieren
    setConditions((prev) => {
      const next = prev.filter(
        (_, i) => i !== conditionToDeleteIndex
      );

      return next.length > 0
        ? next
        : [
            {
              operator: "",
              expectedValue: "",
              targetNodeId: undefined,
              targetLabel: "",
              persisted: false,
            },
          ];
    });

    setIsDeleteConditionOpen(false);
    setConditionToDelete(null);
    setConditionToDeleteIndex(null);
  }}
/>



  {/* SPEICHERN – RECHTS */}
  <button
    type="button"
    className="
      flex-1
      h-12
      text-sm font-semibold
      rounded-xl
      bg-[#E3BB62]
      text-[#264555]
      hover:bg-[#d8ac55]
      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
      transition
      hover:-translate-y-[1px]
    "
    onClick={async () => {
      try {
        const sourceQuestionId = conditionSourceQuestion.questionId;

        for (const c of conditions) {
          if (!c.operator || !c.expectedValue || !c.targetNodeId) continue;

          const payload = {
            targetNodeId: c.targetNodeId,
            operator: c.operator as "==" | "!=" | "<" | ">",
            expectedValue: String(c.expectedValue),
          };

          await createQuestionCondition(sourceQuestionId, payload);
        }

        setIsConditionModalOpen(false);
        setIsPickingTarget(false);
        setPendingConditionIndex(null);
      } catch (err) {
        alert("Fehler beim Speichern der Bedingungen");
      }
    }}
  >
    Speichern
  </button>
</div>

            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}

// 👁️ Hilfsfunktion für Preview Order Items (Drag & Drop)
function PreviewOrderItem({ id, label }: { id: string; label: string }) {
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
      className="flex items-center gap-4 p-4 rounded-xl border shadow-sm bg-gradient-to-br from-[#ece9df] to-[#f5f3eb] cursor-grab active:cursor-grabbing"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={22} />
      </div>
      <span className="text-gray-800 text-sm font-medium">{label}</span>
    </div>
  );
}

// 👁️ Preview Order Question - Vollständige Drag & Drop Komponente
function PreviewOrderQuestion({ options }: { options: string[] }) {
  const [items, setItems] = useState<string[]>(options);

  // Zurücksetzen wenn sich die Optionen ändern
  useEffect(() => {
    setItems(options);
  }, [options]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-[#666] mb-3">
        Elemente per Drag & Drop sortieren:
      </p>
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;

          const oldIndex = items.findIndex((x) => x === active.id);
          const newIndex = items.findIndex((x) => x === over.id);

          setItems(arrayMove(items, oldIndex, newIndex) as string[]);
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((opt) => (
              <PreviewOrderItem key={opt} id={opt} label={opt} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
