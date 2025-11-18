import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import "@/styles/admin.css";
import {
  ArrowLeft,
  FileText,
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
  moveRootNode,
  moveChildNode,
} from "@/api/questionApi";

// 🧩 Drag & Drop Imports
import { DndContext, closestCenter } from "@dnd-kit/core";
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

  const containerRef = useRef<HTMLDivElement | null>(null);

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
            options: parsedOptions, // ✅
            scoringSchema: parsedScoring, // ✅
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
              options: parsedOptions, // ✅ korrigiert
              scoringSchema: parsedScoring, // ✅ korrigiert
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

  // Neue Frage hinzufügen vilt später
  {
    /*
  const handleConfirm = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: questionText,
      type: selectedType,
      options,
      children: [],
      expanded: true,
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

    handleCancel();
  };
  */
  }

  const handleAddQuestion = () => {
    setParentQuestion(null);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setParentQuestion(null);
    setEditingQuestion(null);

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

      console.log("✅ Frage erfolgreich gelöscht:", questionId);
    } catch (error) {
      console.error("❌ Fehler beim Löschen der Frage:", error);
      alert("Fehler beim Löschen der Frage. Bitte später erneut versuchen.");
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
      const missingScore = options.some(
        (o) =>
          o.score === null || o.score === undefined || isNaN(Number(o.score))
      );

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
      scoringSchema: hasOptions
        ? Object.fromEntries(options.map((o) => [o.label, Number(o.score)]))
        : null,
    };

    try {
      const question = await createQuestion(payload);
      const node = await createQuestionNode(
        themaId!,
        question.id,
        parentQuestion ? parentQuestion.id : null
      );

      const newQuestion = {
        id: node.id,
        questionId: question.id,
        text: question.text,
        type: selectedType.value,
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
    } catch (error) {
      console.error("❌ Fehler beim Hinzufügen der Frage:", error);
      alert("❌ Fehler beim Hinzufügen der Frage!");
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
      const missingScore = options.some(
        (o) =>
          o.score === null || o.score === undefined || isNaN(Number(o.score))
      );

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
        scoringSchema: hasOptions
          ? Object.fromEntries(options.map((o) => [o.label, o.score]))
          : null,
      };

      await updateQuestion(editingQuestion.questionId, payload);

      // 🧱 UI aktualisieren (auch scoringSchema)
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
              }
            : {
                ...q,
                children: q.children ? updateQuestionInTree(q.children) : [],
              }
        );

      setQuestions((prev) => updateQuestionInTree(prev));

      // 🧹 Felder & Fehler zurücksetzen
      handleCancel();
    } catch (err) {
      console.error("❌ Fehler beim Bearbeiten der Frage:", err);
      alert("❌ Fehler beim Bearbeiten der Frage!");
    }
  };

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

  // 🔹 Fragetypen
  const showOptions = selectedType?.hasOptions === true;

  // 🧱 Sortable Item Component
  function SortableQuestion({ q, level = 0 }: { q: any; level?: number }) {
    // -----------------------------
    // 1️⃣ useSortable + Auto-Close
    // -----------------------------
    const { attributes, listeners, setNodeRef, transform } = useSortable({
      id: q.id,
      data: { parent: q.parentId || "root", node: q },
    });

    // -----------------------------
    // 2️⃣ Auto-Close beim Überfahren
    // -----------------------------
    useEffect(() => {
      if (transform && q.expanded) {
        // 🔥 Wenn man über eine offene Frage zieht → schließen
        toggleExpand(q.id);
      }
    }, [transform]);

    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: "0.15s ease",
          marginLeft: level > 0 ? 25 : 0,
        }}
        className="mt-3"
      >
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
          {/* LINKS */}
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <GripVertical
              size={18}
              className="text-gray-400 cursor-grab mt-1"
              {...attributes}
              {...listeners}
            />

            {/* Klapp-Pfeil */}
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

              <span className="inline-block w-fit text-xs mt-2 text-[#4a65b9] bg-[#e6edff] px-2 py-0.5 rounded-full whitespace-nowrap">
                {questionTypes.find((t) => t.value === q.type)?.label}
              </span>
            </div>
          </div>

          {/* RECHTS */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setParentQuestion(q);
                setIsModalOpen(true);
              }}
            >
              <Plus size={18} />
            </button>

            <button
              onClick={() => {
                setEditingQuestion(q);
                setParentQuestion(null);
                setQuestionText(q.text);
                setSelectedType(questionTypes.find((t) => t.value === q.type));
                setOptions(q.options || []);
                setIsModalOpen(true);
              }}
            >
              <Edit3 size={18} />
            </button>

            <button
              onClick={() => handleDeleteQuestion(q)}
              className="text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* 🔥 Jede Ebene bekommt eigenen DnD-Kontext → kein Ruckeln */}
        {q.expanded && q.children?.length > 0 && (
          <div
            ref={containerRef}
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={({ active }) => {
                const node = active?.data?.current;
                if (!node) return;

                // Wenn die gezogene Frage offen ist → schließen
                if (node.node?.expanded) {
                  toggleExpand(node.node.id);
                }
              }}
              onDragMove={({ over }) => {
                if (!over) return;

                const hoveredNode = over?.data?.current?.node;
                if (!hoveredNode) return;

                // Wenn man über eine offene Frage zieht → schließen
                if (hoveredNode.expanded) {
                  toggleExpand(hoveredNode.id);
                }
              }}
              modifiers={[restrictToParentElement]}
            >
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
            </DndContext>
          </div>
        )}
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
        console.log("📌 Root verschoben:", activeId, "→ Position", newPosition);
        return;
      }

      // CHILD → CHILD (gleiche Ebene)
      if (activeInfo.parentId === overInfo.parentId) {
        await moveChildNode(activeId, activeInfo.parentId!, newPosition);
        console.log(
          "📌 Child verschoben in gleicher Ebene:",
          activeId,
          "→ Position",
          newPosition
        );
        return;
      }

      console.warn(
        "⚠️ Verschieben in andere Parent-Ebene ist deaktiviert (Absprache)."
      );
    } catch (err) {
      console.error("❌ Fehler beim Reorder:", err);
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
      <div className="bg-[rgba(210,201,185,0.2)] px-10 pt-10 pb-10 border-b border-gray-200 rounded-b-xl">
        <div
          className="w-fit bg-gray-100 hover:bg-blue-50 active:bg-blue-100 rounded-lg shadow px-4 py-3 flex items-center gap-2 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium text-gray-800">
            Zurück zur Übersicht
          </span>
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <div className="bg-brand-sand p-3 rounded-xl shadow">
              <FileText size={26} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-6xl font-bold">
              {thema?.name || "Lade Thema..."}
            </h1>
          </div>
          <p className="text-gray-600 mt-4">
            {thema?.description || "Beschreibung wird geladen..."}
          </p>
        </div>
      </div>

      {/* Hauptfrage hinzufügen */}
      <div className="px-8 pt-6 flex justify-end">
        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 bg-brand-sand text-white font-medium px-4 py-2 rounded shadow hover:shadow-md hover:scale-105 transition-all duration-200"
        >
          <Plus size={16} />
          Neue Hauptfrage
        </button>
      </div>

      {/* Fragenliste mit DnD */}
  <div className="px-10 pt-8">
  <div
    style={{
      position: "relative",
      overflow: "hidden",

    }}
  >
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext
        id="root"
        items={questions.map((q) => q.id)}
        strategy={verticalListSortingStrategy}
      >
        {questions.map((q) => (
          <SortableQuestion key={q.id} q={q} />
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
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">
                      Vaterfrage:
                    </span>{" "}
                    {parentQuestion.text}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-800 mt-2">
                    Neue Unterfrage hinzufügen
                  </h2>
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
                          ? "bg-brand-sand border-brand-sand text-white shadow-md"
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
                      <input
                        type="number"
                        placeholder="Score"
                        min={1}
                        max={5}
                        step={1}
                        value={
                          opt.score == null || Number.isNaN(opt.score)
                            ? ""
                            : opt.score
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setOptions(
                              options.map((o, j) =>
                                j === i ? { ...o, score: null } : o
                              )
                            );
                          } else if (Number(val) >= 1 && Number(val) <= 5) {
                            setOptions(
                              options.map((o, j) =>
                                j === i ? { ...o, score: Number(val) } : o
                              )
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          // ✅ Nur Zahlen 1–5, Backspace, Tab, Delete und Pfeile erlauben
                          const allowedKeys = [
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "Backspace",
                            "Tab",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                          ];
                          if (!allowedKeys.includes(e.key)) {
                            e.preventDefault(); // ❌ blockiert alles andere (Buchstaben, Zeichen, 0, 6–9, Enter, etc.)
                          }
                        }}
                        className={`w-24 border rounded-md px-2 py-1 text-center focus:ring-1 focus:ring-brand-sand focus:outline-none ${
                          hasSubmitted &&
                          (opt.score === null || Number.isNaN(opt.score))
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />

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
                    <p className="text-red-500 text-xs mt-1">{errorOptions}</p>
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
                  editingQuestion ? handleUpdateQuestion : handleCreateQuestion
                }
                className="px-4 py-2 rounded-lg bg-brand-sand text-white font-medium hover:opacity-90"
              >
                {editingQuestion ? "Speichern" : "Hinzufügen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
