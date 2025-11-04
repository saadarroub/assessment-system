// src/features/admin-area/companies/CompaniesList.tsx — Tailwind-only (final)

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, ArrowUpDown, Eye, Building2, Plus, Trash2, Pencil } from "lucide-react";
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

// HSL-Token-Fallbacks (exakt wie CSS)
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

  // NEW: Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Load companies
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

  // Load worker counts
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

  // Filter + sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? items.filter((c) => c.name.toLowerCase().includes(term)) : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (c: Company): string | number => {
        if (sortKey === "workers")  return workerCounts[c.id] ?? -1;
        if (sortKey === "catalogs") return -1;
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

  // Create submit
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

  // Delete flow
  const askDelete = (c: Company) => {
    setTargetCompany(c);
    setDeleteError(null);
    setOpenDelete(true);
  };
  const cancelDelete = () => {
    if (deleting) return;
    setOpenDelete(false);
    setTargetCompany(null);
    setDeleteError(null);
  };
  const confirmDelete = async () => {
    if (!targetCompany) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCompany(targetCompany.id);
      setItems((prev) => prev.filter((x) => x.id !== targetCompany.id));
      setWorkerCounts((prev) => {
        const { [targetCompany.id]: _, ...rest } = prev;
        return rest;
      });
      setOpenDelete(false);
      setTargetCompany(null);
    } catch (err: any) {
      setDeleteError(err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  };

  // === Edit flow (NEW) ===
  const openEditFor = (c: Company) => {
    setEditCompany(c);
    setEName(c.name);
    setEDesc("");
    setUpdateError(null);
    setOpenEdit(true);
  };
  const cancelEdit = () => {
    if (updating) return;
    setOpenEdit(false);
    setEditCompany(null);
    setEName(""); setEDesc(""); setUpdateError(null);
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
    } finally {
      setUpdating(false);
    }
  }

  return (
    <AdminLayout>
      {/* ===== Hero ===== */}
      <header className="w-full border-b bg-white/90 [backdrop-filter:saturate(1.4)_blur(6px)]" style={{ borderColor: CSS.adminBg }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-[84px] grid place-items-center text-center select-none">
            <div>
              <h1 className="m-0 text-[36px] font-extrabold leading-none tracking-[-0.01em]" style={{ color: CSS.fg }}>
                Companies
              </h1>
              <p className="m-0 mt-2 text-[15px] font-semibold" style={{ color: CSS.mutedFg }}>
                Manage company settings, Workers, and configurations.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Außenbereich unter dem Hero */}
      <main className="px-6 pt-6 pb-8" style={{ background: CSS.adminBg }}>
        {/* Breadcrumb */}
        <nav className="max-w-[1200px] mx-auto mb-4 flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
          <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
            Admin Panel
          </Link>
          <span className="opacity-60">›</span>
          <span className="font-semibold" style={{ color: CSS.fg }}>
            Companies
          </span>
        </nav>

        {/* Seitenkopf */}
        <header className="max-w-[1200px] mx-auto mb-[18px]">
          <h2 className="m-0 mb-1 text-[2rem] font-bold" style={{ color: CSS.fg }}>
            Companies
          </h2>
          <p className="m-0 max-w-[720px] leading-[1.6]" style={{ color: CSS.mutedFg }}>
            Manage company settings, Workers, and configurations.
          </p>
        </header>

        {/* Add Company */}
        <div className="max-w-[1200px] mx-auto mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white
                       shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[rgba(38,69,85,.35)]
                       bg-[#264555]"
          >
            <Plus size={16} />
            New Company
          </button>
        </div>

        {/* Card (Table) */}
        <section
          className="max-w-[1200px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]"
          style={{ background: CSS.card, borderColor: CSS.border }}
        >
          {/* Controls */}
          <div className="flex flex-col gap-4 p-6 border-b" style={{ borderColor: CSS.border }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-[24rem] flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }} aria-hidden>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search companies by name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search companies"
                  className="w-full rounded-md border px-3 py-2 pl-10 text-sm outline-none focus:ring-2"
                  style={{
                    borderColor: CSS.border,
                    background: CSS.card,
                    color: CSS.fg,
                    boxShadow: "0 0 #0000",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = CSS.primary;
                    e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary)/.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = CSS.border;
                    e.currentTarget.style.boxShadow = "0 0 #0000";
                  }}
                />
              </div>
              <div className="text-sm" style={{ color: CSS.mutedFg }}>
                {loading ? "Loading…" : error ? "Error" : `Showing ${filtered.length} companies`}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ background: CSS.card }}>
              <thead>
                <tr>
                  {[
                    { k: "name", label: "Company" },
                    { k: "workers", label: "Workers" },
                    { k: "catalogs", label: "Catalogs" },
                    { k: "status", label: "Status" },
                    { k: "created", label: "Created" },
                    { k: null, label: "Actions" },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="text-left px-4 py-4 text-[0.875rem] font-semibold border-b"
                      style={{ background: CSS.muted, color: CSS.mutedFg, borderColor: CSS.border }}
                    >
                      {col.k ? (
                        <button
                          type="button"
                          onClick={() => setSort(col.k as SortKey)}
                          className="inline-flex items-center gap-1 hover:brightness-110"
                          style={{ color: "inherit" }}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown size={14} />
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
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-4">Keine Einträge gefunden.</td></tr>
                ) : (
                  filtered.map((c) => {
                    const uCount = workerCounts[c.id];
                    return (
                      <tr key={c.id} className="hover:bg-[hsl(var(--muted)/.5)]">
                        {/* Company cell */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-md"
                                 style={{ color: CSS.primary, background: "hsl(var(--primary)/.10)" }}>
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
                            <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                                  style={{ background: CSS.muted, color: CSS.mutedFg }}>
                              {uCount} worker
                            </span>
                          ) : (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>—</span>
                          )}
                        </td>

                        {/* Catalogs (—) */}
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
                        <td className="px-4 py-4 text-[0.875rem]"
                            style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                          {new Date(c.created).toLocaleDateString("de-DE")}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right whitespace-nowrap"
                            style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <Link
                            to={`/admin/adminPanel/companies/${c.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold
                                       text-white shadow hover:brightness-110 bg-[#264555]"
                          >
                            <Eye size={14} /> <span className="hidden sm:inline">View</span>
                          </Link>

                          {/* NEW: Edit */}
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Create Company Modal */}
      {openCreate && (
        <div role="dialog" aria-modal="true"
             className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
             onClick={(e) => { if (e.target === e.currentTarget) setOpenCreate(false); }}>
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-3 text-lg font-semibold">Create Company</h3>
            {createError && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {createError}
              </div>
            )}
            <form onSubmit={onCreateCompany} className="space-y-3">
              <div>
                <label htmlFor="c-name" className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  id="c-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="e.g. ACME GmbH"
                  required
                />
              </div>
              <div>
                <label htmlFor="c-desc" className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  id="c-desc"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  rows={4}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpenCreate(false)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        disabled={creating}>
                  Cancel
                </button>
                <button type="submit"
                        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                        disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Company Modal */}
      {openDelete && targetCompany && (
        <div role="dialog" aria-modal="true"
             className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
             onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}>
          <div className="w-[min(460px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-1 text-lg font-semibold text-red-600">Company löschen?</h3>
            <p className="mb-3 text-sm text-slate-600">
              Willst du die Firma <b>{targetCompany.name}</b> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {deleteError && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cancelDelete}
                      className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={deleting}>
                Abbrechen
              </button>
              <button type="button" onClick={confirmDelete}
                      className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                      disabled={deleting}>
                {deleting ? "Lösche…" : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Edit Company Modal (NEW) === */}
      {openEdit && editCompany && (
        <div role="dialog" aria-modal="true"
             className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
             onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}>
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="mb-3 text-lg font-semibold">Edit Company</h3>

            {updateError && (
              <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800" role="alert">
                {updateError}
              </div>
            )}

            <form onSubmit={onEditSubmit} className="space-y-3">
              <div>
                <label htmlFor="e-name" className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  id="e-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                  placeholder="Firmenname"
                  required
                />
              </div>
              <div>
                <label htmlFor="e-desc" className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  id="e-desc"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  rows={4}
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cancelEdit}
                        className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={updating}>
                  Cancel
                </button>
                <button type="submit"
                        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                        disabled={updating}>
                  {updating ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
