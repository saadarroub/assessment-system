import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { getWorker, getAssignmentsByCompany, getWorkerCatalogScore } from "@/features/service/companyService";
import { getCatalogsWithModels } from "@/features/service/catalogService";
import { getReifegradModelById } from "@/api/reifegradModelApi";
import PdfExportModal from "@/features/admin-area/components/PdfExportModal";
import type { ExportOptions } from "@/features/admin-area/components/PdfExportModal";
import { generateCatalogPdf } from "@/features/admin-area/services/pdfExportService";
import type { PdfExportData } from "@/features/admin-area/services/pdfExportService";
import { getQuestionsTimeline } from "@/api/scoringApi";

import {
  ArrowLeft,
  FileText,
  ChevronRight,
  BarChart2,
  Search,
  Users,
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  score: number;
  completedSessions: number;
  totalSessions: number;
  sessionId?: string;   // ✅ hinzufügen
}



interface Catalog {
  id: string;
  name: string;
  date: string;        // assignedAt oder "–"
  overallScore: number; // percentageScore 0-100
  topics: Topic[];
  reifegradModelId?: string | null;
}

interface EmployeeData {
  id: string;
  name: string;
  workSpaceRef?: string;
  email?: string;
  catalogs: Catalog[];
}



// HSL-Token-Fallbacks (wie in deiner UsersPage)
const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
  primary: "hsl(var(--primary,205 35% 24%))",
  primaryFg: "hsl(var(--primary-foreground,0 0% 98%))",
  muted: "hsl(var(--muted,210 40% 97%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

export default function EmployeeCatalogsPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(
    null
  );

  // PDF Export Modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);

  // Suche
  const [q, setQ] = useState("");

  // Pagination (wie UsersPage)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => {
    if (!workerId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) Worker holen (liefert companyId)
        const w = await getWorker(workerId);

        // 2) Assignments der Company holen und auf Worker filtern
        const all = await getAssignmentsByCompany(w.companyId);
        const mine = (all ?? []).filter((a) => String(a.worker?.id) === String(workerId));

        // 3) Unique Catalogs bauen
        const catalogMap = new Map<string, { id: string; title: string; assignedAt?: string }>();
        for (const a of mine) {
          const cid = a.catalog?.id;
          if (!cid) continue;
          if (!catalogMap.has(cid)) {
            catalogMap.set(cid, {
              id: cid,
              title: a.catalog?.title ?? "–",
              assignedAt: a.assignedAt,
            });
          }
        }

        const catalogEntries = Array.from(catalogMap.values());

        // 4) Alle Kataloge mit Reifegrad-Info holen
        const catalogsWithModels = await getCatalogsWithModels().catch(() => []);
        const modelMap = new Map<string, string | null>();
        catalogsWithModels.forEach((c) => {
          modelMap.set(c.id, c.reifegradModelId || null);
        });

        // 5) Pro Catalog: Worker-Score + ThemaScores holen
        const catalogs: Catalog[] = await Promise.all(
          catalogEntries.map(async (c) => {
            const score = await getWorkerCatalogScore(workerId, c.id).catch(() => null);

            return {
              id: c.id,
              name: c.title ?? score?.catalogTitle ?? "–",
              date: c.assignedAt ? new Date(c.assignedAt).toLocaleDateString("de-DE") : "–",
              overallScore: Math.round(score?.percentageScore ?? 0),
              reifegradModelId: modelMap.get(c.id) || null,
              topics: (score?.themaScores ?? []).map((t) => ({
                id: t.themaId,
                name: t.themaName,
                score: Math.round(t.percentageScore ?? 0),
                completedSessions: Number(t.completedSessions ?? 0),
                totalSessions: Number(t.totalSessions ?? 0),
                sessionId: t.sessionId,
              })),
            };
          })
        );

        if (!alive) return;

        setEmployee({
          id: w.id,
          name: w.name ?? w.email ?? "–",
          workSpaceRef: w.workSpaceRef,
          email: w.email,
          catalogs,
        });
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setEmployee(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [workerId]);

  const openExportModal = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setExportModalOpen(true);
  };

  const handleAdvancedExport = async (options: ExportOptions) => {
    if (!selectedCatalog || !employee) return;

    try {
      // Fetch session data for all topics if answers are included
      let sessionData: any[] | undefined;
      if (options.includeAnswers) {
        const sessionsWithData = await Promise.all(
          selectedCatalog.topics
            .filter((t) => t.sessionId)
            .map(async (topic) => {
              try {
                const timeline = await getQuestionsTimeline(topic.sessionId!);
                return {
                  sessionId: topic.sessionId!,
                  themaName: topic.name,
                  totalScore: timeline.totalScore,
                  maxPossibleScore: timeline.maxPossibleScore,
                  percentageScore: timeline.percentageScore,
                  questions: timeline.questions,
                };
              } catch (e) {
                console.error(`Failed to load session ${topic.sessionId}:`, e);
                return null;
              }
            })
        );
        sessionData = sessionsWithData.filter((s) => s !== null);
      }

      // Fetch Reifegrad model if catalog has one
      let reifegradModel = undefined;
      if (selectedCatalog.reifegradModelId) {
        try {
          reifegradModel = await getReifegradModelById(selectedCatalog.reifegradModelId);
        } catch (e) {
          console.error("Failed to load Reifegrad model:", e);
        }
      }

      const exportData: PdfExportData = {
        employee: {
          id: employee.id,
          name: employee.name,
          workSpaceRef: employee.workSpaceRef,
          email: employee.email,
        },
        catalog: selectedCatalog,
        sessionData,
        reifegradModel,
        options,
      };

      await generateCatalogPdf(exportData);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("PDF Export fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }
  };

  const filteredCatalogs = useMemo(() => {
    if (!employee) return [];
    const term = q.trim().toLowerCase();
    if (!term) return employee.catalogs.slice();

    return employee.catalogs.filter((c) => {
      const inCatalog = c.name.toLowerCase().includes(term);
      const inTopics = c.topics.some((t) => t.name.toLowerCase().includes(term));
      return inCatalog || inTopics;
    });
  }, [employee, q]);

  // Pagination derived (wie UsersPage)
  useEffect(() => {
    setPage(1);
  }, [q, pageSize, employee]);

  const total = filteredCatalogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filteredCatalogs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <AdminLayout>
      <PageHeader
        title={employee?.name ?? "Employee Catalogs"}
        subtitle={
          employee
            ? `Zugewiesene Kataloge (${employee.catalogs.length}) · Abteilung: ${employee.workSpaceRef}`
            : "Übersicht der zugewiesenen Kataloge"
        }
        icon={<BarChart2 size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/* ===== Top-Bar: Breadcrumb + Back Button ===== */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between gap-3">
          {/* Breadcrumb links – Pill */}
          <nav className="flex items-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                text-xs sm:text-sm
                bg-white/80
                backdrop-blur-[2px]
              "
              style={{ borderColor: BRAND.sand }}
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",
                  color: BRAND.navy,
                }}
              >
                <Users size={14} />
              </span>

              <Link
                to="/admin/adminPanel"
                className="hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                Admin Panel
              </Link>

              <span
                className="text-[11px] opacity-60"
                style={{ color: CSS.mutedFg }}
              >
                ›
              </span>

              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Employee Catalogs
              </span>
            </div>
          </nav>

          {/* Back rechts – Gold Pill */}
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            <ArrowLeft size={16} />
            <span>Zurück</span>
          </button>
        </div>

        {/* ===== Search + Count Card (wie UsersPage) ===== */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.gray }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Kataloge oder Themen…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
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
                  borderColor: BRAND.sand,
                  color: CSS.fg,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = BRAND.gold;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = BRAND.sand;
                }}
                disabled={loading}
              />
            </div>

            {/* Count Badge */}
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: BRAND.navy,
                  color: "white",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: BRAND.gold }}
                />
                <span>
                  Zeige{" "}
                  <span className="font-semibold">{filteredCatalogs.length}</span>{" "}
                  Kataloge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Content Card ===== */}
        <section
          className="
            max-w-[1400px] xl:max-w-[1600px]
            mx-auto
            rounded-[12px]
            border
            shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
            overflow-hidden
          "
          style={{
            borderColor: CSS.border,
            background: BRAND.fog,
          }}
        >
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {loading ? (
              <div className="rounded-xl bg-white border px-4 py-4" style={{ borderColor: CSS.border }}>
                Laden…
              </div>
            ) : !employee ? (
              <div className="rounded-xl bg-white border px-4 py-4" style={{ borderColor: CSS.border }}>
                Nicht gefunden
              </div>
            ) : filteredCatalogs.length === 0 ? (
              <div className="rounded-xl bg-white border px-4 py-10" style={{ borderColor: CSS.border }}>
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                    style={{ color: "hsla(200,32%,22%,0.65)" }}
                  >
                    <Search size={20} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold" style={{ color: CSS.fg }}>
                      {q.trim() ? "Keine Treffer für deine Suche" : "Keine Kataloge vorhanden"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-md">
                      {q.trim()
                        ? "Bitte passe den Suchbegriff an oder setze den Filter zurück."
                        : "Sobald Kataloge zugewiesen sind, erscheinen sie hier."}
                    </p>
                  </div>

                  {q.trim() && (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                    >
                      Filter zurücksetzen
                    </button>
                  )}
                </div>
              </div>
            ) : (
              pageData.map((catalog) => {
                const expanded = expandedCatalogId === catalog.id;

                const scoreTone =
                  catalog.overallScore >= 80
                    ? { bg: "rgba(34,197,94,0.12)", fg: "rgb(22,101,52)" }
                    : catalog.overallScore >= 60
                      ? { bg: "rgba(245,158,11,0.14)", fg: "rgb(146,64,14)" }
                      : { bg: "rgba(239,68,68,0.14)", fg: "rgb(153,27,27)" };

                return (
                  <div
                    key={catalog.id}
                    className="
                      bg-white
                      border
                      rounded-2xl
                      overflow-hidden
                      shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                    "
                    style={{ borderColor: CSS.border }}
                  >
                    {/* Catalog Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCatalogId(expanded ? null : catalog.id)
                      }
                      className="
                        w-full
                        text-left
                        p-5 sm:p-6
                        flex flex-col gap-4
                        md:flex-row md:items-center md:justify-between
                        hover:bg-[#fff9ec]
                        transition
                      "
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-full"
                          style={{
                            background: "rgba(38,69,85,0.06)",
                            color: BRAND.navy,
                          }}
                        >
                          <FileText size={22} />
                        </div>

                        <div>
                          <h2 className="text-base sm:text-lg font-bold" style={{ color: CSS.fg }}>
                            {catalog.name}
                          </h2>
                          <p className="text-xs sm:text-sm" style={{ color: CSS.mutedFg }}>
                            Erstellt: {catalog.date} • {catalog.topics.length} Themen
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-end">
                        {/* Score Badge */}
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                          style={{ background: scoreTone.bg, color: scoreTone.fg }}
                        >
                          <span className="font-bold">{catalog.overallScore}%</span>
                          <span className="opacity-80">Gesamt</span>
                        </div>

                        {/* Export Button (Gold Style wie UsersPage View) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openExportModal(catalog);
                          }}
                          disabled={!catalog.topics.every(t => t.completedSessions === t.totalSessions)}
                          className="
                            inline-flex items-center gap-2
                            rounded-full
                            px-3.5 py-2
                            text-[12px] sm:text-sm font-semibold
                            focus:outline-none
                            transition
                            hover:-translate-y-[0.5px]
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                          style={{
                            background: "hsl(40,60%,63%)",
                            color: "hsl(200,32%,22%)",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
                            border: "1px solid rgba(255,255,255,0.9)",
                          }}
                          title={!catalog.topics.every(t => t.completedSessions === t.totalSessions) ? "Export nur verfügbar wenn alle Themen abgeschlossen sind" : ""}
                        >
                          <FileText size={15} />
                          <span>PDF Export</span>
                        </button>

                        <ChevronRight
                          size={20}
                          className={`transition-transform ${expanded ? "rotate-90" : ""
                            }`}
                          style={{ color: "#b0b0b0" }}
                        />
                      </div>
                    </button>

                    {/* Expanded Topics */}
                    {expanded && (
                      <div
                        className="border-t p-5 sm:p-6"
                        style={{
                          borderColor: CSS.border,
                          background:
                            "linear-gradient(to bottom, rgba(235,235,236,0.65), rgba(255,255,255,1))",
                        }}
                      >
                        <h3
                          className="text-xs font-bold uppercase tracking-[0.08em] mb-4"
                          style={{ color: CSS.mutedFg }}
                        >
                          Enthaltene Themen & Sessions
                        </h3>

                        <div className="space-y-3">
                          {catalog.topics.map((topic) => {
                            const topicTone =
                              topic.score >= 80
                                ? "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                                : topic.score >= 60
                                  ? "bg-[rgb(254,243,199)] text-[rgb(146,64,14)]"
                                  : "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]";

                            return (
                              <div
                                key={topic.id}
                                className="
                                  bg-white
                                  border
                                  rounded-xl
                                  px-4 py-3
                                  flex flex-col gap-3
                                  sm:flex-row sm:items-center sm:justify-between
                                  hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]
                                  transition
                                "
                                style={{ borderColor: CSS.border }}
                              >
                                <div className="flex items-center gap-3">
                                  <BarChart2 size={18} style={{ color: BRAND.steel }} />
                                  <span className="font-semibold" style={{ color: CSS.fg }}>
                                    {topic.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${topicTone}`}
                                  >
                                    {topic.score}%
                                  </span>

                                  {topic.sessionId && (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/app/results/${topic.sessionId}`)}
                                      className="
                                        inline-flex items-center gap-1.5
                                        rounded-full border
                                        px-3 py-1.5
                                        text-[12px] font-semibold
                                        transition
                                        hover:bg-[#f5f0e4]
                                      "
                                      style={{
                                        borderColor: BRAND.sand,
                                        color: BRAND.navy,
                                        background: "#ffffff",
                                      }}
                                    >
                                      <Search size={14} />
                                      <span>Analyse ansehen</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ===== Pagination (wie UsersPage) ===== */}
        {!loading && employee && filteredCatalogs.length > 0 && (
          <div
            className="
              max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4
              rounded-[18px] border
              px-4 py-3 md:px-5 md:py-3
              shadow-[0_10px_30px_rgba(0,0,0,0.06)]
            "
            style={{
              background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
              borderColor: BRAND.sand,
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Range-Info */}
              <div className="text-xs sm:text-sm" style={{ color: BRAND.gray }}>
                Zeige{" "}
                <span className="font-semibold" style={{ color: BRAND.navy }}>
                  {startIdx}
                </span>
                –
                <span className="font-semibold" style={{ color: BRAND.navy }}>
                  {endIdx}
                </span>{" "}
                von{" "}
                <span className="font-semibold" style={{ color: BRAND.navy }}>
                  {total}
                </span>{" "}
                Einträgen
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm" style={{ color: BRAND.gray }}>
                    Anzahl der Zeilen pro Seite
                  </span>

                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="
                        h-9 min-w-[72px]
                        rounded-full
                        border
                        bg-white
                        px-3 pr-8
                        text-sm font-medium
                        outline-none
                        appearance-none
                        shadow-sm
                        focus:ring-2
                      "
                      style={{
                        borderColor: BRAND.sand,
                        color: BRAND.navy,
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <span
                      className="
                        pointer-events-none
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-[10px]
                      "
                      style={{ color: "#b0b0b0" }}
                    >
                      ▾
                    </span>
                  </div>
                </div>

                {/* Page badge */}
                <span
                  className="
                    inline-flex items-center
                    rounded-full
                    px-3 py-1.5
                    text-xs sm:text-sm font-semibold
                  "
                  style={{ background: BRAND.navy, color: "white" }}
                >
                  Seite {page} von {totalPages}
                </span>

                {/* Arrows */}
                <div className="flex items-center gap-1">
                  {[
                    {
                      label: "«",
                      onClick: () => setPage(1),
                      disabled: page <= 1 || total === 0,
                    },
                    {
                      label: "‹",
                      onClick: () => setPage((p) => Math.max(1, p - 1)),
                      disabled: page <= 1 || total === 0,
                    },
                    {
                      label: "›",
                      onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                      disabled: page >= totalPages || total === 0,
                    },
                    {
                      label: "»",
                      onClick: () => setPage(totalPages),
                      disabled: page >= totalPages || total === 0,
                    },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={btn.onClick}
                      disabled={btn.disabled}
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-full border text-xs sm:text-sm font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition
                      "
                      style={{
                        borderColor: BRAND.sand,
                        color: BRAND.navy,
                        background: "#ffffff",
                      }}
                      onMouseEnter={(e) => {
                        if (!btn.disabled) {
                          e.currentTarget.style.background = "#fff9ec";
                          e.currentTarget.style.borderColor = BRAND.gold;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = BRAND.sand;
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PDF Export Modal */}
      {selectedCatalog && (
        <PdfExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          catalogName={selectedCatalog.name}
          hasReifegradModel={!!selectedCatalog.reifegradModelId}
          onExport={handleAdvancedExport}
        />
      )}
    </AdminLayout>
  );
}
