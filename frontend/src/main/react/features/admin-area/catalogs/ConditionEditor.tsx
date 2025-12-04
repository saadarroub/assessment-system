import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/shared/contexts/ToastContext";
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
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
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

  // ❌ Fehlerzustände für Validierungen

  const [errorQuestionText, setErrorQuestionText] = useState<string | null>(
    null
  );
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorOptions, setErrorOptions] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [isRequired, setIsRequired] = useState(true); // Standard: true (Pflichtfrage)

  // 👁️ Preview-State für Fragen-Simulation
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [previewAnswer, setPreviewAnswer] = useState<any>(null);

  const isOrderType = selectedType?.value === "order";
  const { showSuccess, showError } = useToast();

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
    } else {
      // Beim Erstellen einer neuen Frage: Standard auf true setzen
      setIsRequired(true);
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
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setParentQuestion(null);
    setEditingQuestion(null);
    setIsRequired(true); // Standard: true zurücksetzen

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
            "flex items-center justify-between rounded-xl shadow-sm px-4 py-3 border " +
            (isThisDragging ? "drag-active-highlight" : "border-gray-400")
          }
          style={
            isThisDragging
              ? {} // 👉 Beim Dragging kein Hintergrund → CSS gewinnt
              : {
                  background:
                    "linear-gradient(135deg, #e9e5ddff 30%, #efede4ff 100%)",
                }
          }
        >
          <div className="flex items-start gap-3">
            {/* Grip */}
            <GripVertical
              size={20}
              className={`cursor-grab mt-1 transition-all duration-150
                 ${
                   draggingId === q.id
                     ? "text-green-500 scale-110"
                     : "text-gray-400"
                 }
                `}
              {...attributes}
              onPointerDown={handleGripDown}
            />

            {/* Pfeil */}
            {q.children?.length > 0 ? (
              q.expanded ? (
                <ChevronDown
                  size={18}
                  className="cursor-pointer"
                  onClick={() => toggleExpand(q.id)}
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="cursor-pointer"
                  onClick={() => toggleExpand(q.id)}
                />
              )
            ) : (
              <div className="w-[18px]" />
            )}

            {/* Frage */}
            <div className="flex flex-col mt-1">
              <p className="font-semibold">{q.text}</p>

              <div className="flex items-center gap-2 mt-2">
                {/* Typ-Badge */}
                <span className="inline-block text-xs text-[#4a65b9] bg-[#e6edff] px-2 py-0.5 rounded-full">
                  {questionTypes.find((t) => t.value === q.type)?.label}
                </span>

                {/* Required-Badge */}
                {q.required ? (
                  <span className="inline-block text-xs text-[#8b5d00] bg-[#fff4d6] px-2 py-0.5 rounded-full">
                    Pflicht
                  </span>
                ) : (
                  <span className="inline-block text-xs text-[#555] bg-[#eaeaea] px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                )}

                {/* MAX SCORING BADGE */}
                <span className="inline-block text-xs text-[#0f5132] bg-[#d1e7dd] px-2 py-0.5 rounded-full">
                  Max Score:{" "}
                  {(() => {
                    // 1. wenn Optionen existieren → SUMME der Scores
                    if (q.options && q.options.length > 0) {
                      const sum = q.options
                        .map((o: any) => Number(o.score))
                        .filter((n: number) => !isNaN(n))
                        .reduce((a: number, b: number) => a + b, 0);

                      return sum > 0 ? sum : 6; // falls keine gültigen Scores → 6
                    }

                    // 2. andere Typen (manuelle) → Standard 6
                    return 6;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Rechts */}
          <div className="flex items-center gap-6">
            {/* Preview/Simulate */}
            <button
              onClick={() => {
                setPreviewQuestion(q);
                setPreviewAnswer(null);
              }}
              className="transition-all duration-200 hover:scale-125 hover:opacity-80"
              title="Vorschau: So sieht die Frage im Assessment aus"
            >
              <Eye size={20} className="text-purple-600" />
            </button>

            {/* Add */}
            <button
              onClick={() => {
                setParentQuestion(q);
                setIsRequired(true);
                setIsModalOpen(true);
              }}
              className="transition-all duration-200 hover:scale-125 hover:opacity-80"
            >
              <Plus size={20} className="text-green-600" />
            </button>

            {/* Edit */}
            <button
              onClick={() => {
                setEditingQuestion(q);
                setParentQuestion(null);
                setQuestionText(q.text);
                setSelectedType(questionTypes.find((t) => t.value === q.type));
                setOptions(normalizeOptions(q));
                setIsModalOpen(true);
              }}
              className="transition-all duration-200 hover:scale-125 hover:opacity-80"
            >
              <Edit3 size={20} className="text-blue-600" />
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDeleteQuestion(q)}
              className="transition-all duration-200 hover:scale-125 hover:opacity-80"
            >
              <Trash2 size={20} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Kinder */}
        <div style={childContainerStyle}>
          {q.expanded && q.children?.length > 0 && (
            <div className="mt-2">
              <SortableContext
                id={q.id}
                items={q.children.map((c: any) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {q.children.map((child: any) => (
                  <SortableQuestion
                    key={child.id}
                    q={{ ...child, parentId: q.id }}
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
      <div className="relative bg-gradient-to-br from-[#d2c9b9] via-[#e8e2d7] to-[#ffffff] px-10 py-10 shadow-sm border-b border-gray-300/40">
        {/* BACK BUTTON */}
        <div
          onClick={() => navigate("/admin")}
          className="
                  group w-fit flex items-center gap-3 cursor-pointer
                  bg-white/60 backdrop-blur-xl 
                  border border-gray-300/30 
                  px-5 py-2.5 rounded-xl 
                  shadow-[0_3px_10px_rgba(0,0,0,0.08)]
                  transition-all duration-300
                  hover:bg-white/80 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]
                  hover:-translate-y-0.5
                "
        >
          <ArrowLeft
            size={20}
            className="text-[#264555] transition-all group-hover:-translate-x-1"
          />
          <span className="text-sm font-semibold text-[#264555]">
            Zurück zur Übersicht
          </span>
        </div>

        {/* TITLE BLOCK */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-4">
            <div
              className="
          p-4 rounded-2xl shadow-md 
          bg-gradient-to-br from-[#264555] to-[#3f5568]
          text-white
        "
            >
              <Layers size={28} />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#264555] tracking-tight">
              {thema?.name || "Lade Thema..."}
            </h1>
          </div>

          <p className="text-gray-700 mt-3 text-[15px]">
            Bearbeiten · Fragen verwalten · Struktur aufbauen
          </p>
        </div>
      </div>
      {/* BODY - Grauer Hintergrund wie AdminDashboard */}
      <div className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] pb-10">
        {/* Hauptfrage hinzufügen */}
        <div className="px-8 pt-6 flex justify-end">
          <button
            onClick={handleAddQuestion}
            style={{
              background: "hsl(40,60%,63%)", // Gelb
              color: "hsl(200,32%,22%)", // dunkles Blau-Grau
              boxShadow: "0 1px 2px rgba(0,0,0,.05)",
            }}
            className="flex items-center gap-2 bg-brand-sand text-white font-medium px-4 py-2 rounded shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Plus size={16} />
            Neue Hauptfrage
          </button>
        </div>

        {/* 🔍 SEARCH BOX */}
        <div className="px-8 pt-4">
          <div className="mx-auto rounded-[12px] border bg-white/85 backdrop-blur-md shadow">
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  placeholder="Suche Frage..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 rounded-md border pl-10 pr-3 text-sm focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="px-4 py-2 rounded-md border bg-white text-gray-600">
                Zeige{" "}
                <span className="font-semibold">{totalQuestionCount}</span>{" "}
                Fragen
              </div>
            </div>
          </div>
        </div>

        {/* Fragenliste mit DnD */}
        <div className="px-10 pt-6 pb-10">
          <div style={{ position: "relative", overflow: "hidden" }}>
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={({ active }) => {
                const parentId = active.data?.current?.parent;
                const isRoot = parentId === "root";

                setQuestions((prev) => {
                  if (isRoot) {
                    // 👉 Root bewegt → alle Root-Listen schließen
                    return closeAllRootLists(prev);
                  } else {
                    // 👉 Kind bewegt → nur Kinder der Parent schließen
                    return closeChildrenOfParent(prev, parentId);
                  }
                });

                setDraggingId(String(active.id));
              }}
              onDragEnd={(event) => {
                handleDragEnd(event); // 👈 Reihenfolge speichern
                setDraggingId(null); // 👈 Sichtbarkeit fixen
              }}
              modifiers={[restrictToParentElement]}
            >
              <SortableContext
                id="root"
                items={filteredQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredQuestions.map((q) => (
                  <SortableQuestion
                    key={q.id} // ✅ korrekt
                    q={{
                      ...q,
                      parentId: "root",
                    }}
                    level={0}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* 🗑️ Lösch-Bestätigungs-Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
            <div className="bg-white rounded-xl shadow-lg w-[420px] p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Frage wirklich löschen?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Diese Aktion kann nicht rückgängig gemacht werden.
                <br />
                <span className="font-medium text-gray-900">
                  „{questionToDelete?.text}“
                </span>{" "}
                wird dauerhaft entfernt.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmDeleteQuestion}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all ${
                    isDeleting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting ? "Lösche..." : "Ja, löschen"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🧱 Modal: Neue Frage hinzufügen */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999]">
            <div className="bg-white rounded-xl shadow-lg w-[730px] max-h-[80vh] flex flex-col relative">
              <div className="p-8 overflow-y-auto flex-1" ref={modalRef}>
                {/* ❌ Schließen-Button */}
                <button
                  onClick={handleCancel}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>

                {/* 🔹 Titelbereich */}
                {editingQuestion ? (
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Frage bearbeiten
                  </h2>
                ) : parentQuestion ? (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mt-2">
                      Neue Unterfrage hinzufügen
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold text-gray-700">
                        Vaterfrage:
                      </span>{" "}
                      {parentQuestion.text}
                    </p>
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Neue Hauptfrage hinzufügen
                  </h2>
                )}

                {/* 🔸 Fragetext */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frage<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => {
                      setQuestionText(e.target.value);
                      if (errorQuestionText) setErrorQuestionText(null); // 🔥 Roter Rand verschwindet sofort
                    }}
                    placeholder="Frage eingeben..."
                    className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-sand focus:outline-none ${
                      errorQuestionText ? "border-red-500" : "border-gray-300"
                    }`}
                    rows={3}
                  ></textarea>
                  {errorQuestionText && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorQuestionText}
                    </p>
                  )}
                </div>

                {/* 🔸 Fragetyp */}
                <div className="mb-6 mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fragetyp<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {questionTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                         
                          setSelectedType(type);
                          if (errorType) setErrorType(null); // 🔥 Fehler zurücksetzen
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
                        className={`flex items-center justify-start gap-3 border rounded-lg py-3 px-4 text-left font-medium text-sm transition-all duration-150 ${
                          selectedType?.id === type.id
                            ? "bg-brand-sand border-brand-sand text-black shadow-md"
                            : errorType
                            ? "border-red-500 text-gray-800 hover:bg-gray-50"
                            : "border-gray-300 text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {errorType && (
                    <p className="text-red-500 text-xs mt-1">{errorType}</p>
                  )}
                </div>

                {/* 🔸 Pflichtfeld */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antwort notwendig
                  </label>

                  <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm text-black-500">
                        Muss beantwortet werden Diese Frage ?
                      </p>
                    </div>

                    {/* TOGGLE SWITCH */}
                    <button
                      type="button"
                      onClick={() => setIsRequired(!isRequired)}
                      className={`w-12 h-7 flex items-center rounded-full transition-all ${
                        isRequired ? "bg-[#d2c9b9]" : "bg-gray-300"
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
                          <input
                            type="number"
                            placeholder="Score"
                            min={-1}
                            max={6}
                            step={1}
                            value={
                              opt.score == null || Number.isNaN(opt.score)
                                ? ""
                                : opt.score
                            }
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              // ❗ Browser-Standard verhindern (1 bei ArrowUp)
                              // Wenn ein Pfeil gedrückt wird, ignorieren wir onInput komplett
                              if (
                                (e.nativeEvent as any).inputType?.includes(
                                  "arrow"
                                )
                              ) {
                                return;
                              }

                              let val = e.currentTarget.value;

                              // Wenn leer → nichts setzen
                              if (val === "") {
                                setOptions(
                                  options.map((o, j) =>
                                    j === i ? { ...o, score: null } : o
                                  )
                                );
                                return;
                              }

                              // Tastatureingabe (0–6)
                              if (/^[0-6]$/.test(val)) {
                                setOptions(
                                  options.map((o, j) =>
                                    j === i ? { ...o, score: Number(val) } : o
                                  )
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              const allowed = [
                                "0",
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "Backspace",
                                "Delete",
                                "Tab",
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                              ];

                              if (!allowed.includes(e.key)) {
                                e.preventDefault();
                              }

                              // ---- Pfeile steuern ----
                              if (
                                e.key === "ArrowUp" ||
                                e.key === "ArrowDown"
                              ) {
                                e.preventDefault(); // ❗ verhindert Browser-Auto-„1“

                                let current = opt.score;

                                // Erstes Pfeil-Klicken bei leerem Feld
                                if (current == null) {
                                  current = e.key === "ArrowUp" ? 0 : 6; // ✅ GENAU DAS HIER
                                } else {
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
                            className="w-24 border rounded-md px-2 py-1 text-center"
                          />
                        )}

                        {/* Löschen */}
                        <button
                          onClick={() =>
                            setOptions(options.filter((_, j) => j !== i))
                          }
                          className="text-gray-500 hover:text-red-500 transition-all"
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
                      className="flex items-center gap-2 text-sm text-brand-sand font-medium hover:underline mt-2"
                    >
                      <Plus size={14} /> Neue Option hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* 🔹 Footer mit aktualisiertem Button */}
              <div className="flex justify-end gap-3 px-8 py-4 border-t bg-white sticky bottom-0 rounded-b-xl">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Abbrechen
                </button>
                <button
                  onClick={
                    editingQuestion
                      ? handleUpdateQuestion
                      : handleCreateQuestion
                  }
                  className="px-4 py-2 rounded-lg bg-brand-sand text-white font-medium hover:opacity-90"
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
                      <h2 className="text-lg font-semibold text-[#1a1a1a]">Vorschau: So sieht die Frage aus</h2>
                    </div>
                    <p className="text-sm text-[#666] mt-1">Simulation der Frage im Assessment-Flow</p>
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
                    {questionTypes.find((t) => t.value === previewQuestion.type)?.label || previewQuestion.type}
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
                      const optLabel = typeof opt === "string" ? opt : opt.label;
                      const checked = previewAnswer === optLabel;
                      return (
                        <label
                          key={optLabel}
                          className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition bg-white
                          ${checked
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
                          <span className="text-[15px] text-[#333]">{optLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Checkbox */}
                {previewQuestion.type === "checkbox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(previewQuestion.options || []).map((opt: any) => {
                      const optLabel = typeof opt === "string" ? opt : opt.label;
                      const list: string[] = Array.isArray(previewAnswer) ? previewAnswer : [];
                      const checked = list.includes(optLabel);
                      return (
                        <label
                          key={optLabel}
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
                            onChange={() => {
                              const next = [...list];
                              const idx = next.indexOf(optLabel);
                              if (idx >= 0) next.splice(idx, 1);
                              else next.push(optLabel);
                              setPreviewAnswer(next);
                            }}
                          />
                          <span className="text-[15px] text-[#333]">{optLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Slider / Range (Skala) */}
                {(previewQuestion.type === "slider" || previewQuestion.type === "range") && (
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
                    <option value="" disabled>Bitte auswählen …</option>
                    {(previewQuestion.options || []).map((opt: any) => {
                      const optLabel = typeof opt === "string" ? opt : opt.label;
                      return (
                        <option key={optLabel} value={optLabel}>{optLabel}</option>
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
        )}
      </div>{" "}
      {/* End of gray background container */}
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
      <p className="text-sm text-[#666] mb-3">Elemente per Drag & Drop sortieren:</p>
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