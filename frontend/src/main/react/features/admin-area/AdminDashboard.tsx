import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/admin.css";
import AdminLayout from "@/apps/app/AdminLayout";

import myLogo from "@/assets/Zero-6-icons-05.webp";
import {
  Plus,
  MinusSquare,
  Trash2,
  Edit3,
  ListPlus,
  FileText,
  Search,
} from "lucide-react";

import {
  getAllQuestionNodes,
  getAllThemas,
  createThema,
  deleteThema,
  updateThema,
} from "@/api/questionApi";

//  Stats bleiben gleich
type Stat = { label: string; value: string; tone?: "positive" | "neutral" };
const STATS: Stat[] = [
  { label: "Themen", value: "–", tone: "positive" },
  { label: "Gesamtfragen", value: "–", tone: "positive" },
  { label: "Aktive Nutzer", value: "89", tone: "positive" },
  { label: "Letzte Änderung", value: "Heute", tone: "neutral" },
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Themen filtern nach Suchbegriff
  const filteredTopics = (topics || []).filter(
    (t) =>
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🧩 States für Bearbeiten-Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editThemaName, setEditThemaName] = useState("");
  const [editThemaDesc, setEditThemaDesc] = useState("");
  const [editThemaId, setEditThemaId] = useState<string | null>(null);

  // 🧩 Modal-Steuerung für neues Thema
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThemaName, setNewThemaName] = useState("");
  const [newThemaDesc, setNewThemaDesc] = useState("");

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // ⏳ Wenn das Modal geöffnet wird → automatisch Fokus auf Titel

  // Themen dynamisch laden
  useEffect(() => {
    if (isEditModalOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditModalOpen]);

  // 🔹 Themen laden (inkl. Themen ohne Fragen)
  const fetchTopics = async () => {
    try {
      console.log("📡 Lade alle Themen (inkl. ohne Fragen)...");

      // ✅ 1. Hole alle Themen
      const themas = await getAllThemas();

      // ✅ 2. Hole alle QuestionNodes, um zu zählen, welche Themen Fragen haben
      const nodes = await getAllQuestionNodes();

      // ✅ 3. Kombiniere beide Listen (Thema + Anzahl Fragen)
      const grouped = themas.map((thema: any) => {
        const count = nodes.filter((n: any) => n.thema?.id === thema.id).length;
        return {
          id: thema.id,
          title: thema.name,
          subtitle: thema.description,
          questions: count,
        };
      });

      // ✅ 4. Themen im State speichern (neuestes zuerst)
      setTopics(grouped.reverse());
    } catch (err) {
      console.error("❌ Fehler beim Laden der Themen:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Beim ersten Rendern automatisch laden
  useEffect(() => {
    fetchTopics();
  }, []);

  {
    /*
  if (loading)
    return (
      <AdminLayout>
        <div className="p-10 text-center text-gray-500 text-lg">
          ⏳ Themen werden geladen...
        </div>
      </AdminLayout>
    );
  */
  }

  return (
    <AdminLayout>
      <header
        className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4" //bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6 zum testen
      >
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
          <div className="justify-self-center">
            <div
              className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05]
             [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]"
            >
              <div className="flex items-center justify-center gap-4">
                <img
                  src={myLogo}
                  alt="Dein Logo"
                  className="h-[200px] w-[200px] object-contain shrink-0"
                  width={200}
                  height={200}
                />
                <div className="text-center">
                  <h1 className="text-[clamp(28px,6vw,56px)] font-extrabold tracking-[-0.02em] mb-2 leading-[1.05] text-[#264555]">
                    Fragenkatalog Administration
                  </h1>
                  <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
                    Verwalten Sie Ihre Themen und erstellen Sie finale Kataloge
                    für Kunden
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      {/* ====== Content ====== */}
      <div className="dashboard-content bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">
        <div className="flex justify-end gap-3 px-8 mt-1">
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#264555] text-white text-sm font-semibold shadow-md hover:bg-[#223e4c] focus:outline-none focus:ring-2 focus:ring-white/30 active:translate-y-px"
            onClick={() => navigate("/admin/adminPanel")}
          >
            <MinusSquare size={16} />
            <span>Admin-Panal</span>
          </button>
        </div>
        {/* Stats */}
        <section className="stats-panel">
          <div className="grid grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">{s.label}</p>
                    <p className="px-1 stat-value">
                      {s.value === "–"
                        ? i === 0
                          ? topics.length
                          : i === 1
                          ? topics.reduce(
                              (sum, t) => sum + (t.questions || 0),
                              0
                            )
                          : "–"
                        : s.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {loading && (
          <div className="p-10 text-center text-gray-500 text-lg">
            ⏳ Themen werden geladen...
          </div>
        )}

        {/* Topics */}
        {!loading && (
          <section className="topics-section">
            <div className="section-header">
              <h2>Themen</h2>

              <button
                className="btn btn-caramel"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>Neues Thema hinzufügen</span>
              </button>
            </div>

            {/* 🔍 Suche + Themenzähler */}
            <div className="max-w-auto mx-auto mb-6 mt-3 rounded-[12px] border bg-white/85 [backdrop-filter:saturate(1.2)_blur(4px)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                {/* Suchfeld */}
                <div className="relative flex-1 min-w-[220px] max-w-auto">
                  <Search
                    size={16}
                    className=" absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Suche Thema (Thema Titel oder Beschreibung)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 rounded-md border pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Themenzähler */}
                <div className="text-sm font-medium px-4 py-2 rounded-md border bg-white text-gray-600">
                  Zeige{" "}
                  <span className="font-semibold text-gray-800">
                    {filteredTopics.length}
                  </span>{" "}
                  Themen
                </div>
              </div>
            </div>

            <div className="topics-grid">
              {filteredTopics.map((t) => (
                <div
                  className="topic-card card-v2 kind-strategy flex flex-col justify-between h-full"
                  key={t.id}
                >
                  {/* Fragenanzahl */}
                  <div className="absolute top-7 right-5 text-[14px] text-gray-500 font-medium">
                    {t.questions} Fragen
                  </div>

                  {/* Titel & Icon */}
                  <div className="topic-title-row flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="bg-[#56768f] p-2.5 rounded-xl shadow">
                        <FileText size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="topic-text">
                      <h3 className="topic-title font-semibold text-gray-900">
                        {t.title}
                      </h3>
                    </div>
                  </div>

                  {/* Untertitel */}
                  <ul className="topic-bullets">
                    <li>{t.subtitle || "Keine Beschreibung vorhanden"}</li>
                  </ul>

                  {/* Statuszeile */}
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Aktiv
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Letzte Änderung: Heute
                    </div>
                  </div>

                  {/* 🔹 Buttons */}
                  <div className="flex flex-wrap justify-between gap-2 pt-4">
                    <button
                      onClick={() => {
                        setEditThemaId(t.id);
                        setEditThemaName(t.title);
                        setEditThemaDesc(t.subtitle);
                        setIsEditModalOpen(true);
                      }}
                      className="px-4 py-2 border rounded flex items-center justify-center gap-2 text-brand-navy text-sm hover:bg-green-50"
                    >
                      <Edit3 size={16} /> Bearbeiten
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTopic(t);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded flex items-center justify-center gap-2 text-sm hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} /> Löschen
                    </button>

                    {/* Fragen verwalten */}
                    <button
                      onClick={async () => {
                        try {
                          const nodes = await getAllQuestionNodes();
                          const hasQuestions = nodes.some(
                            (n: any) => n.thema && n.thema.id === t.id
                          );

                          if (hasQuestions) {
                            navigate(
                              `/admin/catalogs/${t.id}/condition-editor`
                            );
                          } else {
                            navigate(`/admin/catalogs/${t.id}`);
                          }
                        } catch (error) {
                          console.error(
                            "❌ Fehler beim Laden der Fragen:",
                            error
                          );
                          navigate(`/admin/catalogs`);
                        }
                      }}
                      className="flex-1 min-w-auto px-2 py-1 rounded flex items-center justify-center gap-2 hover:opacity-90 transition"
                      style={{
                        backgroundColor: "#56768f",
                        color: "#fff",
                      }}
                    >
                      <ListPlus size={16} /> Fragen verwalten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ====== Edit Thema Modal ====== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Thema bearbeiten
            </h3>

            {/* Titel (bearbeitbar) */}
            <input
              ref={titleInputRef}
              type="text"
              value={editThemaName}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setEditThemaName(e.target.value);
                }
              }}
              maxLength={50}
              className="w-full border p-2 rounded mb-1 focus:ring-1 focus:ring-brand-sand"
              placeholder="Thema-Name (max. 50 Zeichen)"
            />
            <p className="text-right text-xs text-gray-500 mb-3">
              {editThemaName.length}/50 Zeichen
            </p>

            {/* Beschreibung (bearbeitbar, max. 50 Zeichen) */}
            <textarea
              value={editThemaDesc}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setEditThemaDesc(e.target.value);
                }
              }}
              maxLength={60}
              className="w-full border p-2 rounded mb-2 h-24 focus:ring-1 focus:ring-brand-sand"
              placeholder="Beschreibung (max. 50 Zeichen)"
            />

            {/* Zeichenanzeige */}
            <p className="text-right text-xs text-gray-500 mb-4">
              {editThemaDesc.length}/60 Zeichen
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>

              <button
                onClick={async () => {
                  if (!editThemaId) return;
                  try {
                    const updated = await updateThema(editThemaId, {
                      name: editThemaName,
                      description: editThemaDesc,
                    });

                    // UI sofort aktualisieren
                    setTopics((prev) =>
                      prev.map((t) =>
                        t.id === updated.id
                          ? {
                              ...t,
                              title: updated.name,
                              subtitle: updated.description,
                            }
                          : t
                      )
                    );

                    setIsEditModalOpen(false);
                    console.log("✅ Thema erfolgreich aktualisiert!");
                  } catch (err) {
                    console.error(
                      "❌ Fehler beim Aktualisieren des Themas:",
                      err
                    );
                    alert("Fehler beim Aktualisieren des Themas!");
                  }
                }}
                className="px-4 py-2 bg-[#56768f] text-white rounded hover:opacity-90"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Add Thema Modal ====== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Neues Thema hinzufügen
            </h3>

            <input
              type="text"
              placeholder="Thema-Name"
              value={newThemaName}
              onChange={(e) => setNewThemaName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <textarea
              placeholder="Beschreibung"
              value={newThemaDesc}
              onChange={(e) => setNewThemaDesc(e.target.value)}
              className="w-full border p-2 rounded mb-4 h-24"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>

              <button
                onClick={async () => {
                  try {
                    await createThema({
                      name: newThemaName,
                      description: newThemaDesc,
                    });

                    // 🧠 Direkt aus Datenbank neu laden (statt reload)
                    await fetchTopics();

                    // 🔹 Modal schließen & Felder leeren
                    setIsAddModalOpen(false);
                    setNewThemaName("");
                    setNewThemaDesc("");
                  } catch (err) {
                    console.error("❌ Fehler beim Erstellen des Themas:", err);
                    alert("Fehler beim Erstellen des Themas!");
                  }
                }}
                className="px-4 py-2 bg-[#56768f] text-white rounded hover:opacity-90"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Delete Modal ====== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thema löschen
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Sind Sie sicher, dass Sie das Thema <br />
              <span className="block mt-1 font-semibold text-black text-lg">
                {selectedTopic?.title}
              </span>
              löschen möchten?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
              >
                Abbrechen
              </button>

              <button
                onClick={async () => {
                  if (!selectedTopic?.id) return;

                  try {
                    console.log("🗑️ Lösche Thema:", selectedTopic.id);

                    // 1️⃣ Thema in der DB löschen
                    await deleteThema(selectedTopic.id);

                    // 2️⃣ UI sofort aktualisieren (ohne Reload)
                    setTopics((prev) =>
                      prev.filter((t) => t.id !== selectedTopic.id)
                    );

                    // 3️⃣ Modal schließen
                    setShowDeleteModal(false);

                    console.log("✅ Thema erfolgreich gelöscht!");
                  } catch (err) {
                    console.error("❌ Fehler beim Löschen des Themas:", err);
                    alert("Fehler beim Löschen des Themas!");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
