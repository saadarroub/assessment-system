import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { PermissionButton } from "@/shared/components/permission/PermissionButton";
import { useScrollLock } from "@/shared/hooks/useScrollLock";

import {
  getCompany,
  getWorkersByCompany,
  createWorker,
  updateWorker,
  deleteWorker,
  type WorkerApi,
  getAssignmentsByCompany,
  type AssignmentApi,
  type CompanyApi,
  changeCompanyStatus,
  changeWorkerStatus,
  getWorkerAssignmentCount,
} from "@/features/service/companyService";
import {
  Pencil,
  Trash2,
  UserPlus,
  Globe2,
  MapPin,
  Clock3,
  Phone,
  Globe,
  Network,
  Building2, Users, Folder
} from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import ConfirmModal from "@/shared/components/ConfirmModal";

const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

/* ---------- Typen + Mapper ---------- */
type CompanyDetailsT = {
  id: string;
  name: string;
  status: "active" | "inactive";
  created: string | null;
  updated: string | null;
  description?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  usersCount?: number;
  catalogsCount?: number;
};

const toISOorNull = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

function mapApiToDetails(x: CompanyApi): CompanyDetailsT {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: (x.status as "active" | "inactive") ?? "active",
    created: toISOorNull((x as any).created_at ?? x.createdAt),
    updated: toISOorNull(x.updatedAt),
    description: x.description ?? null,
    street: x.street ?? null,
    postalCode: x.postalCode ?? null,
    city: x.city ?? null,
    country: x.country ?? null,
    website: x.website ?? null,
    phone: x.phone ?? null,
  };
}

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "—";

type TabKey = "users" | "catalogs";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();

  const [company, setCompany] = useState<CompanyDetailsT | null>(null);
  const [tab, setTab] = useState<TabKey>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { has } = useHasPermission();

  const canChangeCompany = has("companies.change"); // Status toggle
  const canCreateWorker = has("workers.create");    // Invite Worker
  const canEditWorker = has("workers.edit");      // Edit Worker
  const canDeleteWorker = has("workers.delete");    // Delete Worker


  // Workers
  const [workers, setWorkers] = useState<WorkerApi[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);

  // Invite
  const [openInvite, setOpenInvite] = useState(false);
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invWorkspace, setInvWorkspace] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Edit
  const [editing, setEditing] = useState<WorkerApi | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWs, setFormWs] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete
  const [toDelete, setToDelete] = useState<WorkerApi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Assignments
  const [assignments, setAssignments] = useState<AssignmentApi[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive" | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Worker Status Toggle
  const [confirmWorkerStatusOpen, setConfirmWorkerStatusOpen] = useState(false);
  const [targetWorker, setTargetWorker] = useState<WorkerApi | null>(null);
  const [pendingWorkerStatus, setPendingWorkerStatus] = useState<"active" | "inactive" | null>(null);
  const [changingWorkerStatus, setChangingWorkerStatus] = useState(false);
  const [workerStatusError, setWorkerStatusError] = useState<string | null>(null);
  const [workerAssignmentCount, setWorkerAssignmentCount] = useState<number>(0);

  // Scroll Lock für alle Modals
  const anyModalOpen = openInvite || !!editing || !!toDelete || confirmStatusOpen || confirmWorkerStatusOpen;
  useScrollLock(anyModalOpen);

function onStatusClick() {
  if (!company) return;
  if (!canChangeCompany || changingStatus) return; // <-- neu

  const next: "active" | "inactive" = company.status === "active" ? "inactive" : "active";
  setPendingStatus(next);
  setStatusError(null);
  setConfirmStatusOpen(true);
}




  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("de-DE") : "—";

  const statusBadge = (s: AssignmentApi["status"]) => {
    if (s === "completed")
      return "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]";
    if (s === "in_progress")
      return "bg-[rgb(254,243,199)] text-[rgb(146,64,14)]";
    if (s === "expired")
      return "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]";
    if (s === "blocked")
      return "bg-[rgb(226,232,240)] text-[rgb(71,85,105)]"; // slate colors
    return "bg-[rgb(229,231,235)] text-[rgb(55,65,81)]"; // assigned
  };

  /* ---------- Assignments laden ---------- */
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setAssignLoading(true);
    setAssignError(null);
    (async () => {
      try {
        const list = await getAssignmentsByCompany(id);
        if (alive) setAssignments(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (alive) setAssignError(e?.message ?? String(e));
      } finally {
        if (alive) setAssignLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  /* ---------- Company laden ---------- */
  useEffect(() => {
    let alive = true;
    if (!id) {
      setError("Keine ID in der URL gefunden.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const raw = await getCompany(id);
        const mapped = mapApiToDetails(raw);
        if (alive) setCompany(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  /* ---------- Workers laden ---------- */
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setWorkersLoading(true);
    setWorkersError(null);
    (async () => {
      try {
        const list = await getWorkersByCompany(id);
        if (alive) setWorkers(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (alive) setWorkersError(e?.message ?? String(e));
      } finally {
        if (alive) setWorkersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

function StatusToggle({
  value,
  disabled,
  disabledReason,
  onToggle,
}: {
  value: "active" | "inactive";
  disabled?: boolean;
  disabledReason?: string;
  onToggle: () => void;
}) {
  const isActive = value === "active";

  return (
    <button
      type="button"
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onToggle();
      }}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "transition-all select-none",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-[1.03]",
      ].join(" ")}
      style={{
        background: isActive ? "rgba(34,197,94,0.18)" : "rgba(148,163,184,0.22)",
        color: isActive ? "#16a34a" : "#64748b",
      }}
      title={
        disabled
          ? (disabledReason ?? "Du hast keine Berechtigung.")
          : (isActive ? "Firma ist aktiv" : "Firma ist inaktiv")
      }
    >
      <span className="text-[12px] font-semibold">
        {isActive ? "aktiv" : "inaktiv"}
      </span>

      <span
        className="relative h-5 w-9 rounded-full border"
        style={{
          background: isActive ? "#22c55e" : "#94a3b8",
          borderColor: "rgba(0,0,0,0.10)",
        }}
        aria-hidden
      >
        <span
          className={[
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white",
            "transition-all shadow",
          ].join(" ")}
          style={{ left: isActive ? "calc(100% - 18px)" : "2px" }}
        />
      </span>
    </button>
  );
}




  /* ---------- Loading/Errors ---------- */
  if (loading) {
    return (
      <AdminLayout>
        <PageHeader
          title="Firmen-Verwaltung"
          subtitle="Lade Firmendetails ..."
          icon={<Network size={40} />}
          gradient="navy"
          height="280px"
          showPattern={true}
          center={false}
        />
      </AdminLayout>
    );
  }

  if (error || !company) {
    return (
      <AdminLayout>
        <PageHeader
          title="Firmen-Verwaltung"
          subtitle={error ?? "Company nicht gefunden – bitte URL prüfen."}
          icon={<Network size={40} />}
          gradient="navy"
          height="280px"
          showPattern={true}
          center={false}
        />
      </AdminLayout>
    );
  }

  /* ---------- abgeleitete Werte ---------- */
  const usersCount =
    typeof company.usersCount === "number"
      ? company.usersCount
      : workers.length;

  const totalAssignmentsCount = assignments.length;

  const catalogsCount = (() => {
    const ids = new Set<string>();
    for (const a of assignments) if (a?.catalog?.id) ids.add(a.catalog.id);
    return ids.size;
  })();

  /* ---------- Invite ---------- */
  function openInviteModal() {
    setInvName("");
    setInvEmail("");
    setInvWorkspace("");
    setCreateErr(null);
    setOpenInvite(true);
  }
  function cancelInvite() {
    if (!creating) setOpenInvite(false);
  }
  async function onInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!invName.trim() || !invEmail.trim()) {
      setCreateErr("Bitte Name und Email ausfüllen.");
      return;
    }
    setCreating(true);
    setCreateErr(null);
    try {
      const created = await createWorker({
        name: invName.trim(),
        email: invEmail.trim(),
        workSpaceRef: invWorkspace.trim() || undefined,
        companyId: id,
      });
      setWorkers((prev) => [created, ...prev]);
      setOpenInvite(false);
    } catch (err: any) {
      setCreateErr(err?.message ?? String(err));
    } finally {
      setCreating(false);
    }
  }

  /* ---------- Edit ---------- */
  function openEdit(w: WorkerApi) {
    setEditing(w);
    setFormName(w.name ?? "");
    setFormEmail(w.email ?? "");
    setFormWs(w.workSpaceRef ?? "");
    setSaveError(null);
  }
  function cancelEdit() {
    if (!saving) {
      setEditing(null);
      setSaveError(null);
    }
  }
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !company) return;

    if (!formName.trim() || !formEmail.trim()) {
      setSaveError("Bitte Name und Email ausfüllen.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const optimistic = {
      ...editing,
      name: formName,
      email: formEmail,
      workSpaceRef: formWs,
    };
    setWorkers((prev) =>
      prev.map((x) => (x.id === editing.id ? optimistic : x)),
    );

    try {
      const updated = await updateWorker(editing.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        workSpaceRef: formWs.trim(),
        companyId: company.id,
      });
      setWorkers((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
      setEditing(null);
    } catch (err: any) {
      setSaveError(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete ---------- */
  function askDelete(w: WorkerApi) {
    setToDelete(w);
    setDeleteError(null);
  }
  function cancelDelete() {
    if (!deleting) {
      setToDelete(null);
      setDeleteError(null);
    }
  }
  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const snapshot = workers;
    setWorkers((prev) => prev.filter((x) => x.id !== toDelete.id));
    try {
      await deleteWorker(toDelete.id);
      setToDelete(null);
    } catch (err: any) {
      setWorkers(snapshot);
      setDeleteError(err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  }

  /* ---------- Worker Status Toggle ---------- */
  async function onWorkerStatusClick(worker: WorkerApi) {
    if (!worker || changingWorkerStatus) return;
    
    const nextStatus: "active" | "inactive" = 
      (worker.status === "active" || !worker.status) ? "inactive" : "active";
    
    setTargetWorker(worker);
    setPendingWorkerStatus(nextStatus);
    setWorkerStatusError(null);
    
    // Fetch assignment count
    try {
      const count = await getWorkerAssignmentCount(worker.id);
      setWorkerAssignmentCount(count);
    } catch (err) {
      setWorkerAssignmentCount(0);
    }
    
    setConfirmWorkerStatusOpen(true);
  }

  async function confirmWorkerStatusChange() {
    if (!targetWorker) return;
    
    setChangingWorkerStatus(true);
    setWorkerStatusError(null);
    
    try {
      const updated = await changeWorkerStatus(targetWorker.id);
      
      // Update workers list
      setWorkers((prev) => 
        prev.map((w) => w.id === updated.id ? updated : w)
      );
      
      setConfirmWorkerStatusOpen(false);
      setTargetWorker(null);
      setPendingWorkerStatus(null);
    } catch (err: any) {
      setWorkerStatusError(err?.message ?? String(err));
    } finally {
      setChangingWorkerStatus(false);
    }
  }

  function cancelWorkerStatusChange() {
    if (!changingWorkerStatus) {
      setConfirmWorkerStatusOpen(false);
      setTargetWorker(null);
      setPendingWorkerStatus(null);
      setWorkerStatusError(null);
      setWorkerAssignmentCount(0);
    }
  }

  /* ---------- Render ---------- */
  return (
    <AdminLayout>
      {/* ===== Hero wie User-Seiten ===== */}
      <PageHeader
        title="Firmen-Verwaltung"
        subtitle="Verwalte Firmen, zugeordnete Worker und Katalog-Zuweisungen in CapConsulting."
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/* ===== Außenbereich unter dem Hero ===== */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +

            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >

        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto space-y-4">
          {/* ==== Top-Bar: Breadcrumb-Pill + Zur Liste ==== */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Breadcrumb-Pill (wie bei Users) */}
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
                  <Building2 size={14} />
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

                <Link
                  to="/admin/adminPanel/companies"
                  className="hover:underline"
                  style={{ color: CSS.mutedFg }}
                >
                  Companies
                </Link>

                <span
                  className="text-[11px] opacity-60"
                  style={{ color: CSS.mutedFg }}
                >
                  ›
                </span>

                <span
                  className="font-semibold max-w-[180px] truncate"
                  style={{ color: "hsl(var(--foreground))" }}
                  title={company.name}
                >
                  {company.name}
                </span>
              </div>
            </nav>

            <Link
              to="/admin/adminPanel/companies"
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                text-xs sm:text-sm font-medium
                bg-white
                hover:bg-slate-50
              "
              style={{ borderColor: BRAND.sand, color: BRAND.navy }}
            >
              <span className="text-base leading-none">←</span>
              <span>Zur Übersicht</span>
            </Link>
          </div>

          {/* ===== 2-Spalten-Layout: Links Details, rechts Meta/Stats ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] gap-5 lg:gap-6">
            {/* Linke Spalte */}
            <div className="space-y-5">
              {/* Company Information Card */}
              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.05)]"
                style={{ borderColor: BRAND.sand }}
              >
                {/* HEADER: full width */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  {/* links */}
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(38,69,85,0.10)", color: BRAND.navy }}
                      aria-hidden
                    >
                      <Building2 size={18} />
                    </div>

                    <div>
                      <h2 className="text-[15px] font-semibold leading-tight text-slate-900">
                        Firmen-Informationen
                      </h2>
                      <p className="text-[12px] text-slate-500 m-0">
                        Stammdaten, Beschreibung und Standort der Firma.
                      </p>
                    </div>
                  </div>

                  {/* rechts (Badge) */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold"
                    style={{
                      background: "rgba(227,187,98,0.35)",
                      color: BRAND.navy,
                      border: `1px solid ${BRAND.sand}`,
                    }}
                  >
                    {(company?.name?.charAt(0) ?? "?").toUpperCase()}
                  </div>
                </div>

                {/* Name + Beschreibung + Land/Ort + Created */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5 py-4">
                  <div className="space-y-4">
                    {/* Name + ID */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">
                        🏢
                      </span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Firmenname / ID
                        </p>
                        <p className="m-0 text-[15px] font-semibold">
                          {company.name}
                        </p>
                        <p className="m-0 text-[12px] text-slate-500">
                          ID: {company.id}
                        </p>
                      </div>
                    </div>

                    {/* Beschreibung */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">📝</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Beschreibung
                        </p>
                        <p className="m-0 text-[14px] text-slate-700">
                          {company.description
                            ? company.description
                            : "Keine Unternehmensbeschreibung hinterlegt."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Standort Badges */}
                    <div>
                      <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                        Standort
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[0.8rem] font-medium text-slate-700">
                          <Globe2 className="h-3 w-3 text-emerald-500" />
                          {company.country || "Land unbekannt"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[0.8rem] font-medium text-slate-700">
                          <MapPin className="h-3 w-3 text-rose-500" />
                          {company.city || "Ort unbekannt"}
                        </span>
                        {company.created && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[0.8rem] font-medium text-slate-700">
                            <Clock3 className="h-3 w-3 text-sky-500" />
                            Erstellt am {formatDate(company.created)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Adresse */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">📍</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Adresse
                        </p>
                        {company.street ||
                          company.postalCode ||
                          company.city ||
                          company.country ? (
                          <div className="m-0 text-[14px] text-slate-700 space-y-0.5">
                            {company.street && <div>{company.street}</div>}
                            {(company.postalCode || company.city) && (
                              <div>
                                {company.postalCode} {company.city}
                              </div>
                            )}
                            {company.country && <div>{company.country}</div>}
                          </div>
                        ) : (
                          <p className="m-0 text-[14px] text-slate-500">
                            Keine Adressdaten hinterlegt.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Kontakt Card */}

              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.05)]"
                style={{ borderColor: BRAND.sand }}
              >
                {/* HEADER: full width */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(38,69,85,0.10)", color: BRAND.navy }}
                      aria-hidden
                    >
                      <Phone size={18} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
                        Kontakt
                      </h3>
                      <p className="text-[12px] text-slate-500 m-0">
                        Telefon & Website der Firma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BODY: hier erst Padding */}
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                        Telefon
                      </p>
                      <p className="m-0 text-[14px] text-slate-700">
                        {company.phone || "Keine Telefonnummer hinterlegt."}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                        Website
                      </p>
                      <p className="m-0 text-[14px] text-slate-700">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80"
                          >
                            <Globe className="h-3 w-3" />
                            {company.website}
                          </a>
                        ) : (
                          "Keine Website hinterlegt."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>





              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.05)]"
                style={{ borderColor: BRAND.sand }}
              >
                {/* Tabs Header (full width wie Meta-Header) */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                  role="tablist"
                  aria-label="Company Tabs"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === "users"}
                      onClick={() => setTab("users")}
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold",
                        "transition-all border",
                        tab === "users" ? "shadow-sm" : "hover:bg-white/60",
                      ].join(" ")}
                      style={{
                        borderColor: BRAND.sand,
                        background: tab === "users" ? "rgba(227,187,98,0.35)" : "rgba(255,255,255,0.35)",
                        color: BRAND.navy,
                      }}
                    >
                      <Users className="h-4 w-4" />
                      Workers <span className="opacity-80">({usersCount})</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === "catalogs"}
                      onClick={() => setTab("catalogs")}
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold",
                        "transition-all border",
                        tab === "catalogs" ? "shadow-sm" : "hover:bg-white/60",
                      ].join(" ")}
                      style={{
                        borderColor: BRAND.sand,
                        background: tab === "catalogs" ? "rgba(227,187,98,0.35)" : "rgba(255,255,255,0.35)",
                        color: BRAND.navy,
                      }}
                    >
                      <Folder className="h-4 w-4" />
                      Catalogs <span className="opacity-80">({totalAssignmentsCount})</span>
                    </button>
                  </div>
                </div>

                {/* Body Padding */}
                <div className="px-5 py-4">
                  {/* Workers TAB */}
                  {tab === "users" && (
                    <div>
                      {workersLoading ? (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                          <div
                            className="text-[56px] leading-none mb-3 opacity-80"
                            aria-hidden
                          >
                            ⏳
                          </div>
                          <p className="text-[1.125rem] text-[hsl(var(--foreground))] m-0">
                            Lade Worker…
                          </p>
                        </div>
                      ) : workersError ? (
                        <div
                          className="admin-error"
                          role="alert"
                          style={{ margin: "0.75rem 0" }}
                        >
                          {workersError}
                        </div>
                      ) : workers.length === 0 ? (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                          <div
                            className="text-[56px] leading-none mb-3 opacity-80"
                            aria-hidden
                          >
                            👥
                          </div>
                          <p className="text-[1.125rem] text-[hsl(var(--foreground))] mb-1">
                            Keine Worker vorhanden.
                          </p>
                          <p className="text-[.95rem] m-0">
                            Füge über „Worker hinzufügen“ neue Worker hinzu.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white">
                            <thead
                              className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                              style={{
                                background:
                                  "linear-gradient(to right, #ebebec, #ffffff)",
                                borderBottom: "2px solid #d2c9b9",
                                color: "#264555",
                              }}
                            >
                              <tr>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Workspace
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Created
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Actions
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {workers.map((w) => (
                                <tr
                                  key={w.id}
                                  className="
                                  bg-white
                                  transition
                                  border-l-[4px] border-transparent
                                  hover:border-[#E3BB62]
                                  hover:bg-[#fff9ec]
                                  hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                                "
                                >
                                  <td
                                    className="px-4 py-4 text-sm font-semibold"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {w.name || "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {w.email || "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {w.workSpaceRef || "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    <StatusToggle
                                      value={(w.status as "active" | "inactive") || "active"}
                                      onToggle={() => onWorkerStatusClick(w)}
                                      disabled={changingWorkerStatus}
                                    />
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {w.createdAt
                                      ? new Date(
                                        w.createdAt,
                                      ).toLocaleDateString("de-DE")
                                      : "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <PermissionButton
                                        type="button"
                                        allowed={canEditWorker}
                                        tooltip="Du brauchst: workers.edit"
                                        onClick={() => openEdit(w)}
                                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-semibold hover:bg-slate-50"
                                        style={{ borderColor: CSS.border, color: CSS.fg }}
                                        title="Bearbeiten"
                                      >
                                        <Pencil size={14} />
                                        Edit
                                      </PermissionButton>

                                      <PermissionButton
                                        type="button"
                                        allowed={canDeleteWorker}
                                        tooltip="Du brauchst: workers.delete"
                                        onClick={() => askDelete(w)}
                                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        style={{ borderColor: "rgb(254 202 202)" }}
                                        title="Löschen"
                                      >
                                        <Trash2 size={14} />
                                        Delete
                                      </PermissionButton>

                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Catalogs TAB */}
                  {tab === "catalogs" && (
                    <div>
                      {assignLoading ? (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                          <div
                            className="text-[56px] leading-none mb-3 opacity-80"
                            aria-hidden
                          >
                            📁
                          </div>
                          <p className="text-[1.125rem] text-[hsl(var(--foreground))] m-0">
                            Lade Zuweisungen…
                          </p>
                        </div>
                      ) : assignError ? (
                        <div
                          className="admin-error"
                          role="alert"
                          style={{ margin: "0.75rem 0" }}
                        >
                          {assignError}
                        </div>
                      ) : assignments.length === 0 ? (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                          <div
                            className="text-[56px] leading-none mb-3 opacity-80"
                            aria-hidden
                          >
                            📁
                          </div>
                          <p className="text-[1.125rem] text-[hsl(var(--foreground))] mb-1">
                            Keine Katalog-Zuweisungen vorhanden.
                          </p>
                          <p className="text-[.95rem] m-0">
                            Lege über „Assign Catalog“ neue Zuweisungen an.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white">
                            <thead
                              className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                              style={{
                                background:
                                  "linear-gradient(to right, #ebebec, #ffffff)",
                                borderBottom: "2px solid #d2c9b9",
                                color: "#264555",
                              }}
                            >
                              <tr>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Worker
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Workspace
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Catalog
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Assigned
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Expires
                                </th>
                                <th className="px-4 py-3 text-[0.85rem] font-semibold text-left">
                                  Completed
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignments.map((a) => (
                                <tr
                                  key={a.id}
                                  className="
                                  bg-white
                                  transition
                                  border-l-[4px] border-transparent
                                  hover:border-[#E3BB62]
                                  hover:bg-[#fff9ec]
                                  hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                                "
                                >
                                  <td
                                    className="px-4 py-4 text-sm font-semibold"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {a.worker?.name ?? "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {a.worker?.email ?? "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {a.worker?.workSpaceRef ?? "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {a.catalog?.title ?? "—"}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge(
                                        a.status,
                                      )}`}
                                    >
                                      {a.status}
                                    </span>
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {fmt(a.assignedAt)}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {fmt(a.expiresAt)}
                                  </td>
                                  <td
                                    className="px-4 py-4 text-sm"
                                    style={{
                                      color: CSS.mutedFg,
                                      borderBottom: `1px solid ${CSS.border}`,
                                    }}
                                  >
                                    {fmt(a.completedAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Rechte Spalte: Meta + Actions (wie UserDetails Sidebar) */}
            <aside className="space-y-5">
              {/* Meta / Stats */}
              <section
                className="
    rounded-[18px] border bg-white
    shadow-[0_10px_26px_rgba(0,0,0,0.05)]
    overflow-hidden
  "
                style={{ borderColor: BRAND.sand }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(38,69,85,0.10)",
                        color: BRAND.navy,
                      }}
                      aria-hidden
                    >
                      <Building2 size={18} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
                        Firmen-Metadaten
                      </h3>
                      <p className="text-[12px] text-slate-500 m-0">
                        Systeminfos & Kennzahlen
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                 <StatusToggle
  value={company.status}
  onToggle={onStatusClick}
  disabled={changingStatus || !canChangeCompany}
  disabledReason={!canChangeCompany ? "Du brauchst: companies.change" : undefined}
/>

                </div>

                {/* Rows */}
                <div className="px-5 py-4">
                  <dl className="divide-y" style={{ borderColor: BRAND.sand }}>
                    {/* Company ID */}
                    <div className="py-3 flex items-start justify-between gap-4">
                      <dt className="text-[13px] font-medium" style={{ color: CSS.mutedFg }}>
                        Company ID
                      </dt>
                      <dd className="min-w-0 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <code
                            className="text-[12.5px] font-semibold truncate max-w-[260px]"
                            style={{ color: BRAND.navy }}
                            title={company.id}
                          >
                            {company.id}
                          </code>
                        </div>
                      </dd>
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <dt className="text-[13px] font-medium" style={{ color: CSS.mutedFg }}>
                        Created
                      </dt>
                      <dd className="text-[13px] font-semibold" style={{ color: BRAND.navy }}>
                        {formatDate(company.created)}
                      </dd>
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <dt className="text-[13px] font-medium" style={{ color: CSS.mutedFg }}>
                        Updated
                      </dt>
                      <dd className="text-[13px] font-semibold" style={{ color: BRAND.navy }}>
                        {formatDate(company.updated)}
                      </dd>
                    </div>

                    {/* Counts */}
                    <div className="py-3 flex items-center justify-between">
                      <dt className="text-[13px] font-medium" style={{ color: CSS.mutedFg }}>
                        Workers
                      </dt>
                      <dd className="text-[13px] font-semibold" style={{ color: BRAND.navy }}>
                        {usersCount}
                      </dd>
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <dt className="text-[13px] font-medium" style={{ color: CSS.mutedFg }}>
                        Catalogs
                      </dt>
                      <dd className="text-[13px] font-semibold" style={{ color: BRAND.navy }}>
                        {catalogsCount}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>


              {/* Actions */}
              <section
                className="
                  rounded-[18px] border
                  shadow-[0_10px_26px_rgba(0,0,0,0.05)]
                  px-5 py-5
                  bg-white
                "
                style={{ borderColor: BRAND.sand }}
              >
                <h3 className="text-[16px] font-semibold tracking-tight mb-3">
                  Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <PermissionButton
                    type="button"
                    allowed={canCreateWorker}
                    tooltip="Du brauchst: workers.create"
                    onClick={openInviteModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
                    style={{
                      background: "hsl(40,60%,63%)",
                      color: "hsl(200,32%,22%)",
                      boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                    }}
                  >
                    <UserPlus size={16} />
                    Worker hinzufügen
                  </PermissionButton>

                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* ===== Invite Worker Modal – Style wie Create User ===== */}
      {openInvite && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  Worker einladen
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Felder mit <span className="text-red-500">*</span> sind
                  Pflichtfelder.
                </p>

                {createErr && (
                  <div
                    className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="alert"
                  >
                    {createErr}
                  </div>
                )}

                <form
                  id="invite-worker-form"
                  onSubmit={onInviteSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="cw-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cw-name"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      placeholder="z. B. Max Mustermann"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cw-mail"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cw-mail"
                      type="email"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={invEmail}
                      onChange={(e) => setInvEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cw-ws"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Workspace
                    </label>
                    <input
                      id="cw-ws"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={invWorkspace}
                      onChange={(e) => setInvWorkspace(e.target.value)}
                      placeholder="z. B. HQ-01"
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={cancelInvite}
                className="
                  flex-1 h-12 text-sm font-medium
                  text-slate-800 bg-[#f3f3f3]
                  hover:bg-[#e5e5e5]
                  border border-slate-200
                  rounded-xl disabled:opacity-60
                "
                disabled={creating}
              >
                Abbrechen
              </button>
              <PermissionButton
                type="submit"
                form="invite-worker-form"
                allowed={canCreateWorker}
                tooltip="Du brauchst: workers.create"
                disabled={creating}
                className="
    flex-1 h-12 text-sm font-semibold
    rounded-xl
    bg-[#E3BB62] text-[#264555]
    hover:bg-[#d8ac55]
    shadow-[0_10px_30px_rgba(0,0,0,0.18)]
    transition hover:-translate-y-[1px]
    disabled:opacity-60
  "
              >
                {creating ? "Erstelle…" : "Einladen"}
              </PermissionButton>

            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Worker Modal – wie Edit User ===== */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                  Worker bearbeiten
                </h3>

                {saveError && (
                  <div
                    className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                    role="alert"
                  >
                    {saveError}
                  </div>
                )}

                <form
                  id="edit-worker-form"
                  onSubmit={onSave}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="w-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Name *
                    </label>
                    <input
                      id="w-name"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="w-mail"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      id="w-mail"
                      type="email"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="w-ws"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Workspace
                    </label>
                    <input
                      id="w-ws"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={formWs}
                      onChange={(e) => setFormWs(e.target.value)}
                      placeholder="z. B. Senior Consulting"
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="
                  flex-1 h-12 text-sm font-medium
                  text-slate-800 bg-[#f3f3f3]
                  hover:bg-[#e5e5e5]
                  border border-slate-200
                  rounded-xl disabled:opacity-60
                "
                disabled={saving}
              >
                Abbrechen
              </button>
              <PermissionButton
                type="submit"
                form="edit-worker-form"
                allowed={canEditWorker}
                tooltip="Du brauchst: workers.edit"
                disabled={saving}
                className="
    flex-1 h-12 text-sm font-semibold
    rounded-xl
    bg-[#E3BB62] text-[#264555]
    hover:bg-[#d8ac55]
    shadow-[0_10px_30px_rgba(0,0,0,0.18)]
    transition hover:-translate-y-[1px]
    disabled:opacity-60
  "
              >
                {saving ? "Speichere…" : "Speichern"}
              </PermissionButton>

            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Worker – mit ConfirmModal wie bei Users ===== */}
      <ConfirmModal
        open={!!toDelete}
        title="Worker löschen?"
        description={
          <>
            Willst du den Worker{" "}
            <span className="font-semibold">{toDelete?.name || "Unbenannt"}</span>{" "}
            (
            <span className="font-mono text-[13px]">
              {toDelete?.email ?? "—"}
            </span>
            ) wirklich löschen?
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
            {deleteError && (
              <span className="mt-2 block text-red-700">
                Fehler: {deleteError}
              </span>
            )}
          </>
        }
        cancelLabel="Abbrechen"
        confirmLabel={deleting ? "Lösche…" : "Ja, löschen"}
        onCancel={cancelDelete}
        onConfirm={() => {
          if (deleting) return;
          if (!canDeleteWorker) return; // block
          void confirmDelete();
        }}

        icon={<Trash2 className="text-red-500" />}
      />

      <ConfirmModal
        open={confirmStatusOpen}
        title={pendingStatus === "inactive" ? "Firma deaktivieren?" : "Firma aktivieren?"}
        description={
          pendingStatus === "inactive"
            ? `Bist du sicher, dass du "${company.name}" deaktivieren willst?`
            : `Bist du sicher, dass du "${company.name}" aktivieren willst?`
        }
        hintTitle="Hinweis"
        hintText={
          pendingStatus === "inactive"
            ? "Beim Deaktivieren können Einladungslinks ggf. ungültig werden und neue Einladungen funktionieren möglicherweise nicht mehr."
            : "Nach dem Aktivieren können Einladungen wieder normal genutzt werden."
        }
        cancelLabel="Abbrechen"
        confirmLabel={
          changingStatus
            ? "Ändere…"
            : pendingStatus === "inactive"
              ? "Ja, deaktivieren"
              : "Ja, aktivieren"
        }
        onCancel={() => {
          if (changingStatus) return;
          setConfirmStatusOpen(false);
          setPendingStatus(null);
          setStatusError(null);
        }}
        onConfirm={async () => {
          if (!id || !pendingStatus || changingStatus) return;

          const snapshot = company;
          setCompany({ ...company, status: pendingStatus });

          setChangingStatus(true);
          setStatusError(null);

          try {
            const updated = await changeCompanyStatus(id);
            setCompany(mapApiToDetails(updated)); // Backend response übernimmt Wahrheit
            setConfirmStatusOpen(false);
            setPendingStatus(null);
          } catch (e: any) {
            setCompany(snapshot); // rollback
            setStatusError(e?.message ?? String(e));
          } finally {
            setChangingStatus(false);
          }
        }}
      />

      <ConfirmModal
        open={confirmWorkerStatusOpen}
        title={
          pendingWorkerStatus === "inactive" 
            ? "Worker deaktivieren?" 
            : "Worker aktivieren?"
        }
        description={
          pendingWorkerStatus === "inactive"
            ? `Bist du sicher, dass du "${targetWorker?.name}" deaktivieren willst?`
            : `Bist du sicher, dass du "${targetWorker?.name}" aktivieren willst?`
        }
        hintTitle="Hinweis"
        hintText={
          pendingWorkerStatus === "inactive"
            ? workerAssignmentCount > 0
              ? `${workerAssignmentCount} aktive Zuweisungen werden blockiert. Der Worker kann nicht mehr auf Kataloge und Assessments zugreifen.`
              : "Der Worker kann nicht mehr auf Kataloge und Assessments zugreifen und kann nicht mehr zu neuen Katalogen eingeladen werden."
            : workerAssignmentCount > 0
              ? `${workerAssignmentCount} blockierte Zuweisungen werden wiederhergestellt.`
              : "Der Worker kann wieder zu Katalogen eingeladen werden."
        }
        cancelLabel="Abbrechen"
        confirmLabel={
          changingWorkerStatus
            ? "Ändere…"
            : pendingWorkerStatus === "inactive"
              ? "Ja, deaktivieren"
              : "Ja, aktivieren"
        }
        onCancel={cancelWorkerStatusChange}
        onConfirm={confirmWorkerStatusChange}
        error={workerStatusError}
      />


    </AdminLayout>
  );
}
