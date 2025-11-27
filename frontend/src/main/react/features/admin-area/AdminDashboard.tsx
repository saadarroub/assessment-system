import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/admin.css";
import AdminLayout from "@/apps/app/AdminLayout";
import TopicCard from "./TopicCard";
import { useToast } from "@/shared/contexts/ToastContext";
import PageHeader from "./catalogs/PageHeader";

// Icons
import {
  Plus,
  MinusSquare,
  Search,
  Layers,
  ListOrdered,
  Users,
  Clock,
  ChevronRight,Network    
} from "lucide-react";

// API
import {
  getAllQuestionNodes,
  getAllThemas,
  createThema,
  deleteThema,
  updateThema,
  duplicateThema,
  changeThemaStatus,
} from "@/api/questionApi";

// TYPES
type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  color?: string;
  status: "active" | "inactive";
};

// STATS

const STAT_COLORS = ["#808080", "#56768f", "#264555", "#d2c9b9"];

const STAT_ICONS = [
  <Layers size={48} />,

  <Users size={48} />,
  <Clock size={48} />,
  <ListOrdered size={48} />,
];

const STATS = [
  { label: "Themen", key: "total" },

  { label: "Aktive Themen", key: "active" },
  { label: "Inaktive Themen", key: "inactive" },
  { label: "Gesamtfragen", key: "questions" },
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
  const { showSuccess, showError } = useToast();
  const [topicFilter, setTopicFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );

  // Animation States (wie KatalogeZuweisen)
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [badgeIds, setBadgeIds] = useState<Set<string>>(new Set());

  // Modal Input Referenz
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Flash Animation für neue Themen (wie KatalogeZuweisen)
  function flashNew(ids: string[], glowMs = 4000, badgeMs = 60000) {
    // HIGHLIGHT (grüner Glow)
    setHighlightIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    window.setTimeout(() => {
      setHighlightIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, glowMs);

    // BADGE (NEU)
    setBadgeIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    window.setTimeout(() => {
      setBadgeIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, badgeMs);
  }

  // Farben Rotation
  const TOPIC_COLORS = useMemo(() => ["#264555", "#56768f"], []);

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
          status: thema.status,
          createdAt: thema.createdAt,
        };
      });

      // 🔥 NEU: Sortieren nach Datum (neuste zuerst)
      grouped.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTopics(grouped);
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
    let result = topics;

    // ⭐ Filter nach active / inactive
    if (topicFilter === "active") {
      result = result.filter((t) => t.status === "active");
    }

    if (topicFilter === "inactive") {
      result = result.filter((t) => t.status === "inactive");
    }

    // ⭐ Suche anwenden
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.subtitle.toLowerCase().includes(term)
      );
    }

    return result;
  }, [topics, searchTerm, topicFilter]);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(6);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const currentTopics = useMemo(
    () => filteredTopics.slice(0, visibleCount),
    [filteredTopics, visibleCount]
  );

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 6);
      }
    });

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [filteredTopics]);

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
        const hasQuestions = nodes.some((n) => n.thema && n.thema.id === t.id);

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

  const handleDuplicate = useCallback(async (t: Topic) => {
    try {
      const newThema = await duplicateThema(t.id);

      // Thema in UI einfügen (ganz oben wie original)
      setTopics((prev) => [
        {
          id: newThema.id,
          title: newThema.name,
          subtitle: newThema.description,
          questions: 0,
          color: prev[0]?.color || "#264555",
          status: newThema.status,
        },
        ...prev,
      ]);

      // 🎉 Animation auslösen
      flashNew([newThema.id], 4000, 60000);

      showSuccess("Thema erfolgreich dupliziert!");
    } catch (err) {
      showError("Fehler: Thema konnte nicht dupliziert werden.");
    }
  }, []);

  const handleStatusChange = useCallback(async (id: string) => {
    try {
      const updated = await changeThemaStatus(id);

      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: updated.status } : t))
      );
      showSuccess("Status erfolgreich geändert!");
    } catch (err) {
      showError("Fehler: Status konnte nicht geändert werden.");
    }
  }, []);

  // ⭐ Minimal Skeleton nur für den Zahlenwert (hell-blau)
  function StatValueSkeleton() {
    return (
      <span className="inline-block h-3 w-16 rounded bg-[#cdd9e3] animate-pulse"></span>
    );
  }

  function TopicCardSkeleton() {
    return (
      <div className="bg-white rounded-xl shadow p-5 h-[250px] animate-pulse flex flex-col gap-4">
        <div className="h-6 w-40 bg-gray-300/60 rounded"></div>
        <div className="h-4 w-64 bg-gray-300/50 rounded"></div>
        <div className="h-4 w-52 bg-gray-300/40 rounded"></div>
        <div className="mt-auto h-8 w-32 bg-gray-300/60 rounded"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* CSS Animations (wie KatalogeZuweisen) */}
      <style>
        {`
          @keyframes blinkBg {
            0%, 100% { background-color: #ffffff; }
            50%       { background-color: #d1fae5; }  /* Intensiveres Grün */
          }
          @keyframes glowRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }  /* Stärkerer Glow */
            50%      { box-shadow: 0 0 0 16px rgba(34,197,94,0.0); }  /* Größerer Ring */
          }
        `}
      </style>

      {/* HEADER */}
     <PageHeader
      
  title="Fragenkatalog Administration"
  subtitle="Verwalten Sie Ihre Themen und erstellen Sie finale Kataloge"
  icon={<Network  size={40} />}
  gradient="navy"
  height="280px"
  showPattern={true}
 
/>


      {/* BODY */}
      <div className="dashboard-content bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] px-6 py-6">
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
                onClick={() => {
                  if (s.key === "questions") return;
                  if (s.key === "active") setTopicFilter("active");
                  else if (s.key === "inactive") setTopicFilter("inactive");
                  else setTopicFilter("all");
                }}
                className={`
   group
  relative h-[110px] rounded-2xl 
  shadow-[0_4px_16px_rgba(0,0,0,0.15)]
  overflow-hidden p-5 flex flex-col justify-between
  transition-all duration-300

  ${s.key !== "questions" ? "hover:bg-white/20 hover:brightness-125" : ""}

  ${s.key === "questions" ? "" : "cursor-pointer"}
`}
                style={{ backgroundColor: STAT_COLORS[i] }}
              >
                {/* ICON */}
                <div
                  className="absolute right-3 bottom-3 opacity-[0.18] transition-all duration-200"
                  style={{ color: "white" }}
                >
                  {/* Default Icon */}
                  <div
                    className={`${
                      s.key !== "questions" ? "group-hover:hidden" : ""
                    }`}
                  >
                    {STAT_ICONS[i]}
                  </div>

                  {/* Hover: >> Icon */}
                  {s.key !== "questions" && (
                    <div className="hidden group-hover:flex absolute right-0 bottom-0 items-center">
                      <ChevronRight size={48} className="-mr-8" />
                      <ChevronRight size={48} />
                    </div>
                  )}
                </div>

                {/* LABEL */}
                <p
                  className={`text-sm font-medium ${
                    s.key === "questions" ? "text-black" : "text-white"
                  }`}
                >
                  {s.label}
                </p>

                {/* VALUE (mit Skeleton nur während loading) */}
                <p className="text-white text-4xl font-extrabold">
                  {loading ? (
                    <StatValueSkeleton />
                  ) : s.key === "total" ? (
                    topics.length
                  ) : s.key === "questions" ? (
                    topics.reduce((sum, t) => sum + (t.questions || 0), 0)
                  ) : s.key === "active" ? (
                    topics.filter((t) => t.status === "active").length
                  ) : s.key === "inactive" ? (
                    topics.filter((t) => t.status === "inactive").length
                  ) : (
                    "–"
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* THEMEN */}

        <section className="topics-section">
          <div className="section-header">
            <h2>Themen</h2>
            <button
              className="btn btn-caramel"
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: "hsl(40,60%,63%)", // Gelb
                color: "hsl(200,32%,22%)", // dunkles Blau-Grau
                boxShadow: "0 1px 2px rgba(0,0,0,.05)",
              }}
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
                <span className="font-semibold">{filteredTopics.length}</span>{" "}
                Themen
              </div>
            </div>
          </div>

          {/* GRID (optimiert + lazy render) */}
          <div
            className="
                mt-6 rounded-3xl bg-[#f5f5f5] p-3
                shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                border border-gray-300/30
              "
          >
            <div
              className="grid grid-cols-4 gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              }}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TopicCardSkeleton key={i} />
                ))
              ) : currentTopics.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                  <Layers size={48} className="opacity-40" />
                  <p className="mt-4 text-lg font-medium">
                    Noch keine Themen vorhanden
                  </p>
                </div>
              ) : (
                currentTopics.map((t) => {
                  const isHighlight = highlightIds.has(t.id);
                  const isBadge = badgeIds.has(t.id);

                  return (
                    <div
                      key={t.id}
                      className={[
                        "relative",
                        isHighlight
                          ? [
                             
                              "ring-4 ring-green-400 ring-offset-4",
                             
                              "[animation:glowRing_.9s_ease-in-out_infinite]",
                            ].join(" ")
                          : "",
                        "transition-transform duration-300 ease-out rounded-xl",
                      ].join(" ")}
                    >
                      {isBadge && (
                        <span className="absolute -left-1 -top-1 z-10 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                          Neu
                        </span>
                      )}

                      <TopicCard
                        t={t}
                        loading={loading}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onManage={handleManage}
                        onDuplicate={handleDuplicate}
                        onStatusChange={() => handleStatusChange(t.id)}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Lazy Loading Trigger */}
            <div ref={loaderRef}></div>
          </div>
        </section>
      </div>

      {/* === EDIT MODAL === */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Thema bearbeiten
            </h3>

            {/* TITEL */}
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-black-600 mb-1">
                Titel
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={editThemaName}
                onChange={(e) => setEditThemaName(e.target.value)}
                maxLength={70}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#56768f]"
              />
            </div>

            {/* BESCHREIBUNG */}
            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-black-600 mb-1">
                Beschreibung
              </label>
              <textarea
                value={editThemaDesc}
                onChange={(e) => setEditThemaDesc(e.target.value)}
                className="w-full border rounded-md p-2 h-24 resize-none focus:ring-2 focus:ring-[#56768f]"
              />
            </div>

            {/* ACTION BUTTONS */}
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
                    showSuccess("Thema erfolgreich aktualisiert!");

                    setIsEditModalOpen(false);
                  } catch (err) {
                    showError(
                      "Fehler: Thema konnte nicht aktualisiert werden."
                    );
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
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Neues Thema hinzufügen
            </h3>

            {/* TITEL LABEL */}
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={newThemaName}
              maxLength={70}
              onChange={(e) => setNewThemaName(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 focus:ring-2 focus:ring-[#56768f]"
              placeholder="Titel eingeben..."
            />

            {/* BESCHREIBUNG LABEL */}
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={newThemaDesc}
              onChange={(e) => setNewThemaDesc(e.target.value)}
              className="w-full border p-2 rounded mb-5 min-h-[100px] resize-y focus:ring-2 focus:ring-[#56768f]"
              placeholder="Beschreibung eingeben..."
            />

            {/* BUTTONS */}
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
                    // IDs VOR dem Anlegen merken
                    const beforeIds = new Set(topics.map((t) => t.id));

                    await createThema({
                      name: newThemaName,
                      description: newThemaDesc,
                    });

                    await fetchTopics();

                    // Neu erstellte ID ermitteln und Animation auslösen
                    setTimeout(() => {
                      setTopics((currentTopics) => {
                        const newId = currentTopics.find(
                          (t) => !beforeIds.has(t.id)
                        )?.id;
                        if (newId) {
                          flashNew([newId], 4000, 60000);
                        }
                        return currentTopics;
                      });
                    }, 100);

                    setIsAddModalOpen(false);
                    setNewThemaName("");
                    setNewThemaDesc("");
                    showSuccess("Thema erfolgreich erstellt!");
                  } catch (err) {
                    showError("Fehler: Thema konnte nicht erstellt werden.");
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
              <span className="font-semibold">{selectedTopic?.title}</span>{" "}
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
                    showSuccess("Thema erfolgreich gelöscht!");

                    setShowDeleteModal(false);
                  } catch {
                    showError("Fehler: Thema konnte nicht gelöscht werden.");
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
