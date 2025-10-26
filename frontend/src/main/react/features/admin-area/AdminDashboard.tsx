// src/main/react/features/admin-area/AdminDashboard.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/admin.css";
import AdminLayout from "@/apps/app/AdminLayout";

import myLogo from "@/assets/Zero-6-icons-05.webp";
import {
  Plus,
  MinusSquare,
  Trash2,
  Edit3,
  ListPlus,
  Building2,
  BarChart3,
  ShoppingCart,
  FileText,
} from "lucide-react";

type Stat = { label: string; value: string; tone?: "positive" | "neutral" };
const STATS: Stat[] = [
  { label: "Themenschwerpunkte", value: "4", tone: "positive" },
  { label: "Gesamtfragen", value: "250", tone: "positive" },
  { label: "Aktive Nutzer", value: "89", tone: "positive" },
  { label: "Letzte Änderung", value: "Heute", tone: "neutral" },
];

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  catalog: string;
  questions: number;
  kind: "strategy" | "project" | "sourcing" | "business";
  slug: string;
};

const TOPICS: Topic[] = [
  {
    id: "t4",
    title: "IT Operating Model",
    subtitle: "Organisationsstrukturen und Prozesse",
    catalog: "Katalog 4",
    questions: 40,
    kind: "business",
    slug: "operating-model",
  },
  {
    id: "t1",
    title: "Enterprise Architecture Management",
    subtitle: "Strategische IT-Planung und -Ausrichtung",
    catalog: "Katalog 1",
    questions: 30,
    kind: "strategy",
    slug: "eam",
  },
  {
    id: "t2",
    title: "IT Sourcing",
    subtitle: "Beschaffung und Lieferantenmanagement",
    catalog: "Katalog 3",
    questions: 50,
    kind: "sourcing",
    slug: "sourcing",
  },
  {
    id: "t3",
    title: "IT Project Management",
    subtitle: "Projektplanung und -durchführung",
    catalog: "Katalog 2",
    questions: 50,
    kind: "project",
    slug: "project-management",
  },
];

const ICONS: Record<Topic["kind"], React.ReactNode> = {
  strategy: (
    <div className="bg-[#56768f] p-2.5 rounded-xl shadow">
      <BarChart3 size={18} className="text-white" />
    </div>
  ),
  project: (
    <div className="bg-brand-sand p-2.5 rounded-xl shadow">
      <FileText size={18} className="text-white" />
    </div>
  ),
  sourcing: (
    <div className="bg-[#264555] p-2.5 rounded-xl shadow">
      <ShoppingCart size={18} className="text-white" />
    </div>
  ),
  business: (
    <div className="bg-[#808080] p-2.5 rounded-xl shadow">
      <Building2 size={18} className="text-white" />
    </div>
  ),
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", subtitle: "" });
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [topics, setTopics] = useState(TOPICS);

  // 🧩 Lösch-Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  return (
    <AdminLayout>
      {/* ====== Hero ====== */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <img src={myLogo} alt="Dein Logo" />
          </div>
          <div className="header-center">
            <div className="header-text">
              <h1>Fragenkatalog Administration</h1>
              <p>
                Verwalten Sie Ihre Themenschwerpunkte und erstellen Sie finale
                Kataloge für Kunden
              </p>
            </div>
          </div>
          <div className="header-right" />
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
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
          <div className="grid grid-cols-4 gap-4 ">
            {STATS.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">{s.label}</p>
                    <p className="px-1 stat-value">{s.value}</p>
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
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Neues Thema hinzufügen</span>
            </button>
          </div>

          <div className="topics-grid">
            {topics.map((t) => (
              <div className={`topic-card card-v2 kind-${t.kind}`} key={t.id}>
                <div className="absolute top-7 right-5 text-[14px] text-gray-500 font-medium">
                  {t.questions} Fragen
                </div>

                {/* Titel & Emoji */}
                <div className="topic-title-row flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                    {ICONS[t.kind]}
                  </div>
                  <div className="topic-text">
                    <h3 className="topic-title font-semibold text-gray-900">
                      {t.title}
                    </h3>
                  </div>
                </div>

                {/* Untertitel */}
                <ul className="topic-bullets">
                  <li>{t.subtitle}</li>
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
                  {/* Bearbeiten */}
                  <button className="px-4 py-2 border rounded flex items-center justify-center gap-2 text-brand-navy text-sm hover:bg-green-50">
                    <Edit3 size={16} /> Bearbeiten
                  </button>

                  {/* Löschen */}
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
                  <Link
                    to={"/admin/catalogs"}
                    className={`
  flex-1 min-w-auto px-2 py-1 rounded flex items-center justify-center gap-2 hover:opacity-90 transition
`}
                    style={{
                      backgroundColor:
                        (t as any).color ||
                        (t.kind === "strategy"
                          ? "#56768f"
                          : t.kind === "project"
                          ? "#d2c9b9"
                          : t.kind === "sourcing"
                          ? "#264555"
                          : "#808080"),
                      color:
                        (t as any).color === "#d2c9b9" ? "#264555" : "#fff",
                    }}
                  >
                    <ListPlus size={16} /> Fragen verwalten
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ====== 🔥 Delete Modal ====== */}
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
              löschen möchtest?
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

      {/* 🧩 Modal – Neues Thema hinzufügen */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[85vh] flex flex-col p-8 relative">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Neues Thema hinzufügen
            </h2>

            {/* Titel */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Themenname<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTopic.title}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sand focus:outline-none"
                placeholder="z. B. IT Security Management"
              />
            </div>

            {/* Untertitel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Untertitel
              </label>
              <input
                type="text"
                value={newTopic.subtitle}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, subtitle: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sand focus:outline-none"
                placeholder="z. B. Schutz von IT-Systemen und Daten"
              />
            </div>

            {/* Farben */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farbthema<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-6 gap-3">
                {[
                  { name: "brand-navy", color: "#264555" },
                  { name: "brand-steel", color: "#56768f" },
                  { name: "brand-gray", color: "#808080" },
                  { name: "brand-sand", color: "#d2c9b9" },
                  { name: "brand-ice", color: "#ebebec" },
                  { name: "brand-gold", color: "#E3BB62" },
                ].map((c) => (
                  <div
                    key={c.name}
                    onClick={() => setSelectedColor(c.color)}
                    className={`w-10 h-10 rounded-lg cursor-pointer border-2 ${
                      selectedColor === c.color
                        ? "border-black scale-105"
                        : "border-transparent"
                    } transition-all`}
                    style={{ backgroundColor: c.color }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Icons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon auswählen<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { id: "file", icon: <FileText size={22} /> },
                  { id: "chart", icon: <BarChart3 size={22} /> },
                  { id: "building", icon: <Building2 size={22} /> },
                  { id: "cart", icon: <ShoppingCart size={22} /> },
                  { id: "folder", icon: <ListPlus size={22} /> },
                ].map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setSelectedIcon(i.id)}
                    className={`border rounded-lg p-2 flex justify-center items-center transition-all ${
                      selectedIcon === i.id
                        ? "bg-brand-sand text-white border-brand-sand"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Vorschau */}
            {selectedColor && selectedIcon && (
              <div
                className="rounded-lg shadow-md p-4 text-white mb-6 flex items-center gap-3"
                style={{ backgroundColor: selectedColor }}
              >
                <span className="text-lg">
                  {
                    {
                      file: <FileText size={24} />,
                      chart: <BarChart3 size={24} />,
                      building: <Building2 size={24} />,
                      cart: <ShoppingCart size={24} />,
                      folder: <ListPlus size={24} />,
                    }[selectedIcon]
                  }
                </span>
                <div>
                  <p className="font-semibold">
                    {newTopic.title || "Neues Thema"}
                  </p>
                  <p className="text-sm opacity-80">{newTopic.subtitle}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
              >
                Abbrechen
              </button>

              <button
                disabled={!newTopic.title || !selectedColor || !selectedIcon}
                onClick={() => {
                  const newId = Date.now().toString();
                  const newEntry = {
                    id: newId,
                    title: newTopic.title,
                    subtitle: newTopic.subtitle,
                    catalog: `Katalog ${topics.length + 1}`,
                    questions: 0,
                    kind: "business" as const,
                    slug: newTopic.title.toLowerCase().replace(/\s+/g, "-"),
                    color: selectedColor,
                    icon: selectedIcon,
                  };
                  setTopics([...topics, newEntry]);
                  setShowAddModal(false);
                  setNewTopic({ title: "", subtitle: "" });
                  setSelectedColor("");
                  setSelectedIcon(null);
                }}
                className="px-4 py-2 rounded-lg bg-brand-sand text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
