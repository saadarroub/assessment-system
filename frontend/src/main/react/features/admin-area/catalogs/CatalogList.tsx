import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [options, setOptions] = useState<
    { label: string; score: number | null }[]
  >([]);
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);

  const [errorQuestionText, setErrorQuestionText] = useState<string | null>(
    null
  );
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorOptions, setErrorOptions] = useState<string | null>(null);

  const showOptions = selectedType?.hasOptions === true;
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { id: themaId } = useParams();
  const [thema, setThema] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isRequired, setIsRequired] = useState(true); // Standard: true (Pflichtfrage)
  const isOrderType = selectedType?.value === "order";
  // 🔹 Frage speichern → anlegen + mit Thema verknüpfen
  const handleConfirm = async () => {
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

      // ❗ Score prüfen NUR wenn NICHT Reihenfolge
      const missingScore =
        !isOrderType &&
        options.some(
          (o) =>
            o.score === null || o.score === undefined || isNaN(Number(o.score))
        );

      if (options.length < 2) {
        setErrorOptions("Mindestens zwei Antwortmöglichkeiten erforderlich.");
        hasError = true;
      } else if (missingLabel) {
        setErrorOptions("Bitte alle Antworttexte ausfüllen.");
        hasError = true;
      } else if (!isOrderType && missingScore) {
        setErrorOptions("Bitte alle Scores ausfüllen.");
        hasError = true;
      } else {
        setErrorOptions(null);
      }
    }

    // 🚫 Wenn Fehler vorhanden sind → Funktion sofort abbrechen
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

    // ✅ Ab hier nur, wenn alles korrekt ist
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
      await createQuestionNode(themaId!, question.id, null, isRequired);

      setIsModalOpen(false);
      setQuestionText("");
      setSelectedType(null);
      setOptions([]);
      setIsRequired(true); // Zurücksetzen auf Standard

      navigate(`/admin/catalogs/${themaId}/condition-editor`);
    } catch (error) {
      console.error("❌ Fehler beim Hinzufügen der Frage:", error);
    }
  };

  const handleCancel = () => {
    setQuestionText("");
    setSelectedType("");
    setOptions([]);
    setIsRequired(true); // Zurücksetzen auf Standard
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (selectedType?.hasOptions) {
      if (options.length === 0) {
        setOptions([
          { label: "", score: null },
          { label: "", score: null },
        ]);
      }
    } else {
      // 👇 Nur speichern, wenn aktuell Optionen existieren
      if (options.length > 0) {
        sessionStorage.setItem("lastOptions", JSON.stringify(options));
        setOptions([]);
      }
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedType?.hasOptions && optionsRef.current) {
      setTimeout(() => {
        optionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  }, [selectedType]);

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
            className="bg-brand-sand text-black font-medium px-5 py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            Erste Frage erstellen
          </button>
        </div>
      </div>

      {/* 🧩 MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[730px] max-h-[85vh] flex flex-col relative">
            <div className="p-8 overflow-y-auto flex-1" ref={modalRef}>
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
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    if (errorQuestionText) setErrorQuestionText(null); // 💡 Roter Rand verschwindet sofort
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

              {/* Fragetyp */}
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
                        if (errorType) setErrorType(null);

                        // 💡 Wenn ein neuer Typ gewählt wird → alte Fehler zurücksetzen
                        setErrorOptions(null);
                        setHasSubmitted(false);
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

              {/* Required Toggle */}
              <div className="mt-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antwort notwendig
                </label>

                <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-black-500">
                      Diese Frage Muss beantwortet werden
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

              {/* Antwortmöglichkeiten */}
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
                          min={0}
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
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
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
