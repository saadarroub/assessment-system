import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, ArrowUpDown, Shield, Plus, Trash2, Pencil, Eye, X } from "lucide-react";
import { SoftSquaresBackground } from "@/shared/components/SoftSquaresBackground";

import {
  getRoles,
  getRolePermissions,
  getAllPermissions,
  createRole,
  grantPermissions,
  updateRole,
  deleteRole,
  revokePermissions,
  type RoleApi,
  type PermissionApi, getPermissionsForRole, type RolePermissionResponseDTO
} from "@/features/service/roleService";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";
import { useToast } from "@/shared/contexts/ToastContext";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import ConfirmModal from "@/shared/components/ConfirmModal";

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
    created: (r as any).createdAt || (r as any).created_at || new Date().toISOString(),
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

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
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

  // Pagination – im Users-Stil
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

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

  // Edit Role Modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // EDIT: Permissions
  const [editAllPermissions, setEditAllPermissions] = useState<PermissionApi[]>([]);
  const [editSelectedPermissions, setEditSelectedPermissions] = useState<string[]>([]);
  const [editPermsLoading, setEditPermsLoading] = useState(false);
  const [editActiveCategory, setEditActiveCategory] = useState<string | null>(null);
  const [editSelectedPermissionsBeforeEdit, setEditSelectedPermissionsBeforeEdit] = useState<string[]>([]);

  // Delete Role
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingRole, setDeletingRole] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // View Permissions Modal
  const [openView, setOpenView] = useState(false);
  const [viewRole, setViewRole] = useState<RoleRow | null>(null);
  const [viewPerms, setViewPerms] = useState<RolePermissionResponseDTO[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const openViewModal = async (role: RoleRow) => {
    setOpenView(true);
    setViewRole(role);
    setViewPerms([]);
    setViewError(null);
    setViewLoading(true);

    try {
      const perms = await getPermissionsForRole(role.id);
      setViewPerms(perms ?? []);
    } catch (e: any) {
      setViewError(e?.message ?? "Fehler beim Laden der Permissions");
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    if (viewLoading) return;
    setOpenView(false);
    setViewRole(null);
    setViewPerms([]);
    setViewError(null);
  };


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

  // Permission-Counts für jede Rolle laden
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

    // Permissions nur einmal laden
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
      const newRole = await createRole({
        name: cName.trim(),
        description: cDesc.trim() || undefined,
      });

      // Permissions zuweisen
      if (selectedPermissions.length > 0) {
        await grantPermissions(newRole.id, selectedPermissions);
      }

      const mapped = mapApiToRole(newRole);
      setItems((prev) => [mapped, ...prev]);
      setPermissionCounts((prev) => ({
        ...prev,
        [newRole.id]: selectedPermissions.length,
      }));

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

  const openEditModal = async (role: RoleRow) => {
    setEditingRole(role);
    setEName(role.name);
    setEDesc(role.description);
    setUpdateError(null);
    setOpenEdit(true);

    setEditPermsLoading(true);
    try {
      const all = await getAllPermissions();
      setEditAllPermissions(all);

      const rolePerms = await getRolePermissions(role.id);
      const ids = rolePerms.map((p) => p.permissionId);
      setEditSelectedPermissions(ids);
      setEditSelectedPermissionsBeforeEdit(ids);

      const cats = all.map((p) =>
        p.name.includes(".") ? p.name.split(".")[0] : "other"
      );
      setEditActiveCategory(cats[0] || null);
    } finally {
      setEditPermsLoading(false);
    }
  };

  const closeEditModal = () => {
    if (updating) return;
    setOpenEdit(false);
    setEditingRole(null);
    setEName("");
    setEDesc("");
    setUpdateError(null);
  };

  const toggleEditPermission = (id: string) => {
    setEditSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const editGroupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionApi[]> = {};
    editAllPermissions.forEach((perm) => {
      const category = perm.name.includes(".")
        ? perm.name.split(".")[0]
        : "other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(perm);
    });
    return Object.entries(groups);
  }, [editAllPermissions]);

  const activeEditCategoryPerms = useMemo(() => {
    if (!editActiveCategory) return [];
    const found = editGroupedPermissions.find(
      ([cat]) => cat === editActiveCategory
    );
    return found ? found[1] : [];
  }, [editGroupedPermissions, editActiveCategory]);

  useEffect(() => {
    if (!editActiveCategory && editGroupedPermissions.length > 0) {
      setEditActiveCategory(editGroupedPermissions[0][0]);
    }
  }, [editGroupedPermissions, editActiveCategory]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      await updateRole(editingRole.id, {
        name: eName.trim(),
        description: eDesc.trim() || undefined,
      });

      const oldPerms = new Set(editSelectedPermissionsBeforeEdit);
      const newPerms = new Set(editSelectedPermissions);

      const toAdd = [...newPerms].filter((x) => !oldPerms.has(x));
      const toRemove = [...oldPerms].filter((x) => !newPerms.has(x));

      if (toAdd.length > 0) {
        await grantPermissions(editingRole.id, toAdd);
      }
      if (toRemove.length > 0) {
        await revokePermissions(editingRole.id, toRemove);
      }

      showSuccess("Rolle erfolgreich aktualisiert!");

      setItems((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? {
              ...r,
              name: eName,
              description: eDesc,
              permissionCount: editSelectedPermissions.length,
            }
            : r
        )
      );

      closeEditModal();
    } catch (err: any) {
      setUpdateError(err?.message ?? "Fehler beim Aktualisieren");
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

      setItems((prev) => prev.filter((r) => r.id !== deletingRole.id));

      setPermissionCounts((prev) => {
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

  /* ============== Create-Modal Permissions ============== */

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionApi[]> = {};
    allPermissions.forEach((perm) => {
      const category = perm.name.includes(".")
        ? perm.name.split(".")[0]
        : "other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(perm);
    });

    const sorted = Object.entries(groups).sort(([a], [b]) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return a.localeCompare(b);
    });

    return sorted;
  }, [allPermissions]);

  useEffect(() => {
    if (!activeCategory && groupedPermissions.length > 0) {
      setActiveCategory(groupedPermissions[0][0]);
    }
  }, [groupedPermissions, activeCategory]);

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

  useEffect(() => {
    setPage(1);
  }, [q, sortKey, asc, items.length, pageSize]);

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
      {/* HEADER  */}

      <div className="relative min-h-screen">
        {/* 2. Unser neues Pattern */}
        <SoftSquaresBackground />
        <PageHeader
          title="Rollen Verwaltung"
          subtitle="Verwalte Benutzerrollen und deren Berechtigungen"
          icon={<Network size={40} />}
          gradient="navy"
          height="280px"
          showPattern={true}
          center={false}
        />

        <main
          className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
          style={{
            background:
              "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
              "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
              "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
          }}
        >

          {/* ===== Top-Bar: Breadcrumb-Pill + Button (wie UsersPage) ===== */}
          <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
            {/* Breadcrumb als Pill */}
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
                  <Shield size={14} />
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
                  Roles
                </span>
              </div>
            </nav>

            {/* Button wie bei Users */}
            <button
              type="button"
              onClick={openCreateModal}
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
              aria-label="Add Role"
            >
              <Plus size={16} />
              Neue Rolle
            </button>

          </div>

          {/* ===== Suche + Count – im Users-Stil ===== */}
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
                  placeholder="Suche Rollen (Name oder Beschreibung)…"
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

              {/* Count-Badge */}
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
                    <span className="font-semibold">
                      {filtered.length}
                    </span>{" "}
                    Rollen
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Card + Tabelle (EXAKT UsersPage-Style) ===== */}
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
                      background: "linear-gradient(to right, #ebebec, #ffffff)",
                      borderBottom: "2px solid #d2c9b9",
                      color: "#264555",
                    }}
                  >
                    <tr>
                      {[
                        { k: "name", label: "Rolle" },
                        { k: "description", label: "Beschreibung" },
                        { k: "permissionCount", label: "Berechtigungen" },
                        { k: "created", label: "Erstellt" },
                        { k: null, label: "Actions" },
                      ].map((col, idx) => (
                        <th
                          key={idx}
                          className={`px-4 py-3 text-[0.85rem] font-semibold ${col.label === "Actions" ? "text-center" : "text-left"
                            }`}
                          style={{ color: CSS.fg }}
                        >
                          {col.k ? (
                            <button
                              type="button"
                              onClick={() => setSort(col.k as SortKey)}
                              className="inline-flex items-center gap-2 hover:brightness-110"
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
                      <tr>
                        <td colSpan={5} className="px-4 py-4 bg-white">
                          Lade Rollen…
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 bg-white text-center text-sm text-slate-500">
                          Keine Rollen vorhanden
                        </td>
                      </tr>
                    ) : (
                      pageData.map((role) => (
                        <tr
                          key={role.id}
                          className="
                  bg-white
                  transition
                  border-l-[4px] border-transparent
                  hover:border-[#E3BB62]
                  hover:bg-[#fff9ec]
                  hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                "
                        >
                          {/* Rolle */}
                          <td
                            className="px-4 py-4"
                            style={{ borderBottom: `1px solid ${CSS.border}` }}
                          >
                            <div className="flex items-center gap-2">
                              <Shield size={16} className="text-gray-400" />
                              <span className="font-semibold" style={{ color: CSS.fg }}>
                                {role.name}
                              </span>
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

                          {/* Berechtigungen */}
                          <td
                            className="px-4 py-4  pl-20 "
                            style={{ borderBottom: `1px solid ${CSS.border}` }}
                          >
                            <span
                              className="inline-flex items-center justify-center rounded-md px-3 py-1 text-[12px] font-semibold"
                              style={{ background: CSS.muted, color: CSS.mutedFg }}
                            >                             
                             {permissionCounts[role.id] ?? 0}
                            </span>
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
                            style={{ borderBottom: `1px solid ${CSS.border}` }}
                          >
                            <div className="inline-flex items-center justify-center gap-2">
                              <button
                                type="button"
                                aria-label="View permissions"
                                title="Permissions anzeigen"
                                onClick={() => void openViewModal(role)}
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
                              </button>

                              <button
                                onClick={() => openEditModal(role)}
                                className="rounded-full border px-2.5 py-1.5 text-[11px] hover:bg-[#f5f0e4]"
                                style={{ borderColor: BRAND.sand }}
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                onClick={() => openDeleteModal(role)}
                                className="rounded-full border px-2.5 py-1.5 text-[11px] hover:bg-[#fff1f1]"
                                style={{ borderColor: "rgba(248,113,113,0.8)", color: "rgb(185,28,28)" }}
                              >
                                <Trash2 size={13} />
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




          {/* ===== Pagination im Users-Stil ===== */}
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
              {/* Range Info */}
              <div className="text-xs sm:text-sm" style={{ color: "#808080" }}>
                Zeige{" "}
                <span className="font-semibold" style={{ color: "#264555" }}>
                  {startIdx}
                </span>
                –
                <span className="font-semibold" style={{ color: "#264555" }}>
                  {endIdx}
                </span>{" "}
                von{" "}
                <span className="font-semibold" style={{ color: "#264555" }}>
                  {total}
                </span>{" "}
                Einträgen
              </div>

              {/* Rows per page + Page X of Y + Pfeile */}
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
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
                      onChange={(e) => setPageSize(Number(e.target.value))}
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

                <div className="flex items-center gap-1">
                  {[
                    { label: "«", onClick: () => setPage(1), disabled: page <= 1 || total === 0 },
                    { label: "‹", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 || total === 0 },
                    { label: "›", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages || total === 0 },
                    { label: "»", onClick: () => setPage(totalPages), disabled: page >= totalPages || total === 0 },
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
      </div>

      {/* ========== Create Role Modal ========== */}
      {openCreate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div
            className="w-full max-w-2xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Karten-Block mit Glow – wie Create User */}
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

              {/* Inhalt / Formular */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  Neue Rolle erstellen
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Felder mit <span className="text-red-500">*</span> sind Pflichtfelder.
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
                  id="create-role-form"
                  onSubmit={handleCreateSubmit}
                  className="space-y-4"
                >
                  {/* Rollenname */}
                  <div>
                    <label
                      htmlFor="role-name"
                      className="block text-sm font-medium mb-1 text-slate-700"
                    >
                      Rollenname <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="role-name"
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      placeholder="z.B. EDITOR"
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
                      disabled={creating}
                      required
                    />
                  </div>

                  {/* Beschreibung */}
                  <div>
                    <label
                      htmlFor="role-desc"
                      className="block text-sm font-medium mb-1 text-slate-700"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="role-desc"
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      placeholder="Optionale Beschreibung"
                      rows={3}
                      className="
                  w-full rounded-xl border px-3 py-2.5 text-sm
                  bg-slate-50
                  border-slate-200
                  outline-none
                  focus:bg-white
                  focus:border-[#E3BB62]
                  focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                  transition
                  resize-none
                "
                      disabled={creating}
                    />
                  </div>

                  {/* Berechtigungen */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Berechtigungen ({selectedPermissions.length} ausgewählt)
                    </label>

                    {permissionsLoading ? (
                      <div className="py-6 text-center text-sm" style={{ color: CSS.mutedFg }}>
                        Lade Berechtigungen...
                      </div>
                    ) : allPermissions.length === 0 ? (
                      <div className="py-4 text-center text-sm" style={{ color: CSS.mutedFg }}>
                        Keine Berechtigungen verfügbar
                      </div>
                    ) : (
                      <div
                        className="border rounded-2xl bg-slate-50/70"
                        style={{ borderColor: CSS.border }}
                      >
                        {/* Kategorie-Tabs */}
                        <div
                          className="flex flex-wrap gap-1 border-b px-3 pt-3 pb-2"
                          style={{ borderColor: CSS.border }}
                        >
                          {groupedPermissions.map(([category, perms]) => {
                            const isActive = activeCategory === category;
                            const selectedInCategory = perms.filter((p) =>
                              selectedPermissions.includes(p.id)
                            ).length;
                            const hasSelected = selectedInCategory > 0;

                            return (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setActiveCategory(category)}
                                disabled={creating}
                                className={`
                                      inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm
                                    rounded-full border
                                         ${isActive
                                    ? "bg-white text-[#264555]"
                                    : "bg-transparent text-slate-500"
                                  }
                                         ${hasSelected
                                    ? "border-[#E3BB62]"
                                    : "border-transparent hover:border-slate-200"
                                  }
                                             `}
                              >
                                <span className="uppercase tracking-wide">
                                  {category}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100">
                                  {selectedInCategory > 0 && <span>{selectedInCategory}/</span>}
                                  <span>{perms.length}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>


                        {/* Aktive Kategorie */}
                        {activeCategory && activeCategoryPerms.length > 0 && (
                          <div className="p-4">
                            {/* Kopfzeile: Info + Alle wählen/abwählen */}
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
                                  const ids = activeCategoryPerms.map((p) => p.id);
                                  const allSelected = ids.every((id) =>
                                    selectedPermissions.includes(id)
                                  );
                                  if (allSelected) {
                                    setSelectedPermissions((prev) =>
                                      prev.filter((id) => !ids.includes(id))
                                    );
                                  } else {
                                    setSelectedPermissions((prev) => [
                                      ...new Set([...prev, ...ids]),
                                    ]);
                                  }
                                }}
                                className="
    text-xs font-semibold px-3 py-1.5 rounded-md
    bg-[#E3BB62] text-[#264555]
    hover:bg-[#d8ac55]
    shadow-sm
    disabled:opacity-60
    transition
  "
                                disabled={creating}
                              >
                                {activeCategoryPerms.every((p) =>
                                  selectedPermissions.includes(p.id)
                                )
                                  ? "Alle abwählen"
                                  : "Alle wählen"}
                              </button>

                            </div>

                            {/* Liste – 2 Spalten, mehr Luft, kein horizontales Scroll */}
                            <div className="max-h-[340px] overflow-y-auto">
                              <div className="grid gap-1 sm:grid-cols-2">
                                {activeCategoryPerms.map((perm) => (
                                  <label
                                    key={perm.id}
                                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissions.includes(perm.id)}
                                      onChange={() => togglePermission(perm.id)}
                                      className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-[#E3BB62]"
                                      style={{ accentColor: BRAND.gold }}
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
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </form>
              </div>
            </div>

            {/* kleiner Abstand wie bei User-Create */}
            <div className="h-3" />

            {/* Footer-Buttons – gleich wie bei Create User */}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={closeCreateModal}
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
                form="create-role-form"
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
                disabled={creating || !cName.trim()}
              >
                {creating ? "Erstellt…" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========== Edit Role Modal (neuer Style + Alle wählen) ========== */}
      {openEdit && editingRole && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0  z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div
            className="w-full max-w-2xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Karten-Block mit Glow*/}
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

              {/* Inhalt / Formular */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  Rolle bearbeiten
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Felder mit <span className="text-red-500">*</span> sind Pflichtfelder.
                </p>

                {updateError && (
                  <div
                    className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                    role="alert"
                  >
                    {updateError}
                  </div>
                )}

                <form
                  id="edit-role-form"
                  onSubmit={handleEditSubmit}
                  className="space-y-4"
                >
                  {/* Rollenname */}
                  <div>
                    <label
                      htmlFor="edit-role-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Rollenname <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-role-name"
                      type="text"
                      value={eName}
                      onChange={(e) => setEName(e.target.value)}
                      className="
                  w-full rounded-xl border px-3 py-2.5 text-sm
                  bg-slate-50 border-slate-200
                  outline-none
                  focus:bg-white
                  focus:border-[#E3BB62]
                  focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                  transition
                "
                      disabled={updating}
                      required
                    />
                  </div>

                  {/* Beschreibung */}
                  <div>
                    <label
                      htmlFor="edit-role-desc"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="edit-role-desc"
                      value={eDesc}
                      onChange={(e) => setEDesc(e.target.value)}
                      rows={3}
                      className="
                  w-full rounded-xl border px-3 py-2.5 text-sm
                  bg-slate-50 border-slate-200
                  outline-none
                  focus:bg-white
                  focus:border-[#E3BB62]
                  focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                  transition
                  resize-none
                "
                      disabled={updating}
                    />
                  </div>

                  {/* ===== Berechtigungen mit "Alle wählen" ===== */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Berechtigungen ({editSelectedPermissions.length} ausgewählt)
                    </label>

                    {editPermsLoading ? (
                      <div className="py-6 text-center text-sm text-slate-500">
                        Lade Berechtigungen…
                      </div>
                    ) : (
                      <div
                        className="border rounded-2xl bg-slate-50/70"
                        style={{ borderColor: CSS.border }}
                      >
                        {/* Kategorie-Tabs – flex-wrap, kein horizontaler Scroll */}
                        {/* Kategorie-Tabs – flex-wrap, kein horizontaler Scroll */}
                        <div
                          className="flex flex-wrap gap-1 border-b px-3 pt-3 pb-2"
                          style={{ borderColor: CSS.border }}
                        >
                          {editGroupedPermissions.map(([cat, perms]) => {
                            const isActive = editActiveCategory === cat;
                            const selectedInCat = perms.filter((p) =>
                              editSelectedPermissions.includes(p.id)
                            ).length;
                            const hasSelected = selectedInCat > 0;

                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setEditActiveCategory(cat)}
                                className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm
          rounded-full border
          ${isActive
                                    ? "bg-white text-[#264555]"
                                    : "bg-transparent text-slate-500"
                                  }
          ${hasSelected
                                    ? "border-[#E3BB62]"
                                    : "border-transparent hover:border-slate-200"
                                  }
        `}
                                disabled={updating}
                              >
                                <span className="uppercase tracking-wide">{cat}</span>
                                <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100">
                                  {selectedInCat > 0 && <span>{selectedInCat}/</span>}
                                  <span>{perms.length}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>


                        {/* Aktive Kategorie */}
                        <div className="p-4">
                          {activeEditCategoryPerms.length === 0 ? (
                            <div className="text-sm text-slate-500">
                              Keine Berechtigungen in dieser Kategorie.
                            </div>
                          ) : (
                            <>
                              {/* Kopf mit Zähler + Alle wählen/abwählen */}
                              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                                <span className="text-sm text-slate-700">
                                  {
                                    activeEditCategoryPerms.filter((p) =>
                                      editSelectedPermissions.includes(p.id)
                                    ).length
                                  }{" "}
                                  von {activeEditCategoryPerms.length} ausgewählt
                                </span>

                                <button
                                  type="button"
                                  disabled={updating}
                                  onClick={() => {
                                    const ids = activeEditCategoryPerms.map((p) => p.id);
                                    const allSelected = ids.every((id) =>
                                      editSelectedPermissions.includes(id)
                                    );
                                    if (allSelected) {
                                      setEditSelectedPermissions((prev) =>
                                        prev.filter((id) => !ids.includes(id))
                                      );
                                    } else {
                                      setEditSelectedPermissions((prev) => [
                                        ...new Set([...prev, ...ids]),
                                      ]);
                                    }
                                  }}
                                  className="
    text-xs font-semibold px-3 py-1.5 rounded-md
    bg-[#E3BB62] text-[#264555]
    hover:bg-[#d8ac55]
    shadow-sm
    disabled:opacity-60
  "
                                >
                                  {activeEditCategoryPerms.every((p) =>
                                    editSelectedPermissions.includes(p.id)
                                  )
                                    ? "Alle abwählen"
                                    : "Alle wählen"}
                                </button>

                              </div>

                              {/* Liste – 2 Spalten */}
                              <div className="max-h-[340px] overflow-y-auto">
                                <div className="grid gap-1 sm:grid-cols-2">
                                  {activeEditCategoryPerms.map((perm) => (
                                    <label
                                      key={perm.id}
                                      className="
                      flex items-start gap-3 p-2.5 rounded-lg
                      hover:bg-white cursor-pointer
                    "
                                    >
                                      <input
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 focus:ring-[#E3BB62]"
                                        style={{ accentColor: BRAND.gold }}
                                        checked={editSelectedPermissions.includes(perm.id)}
                                        onChange={() => toggleEditPermission(perm.id)}
                                        disabled={updating}
                                      />

                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800">
                                          {perm.name}
                                        </div>
                                        {perm.description && (
                                          <div className="text-xs text-slate-500 mt-0.5">
                                            {perm.description}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </form>
              </div>
            </div>

            {/* kleiner Abstand wie bei User-Modals */}
            <div className="h-3" />

            {/* Footer-Buttons – gleich wie Users (Abbrechen / Speichern) */}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={closeEditModal}
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
                form="edit-role-form"
                disabled={updating || !eName.trim()}
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
              >
                {updating ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Delete Role – mit ConfirmModal im gleichen Style wie bei User ========= */}
      <ConfirmModal
        open={openDelete && !!deletingRole}
        title="Rolle löschen?"
        description={
          <>
            Möchtest du die Rolle{" "}
            <span className="font-semibold">{deletingRole?.name}</span> wirklich
            löschen?
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
        onCancel={closeDeleteModal}
        onConfirm={() => {
          if (!deleting) {
            void handleDeleteConfirm();
          }
        }}
        icon={<Trash2 className="text-red-500" />}
      />
      {openView && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeViewModal();
          }}
        >
          <div className="w-full max-w-2xl px-4 sm:px-0" onClick={(e) => e.stopPropagation()}>
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* Glows */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60" />

              <div className="relative px-6 pt-6 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                      Permissions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rolle: <span className="font-semibold text-slate-700">{viewRole?.name}</span>
                    </p>
                  </div>
                </div>

                {viewError && (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {viewError}
                  </div>
                )}

                <div className="mt-4 rounded-2xl border overflow-hidden" style={{ borderColor: BRAND.sand }}>
                  <div
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em]"
                    style={{
                      background: "linear-gradient(to right, #ebebec, #ffffff)",
                      borderBottom: "1px solid #d2c9b9",
                      color: "#264555",
                    }}
                  >
                    Zugewiesene Berechtigungen
                  </div>

                  <div className="max-h-[420px] overflow-auto bg-white">
                    {viewLoading ? (
                      <div className="px-4 py-4 text-sm text-slate-600">Lade Permissions…</div>
                    ) : viewPerms.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-slate-600">
                        Diese Rolle hat aktuell keine Permissions.
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {viewPerms.map((p) => (
                          <li key={p.permissionId} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold" style={{ color: BRAND.navy }}>
                                  {p.permissionName}
                                </div>
                                {p.permissionDescription && (
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {p.permissionDescription}
                                  </div>
                                )}
                              </div>

                              <span
                                className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  background: "rgba(38,69,85,0.06)",
                                  color: BRAND.navy,
                                  border: `1px solid ${BRAND.sand}`,
                                }}
                              >
                                {p.grantedAt && (
                                  <div className="">
                                    Zugewiesen am{" "}
                                    {new Date(p.grantedAt).toLocaleDateString("de-DE")}
                                  </div>
                                )}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

            </div>
            <div className="h-3" />

            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={closeViewModal}
                disabled={viewLoading}
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
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
