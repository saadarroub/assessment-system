import { useState, useEffect } from "react";
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
  const [selectedType, setSelectedType] = useState("");
  const [options, setOptions] = useState<{ label: string; score: number }[]>(
    []
  );
  const [questions, setQuestions] = useState<any[]>([]);
  const [parentQuestion, setParentQuestion] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔁 Rekursive Funktion, die ALLE Kinder bis zur tiefsten Ebene lädt
  async function fetchChildrenRecursive(parentId: string): Promise<any[]> {
    try {
      const children = await getChildrenByParent(parentId);

      // Wenn keine Unterfragen -> gib leeres Array zurück
      if (!children || children.length === 0) return [];

      // Wenn es Kinder gibt -> lade auch deren Unterfragen rekursiv
      const enriched = await Promise.all(
        children.map(async (child: any) => ({
          id: child.id, // QuestionNode-ID
          questionId: child.question?.id, // ✅ echte Question-ID
          text: child.question?.text || "Ohne Text",
          type: child.question?.questionType?.inputType || "unknown",
          expanded: false,
          children: await fetchChildrenRecursive(child.id),
        }))
      );

      return enriched;
    } catch (err) {
      console.error(`Fehler beim Laden der Unterfragen von ${parentId}:`, err);
      return [];
    }
  }

  useEffect(() => {
    async function fetchAllQuestions() {
      try {
        // 1️⃣ Root-Fragen laden
        const roots = await getRootQuestionsByThema(themaId!);
        console.log("📥 Root-Fragen:", roots);

        // 2️⃣ Für jede Root-Frage alle Kinder (rekursiv) laden
        const fullHierarchy = await Promise.all(
          roots.map(async (root: any) => ({
            id: root.id,
            questionId: root.question?.id, // ✅ echte Question-ID
            text: root.question?.text || "Ohne Text",
            type: root.question?.questionType?.inputType || "unknown",
            expanded: false,
            children: await fetchChildrenRecursive(root.id),
          }))
        );

        // 3️⃣ In State speichern
        setQuestions(fullHierarchy);
      } catch (error) {
        console.error("❌ Fehler beim Laden aller Fragen:", error);
      }
    }

    if (themaId) fetchAllQuestions();
  }, [themaId]);

  // ✅ Neue Frage hinzufügen
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

  const handleAddQuestion = () => {
    setParentQuestion(null);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setParentQuestion(null);
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
  console.log("🧩 Frageobjekt beim Klick:", q);
  console.log("📌 QuestionNode-ID:", q.id);
  console.log("📌 Question-ID:", q.questionId);
  setQuestionToDelete(q);
  setIsDeleteModalOpen(true);
};


  // ✅ Bestätigt das Löschen
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
  const questionTypes = [
    { label: "Textfeld", value: "text", icon: <MessageSquare size={18} /> },
    { label: "Ja/Nein", value: "radio", icon: <CircleDot size={18} /> },
    { label: "Auswahl", value: "select", icon: <List size={18} /> },
    { label: "Mehrfach", value: "checkbox", icon: <CheckSquare size={18} /> },
    { label: "Zahl", value: "number", icon: <Hash size={18} /> },
    { label: "Datum", value: "date", icon: <Calendar size={18} /> },
    { label: "Bewertung", value: "range", icon: <BarChart3 size={18} /> },
    { label: "Reihenfolge", value: "ranking", icon: <ListOrdered size={18} /> },
  ];

  const typesWithOptions = ["radio", "checkbox", "select"];
  const showOptions = typesWithOptions.includes(selectedType);

  // 🧱 Sortable Item Component
  function SortableQuestion({ q, level = 0 }: { q: any; level?: number }) {
    const { attributes, listeners, setNodeRef, transform } = useSortable({
      id: q.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transform ? "transform 0.15s ease" : "none",
      willChange: "transform", // 🚀 GPU-Optimierung
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`mt-3 ${level > 0 ? "ml-8" : ""}`}
      >
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
          {/* Links */}
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 mt-1">
              {/* Drag Handle */}
              <GripVertical
                size={18}
                className="text-gray-400 cursor-grab mt-1"
                {...attributes}
                {...listeners}
              />

              {/* Pfeil */}
              {q.children?.length > 0 ? (
                q.expanded ? (
                  <ChevronDown
                    size={18}
                    className="text-gray-600 cursor-pointer"
                    onClick={() => toggleExpand(q.id)}
                  />
                ) : (
                  <ChevronRight
                    size={18}
                    className="text-gray-600 cursor-pointer"
                    onClick={() => toggleExpand(q.id)}
                  />
                )
              ) : (
                <div className="w-[18px]" />
              )}
            </div>

            {/* Frage + Typ */}
            <div className="flex flex-col mt-1">
              <p className="font-semibold text-gray-800 text-base leading-tight">
                {q.text}
              </p>
              <div className="mt-2">
                <span className="text-xs text-[#4a65b9] bg-[#e6edff] px-2 py-0.5 rounded-full font-medium">
                  {questionTypes.find((t) => t.value === q.type)?.label ||
                    "Unbekannt"}
                </span>
              </div>
            </div>
          </div>

          {/* Rechts */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setParentQuestion(q);
                setIsModalOpen(true);
              }}
              className="text-gray-600 hover:text-green-600 transition-all"
            >
              <Plus size={18} />
            </button>
            <button className="text-gray-600 hover:text-brand-sand transition-all">
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => handleDeleteQuestion(q)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Unterfragen */}
        {q.expanded && q.children?.length > 0 && (
          <SortableContext
            items={q.children.map((child: any) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {q.children.map((child: any) => (
              <SortableQuestion key={child.id} q={child} level={level + 1} />
            ))}
          </SortableContext>
        )}
      </div>
    );
  }

  // 🧩 DragEnd Handler (innerhalb einer Ebene)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((prev) =>
      moveQuestion(prev, String(active.id), String(over.id))
    );
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
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q) => (
              <SortableQuestion key={q.id} q={q} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* 🗑️ Lösch-Bestätigungs-Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
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

      {/* Modal bleibt unverändert */}
      {isModalOpen && (
        <div className="fixed top-5 left-24  w-full h-full bg-black bg-opacity-20 flex justify-center items-center z-50 ">
          <div className="bg-white rounded-xl shadow-lg w-[730px] max-h-[80vh] flex flex-col relative">
            <div className="p-8 overflow-y-auto flex-1">
              <button
                onClick={handleCancel}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              {parentQuestion ? (
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
                  Neue Frage hinzufügen
                </h2>
              )}

              {/* Frage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frage<span className="text-red-500">*</span>
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Frage eingeben..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-sand focus:outline-none"
                  rows={3}
                ></textarea>
              </div>

              {/* Fragetyp */}
              <div className="mb-6 mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fragetyp<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`flex items-center justify-start gap-3 border rounded-lg py-3 px-4 text-left font-medium text-sm transition-all duration-150 ${
                        selectedType === type.value
                          ? "bg-brand-sand border-brand-sand text-white shadow-md"
                          : "border-gray-300 text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optionen */}
              {showOptions && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Antwortmöglichkeiten
                  </h3>
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 mb-3 border border-gray-200 p-2 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Antworttext..."
                        value={opt.label}
                        onChange={(e) =>
                          setOptions(
                            options.map((o, j) =>
                              j === i ? { ...o, label: e.target.value } : o
                            )
                          )
                        }
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-brand-sand focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Score"
                        value={opt.score}
                        onChange={(e) =>
                          setOptions(
                            options.map((o, j) =>
                              j === i
                                ? { ...o, score: Number(e.target.value) }
                                : o
                            )
                          )
                        }
                        className="w-24 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring-1 focus:ring-brand-sand focus:outline-none"
                      />
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
                  <button
                    onClick={() =>
                      setOptions([...options, { label: "", score: 0 }])
                    }
                    className="flex items-center gap-2 text-sm text-brand-sand font-medium hover:underline mt-2"
                  >
                    <Plus size={14} /> Neue Option hinzufügen
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-8 py-4 border-t bg-white sticky bottom-0 rounded-b-xl">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-brand-sand text-white font-medium hover:opacity-90"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
