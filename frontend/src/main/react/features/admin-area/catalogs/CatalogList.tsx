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
  ListOrdered,
  Trash2,
} from "lucide-react";

import {
  getThemaById,
  getQuestionTypes,
  createQuestion,
  createQuestionNode,
} from "@/api/questionApi";

export default function CatalogList() {
  const navigate = useNavigate();

  // 🔹 States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [selectedType, setSelectedType] = useState<any | null>(null);

  const [options, setOptions] = useState<{ label: string; score: number }[]>(
    []
  );
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);

  // 🔹 Fragetypen

  const showOptions = selectedType?.hasOptions === true;

  // 🔹 Frage speichern → anlegen + mit Thema verknüpfen
const handleConfirm = async () => {
  if (!questionText.trim() || !selectedType) {
    alert("❌ Bitte Fragetext und Typ auswählen!");
    return;
  }

  const hasOptions = selectedType?.hasOptions;

  const payload = {
    text: questionText,
    questionType: { id: selectedType.id },
    options: hasOptions ? options.map((o) => o.label) : null,
    scoringSchema: hasOptions
      ? Object.fromEntries(options.map((o) => [o.label, o.score]))
      : null,
  };

  try {
  
    const question = await createQuestion(payload);
  

    // ➕ Frage mit Thema verknüpfen
    console.log("🔗 Verknüpfe Frage mit Thema:", themaId);
    await createQuestionNode(themaId!, question.id);

    console.log("✅ QuestionNode erfolgreich erstellt!");

    // 🧹 UI zurücksetzen
    setIsModalOpen(false);
    setQuestionText("");
    setSelectedType(null);
    setOptions([]);

    // 🚀 Direkt weiterleiten — kein alert mehr!
    navigate(`/admin/catalogs/${themaId}/condition-editor`);
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen der Frage:", error);
    alert("❌ Fehler beim Hinzufügen der Frage!");
  }
};


  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setIsModalOpen(false);
  };

  const { id: themaId } = useParams();
  const [thema, setThema] = useState<{
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getQuestionTypes();

        // 🔹 Icons zuordnen und API-Daten aufbereiten
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
              label = "Ja/Nein";
              break;
            case "select":
              label = "Auswahl";
              break;
            case "checkbox":
              label = "Mehrfach";
              break;
            case "number":
              label = "Zahl";
              break;
            case "date":
              label = "Datum";
              break;
            case "range":
              label = "Bewertung";
              break;
            case "order":
              label = "Reihenfolge";
              break;
            default:
              label = t.name; // Fallback, falls neuer Typ aus DB kommt
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
      } catch (err) {
        console.error("❌ Fehler beim Laden der Fragetypen:", err);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    const loadThema = async () => {
      try {
        const data = await getThemaById(themaId!);
        setThema(data);
      } catch (err) {
        console.error("❌ Fehler beim Laden des Themas:", err);
      }
    };

    if (themaId) loadThema();
  }, [themaId]);

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

            {/* Dynamischer Titel */}
            <h1 className="text-2xl md:text-6xl font-bold">
              {thema ? thema.name : "Lade Thema..."}
            </h1>
          </div>

          {/* Dynamische Beschreibung */}
          <p className="text-gray-600 mt-4">{thema ? thema.description : ""}</p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white mx-10 mt-12 p-10 rounded-xl shadow text-center">
        <div className="flex flex-col items-center justify-center">
          <MessageSquare size={36} className="text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800">
            Noch keine Fragen
          </h2>
          <p className="text-gray-500 mt-1 mb-6">
            Beginnen Sie mit dem Erstellen der ersten Hauptfrage.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-sand text-white font-medium px-5 py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            Erste Frage erstellen
          </button>
        </div>
      </div>

      {/* 🧩 MODAL */}
      {isModalOpen && (
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999]">

  <div className="bg-white rounded-xl shadow-lg w-[730px] max-h-[85vh] flex flex-col relative">

            {/* Header */}
            <div className="p-8 overflow-y-auto flex-1">
              <button
                onClick={handleCancel}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Erste Hauptfrage erstellen
              </h2>

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
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center justify-start gap-3 border rounded-lg py-3 px-4 text-left font-medium text-sm transition-all duration-150 ${
                        selectedType?.id === type.id
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

              {/* Antwortmöglichkeiten */}
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
