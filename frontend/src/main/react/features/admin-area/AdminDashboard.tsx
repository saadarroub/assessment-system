import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/admin.css";
import AdminLayout from "@/apps/app/AdminLayout";
import TopicCard from "./TopicCard";

// Icons
import myLogo from "@/assets/Zero-6-icons-05.webp";
import { Plus, MinusSquare, Search,Layers, ListOrdered, Users, Clock } from "lucide-react";

// API
import {
  getAllQuestionNodes,
  getAllThemas,
  createThema,
  deleteThema,
  updateThema,
} from "@/api/questionApi";

// TYPES
type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  color?: string;
};

// STATS

const STAT_COLORS = ["#808080", "#56768f","#264555",  "#d2c9b9"];

const STAT_ICONS = [
  <Layers size={48} />,
  <ListOrdered size={48} />,
  <Users size={48} />,
  <Clock size={48} />,
];

type Stat = { label: string; value: string; tone?: "positive" | "neutral" };

const STATS: Stat[] = [
  { label: "Themen", value: "–", tone: "positive" },
  { label: "Gesamtfragen", value: "–", tone: "positive" },
  { label: "Aktive Nutzer", value: "89", tone: "positive" },
  { label: "Letzte Änderung", value: "Heute", tone: "neutral" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editThemaName, setEditThemaName] = useState("");
  const [editThemaDesc, setEditThemaDesc] = useState("");
  const [editThemaId, setEditThemaId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThemaName, setNewThemaName] = useState("");
  const [newThemaDesc, setNewThemaDesc] = useState("");

  // Modal Input Referenz
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Farben Rotation
  const TOPIC_COLORS = useMemo(
    () => ["#264555", "#56768f", "#808080", "#d2c9b9", "#E3BB62"],
    []
  );

  // Fetch Themen
  const fetchTopics = useCallback(async () => {
    try {
      const themas = await getAllThemas();
      const nodes = await getAllQuestionNodes();

      let colorIndex = 0;

      const grouped: Topic[] = themas.map((thema: any) => {
        const count = nodes.filter((n: any) => n.thema?.id === thema.id).length;

        const color = TOPIC_COLORS[colorIndex];
        colorIndex = (colorIndex + 1) % TOPIC_COLORS.length;

        return {
          id: thema.id,
          title: thema.name,
          subtitle: thema.description,
          questions: count,
          color,
        };
      });

      setTopics(grouped.reverse());
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Themen", err);
      setLoading(false);
    }
  }, [TOPIC_COLORS]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Suche & Filtering
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return topics;
    const term = searchTerm.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.subtitle.toLowerCase().includes(term)
    );
  }, [topics, searchTerm]);

  // Pagination
  const topicsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLast = currentPage * topicsPerPage;
  const indexOfFirst = indexOfLast - topicsPerPage;

  const currentTopics = useMemo(
    () => filteredTopics.slice(indexOfFirst, indexOfLast),
    [filteredTopics, indexOfFirst, indexOfLast]
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredTopics.length / topicsPerPage),
    [filteredTopics]
  );

  // Callbacks (stable)
  const handleDelete = useCallback((t: Topic) => {
    setSelectedTopic(t);
    setShowDeleteModal(true);
  }, []);

  const handleEdit = useCallback((t: Topic) => {
    setEditThemaId(t.id);
    setEditThemaName(t.title);
    setEditThemaDesc(t.subtitle);
    setIsEditModalOpen(true);
  }, []);

  const handleManage = useCallback(
    async (t: Topic) => {
      try {
        const nodes = await getAllQuestionNodes();
        const hasQuestions = nodes.some(
          (n) => n.thema && n.thema.id === t.id
        );

        navigate(
          hasQuestions
            ? `/admin/catalogs/${t.id}/condition-editor`
            : `/admin/catalogs/${t.id}`
        );
      } catch {
        navigate(`/admin/catalogs`);
      }
    },
    [navigate]
  );

  return (
    <AdminLayout>
      {/* HEADER */}
      <header className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4">
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />

        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-center col-span-3 lg:col-span-1">
            <div className="flex items-center justify-center gap-4">
              <img
                src={myLogo}
                alt="Logo"
                className="h-[200px] w-[200px] object-contain"
              />
              <div className="text-center">
                <h1 className="text-[clamp(28px,6vw,56px)] font-extrabold text-[#264555] leading-[1.05]">
                  Fragenkatalog Administration
                </h1>
                <p className="text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
                  Verwalten Sie Ihre Themen und erstellen Sie finale Kataloge
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="dashboard-content bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] px-6 py-6 mt-2">
        {/* BUTTON */}
        <div className="flex justify-end mt-4">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#264555] text-white shadow-md hover:bg-[#223e4c]"
            onClick={() => navigate("/admin/adminPanel")}
          >
            <MinusSquare size={16} />
            Admin-Panel
          </button>
        </div>

        {/* STATS */}
 <section className="stats-panel mt-4">
  <div className="grid grid-cols-4 gap-4">

    {STATS.map((s, i) => (
      <div
        key={i}
        className="
          relative
          h-[110px]
          rounded-2xl 
          shadow-[0_4px_16px_rgba(0,0,0,0.15)]
          overflow-hidden
          p-5
          flex flex-col justify-between
        "
        style={{ backgroundColor: STAT_COLORS[i] }}
      >
        {/* ICON BACKGROUND */}
        <div
          className="absolute right-3 bottom-3 opacity-[0.18]"
          style={{ color: "white" }}
        >
          {STAT_ICONS[i]}
        </div>

        {/* LABEL */}
        <p className="text-white/80 text-sm font-medium">
          {s.label}
        </p>

        {/* VALUE */}
        <p className="text-white text-4xl font-extrabold">
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
    ))}

  </div>
</section>



        {/* THEMEN */}
        {!loading && (
          <section className="topics-section">
            <div className="section-header">
              <h2>Themen</h2>
              <button
                className="btn btn-caramel"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                Neues Thema
              </button>
            </div>

            {/* SEARCH */}
            <div className="mx-auto mb-6 mt-3 rounded-[12px] border bg-white/85 backdrop-blur-md shadow">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Suche Thema..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 rounded-md border pl-10 pr-3 text-sm focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="px-4 py-2 rounded-md border bg-white text-gray-600">
                  Zeige{" "}
                  <span className="font-semibold">
                    {filteredTopics.length}
                  </span>{" "}
                  Themen
                </div>
              </div>
            </div>

            {/* GRID (optimiert + lazy render) */}
            <div
              className="
                mt-6 rounded-3xl bg-[#f5f5f5] p-4
                shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                border border-gray-300/30
              "
            >
             <div
  className="topics-grid grid gap-6"
  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))" }}
>

                {currentTopics.map((t) => (
                  <TopicCard
                    key={t.id}
                    t={t}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onManage={handleManage}
                  />
                ))}
              </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mx-auto mt-6 rounded-[12px] border bg-white/85 backdrop-blur-md shadow">
                <div className="p-4 flex items-center justify-center gap-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold text-white ${
                      currentPage === 1
                        ? "bg-gray-400"
                        : "bg-[#56768f] hover:bg-[#223e4c]"
                    }`}
                  >
                    ← Zurück
                  </button>

                  <span>
                    Seite {currentPage} von {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold text-white ${
                      currentPage === totalPages
                        ? "bg-gray-400"
                        : "bg-[#56768f] hover:bg-[#223e4c]"
                    }`}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* === EDIT MODAL === */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Thema bearbeiten</h3>

            <input
              ref={titleInputRef}
              type="text"
              value={editThemaName}
              onChange={(e) => setEditThemaName(e.target.value)}
              maxLength={50}
              className="w-full border p-2 rounded mb-2"
            />

            <textarea
              value={editThemaDesc}
              onChange={(e) => setEditThemaDesc(e.target.value)}
              maxLength={60}
              className="w-full border p-2 rounded mb-4 h-24"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
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
                  } catch (err) {
                    alert("Fehler beim Aktualisieren");
                  }
                }}
                className="px-4 py-2 bg-[#56768f] text-white rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ADD MODAL === */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Neues Thema hinzufügen
            </h3>

            <input
              type="text"
              value={newThemaName}
              maxLength={50}
              onChange={(e) => setNewThemaName(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              placeholder="Titel"
            />

            <textarea
              value={newThemaDesc}
              maxLength={60}
              onChange={(e) => setNewThemaDesc(e.target.value)}
              className="w-full border p-2 rounded mb-4 h-24"
              placeholder="Beschreibung"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
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

                    await fetchTopics();

                    setIsAddModalOpen(false);
                    setNewThemaName("");
                    setNewThemaDesc("");
                  } catch (err) {
                    alert("Fehler beim Erstellen");
                  }
                }}
                className="px-4 py-2 bg-[#56768f] text-white rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Thema löschen</h2>

            <p className="text-gray-600 mb-6">
              Möchten Sie das Thema{" "}
              <span className="font-semibold">
                {selectedTopic?.title}
              </span>{" "}
              wirklich löschen?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700"
              >
                Abbrechen
              </button>

              <button
                onClick={async () => {
                  if (!selectedTopic) return;

                  try {
                    await deleteThema(selectedTopic.id);

                    setTopics((prev) =>
                      prev.filter((t) => t.id !== selectedTopic.id)
                    );

                    setShowDeleteModal(false);
                  } catch {
                    alert("Fehler beim Löschen");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
