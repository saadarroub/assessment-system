import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/shared/app/AdminLayout";
import "@/styles/admin.css";

import {
  Layers,
  Plus,

  MessageSquare,
  List,
  BarChart3,
  Calendar,
  Hash,
  CheckSquare,
  CircleDot,
  ListOrdered,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import {
  getThemaById,
  getQuestionTypes,
  createQuestion,
  createQuestionNode,
} from "@/shared/service/api/questionApi";

import PageHeader from "./PageHeader";

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
  const [isScorable, setIsScorable] = useState(true); // Standard: true (bewertbar)
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
      isScorable: hasOptions ? true : isScorable, // Nur für Textfelder relevant
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
    setOptions([]);
    setIsRequired(true); // Zurücksetzen auf Standard
    setIsScorable(true); // Zurücksetzen auf Standard
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
      <PageHeader
        title={thema?.name || "Lade..."}
        subtitle="Verwalten Sie Ihre Themen und erstellen Sie finale Kataloge"
        icon={<Layers size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/* BODY */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mt-6">
  <div
    className="
      relative
      overflow-hidden
      rounded-2xl
      border
      px-10 py-14
      text-center
      shadow-[0_10px_30px_rgba(0,0,0,0.06)]
    "
    style={{
      background:
        "linear-gradient(180deg, #ffffff 0%, #fffdf7 100%)",
      borderColor: "rgba(227,187,98,0.35)",
    }}
  >
    {/* Goldener Deko-Glow */}
    <div
      className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-60"
      style={{
        background:
          "radial-gradient(circle, rgba(227,187,98,0.35), transparent 70%)",
      }}
    />

    {/* Icon */}
    <div
      className="
        mx-auto mb-4
        flex items-center justify-center
        h-14 w-14
        rounded-2xl
        shadow
      "
      style={{
        background:
          "linear-gradient(135deg, #E3BB62 0%, #D4AF37 100%)",
      }}
    >
      <MessageSquare size={26} className="text-[#264555]" />
    </div>

    {/* Titel */}
    <h2 className="text-xl font-semibold text-[#264555]">
      Noch keine Fragen vorhanden
    </h2>

    {/* Beschreibung */}
    <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
      Beginnen Sie mit dem Erstellen der ersten Hauptfrage, um den
      Fragenkatalog aufzubauen.
    </p>

    {/* Action Button */}
    <div className="mt-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          inline-flex items-center gap-2
          rounded-full
          px-6 py-3
          text-sm font-semibold
          transition
          hover:-translate-y-[1px]
        "
        style={{
          background: "#E3BB62",
          color: "#264555",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
      >
        <Plus size={16} />
        Erste Hauptfrage erstellen
      </button>
    </div>
  </div>
</div>

      </main>

      {/* � Modal: Neue Frage hinzufügen */}
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
                <>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                    Erste Hauptfrage erstellen
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Felder mit <span className="text-red-500">*</span> sind
                    Pflichtfelder.
                  </p>
                </>

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
                        className={`flex items-center justify-start gap-3 border rounded-xl py-3 px-4 text-left font-medium text-sm transition-all duration-150 ${selectedType?.id === type.id
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
                      className={`w-12 h-7 flex items-center rounded-full transition-all ${isRequired ? "bg-[#E3BB62]" : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-all ${isRequired ? "translate-x-6" : "translate-x-1"
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
                        className={`w-12 h-7 flex items-center rounded-full transition-all ${isScorable ? "bg-[#E3BB62]" : "bg-slate-300"
                          }`}
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-all ${isScorable ? "translate-x-6" : "translate-x-1"
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
                            if (errorOptions) setErrorOptions(null);
                          }}
                          className={`flex-1 border rounded-md px-2 py-1 focus:ring-1 focus:ring-brand-sand focus:outline-none ${hasSubmitted && !opt.label.trim()
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

                                if (/^[0-6]$/.test(val)) {
                                  setOptions(
                                    options.map((o, j) =>
                                      j === i ? { ...o, score: Number(val) } : o
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

                                  if (current == null)
                                    current = e.key === "ArrowUp" ? 0 : 6;
                                  else {
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
                                <ChevronUp size={14} className="text-gray-600" />
                              </button>

                              <button
                                type="button"
                                className="flex-1 flex items-center justify-center hover:bg-gray-200"
                                onClick={() => {
                                  let current = opt.score;
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
                        color: "#b08d2a",
                      }}
                    >
                      <Plus size={16} className="text-[#b08d2a]" />
                      Neue Option hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* kleiner Abstand wie bei User-Modals */}
              <div className="h-3" />

            </div>

            {/* Buttons außerhalb des Modals */}
            <div className="h-3" />
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
                onClick={handleConfirm}
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
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
