import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import companyLogo from "@/assets/comapy.png";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { PermissionButton } from "@/shared/components/permission/PermissionButton";
import {
  Search,
  ArrowUpDown,
  Eye,
  Building2,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";
import { useToast } from "@/shared/contexts/ToastContext";

import {
  getCompanies,
  getWorkersByCompany,
  createCompany,
  deleteCompany,
  type CreateCompanyDto,
  updateCompany,
  type UpdateCompanyDto,
  getAssignmentsByCompany,
  type CompanyApi,
} from "@/features/service/companyService";

import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { useScrollLock } from "@/shared/hooks/useScrollLock";

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

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

export default function CompaniesList() {
  const { showSuccess, showError } = useToast();

  const { has } = useHasPermission();

  const canCreateCompany = has("companies.create");
  const canEditCompany = has("companies.edit");
  const canDeleteCompany = has("companies.delete");
  /* ============== State ============== */
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [workerCounts, setWorkerCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const [catalogCounts, setCatalogCounts] = useState<Record<string, number>>({});
  const [catalogsLoading, setCatalogsLoading] = useState(false);

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
  const [cCountry, setCCountry] = useState("Deutschland");
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

  // Highlight (neu angelegte Firma)
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  /* ============== Data load ============== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getCompanies();
        const list = Array.isArray(raw.reverse()) ? raw : (raw as any)?.content ?? [];
        const mapped = (list as CompanyApi[]).map(mapApiToCompany);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) {
          const err =
            e instanceof Error ? e : new Error(e?.message ?? String(e));
          setError(err);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Worker counts
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
              const count = Array.isArray(data)
                ? data.length
                : Number((data as any)?.total) || 0;
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
    return () => {
      alive = false;
    };
  }, [items]);

  // Catalog counts
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
              const set = new Set<string>();
              if (Array.isArray(list)) {
                for (const a of list) {
                  const cid =
                    (a as any)?.catalog?.id || (a as any)?.catalogId || null;
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
    return () => {
      alive = false;
    };
  }, [items]);

  /* ============== Filter + Sort ============== */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? items.filter((c) => c.name.toLowerCase().includes(term))
      : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (c: Company): string | number => {
        if (sortKey === "workers") return workerCounts[c.id] ?? -1;
        if (sortKey === "catalogs") return catalogCounts[c.id] ?? -1;
        if (sortKey === "status") return c.status ?? "active";
        if (sortKey === "created")
          return c.created ? new Date(c.created).getTime() : 0;
        return c.name.toLowerCase();
      };
      const av = val(a);
      const bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc, workerCounts, catalogCounts]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  /* ============== Pagination wie Users ============== */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => {
    setPage(1);
  }, [q, sortKey, asc, items, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

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
        street: cStreet.trim() || undefined,
        postalCode: cPostalCode.trim() || undefined,
        city: cCity.trim() || undefined,
        country: cCountry.trim() || undefined,
        website: cWebsite.trim() || undefined,
        phone: cPhone.trim() || undefined,
      };
      const created = await createCompany(payload);
      const row = mapApiToCompany(created as any);
      setItems((prev) => [row, ...prev]);
      setWorkerCounts((prev) => ({ ...prev, [row.id]: 0 }));
      setHighlightedId(row.id);
      setTimeout(() => setHighlightedId(null), 2000);

      setCName("");
      setCDesc("");
      setCStreet("");
      setCPostalCode("");
      setCCity("");
      setCCountry("");
      setCWebsite("");
      setCPhone("");
      setOpenCreate(false);

      showSuccess(`Firma "${row.name}" erfolgreich erstellt!`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setCreateError(msg);
      showError(`Fehler beim Erstellen: ${msg}`);
    } finally {
      setCreating(false);
    }
  }

  /* ============== Delete ============== */
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
      setWorkerCounts(({ [targetCompany.id]: _, ...rest }) => rest as any);
      setCatalogCounts(({ [targetCompany.id]: __, ...rest }) => rest as any);
      setOpenDelete(false);
      showSuccess(`Firma "${targetCompany.name}" erfolgreich gelöscht.`);
      setTargetCompany(null);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setDeleteError(msg);
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Löschen: ${msg}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  /* ============== Edit ============== */
  const openEditFor = (c: Company) => {
    setEditCompany(c);
    setEName(c.name);
    setEDesc(c.description ?? "");
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
    if (updating) return;
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
  };

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCompany) return;

    const payload: UpdateCompanyDto = {
      name: eName.trim() || editCompany.name,
      description: eDesc.trim() || undefined,
      street: eStreet.trim() || undefined,
      postalCode: ePostalCode.trim() || undefined,
      city: eCity.trim() || undefined,
      country: eCountry.trim() || undefined,
      website: eWebsite.trim() || undefined,
      phone: ePhone.trim() || undefined,
    };

    try {
      const updated = await updateCompany(editCompany.id, payload);

      setItems((prev) =>
        prev.map((row) =>
          row.id === editCompany.id
            ? {
              ...row,
              name: (updated as any).name ?? payload.name,
              description:
                (updated as any).description ??
                payload.description ??
                row.description,
              street:
                (updated as any).street ??
                payload.street ??
                row.street,
              postalCode:
                (updated as any).postalCode ??
                payload.postalCode ??
                row.postalCode,
              city:
                (updated as any).city ?? payload.city ?? row.city,
              country:
                (updated as any).country ??
                payload.country ??
                row.country,
              website:
                (updated as any).website ??
                payload.website ??
                row.website,
              phone:
                (updated as any).phone ?? payload.phone ?? row.phone,
            }
            : row
        )
      );

      cancelEdit();
      showSuccess(`Firma "${payload.name}" erfolgreich aktualisiert!`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setUpdateError(msg);
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Aktualisieren: ${msg}`);
      }
    } finally {
      setUpdating(false);
    }
  }
  const anyModalOpen = openCreate || openEdit || openDelete;
  useScrollLock(anyModalOpen);


  /* ============== Render ============== */
  return (
    <AdminLayout>
      {/* ===== Hero ===== */}
      <PageHeader
        title="Firmen Administration"
        subtitle="Verwalte Firmenkonten, Mitarbeiter und zugehörige Kataloge"
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

        {/* ===== Top-Bar: Breadcrumb als Pill + Button rechts ===== */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
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
              {/* Icon-Badge */}
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

              <span
                className="font-semibold"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Firmen
              </span>
            </div>
          </nav>

          {/* New Company Button – wie Add User */}
          <PermissionButton
            type="button"
            allowed={canCreateCompany}
            tooltip="Du brauchst die Berechtigung: companies.create"
            onClick={() => setOpenCreate(true)}
            className="
    inline-flex items-center gap-2
    rounded-full
    px-5 py-2.5
    text-sm font-semibold
    shadow-[0_6px_18px_rgba(0,0,0,0.16)]
    focus:outline-none
    transition
    hover:-translate-y-[1px]
    hover:brightness-105
  "
            style={{
              background: "hsl(40,60%,63%)",
              color: "hsl(200,32%,22%)",
              border: "1px solid rgba(255,255,255,0.9)",
            }}
            aria-label="New Company"
          >
            <Plus size={16} />
            New Company
          </PermissionButton>



        </div>

        {/* ===== Suche + Count – gleicher Stil wie Users ===== */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.gray }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Firmen (Name)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="
                  w-full h-10 md:h-11
                  rounded-[999px]
                  border
                  pl-10 pr-4
                  text-sm
                  outline-none
                  transition
                  bg-white
                "
                style={{
                  borderColor: BRAND.sand,
                  color: CSS.fg,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = BRAND.gold;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = BRAND.sand;
                }}
              />
            </div>

            {/* Zähler rechts – Badge wie bei Users */}
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: BRAND.navy,
                  color: "white",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: BRAND.gold }}
                />
                <span>
                  Zeige{" "}
                  <span className="font-semibold">{filtered.length}</span>{" "}
                  Firmen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Tabelle (mit WithPermissionCheck, gleiche Card wie Users) ===== */}
        <WithPermissionCheck error={error} loading={loading} minHeight="auto">
          <section
            className="
              max-w-[1400px] xl:max-w-[1600px]
              mx-auto
              rounded-[12px]
              border
              shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
              overflow-hidden
            "
            style={{
              borderColor: CSS.border,
              background: BRAND.fog,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
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
                    {[
                      { k: "name", label: "Company" },
                      { k: "workers", label: "Workers" },
                      { k: "catalogs", label: "Catalogs" },
                      { k: "status", label: "Status" },
                      { k: "created", label: "Created" },
                      { k: null, label: "Actions" },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-[0.85rem] font-semibold ${col.label === "Actions"
                          ? "text-center"
                          : "text-left"
                          }`}
                        style={{ color: CSS.fg }}
                      >
                        {col.k ? (
                          <button
                            type="button"
                            onClick={() => setSort(col.k as SortKey)}
                            className="inline-flex items-center gap-2 hover:brightness-110"
                            style={{ color: "inherit" }}
                          >
                            <span>{col.label}</span>
                            <ArrowUpDown
                              size={14}
                              className="opacity-60"
                            />
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
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 bg-white"
                      >
                        Lade Firmen…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 bg-white"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                            style={{
                              color: "hsla(200,32%,22%,0.65)",
                            }}
                          >
                            <Search size={20} />
                          </div>

                          <div className="space-y-1">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: CSS.fg }}
                            >
                              {q.trim()
                                ? "Keine Treffer für deine Suche"
                                : "Noch keine Firmen vorhanden"}
                            </p>
                            <p className="text-xs text-slate-500 max-w-md">
                              {q.trim()
                                ? "Bitte passe den Suchbegriff an oder setze den Filter zurück."
                                : "Lege die erste Firma an, um mit der Administration zu starten."}
                            </p>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                            {q.trim() && (
                              <button
                                type="button"
                                onClick={() => setQ("")}
                                className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                                style={{
                                  borderColor: CSS.border,
                                  color: CSS.mutedFg,
                                }}
                              >
                                Filter zurücksetzen
                              </button>
                            )}

                            {!q.trim() && (
                              <PermissionButton
                                type="button"
                                allowed={canCreateCompany}
                                tooltip="Du brauchst die Berechtigung: companies.create"
                                onClick={() => setOpenCreate(true)}
                                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold shadow hover:[filter:brightness(1.05)]"
                                style={{
                                  background: "hsl(40,60%,63%)",
                                  color: "hsl(200,32%,22%)",
                                  boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                                }}
                              >
                                <Plus size={14} />
                                Firma anlegen
                              </PermissionButton>

                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((c) => {
                      const uCount = workerCounts[c.id];
                      const catCount = catalogCounts[c.id];
                      const isHighlighted = highlightedId === c.id;

                      return (
                        <tr
                          key={c.id}
                          className={`
                            bg-white
                            transition
                            border-l-[4px] border-transparent
                            hover:border-[#E3BB62]
                            hover:bg-[#fff9ec]
                            hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                            ${isHighlighted
                              ? "animate-pulse"
                              : ""
                            }
                          `}
                          style={
                            isHighlighted
                              ? {
                                borderLeftColor:
                                  "rgb(34 197 94)",
                                boxShadow:
                                  "0 0 0 2px rgba(34,197,94,0.25)",
                                background:
                                  "linear-gradient(to right, rgba(34,197,94,0.08), rgba(255,255,255,1))",
                              }
                              : undefined
                          }
                        >
                          {/* Company */}
                          <td
                            className="px-4 py-4"
                            style={{
                              borderBottom: `1px solid ${CSS.border}`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="grid h-9 w-9 place-items-center rounded-md"
                                style={{
                                  background: "hsl(var(--primary)/.10)",
                                }}
                              >
                                <img
                                  src={companyLogo}
                                  alt="Company logo"
                                  className="h-7 w-7 object-contain"
                                />
                              </div>
                              <span
                                className="font-semibold"
                                style={{ color: CSS.fg }}
                              >
                                {c.name}
                              </span>
                            </div>

                          </td>

                          {/* Workers */}
                          <td
                            className="px-4 py-4"
                            style={{
                              borderBottom: `1px solid ${CSS.border}`,
                            }}
                          >
                            {countsLoading &&
                              !(c.id in workerCounts) ? (
                              <span
                                className="text-[0.875rem]"
                                style={{ color: CSS.mutedFg }}
                              >
                                …
                              </span>
                            ) : typeof uCount === "number" ? (
                              <span
                                className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                                style={{
                                  background: CSS.muted,
                                  color: CSS.mutedFg,
                                }}
                              >
                                {uCount} worker
                                {uCount === 1 ? "" : "s"}
                              </span>
                            ) : (
                              <span
                                className="text-[0.875rem]"
                                style={{ color: CSS.mutedFg }}
                              >
                                —
                              </span>
                            )}
                          </td>

                          {/* Catalogs */}
                          <td
                            className="px-4 py-4"
                            style={{
                              borderBottom: `1px solid ${CSS.border}`,
                            }}
                          >
                            {catalogsLoading &&
                              !(c.id in catalogCounts) ? (
                              <span
                                className="text-[0.875rem]"
                                style={{ color: CSS.mutedFg }}
                              >
                                …
                              </span>
                            ) : typeof catCount === "number" ? (
                              <span
                                className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                                style={{
                                  background: CSS.muted,
                                  color: CSS.mutedFg,
                                }}
                              >
                                {catCount} catalog
                                {catCount === 1 ? "" : "s"}
                              </span>
                            ) : (
                              <span
                                className="text-[0.875rem]"
                                style={{ color: CSS.mutedFg }}
                              >
                                —
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td
                            className="px-4 py-4"
                            style={{
                              borderBottom: `1px solid ${CSS.border}`,
                            }}
                          >
                            <span
                              className={
                                (c.status ?? "active") === "active"
                                  ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                                  : "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                              }
                            >
                              {(c.status ?? "active") === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          {/* Created */}
                          {/* Created */}
                          <td
                            className="px-4 py-4"
                            style={{ borderBottom: `1px solid ${CSS.border}` }}
                          >
                            <span
                              className="text-sm"
                              style={{ color: CSS.mutedFg }}
                            >
                              {formatDate(c.created)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-4 text-center whitespace-nowrap"
                            style={{ borderBottom: `1px solid ${CSS.border}` }}
                          >
                            <div className="inline-flex items-center justify-center gap-2">
                              {/* View wie bei Users */}
                              <Link
                                to={`/admin/adminPanel/companies/${c.id}`}
                                title="View"
                                className="
        inline-flex items-center gap-1.5
        rounded-full
        px-3 py-1.5
        text-[11px] font-semibold
        focus:outline-none
        transition
        hover:-translate-y-[0.5px]
      "
                                style={{
                                  background: "hsl(40,60%,63%)",
                                  color: "hsl(200,32%,22%)",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
                                  border: "1px solid rgba(255,255,255,0.9)",
                                }}
                              >
                                <Eye size={13} />
                                <span className="hidden sm:inline">View</span>
                              </Link>

                              {/* Edit */}
                              <PermissionButton
                                type="button"
                                allowed={canEditCompany}
                                tooltip="Du brauchst: companies.edit"
                                aria-label="Edit company"
                                onClick={() => openEditFor(c)}
                                title="Edit"
                                className="
    inline-flex items-center justify-center
    rounded-full
    px-2.5 py-1.5
    text-[11px] font-medium
    border
    transition
    hover:bg-[#f5f0e4]
  "
                                style={{
                                  borderColor: "#d2c9b9",
                                  color: "#264555",
                                  background: "#ffffff",
                                }}
                              >
                                <Pencil size={13} />
                              </PermissionButton>


                              {/* Delete */}
                              <PermissionButton
                                type="button"
                                allowed={canDeleteCompany}
                                tooltip="Du brauchst: companies.delete"
                                aria-label="Delete company"
                                onClick={() => askDelete(c)}
                                title="Löschen"
                                className="
    inline-flex items-center justify-center
    rounded-full
    px-2.5 py-1.5
    text-[11px] font-medium
    border
    transition
    hover:bg-[#fff1f1]
  "
                                style={{
                                  borderColor: "rgba(248,113,113,0.8)",
                                  color: "rgb(185,28,28)",
                                  background: "#ffffff",
                                }}
                              >
                                <Trash2 size={13} />
                              </PermissionButton>

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
        </WithPermissionCheck>

        {/* === Pagination (wie Users) === */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-3
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Links: Range-Info */}
            <div
              className="text-xs sm:text-sm"
              style={{ color: "#808080" }}
            >
              Zeige{" "}
              <span
                className="font-semibold"
                style={{ color: "#264555" }}
              >
                {startIdx}
              </span>
              –
              <span
                className="font-semibold"
                style={{ color: "#264555" }}
              >
                {endIdx}
              </span>{" "}
              von{" "}
              <span
                className="font-semibold"
                style={{ color: "#264555" }}
              >
                {total}
              </span>{" "}
              Einträgen
            </div>

            {/* Rechts: Rows per page + Page X of Y + Pfeile */}
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: "#808080" }}
                >
                  Anzahl der Zeilen pro Seite
                </span>

                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(Number(e.target.value))
                    }
                    className="
                      h-9 min-w-[72px]
                      rounded-full
                      border
                      bg-white
                      px-3 pr-8
                      text-sm font-medium
                      outline-none
                      appearance-none
                      shadow-sm
                      focus:ring-2
                    "
                    style={{
                      borderColor: "#d2c9b9",
                      color: "#264555",
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span
                    className="
                      pointer-events-none
                      absolute right-3 top-1/2 -translate-y-1/2
                      text-[10px]
                    "
                    style={{ color: "#b0b0b0" }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              {/* Page X of Y */}
              <span
                className="
                  inline-flex items-center
                  rounded-full
                  px-3 py-1.5
                  text-xs sm:text-sm font-semibold
                "
                style={{
                  background: "#264555",
                  color: "white",
                }}
              >
                Seite {page} von {totalPages}
              </span>

              {/* Pfeil-Buttons */}
              <div className="flex items-center gap-1">
                {[
                  {
                    label: "«",
                    onClick: () => setPage(1),
                    disabled: page <= 1 || total === 0,
                  },
                  {
                    label: "‹",
                    onClick: () =>
                      setPage((p) => Math.max(1, p - 1)),
                    disabled: page <= 1 || total === 0,
                  },
                  {
                    label: "›",
                    onClick: () =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1)
                      ),
                    disabled:
                      page >= totalPages || total === 0,
                  },
                  {
                    label: "»",
                    onClick: () => setPage(totalPages),
                    disabled:
                      page >= totalPages || total === 0,
                  },
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full border text-xs sm:text-sm font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition
                    "
                    style={{
                      borderColor: "#d2c9b9",
                      color: "#264555",
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      if (!btn.disabled) {
                        e.currentTarget.style.background = "#fff9ec";
                        e.currentTarget.style.borderColor = "#E3BB62";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#d2c9b9";
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Delete Confirm Modal (wie Users) ===== */}
      <ConfirmModal
        open={openDelete && !!targetCompany}
        title="Firma löschen?"
        description={
          <>
            Willst du die Firma{" "}
            <span className="font-semibold">
              {targetCompany?.name}
            </span>{" "}
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
          if (!deleting) {
            void confirmDelete();
          }
        }}
        icon={<Trash2 className="text-red-500" />}
      />

      {/* ===== Create Company Modal – gleicher Style wie Create User ===== */}
      {openCreate && (
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
              {/* Deko-Glows */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  Create Company
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Felder mit{" "}
                  <span className="text-red-500">*</span> sind
                  Pflichtfelder.
                </p>

                {createError && (
                  <div
                    className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="alert"
                  >
                    {createError}
                  </div>
                )}

                <form
                  id="create-company-form"
                  onSubmit={onCreateCompany}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="c-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="c-name"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      placeholder="z. B. ACME GmbH"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="c-desc"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="c-desc"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      rows={3}
                      placeholder="Optional"
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                    />
                  </div>

                  {/* Adresse */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="c-street"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Straße
                      </label>
                      <input
                        id="c-street"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={cStreet}
                        onChange={(e) =>
                          setCStreet(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-postal"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        PLZ
                      </label>
                      <input
                        id="c-postal"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={cPostalCode}
                        onChange={(e) =>
                          setCPostalCode(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="c-city"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Stadt
                      </label>
                      <input
                        id="c-city"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={cCity}
                        onChange={(e) => setCCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-country"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Land
                      </label>
                      <input
                        id="c-country"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={cCountry}
                        onChange={(e) =>
                          setCCountry(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Kontakt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="c-phone"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Telefon
                      </label>
                      <input
                        id="c-phone"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={cPhone}
                        onChange={(e) =>
                          setCPhone(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-website"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Website
                      </label>
                      <input
                        id="c-website"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        placeholder="https://example.com"
                        value={cWebsite}
                        onChange={(e) =>
                          setCWebsite(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Fußleisten-Buttons wie bei Create User */}
            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="
                  flex-1
                  h-12
                  text-sm font-medium
                  text-slate-800
                  bg-[#f3f3f3]
                  hover:bg-[#e5e5e5]
                  border border-slate-200
                  rounded-xl
                  disabled:opacity-60
                "
                disabled={creating}
              >
                Abbrechen
              </button>

              <button
                type="submit"
                form="create-company-form"
                className="
                  flex-1
                  h-12
                  text-sm font-semibold
                  rounded-xl
                  bg-[#E3BB62]
                  text-[#264555]
                  hover:bg-[#d8ac55]
                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  transition
                  hover:-translate-y-[1px]
                  disabled:opacity-60
                "
                disabled={creating}
              >
                {creating ? "Erstelle…" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Company Modal – gleicher Style wie Edit User ===== */}
      {openEdit && editCompany && (
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
              {/* Deko-Glows */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                  Edit Company
                </h3>

                {updateError && (
                  <div
                    className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                    role="alert"
                  >
                    {updateError}
                  </div>
                )}

                <form
                  id="edit-company-form"
                  onSubmit={onEditSubmit}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="e-name"
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="e-name"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      value={eName}
                      onChange={(e) => setEName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="e-desc"
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="e-desc"
                      className="
                        w-full rounded-xl border px-3 py-2.5 text-sm
                        bg-slate-50
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                        transition
                      "
                      rows={3}
                      value={eDesc}
                      onChange={(e) => setEDesc(e.target.value)}
                    />
                  </div>

                  {/* Adresse */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="e-street"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Straße
                      </label>
                      <input
                        id="e-street"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={eStreet}
                        onChange={(e) =>
                          setEStreet(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="e-postal"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        PLZ
                      </label>
                      <input
                        id="e-postal"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={ePostalCode}
                        onChange={(e) =>
                          setEPostalCode(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="e-city"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Stadt
                      </label>
                      <input
                        id="e-city"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={eCity}
                        onChange={(e) => setECity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="e-country"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Land
                      </label>
                      <input
                        id="e-country"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={eCountry}
                        onChange={(e) =>
                          setECountry(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Kontakt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="e-phone"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Telefon
                      </label>
                      <input
                        id="e-phone"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={ePhone}
                        onChange={(e) =>
                          setEPhone(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="e-website"
                        className="mb-1 block text-sm font-medium text-slate-700"
                      >
                        Website
                      </label>
                      <input
                        id="e-website"
                        className="
                          w-full rounded-xl border px-3 py-2.5 text-sm
                          bg-slate-50
                          border-slate-200
                          outline-none
                          focus:bg-white
                          focus:border-[#E3BB62]
                          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                          transition
                        "
                        value={eWebsite}
                        onChange={(e) =>
                          setEWebsite(e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Buttons wie bei Edit User */}
            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={updating}
                className="
                  flex-1
                  h-12
                  text-sm font-medium
                  text-slate-800
                  bg-[#f3f3f3]
                  hover:bg-[#e5e5e5]
                  border border-slate-200
                  rounded-xl
                  disabled:opacity-60
                "
              >
                Abbrechen
              </button>

              <button
                type="submit"
                form="edit-company-form"
                disabled={updating}
                className="
                  flex-1
                  h-12
                  text-sm font-semibold
                  rounded-xl
                  bg-[#E3BB62]
                  text-[#264555]
                  hover:bg-[#d8ac55]1
                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  transition
                  hover:-translate-y-[1px]
                  disabled:opacity-60
                "
              >
                {updating ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
