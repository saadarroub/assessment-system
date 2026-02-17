import React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/admin.css";
import AdminLayout from "@/shared/app/AdminLayout";
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
  Network,
} from "lucide-react";

// API
import {
  getAllQuestionNodes,
  getAllThemas,
  createThema,
  duplicateThema,
  changeThemaStatus,
} from "@/shared/service/api/questionApi";

// TYPES
type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  color?: string;
  status: "active" | "inactive";
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

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

  function HeaderStat({
    label,
    value,
    color,
    icon,
    onClick,
  }: {
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }) {
    // SICHTBARER, EDLER GLOW 
    const accentBg = `linear-gradient(135deg, ${color}40, ${color}10)`;

    return (
      <div
        onClick={onClick}
        className={`
        group
        relative overflow-hidden
        rounded-2xl border
        px-4 py-4
        shadow-[0_8px_22px_rgba(0,0,0,0.06)]
        transition
        ${onClick
            ? "cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_16px_38px_rgba(0,0,0,0.10)]"
            : ""
          }
      `}
        style={{
          borderColor: "#E5E7EB",
          background:
            "radial-gradient(circle at 0 0, rgba(255,255,255,0.7) 0, transparent 55%)," +
            "radial-gradient(circle at 120% 0, rgba(0,0,0,0.03) 0, transparent 55%)," +
            "#ffffff",
        }}
      >
        {/*  GLOW oben rechts  */}
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-70 blur-sm transition group-hover:opacity-100"
          style={{ background: accentBg }}
        />

        {/* CONTENT */}
        <div className="relative flex items-center justify-between gap-3">
          {/* LEFT */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
              />
              <span className="text-slate-500">{label}</span>
            </div>

            <div className="text-3xl font-extrabold leading-none text-[#264555]">
              {value.toLocaleString("de-DE")}
            </div>
          </div>

          {/* RIGHT ICON */}
          <div
            className="
            flex h-12 w-12 items-center justify-center
            rounded-2xl border
            bg-white/90
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
            style={{ borderColor: color, color }}
          >
            {React.cloneElement(icon as any, { size: 26 })}
          </div>
        </div>
      </div>
    );
  }


  // Flash Animation für neue Themen 
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

    // BADGE 
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

      // Sortieren nach Datum 
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

    // Filter nach active / inactive
    if (topicFilter === "active") {
      result = result.filter((t) => t.status === "active");
    }

    if (topicFilter === "inactive") {
      result = result.filter((t) => t.status === "inactive");
    }

    // Suche anwenden
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
  const handleDeleteSuccess = useCallback((t: Topic) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== t.id));
  }, []);

  const handleEditSuccess = useCallback((t: Topic) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === t.id
          ? {
            ...topic,
            title: t.title,
            subtitle: t.subtitle,
          }
          : topic
      )
    );
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

      //Animation auslösen
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
      {/* CSS Animations */}
      <style>
        {`
          @keyframes blinkBg {
            0%, 100% { background-color: #ffffff; }
            50%       { background-color: #d1fae5; }  /* Intensiveres Grün */
          }
          @keyframes glowRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }  /* Stärkerer Glow */
            50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0.0); }  /* Größerer Ring */
          }
        `}
      </style>

      {/* HEADER */}

      <PageHeader
        title="Fragenkatalog Administration"
        subtitle="Verwalten Sie Ihre Themen und erstellen Sie finale Kataloge"
        icon={<Network size={40} />}
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
              
              "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
          }}
        >
        {/* Top-Bar: Admin-Panel Button links + Neues Thema Button rechts */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          {/* Admin-Panel Button links  */}
          <nav className="flex items-center">
            <button
              onClick={() => navigate("/admin/adminPanel")}
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                text-xs sm:text-sm
                bg-white/80
                backdrop-blur-[2px]
                hover:bg-white
                transition
              "
              style={{ borderColor: "#d2c9b9" }}
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",
                  color: "#264555",
                }}
              >
                <MinusSquare size={14} />
              </span>
              <span className="font-semibold" style={{ color: "#264555" }}>
                Admin-Panel
              </span>
            </button>
          </nav>

          {/* Neues Thema Button rechts  */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Neues Thema"
            className="
              inline-flex items-center gap-2
              rounded-full
              px-4 py-2
              text-sm font-semibold
              focus:outline-none
              transition
              hover:-translate-y-[1px]
            "
            style={{
              background: "hsl(40,60%,63%)",
              color: "hsl(200,32%,22%)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <Plus size={16} />
            <span>Neues Thema</span>
          </button>
        </div>

        {/* STATS */}
        <section className="mb-4">
          <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] grid grid-cols-4 gap-6">
            <HeaderStat
              label="Themen"
              value={topics.length}
              color="#E3BB62"
              icon={<Layers size={26} />}
              onClick={() => setTopicFilter("all")}
            />

            <HeaderStat
              label="Aktive Themen"
              value={topics.filter((t) => t.status === "active").length}
              color="#38bdf8"
              icon={<Users size={22} />}
              onClick={() => setTopicFilter("active")}
            />

            <HeaderStat
              label="Inaktive Themen"
              value={topics.filter((t) => t.status === "inactive").length}
              color="#64748b"
              icon={<Clock size={26} />}
              onClick={() => setTopicFilter("inactive")}
            />

            <HeaderStat
              label="Gesamtfragen"
              value={topics.reduce((s, t) => s + (t.questions || 0), 0)}
              color="#d2c9b9"
              icon={<ListOrdered size={10} />}
            />
          </div>
        </section>

        {/* THEMEN */}

        <section className="topics-section mt-4">
          <div className="section-header max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3">
            <h2>Themen</h2>
          </div>

          {/* SEARCH */}
          <div
            className="
              max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
              rounded-[18px] border
              px-4 py-3 md:px-5 md:py-4
              shadow-[0_10px_30px_rgba(0,0,0,0.06)]
            "
            style={{
              background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
              borderColor: "#d2c9b9",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
              {/* Suche */}
              <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#808080" }}
                >
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  placeholder="Suche Thema…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full h-10 md:h-11
                    rounded-[999px]
                    border
                    pl-10 pr-4
                    text-sm
                    outline-none
                    transition
                    bg-white
                  "
                  style={{
                    borderColor: "#d2c9b9",
                    color: "#264555",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(227,187,98,0.75)";
                    e.currentTarget.style.borderColor = "#E3BB62";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                    e.currentTarget.style.borderColor = "#d2c9b9";
                  }}
                />
              </div>

              {/* Zähler rechts – dezente Badge */}
              <div className="flex items-center gap-3">
                <div
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    px-3 md:px-4 py-1.5
                    text-xs md:text-sm font-medium
                  "
                  style={{
                    background: "#264555",
                    color: "white",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "#E3BB62" }}
                  />
                  <span>
                    Zeige{" "}
                    <span className="font-semibold">
                      {filteredTopics.length}
                    </span>{" "}
                    Themen
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto">
            <div
              className="
    rounded-3xl bg-[hsl(45_40%_96%)] p-5
    shadow-[0_4px_20px_rgba(0,0,0,0.05)]
    border border-gray-300/30
  "
            >

              <div
                className="grid grid-cols-4 gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
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
                              "ring-2 ring-green-400 ring-offset-2",
                              "[animation:glowRing_0.8s_ease-in-out_infinite]",
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
                          onDeleteSuccess={handleDeleteSuccess}
                          onEditSuccess={handleEditSuccess}
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
          </div>
        </section>
      </main>

      {/* ADD MODAL  */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="w-full max-w-xl px-4 sm:px-0">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* Deko-Glows */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                  Neues Thema hinzufügen
                </h3>

                <form className="space-y-4">
                  {/* TITEL */}
                  <div>
                    <label
                      htmlFor="add-title"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Titel <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="add-title"
                      rows={1}
                      maxLength={70}
                      value={newThemaName}
                      onChange={(e) => {
                        setNewThemaName(e.target.value);

                        //Auto-Resize
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      placeholder="Titel eingeben..."
                      className="
    w-full
    rounded-xl
    border
    px-3 py-2.5
    text-sm
    bg-slate-50
    border-slate-200
    outline-none
    resize-none
    overflow-hidden
    leading-snug
    break-words
    overflow-wrap-anywhere
    focus:bg-white
    focus:border-[#E3BB62]
    focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
    transition
  "
                    />

                  </div>

                  {/* BESCHREIBUNG */}
                  <div>
                    <label
                      htmlFor="add-desc"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="add-desc"
                      value={newThemaDesc}
                      onChange={(e) => setNewThemaDesc(e.target.value)}
                      placeholder="Beschreibung eingeben..."
                      rows={3}
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Buttons außerhalb des Modals */}
            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="
                  flex-1
                  h-12
                  text-sm font-medium
                  text-slate-800
                  bg-[#f3f3f3]
                  hover:bg-[#e5e5e5]
                  border border-slate-200
                  rounded-xl
                  disabled:opacity-60
                  transition
                "
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!newThemaName.trim()) {
                    showError("Titel darf nicht leer sein!");
                    return;
                  }
                  try {
                    // IDs VOR dem Anlegen merken
                    const beforeIds = new Set(topics.map((t) => t.id));

                    await createThema({
                      name: newThemaName,
                      description: newThemaDesc,
                    });

                    await fetchTopics();

                    // erstellte ID ermitteln und Animation auslösen
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
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
