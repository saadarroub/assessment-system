import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import myLogo from "@/assets/Zero-6-icons-05.webp";
import { Search, ArrowUpDown, Shield, Plus, Trash2, Pencil } from "lucide-react";
import {
  getRoles,
  getRolePermissions,
  getAllPermissions,
  createRole,
  grantPermissions,
   updateRole,    
  deleteRole,
  type RoleApi,
  type PermissionApi,
} from "@/features/service/roleService";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";
import { useToast } from "@/shared/contexts/ToastContext";

/* ================= Types ================= */
type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  created: string;
};

type SortKey = "name" | "description" | "permissionCount" | "created";

function mapApiToRole(r: RoleApi): RoleRow {
  return {
    id: String(r.id),
    name: String(r.name ?? "Unnamed Role"),
    description: String(r.description ?? ""),
    permissionCount: 0, // Wird später geladen
    created: r.createdAt || r.created_at || new Date().toISOString(),
  };
}

/* ============== CSS Tokens wie UserList ============== */
const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
  primary: "hsl(var(--primary,205 35% 24%))",
  primaryFg: "hsl(var(--primary-foreground,0 0% 98%))",
  muted: "hsl(var(--muted,210 40% 97%))",
  mutedBg: "hsla(200,32%,22%,0.05)",
};

export default function RoleList() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [permissionCounts, setPermissionCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Pagination – wie bei Users
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Create Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionApi[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
   // ===== Edit Role Modal =====
  const [openEdit, setOpenEdit] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ===== Delete Role Modal =====
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingRole, setDeletingRole] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ============== Data Load ============== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getRoles();
        const mapped = (raw ?? []).map(mapApiToRole);
        if (alive) setItems(mapped.reverse());
      } catch (e: any) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load permission counts for each role
  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setCountsLoading(true);
    (async () => {
      try {
        const counts: Record<string, number> = {};
        for (const role of items) {
          const permissions = await getRolePermissions(role.id);
          counts[role.id] = permissions.length;
        }
        if (alive) setPermissionCounts(counts);
      } catch (e) {
        console.error("Fehler beim Laden der Permission-Counts:", e);
      } finally {
        if (alive) setCountsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [items]);

  /* ============== Create Role Functions ============== */
  const openCreateModal = async () => {
    setCName("");
    setCDesc("");
    setSelectedPermissions([]);
    setCreateError(null);
    setActiveCategory(null);
    setOpenCreate(true);

    // Load all permissions
    if (!allPermissions.length) {
      setPermissionsLoading(true);
      try {
        const perms = await getAllPermissions();
        setAllPermissions(perms);
      } catch (e: any) {
        setCreateError(e?.message ?? "Fehler beim Laden der Permissions");
      } finally {
        setPermissionsLoading(false);
      }
    }
  };

  const closeCreateModal = () => {
    if (creating) return;
    setOpenCreate(false);
    setCName("");
    setCDesc("");
    setSelectedPermissions([]);
    setCreateError(null);
    setActiveCategory(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      setCreateError("Bitte Rollennamen eingeben");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      //  Create role
      const newRole = await createRole({
        name: cName.trim(),
        description: cDesc.trim() || undefined,
      });

      // Grant selected permissions
      if (selectedPermissions.length > 0) {
        await grantPermissions(newRole.id, selectedPermissions);
      }

      // Update UI
      const mapped = mapApiToRole(newRole);
      setItems((prev) => [mapped, ...prev]);
      setPermissionCounts((prev) => ({ ...prev, [newRole.id]: selectedPermissions.length }));

      showSuccess(`Rolle "${newRole.name}" erfolgreich erstellt!`);
      closeCreateModal();
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      setCreateError(errorMsg);
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Erstellen: ${errorMsg}`);
      }
    } finally {
      setCreating(false);
    }
  };

    /* ============== Edit Role Functions ============== */

  const openEditModal = (role: RoleRow) => {
    setEditingRole(role);
    setEName(role.name);
    setEDesc(role.description);
    setUpdateError(null);
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    if (updating) return;
    setOpenEdit(false);
    setEditingRole(null);
    setEName("");
    setEDesc("");
    setUpdateError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    const name = eName.trim() || editingRole.name;
    const description = eDesc.trim();

    if (!name) {
      setUpdateError("Bitte einen Rollennamen angeben.");
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      const updated = await updateRole(editingRole.id, {
        name,
        description: description || undefined,
      });

      // UI aktualisieren
      setItems(prev =>
        prev.map(r =>
          r.id === editingRole.id
            ? {
                ...r,
                name: updated.name ?? name,
                description: updated.description ?? description,
              }
            : r
        )
      );

      showSuccess(`Rolle "${updated.name ?? name}" erfolgreich aktualisiert!`);
      closeEditModal();
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setUpdateError(msg);
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Aktualisieren: ${msg}`);
      }
    } finally {
      setUpdating(false);
    }
  };

    /* ============== Delete Role Functions ============== */

  const openDeleteModal = (role: RoleRow) => {
    setDeletingRole(role);
    setDeleteError(null);
    setOpenDelete(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setOpenDelete(false);
    setDeletingRole(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteRole(deletingRole.id);

      setItems(prev => prev.filter(r => r.id !== deletingRole.id));

      // Permission-Count im State entfernen
      setPermissionCounts(prev => {
        const copy = { ...prev };
        delete copy[deletingRole.id];
        return copy;
      });

      showSuccess(`Rolle "${deletingRole.name}" erfolgreich gelöscht!`);
      closeDeleteModal();
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


  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Group permissions by category (prefix before first dot)
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionApi[]> = {};

    allPermissions.forEach((perm) => {
      const category = perm.name.includes(".") ? perm.name.split(".")[0] : "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });

    // Sort categories alphabetically, but put 'other' last
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return a.localeCompare(b);
    });

    return sorted;
  }, [allPermissions]);

  // Standard-ActiveCategory setzen
  useEffect(() => {
    if (!activeCategory && groupedPermissions.length > 0) {
      setActiveCategory(groupedPermissions[0][0]);
    }
  }, [groupedPermissions, activeCategory]);

  // Get permissions for active category
  const activeCategoryPerms = useMemo(() => {
    if (!activeCategory) return [];
    const found = groupedPermissions.find(([cat]) => cat === activeCategory);
    return found ? found[1] : [];
  }, [groupedPermissions, activeCategory]);

  /* ============== Filtering & Sorting ============== */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? items.filter(
          (r) =>
            r.name.toLowerCase().includes(term) ||
            r.description.toLowerCase().includes(term)
        )
      : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (r: RoleRow): string | number => {
        if (sortKey === "permissionCount") return permissionCounts[r.id] ?? 0;
        if (sortKey === "created") return new Date(r.created).getTime();
        if (sortKey === "description") return r.description.toLowerCase();
        return r.name.toLowerCase();
      };
      const av = val(a);
      const bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc, permissionCounts]);

  // Pagination wie bei Users
  useEffect(() => {
    setPage(1);
  }, [q, sortKey, asc, items.length]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("de-DE");
  };

  return (
    <AdminLayout>
      {/* ===== Hero wie bei Users ===== */}
      <header className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4">
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
          <div className="justify-self-center">
            <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05]
             [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
              <div className="flex items-center justify-center gap-4">
                <img
                  src={myLogo}
                  alt="Logo"
                  className="h-[200px] w-[200px] object-contain shrink-0"
                  width={200}
                  height={200}
                />
                <div className="text-center">
                  <h1 className="text-[clamp(28px,6vw,56px)] font-extrabold tracking-[-0.02em] mb-2 leading-[1.05] text-[#264555]">
                    Rollen Verwaltung
                  </h1>
                  <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
                    Rollen von CapConsulting verwalten und Berechtigungen zuweisen
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      {/* ===== Main wie UsersPage ===== */}
      <main
        className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6"
        style={{ background: CSS.adminBg }}
      >
        {/* Top-Bar: Breadcrumb + Add-Button (eine Zeile) */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          {/* Breadcrumb links */}
          <nav
            className="flex items-center gap-2 text-[0.9rem]"
            style={{ color: CSS.mutedFg }}
          >
            <Link
              to="/admin/adminPanel"
              className="hover:underline"
              style={{ color: CSS.mutedFg }}
            >
              Admin Panel
            </Link>
            <span className="opacity-60">›</span>
            <span
              className="font-semibold"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Roles
            </span>
          </nav>

          {/* Create Role Button – Gelb wie in UsersPage */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
            style={{
              background: "hsl(40,60%,63%)", // Gelb
              color: "hsl(200,32%,22%)", // dunkles Blau-Grau
              boxShadow: "0 1px 2px rgba(0,0,0,.05)",
            }}
            aria-label="Add Role"
          >
            <Plus size={16} />
            Neue Rolle
          </button>
        </div>

        {/* Suche + Count – wie in UsersPage */}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[12px] border bg-white/85 [backdrop-filter:saturate(1.2)_blur(4px)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          style={{ borderColor: CSS.border }}
        >
          <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: CSS.mutedFg }}
              >
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Suche Rollen (Name oder Beschreibung)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full h-10 md:h-11 rounded-md border pl-10 pr-3 text-sm outline-none transition focus:ring-2"
                style={{
                  borderColor: CSS.border,
                  background: CSS.card,
                  color: CSS.fg,
                  boxShadow: "0 0 #0000",
                }}
              />
            </div>

            {/* Zähler rechts */}
            <div
              className="inline-block text-sm font-medium px-3 md:px-4 py-2 rounded-lg border"
              style={{
                background: CSS.card,
                color: CSS.mutedFg,
                borderColor: CSS.border,
              }}
            >
              Zeige{" "}
              <span
                className="font-semibold"
                style={{ color: CSS.fg }}
              >
                {filtered.length}
              </span>{" "}
              Rollen
            </div>
          </div>
        </div>

        {/* ===== Card (um die Tabelle) ===== */}
        <WithPermissionCheck error={error} loading={loading} minHeight="400px">
          <section
            className="max-w-[1400px] xl:max-w-[1600px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]"
            style={{ background: CSS.card, borderColor: CSS.border }}
          >
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-[hsl(var(--card))]">
                <thead
                  className="bg-[hsla(200,32%,22%,0.05)]"
                  style={{
                    borderBottom: "2px solid hsla(200,32%,22%,0.1)",
                  }}
                >
                  <tr>
                    {[
                      { k: "name", label: "Rolle" },
                      { k: "description", label: "Beschreibung" },
                      { k: "permissionCount", label: "Berechtigungen" },
                      { k: "created", label: "Erstellt" },
                      { k: null, label: "Aktionen" },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-[0.85rem] font-semibold ${
                          col.label === "Aktionen"
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
                        colSpan={5}
                        className="px-4 py-4"
                      >
                        Lade Rollen…
                      </td>
                    </tr>
                  ) : pageData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4"
                      >
                        {q ? "Keine Rollen gefunden." : "Noch keine Rollen vorhanden."}
                      </td>
                    </tr>
                  ) : (
                    pageData.map((role) => (
                      <tr
                        key={role.id}
                        className="transition border-l-[4px] border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]"
                      >
                        {/* Rolle */}
                        <td
                          className="px-4 py-4 font-semibold"
                          style={{
                            borderBottom: `1px solid ${CSS.border}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Shield
                              size={16}
                              className="text-gray-400"
                            />
                            <span>{role.name}</span>
                          </div>
                        </td>

                        {/* Beschreibung */}
                        <td
                          className="px-4 py-4 text-[0.875rem]"
                          style={{
                            color: CSS.mutedFg,
                            borderBottom: `1px solid ${CSS.border}`,
                          }}
                        >
                          {role.description || "—"}
                        </td>

                        {/* Permissions Count */}
                        <td
                          className="px-4 py-4 text-center"
                          style={{
                            borderBottom: `1px solid ${CSS.border}`,
                          }}
                        >
                          {countsLoading && permissionCounts[role.id] == null ? (
                            <span
                              className="text-[0.875rem]"
                              style={{ color: CSS.mutedFg }}
                            >
                              …
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-full bg-[#e5ebf0] px-3 py-1 text-xs font-semibold text-[#264555]">
                              {permissionCounts[role.id] ?? 0}
                            </span>
                          )}
                        </td>

                        {/* Erstellt */}
                        <td
                          className="px-4 py-4 text-[0.875rem]"
                          style={{
                            color: CSS.mutedFg,
                            borderBottom: `1px solid ${CSS.border}`,
                          }}
                        >
                          {formatDate(role.created)}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-4 text-center whitespace-nowrap"
                          style={{
                            borderBottom: `1px solid ${CSS.border}`,
                          }}
                        >
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* Edit */}
                            <button
                              type="button"
                              aria-label="Edit role"
                              title="Bearbeiten"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border hover:bg-slate-50"
                              style={{
                                borderColor: CSS.border,
                                color: CSS.fg,
                              }}
                               onClick={() => openEditModal(role)}
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              aria-label="Delete role"
                              title="Löschen"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border text-red-600 hover:bg-red-50"
                              style={{ borderColor: "rgb(254 202 202)" }}
                              onClick={() => openDeleteModal(role)} 
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </WithPermissionCheck>

        {/* Pagination*/}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4 rounded-[12px] border bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          style={{ borderColor: CSS.border }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-sm"
              style={{ color: CSS.mutedFg }}
            >
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

      {/* ========== Create Role Modal ========== */}
      {openCreate && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4"
          onClick={closeCreateModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: CSS.fg }}
              >
                Neue Rolle erstellen
              </h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                disabled={creating}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleCreateSubmit}
              className="p-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: CSS.fg }}
                >
                  Rollenname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="z.B. EDITOR"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#264555] transition-colors"
                  style={{ borderColor: CSS.border }}
                  disabled={creating}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: CSS.fg }}
                >
                  Beschreibung
                </label>
                <textarea
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Optionale Beschreibung"
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#264555] transition-colors resize-none"
                  style={{ borderColor: CSS.border }}
                  disabled={creating}
                />
              </div>

              {/* Permissions Multi-Select */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: CSS.fg }}
                >
                  Berechtigungen ({selectedPermissions.length} ausgewählt)
                </label>

                {permissionsLoading ? (
                  <div
                    className="text-center py-8 text-sm"
                    style={{ color: CSS.mutedFg }}
                  >
                    Lade Berechtigungen...
                  </div>
                ) : allPermissions.length === 0 ? (
                  <div
                    className="text-center py-4 text-sm"
                    style={{ color: CSS.mutedFg }}
                  >
                    Keine Berechtigungen verfügbar
                  </div>
                ) : (
                  <div
                    className="rounded-lg border"
                    style={{ borderColor: CSS.border }}
                  >
                    {/* Category Tabs Navigation */}
                    <div
                      className="flex overflow-x-auto border-b"
                      style={{ borderColor: CSS.border }}
                    >
                      {groupedPermissions.map(([category, perms]) => {
                        const categoryPermIds = perms.map((p) => p.id);
                        const selectedInCategory = categoryPermIds.filter((id) =>
                          selectedPermissions.includes(id)
                        ).length;
                        const isActive = activeCategory === category;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            disabled={creating}
                            className="relative flex-shrink-0 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap"
                            style={{
                              color: isActive ? CSS.primary : CSS.mutedFg,
                              borderBottomColor: isActive
                                ? CSS.primary
                                : "transparent",
                              background: isActive ? CSS.mutedBg : "transparent",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="uppercase tracking-wide">
                                {category}
                              </span>
                              <span
                                className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: isActive
                                    ? CSS.primary
                                    : CSS.border,
                                  color: isActive ? "white" : CSS.mutedFg,
                                }}
                              >
                                {selectedInCategory > 0 && (
                                  <span>{selectedInCategory}/</span>
                                )}
                                <span>{perms.length}</span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Category Content */}
                    {activeCategory && activeCategoryPerms.length > 0 && (
                      <div className="p-4">
                        {/* Category Actions */}
                        <div
                          className="flex items-center justify-between mb-3 pb-3 border-b"
                          style={{ borderColor: CSS.border }}
                        >
                          <span
                            className="text-sm font-medium"
                            style={{ color: CSS.fg }}
                          >
                            {
                              activeCategoryPerms.filter((p) =>
                                selectedPermissions.includes(p.id)
                              ).length
                            }{" "}
                            von {activeCategoryPerms.length} ausgewählt
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const categoryPermIds = activeCategoryPerms.map(
                                (p) => p.id
                              );
                              const allSelected = categoryPermIds.every((id) =>
                                selectedPermissions.includes(id)
                              );
                              if (allSelected) {
                                setSelectedPermissions((prev) =>
                                  prev.filter(
                                    (id) => !categoryPermIds.includes(id)
                                  )
                                );
                              } else {
                                setSelectedPermissions((prev) => [
                                  ...new Set([...prev, ...categoryPermIds]),
                                ]);
                              }
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition-all"
                            style={{ background: CSS.primary, color: "white" }}
                            disabled={creating}
                          >
                            {activeCategoryPerms.every((p) =>
                              selectedPermissions.includes(p.id)
                            )
                              ? "Alle abwählen"
                              : "Alle wählen"}
                          </button>
                        </div>

                        {/* Permissions List */}
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {activeCategoryPerms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 rounded border-gray-300 text-[#264555] focus:ring-[#264555]"
                                disabled={creating}
                              />
                              <div className="flex-1 min-w-0">
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: CSS.fg }}
                                >
                                  {perm.name}
                                </div>
                                {perm.description && (
                                  <div
                                    className="text-xs mt-0.5"
                                    style={{ color: CSS.mutedFg }}
                                  >
                                    {perm.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error */}
              {createError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {createError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: CSS.border, color: CSS.fg }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={creating || !cName.trim()}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: CSS.primary }}
                >
                  {creating ? "Erstellt..." : "Rolle erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
            {/* ========== Edit Role Modal ========== */}
      {openEdit && editingRole && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4"
          onClick={closeEditModal}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-xl font-semibold" style={{ color: CSS.fg }}>
                Rolle bearbeiten
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                disabled={updating}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: CSS.fg }}>
                  Rollenname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#264555] transition-colors"
                  style={{ borderColor: CSS.border }}
                  disabled={updating}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: CSS.fg }}>
                  Beschreibung
                </label>
                <textarea
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#264555] transition-colors resize-none"
                  style={{ borderColor: CSS.border }}
                  disabled={updating}
                />
              </div>

              {updateError && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                  {updateError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: CSS.border, color: CSS.fg }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={updating || !eName.trim()}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: CSS.primary }}
                >
                  {updating ? "Speichere..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
            {/* ========== Delete Role Modal ========== */}
      {openDelete && deletingRole && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4"
          onClick={closeDeleteModal}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2 text-red-600">
              Rolle löschen?
            </h2>
            <p className="text-sm mb-3" style={{ color: CSS.mutedFg }}>
              Möchtest du die Rolle{" "}
              <b>{deletingRole.name}</b> wirklich löschen?  
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            {deleteError && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: CSS.border, color: CSS.fg }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Lösche..." : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}


    </AdminLayout>
  );
}
