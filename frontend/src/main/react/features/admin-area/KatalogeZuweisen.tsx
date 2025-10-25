import AdminLayout from "@/apps/app/AdminLayout";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { ClipboardList, Building2, ShoppingCart, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCompanies, getWorkersByCompany, type WorkerApi } from "../service/companyService";

/* ----------------------------- Types & Models ----------------------------- */

export type Company = { id: string; name: string };
export type Recipient = {
  id: string;
  name: string;
  type: "team" | "person";
  companyId: string;
  email?: string;
};

export type Topic = {
  id: string;
  name: string;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
};

export type Catalog = {
  id: string;
  topicId: string;
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
  topics?: Topic[];
  catalogs?: Catalog[];
  onAssign?: (payload: AssignPayload) => void;
};

/* ----------------------------- Mock Data ---------------------------------- */
const MOCK_TOPICS: Topic[] = [
  { id: "topic-operating", name: "IT Operating Model", icon: Building2,  color: "#d2c9b9", subtitle: "Strategische IT-Betriebsmodelle & Governance" },
  { id: "topic-eam",       name: "Enterprise Architecture Management", icon: BarChart3, color: "#56768f", subtitle: "Unternehmensarchitektur & Frameworks" },
  { id: "topic-sourcing",  name: "IT Sourcing", icon: ShoppingCart,     color: "#264555", subtitle: "Vendor Management & Beschaffung" },
  { id: "topic-project",   name: "IT Project Management", icon: ClipboardList, color: "#ebebec", subtitle: "Vorgehensmodelle & Qualität" },
];

const MOCK_CATALOGS: Catalog[] = [
  { id: "cat-op-1", topicId: "topic-operating", questions: 12 },
  { id: "cat-op-2", topicId: "topic-operating", questions: 14 },
  { id: "cat-ea-1", topicId: "topic-eam",       questions: 18 },
  { id: "cat-ea-2", topicId: "topic-eam",       questions: 10 },
  { id: "cat-so-1", topicId: "topic-sourcing",  questions: 9  },
  { id: "cat-so-2", topicId: "topic-sourcing",  questions: 7, assigned: true },
  { id: "cat-pr-1", topicId: "topic-project",   questions: 11 },
  { id: "cat-pr-2", topicId: "topic-project",   questions: 8  },
];

/* --------------------------------- UI ------------------------------------ */

export default function KatalogeZuweisen({
  topics = MOCK_TOPICS,
  catalogs = MOCK_CATALOGS,
  onAssign,
}: KatalogeZuweisenProps) {
  // --- API-States (NEU) ---
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- left form ---
  const [companyId, setCompanyId] = useState("");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [note, setNote] = useState("");

  // --- selection state (IDs der einzelnen Kataloge) ---
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<Set<string>>(new Set());

  // --- recipients dropdown ---
  const [openRecipients, setOpenRecipients] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Adapter: WorkerApi -> Recipient
  function adaptWorkersToRecipients(workers: WorkerApi[]): Recipient[] {
    return workers.map(w => ({
      id: w.id,
      name: w.name,
      type: "person",
      companyId: w.companyId,
      email: w.email,
    }));
  }

  // Firmen laden (on mount)
  useEffect(() => {
    (async () => {
      try {
        setLoadingCompanies(true);
        setErrorMsg(null);
        const list = await getCompanies();
        setCompanies(list);
      } catch (e) {
        console.error(e);
        setErrorMsg("Firmen konnten nicht geladen werden.");
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);

  // Empfänger laden bei Firmenwechsel
  useEffect(() => {
    setRecipientIds([]);
    setOpenRecipients(false);
    setRecipientSearch("");
    setRecipients([]);
    if (!companyId) return;

    (async () => {
      try {
        setLoadingRecipients(true);
        setErrorMsg(null);
        const workers = await getWorkersByCompany(companyId);
        setRecipients(adaptWorkersToRecipients(workers));
      } catch (e) {
        console.error(e);
        setErrorMsg("Empfänger konnten nicht geladen werden.");
      } finally {
        setLoadingRecipients(false);
      }
    })();
  }, [companyId]);

  // Kataloge je Thema
  const catalogsByTopic = useMemo(() => {
    const map: Record<string, Catalog[]> = {};
    for (const t of topics) map[t.id] = [];
    for (const c of catalogs) (map[c.topicId] ?? (map[c.topicId] = [])).push(c);
    return map;
  }, [catalogs, topics]);

  // ausgewählte Themen zählen
  const selectedTopicCount = useMemo(() => {
    return topics.reduce((count, t) => {
      const allCats = catalogsByTopic[t.id] ?? [];
      const selectableIds = allCats.filter(c => !c.assigned).map(c => c.id);
      if (selectableIds.length === 0) return count;
      const allSelected = selectableIds.every(id => selectedCatalogIds.has(id));
      return count + (allSelected ? 1 : 0);
    }, 0);
  }, [topics, catalogsByTopic, selectedCatalogIds]);

  // Filter der Empfänger (nur auf geladene recipients)
  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(r =>
      r.name.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q)
    );
  }, [recipientSearch, recipients]);

  const allFilteredSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every(e => recipientIds.includes(e.id));

  // Outside click für Dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpenRecipients(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Freigabe-Bedingung
  const canAssign = !!companyId && recipientIds.length > 0 && selectedTopicCount > 0;

  function toggleRecipient(id: string) {
    setRecipientIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  // gesamtes Thema toggeln (alle auswählbaren Kataloge)
  function toggleAllInTopic(topicId: string) {
    setSelectedCatalogIds(prev => {
      const next = new Set(prev);
      const allSelectable = (catalogsByTopic[topicId] ?? []).filter(c => !c.assigned).map(c => c.id);
      const allSelected = allSelectable.length > 0 && allSelectable.every(id => next.has(id));
      if (allSelected) {
        allSelectable.forEach(id => next.delete(id));
      } else {
        allSelectable.forEach(id => next.add(id));
      }
      return next;
    });
  }

  function selectAllFromCompanyFiltered() {
    if (allFilteredSelected) {
      setRecipientIds(prev => prev.filter(id => !filteredRecipients.some(e => e.id === id)));
    } else {
      setRecipientIds(prev => {
        const s = new Set(prev);
        filteredRecipients.forEach(e => s.add(e.id));
        return Array.from(s);
      });
    }
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
      <div className="mx-auto w-full px-6 pt-6 pb-28 max-w-screen-xl 2xl:max-w-[1400px] 3xl:max-w-[1680px]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">
            Kataloge zuweisen
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Grundinformationen */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-[18px] font-semibold text-slate-900">Grundinformationen</h2>

              {errorMsg && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                {/* Katalog-Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Katalog-Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    type="text"
                    placeholder="z.B. IT Operating Model 2025"
                    required
                  />
                </div>

                {/* Firma */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Firma <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    disabled={loadingCompanies}
                  >
                    <option value="">{loadingCompanies ? "Lade Firmen…" : "Firma auswählen…"}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Empfänger */}
                <div className="space-y-1" ref={dropdownRef}>
                  <label className="text-sm font-medium text-slate-700">
                    Empfänger (kunde) <span className="text-red-500">*</span>
                  </label>

                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (companyId) setOpenRecipients(v => !v); }}
                    disabled={!companyId || loadingRecipients}
                    className={[
                      "h-11 w-full rounded-lg border px-3 text-left text-sm flex items-center justify-between",
                      companyId ? "border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {!companyId
                        ? "Zuerst Firma auswählen…"
                        : recipientIds.length === 0
                          ? (loadingRecipients ? "Lade Empfänger…" : "Empfänger auswählen…")
                          : (
                            <span className="flex gap-2 flex-wrap">
                              {recipientIds
                                .map(id => recipients.find(r => r.id === id))
                                .filter(Boolean)
                                .map(r => (
                                  <span key={r!.id} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                    {r!.name}
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); toggleRecipient(r!.id); }}
                                      className="rounded p-0.5 hover:bg-blue-100"
                                      aria-label={`${r!.name} entfernen`}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                            </span>
                          )}
                    </span>
                    <span className="ml-3 text-slate-400">👤</span>
                  </button>

                  {/* Dropdown */}
                  {openRecipients && (
                    <div className="relative z-40">
                      <div className="absolute mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                        {/* Suche */}
                        <div className="p-2 border-b border-slate-200">
                          <input
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Mitarbeitende suchen…"
                            className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            autoFocus
                          />
                        </div>

                        {/* Alle aus Firma auswählen */}
                        <button
                          type="button"
                          onClick={selectAllFromCompanyFiltered}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                          disabled={loadingRecipients || recipients.length === 0}
                        >
                          <span className="text-lg">👥</span>
                          <span className="flex-1 text-left">Alle aus Firma auswählen</span>
                          <span className="text-xs text-slate-500">{allFilteredSelected ? "✓" : ""}</span>
                        </button>

                        {/* Optionen */}
                        <div className="max-h-72 overflow-auto py-1">
                          {loadingRecipients ? (
                            <div className="px-3 py-2 text-sm text-slate-500">Laden…</div>
                          ) : filteredRecipients.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500">Keine Ergebnisse</div>
                          ) : (
                            filteredRecipients.map(r => {
                              const checked = recipientIds.includes(r.id);
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => toggleRecipient(r.id)}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="mt-[2px] inline-block h-4 w-4 rounded-full border border-slate-400">
                                      {checked && <span className="block h-4 w-4 rounded-full bg-blue-600" />}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-sm text-slate-800">{r.name}</div>
                                      {r.email && <div className="text-xs text-slate-500 truncate">{r.email}</div>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                  <label className="text-sm font-medium text-slate-700">
                    Fällig am <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={dueDate}
                    required
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
              </div>
            </div>
          </div>

          {/* Right: Themen-Cards */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#ebebec] bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-[18px] font-semibold text-[#264555]">Themen auswählen</h2>
              <p className="mb-4 text-sm text-[#56768f]">Wählen Sie die Themen aus, die Sie zuweisen möchten</p>

              <div className="flex flex-col gap-4">
                {topics.map((t) => {
                  const Icon = t.icon ?? ClipboardList;
                  const allCats = catalogsByTopic[t.id] ?? [];
                  const allSelectableIds = allCats.filter(c => !c.assigned).map(c => c.id);
                  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedCatalogIds.has(id));
                  const questionsTotal = allCats.reduce((sum, c) => sum + (c.questions ?? 0), 0);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleAllInTopic(t.id)}
                      className={[
                        "w-full text-left rounded-xl border p-4 transition-colors",
                        allSelected ? "border-[#E3BB62] bg-[#ebebec]" : "border-[#ebebec] hover:border-[#56768f]/50 hover:bg-[#ebebec]/50"
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="grid h-12 w-12 place-items-center rounded-2xl text-white shrink-0"
                          style={{ backgroundColor: t.color ?? "#808080" }}
                        >
                          <Icon size={20} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[15px] font-semibold text-[#264555]">{t.name}</div>
                              {t.subtitle && <div className="mt-0.5 text-sm text-slate-600">{t.subtitle}</div>}
                              <div className="mt-1 text-xs text-slate-500">{questionsTotal} Fragen</div>
                            </div>

                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#56768f]">
                              {allSelected && <span className="h-3.5 w-3.5 rounded-full bg-[#E3BB62]" />}
                            </span>
                          </div>
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
                  {selectedTopicCount} {selectedTopicCount === 1 ? "Thema" : "Themen"}
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
              onClick={handleAssign}
              disabled={!canAssign}
              className="h-10 rounded-lg bg-[#264555] px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              Kataloge zuweisen
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
