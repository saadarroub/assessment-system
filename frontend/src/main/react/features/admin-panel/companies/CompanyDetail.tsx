// src/main/react/features/admin-panel/companies/CompanyDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import "@/styles/adminPanel.css";
import myLogo from "@/assets/Zero-6-icons-05.webp";
// adminCompanyDetails.css entfernt – alle Klassen unten via Tailwind umgesetzt
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
} from "@/features/service/companyService";
import {
  Pencil,
  Loader2,
  Trash,
  UserPlus,
  Globe2,
  MapPin,
  Clock3,
  Phone,
  Globe,
} from "lucide-react";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
/* ---------- API & UI Types ---------- */
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

  // Workers (Liste)
  const [workers, setWorkers] = useState<WorkerApi[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);

  // Invite (Create)
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

  // Catalog-Assignments (Liste)
  const [assignments, setAssignments] = useState<AssignmentApi[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Datum formatieren
  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("de-DE") : "—");

  // Status → Badge-Farben (wie bei Workers)
  const statusBadge = (s: AssignmentApi["status"]) => {
    if (s === "completed") return "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]";      // grün
    if (s === "in_progress") return "bg-[rgb(254,243,199)] text-[rgb(146,64,14)]";      // gelb
    if (s === "expired") return "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]";      // rot
    return "bg-[rgb(229,231,235)] text-[rgb(55,65,81)]";                                 // grau: assigned
  };

  /* ---------- Assignments laden (nur wenn Tab "catalogs") ---------- */
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
    return () => { alive = false; };
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
    return () => { alive = false; };
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
    return () => { alive = false; };
  }, [id]);

  /* ---------- Loading/Errors ---------- */
  if (loading) {
    return (
      <AdminLayout>
        <header className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4">
          <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
          <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
            <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
            <div className="justify-self-center">
              <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05] [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
                <h1>Company</h1>
                <p>Laden…</p>
              </div>
            </div>
            <div className="justify-self-end inline-flex lg:justify-self-center" />
          </div>
        </header>
      </AdminLayout>
    );
  }

  if (error || !company) {
    return (
      <AdminLayout>
        <header className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4">
          <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
          <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
            <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
            <div className="justify-self-center">
              <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05] [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
                <h1>Companies</h1>
                <p>{error ?? "Company not found. Check the URL or go back to the list."}</p>
              </div>
            </div>
            <div className="justify-self-end inline-flex lg:justify-self-center" />
          </div>
        </header>

        <main className="admin-main">
          <nav className="breadcrumb">
            <Link to="/admin/adminPanel">Admin Panel</Link>
            <span>›</span>
            <Link to="/admin/adminPanel/companies">Companies</Link>
            <span>›</span>
            <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Not found</span>
          </nav>
        </main>
      </AdminLayout>
    );
  }

  /* ---------- abgeleitete Werte ---------- */
  const usersCount = typeof company?.usersCount === "number" ? company.usersCount : workers.length;
  const totalAssignmentsCount = assignments.length;
  //const catalogsCount = typeof company.catalogsCount === "number" ? company.catalogsCount : 0;
  const catalogsCount = (() => {
    const ids = new Set<string>();
    for (const a of assignments) if (a?.catalog?.id) ids.add(a.catalog.id);
    return ids.size;
  })();
  const statusLabel = (company.status ?? "active") === "active" ? "Active" : "Inactive";
  const statusClass =
    (company.status ?? "active") === "active"
      ? "bg-[rgb(220_252_231)] text-[rgb(22_101_52)]"
      : "bg-[rgb(254_226_226)] text-[rgb(153_27_27)]";
  // total = alle Zuweisungen

  /* ---------- Invite ---------- */
  function openInviteModal() {
    setInvName(""); setInvEmail(""); setInvWorkspace("");
    setCreateErr(null);
    setOpenInvite(true);
  }
  function cancelInvite() { if (!creating) setOpenInvite(false); }
  async function onInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!invName.trim() || !invEmail.trim()) {
      setCreateErr("Bitte Name und Email ausfüllen.");
      return;
    }
    if (!invWorkspace.trim()) {
      setCreateErr("Bitte Workspace ausfüllen.");
      return;
    }
    setCreating(true);
    setCreateErr(null);
    try {
      const created = await createWorker({
        name: invName.trim(),
        email: invEmail.trim(),
        workSpaceRef: invWorkspace.trim(),
        companyId: id,
      });
      setWorkers(prev => [created, ...prev]);
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
  function cancelEdit() { if (!saving) { setEditing(null); setSaveError(null); } }
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !company) return;
    
    if (!formName.trim() || !formEmail.trim()) {
      setSaveError("Bitte Name und Email ausfüllen.");
      return;
    }
    if (!formWs.trim()) {
      setSaveError("Bitte Workspace ausfüllen.");
      return;
    }
    
    setSaving(true);
    setSaveError(null);

    const optimistic = { ...editing, name: formName, email: formEmail, workSpaceRef: formWs };
    setWorkers(prev => prev.map(x => (x.id === editing.id ? optimistic : x)));

    try {
      const updated = await updateWorker(editing.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        workSpaceRef: formWs.trim(),
        companyId: company.id,
      });
      setWorkers(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } catch (err: any) {
      setSaveError(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete ---------- */
  function askDelete(w: WorkerApi) { setToDelete(w); setDeleteError(null); }
  function cancelDelete() { if (!deleting) { setToDelete(null); setDeleteError(null); } }
  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const snapshot = workers;
    setWorkers(prev => prev.filter(x => x.id !== toDelete.id));
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

  /* ---------- Render ---------- */
  return (
    <AdminLayout>
      {/* === Hero === */}
      {/* HEADER */}
            <PageHeader
      
              title="Firmen Details"
              subtitle= {company.name}
              icon={<Network size={40} />}
              gradient="navy"
              height="280px"
              showPattern={true}
      
            />

      {/* === Main === */}
      <main className="admin-main company-details compact bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <Link to="/admin/adminPanel/companies">Companies</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{company.name}</span>
        </nav>

        {/* Kopf */}
        <div className="mb-6">
          <Link
            to="/admin/adminPanel/companies"
            className="back-btn inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label="Zurück zu Companies"
          >
            Zurück
          </Link>
        </div>

        {/* Content Grid: mobil 1 Spalte, ab lg 1fr + 20rem (Sidebar rechts) */}
        <div className="grid grid-cols-1 gap-6 lg:[grid-template-columns:1fr_20rem]">
          {/* Hauptspalte */}
          <div className="flex flex-col gap-6 min-w-0">
            <section className="admin-card p-6">
              {/* Company Kopf */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] grid place-items-center text-[1.5rem]"
                    aria-hidden
                  >
                    🏢
                  </div>

                  {/* Linke Seite: Name (nimmt den Platz ein) */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[1.25rem] font-semibold m-0 truncate">{company.name}</h2>
                  </div>

                  {/* Rechte Seite: Badge, fixierte Breite, kein Umbruch */}
                  <span
                    className={`shrink-0 inline-flex items-center px-3 py-2 rounded-full text-[0.875rem] font-medium ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
              {/* Stats (mit farbigen Top-Akzenten wie im Screenshot) */}
              {/* Stats / Kennzahlen */}
              {/* Stats – subtilere, einheitliche Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Workers */}
                <div className="relative overflow-hidden text-center p-4 border border-[hsl(var(--border))] rounded-2xl bg-white/95 shadow-sm transition-shadow hover:shadow-md">
                  {/* dezente goldene & dunkle Glows */}
                  <div className="pointer-events-none absolute -top-10 -right-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.18),_transparent_65%)]" />
                  <div className="pointer-events-none absolute -bottom-6 left-0 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.1),_transparent_70%)]" />

                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                    Workers
                  </span>
                  <span className="mt-2 block text-[1.8rem] font-extrabold text-[hsl(var(--foreground))] leading-none">
                    {usersCount}
                  </span>
                  <div className="mt-2 text-[0.8rem] text-[hsl(var(--muted-foreground))]">
                    Team overview
                  </div>
                </div>

                {/* Catalogs */}
                <div className="relative overflow-hidden text-center p-4 border border-[hsl(var(--border))] rounded-2xl bg-white/95 shadow-sm transition-shadow hover:shadow-md">
                  <div className="pointer-events-none absolute -top-10 -right-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.18),_transparent_65%)]" />
                  <div className="pointer-events-none absolute -bottom-6 left-0 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.1),_transparent_70%)]" />

                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                    Catalogs
                  </span>
                  <span className="mt-2 block text-[1.8rem] font-extrabold text-[hsl(var(--foreground))] leading-none">
                    {catalogsCount}
                  </span>
                  <div className="mt-2 text-[0.8rem] text-[hsl(var(--muted-foreground))]">
                    Assessment sets
                  </div>
                </div>

                {/* Created */}
                <div className="relative overflow-hidden text-center p-4 border border-[hsl(var(--border))] rounded-2xl bg-white/95 shadow-sm transition-shadow hover:shadow-md">
                  <div className="pointer-events-none absolute -top-10 -right-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.18),_transparent_65%)]" />
                  <div className="pointer-events-none absolute -bottom-6 left-0 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.1),_transparent_70%)]" />

                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                    Created
                  </span>
                  <div className="mt-2 text-[1.05rem] font-semibold text-[hsl(var(--foreground))] leading-none">
                    {formatDate(company.created)}
                  </div>
                  <div className="mt-2 text-[0.8rem] text-[hsl(var(--muted-foreground))]">
                    Since launch
                  </div>
                </div>
              </div>



              {/* Company Info / Adresse / Kontakt */}
              {/* Company Info / Adresse / Kontakt */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Unternehmensprofil – 2 Spalten breit */}
                <div className="relative lg:col-span-2 border border-[hsl(var(--border))] rounded-2xl bg-white/95 p-5 shadow-sm overflow-hidden">
                  {/* zarter bläulicher Glow rechts oben */}
                  <div className="pointer-events-none absolute -top-10 -right-4 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_transparent_65%)]" />

                  <div className="flex items-start justify-between gap-4 mb-3 relative">
                    <div>
                      <h3 className="text-[1rem] font-semibold text-[hsl(var(--foreground))] mb-1">
                        Unternehmensprofil
                      </h3>
                      <p className="text-[0.95rem] text-[hsl(var(--muted-foreground))] m-0">
                        {company.description
                          ? company.description
                          : "Keine Unternehmensbeschreibung hinterlegt."}
                      </p>
                    </div>

                    {/* kleines „Meta“-Badge rechts oben */}
                    {company.updated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[0.75rem] font-medium text-slate-600">
                        <Clock3 className="h-3 w-3 text-indigo-500" />
                        Zuletzt aktualisiert: {formatDate(company.updated)}
                      </span>
                    )}
                  </div>

                  {/* kleine Badges unten wie im Screenshot */}
                  <div className="mt-4 flex flex-wrap gap-2 relative">
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

                {/* Rechte Spalte: Adresse + Kontakt übereinander */}
                <div className="flex flex-col gap-4">
                  {/* Adresse */}
                  <div className="relative border border-[hsl(var(--border))] rounded-2xl bg-white/95 p-4 shadow-sm overflow-hidden">
                    {/* leichter blauer Glow */}
                    <div className="pointer-events-none absolute -top-8 -right-4 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.14),_transparent_65%)]" />

                    <div className="flex items-center gap-2 mb-2 relative">
                      <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-rose-500" />
                      </div>
                      <h3 className="text-[0.95rem] font-semibold text-[hsl(var(--foreground))] m-0">
                        Adresse
                      </h3>
                    </div>

                    {company.street || company.postalCode || company.city || company.country ? (
                      <div className="text-[0.9rem] text-[hsl(var(--muted-foreground))] space-y-0.5 relative">
                        {company.street && <div>{company.street}</div>}
                        {(company.postalCode || company.city) && (
                          <div>
                            {company.postalCode} {company.city}
                          </div>
                        )}
                        {company.country && <div>{company.country}</div>}
                      </div>
                    ) : (
                      <p className="text-[0.9rem] text-[hsl(var(--muted-foreground))] m-0 relative">
                        Keine Adressdaten hinterlegt.
                      </p>
                    )}
                  </div>

                  {/* Kontakt */}
                  <div className="relative border border-[hsl(var(--border))] rounded-2xl bg-white/95 p-4 shadow-sm overflow-hidden">
                    {/* leichter grünlicher Glow */}
                    <div className="pointer-events-none absolute -top-8 -right-4 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.16),_transparent_65%)]" />

                    <div className="flex items-center gap-2 mb-2 relative">
                      <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h3 className="text-[0.95rem] font-semibold text-[hsl(var(--foreground))] m-0">
                        Kontakt
                      </h3>
                    </div>

                    <div className="space-y-1 text-[0.9rem] text-[hsl(var(--muted-foreground))] relative">
                      <div>
                        <span className="font-medium text-[hsl(var(--foreground))]">Telefon:</span>{" "}
                        {company.phone || "Keine Telefonnummer hinterlegt."}
                      </div>
                      <div>
                        <span className="font-medium text-[hsl(var(--foreground))]">Website:</span>{" "}
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Tabs */}
            <section className="admin-card p-6">
              <div className="border-b border-[hsl(var(--border))] mb-6" role="tablist" aria-label="Company Tabs">
                <div className="flex gap-2">
                  {/* Workers */}
                  <button
                    type="button"
                    aria-selected={tab === "users"}
                    onClick={() => setTab("users")}
                    className={
                      "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition border-0 " +
                      (tab === "users"
                        ? "shadow hover:[filter:brightness(1.05)]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsla(40,60%,63%,0.12)] hover:text-[hsl(var(--foreground))]")
                    }
                    style={
                      tab === "users"
                        ? { background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)", boxShadow: "0 1px 2px rgba(0,0,0,.05)" }
                        : {}
                    }
                  >
                    <span aria-hidden>👥</span> Workers ({usersCount})
                  </button>

                  {/* Catalogs */}
                  <button
                    type="button"
                    aria-selected={tab === "catalogs"}
                    onClick={() => setTab("catalogs")}
                    className={
                      "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition border-0 " +
                      (tab === "catalogs"
                        ? "shadow hover:[filter:brightness(1.05)]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsla(40,60%,63%,0.12)] hover:text-[hsl(var(--foreground))]")
                    }
                    style={
                      tab === "catalogs"
                        ? { background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)", boxShadow: "0 1px 2px rgba(0,0,0,.05)" }
                        : {}
                    }
                  >
                    <span aria-hidden>📂</span> Catalogs ({totalAssignmentsCount})
                  </button>
                </div>
              </div>

              {/* Workers TAB */}
              {tab === "users" && (
                <div>
                  {workersLoading ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                      <div className="text-[56px] leading-none mb-3 opacity-80" aria-hidden>⏳</div>
                      <p className="text-[1.125rem] text-[hsl(var(--foreground))] m-0">Lade Worker…</p>
                    </div>
                  ) : workersError ? (
                    <div className="admin-error" role="alert" style={{ margin: "0.75rem 0" }}>
                      {workersError}
                    </div>
                  ) : workers.length === 0 ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                      <div className="text-[56px] leading-none mb-3 opacity-80" aria-hidden>👥</div>
                      <p className="text-[1.125rem] text-[hsl(var(--foreground))] mb-1">Keine User-Daten verfügbar.</p>
                      <p className="text-[.95rem] m-0">Füge über „Invite User“ neue Worker hinzu.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white">
                        {/* Header: leichtes Blau-Grau + Unterkante */}
                        <thead className="bg-[hsla(200,32%,22%,0.05)] border-b-2 border-b-[hsla(200,32%,22%,0.10)]">
                          <tr>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">Name</th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">Email</th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">Workspace</th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">Created</th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {workers.map((w) => (
                            <tr
                              key={w.id}
                              className="group transition border-l-4 border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]"
                            >
                              <td className="px-4 py-4 text-sm font-semibold border-b border-b-[hsl(30_15%_85%)]">
                                {w.name || "—"}
                              </td>

                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {w.email || "—"}
                              </td>

                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {w.workSpaceRef || "—"}
                              </td>

                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString("de-DE") : "—"}
                              </td>

                              <td className="px-4 py-4 text-sm border-b border-b-[hsl(30_15%_85%)]">
                                <div className="flex items-center gap-2">
                                  {/* Edit: neutraler Border, dunkles FG */}
                                  <button
                                    type="button"
                                    onClick={() => openEdit(w)}
                                    className="inline-flex items-center gap-1 rounded-md border border-[hsl(30_15%_85%)] px-2 py-1 text-sm font-semibold text-[hsl(205_35%_24%)] hover:bg-slate-50"
                                    title="Bearbeiten"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>

                                  {/* Delete: roter Border, roter Text */}
                                  <button
                                    type="button"
                                    onClick={() => askDelete(w)}
                                    className="inline-flex items-center gap-1 rounded-md border border-[rgb(254_202_202)] px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    title="Löschen"
                                  >
                                    <Trash size={14} />
                                    Delete
                                  </button>
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

              {tab === "catalogs" && (
                <div>
                  {assignLoading ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                      <div className="text-[56px] leading-none mb-3 opacity-80" aria-hidden>
                        📁
                      </div>
                      <p className="text-[1.125rem] text-[hsl(var(--foreground))] m-0">
                        Lade Zuweisungen…
                      </p>
                    </div>
                  ) : assignError ? (
                    <div className="admin-error" role="alert" style={{ margin: "0.75rem 0" }}>
                      {assignError}
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                      <div className="text-[56px] leading-none mb-3 opacity-80" aria-hidden>
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
                        {/* Header: gleicher Look wie bei Workers */}
                        <thead className="bg-[hsla(200,32%,22%,0.05)] border-b-2 border-b-[hsla(200,32%,22%,0.10)]">
                          <tr>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Worker
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Email
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Workspace
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Catalog
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Assigned
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Expires
                            </th>
                            <th className="px-4 py-3 text-[0.85rem] font-semibold text-[hsl(205_35%_24%)] text-left">
                              Completed
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {assignments.map((a) => (
                            <tr
                              key={a.id}
                              className="group transition border-l-4 border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]"
                            >
                              <td className="px-4 py-4 text-sm font-semibold border-b border-b-[hsl(30_15%_85%)]">
                                {a.worker?.name ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {a.worker?.email ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {a.worker?.workSpaceRef ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-sm border-b border-b-[hsl(30_15%_85%)]">
                                {a.catalog?.title ?? "—"}
                              </td>
                              <td className="px-4 py-4 text-sm border-b border-b-[hsl(30_15%_85%)]">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge(
                                    a.status
                                  )}`}
                                >
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {fmt(a.assignedAt)}
                              </td>
                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
                                {fmt(a.expiresAt)}
                              </td>
                              <td className="px-4 py-4 text-sm text-[hsl(0_0%_50%)] border-b border-b-[hsl(30_15%_85%)]">
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
            </section>
          </div>

          {/* Sidebar (rechts) */}
          <aside className="w-full lg:w-[20rem] flex flex-col gap-6">
            <section className="admin-card p-6">
              <h2 className="text-[1.125rem] font-bold mb-4">Actions</h2>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={openInviteModal}
                  className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
                  style={{
                    background: "hsl(40,60%,63%)",
                    color: "hsl(200,32%,22%)",
                    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                  }}
                >
                  <UserPlus size={16} />
                  Worker hinzüfügen
                </button>
              </div>
            </section>

            <section className="admin-card p-5 rounded-xl">
              <h2 className="text-[1.05rem] font-bold mb-3">Company Stats</h2>
              <div className="flex flex-col gap-2 text-[0.95rem]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.92rem] tracking-[.1px] text-[hsl(var(--muted-foreground))]">Total Users:</span>
                  <span className="text-[1.05rem] leading-[1.1] font-bold text-[hsl(var(--foreground))] whitespace-nowrap [font-variant-numeric:tabular-nums]">{usersCount}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.92rem] tracking-[.1px] text-[hsl(var(--muted-foreground))]">Total Catalogs:</span>
                  <span className="text-[1.05rem] leading-[1.1] font-bold text-[hsl(var(--foreground))] whitespace-nowrap [font-variant-numeric:tabular-nums]">{catalogsCount}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.92rem] tracking-[.1px] text-[hsl(var(--muted-foreground))]">Status:</span>
                  <span className="text-[1.05rem] leading-[1.1] font-bold text-[hsl(var(--foreground))] whitespace-nowrap [font-variant-numeric:tabular-nums]">{statusLabel}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.92rem] tracking-[.1px] text-[hsl(var(--muted-foreground))]">Created:</span>
                  <span className="text-[1.05rem] leading-[1.1] font-bold text-[hsl(var(--foreground))] whitespace-nowrap [font-variant-numeric:tabular-nums]">{formatDate(company.created)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* ===== Invite Worker Modal ===== */}
      {openInvite && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelInvite(); }}
        >
          <div className="w-[min(560px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1">Invite User</h3>
            {createErr && <div className="admin-error mb-3" role="alert">{createErr}</div>}

            <form onSubmit={onInviteSubmit} className="space-y-3">
              <div>
                <label htmlFor="cw-name" className="block text-sm font-medium mb-1">Name *</label>
                <input
                  id="cw-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="cw-mail" className="block text-sm font-medium mb-1">Email *</label>
                <input
                  id="cw-mail"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="cw-ws" className="block text-sm font-medium mb-1">Workspace *</label>
                <input
                  id="cw-ws"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invWorkspace}
                  onChange={(e) => setInvWorkspace(e.target.value)}
                  placeholder="z. B. HQ-01"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelInvite}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={creating}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] disabled:opacity-60"
                  style={{ background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)" }}
                  disabled={creating}
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Edit Worker Modal ===== */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className="w-[min(560px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1">Edit Worker</h3>
            {saveError && (<div className="admin-error mb-3" role="alert">{saveError}</div>)}

            <form onSubmit={onSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-name">Name *</label>
                <input
                  id="w-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-mail">Email *</label>
                <input
                  id="w-mail"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-ws">Workspace *</label>
                <input
                  id="w-ws"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formWs}
                  onChange={(e) => setFormWs(e.target.value)}
                  placeholder="z. B. Senior Consulting"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] disabled:opacity-60"
                  style={{ background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)" }}
                  disabled={saving}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Worker Modal ===== */}
      {toDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}
        >
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1 text-red-600">Worker löschen?</h3>
            <p className="text-sm text-slate-700 mb-3">
              Willst du <b>{toDelete.name || "Unbenannt"}</b> ({toDelete.email}) wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {deleteError && <div className="admin-error mb-3" role="alert">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={deleting}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                disabled={deleting}
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
