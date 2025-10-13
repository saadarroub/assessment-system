import AdminLayout from "@/apps/app/AdminLayout";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { ClipboardList, Building2, ShoppingCart, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  // c1
  { id: "t1", name: "Team Marketing", type: "team",   companyId: "c1" },
  { id: "p1", name: "Anna Schmidt",   type: "person", companyId: "c1", email: "anna@techstart.de" },
  { id: "p2", name: "Max Müller",     type: "person", companyId: "c1", email: "max@techstart.de" },
  // c2
  { id: "t2", name: "Team Vertrieb",  type: "team",   companyId: "c2" },
  { id: "p3", name: "Lisa Weber",     type: "person", companyId: "c2", email: "lisa@cap-consulting.de" },
];

/** Themen */
const MOCK_TOPICS: Topic[] = [
  { id: "topic-operating", name: "IT Operating Model", icon: Building2,  color: "#d2c9b9" },
  { id: "topic-eam",       name: "Enterprise Architecture Management", icon: BarChart3, color: "#56768f" },
  { id: "topic-sourcing",  name: "IT Sourcing", icon: ShoppingCart,     color: "#264555" },
  { id: "topic-project",   name: "IT Project Management", icon: ClipboardList, color: "#ebebec" },
];

const MOCK_CATALOGS: Catalog[] = [
  { id: "cat-op-1", topicId: "topic-operating", title: "Prozesslandkarte", description: "Rollen, RACI, Kernprozesse", questions: 12 },
  { id: "cat-op-2", topicId: "topic-operating", title: "ITSM & Governance", description: "ITIL, Policies, KPIs", questions: 14 },
  { id: "cat-ea-1", topicId: "topic-eam", title: "Ziel-Architektur 2026", description: "Domänen, Capabilities", questions: 18 },
  { id: "cat-ea-2", topicId: "topic-eam", title: "Standards & Guidelines", description: "Schnittstellen, Tech-Radar", questions: 10 },
  { id: "cat-so-1", topicId: "topic-sourcing", title: "Lieferantenauswahl", description: "Kriterien, Scorecards", questions: 9 },
  { id: "cat-so-2", topicId: "topic-sourcing", title: "Vertragsmanagement", description: "SLAs, Penalties", questions: 7, assigned: true },
  { id: "cat-pr-1", topicId: "topic-project", title: "PM-Framework", description: "Vorgehensmodelle, Rollen", questions: 11 },
  { id: "cat-pr-2", topicId: "topic-project", title: "Risiko & Qualität", description: "Risikolisten, QA-Gates", questions: 8 },
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

  // --- Empfänger-Dropdown state ---
  const [openRecipients, setOpenRecipients] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const catalogsByTopic = useMemo(() => {
    const map: Record<string, Catalog[]> = {};
    for (const t of topics) map[t.id] = [];
    for (const c of catalogs) (map[c.topicId] ?? (map[c.topicId] = [])).push(c);
    return map;
  }, [catalogs, topics]);

  const activeTopic = topics.find((t) => t.id === activeTopicId);
  const globalSelectedCount = selectedCatalogIds.size;

  // 🔸 Mitarbeitende der ausgewählten Firma
  const recipientsOfCompany = useMemo(
    () => (companyId ? recipients.filter(r => r.companyId === companyId) : []),
    [recipients, companyId]
  );

  // 🔸 Suche im Dropdown
  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return recipientsOfCompany;
    return recipientsOfCompany.filter(r =>
      r.name.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q)
    );
  }, [recipientSearch, recipientsOfCompany]);

  const allFilteredSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every(e => recipientIds.includes(e.id));

  // 🔸 Firmenwechsel -> Auswahl leeren & Dropdown schließen
  useEffect(() => {
    setRecipientIds([]);
    setRecipientSearch("");
    setOpenRecipients(false);
  }, [companyId]);

  // 🔸 Outside click -> Dropdown schließen
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpenRecipients(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const canAssign = !!companyId && recipientIds.length > 0 && globalSelectedCount > 0;

  function toggleRecipient(id: string) {
    setRecipientIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function toggleCatalog(id: string) {
    setSelectedCatalogIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllInTopic(topicId: string) {
    const allIds = (catalogsByTopic[topicId] ?? []).map(c => c.id);
    setSelectedCatalogIds(prev => {
      const next = new Set(prev);
      const allSelected = allIds.every(id => next.has(id));
      if (allSelected) allIds.forEach(id => next.delete(id));
      else {
        allIds.forEach(id => {
          const cat = catalogs.find(c => c.id === id);
          if (!cat?.assigned) next.add(id);
        });
      }
      return next;
    });
  }

  function selectAllFromCompanyFiltered() {
    if (allFilteredSelected) {
      // abwählen: nur die gefilterten entfernen
      setRecipientIds(prev => prev.filter(id => !filteredRecipients.some(e => e.id === id)));
    } else {
      // hinzufügen: gefilterte addieren
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
            Kataloge zuweisen – <span className="text-slate-700">{activeTopic?.name ?? "Thema"}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Grundinformationen */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-[18px] font-semibold text-slate-900">Grundinformationen</h2>

              <div className="space-y-4">
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
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Empfänger (Dropdown wie im Screenshot) */}
                <div className="space-y-1" ref={dropdownRef}>
                  <label className="text-sm font-medium text-slate-700">
                    Empfänger (Mitarbeitende) <span className="text-red-500">*</span>
                  </label>

                  {/* Feld/Trigger */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (companyId) setOpenRecipients(v => !v); }}
                    disabled={!companyId}
                    className={[
                      "h-11 w-full rounded-lg border px-3 text-left text-sm flex items-center justify-between",
                      companyId ? "border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {recipientIds.length === 0 ? "Empfänger auswählen…" : (
                        <span className="flex gap-2 flex-wrap">
                          {recipientIds
                            .map(id => recipientsOfCompany.find(r => r.id === id))
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
                        >
                          <span className="text-lg">👥</span>
                          <span className="flex-1 text-left">Alle aus Firma auswählen</span>
                          <span className="text-xs text-slate-500">{allFilteredSelected ? "✓" : ""}</span>
                        </button>

                        {/* Optionen */}
                        <div className="max-h-72 overflow-auto py-1">
                          {filteredRecipients.length === 0 ? (
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
                                      {r.type === "team" && <div className="text-xs text-slate-400">(Team)</div>}
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
                  {globalSelectedCount} Katalog(e) ausgewählt
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tabs & Catalogs (unchanged) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#ebebec] bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-[18px] font-semibold text-[#264555]">Kataloge auswählen</h2>
              <p className="mb-4 text-sm text-[#56768f]">Wählen Sie die Kataloge aus, die Sie zuweisen möchten</p>

              <div className="flex gap-6">
                {/* Tablist – links */}
                <div className="w-64">
                  <nav role="tablist" aria-label="Themen" className="flex flex-col gap-2">
                    {topics.map((t) => {
                      const countInTopic = (catalogsByTopic[t.id] ?? []).filter(c => selectedCatalogIds.has(c.id)).length;
                      const active = activeTopicId === t.id;
                      const Icon = t.icon ?? ClipboardList;
                      return (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={active}
                          aria-controls={`panel-${t.id}`}
                          onClick={() => setActiveTopicId(t.id)}
                          className={[
                            "group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                            active ? "border-[#E3BB62] bg-[#ebebec] shadow-sm" : "border-[#ebebec] hover:bg-[#ebebec]/70",
                          ].join(" ")}
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ backgroundColor: t.color ?? "#808080" }}>
                            <Icon size={18} />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-[#264555]">{t.name}</span>
                          </span>
                          {countInTopic > 0 && (
                            <span className="rounded-full bg-[#ebebec] px-2 py-0.5 text-xs text-[#56768f]">
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
                        className="h-11 w-full rounded-lg border border-[#ebebec] pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-[#56768f] focus:outline-none focus:ring-4 focus:ring-[#56768f]/15"
                      />
                      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#56768f]" fill="none" stroke="currentColor" strokeWidth="2">
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
                        <div className="mb-3">
                          <label className="inline-flex select-none items-center gap-2 text-sm text-[#264555]">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => toggleAllInTopic(t.id)}
                              className="h-4 w-4 appearance-none rounded-full border-2 border-[#56768f] checked:bg-[#E3BB62] checked:border-[#E3BB62] focus:outline-none focus:ring-2 focus:ring-[#56768f]/20"
                            />
                            Alle Kataloge dieses Themas auswählen
                          </label>
                        </div>

                        {filtered.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-[#ebebec] p-8 text-center text-sm text-slate-500">
                            Keine Kataloge gefunden.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filtered.map((c) => {
                              const selected = selectedCatalogIds.has(c.id);
                              const disabled = !!c.assigned;
                              return (
                                <label key={c.id} className={["relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                                  selected ? "border-[#E3BB62] bg-[#ebebec]" : "border-[#ebebec] hover:border-[#56768f]/50 hover:bg-[#ebebec]/50",
                                  disabled ? "opacity-60" : ""].join(" ")}>
                                  <input
                                    type="checkbox"
                                    disabled={disabled}
                                    checked={selected}
                                    onChange={() => toggleCatalog(c.id)}
                                    className="mt-1 h-4 w-4 appearance-none rounded-full border-2 border-[#56768f] checked:bg-[#E3BB62] checked:border-[#E3BB62] focus:outline-none focus:ring-2 focus:ring-[#56768f]/20"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-start justify-between gap-3">
                                      <div className="text-[15px] font-semibold text-[#264555]">{c.title}</div>
                                      {c.assigned && <span className="shrink-0 rounded-full border border-[#E3BB62]/40 bg-[#E3BB62]/15 px-2 py-0.5 text-xs text-[#264555]">bereits zugewiesen</span>}
                                    </div>
                                    {c.description && <p className="text-xs leading-5 text-slate-600">{c.description}</p>}
                                    <div className="mt-2 text-xs text-slate-500">{typeof c.questions === "number" ? `${c.questions} Fragen` : "\u00A0"}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-4 text-sm text-slate-600">
                          Ausgewählt: <span className="font-semibold text-[#264555]">{selectedInTopic}</span>
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
