
import AdminLayout from "@/apps/app/AdminLayout";
import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import myLogo from "@/assets/Zero-6-icons-05.webp";

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

    /* ---------- Kataloge (links) ---------- */
    const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [catalogError, setCatalogError] = useState<string | null>(null);

    // Auswahl
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

    // Map: ThemaId -> Fragenanzahl
    const [qCountByThema, setQCountByThema] = useState<Record<string, number>>({});


    const navigate = useNavigate();


    const DEFAULT_ICON: LucideIcon = Building2;
    const DEFAULT_COLOR = "#d2c9b9";

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
                const apiList = await getCatalogs(); // GET /api/catalogs
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


    /* ------------------------------- RENDER -------------------------------- */

    return (
        <AdminLayout>
            {/* Header */}
            {/* HEADER */}
            <PageHeader
      
              title="Kataloginhalte ordnen"
              subtitle="Themen im Katalog anordnen und verwalten"
              icon={<Network size={40} />}
              gradient="navy"
              height="280px"
              showPattern={true}
      
            />
            <div className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Katalog-Auswahl (Dropdown) */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-[18px] font-semibold text-slate-900">Katalog auswählen</h2>

                            {(catalogError) && (
                                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {catalogError}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">
                                        Katalog <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                                        value={selectedCatalogId}
                                        onChange={(e) => setSelectedCatalogId(e.target.value)}
                                        disabled={loadingCatalogs}
                                    >
                                        <option value="">
                                            {loadingCatalogs ? "Kataloge werden geladen…" : "Katalog auswählen…"}
                                        </option>
                                        {catalogs.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Info-Box zum gewählten Katalog (optional) */}
                                {selectedCatalogId && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                        <div className="text-sm font-medium text-slate-900">
                                            {catalogs.find(c => c.id === selectedCatalogId)?.name}
                                        </div>
                                        {catalogs.find(c => c.id === selectedCatalogId)?.subtitle && (
                                            <div className="mt-1 text-xs text-slate-600">
                                                {catalogs.find(c => c.id === selectedCatalogId)?.subtitle}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Themen-Cards */}
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-[#ebebec] bg-white p-6 shadow-sm">
                            <h2 className="mb-1 text-[18px] font-semibold text-[#264555]">Themen auswählen</h2>
                            <p className="mb-4 text-sm text-[#56768f]">
                                {loadingTopics ? "Themen werden geladen…" : "Wählen Sie die Themen aus, die Sie zuweisen möchten"}
                            </p>

                            {/* Grid: 3 pro Zeile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topics.map((t) => {
                                    const Icon = t.icon ?? Building2;
                                    const selected = selectedTopicIds.has(t.id);
                                    const count = qCountByThema[t.id];
                                    const questionsLabel =
                                        count === undefined
                                            ? "– Fragen"                  // noch am Laden
                                            : count === 1
                                                ? "1 Frage"
                                                : `${count} Fragen`;

                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTopic(t.id)}
                                            className={[
                                                "relative w-full text-left rounded-xl border p-4 transition-colors",
                                                "min-h-[132px]",
                                                selected
                                                    ? "border-[#E3BB62] bg-[#ebebec]"
                                                    : "border-[#ebebec] hover:border-[#56768f]/50 hover:bg-[#ebebec]/50"
                                            ].join(" ")}
                                        >
                                            {/* Radio-Indicator */}
                                            <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#56768f]">
                                                {selected && <span className="h-3.5 w-3.5 rounded-full bg-[#E3BB62]" />}
                                            </span>

                                            <div className="flex items-start gap-3 pr-6">
                                                <span
                                                    className="grid h-10 w-10 place-items-center rounded-xl text-white shrink-0"
                                                    style={{ backgroundColor: t.color ?? DEFAULT_COLOR }}
                                                >
                                                    <Icon size={18} />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[14px] font-semibold text-[#264555] leading-5">
                                                        <span
                                                            style={{
                                                                display: "-webkit-box",
                                                                WebkitBoxOrient: "vertical",
                                                                WebkitLineClamp: 2,
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {t.name}
                                                        </span>
                                                    </div>

                                                    {t.subtitle && (
                                                        <div
                                                            className="mt-1 text-xs text-slate-600 leading-5"
                                                            style={{
                                                                display: "-webkit-box",
                                                                WebkitBoxOrient: "vertical",
                                                                WebkitLineClamp: 2,
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {t.subtitle}
                                                        </div>
                                                    )}

                                                    <div className="mt-2 text-xs text-slate-500">{questionsLabel}</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {topicError && <p className="text-sm text-red-600">{topicError}</p>}

                            </div>

                            {/* Footer-Zeile */}
                            <hr className="my-4 border-t border-[#ebebec]" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Ausgewählt:</span>
                                <span className="font-semibold text-[#264555]">
                                    {selectedTopicIds.size} {selectedTopicIds.size === 1 ? "Thema" : "Themen"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-6 py-3">
                        <button
                            type="button"
                            onClick={() => history.back()}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className="h-10 rounded-lg bg-[#264555] px-4 text-sm font-medium text-white disabled:opacity-50"
                        >
                            Speichern
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
