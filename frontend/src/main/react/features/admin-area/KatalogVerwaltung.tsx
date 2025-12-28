
import AdminLayout from "@/apps/app/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { Building2, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getThemen, type ThemaApi } from "../service/themaService";
import { getCatalogs, type CatalogApi } from "../service/catalogService";
import { assignTopicsToCatalog, getQuestionCountForThema } from "../service/themaCatalogService";
import { useNavigate } from "react-router-dom";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";


/* ----------------------------- Types & Models ----------------------------- */

type Topic = {
    id: string;
    name: string;
    subtitle?: string;
    icon?: LucideIcon;
    color?: string;
};

type CatalogItem = {
    id: string;
    name: string;
    subtitle?: string;
};

export type SaveCatalogPayload = {
    title: string;
    description?: string;
    topicIds: string[];
};

type Props = {
    onSave?: (payload: SaveCatalogPayload) => void;
};

/* --------------------------------- UI ------------------------------------ */

export default function KatalogVerwaltung({ }: Props) {
    /* ---------- Themen (rechts) ---------- */
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [topicError, setTopicError] = useState<string | null>(null);
    const [topicSearch, setTopicSearch] = useState("");

    /* ---------- Kataloge (links) ---------- */
    const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [catalogError, setCatalogError] = useState<string | null>(null);

    // Auswahl
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

    // Katalog-Dropdown
    const [openCatalogDropdown, setOpenCatalogDropdown] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState("");
    const catalogDropdownRef = useRef<HTMLDivElement | null>(null);

    // Map: ThemaId -> Fragenanzahl
    const [qCountByThema, setQCountByThema] = useState<Record<string, number>>({});


    const navigate = useNavigate();


    const DEFAULT_ICON: LucideIcon = Building2;
    const DEFAULT_COLOR = "#d2c9b9";

    // Tooltip state per Thema
    const [showTooltipFull, setShowTooltipFull] = useState<Map<string, boolean>>(
        new Map()
    );
    const hoverTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map()
    );
    const tooltipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    /* ---------- Themen laden ---------- */
    useEffect(() => {
        (async () => {
            try {
                setLoadingTopics(true);
                setTopicError(null);
                const apiList = await getThemen(); // GET /api/themas
                const ui: Topic[] = apiList.map((t: ThemaApi) => ({
                    id: t.id,
                    name: t.name,
                    subtitle: t.description ?? undefined,
                    icon: DEFAULT_ICON,
                    color: DEFAULT_COLOR,
                }));
                setTopics(ui.reverse());
            } catch (e) {
                console.error(e);
                setTopicError("Themen konnten nicht geladen werden.");
            } finally {
                setLoadingTopics(false);
            }
        })();
    }, []);

    /* ---------- Kataloge laden ---------- */
    useEffect(() => {
        (async () => {
            try {
                setLoadingCatalogs(true);
                setCatalogError(null);
                const res = await getCatalogs(); // GET /api/catalogs
                const apiList = Array.isArray(res) ? res : [];
                const ui: CatalogItem[] = apiList.map((c: CatalogApi) => ({
                    id: c.id,
                    name: c.title,
                    subtitle: c.description ?? undefined,
                }));
                setCatalogs(ui.reverse());
            } catch (e) {
                console.error(e);
                setCatalogError("Kataloge konnten nicht geladen werden.");
            } finally {
                setLoadingCatalogs(false);
            }
        })();
    }, []);

    /* ---------- Auswahl ---------- */
    function toggleTopic(id: string) {
        setSelectedTopicIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    const canSave = !!selectedCatalogId && selectedTopicIds.size > 0;

    async function handleSave() {
        if (!selectedCatalogId || selectedTopicIds.size === 0) return;
        try {
            await assignTopicsToCatalog(selectedCatalogId, Array.from(selectedTopicIds));
            alert('zuordnung erfolgreich');
            navigate("/admin/katalogzuweisen", { replace: true });
        } catch (e: any) {
            alert(`Zuordnung fehlgeschlagen: ${e?.message ?? e}`);
        }
    }
    // wenn Themen da sind. Er holt für jedes Thema die Zahl und trägt sie in die Map ein
    useEffect(() => {
        if (topics.length === 0) return;

        let aborted = false;

        (async () => {
            try {
                // Alle IDs der geladenen Themen
                const ids = topics.map(t => t.id);

                // Parallel laden
                const pairs = await Promise.all(
                    ids.map(async (id) => {
                        try {
                            const n = await getQuestionCountForThema(id);
                            return [id, n] as const;
                        } catch {
                            // Fallback: 0 bei Fehler
                            return [id, 0] as const;
                        }
                    })
                );

                if (aborted) return;

                setQCountByThema(Object.fromEntries(pairs));
            } catch (e) {
                console.error("Fragenanzahlen konnten nicht geladen werden.", e);
            }
        })();

        return () => { aborted = true; };
    }, [topics]);

    /* ---------- Tooltip Position Update beim Scrollen ---------- */
    useEffect(() => {
        function updateTooltipPositions() {
            tooltipRefs.current.forEach((tooltipEl, topicId) => {
                if (tooltipEl && showTooltipFull.get(topicId)) {
                    const cardElement = tooltipEl.closest(".group");
                    if (cardElement) {
                        const logoSpan = cardElement.querySelector(
                            'span[class*="absolute top-2 left-2"]'
                        ) as HTMLElement;
                        if (logoSpan) {
                            const rect = logoSpan.getBoundingClientRect();
                            const tooltipWidth = 288; // w-72 = 18rem = 288px
                            tooltipEl.style.top = `${rect.bottom + 8}px`;
                            tooltipEl.style.left = `${rect.left + rect.width / 2 - tooltipWidth / 2
                                }px`;
                        }
                    }
                }
            });
        }

        if (showTooltipFull.size > 0) {
            updateTooltipPositions();
            window.addEventListener("scroll", updateTooltipPositions, true);
            window.addEventListener("resize", updateTooltipPositions);
        }

        return () => {
            window.removeEventListener("scroll", updateTooltipPositions, true);
            window.removeEventListener("resize", updateTooltipPositions);
        };
    }, [showTooltipFull]);

    /* ---------- Gefilterte Kataloge ---------- */
    const filteredCatalogs = catalogs.filter((c: CatalogItem) => {
        const q = catalogSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            c.name.toLowerCase().includes(q) ||
            (c.subtitle && c.subtitle.toLowerCase().includes(q))
        );
    });

    // Gefilterte Themen
    const filteredTopics = topics.filter((t: Topic) => {
        const q = topicSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            t.name.toLowerCase().includes(q) ||
            (t.subtitle && t.subtitle.toLowerCase().includes(q))
        );
    });

    /* ------------------------------- RENDER -------------------------------- */

    /* ------------------------------- RENDER -------------------------------- */

    return (
        <AdminLayout>
            {/* HEADER */}
            <PageHeader
                title="Kataloginhalte ordnen"
                subtitle="Themen im Katalog anordnen und verwalten"
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
                        "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
                        "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
                }}
            >
                <div className="flex flex-col lg:flex-row gap-5 max-w-[1400px] xl:max-w-[1600px] mx-auto">
                    {/* Left: Katalog-Auswahl - FESTE BREITE */}
                    <div className="w-full lg:w-[520px] flex-shrink-0">
                        <div
                            className="relative rounded-2xl p-5"
                            style={{
                                background:
                                    "linear-gradient(180deg, #ffffff 0%, #ffffffff 100%)",
                                border: "1px solid rgba(227,187,98,0.35)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                style={{
                                    background:
                                        "radial-gradient(600px at 100% 0%, rgba(227,187,98,0.22), transparent 40%)",
                                }}
                            />

                            <h2 className="text-[18px] font-semibold text-slate-900">
                                Katalog auswählen
                            </h2>
                            <div className="mt-1 h-[3px] mb-3 w-16 rounded-full bg-gradient-to-r from-[#E3BB62] to-[#F2E3A2]" />

                            {catalogError && (
                                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {catalogError}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Katalog Dropdown */}
                                <div className="space-y-2 relative" ref={catalogDropdownRef}>
                                    <label className="text-sm font-medium text-slate-700">
                                        Katalog <span className="text-[#E3BB62]">*</span>
                                    </label>

                                    {/* Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setOpenCatalogDropdown((v) => !v)}
                                        disabled={loadingCatalogs}
                                        className="relative w-full h-11 rounded-xl border border-[#e5dcc7] bg-white
                                          px-3 pr-10 text-left text-sm cursor-pointer
                                          focus:outline-none focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]
                                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {selectedCatalogId ? (
                                            catalogs.find((c) => c.id === selectedCatalogId)?.name
                                        ) : (
                                            <span className="text-slate-400">
                                                {loadingCatalogs ? "Kataloge werden geladen…" : "Katalog auswählen…"}
                                            </span>
                                        )}

                                        {/* Chevron */}
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8f75]">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </span>
                                    </button>

                                    {/* Dropdown */}
                                    {openCatalogDropdown && (
                                        <div
                                            className="absolute z-50 mt-1 w-full rounded-2xl bg-white overflow-hidden"
                                            style={{
                                                border: "2px solid rgba(190, 146, 52, 0.35)",
                                                boxShadow: "0 18px 40px rgba(3, 3, 3, 0.16)",
                                            }}
                                        >
                                            {/* Suche */}
                                            <div
                                                className="px-3 py-2"
                                                style={{
                                                    background:
                                                        "linear-gradient(180deg, #fffdf7 0%, #ffffff 100%)",
                                                    borderBottom: "1px solid rgba(227,187,98,0.35)",
                                                }}
                                            >
                                                <input
                                                    value={catalogSearch}
                                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                                    placeholder="Katalog suchen…"
                                                    className="h-10 w-full rounded-xl border border-[#e5dcc7] bg-white
                                          px-3 text-sm placeholder:text-[#9b8f75]
                                          focus:border-[#E3BB62] focus:outline-none
                                          focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Liste */}
                                            <div className="max-h-64 overflow-auto py-2">
                                                {filteredCatalogs.length === 0 ? (
                                                    <div className="px-4 py-3 text-sm text-slate-500">
                                                        Keine Kataloge gefunden
                                                    </div>
                                                ) : (
                                                    filteredCatalogs.map((c: CatalogItem) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCatalogId(c.id);
                                                                setOpenCatalogDropdown(false);
                                                                setCatalogSearch("");
                                                            }}
                                                            className="
    w-full px-4 py-3 text-left text-sm
    transition-colors
    hover:bg-[#fff6db]

    border-b border-[rgba(227,187,98,0.35)]
    last:border-b-0
  "
                                                        >

                                                            <div className="font-medium text-slate-800">{c.name}</div>
                                                            {c.subtitle && (
                                                                <div className="text-xs text-slate-500 truncate mt-1">
                                                                    {c.subtitle}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info-Box zum gewählten Katalog */}
                                {selectedCatalogId && (
                                    <div className="mt-5 rounded-2xl border border-[#E3BB62]/30 bg-gradient-to-b from-[#FFFCF2] to-[#FFF9E6] px-4 py-4 shadow-[0_6px_18px_rgba(212,175,55,0.15)]">
                                        <div className="text-sm font-semibold text-[#264555]">
                                            {catalogs.find(c => c.id === selectedCatalogId)?.name}
                                        </div>
                                        {catalogs.find(c => c.id === selectedCatalogId)?.subtitle && (
                                            <div className="mt-2 text-xs text-[#8a7a52]">
                                                {catalogs.find(c => c.id === selectedCatalogId)?.subtitle}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aktionen */}
                        <div className="pt-3 flex gap-3">
                            {/* Abbrechen */}
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="
                                  flex-1 h-12
                                  rounded-xl
                                  border border-slate-300
                                  bg-white
                                  text-sm font-medium text-slate-700
                                  hover:bg-slate-50
                                  transition
                                "
                            >
                                Abbrechen
                            </button>

                            {/* Speichern */}
                            <button
                                onClick={handleSave}
                                disabled={!canSave}
                                className="
                                  flex-1 h-12
                                  rounded-xl
                                  bg-[#E3BB62]
                                  text-sm font-semibold text-[#264555]
                                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                                  transition
                                  hover:bg-[#d8ac55]
                                  hover:-translate-y-[1px]
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                "
                            >
                                Speichern
                            </button>
                        </div>
                    </div>

                    {/* Right: Themen-Cards - FLEXIBEL */}
                    <div className="flex-1 w-full min-w-0">
                        <div
                            className="rounded-2xl p-6 shadow-sm"
                            style={{
                                background: "#ffffffff",
                                border: "1px solid rgba(184,150,46,0.25)",
                            }}
                        >
                            {/* Header */}
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-[20px] font-semibold text-[#3D3225]">
                                    Themen auswählen
                                    <div className="mt-1 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#E3BB62] to-[#F2E3A2]" />
                                </h2>
                            </div>



                            {/* Such-Feld für Themen */}
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Themen durchsuchen..."
                                        value={topicSearch}
                                        onChange={(e) => setTopicSearch(e.target.value)}
                                        className="
                                          h-11 w-full rounded-xl
                                          border border-[#D4AF37]/40
                                          bg-white
                                          pl-11 pr-4 text-sm
                                          placeholder:text-[#9b8f75]
                                          text-[#3D3225]
                                          focus:border-[#B8962E]
                                          focus:outline-none
                                          focus:ring-3 focus:ring-[rgba(193, 159, 59, 0.25)]
                                          transition
                                        "
                                    />
                                    <svg
                                        className="absolute left-4 top-1/2 h-5 w-4 -translate-y-1/2 text-[#B8962E]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="text-sm text-[#6b5a3c]">
                                    {loadingTopics
                                        ? "Themen werden geladen…"
                                        : topicSearch
                                            ? `${filteredTopics.length} ${filteredTopics.length === 1 ? "Ergebnis" : "Ergebnisse"} gefunden`
                                            : "Wählen Sie die Themen aus, die Sie zuweisen möchten"}
                                </span>
                            </div>

                            {/* Grid: Themen-Cards */}
                            <div className="max-h-[520px] overflow-y-auto pr-2">
                                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
                                    {loadingTopics ? (
                                        // Optional: Skeleton oder einfach leer lassen, da Header "Laden..." anzeigt
                                        null
                                    ) : topicError ? (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-sm text-red-600">{topicError}</p>
                                        </div>
                                    ) : filteredTopics.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                                            <Layers size={48} className="opacity-40 mb-3" />
                                            <p className="text-sm font-medium">
                                                {topicSearch
                                                    ? `Keine Themen gefunden für "${topicSearch}"`
                                                    : "Keine Themen vorhanden"}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredTopics.map((t) => {
                                            const Icon = t.icon ?? Building2;
                                            const selected = selectedTopicIds.has(t.id);
                                            const count = qCountByThema[t.id];
                                            const questionsLabel =
                                                count === undefined
                                                    ? "– Fragen"
                                                    : count === 1
                                                        ? "1 Frage"
                                                        : `${count} Fragen`;

                                            return (
                                                <div
                                                    key={t.id}
                                                    className={[
                                                        "group relative w-full text-left rounded-2xl p-1 min-h-[160px] cursor-pointer",
                                                        "transition-all duration-300 ease-out",
                                                        "overflow-visible",
                                                        selected
                                                            ? "border border-[#D4AF37] bg-gradient-to-br from-[#FFFAE8] via-[#F6E7B8] to-[#EDD98A] ring-0 ring-[#E3BB62]/50 shadow-[0_10px_30px_rgba(212,175,55,0.28)]"
                                                            : "border border-[#D4AF37]/30 bg-white hover:shadow-[0_14px_36px_rgba(212,175,55,0.22)]",
                                                    ].join(" ")}
                                                    onClick={() => toggleTopic(t.id)}
                                                >
                                                    {/* Auswahl-Kreis oben rechts */}
                                                    <span className="
                                                      absolute right-3 top-3
                                                      inline-flex h-5 w-5 items-center justify-center
                                                      rounded-full border-2
                                                      border-[#56768f]
                                                      transition-colors duration-200
                                                      group-hover:border-[#E3BB62]
                                                      group-hover:bg-[#FFF9E6]
                                                    ">
                                                        {selected && (
                                                            <span className="h-3.5 w-3.5 rounded-full bg-[#E3BB62]" />
                                                        )}
                                                    </span>

                                                    <div className="relative flex flex-col gap-2 px-3">
                                                        <span
                                                            className={[
                                                                "absolute top-2 left-2 z-10",
                                                                "flex items-center justify-center",
                                                                "w-[70px] h-[32px] rounded-[10px]",
                                                                "transition-all duration-300",
                                                                "cursor-pointer",
                                                                selected
                                                                    ? "bg-gradient-to-r from-[#E3BB62] to-[#D4AF37] shadow-[0_6px_18px_rgba(212,175,55,0.45)]"
                                                                    : "bg-gradient-to-r from-[#F6E7B8] to-[#EDD98A] shadow-[0_2px_8px_rgba(212,175,55,0.25)] group-hover:from-[#F2E3A2] group-hover:to-[#E3BB62] group-hover:shadow-[0_4px_12px_rgba(212,175,55,0.35)]",
                                                            ].join(" ")}
                                                            onMouseEnter={(e) => {
                                                                e.stopPropagation();
                                                                const timeout = setTimeout(() => {
                                                                    setShowTooltipFull((prev) => {
                                                                        const next = new Map(prev);
                                                                        next.set(t.id, true);
                                                                        return next;
                                                                    });
                                                                }, 350);
                                                                hoverTimeouts.current.set(t.id, timeout);
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.stopPropagation();
                                                                const timeout = hoverTimeouts.current.get(t.id);
                                                                if (timeout) {
                                                                    clearTimeout(timeout);
                                                                    hoverTimeouts.current.delete(t.id);
                                                                }
                                                                setShowTooltipFull((prev) => {
                                                                    const next = new Map(prev);
                                                                    next.set(t.id, false);
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <Icon
                                                                size={18}
                                                                className={[
                                                                    "transition-colors duration-300",
                                                                    selected
                                                                        ? "text-[#264555]"
                                                                        : "text-[#264555]/80",
                                                                ].join(" ")}
                                                            />
                                                        </span>

                                                        {/* Tooltip - außerhalb des Logo-Spans für höheren z-index */}
                                                        {showTooltipFull.get(t.id) && (
                                                            <div
                                                                className={`
                                                                  ${showTooltipFull.get(t.id)
                                                                        ? "opacity-100 visible"
                                                                        : "opacity-0 invisible"
                                                                    }
                                                                  fixed w-72
                                                                  rounded-xl p-3 text-xs
                                                                  transition-all duration-200 z-[99999]

                                                                  bg-[#fffaf0]
                                                                  text-[#264555]
                                                                  border border-[#e6dcc8]
                                                                  shadow-[0_10px_30px_rgba(38,69,85,0.18)]

                                                                  break-words
                                                                  overflow-wrap-anywhere
                                                                  whitespace-normal
                                                                `}
                                                                ref={(el) => {
                                                                    if (el) {
                                                                        tooltipRefs.current.set(t.id, el);
                                                                        const cardElement = el.closest(".group");
                                                                        if (cardElement) {
                                                                            const logoSpan =
                                                                                cardElement.querySelector(
                                                                                    'span[class*="absolute top-2 left-2"]'
                                                                                ) as HTMLElement;
                                                                            if (logoSpan) {
                                                                                const rect =
                                                                                    logoSpan.getBoundingClientRect();
                                                                                const tooltipWidth = 288; // w-72 = 18rem = 288px
                                                                                el.style.top = `${rect.bottom + 8}px`;
                                                                                el.style.left = `${rect.left +
                                                                                    rect.width / 2 -
                                                                                    tooltipWidth / 2 + 100
                                                                                    }px`;
                                                                            }
                                                                        }
                                                                    } else {
                                                                        tooltipRefs.current.delete(t.id);
                                                                    }
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowTooltipFull((prev) => {
                                                                        const next = new Map(prev);
                                                                        next.set(t.id, false);
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                <b>{t.name}</b>
                                                                <br />
                                                                {t.subtitle || "Keine Beschreibung vorhanden"}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 pt-[52px] text-left">
                                                            <div className="text-[15px] font-semibold text-[#264555] leading-5 line-clamp-1 break-words overflow-wrap-anywhere">
                                                                {t.name}
                                                            </div>

                                                            {t.subtitle && (
                                                                <div className="mt-0 mb-2 text-[13px] text-slate-600 leading-1 line-clamp-2 min-h-[2.5rem] break-words overflow-wrap-anywhere">
                                                                    {t.subtitle}
                                                                </div>
                                                            )}

                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-sm font-medium text-[#D4AF37]">
                                                                    {questionsLabel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Footer-Zeile */}
                            <div className="mt-4 pt-4 border-t border-[#E3BB62]/20">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#6b5a3c]">Ausgewählt:</span>
                                    <span className="font-semibold text-[#264555]">
                                        {selectedTopicIds.size} {selectedTopicIds.size === 1 ? "Thema" : "Themen"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </AdminLayout >
    );
}
