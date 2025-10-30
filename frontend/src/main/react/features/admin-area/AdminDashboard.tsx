import { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { getAllQuestionNodes } from "@/api/questionApi";

// 🧩 Stats bleiben gleich
type Stat = { label: string; value: string; tone?: "positive" | "neutral" };
const STATS: Stat[] = [
  { label: "Themenschwerpunkte", value: "–", tone: "positive" },
  { label: "Gesamtfragen", value: "–", tone: "positive" },
  { label: "Aktive Nutzer", value: "89", tone: "positive" },
  { label: "Letzte Änderung", value: "Heute", tone: "neutral" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Themen dynamisch laden
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const nodes = await getAllQuestionNodes();

        // Gruppiere nach Thema + zähle Fragen
        const grouped = Object.values(
          nodes.reduce((acc: any, node: any) => {
            const thema = node.thema;
            if (!acc[thema.id]) {
              acc[thema.id] = {
                id: thema.id,
                title: thema.name,
                subtitle: thema.description,
                questions: 0,
              };
            }
            acc[thema.id].questions += 1;
            return acc;
          }, {})
        );

        setTopics(grouped);
      } catch (err) {
        console.error("❌ Fehler beim Laden der Themen:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="p-10 text-center text-gray-500 text-lg">
          ⏳ Themen werden geladen...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
        <header className="relative bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] pt-4 pb-4 px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{ top: "calc(var(--header-height) - 1px)", height: 0, boxShadow: "0 10px 16px -14px rgba(15,23,42,.18)" }}
        />

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
              Verwalten Sie Ihre Themenschwerpunkte und erstellen Sie finale Kataloge für Kunden
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 mt-1">
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#264555] text-white text-sm font-semibold shadow-md hover:bg-[#223e4c] focus:outline-none focus:ring-2 focus:ring-white/30 active:translate-y-px"
            onClick={() => navigate("/admin/adminPanel")}
          >
            <MinusSquare size={16} />
            <span>Admin-Panal</span>
          </button>
        </div>
      </header>

      {/* ====== Content ====== */}
      <div className="dashboard-content">
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

        {/* Topics */}
        <section className="topics-section">
          <div className="section-header">
            <h2>Themenschwerpunkte</h2>
            <button
              className="btn btn-caramel"
              onClick={() => alert("Funktion bald verfügbar")}
            >
              <Plus size={16} />
              <span>Neues Thema hinzufügen</span>
            </button>
          </div>

          <div className="topics-grid">
            {topics.map((t) => (
              <div className="topic-card card-v2 kind-business " key={t.id}>
                {/* Fragenanzahl */}
                <div className="absolute top-7 right-5 text-[14px] text-gray-500 font-medium">
                  {t.questions} Fragen
                </div>

                {/* Titel & Icon */}
                <div className="topic-title-row flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="bg-[#264555] p-2.5 rounded-xl shadow">
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
                  <button className="px-4 py-2 border rounded flex items-center justify-center gap-2 text-brand-navy text-sm hover:bg-green-50">
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
                          navigate(`/admin/catalogs/${t.id}/condition-editor`);
                        } else {
                          navigate(`/admin/catalogs`);
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
                      backgroundColor: "#264555",
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
      </div>

      {/* ====== Delete Modal ====== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thema löschen
            </h2>
            <p className="text-gray-600 mb-6 ">
              Sind Sie sicher, dass Sie das Thema{" "}
              <span className="font-semibold text-black">
                {selectedTopic?.title}
              </span>{" "}
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
                onClick={() => {
                  console.log("Thema gelöscht:", selectedTopic?.id);
                  setShowDeleteModal(false);
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
