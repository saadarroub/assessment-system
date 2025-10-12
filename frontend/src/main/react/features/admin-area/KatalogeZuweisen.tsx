import AdminLayout from "@/apps/app/AdminLayout";
import React, { useMemo, useState } from "react";

/* ----------------------------- Types & Models ----------------------------- */

export type Company = { id: string; name: string };
export type Recipient = { id: string; name: string; type: "team" | "person" };
export type Topic = { id: string; name: string };
export type Catalog = {
    id: string;
    topicId: string;
    title: string;
    description?: string;
    questions?: number;
    assigned?: boolean;
};

export type AssignPayload = {
    companyId: string;
    recipientIds: string[];
    catalogIds: string[];
    description?: string;
    dueDate?: string;
    note?: string;
};

export type KatalogeZuweisenProps = {
    companies?: Company[];
    recipients?: Recipient[];
    topics?: Topic[];
    catalogs?: Catalog[];
    onAssign?: (payload: AssignPayload) => void;
};

/* ----------------------------- Mock Data (opt) ---------------------------- */
const MOCK_COMPANIES: Company[] = [
    { id: "c1", name: "TechStart GmbH" },
    { id: "c2", name: "Cap Consulting" },
];
const MOCK_RECIPIENTS: Recipient[] = [
    { id: "t1", name: "Team Marketing", type: "team" },
    { id: "t2", name: "Team Vertrieb", type: "team" },
    { id: "p1", name: "Anna Schmidt", type: "person" },
    { id: "p2", name: "Max Müller", type: "person" },
    { id: "p3", name: "Lisa Weber", type: "person" },
];
const MOCK_TOPICS: Topic[] = [
    { id: "topic-prod", name: "Produktkataloge" },
    { id: "topic-train", name: "Schulung" },
    { id: "topic-mkt", name: "Marketingmaterial" },
    { id: "topic-docs", name: "Technische Dokumentation" },
];
const MOCK_CATALOGS: Catalog[] = [
    { id: "cat-1", topicId: "topic-docs", title: "API Dokumentation", description: "Schnittstellenbeschreibung", questions: 15 },
    { id: "cat-2", topicId: "topic-docs", title: "Systemhandbücher", description: "Bedienungsanleitungen", questions: 18 },
    { id: "cat-3", topicId: "topic-docs", title: "Architektur Docs", description: "System- & Softwarearchitektur", questions: 12 },
    { id: "cat-4", topicId: "topic-train", title: "Verkaufstraining", description: "Best Practices", questions: 10 },
    { id: "cat-5", topicId: "topic-train", title: "Onboarding Guide 2024", description: "Einführung für neue Mitarbeitende", questions: 9 },
    { id: "cat-6", topicId: "topic-prod", title: "Premium Produktlinie 2024", description: "B2B-Produkte", questions: 11 },
    { id: "cat-7", topicId: "topic-prod", title: "Standard Sortiment", description: "Basis-Palette", questions: 7 },
    { id: "cat-8", topicId: "topic-mkt", title: "Brand Guidelines", description: "CD & Styleguide", questions: 6, assigned: true },
];

/* --------------------------------- UI ------------------------------------ */

export default function KatalogeZuweisen({
    companies = MOCK_COMPANIES,
    recipients = MOCK_RECIPIENTS,
    topics = MOCK_TOPICS,
    catalogs = MOCK_CATALOGS,
    onAssign,
}: KatalogeZuweisenProps) {
    // --- left form (global) ---
    const [companyId, setCompanyId] = useState("");
    const [recipientIds, setRecipientIds] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<string>("");
    const [note, setNote] = useState("");

    // --- right side (tabs + selection) ---
    const [activeTopicId, setActiveTopicId] = useState<string>(topics[0]?.id ?? "");
    const [searchByTopic, setSearchByTopic] = useState<Record<string, string>>({});
    const [selectedCatalogIds, setSelectedCatalogIds] = useState<Set<string>>(new Set());

    const catalogsByTopic = useMemo(() => {
        const map: Record<string, Catalog[]> = {};
        for (const t of topics) map[t.id] = [];
        for (const c of catalogs) {
            (map[c.topicId] ?? (map[c.topicId] = [])).push(c);
        }
        return map;
    }, [catalogs, topics]);

    const globalSelectedCount = selectedCatalogIds.size;

    const canAssign =
        !!companyId &&
        recipientIds.length > 0 &&
        globalSelectedCount > 0;

    function toggleRecipient(id: string) {
        setRecipientIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function toggleCatalog(id: string) {
        setSelectedCatalogIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleAllInTopic(topicId: string) {
        const allIds = (catalogsByTopic[topicId] ?? []).map((c) => c.id);
        setSelectedCatalogIds((prev) => {
            const next = new Set(prev);
            const allSelected = allIds.every((id) => next.has(id));
            if (allSelected) {
                allIds.forEach((id) => next.delete(id));
            } else {
                allIds.forEach((id) => {
                    const cat = catalogs.find((c) => c.id === id);
                    if (!cat?.assigned) next.add(id);
                });
            }
            return next;
        });
    }

    function handleAssign() {
        if (!canAssign) return;
        const payload: AssignPayload = {
            companyId,
            recipientIds,
            catalogIds: Array.from(selectedCatalogIds),
            description: description || undefined,
            dueDate: dueDate || undefined,
            note: note || undefined,
        };
        onAssign?.(payload);
    }

    /* ------------------------------- RENDER -------------------------------- */

    return (
        <AdminLayout>
            {/* Page container */}
            <div className="mx-auto w-full px-6 pt-6 pb-28
                max-w-screen-xl 2xl:max-w-[1400px] 3xl:max-w-[1680px]">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">
                        Kataloge zuweisen – <span className="text-slate-700">IT Project Management</span>
                    </h1>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Grundinformationen */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-[18px] font-semibold text-slate-900">Grundinformationen</h2>

                            <div className="space-y-4">
                                {/* Katalog-Name (optional im Screenshot) */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Katalog-Name</label>
                                    <input
                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="z.B. Q1 2024 Assessment"
                                        value={description ? undefined : undefined}
                                        onChange={() => { }}
                                    />
                                </div>

                                {/* Firma */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">
                                        Kunde/Firma <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                    >
                                        <option value="">Firma auswählen…</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Empfänger (einfach, Checkbox-Liste + Chips) */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">
                                        Empfänger (Mitarbeitende) <span className="text-red-500">*</span>
                                    </label>

                                    <div className="rounded-lg border border-slate-300 p-2">
                                        <div className="mb-2 flex min-h-[32px] flex-wrap gap-2">
                                            {recipientIds.length === 0 ? (
                                                <span className="text-sm text-slate-500">Empfänger auswählen…</span>
                                            ) : (
                                                recipientIds.map((id) => {
                                                    const r = recipients.find((x) => x.id === id);
                                                    if (!r) return null;
                                                    return (
                                                        <span
                                                            key={id}
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                                        >
                                                            {r.name}
                                                            <button
                                                                type="button"
                                                                className="rounded p-0.5 hover:bg-blue-100"
                                                                onClick={() => toggleRecipient(id)}
                                                                aria-label={`${r?.name} entfernen`}
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-0.5">
                                            {recipients.map((r) => {
                                                const checked = recipientIds.includes(r.id);
                                                return (
                                                    <label key={r.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-blue-600"
                                                            checked={checked}
                                                            onChange={() => toggleRecipient(r.id)}
                                                        />
                                                        <span className="text-sm text-slate-800">
                                                            {r.name} {r.type === "team" ? <em className="text-slate-400">(Team)</em> : null}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Beschreibung */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Beschreibung</label>
                                    <textarea
                                        className="min-h-[96px] w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="Beschreibung des Katalogs…"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                {/* Fällig am */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Fällig am</label>
                                    <input
                                        type="date"
                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>

                                {/* Notiz */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Notiz</label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="Optionale Notiz…"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>

                                {/* Info-Zeile */}
                                <div className="pt-1 text-sm text-slate-500">
                                    0 Katalog(e) ausgewählt {/* kannst du mit globalSelectedCount ersetzen, wenn du willst */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tabs & Catalogs */}
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-brand-ice bg-white p-6 shadow-sm">
                            <h2 className="mb-1 text-[18px] font-semibold text-brand-navy">Kataloge auswählen</h2>
                            <p className="mb-4 text-sm text-brand-steel/80">Wählen Sie die Kataloge aus, die Sie zuweisen möchten</p>

                            <div className="flex gap-6">
                                {/* Tablist – links */}
                                <div className="w-56">
                                    <nav role="tablist" aria-label="Themen" className="flex flex-col gap-2">
                                        {topics.map((t) => {
                                            const countInTopic = (catalogsByTopic[t.id] ?? []).filter(c => selectedCatalogIds.has(c.id)).length;
                                            const active = activeTopicId === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    role="tab"
                                                    aria-selected={active}
                                                    aria-controls={`panel-${t.id}`}
                                                    onClick={() => setActiveTopicId(t.id)}
                                                    className={[
                                                        "group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                                                        active
                                                            ? "border-brand-gold bg-brand-sand/40 text-brand-navy shadow-sm"
                                                            : "border-brand-ice text-brand-navy/80 hover:bg-brand-ice/60"
                                                    ].join(" ")}
                                                >
                                                    <span className="group-aria-selected:font-semibold">{t.name}</span>
                                                    {countInTopic > 0 && (
                                                        <span className="rounded-full bg-brand-ice px-2 py-0.5 text-xs text-brand-steel">
                                                            {countInTopic}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>

                                {/* Panels – rechts */}
                                <div className="flex-1">
                                    {/* Suche */}
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="relative w-full">
                                            <input
                                                value={searchByTopic[activeTopicId] ?? ""}
                                                onChange={(e) => setSearchByTopic((s) => ({ ...s, [activeTopicId]: e.target.value }))}
                                                placeholder="Kataloge suchen…"
                                                className="h-11 w-full rounded-lg border border-brand-ice pl-10 pr-3 text-sm placeholder:text-brand-gray/60
                         focus:border-brand-steel focus:outline-none focus:ring-4 focus:ring-brand-steel/15"
                                            />
                                            <svg viewBox="0 0 24 24"
                                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-steel/70"
                                                fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.35-4.35"></path>
                                            </svg>
                                        </div>
                                    </div>

                                    {topics.map((t) => {
                                        const active = activeTopicId === t.id;
                                        const search = searchByTopic[t.id] ?? "";
                                        const allCats = catalogsByTopic[t.id] ?? [];
                                        const filtered = allCats.filter(c => {
                                            const q = search.toLowerCase();
                                            return c.title.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q);
                                        });

                                        const selectedInTopic = allCats.filter(c => selectedCatalogIds.has(c.id)).length;
                                        const allSelectableIds = allCats.filter(c => !c.assigned).map(c => c.id);
                                        const allSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedCatalogIds.has(id));

                                        return (
                                            <section key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={!active}>
                                                {/* Select all */}
                                                <div className="mb-3">
                                                    <label className="inline-flex select-none items-center gap-2 text-sm text-brand-navy/90">
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={() => toggleAllInTopic(t.id)}
                                                            className="h-4 w-4 appearance-none rounded-full border-2 border-brand-steel
                               checked:bg-brand-gold checked:border-brand-gold
                               focus:outline-none focus:ring-2 focus:ring-brand-steel/20"
                                                        />
                                                        Alle Kataloge dieses Themas auswählen
                                                    </label>
                                                </div>

                                                {/* Cards – 2 Spalten */}
                                                {filtered.length === 0 ? (
                                                    <div className="rounded-lg border border-dashed border-brand-ice p-8 text-center text-sm text-brand-gray">
                                                        Keine Kataloge gefunden.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {filtered.map((c) => {
                                                            const selected = selectedCatalogIds.has(c.id);
                                                            const disabled = !!c.assigned;
                                                            return (
                                                                <label
                                                                    key={c.id}
                                                                    className={[
                                                                        "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                                                                        selected
                                                                            ? "border-brand-gold bg-brand-ice"
                                                                            : "border-brand-ice hover:border-brand-steel/50 hover:bg-brand-ice/50",
                                                                        disabled ? "opacity-60" : ""
                                                                    ].join(" ")}
                                                                >
                                                                    {/* runder Auswahlpunkt (Checkbox bleibt Multi-Select) */}
                                                                    <input
                                                                        type="checkbox"
                                                                        disabled={disabled}
                                                                        checked={selected}
                                                                        onChange={() => toggleCatalog(c.id)}
                                                                        className="mt-1 h-4 w-4 appearance-none rounded-full border-2 border-brand-steel
                                     checked:bg-brand-gold checked:border-brand-gold
                                     focus:outline-none focus:ring-2 focus:ring-brand-steel/20"
                                                                    />

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="mb-1 flex items-start justify-between gap-3">
                                                                            <div className="text-[15px] font-semibold text-brand-navy">{c.title}</div>
                                                                            {c.assigned && (
                                                                                <span className="shrink-0 rounded-full border border-brand-gold/40 bg-brand-gold/15 px-2 py-0.5 text-xs text-brand-navy">
                                                                                    bereits zugewiesen
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {c.description && (
                                                                            <p className="text-xs leading-5 text-brand-steel/80">{c.description}</p>
                                                                        )}

                                                                        <div className="mt-2 text-xs text-brand-gray">
                                                                            {typeof c.questions === "number" ? `${c.questions} Fragen` : "\u00A0"}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Counter */}
                                                <div className="mt-4 text-sm text-brand-steel">
                                                    Ausgewählt: <span className="font-semibold text-brand-navy">{selectedInTopic}</span>
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>
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
                            onClick={handleAssign}
                            disabled={!canAssign}
                            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50"
                        >
                            Kataloge zuweisen
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
