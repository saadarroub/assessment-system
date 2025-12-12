
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, ArrowUpDown, Eye, Building2, Plus, Trash2, Pencil } from "lucide-react";
import {
  getCompanies,
  //getCompany,
  getWorkersByCompany,
  createCompany,
  deleteCompany,
  type CreateCompanyDto,
  updateCompany,
  type UpdateCompanyDto,
  getAssignmentsByCompany,
 // type AssignmentApi
} from "@/features/service/companyService";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import type { CompanyApi } from "@/features/service/companyService";


/* ================= Types ================= */

type Company = {
  id: string;
  name: string;
  status?: "active" | "inactive";
  description?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  created: string | null;
  updated?: string | null;
};



type SortKey = "name" | "workers" | "catalogs" | "status" | "created";

function mapApiToCompany(x: CompanyApi): Company {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: (x.status as "active" | "inactive") ?? "active",
    description: x.description ?? null,
    street: x.street ?? null,
    postalCode: x.postalCode ?? null,
    city: x.city ?? null,
    country: x.country ?? null,
    website: x.website ?? null,
    phone: x.phone ?? null,
    created: x.createdAt ? new Date(x.createdAt).toISOString() : null,
    updated: x.updatedAt ? new Date(x.updatedAt).toISOString() : null,
  };
}


const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "–";



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
  const [cStreet, setCStreet] = useState("");
const [cPostalCode, setCPostalCode] = useState("");
const [cCity, setCCity] = useState("");
const [cCountry, setCCountry] = useState("");
const [cWebsite, setCWebsite] = useState("");
const [cPhone, setCPhone] = useState("");
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
  const [eStreet, setEStreet] = useState("");
const [ePostalCode, setEPostalCode] = useState("");
const [eCity, setECity] = useState("");
const [eCountry, setECountry] = useState("");
const [eWebsite, setEWebsite] = useState("");
const [ePhone, setEPhone] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [catalogCounts, setCatalogCounts] = useState<Record<string, number>>({});
  const [catalogsLoading, setCatalogsLoading] = useState(false);

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

  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setCatalogsLoading(true);

    (async () => {
      try {
        const entries = await Promise.all(
          items.map(async (c) => {
            try {
              const list = await getAssignmentsByCompany(c.id);
              // Einzigartige Catalog-IDs zählen
              const set = new Set<string>();
              if (Array.isArray(list)) {
                for (const a of list) {
                  const cid =
                    (a as any)?.catalog?.id ??
                    (a as any)?.catalogId ??
                    null;
                  if (cid) set.add(String(cid));
                }
              }
              return [c.id, set.size] as const;
            } catch {
              return [c.id, 0] as const;
            }
          })
        );
        if (alive) setCatalogCounts(Object.fromEntries(entries));
      } finally {
        if (alive) setCatalogsLoading(false);
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
        if (sortKey === "workers") return workerCounts[c.id] ?? -1;
        if (sortKey === "catalogs") return catalogCounts[c.id] ?? -1;
        if (sortKey === "status") return c.status ?? "active";
        if (sortKey === "created") c.created ? new Date(c.created).getTime() : 0;
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
    
    // Validierung der Pflichtfelder
    if (!cName.trim()) {
      setCreateError("Bitte einen Firmennamen eingeben.");
      return;
    }
    if (!cStreet.trim()) {
      setCreateError("Bitte eine Straße eingeben.");
      return;
    }
    if (!cPostalCode.trim()) {
      setCreateError("Bitte eine Postleitzahl eingeben.");
      return;
    }
    if (!cCity.trim()) {
      setCreateError("Bitte eine Stadt eingeben.");
      return;
    }
    if (!cCountry.trim()) {
      setCreateError("Bitte ein Land eingeben.");
      return;
    }
    
    // Validierung für optionale Felder (Format)
    if (cWebsite.trim() && !cWebsite.trim().match(/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/)) {
      setCreateError("Bitte eine gültige Website eingeben (z.B. example.com oder www.example.de).");
      return;
    }
    if (cPhone.trim() && !cPhone.trim().match(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)) {
      setCreateError("Bitte eine gültige Telefonnummer eingeben (z.B. +49 123 456789).");
      return;
    }
    
    setCreating(true);
    setCreateError(null);
    try {
      const payload: CreateCompanyDto = {
  name: cName.trim(),
  description: cDesc.trim() || undefined,
  street: cStreet.trim(),
  postalCode: cPostalCode.trim(),
  city: cCity.trim(),
  country: cCountry.trim(),
  website: cWebsite.trim() || undefined,
  phone: cPhone.trim() || undefined,
};
      const created = await createCompany(payload);
      const row = mapApiToCompany(created as any);
      setItems((prev) => [row, ...prev]);
      setWorkerCounts((prev) => ({ ...prev, [row.id]: 0 }));
      setCName(""); 
      setCDesc(""); 
      setCStreet("");
setCPostalCode("");
setCCity("");
setCCountry("");
setCWebsite("");
setCPhone("");
      setOpenCreate(false);
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
    setEDesc(c.description ??"");
    setEStreet(c.street ?? "");
  setEPostalCode(c.postalCode ?? "");
  setECity(c.city ?? "");
  setECountry(c.country ?? "");
  setEWebsite(c.website ?? "");
  setEPhone(c.phone ?? "");
    setUpdateError(null);
    setOpenEdit(true);
  };
  const cancelEdit = () => {
    if (!updating) {
      setOpenEdit(false); 
      setEditCompany(null); 
      setEName(""); 
      setEDesc(""); 
    setEStreet("");
    setEPostalCode("");
    setECity("");
    setECountry("");
    setEWebsite("");
    setEPhone("");
      setUpdateError(null);
    }
  };
  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCompany) return;

    // Validierung der Pflichtfelder
    if (!eName.trim()) {
      setUpdateError("Bitte einen Firmennamen eingeben.");
      return;
    }
    if (!eStreet.trim()) {
      setUpdateError("Bitte eine Straße eingeben.");
      return;
    }
    if (!ePostalCode.trim()) {
      setUpdateError("Bitte eine Postleitzahl eingeben.");
      return;
    }
    if (!eCity.trim()) {
      setUpdateError("Bitte eine Stadt eingeben.");
      return;
    }
    if (!eCountry.trim()) {
      setUpdateError("Bitte ein Land eingeben.");
      return;
    }
    
    // Validierung für optionale Felder (Format)
    if (eWebsite.trim() && !eWebsite.trim().match(/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/)) {
      setUpdateError("Bitte eine gültige Website eingeben (z.B. example.com oder www.example.de).");
      return;
    }
    if (ePhone.trim() && !ePhone.trim().match(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)) {
      setUpdateError("Bitte eine gültige Telefonnummer eingeben (z.B. +49 123 456789).");
      return;
    }

    setUpdating(true);
    setUpdateError(null);

   const payload: UpdateCompanyDto = {
  name: eName.trim(),
  description: eDesc.trim() || undefined,
  street: eStreet.trim(),
  postalCode: ePostalCode.trim(),
  city: eCity.trim(),
  country: eCountry.trim(),
  website: eWebsite.trim() || undefined,
  phone: ePhone.trim() || undefined,
};

    try {
      const updated = await updateCompany(editCompany.id, payload);

      setItems(prev =>
        prev.map(row =>
          row.id === editCompany.id 
          ? {
          ...row,
          name: (updated as any).name ?? payload.name,
          description: (updated as any).description ?? payload.description ?? row.description,
          street: (updated as any).street ?? payload.street ?? row.street,
          postalCode: (updated as any).postalCode ?? payload.postalCode ?? row.postalCode,
          city: (updated as any).city ?? payload.city ?? row.city,
          country: (updated as any).country ?? payload.country ?? row.country,
          website: (updated as any).website ?? payload.website ?? row.website,
          phone: (updated as any).phone ?? payload.phone ?? row.phone,
        } : row
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
      {/* HEADER */}
            <PageHeader
      
              title="Firmen Administration"
              subtitle="Verwalte Firmenkonten, Mitarbeiter und zugehörige Kataloge"
              icon={<Network size={40} />}
              gradient="navy"
              height="280px"
              showPattern={true}
      
            />

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
                          {catalogsLoading && !(c.id in catalogCounts) ? (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>…</span>
                          ) : typeof catalogCounts[c.id] === "number" ? (
                            <span
                              className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                              style={{ background: CSS.muted, color: CSS.mutedFg }}
                            >
                              {catalogCounts[c.id]} catalog{catalogCounts[c.id] === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>—</span>
                          )}
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
                        {formatDate(c.created)}
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
            {/* Name */}
  <div>
    <label htmlFor="c-name" className="mb-1 block text-sm font-medium">
      Name *
    </label>
    <input
      id="c-name"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      placeholder="e.g. ACME GmbH"
      value={cName}
      onChange={(e) => setCName(e.target.value)}
      required
    />
  </div>

  {/* Description */}
  <div>
    <label htmlFor="c-desc" className="mb-1 block text-sm font-medium">
      Description
    </label>
    <textarea
      id="c-desc"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      rows={3}
      placeholder="Optional"
      value={cDesc}
      onChange={(e) => setCDesc(e.target.value)}
    />
  </div>

  {/* Address */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="c-street" className="mb-1 block text-sm font-medium">
        Street *
      </label>
      <input
        id="c-street"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={cStreet}
        onChange={(e) => setCStreet(e.target.value)}
        required
      />
    </div>
    <div>
      <label htmlFor="c-postal" className="mb-1 block text-sm font-medium">
        Postal code *
      </label>
      <input
        id="c-postal"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={cPostalCode}
        onChange={(e) => setCPostalCode(e.target.value)}
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="c-city" className="mb-1 block text-sm font-medium">
        City *
      </label>
      <input
        id="c-city"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={cCity}
        onChange={(e) => setCCity(e.target.value)}
        required
      />
    </div>
    <div>
      <label htmlFor="c-country" className="mb-1 block text-sm font-medium">
        Country *
      </label>
      <input
        id="c-country"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={cCountry}
        onChange={(e) => setCCountry(e.target.value)}
        required
      />
    </div>
  </div>

  {/* Contact */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="c-phone" className="mb-1 block text-sm font-medium">
        Phone
      </label>
      <input
        id="c-phone"
        type="tel"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        placeholder="z.B. +49 123 456789"
        value={cPhone}
        onChange={(e) => setCPhone(e.target.value)}
      />
    </div>
    <div>
      <label htmlFor="c-website" className="mb-1 block text-sm font-medium">
        Website
      </label>
      <input
        id="c-website"
        type="text"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        placeholder="example.com"
        value={cWebsite}
        onChange={(e) => setCWebsite(e.target.value)}
      />
    </div>
  </div>

  <div className="flex justify-end gap-2 pt-1">
    <button
      type="button"
      onClick={() => setOpenCreate(false)}
      className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      disabled={creating}
    >
      Cancel
    </button>
    <button
      type="submit"
      className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
      disabled={creating}
    >
      {creating ? "Creating…" : "Create"}
    </button>
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
             {/* Name */}
  <div>
    <label htmlFor="e-name" className="mb-1 block text-sm font-medium">
      Name *
    </label>
    <input
      id="e-name"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      value={eName}
      onChange={(e) => setEName(e.target.value)}
      required
    />
  </div>

  {/* Description */}
  <div>
    <label htmlFor="e-desc" className="mb-1 block text-sm font-medium">
      Description
    </label>
    <textarea
      id="e-desc"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      rows={3}
      value={eDesc}
      onChange={(e) => setEDesc(e.target.value)}
    />
  </div>

  {/* Address Block */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="e-street" className="mb-1 block text-sm font-medium">
        Street *
      </label>
      <input
        id="e-street"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={eStreet}
        onChange={(e) => setEStreet(e.target.value)}
        required
      />
    </div>
    <div>
      <label htmlFor="e-postal" className="mb-1 block text-sm font-medium">
        Postal code *
      </label>
      <input
        id="e-postal"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={ePostalCode}
        onChange={(e) => setEPostalCode(e.target.value)}
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="e-city" className="mb-1 block text-sm font-medium">
        City *
      </label>
      <input
        id="e-city"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={eCity}
        onChange={(e) => setECity(e.target.value)}
        required
      />
    </div>
    <div>
      <label htmlFor="e-country" className="mb-1 block text-sm font-medium">
        Country *
      </label>
      <input
        id="e-country"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={eCountry}
        onChange={(e) => setECountry(e.target.value)}
        required
      />
    </div>
  </div>

  {/* Contact Block */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label htmlFor="e-phone" className="mb-1 block text-sm font-medium">
        Phone
      </label>
      <input
        id="e-phone"
        type="tel"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        placeholder="z.B. +49 123 456789"
        value={ePhone}
        onChange={(e) => setEPhone(e.target.value)}
      />
    </div>
    <div>
      <label htmlFor="e-website" className="mb-1 block text-sm font-medium">
        Website
      </label>
      <input
        id="e-website"
        type="text"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        value={eWebsite}
        onChange={(e) => setEWebsite(e.target.value)}
        placeholder="example.com"
      />
    </div>
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
