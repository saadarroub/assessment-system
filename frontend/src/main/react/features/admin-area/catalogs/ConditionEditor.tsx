import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import AdminLayout from "@/apps/app/AdminLayout";
import "@/styles/admin.css";

/* 🔹 Typdefinition */
interface Question {
  id: string;
  text: string;
  type: string;
  indent: number; // 0 = Hauptfrage, 1 = Unterfrage, 2 = Unter-Unterfrage ...
  options?: string[];
}

/* 🔹 Einzelne Frage-Komponente */
function SortableQuestion({
  question,
  onDelete,
}: {
  question: Question;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${question.indent * 40}px`,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start justify-between bg-white rounded-xl border border-gray-200 p-4 mb-2 shadow-sm hover:shadow-md transition">
        {/* 🔹 Drag + Inhalt */}
        <div className="flex items-start gap-3 flex-1">
          <button {...attributes} {...listeners}>
            <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing mt-1" />
          </button>

          <div>
            {/* Fragetext */}
            <p className="font-medium text-gray-800 mb-1">{question.text}</p>

            {/* Badges */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {question.type}
              </span>
              {question.options && (
                <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                  {question.options.length} Optionen
                </span>
              )}
            </div>

            {/* Optionen-Liste */}
            {question.options && (
              <p className="text-xs text-gray-500">
                Optionen: {question.options.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Buttons rechts */}
        <div className="flex items-center gap-3 ml-4">
          <button className="text-gray-500 hover:text-brand-sand transition">
            ✏️
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="text-red-500 hover:text-red-700 transition"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}


/* 🔹 Hauptkomponente */
export default function ConditionEditor() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "Wie viele Mitarbeiter hat Ihr Unternehmen?", type: "Multiple Choice", indent: 0 },
    { id: "2", text: "Haben Sie eine IT-Abteilung?", type: "Ja/Nein", indent: 1 },
    { id: "3", text: "Wie groß ist Ihre IT-Abteilung?", type: "Multiple Choice", indent: 2 },
    { id: "4", text: "Wird die IT-Strategie regelmäßig überprüft?", type: "Ja/Nein", indent: 0 },
  ]);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  /* 🔹 DragMove: erkennt horizontale Bewegung */
  /* 🔹 DragMove: erkennt horizontale Bewegung */
function handleDragMove(event: DragMoveEvent) {
  const { active, delta } = event;
  if (!active || draggedId !== active.id) return;

  setQuestions((prev) =>
    prev.map((q) => {
      if (q.id === active.id) {
        // Leichte Schwelle, damit nicht bei jeder kleinen Bewegung eingerückt wird
        let change = 0;
        if (delta.x > 60) change = 1;
        if (delta.x < -60) change = -1;

        const newIndent = Math.min(Math.max(0, q.indent + change), 5);
        return { ...q, indent: newIndent };
      }
      return q;
    })
  );
}


  /* 🔹 DragEnd: Reihenfolge & Einrückung anwenden */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setDraggedId(null);
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);

    setQuestions(reordered);
    setDraggedId(null);
  }

  /* 🔹 Frage löschen */
  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  /* 🔹 Neue Frage hinzufügen */
  function handleAddQuestion() {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "Neue Frage",
      type: "Textfeld",
      indent: 0,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }

  return (
    <AdminLayout>
      <div className="p-10">
        <h1 className="text-3xl font-bold text-brand-navy mb-6">
          Fragenhierarchie verwalten
        </h1>
        <p className="text-gray-500 mb-8">
          Ziehen Sie Fragen mit der Maus nach oben/unten, um sie zu verschieben.
          Ziehen Sie leicht nach rechts, um sie als Unterfrage zu verschachteln.
          Ziehen Sie nach links, um sie wieder höher zu stufen.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setDraggedId(e.active.id as string)}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q) => (
              <SortableQuestion key={q.id} question={q} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 bg-brand-sand text-white px-5 py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Plus size={16} /> Frage hinzufügen
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
