import AdminLayout from "@/apps/app/AdminLayout";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Building2,
  Settings,
  Pencil,
  Plus,
  ListChecks,
  Trash2,
  Users,
  User,
  Layers,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {
  getTopicCountForCatalog,
  fetchThemenByCatalog,
  type ThemaDto,
} from "../service/themaCatalogService";
import {
  getActiveCompanies,
  getWorkersByCompany,
  type WorkerApi,
} from "../service/companyService";
import {
  getCatalogs,
  createCatalog,
  createCatalogWithModel,
  getCatalogsWithModels,
  setCatalogReifegradModel,
  type CatalogApi,
  type CatalogWithModelApi,
  updateCatalog,
  deleteCatalog,
} from "../service/catalogService";
import { assignWorkerCatalogBulk } from "../service/assignmentService";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { getAllReifegradModels, type ReifegradModel } from "@/api/reifegradModelApi";

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
  id: string; // Backend-ID
  name: string; // aus title gemappt
  subtitle?: string; // aus description gemappt
  icon?: LucideIcon;
  color?: string;
  topicCount?: number;
  reifegradModelId?: string | null;
  reifegradModelName?: string | null;
};

export type AssignPayload = {
  companyId: string;
  recipientIds: string[];
  catalogIds: string[]; // wir senden Katalog-IDs
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
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [companyId, setCompanyId] = useState("");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [note, setNote] = useState("");

  // Auswahl Kataloge
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(
    null
  ); // useState<Set<string>>(new Set())

  const [selectedCatalogTopics, setSelectedCatalogTopics] = useState<
    ThemaDto[] | null
  >(null);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Katalog-Suche
  const [catalogSearch, setCatalogSearch] = useState("");

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

  // Reifegradmodelle für Katalog-Erstellung
  const [reifegradModels, setReifegradModels] = useState<ReifegradModel[]>([]);
  const [selectedReifegradModelId, setSelectedReifegradModelId] = useState<string | null>(null);
  const [loadingReifegradModels, setLoadingReifegradModels] = useState(false);

  const DEFAULT_ICON: LucideIcon = Building2;
  const DEFAULT_COLOR = "#094c79ff";

  // Tooltip state per Katalog
  const [showTooltipFull, setShowTooltipFull] = useState<Map<string, boolean>>(
    new Map()
  );
  const hoverTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const tooltipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Refs für Titel und Beschreibung pro Katalog
  const titleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const descRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [openCompanies, setOpenCompanies] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const topicsRef = useRef<HTMLDivElement | null>(null);
  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companySearch, companies]);

  /* ---------- Kataloge laden ---------- */
  async function loadCatalogs(): Promise<KatalogItem[]> {
    try {
      setLoadingCatalogs(true);
      setCatalogError(null);
      const res = await getCatalogsWithModels();
      const apiList = Array.isArray(res) ? res : [];

      const ui: KatalogItem[] = apiList.map((c: CatalogWithModelApi) => ({
        id: c.id,
        name: c.title,
        subtitle: c.description ?? undefined,
        icon: DEFAULT_ICON,
        color: DEFAULT_COLOR,
        reifegradModelId: c.reifegradModelId ?? null,
        reifegradModelName: c.reifegradModelName ?? null,
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
      // Falls nur leer oder 404, behandeln wir dies als "Keine Kataloge" statt Fehler
      // (simple Heuristik: wenn wir hier landen, setzen wir Error, 
      //  es sei denn wir wollen "leere Liste" erzwingen. 
      //  Aber sicherer ist: apiList check oben fixen.)
      setCatalogError("Kataloge konnten nicht geladen werden.");
      return [];
    } finally {
      setLoadingCatalogs(false);
    }
  }

  useEffect(() => {
    if (selectedCatalogId && topicsRef.current) {
      topicsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedCatalogId]);

  useEffect(() => {
    void loadCatalogs();
  }, []);

  /* ---------- Reifegradmodelle laden ---------- */
  async function loadReifegradModels() {
    try {
      setLoadingReifegradModels(true);
      const models = await getAllReifegradModels();
      setReifegradModels(models);
    } catch (e) {
      console.error("Fehler beim Laden der Reifegradmodelle:", e);
    } finally {
      setLoadingReifegradModels(false);
    }
  }

  useEffect(() => {
    void loadReifegradModels();
  }, []);

  /* ---------- Firmen laden ---------- */
  useEffect(() => {
    (async () => {
      try {
        setErrorMsg(null);
        const list = await getActiveCompanies();
        setCompanies(list);
      } catch (e) {
        console.error(e);
        setErrorMsg("Firmen konnten nicht geladen werden.");
      }
    })();
  }, []);

  /* ---------- Empfänger laden bei Firmenwechsel ---------- */
  function adaptWorkersToRecipients(workers: WorkerApi[]): Recipient[] {
    return workers.map((w) => ({
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
    setHighlightIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    window.setTimeout(() => {
      setHighlightIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, glowMs);

    // BADGE (NEU)
    setBadgeIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    window.setTimeout(() => {
      setBadgeIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, badgeMs);
  }

  /* ---------- Empfänger-Filter ---------- */
  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q)
    );
  }, [recipientSearch, recipients]);

  // Gefilterte Kataloge basierend auf Suchbegriff
  const filteredCatalogs = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return catalogs;
    return catalogs.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        (k.subtitle && k.subtitle.toLowerCase().includes(q))
    );
  }, [catalogSearch, catalogs]);

  const allFilteredSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every((e) => recipientIds.includes(e.id));

  /* ---------- Outside click fürs Dropdown ---------- */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node))
        setOpenRecipients(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  //  Themen des ausgewählten Katalogs laden
  useEffect(() => {
    if (!selectedCatalogId) {
      // Kein Katalog gewählt → Themen zurücksetzen
      setSelectedCatalogTopics(null);
      setTopicsError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingTopics(true);
        setTopicsError(null);

        const themen = await fetchThemenByCatalog(selectedCatalogId);
        if (cancelled) return;

        setSelectedCatalogTopics(themen);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setTopicsError("Themen konnten nicht geladen werden.");
          setSelectedCatalogTopics([]);
        }
      } finally {
        if (!cancelled) setLoadingTopics(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCatalogId]);

  /* ---------- Tooltip Position Update beim Scrollen ---------- */
  useEffect(() => {
    function updateTooltipPositions() {
      tooltipRefs.current.forEach((tooltipEl, catalogId) => {
        if (tooltipEl && showTooltipFull.get(catalogId)) {
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

  /* ---------- Overflow Detection für Tooltip (optional, falls später benötigt) ---------- */
  // Die Refs werden gesetzt, aber die Overflow-Erkennung wird aktuell nicht verwendet,
  // da der Tooltip immer beim Hover über das Logo angezeigt wird

  /* ---------- Form/Actions ---------- */
  const canAssign =
    !!companyId && recipientIds.length > 0 && !!selectedCatalogId && !!dueDate;

  function toggleRecipient(id: string) {
    setRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
    setSelectedCatalogId((prev) => (prev === id ? null : id));
  }

  function selectAllFromCompanyFiltered() {
    if (filteredRecipients.length === 0) return;
    setRecipientIds((prev) => {
      const set = new Set(prev);
      if (allFilteredSelected)
        filteredRecipients.forEach((r) => set.delete(r.id));
      else filteredRecipients.forEach((r) => set.add(r.id));
      return Array.from(set);
    });
  }
  function getAssignedByIdFromSession(): string {
    try {
      //  Session Storage (auth_session)
      const rawSession = sessionStorage.getItem("auth_session");
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const id = parsed?.user?.id;
        if (id && typeof id === "string") return id;
      }

      // Fallback: alter Weg über localStorage("user"),
      //    falls irgendwo noch benutzt
      const rawLocal = localStorage.getItem("user");
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        const id = parsedLocal?.id;
        if (id && typeof id === "string") return id;
      }
    } catch {
      // einfach leer zurückgeben
    }
    return "";
  }

  async function handleAssign() {
    if (!canAssign) return;

    const assignedById = getAssignedByIdFromSession();
    if (!assignedById) {
      alert("Fehler: Kein Benutzer gefunden. Bitte erneut anmelden.");
      return;
    }

    const catalogId = selectedCatalogId;
    if (!catalogId) return;

    if (!dueDate) {
      alert("Bitte ein Fälligkeitsdatum wählen.");
      return;
    }

    const expiresAt = `${dueDate}T00:00:00.000`;

    const payload = {
      workerIds: recipientIds,
      catalogId,
      expiresAt,
      assignedById,
      notes: note || description || undefined,
    };

    try {
      const res = await assignWorkerCatalogBulk(payload);

      alert(`Zuweisung erfolgreich: ${res.success}/${res.total}`);
      sessionStorage.setItem(
        "flash_assignments",
        JSON.stringify({
          workerIds: recipientIds,
          catalogId,
          after: Date.now() - 4000, // kleiner Puffer, falls Backend-Zeit minimal abweicht
          ttlMs: 60_000, // optional: max. 60s gültig
        })
      );
      navigate("/admin/adminPanel/zuweisungen", { replace: true });
    } catch (e: any) {
      alert(`Zuweisung fehlgeschlagen: ${e?.message ?? e}`);
    }
  }

  /* ---------- Dialog Helper ---------- */
  function openCreateDialog() {
    setDialogMode("create");
    setDialogCatalog(null); // kein bestehender Katalog
    setFormTitle(""); // leeres Formular
    setFormDesc("");
    setSelectedReifegradModelId(null); // Reifegradmodell zurücksetzen
    setDialogOpen(true);
  }

  function openEditDialog(k: KatalogItem) {
    setDialogMode("edit");
    setDialogCatalog(k);
    setFormTitle(k.name ?? "");
    setFormDesc(k.subtitle ?? "");
    setSelectedReifegradModelId(k.reifegradModelId ?? null);
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

      // Update Reifegradmodell if it changed
      const currentModelId = dialogCatalog.reifegradModelId ?? null;
      if (selectedReifegradModelId !== currentModelId) {
        await setCatalogReifegradModel(dialogCatalog.id, selectedReifegradModelId);
      }

      await loadCatalogs();
      closeDialog();
      return;
    }

    if (dialogMode === "delete" && dialogCatalog) {
      await deleteCatalog(dialogCatalog.id);

      // Optimistic Update: Sofort aus der Liste entfernen
      setCatalogs((prev) => prev.filter((c) => c.id !== dialogCatalog.id));
      setSelectedCatalogId((prev) => (prev === dialogCatalog.id ? null : prev));

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
      const before = new Set(catalogs.map((c) => c.id));

      // Neuer Aufruf mit optionalem Reifegradmodell
      await createCatalogWithModel({
        title: formTitle.trim(),
        description: formDesc.trim() ? formDesc.trim() : undefined,
        reifegradModelId: selectedReifegradModelId || undefined,
      });

      // Neu laden und NEUE IDs ermitteln
      const latest: KatalogItem[] = await loadCatalogs();
      const createdIds = latest
        .filter((k) => !before.has(k.id))
        .map((k) => k.id);

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
    0%, 100% { background-color: #ffffff; }
    50%       { background-color: #d1fae5; }  /* Intensiveres Grün wie AdminDashboard */
  }
  @keyframes glowRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }  /* Stärkerer Glow */
    50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0.0); }  /* Größerer Ring */
  }
`}
      </style>

      {/* HEADER */}
      <PageHeader
        title="Kataloge zuweisen"
        subtitle="Weisen Sie Kataloge an Mitarbeitende zu und verwalten Sie deren Zugriffe"
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
              
              "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
          }}
        >
        <div className="flex flex-col lg:flex-row gap-5 max-w-[1400px] xl:max-w-[1600px] mx-auto">
          {/* Left: Grundinformationen - FESTE BREITE */}
          <div className="w-full lg:w-[520px] flex-shrink-0">
            <div
              className="relative rounded-2xl p-5  "
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
                Grundinformationen
              </h2>
              <div className="mt-1 h-[3px] mb-3 w-16 rounded-full bg-gradient-to-r from-[#E3BB62] to-[#F2E3A2]" />

              {(errorMsg || catalogError) && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg ?? catalogError}
                </div>
              )}

              <div className="space-y-4">
                {/* Firma */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-slate-700">
                    Firma <span className="text-[#E3BB62]">*</span>
                  </label>

                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setOpenCompanies((v) => !v)}
                    className="relative w-full h-11 rounded-xl border border-[#e5dcc7] bg-white
                  px-3 pr-10 text-left text-sm cursor-pointer
                  focus:outline-none focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]
                  transition-colors"
                  >
                    {companyId ? (
                      companies.find((c) => c.id === companyId)?.name
                    ) : (
                      <span className="text-slate-400">Firma auswählen…</span>
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
                  {openCompanies && (
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
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          placeholder="Firma suchen…"
                          className="h-10 w-full rounded-xl border border-[#e5dcc7] bg-white
          px-3 text-sm placeholder:text-[#9b8f75]
          focus:border-[#E3BB62] focus:outline-none
          focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]"
                          autoFocus
                        />
                      </div>

                      {/* Liste */}
                      <div className="max-h-64 overflow-auto py-2">
                        {filteredCompanies.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Keine Firmen gefunden
                          </div>
                        ) : (
                          filteredCompanies.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setCompanyId(c.id);
                                setOpenCompanies(false);
                                setCompanySearch("");
                              }}
                              className="
  w-full px-4 py-3 text-left text-sm
  transition-colors
  hover:bg-[#fff6db]

  border-b border-[rgba(227,187,98,0.35)]
  last:border-b-0
"

                            >
                              {c.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Empfänger */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-sm font-medium text-slate-700">
                    Empfänger (kunde) <span className="text-[#E3BB62]">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (companyId) setOpenRecipients((v) => !v);
                    }}
                    disabled={!companyId || loadingRecipients}
                    className={[
                      "relative w-full h-11 rounded-xl border px-3 text-left text-sm",
                      "flex items-center transition-colors",
                      companyId
                        ? "border-[#e5dcc7] bg-white hover:bg-[#fffdf7] focus:outline-none focus:ring-3 focus:ring-[rgba(227,187,98,0.25)] focus:border-[#E3BB62]"
                        : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed",
                    ].join(" ")}
                  >
                    <span className="pr-8 w-full">
                      {!companyId ? (
                        <span className="text-slate-400">
                          Zuerst Firma auswählen…
                        </span>
                      ) : recipientIds.length === 0 ? (
                        <span className="text-slate-400">
                          {loadingRecipients
                            ? "Lade Empfänger…"
                            : "Empfänger auswählen…"}
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {recipientIds
                            .map((id) => recipients.find((r) => r.id === id))
                            .filter(Boolean)
                            .map((r) => (
                              <span
                                key={r!.id}
                                className="inline-flex items-center gap-1 rounded-md bg-[#fff6db] px-2 py-1 text-xs text-[#7a5c16]"
                              >
                                {r!.name}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRecipient(r!.id);
                                  }}
                                  className="rounded p-0.5 hover:bg-[#f3e6c3]"
                                  aria-label={`${r!.name} entfernen`}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                        </span>
                      )}
                    </span>

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8f75]">
                      <User size={16} />
                    </span>
                  </button>

                  {openRecipients && (
                    <div className="relative z-40">
                      <div
                        className="absolute  w-full rounded-2xl bg-white"
                        style={{
                          border: "2px solid rgba(190, 146, 52, 0.35)",
                          boxShadow: "0 18px 40px rgba(3, 3, 3, 0.16)",
                        }}
                      >
                        <div className="p-3 border-b border-[#efe7d6]">
                          <input
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Mitarbeitende suchen…"
                            className="h-10 w-full rounded-xl border border-[#e5dcc7] bg-[#ffffff]
px-3 text-sm placeholder:text-[#9b8f75]
focus:border-[#E3BB62] focus:outline-none
focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]
transition-colors"
                            autoFocus
                          />
                        </div>

                        <button
                          type="button"
                          onClick={selectAllFromCompanyFiltered}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm
hover:bg-[#fff6db] transition-colors"
                          disabled={
                            loadingRecipients || recipients.length === 0
                          }
                        >
                          <span className="text-[#9b8f75]">
                            <Users size={16} />
                          </span>

                          <span className="flex-1 text-left">
                            Alle aus Firma auswählen
                          </span>
                          <span className="text-xs text-slate-500">
                            {allFilteredSelected ? "✓" : ""}
                          </span>
                        </button>

                        <div className="max-h-72 overflow-auto py-1">
                          {loadingRecipients ? (
                            <div className="px-3 py-2 text-sm text-slate-500">
                              Laden…
                            </div>
                          ) : filteredRecipients.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500">
                              Keine Ergebnisse
                            </div>
                          ) : (
                            filteredRecipients.map((r) => {
                              const checked = recipientIds.includes(r.id);
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => toggleRecipient(r.id)}
                                  className="
  w-full px-4 py-3 text-left
  transition-colors
  hover:bg-[#fff6db]

  border-b border-[rgba(227,187,98,0.35)]
  last:border-b-0
"

                                >
                                  <div className="flex items-start gap-2">
                                    <span
                                      className="mt-[2px] inline-flex h-4 w-4 items-center justify-center
  rounded-full border"
                                      style={{
                                        borderColor: checked
                                          ? "#E3BB62"
                                          : "#d6c9a6",
                                      }}
                                    >
                                      {checked && (
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#E3BB62]" />
                                      )}
                                    </span>

                                    <div className="min-w-0">
                                      <div className="text-sm text-slate-800 font-medium">
                                        {r.name}
                                      </div>
                                      {r.email && (
                                        <div className="text-xs text-slate-500 truncate">
                                          {r.email}
                                        </div>
                                      )}
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
                  <label className="text-sm font-medium text-slate-700">
                    Beschreibung
                  </label>
                  <textarea
                    className="min-h-[80px] w-full resize-none rounded-xl border border-[#e5dcc7] bg-white
                            px-3 py-2 pr-6 pb-6 text-sm placeholder:text-[#9ca3af]
                            focus:border-[#E3BB62] focus:outline-none
                            focus:ring-2 focus:ring-[rgba(227,187,98,0.25)]
                            transition-colors"
                    placeholder="Beschreibung des Katalogs…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Fällig am */}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Fällig am <span className="text-[#E3BB62]">*</span>
                  </label>
                  <input
                    type="date"
                    className="h-11 w-full rounded-xl border border-[#e5dcc7] bg-white px-3 text-sm
                          focus:border-[#E3BB62] focus:outline-none
                          focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]
                          transition-colors"
                    value={dueDate}
                    required
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {/* Notiz */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Notiz
                  </label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-[#e5dcc7] bg-white px-3 text-sm
                            focus:border-[#E3BB62] focus:outline-none
                            focus:ring-3 focus:ring-[rgba(227,187,98,0.25)]
                            transition-colors"
                    placeholder="Optionale Notiz…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Themen im ausgewählten Katalog */}
                {selectedCatalogId && (
                  <div
                    ref={topicsRef}
                    className="
      mt-5
      rounded-2xl
      border border-[#E3BB62]/30
      bg-gradient-to-b from-[#FFFCF2] to-[#FFF9E6]
      px-4 py-4
      shadow-[0_6px_18px_rgba(212,175,55,0.15)]
      space-y-4
    "
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span
                        className="
          inline-flex h-9 w-9 items-center justify-center
          rounded-xl
          bg-[#E3BB62]/20
          text-[#264555]
        "
                      >
                        <ListChecks className="h-4 w-4" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#264555]">
                          Themen im ausgewählten Katalog
                        </p>

                        {loadingTopics && (
                          <p className="text-xs text-slate-500">
                            Themen werden geladen…
                          </p>
                        )}

                        {!loadingTopics && topicsError && (
                          <p className="text-xs text-red-600">{topicsError}</p>
                        )}

                        {!loadingTopics &&
                          !topicsError &&
                          selectedCatalogTopics && (
                            <p className="text-xs text-[#8a7a52]">
                              {selectedCatalogTopics.length === 1
                                ? "1 Thema"
                                : `${selectedCatalogTopics.length} Themen`}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Themenliste */}
                    {!loadingTopics &&
                      !topicsError &&
                      selectedCatalogTopics &&
                      selectedCatalogTopics.length > 0 && (
                        <ul
                          className="
            max-h-40
            overflow-y-auto
            rounded-xl
            bg-white
            px-3 py-2
            text-xs
            text-[#264555]
            space-y-1.5
            border border-[#E3BB62]/20
          "
                        >
                          {selectedCatalogTopics.map((t) => (
                            <li key={t.id} className="flex items-start gap-2">
                              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                              <span className="leading-relaxed">{t.name}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                    {/* Keine Themen */}
                    {!loadingTopics &&
                      !topicsError &&
                      selectedCatalogTopics &&
                      selectedCatalogTopics.length === 0 && (
                        <p className="text-xs text-slate-500">
                          Für diesen Katalog sind noch keine Themen zugeordnet.
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Aktionen */}
            <div className="pt-3  flex gap-3">
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

              {/* Kataloge zuweisen */}
              <button
                onClick={handleAssign}
                disabled={!canAssign}
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
                Kataloge zuweisen
              </button>
            </div>
          </div>

          {/* Right: Katalog-Karten - FLEXIBEL */}
          <div className="flex-1 w-full  min-w-0">

            <div
              className="rounded-2xl p-6 shadow-sm overflow-visible"
              style={{
                background: "#ffffffff",
                border: "1px solid rgba(184,150,46,0.25)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Header mit Verwaltungs-Link */}
              <div
                className="mb-4 flex items-center justify-between relative"
                style={{ zIndex: 1 }}
              >
                <h2 className="text-[20px] font-semibold text-[#3D3225]">
                  Katalog auswählen
                  <div className="mt-1 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#E3BB62] to-[#F2E3A2]" />{" "}
                </h2>

                <div className="flex items-center gap-3">
                  <Link
                    to="/admin/kataloge/verwaltung"
                    className="
      inline-flex items-center gap-2
      rounded-xl
      border border-[#E3BB62]/60
      bg-gradient-to-r from-[#FFF6DB] to-[#F2E3A2]
      px-4 py-2
      text-sm font-semibold
      text-[#264555]
      shadow-[0_4px_12px_rgba(227,187,98,0.35)]
      transition-all duration-200
      hover:from-[#F2E3A2] hover:to-[#E3BB62]
      hover:shadow-[0_6px_18px_rgba(227,187,98,0.45)]
      
    "
                  >
                    <Settings size={16} className="text-[#264555]" />
                    Themen zuordnen
                  </Link>
                </div>
              </div>

              {/* Such-Feld für Kataloge */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Kataloge durchsuchen..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
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

              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm text-[#6b5a3c] truncate">
                  {loadingCatalogs
                    ? "Kataloge werden geladen…"
                    : catalogSearch
                      ? `${filteredCatalogs.length} ${filteredCatalogs.length === 1
                        ? "Ergebnis"
                        : "Ergebnisse"
                      } gefunden`
                      : "Wählen Sie den Katalog aus, den Sie zuweisen möchten"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="
    inline-flex items-center gap-2
    rounded-xl
    border border-[#F3E6B3]
    bg-[#FFFCF2]
    px-4 py-2
    text-sm font-semibold
    text-[#264555]
    
  "
                  >
                    <span className="text-[15px] font-bold">
                      {catalogs.length}
                    </span>
                    <span className="text-[14px]">
                      {catalogs.length === 1 ? "Katalog" : "Kataloge"}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={openCreateDialog}
                    title="Neuen Katalog anlegen"
                    aria-label="Neuen Katalog anlegen"
                    className="
    inline-flex h-9 w-9 items-center justify-center
    rounded-xl
    border border-[#E3BB62]/60
    bg-gradient-to-br from-[#FFF6DB] to-[#F2E3A2]
    text-[#264555]
   
    transition-colors duration-200
    hover:from-[#F2E3A2] hover:to-[#E3BB62]
  "
                  >
                    <Plus size={19} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div
                className="
    max-h-[520px]
    overflow-y-auto
    overflow-x-visible
    pr-2
  "
              >
                <div
                  className="
                              grid gap-4
                                px-1 pt-1 pb-1
                           [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]
                              
                            "
                >
                  {filteredCatalogs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                      <Layers size={48} className="opacity-40 mb-3" />
                      <p className="text-sm font-medium">
                        {catalogSearch
                          ? `Keine Kataloge gefunden für "${catalogSearch}"`
                          : "Keine Kataloge vorhanden"}
                      </p>
                    </div>
                  ) : (
                    filteredCatalogs.map((k) => {
                      const Icon = k.icon ?? Building2;
                      const selected = selectedCatalogId === k.id; //selectedCatalogIds.has(k.id)
                      const metaLabel =
                        (k.topicCount ?? 0) === 1
                          ? "1 Thema"
                          : `${k.topicCount ?? 0} Themen`; //"– Themen";

                      // Card-Klick: normal -> Auswahl; im editMode -> Delete-Dialog
                      const onCardClick = () => {
                        selectOrToggleCatalog(k.id);
                      };
                      const isHighlight = highlightIds.has(k.id);
                      const isBadge = badgeIds.has(k.id);
                      return (
                        <div
                          key={k.id}
                          className={[
                            "group relative w-full text-left rounded-2xl p-1 min-h-[160px] cursor-pointer",
                            "transition-all duration-300 ease-out",
                            "overflow-visible",
                            selected
                              ? "border border-[#D4AF37] bg-gradient-to-br from-[#FFFAE8] via-[#F6E7B8] to-[#EDD98A] ring-0 ring-[#E3BB62]/50 shadow-[0_10px_30px_rgba(212,175,55,0.28)]"
                              : "border border-[#D4AF37]/30 bg-white hover:shadow-[0_14px_36px_rgba(212,175,55,0.22)]",

                            //  kurzer grüner Glow + leichtes Pop (wie AdminDashboard)
                            isHighlight
                              ? [
                                "ring-2 ring-green-400 ring-offset-2", // grüner Ring
                                "[animation:glowRing_0.8s_ease-in-out_infinite]", // Ring pulsiert (wie AdminDashboard)
                              ].join(" ")
                              : "",
                          ].join(" ")}
                          onClick={onCardClick}
                        >
                          {/* Auswahl-Kreis oben rechts */}
                          <span
                            className="
    absolute right-3 top-3
    inline-flex h-5 w-5 items-center justify-center
    rounded-full border-2
    border-[#56768f]
    transition-colors duration-200
    group-hover:border-[#E3BB62]
    group-hover:bg-[#FFF9E6]
  "
                          >
                            {selected && (
                              <span className="h-3.5 w-3.5 rounded-full bg-[#E3BB62]" />
                            )}
                          </span>

                          {isBadge && (
                            <span className="
      absolute -left-1 -top-1
      z-30
      rounded-md
      bg-amber-500
      px-2 py-0.5
      text-[10px]
      font-semibold
      uppercase
      tracking-wide
      text-white
      shadow
      pointer-events-none
    ">
                              Neu
                            </span>
                          )}

                          <div className="relative flex flex-col gap-2 px-3 overflow-visible">
                            {" "}
                            <span
                              className={[
                                "absolute top-2 left-2 z-10",
                                "flex items-center justify-center",
                                "w-[70px] h-[32px] rounded-[10px]",
                                "transition-all duration-300",
                                "cursor-pointer",

                                // 🔹 NORMAL (leichtes Gold)
                                !selected &&
                                "bg-gradient-to-r from-[#F6E7B8] to-[#EDD98A] shadow-[0_2px_8px_rgba(212,175,55,0.25)]",

                                // 🔸 HOVER (stärkeres Gold)
                                !selected &&
                                "group-hover:from-[#F2E3A2] group-hover:to-[#E3BB62] group-hover:shadow-[0_4px_12px_rgba(212,175,55,0.35)]",

                                // ⭐ SELECTED (kräftiges Gold – dein aktuelles)
                                selected &&
                                "bg-gradient-to-r from-[#E3BB62] to-[#D4AF37] shadow-[0_6px_18px_rgba(212,175,55,0.45)]",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                const timeout = setTimeout(() => {
                                  setShowTooltipFull((prev) => {
                                    const next = new Map(prev);
                                    next.set(k.id, true);
                                    return next;
                                  });
                                }, 350);
                                hoverTimeouts.current.set(k.id, timeout);
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                const timeout = hoverTimeouts.current.get(k.id);
                                if (timeout) {
                                  clearTimeout(timeout);
                                  hoverTimeouts.current.delete(k.id);
                                }
                                setShowTooltipFull((prev) => {
                                  const next = new Map(prev);
                                  next.set(k.id, false);
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
                            {showTooltipFull.get(k.id) && (
                              <div

                                className={`
                      ${showTooltipFull.get(k.id)
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
                                    tooltipRefs.current.set(k.id, el);
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
                                          tooltipWidth / 2 +
                                          100
                                          }px`;
                                      }
                                    }
                                  } else {
                                    tooltipRefs.current.delete(k.id);
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                }}
                                onMouseLeave={(e) => {
                                  e.stopPropagation();
                                  setShowTooltipFull((prev) => {
                                    const next = new Map(prev);
                                    next.set(k.id, false);
                                    return next;
                                  });
                                }}
                              >
                                <b>{k.name}</b>
                                <br />
                                {k.subtitle || "Keine Beschreibung vorhanden"}
                              </div>
                            )}
                            <div className="min-w-0 pt-[52px] text-left">
                              <div
                                ref={(el) => {
                                  if (el) {
                                    titleRefs.current.set(k.id, el);
                                  } else {
                                    titleRefs.current.delete(k.id);
                                  }
                                }}
                                className="text-[15px] font-semibold text-[#264555] leading-5 line-clamp-1 break-words
    overflow-wrap-anywhere"
                              >
                                {k.name}
                              </div>
                              <div
                                ref={(el) => {
                                  if (el) {
                                    descRefs.current.set(k.id, el);
                                  } else {
                                    descRefs.current.delete(k.id);
                                  }
                                }}

                                className="
    mt-0 mb-2
    text-[13px] text-slate-600
    leading-[1.35]
    line-clamp-2
    min-h-[2.25rem]
    break-words
    overflow-wrap-anywhere
  "
                              >
                                {k.subtitle || "\u00A0"}


                              </div>


                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-[#D4AF37]">
                                  {metaLabel}
                                </span>

                                {/* Bearbeiten & Löschen Buttons - nur sichtbar bei Hover, nicht wenn Tooltip angezeigt wird */}
                                {!showTooltipFull.get(k.id) && (
                                  <div
                                    className="
                                          absolute top-30 right-3
                                          flex items-center gap-1.5
                                          opacity-0 group-hover:opacity-100
                                          transition-opacity duration-200
                                          z-20
                                        "
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditDialog(k);
                                      }}
                                      className="
                                              inline-flex h-8 w-8 items-center justify-center
                                              rounded-lg
                                              bg-transparent
                                              text-emerald-600
                                              transition-all duration-200
                                              hover:bg-emerald-100
                                              hover:text-[#264555]
                                            "
                                      title="Katalog bearbeiten"
                                      aria-label="Katalog bearbeiten"
                                    >
                                      <Pencil size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(k);
                                      }}
                                      className="
                                            inline-flex h-8 w-8 items-center justify-center
                                            rounded-lg
                                            bg-transparent
                                            text-red-600
                                            transition-all duration-200
                                            hover:bg-red-100
                                            hover:text-red-600
                                          "
                                      title="Katalog löschen"
                                      aria-label="Katalog löschen"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>{" "}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Zentrierte Modals für Edit ---------- */}
        {
          dialogOpen && dialogMode !== "delete" && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeDialog();
              }}
            >
              <div
                className="w-full max-w-2xl px-4 sm:px-0 flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Karten-Block mit Glow */}
                <div className="w-full relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
                  {/* Deko-Glows */}
                  <div
                    className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                    aria-hidden="true"
                  />

                  {/* Inhalt / Formular */}
                  <div className="relative px-6 pt-6 pb-5 max-h-[calc(100vh-150px)] overflow-y-auto">
                    {/* 🔹 Titelbereich */}
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                      {dialogMode === "create"
                        ? "Neuen Katalog anlegen"
                        : "Katalog bearbeiten"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Felder mit <span className="text-[#E3BB62]">*</span> sind
                      Pflichtfelder.
                    </p>

                    {/* Body */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void submitDialog();
                      }}
                      className="space-y-6"
                    >
                      {/* Titel */}
                      <div>
                        <label
                          htmlFor="catalog-title"
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Titel <span className="text-[#E3BB62]">*</span>
                        </label>
                        <input
                          id="catalog-title"
                          type="text"
                          className={`
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50 border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        `}
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          autoFocus
                        />
                      </div>

                      {/* Beschreibung */}
                      <div>
                        <label
                          htmlFor="catalog-desc"
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Beschreibung
                        </label>
                        <textarea
                          id="catalog-desc"
                          rows={3}
                          className={`
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50 border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                          resize-none
                        `}
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          placeholder="Optional…"
                        />
                      </div>

                      {/* Reifegradmodell */}
                      <div>
                        <label
                          htmlFor="catalog-reifegrad"
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Reifegradmodell
                        </label>
                        <div className="relative">
                          <select
                            id="catalog-reifegrad"
                            className={`
                              w-full rounded-xl border px-3 py-2.5 text-sm
                              bg-slate-50 border-slate-200
                              outline-none appearance-none
                              focus:bg-white
                              focus:border-[#E3BB62]
                              focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                              transition
                              pr-10
                            `}
                            value={selectedReifegradModelId || ""}
                            onChange={(e) =>
                              setSelectedReifegradModelId(e.target.value || null)
                            }
                          >
                            <option value="">Kein Modell auswählen</option>
                            {loadingReifegradModels ? (
                              <option disabled>Lade Modelle…</option>
                            ) : (
                              reifegradModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                  {model.intervals?.length
                                    ? ` (${model.intervals.length} Intervalle)`
                                    : ""}
                                </option>
                              ))
                            )}
                          </select>
                          <ChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={16}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Optional: Weisen Sie diesem Katalog ein Reifegradmodell zu.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Buttons AUSSERHALB des Modals */}
                <div className="mt-3 w-full flex gap-3">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="
                    flex-1 h-12
                    rounded-xl
                    flex items-center justify-center
                    text-sm font-medium
                    text-slate-700
                    bg-white
                    border border-slate-300
                    hover:bg-slate-50
                    transition-colors
                  "
                  >
                    Abbrechen
                  </button>

                  {dialogMode === "create" ? (
                    <button
                      onClick={() => void submitDialog()}
                      className="
                      flex-1 h-12
                      rounded-xl
                      flex items-center justify-center
                      text-sm font-semibold
                      text-[#264555]
                      bg-[#E3BB62]
                      hover:bg-[#d8ac55]
                      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                      transition
                      hover:-translate-y-[1px]
                    "
                    >
                      Anlegen
                    </button>
                  ) : (
                    <button
                      onClick={() => void submitDialog()}
                      className="
                      flex-1 h-12
                      rounded-xl
                      flex items-center justify-center
                      text-sm font-semibold
                      text-[#264555]
                      bg-[#E3BB62]
                      hover:bg-[#d8ac55]
                      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                      transition
                      hover:-translate-y-[1px]
                    "
                    >
                      Speichern
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* ===== Delete Confirm Modal mit ConfirmModal ===== */}
        <ConfirmModal
          open={dialogOpen && dialogMode === "delete" && !!dialogCatalog}
          title="Katalog löschen?"
          description={
            <>
              Willst du den Katalog{" "}
              <span className="font-semibold">{dialogCatalog?.name}</span>{" "}
              wirklich löschen?
            </>
          }
          hintTitle="Hinweis"
          hintText={
            <>
              Diese Aktion kann{" "}
              <span className="font-semibold text-red-700">
                nicht rückgängig gemacht
              </span>{" "}
              werden.
            </>
          }
          cancelLabel="Abbrechen"
          confirmLabel="Ja, löschen"
          onCancel={closeDialog}
          onConfirm={() => void submitDialog()}
          icon={<Trash2 className="text-red-500" />}
        />
      </main >
    </AdminLayout >
  );
}
