import AdminLayout from "@/apps/app/AdminLayout";
import { useMemo, useState, useEffect, useRef } from "react";
import { Building2, Settings, Pencil, Wrench, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import myLogo from "@/assets/Zero-6-icons-05.webp";

import { getTopicCountForCatalog } from "../service/themaCatalogService";
import { getCompanies, getWorkersByCompany, type WorkerApi } from "../service/companyService";
import { getCatalogs, createCatalog, type CatalogApi, updateCatalog, deleteCatalog } from "../service/catalogService";
import { assignWorkerCatalogBulk } from "../service/assignmentService";


/* ----------------------------- Types & Models ----------------------------- */

export type Company = { id: string; name: string };

export type Recipient = {
  id: string;
  name: string;
  type: "team" | "person";
  companyId: string;
  email?: string;
};

export type KatalogItem = {
  id: string;          // Backend-ID
  name: string;        // aus title gemappt
  subtitle?: string;   // aus description gemappt
  icon?: LucideIcon;
  color?: string;
  topicCount?: number;
};

export type AssignPayload = {
  companyId: string;
  recipientIds: string[];
  catalogIds: string[];     // wir senden Katalog-IDs
  description?: string;
  dueDate?: string;
  note?: string;
};

export type KatalogeZuweisenProps = {
  onAssign?: (payload: AssignPayload) => void;
};

/* --------------------------------- UI ------------------------------------ */

export default function KatalogeZuweisen({ }: KatalogeZuweisenProps) {
  // Kataloge
  const [catalogs, setCatalogs] = useState<KatalogItem[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Firmen & Empfänger
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [companyId, setCompanyId] = useState("");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [note, setNote] = useState("");

  // Auswahl Kataloge
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);; // useState<Set<string>>(new Set())

  // Edit/Lösch-Modus (Icon-Toggle, kein Text)
  const [editMode, setEditMode] = useState(false);

  // Empfänger-Dropdown
  const [openRecipients, setOpenRecipients] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Kurz grüner Glow (3–4 s)
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  // „Neu“-Badge (z. B. 60 s)
  const [badgeIds, setBadgeIds] = useState<Set<string>>(new Set());

  // navigation
  const navigate = useNavigate();

  // Modals
  type DialogMode = "create" | "edit" | "delete";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("edit");
  const [dialogCatalog, setDialogCatalog] = useState<KatalogItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const DEFAULT_ICON: LucideIcon = Building2;
  const DEFAULT_COLOR = "#094c79ff";

  /* ---------- Kataloge laden ---------- */
  async function loadCatalogs(): Promise<KatalogItem[]> {
    try {
      setLoadingCatalogs(true);
      setCatalogError(null);
      const apiList = await getCatalogs();
      const ui: KatalogItem[] = apiList.map((c: CatalogApi) => ({
        id: c.id,
        name: c.title,
        subtitle: c.description ?? undefined,
        icon: DEFAULT_ICON,
        color: DEFAULT_COLOR,
      }));
      // setCatalogs(ui.reverse());
      // Counts parallel laden (Promise.all)
      const withCounts = await Promise.all(
        ui.map(async (k) => {
          try {
            const n = await getTopicCountForCatalog(k.id);
            return { ...k, topicCount: n };
          } catch {
            return { ...k, topicCount: 0 }; // Fallback
          }
        })
      );
      const finalList = withCounts.reverse();
      setCatalogs(finalList);
      return finalList; // damit wir nach dem Create die neuen IDs erkennen
    } catch (e) {
      console.error(e);
      setCatalogError("Kataloge konnten nicht geladen werden.");
      return [];
    } finally {
      setLoadingCatalogs(false);
    }
  }
  useEffect(() => { void loadCatalogs(); }, []);

  /* ---------- Firmen laden ---------- */
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

  /* ---------- Empfänger laden bei Firmenwechsel ---------- */
  function adaptWorkersToRecipients(workers: WorkerApi[]): Recipient[] {
    return workers.map(w => ({
      id: w.id,
      name: w.name,
      type: "person",
      companyId: w.companyId,
      email: w.email,
    }));
  }

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

  function flashNew(ids: string[], glowMs = 4000, badgeMs = 60000) {
    // HIGHLIGHT (grüner Glow)
    setHighlightIds(prev => {
      const next = new Set(prev); ids.forEach(id => next.add(id)); return next;
    });
    window.setTimeout(() => {
      setHighlightIds(prev => {
        const next = new Set(prev); ids.forEach(id => next.delete(id)); return next;
      });
    }, glowMs);

    // BADGE (NEU)
    setBadgeIds(prev => {
      const next = new Set(prev); ids.forEach(id => next.add(id)); return next;
    });
    window.setTimeout(() => {
      setBadgeIds(prev => {
        const next = new Set(prev); ids.forEach(id => next.delete(id)); return next;
      });
    }, badgeMs);
  }

  /* ---------- Empfänger-Filter ---------- */
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

  /* ---------- Outside click fürs Dropdown ---------- */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpenRecipients(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  /* ---------- Form/Actions ---------- */
  const canAssign = !!companyId && recipientIds.length > 0 && !!selectedCatalogId && !!dueDate;

  function toggleRecipient(id: string) {
    setRecipientIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  /**  setSelectedCatalogIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }); */

  /**function toggleCatalog(id: string) {
    setSelectedCatalogId(id);
  } */
  function selectOrToggleCatalog(id: string) {
    setSelectedCatalogId(prev => (prev === id ? null : id));
  }

  function selectAllFromCompanyFiltered() {
    if (filteredRecipients.length === 0) return;
    setRecipientIds(prev => {
      const set = new Set(prev);
      if (allFilteredSelected) filteredRecipients.forEach(r => set.delete(r.id));
      else filteredRecipients.forEach(r => set.add(r.id));
      return Array.from(set);
    });
  }

  async function handleAssign() {
    if (!canAssign) return;
    // userId (assignedById) aus localStorage lesen
    let assignedById = "";
    try {
      const raw = localStorage.getItem("user");
      if (raw) assignedById = JSON.parse(raw)?.id ?? "";
    } catch { }
    if (!assignedById) {
      alert("Fehler: Kein Benutzer gefunden. Bitte erneut anmelden.");
      return;
    }

    // genau eine Katalog-ID ermitteln
    const catalogId = selectedCatalogId;//Array.from(selectedCatalogIds)[0]
    if (!catalogId) return;

    // expiresAt erzeugen – du wolltest KEIN „end of day“,
    //    daher nehmen wir direkt das vom <input type='date'> kommende Datum
    //    und wandeln es schlicht in ISO um (ohne extra Tagesende-Logik):
    if (!dueDate) {
      alert("Bitte ein Fälligkeitsdatum wählen.");
      return;
    }
    const expiresAt = `${dueDate}T00:00:00.000`; // yyyy-MM-dd + "T00:00:00.000"
    const payload = {
      workerIds: recipientIds,
      catalogId,
      expiresAt,
      assignedById,
      notes: note || description || undefined,
    };
    try {
      // Optional: Ladezustand
      // setIsSubmitting(true);

      const res = await assignWorkerCatalogBulk(payload);
      alert(`Zuweisung erfolgreich: ${res.success}/${res.total}`);
      navigate("/admin/adminPanel/zuweisungen", { replace: true });

      // Optional: Formular zurücksetzen
      // setSelectedCatalogIds(new Set());
      // setRecipientIds([]);
      // setDescription(""); setNote(""); setDueDate("");
    } catch (e: any) {
      alert(`Zuweisung fehlgeschlagen: ${e?.message ?? e}`);
    } finally {
      // setIsSubmitting(false);
    }
  }

  /* ---------- Dialog Helper ---------- */
  function openCreateDialog() {
    setDialogMode("create");
    setDialogCatalog(null);     // kein bestehender Katalog
    setFormTitle("");           // leeres Formular
    setFormDesc("");
    setDialogOpen(true);
  }

  function openEditDialog(k: KatalogItem) {
    setDialogMode("edit");
    setDialogCatalog(k);
    setFormTitle(k.name ?? "");
    setFormDesc(k.subtitle ?? "");
    setDialogOpen(true);
  }
  function openDeleteDialog(k: KatalogItem) {
    setDialogMode("delete");
    setDialogCatalog(k);
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
    setTimeout(() => {
      setDialogCatalog(null);
      setFormTitle("");
      setFormDesc("");
    }, 120);
  }
  async function submitDialog() {
    if (dialogMode === "edit" && dialogCatalog) {
      await updateCatalog(dialogCatalog.id, {
        title: formTitle.trim() || dialogCatalog.name,
        description: formDesc.trim() ? formDesc.trim() : null,
      });

      await loadCatalogs();
      closeDialog();
      return;
    }

    if (dialogMode === "delete" && dialogCatalog) {
      await deleteCatalog(dialogCatalog.id);
      setSelectedCatalogId(prev => (prev === dialogCatalog.id ? null : prev));
      await loadCatalogs();
      closeDialog();
      return;
    }

    // CREATE
    if (dialogMode === "create") {
      if (!formTitle.trim()) {
        alert("Bitte einen Titel angeben.");
        return;
      }

      // IDs VOR dem Anlegen merken
      const before = new Set(catalogs.map(c => c.id));

      await createCatalog({
        title: formTitle.trim(),
        description: formDesc.trim() ? formDesc.trim() : undefined,
      });

      // Neu laden und NEUE IDs ermitteln
      const latest: KatalogItem[] = await loadCatalogs();
      const createdIds = latest.filter(k => !before.has(k.id)).map(k => k.id);

      // Aufleuchten + „Neu“-Badge auslösen (4s Glow, 60s Badge)
      if (createdIds.length > 0) {
        flashNew(createdIds, 4000, 60000);
      }

      closeDialog();
      return;
    }
  }
  /* ------------------------------- RENDER -------------------------------- */

  return (

    <AdminLayout>
      {/* Header */}
      <style>
        {`
  @keyframes blinkBg {
    0%, 100% { background-color: #ffffff; }      /* weiß */
    50%       { background-color: #ecfdf5; }     /* green-50 */
  }
  @keyframes glowRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
    50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0.0); }
  }
`}
      </style>

      <header
        className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4" //bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6 zum testen
      >
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
          <div className="justify-self-center">
            <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05]
             [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
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
                    Kataloge zuweisen
                  </h1>
                  <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
                    Hier Kataloge an Kunden zuweisen
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      <div className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Grundinformationen */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-[18px] font-semibold text-slate-900">Grundinformationen</h2>

              {(errorMsg || catalogError) && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg ?? catalogError}
                </div>
              )}

              <div className="space-y-4">
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

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (companyId) setOpenRecipients(v => !v); }}
                    disabled={!companyId || loadingRecipients}
                    className={[
                      "relative w-full rounded-lg border px-3 py-2 text-left text-sm",
                      "flex items-start",
                      companyId
                        ? "border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    ].join(" ")}
                  >
                    <span className="pr-8 w-full">
                      {!companyId ? (
                        <span className="text-slate-400">Zuerst Firma auswählen…</span>
                      ) : recipientIds.length === 0 ? (
                        <span className="text-slate-400">
                          {loadingRecipients ? "Lade Empfänger…" : "Empfänger auswählen…"}
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {recipientIds
                            .map(id => recipients.find(r => r.id === id))
                            .filter(Boolean)
                            .map(r => (
                              <span
                                key={r!.id}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                              >
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

                    <span className="absolute right-2 top-2.5 text-slate-400">👤</span>
                  </button>

                  {openRecipients && (
                    <div className="relative z-40">
                      <div className="absolute mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="p-2 border-b border-slate-200">
                          <input
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Mitarbeitende suchen…"
                            className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            autoFocus
                          />
                        </div>

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

          {/* Right: Katalog-Karten */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#ebebec] bg-white p-6 shadow-sm">
              {/* Header mit Verwaltungs-Link + Icon-Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[#264555]">Kataloge auswählen</h2>

                <div className="flex items-center gap-3">
                  {/* Icon-only Toggle für Edit/Lösch-Modus */}
                  <button
                    type="button"
                    onClick={() => setEditMode(v => !v)}
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg border",
                      editMode ? "border-[#E3BB62] bg-[#fff3c4]" : "border-slate-300 bg-white hover:bg-slate-50",
                    ].join(" ")}
                    aria-pressed={editMode}
                    aria-label={editMode ? "Bearbeitungsmodus aktiv" : "Bearbeitungsmodus inaktiv"}
                    title={editMode ? "Modus: Löschen aktiv" : "Modus aktivieren: Löschen"}
                  >
                    <Wrench size={16} />
                  </button>

                  <Link
                    to="/admin/kataloge/verwaltung"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Themen zuordnen
                  </Link>
                </div>
              </div>

              <p className="mb-4 flex items-center justify-between text-sm text-[#56768f]">
                <span className="truncate">
                  {loadingCatalogs ? "Kataloge werden geladen…" : "Wählen Sie die Kataloge aus, die Sie zuweisen möchten"}
                </span>


                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="ml-3 shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                  title="Neuen Katalog anlegen"
                  aria-label="Neuen Katalog anlegen"
                >
                  <Plus size={16} />
                </button>

              </p>



              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogs.map((k) => {
                  const Icon = k.icon ?? Building2;
                  const selected = selectedCatalogId === k.id;//selectedCatalogIds.has(k.id)
                  const metaLabel = (k.topicCount ?? 0) === 1
                    ? "1 Thema"
                    : `${k.topicCount ?? 0} Themen`;       //"– Themen";

                  // Card-Klick: normal -> Auswahl; im editMode -> Delete-Dialog
                  const onCardClick = () => {
                    if (editMode) openDeleteDialog(k);
                    else selectOrToggleCatalog(k.id);
                  };
                  const isHighlight = highlightIds.has(k.id);
                  const isBadge = badgeIds.has(k.id);


                  return (
                    <div
                      key={k.id}
                      className={[
                        // Basisklassen
                        "relative w-full text-left rounded-xl border p-4 min-h-[132px] cursor-pointer",
                        // sanfte Animation
                        "transition-transform transition-colors duration-300 ease-out",
                        // bestehende Zustände
                        editMode
                          ? "border-[#E3BB62] bg-[#fff8e1]/60 hover:bg-[#fff3c4]/60"
                          : selected
                            ? "border-[#E3BB62] bg-[#ebebec]"
                            : "border-[#ebebec] hover:border-[#56768f]/50 hover:bg-[#ebebec]/50",
                        //  kurzer grüner Glow + leichtes Pop
                       isHighlight
  ? [
      "scale-[1.02]",                         // leichtes Pop
      "ring-2 ring-green-500 ring-offset-2",  // grüner Ring
      "[animation:blinkBg_.9s_ease-in-out_infinite]",   // BG blinkt grün↔weiß
      "[box-shadow:0_0_0_0_rgba(34,197,94,0.35)]",       // Start-Glow
      "[animation:glowRing_1.2s_ease-in-out_infinite]"   // Ring pulsiert
    ].join(" ")
  : ""
                      ].join(" ")}
                      onClick={onCardClick}
                    >
                      {/* rechter Indikator: Auswahl-Kreis ODER X im editMode */}
                      <span
                        className={[
                          "absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2",
                          editMode ? "border-[#E3BB62] text-[#E3BB62]" : "border-[#56768f]",
                        ].join(" ")}
                      >
                        {editMode
                          ? "×"
                          : (selected && <span className="h-3.5 w-3.5 rounded-full bg-[#E3BB62]" />)
                        }
                      </span>
                      {isBadge && (
                        <span className="absolute -left-1 -top-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                          Neu
                        </span>
                      )}

                      <div className="flex items-start gap-3 pr-6">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-xl text-white shrink-0"
                          style={{ backgroundColor: k.color ?? DEFAULT_COLOR }}
                        >
                          <Icon size={18} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-semibold text-[#264555] leading-5 line-clamp-2">
                            {k.name}
                          </div>

                          {k.subtitle && (
                            <div className="mt-1 text-xs text-slate-600 leading-5 line-clamp-2">
                              {k.subtitle}
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">{metaLabel}</span>

                            {/* ✎ Icon-only: öffnet Edit-Modal */}
                            {editMode && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEditDialog(k); }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" //{${editMode ? "" : "hidden"}`} in css
                                title="Katalog bearbeiten"
                                aria-label="Katalog bearbeiten"
                              >
                                <Pencil size={14} />
                              </button>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer-Zeile */}
              <hr className="my-4 border-t border-[#ebebec]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Ausgewählt:</span>
                <span className="font-semibold text-[#264555]">
                  {selectedCatalogId ? "1 Katalog" : "0 Kataloge"}
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

        {/* ---------- Zentrierte Modals für Edit/Delete ---------- */}
        {dialogOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-[16px] font-semibold text-slate-900">
                  {dialogMode === "create"
                    ? "Neuen Katalog anlegen"
                    : dialogMode === "edit"
                      ? "Katalog bearbeiten"
                      : "Katalog löschen"}
                </h3>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {dialogMode === "create" || dialogMode === "edit" ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); void submitDialog(); }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Titel</label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Beschreibung</label>
                      <textarea
                        className="min-h-[96px] w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Optional…"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      Soll der folgende Katalog wirklich gelöscht werden?
                    </p>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <div className="font-medium text-slate-900">{dialogCatalog?.name}</div>
                      {dialogCatalog?.subtitle && (
                        <div className="text-slate-600 line-clamp-2">{dialogCatalog.subtitle}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Abbrechen
                </button>

                {dialogMode === "create" ? (
                  <button onClick={() => void submitDialog()} className="h-10 rounded-lg bg-[#264555] px-4 text-sm font-medium text-white">
                    Anlegen
                  </button>
                ) : dialogMode === "edit" ? (
                  <button onClick={() => void submitDialog()} className="h-10 rounded-lg bg-[#264555] px-4 text-sm font-medium text-white">
                    Speichern
                  </button>
                ) : (
                  <button onClick={() => void submitDialog()} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white">
                    Löschen
                  </button>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
