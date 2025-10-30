// src/pages/admin/katalogVerwaltung.tsx

import AdminLayout from "@/apps/app/AdminLayout";
import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getThemen, type ThemaApi } from "../service/themaService";
import { getCatalogs, type CatalogApi } from "../service/catalogService";
import { assignTopicsToCatalog } from "../service/themaCatalogService";


/* ----------------------------- Types & Models ----------------------------- */

type Topic = {
    id: string;            // Backend-ID
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

export default function KatalogVerwaltung({ onSave }: Props) {
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
                setTopics(ui);
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
                setCatalogs(ui);
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
            // TODO: Erfolgsmeldung / zurücknavigieren / Refresh
        } catch (e: any) {
            alert(`Zuordnung fehlgeschlagen: ${e?.message ?? e}`);
        }
    }

    /* ------------------------------- RENDER -------------------------------- */

    return (
        <AdminLayout>
            <div className="mx-auto w-full px-6 pt-6 pb-28 max-w-screen-xl 2xl:max-w-[1400px] 3xl:max-w-[1680px]">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">
                        Katalog verwalten
                    </h1>
                </div>

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
                                    const questionsLabel = "– Fragen"; // Platzhalter

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
