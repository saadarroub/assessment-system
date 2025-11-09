// src/features/admin-area/companies/CompaniesList.tsx — Final (Users/Zuweisungen Look)

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, ArrowUpDown, Eye, Building2, Plus, Trash2, Pencil } from "lucide-react";
import myLogo from "@/assets/Zero-6-icons-05.webp";
import {
  getCompanies, 
  getWorkersByCompany,
  createCompany,
  deleteCompany,
  type CreateCompanyDto,
  // NEW
  updateCompany,
  type UpdateCompanyDto,
} from "@/features/service/companyService";

/* ================= Types ================= */
type CompanyApi = { id: string; name: string; description?: string; created_at?: string };
type Company   = { id: string; name: string; status?: "active" | "inactive"; created: string };

type SortKey = "name" | "workers" | "catalogs" | "status" | "created";

function mapApiToCompany(x: CompanyApi): Company {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: "active",
    created: x.created_at ? new Date(x.created_at).toISOString() : new Date().toISOString(),
  };
}

/* ============== Tokens wie bei Users/Zuweisungen ============== */
const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
  primary: "hsl(var(--primary,205 35% 24%))",
  primaryFg: "hsl(var(--primary-foreground,0 0% 98%))",
  muted: "hsl(var(--muted,210 40% 97%))",
};

export default function CompaniesList() {
  /* ============== State ============== */
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workerCounts, setWorkerCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete modal
  const [openDelete, setOpenDelete] = useState(false);
  const [targetCompany, setTargetCompany] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /* ============== Data load ============== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getCompanies();
        const list = Array.isArray(raw) ? raw : (raw as any)?.content ?? [];
        const mapped = (list as CompanyApi[]).map(mapApiToCompany);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);
 
  // Worker counts (lazy per company list)
  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setCountsLoading(true);
    (async () => {
      try {
        const entries = await Promise.all(
          items.map(async (c) => {
            try {
              const data = await getWorkersByCompany(c.id);
              const count = Array.isArray(data) ? data.length : Number((data as any)?.total) || 0;
              return [c.id, count] as const;
            } catch {
              return [c.id, 0] as const;
            }
          })
        );
        if (alive) setWorkerCounts(Object.fromEntries(entries));
      } finally {
        if (alive) setCountsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [items]);

  /* ============== Filter + Sort ============== */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? items.filter((c) => c.name.toLowerCase().includes(term)) : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (c: Company): string | number => {
        if (sortKey === "workers")  return workerCounts[c.id] ?? -1;
        if (sortKey === "catalogs") return -1; // (keine Daten – lässt sich später erweitern)
        if (sortKey === "status")   return c.status ?? "active";
        if (sortKey === "created")  return new Date(c.created).getTime();
        return c.name.toLowerCase();
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc, workerCounts]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else { setSortKey(key); setAsc(true); }
  };

  /* ============== Pagination (wie Users/Zuweisungen) ============== */
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => { setPage(1); }, [q, sortKey, asc, items]);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  /* ============== Create ============== */
  async function onCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim()) {
      setCreateError("Bitte einen Firmennamen eingeben.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload: CreateCompanyDto = { name: cName.trim(), description: cDesc.trim() || undefined };
      const created = await createCompany(payload);
      const row = mapApiToCompany(created as any);
      setItems((prev) => [row, ...prev]);
      setWorkerCounts((prev) => ({ ...prev, [row.id]: 0 }));
      setCName(""); setCDesc(""); setOpenCreate(false);
    } catch (err: any) {
      setCreateError(err?.message ?? String(err));
    } finally {
      setCreating(false);
    }
  }

  /* ============== Delete ============== */
  const askDelete = (c: Company) => { setTargetCompany(c); setDeleteError(null); setOpenDelete(true); };
  const cancelDelete = () => { if (!deleting) { setOpenDelete(false); setTargetCompany(null); setDeleteError(null); } };
  const confirmDelete = async () => {
    if (!targetCompany) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCompany(targetCompany.id);
      setItems((prev) => prev.filter((x) => x.id !== targetCompany.id));
      setWorkerCounts(({ [targetCompany.id]: _, ...rest }) => rest as any);
      setOpenDelete(false); setTargetCompany(null);
    } catch (err: any) {
      setDeleteError(err?.message ?? String(err));
    } finally { setDeleting(false); }
  };

  /* ============== Edit ============== */
  const openEditFor = (c: Company) => {
    setEditCompany(c);
    setEName(c.name);
    setEDesc("");
    setUpdateError(null);
    setOpenEdit(true);
  };
  const cancelEdit = () => {
    if (!updating) {
      setOpenEdit(false); setEditCompany(null); setEName(""); setEDesc(""); setUpdateError(null);
    }
  };
  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCompany) return;

    const payload: UpdateCompanyDto = {
      name: eName.trim() || editCompany.name,
      ...(eDesc.trim() ? { description: eDesc.trim() } : {}),
    };

    try {
      setUpdating(true);
      setUpdateError(null);
      const updated = await updateCompany(editCompany.id, payload);

      setItems(prev =>
        prev.map(row =>
          row.id === editCompany.id ? { ...row, name: (updated as any).name ?? payload.name } : row
        )
      );
      cancelEdit();
    } catch (err: any) {
      setUpdateError(err?.message ?? String(err));
    } finally { setUpdating(false); }
  }

  /* ============== Render ============== */
  return (
    <AdminLayout>
      {/* ===== Hero (wie Users) ===== */}
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
              Firmen Administration
            </h1>
            <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
             Verwaltung von Unternehmenseinstellungen, Mitarbeitern und Konfigurationen
            </p>
          </div>
        </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>
 
      {/* ===== Außenbereich ===== */}
      <main className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6" style={{ background: CSS.adminBg }}>
        {/* Top-Bar: Breadcrumb + gelber Button rechts */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
            <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
              Admin Panel
            </Link>
            <span className="opacity-60">›</span>
            <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Companies</span>
          </nav>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
            style={{
              background: "hsl(40,60%,63%)",           // Gelb wie Users/Zuweisungen
              color: "hsl(200,32%,22%)",               // dunkles Blau-Grau
              boxShadow: "0 1px 2px rgba(0,0,0,.05)"
            }}
            aria-label="New Company"
          >
            <Plus size={16} />
            New Company
          </button>
        </div>

        {/* Suche + Count Card */}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[12px] border bg-white/85 [backdrop-filter:saturate(1.2)_blur(4px)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          style={{ borderColor: CSS.border }}
        >
          <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 md:gap-4">
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search companies by name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full h-10 md:h-11 rounded-md border pl-10 pr-3 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: CSS.border, background: CSS.card, color: CSS.fg, boxShadow: "0 0 #0000" }}
              />
            </div>

            <div
              className="inline-block text-sm font-medium px-3 md:px-4 py-2 rounded-lg border"
              style={{ background: CSS.card, color: CSS.mutedFg, borderColor: CSS.border }}
            >
              {loading ? "Loading…" : error ? "Error" : <>Showing <span className="font-semibold" style={{ color: CSS.fg }}>{filtered.length}</span> companies</>}
            </div>
          </div>
        </div>

        {/* Tabelle */}
        <section className="max-w-[1400px] xl:max-w-[1600px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]" style={{ background: CSS.card, borderColor: CSS.border }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-[hsl(var(--card))]">
              <thead className="bg-[hsla(200,32%,22%,0.05)]" style={{ borderBottom: "2px solid hsla(200,32%,22%,0.1)" }}>
                <tr>
                  {[
                    { k: "name", label: "Company" },
                    { k: "workers", label: "Workers" },
                    { k: "catalogs", label: "Catalogs" },
                    { k: "status", label: "Status" },
                    { k: "created", label: "Created" },
                    { k: null, label: "Actions" },
                  ].map((col, i) => (
                    <th key={i} className={`px-4 py-3 text-[0.85rem] font-semibold ${col.label === "Actions" ? "text-center" : "text-left"}`} style={{ color: CSS.fg }}>
                      {col.k ? (
                        <button
                          type="button"
                          onClick={() => setSort(col.k as SortKey)}
                          className="inline-flex items-center gap-2 hover:brightness-110"
                          style={{ color: "inherit" }}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown size={14} className="opacity-60" />
                        </button>
                      ) : (
                        <span>{col.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-4">Lade Companies…</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="px-4 py-4 text-red-600">Fehler: {error}</td></tr>
                ) : pageData.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-4">Keine Einträge gefunden.</td></tr>
                ) : (
                  pageData.map((c) => {
                    const uCount = workerCounts[c.id];
                    return (
                      <tr key={c.id} className="transition border-l-[4px] border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]">
                        {/* Company */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-md" style={{ color: CSS.primary, background: "hsl(var(--primary)/.10)" }}>
                              <Building2 size={16} />
                            </div>
                            <span className="font-semibold" style={{ color: CSS.fg }}>{c.name}</span>
                          </div>
                        </td>

                        {/* Workers */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          {countsLoading && !(c.id in workerCounts) ? (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>…</span>
                          ) : typeof uCount === "number" ? (
                            <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold" style={{ background: CSS.muted, color: CSS.mutedFg }}>
                              {uCount} worker{uCount === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>—</span>
                          )}
                        </td>

                        {/* Catalogs (Platzhalter) */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>—</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span
                            className={
                              (c.status ?? "active") === "active"
                                ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                                : "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                            }
                          >
                            {(c.status ?? "active") === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                          {new Date(c.created).toLocaleDateString("de-DE")}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center whitespace-nowrap" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="inline-flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/adminPanel/companies/${c.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold shadow hover:brightness-110"
                            style={{ background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)" }}
                            title="View"
                          >
                            <Eye size={14} /> <span className="hidden sm:inline">View</span>
                          </Link>

                          <button
                            type="button"
                            aria-label="Edit company"
                            title="Edit"
                            onClick={() => openEditFor(c)}
                            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-slate-50 align-middle"
                            style={{ borderColor: CSS.border, color: CSS.fg }}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            aria-label="Delete company"
                            title="Löschen"
                            onClick={() => askDelete(c)}
                            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md border text-red-600 hover:bg-red-50 align-middle"
                            style={{ borderColor: "rgb(254 202 202)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination (extern, wie Users/Zuweisungen) */}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4 rounded-[12px] border bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          style={{ borderColor: CSS.border }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: CSS.mutedFg }}>
              Zeige {startIdx}-{endIdx} von {total} Einträgen
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || total === 0}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsla(40,60%,63%,0.08)]"
                style={{ borderColor: CSS.border, color: CSS.mutedFg }}
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || total === 0}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsla(40,60%,63%,0.08)]"
                style={{ borderColor: CSS.border, color: CSS.mutedFg }}
              >
                Weiter
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {openCreate && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpenCreate(false); }}>
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-3 text-lg font-semibold">Create Company</h3>
            {createError && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{createError}</div>}
            <form onSubmit={onCreateCompany} className="space-y-3">
              <div>
                <label htmlFor="c-name" className="mb-1 block text-sm font-medium">Name *</label>
                <input id="c-name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. ACME GmbH" required />
              </div>
              <div>
                <label htmlFor="c-desc" className="mb-1 block text-sm font-medium">Description</label>
                <textarea id="c-desc" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" rows={4} value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="Optional" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpenCreate(false)} className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={creating}>Cancel</button>
                <button type="submit" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60" disabled={creating}>{creating ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {openDelete && targetCompany && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}>
          <div className="w-[min(460px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-1 text-lg font-semibold text-red-600">Company löschen?</h3>
            <p className="mb-3 text-sm text-slate-600">Willst du die Firma <b>{targetCompany.name}</b> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            {deleteError && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cancelDelete} className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={deleting}>Abbrechen</button>
              <button type="button" onClick={confirmDelete} className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60" disabled={deleting}>{deleting ? "Lösche…" : "Ja, löschen"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {openEdit && editCompany && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}>
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-3 text-lg font-semibold">Edit Company</h3>
            {updateError && <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800" role="alert">{updateError}</div>}
            <form onSubmit={onEditSubmit} className="space-y-3">
              <div>
                <label htmlFor="e-name" className="mb-1 block text-sm font-medium">Name *</label>
                <input id="e-name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Firmenname" required />
              </div>
              <div>
                <label htmlFor="e-desc" className="mb-1 block text-sm font-medium">Description</label>
                <textarea id="e-desc" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" rows={4} value={eDesc} onChange={(e) => setEDesc(e.target.value)} placeholder="Optional" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cancelEdit} className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={updating}>Cancel</button>
                <button type="submit" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60" disabled={updating}>{updating ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
