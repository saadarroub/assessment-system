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

  // 🧩 Root-Fragen eines Themas laden
  useEffect(() => {
    const fetchRootQuestions = async () => {
      try {
        const data = await getRootQuestionsByThema(themaId!);
        console.log("📥 Root-Fragen für Thema:", themaId, data);
        setQuestions(
          data.map((q: any) => ({
            id: q.id,
            text: q.question?.text || "Ohne Text",
            type: q.question?.questionType?.inputType || "unknown",
            children: [],
            expanded: true,
          }))
        );
      } catch (error) {
        console.error("❌ Fehler beim Laden der Root-Fragen:", error);
      }
    };

    if (themaId) fetchRootQuestions();
  }, [themaId]);

useEffect(() => {
  async function fetchAllQuestions() {
    try {
      // 1️⃣ Root-Fragen für das Thema laden
      const roots = await getRootQuestionsByThema(themaId!);
      console.log("📥 Root-Fragen:", roots);

      // 2️⃣ Für jede Root-Frage direkt prüfen, ob sie Unterfragen hat
      const rootsWithChildren = await Promise.all(
        roots.map(async (root: any) => {
          const children = await getChildrenByParent(root.id);
          console.log(`🔹 Unterfragen von ${root.id}:`, children);

          return {
            id: root.id,
            text: root.question?.text || "Ohne Text",
            type: root.question?.questionType?.inputType || "unknown",
            children: children.map((child: any) => ({
              id: child.id,
              text: child.question?.text || "Ohne Text",
              type: child.question?.questionType?.inputType || "unknown",
              children: [],
              expanded: false,
            })),
            expanded: false,
          };
        })
      );

      // 3️⃣ Fragen im State speichern
      setQuestions(rootsWithChildren);
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

  // 🗑️ Frage löschen
  const handleDeleteQuestion = (id: string) => {
    const removeRecursive = (list: any[]): any[] =>
      list
        .filter((q) => q.id !== id)
        .map((q) => ({
          ...q,
          children: q.children ? removeRecursive(q.children) : [],
        }));
    setQuestions(removeRecursive(questions));
  };

  // 🔽 Ein- & Ausklappen
  // 🔽 Ein- & Ausklappen von Fragen (rekursiv)
  const toggleExpand = async (id: string) => {
    try {
      // Lokales Umschalten
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === id ? { ...q, expanded: !q.expanded } : q
        )
      );

      // 🔹 Finde die Frage, die expandiert werden soll (rekursiv)
      const findQuestionRecursive = (list: any[], id: string): any => {
        for (const q of list) {
          if (q.id === id) return q;
          const found = findQuestionRecursive(q.children || [], id);
          if (found) return found;
        }
        return null;
      };

      const target = findQuestionRecursive(questions, id);

      if (target && !target.expanded) {
        console.log("📡 Lade Unterfragen für:", id);
        const children = await getChildrenByParent(id);

        if (children.length > 0) {
          const formattedChildren = children.map((child: any) => ({
            id: child.id,
            text: child.question?.text || "Ohne Text",
            type: child.question?.questionType?.inputType || "unknown",
            children: [],
            expanded: false,
          }));

          // 🔹 Rekursive Update-Funktion
          const updateRecursive = (nodes: any[]): any[] =>
            nodes.map((node) => {
              if (node.id === id) {
                return { ...node, expanded: true, children: formattedChildren };
              }
              return {
                ...node,
                children: updateRecursive(node.children || []),
              };
            });

          setQuestions((prev) => updateRecursive(prev));
        } else {
          console.log("ℹ️ Keine Unterfragen für", id);
        }
      }
    } catch (error) {
      console.error("❌ Fehler beim Laden der Unterfragen:", error);
    }
  };

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
              onClick={() => handleDeleteQuestion(q.id)}
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
              IT Project Management
            </h1>
          </div>
          <p className="text-gray-600 mt-4">Projektplanung und -durchführung</p>
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

      {/* Modal bleibt unverändert */}
      {isModalOpen && (
        <div className="absolute top-5 left-24  w-full h-full bg-black bg-opacity-20 flex justify-center items-center z-50 ">
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
