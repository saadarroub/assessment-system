import { useState } from "react";
import { useNavigate } from "react-router-dom";
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





export default function CatalogList() {
  const navigate = useNavigate();

  // 🔹 States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [options, setOptions] = useState<{ label: string; score: number }[]>([]);

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



// 🔹 Frage speichern → weiterleiten
const handleConfirm = () => {
  if (!questionText.trim() || !selectedType) return;
  
  setIsModalOpen(false);

  // ⬇️ hier dynamisch ID einfügen falls nötig
  navigate("/admin/catalogs/1/condition-editor");
};




  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setIsModalOpen(false);
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
        <div className="absolute top-5 left-24  w-full h-full bg-black bg-opacity-20 flex justify-center items-center z-50 ">
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
