import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import myLogo from "@/assets/Zero-6-icons-05.webp";
import { Search, ArrowUpDown, Shield, Plus, Trash2, Pencil } from "lucide-react";
import { getRoles, getRolePermissions, getAllPermissions, createRole, grantPermissions, type RoleApi, type PermissionApi } from "@/features/service/roleService";
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

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

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

  /* ============== Data Load ============== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getRoles();
        const mapped = (raw ?? []).map(mapApiToRole);
        if (alive) setItems(mapped);
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
      // 1. Create role
      const newRole = await createRole({
        name: cName.trim(),
        description: cDesc.trim() || undefined,
      });

      // 2. Grant selected permissions
      if (selectedPermissions.length > 0) {
        await grantPermissions(newRole.id, selectedPermissions);
      }

      // 3. Update UI
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

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Group permissions by category (prefix before first dot)
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionApi[]> = {};
    
    allPermissions.forEach((perm) => {
      const category = perm.name.includes('.') 
        ? perm.name.split('.')[0] 
        : 'other';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });
    
    // Sort categories alphabetically, but put 'other' last
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      return a.localeCompare(b);
    });
    
    // Set first category as active if not set
    if (!activeCategory && sorted.length > 0) {
      setActiveCategory(sorted[0][0]);
    }
    
    return sorted;
  }, [allPermissions, activeCategory]);
  
  // Get permissions for active category
  const activeCategoryPerms = useMemo(() => {
    if (!activeCategory) return [];
    const found = groupedPermissions.find(([cat]) => cat === activeCategory);
    return found ? found[1] : [];
  }, [groupedPermissions, activeCategory]);

  /* ============== Filtering & Sorting ============== */
  const filtered = items.filter((r) => {
    const lq = q.toLowerCase();
    return (
      r.name.toLowerCase().includes(lq) ||
      r.description.toLowerCase().includes(lq)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA: any = a[sortKey];
    let valB: any = b[sortKey];
    if (sortKey === "created") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return asc ? -1 : 1;
    if (valA > valB) return asc ? 1 : -1;
    return 0;
  });

  const total = sorted.length;
  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);
  const paginated = sorted.slice(startIdx - 1, endIdx);
  const totalPages = Math.ceil(total / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setAsc(!asc);
    } else {
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
      {/* ===== Hero ===== */}
      <header className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4">
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />
        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />
          <div className="justify-self-center">
            <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05] [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
              <div className="flex items-center justify-center gap-4">
                <img
                  src={myLogo}
                  alt="Logo"
                  className="w-[clamp(60px,10vw,100px)] h-auto drop-shadow-md"
                />
                <h1>Rollen Verwaltung</h1>
              </div>
              <p>Rollen erstellen, bearbeiten und Berechtigungen zuweisen</p>
            </div>
          </div>
          <div className="justify-self-end lg:justify-self-center" />
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div
        className="min-h-[calc(100vh-180px)] px-8 py-6"
        style={{ background: CSS.adminBg }}
      >
        <WithPermissionCheck error={error} loading={loading}>
          {/* Search + Actions */}
          <section
            className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[12px] border bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            style={{ borderColor: CSS.border }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rollen durchsuchen..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:border-[#264555] transition-colors"
                  style={{ borderColor: CSS.border }}
                />
              </div>

              {/* Create Button */}
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
                style={{ background: CSS.primary }}
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Neue Rolle
              </button>
            </div>
          </section>

          {/* Table */}
          <section
            className="max-w-[1400px] xl:max-w-[1600px] mx-auto rounded-[12px] border bg-white/85 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
            style={{ borderColor: CSS.border }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: CSS.muted }}>
                  <tr className="text-left text-sm font-medium" style={{ color: CSS.fg }}>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        Rolle
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("description")}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        Beschreibung
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSort("permissionCount")}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity mx-auto"
                      >
                        Berechtigungen
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("created")}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        Erstellt
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: CSS.mutedFg }}>
                        Lädt Rollen...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: CSS.mutedFg }}>
                        {q ? "Keine Rollen gefunden" : "Noch keine Rollen vorhanden"}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((role) => (
                      <tr
                        key={role.id}
                        className="border-t hover:bg-gray-50/50 transition-colors"
                        style={{ borderColor: CSS.border }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-gray-400" />
                            <span className="font-medium" style={{ color: CSS.fg }}>
                              {role.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: CSS.mutedFg }}>
                          {role.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {permissionCounts[role.id] ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: CSS.mutedFg }}>
                          {formatDate(role.created)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg p-2 hover:bg-blue-50 transition-colors text-blue-600"
                              title="Bearbeiten"
                              onClick={() => showSuccess("Edit-Modal kommt später!")}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-2 hover:bg-red-50 transition-colors text-red-600"
                              title="Löschen"
                              onClick={() => showSuccess("Delete-Modal kommt später!")}
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

          {/* Pagination */}
          <div
            className="max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4 rounded-[12px] border bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            style={{ borderColor: CSS.border }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: CSS.mutedFg }}>
                Zeige {total === 0 ? 0 : startIdx}-{endIdx} von {total} Einträgen
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  style={{ borderColor: CSS.border, color: CSS.fg }}
                >
                  Zurück
                </button>
                <span className="text-sm" style={{ color: CSS.mutedFg }}>
                  Seite {page} von {totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  style={{ borderColor: CSS.border, color: CSS.fg }}
                >
                  Weiter
                </button>
              </div>
            </div>
          </div>
        </WithPermissionCheck>
      </div>

      {/* ========== Create Role Modal ========== */}
      {openCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeCreateModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-xl font-semibold" style={{ color: CSS.fg }}>
                Neue Rolle erstellen
              </h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                disabled={creating}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: CSS.fg }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: CSS.fg }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: CSS.fg }}>
                  Berechtigungen ({selectedPermissions.length} ausgewählt)
                </label>
                
                {permissionsLoading ? (
                  <div className="text-center py-8 text-sm" style={{ color: CSS.mutedFg }}>
                    Lade Berechtigungen...
                  </div>
                ) : allPermissions.length === 0 ? (
                  <div className="text-center py-4 text-sm" style={{ color: CSS.mutedFg }}>
                    Keine Berechtigungen verfügbar
                  </div>
                ) : (
                  <div className="rounded-lg border" style={{ borderColor: CSS.border }}>
                    {/* Category Tabs Navigation */}
                    <div className="flex overflow-x-auto border-b" style={{ borderColor: CSS.border }}>
                      {groupedPermissions.map(([category, perms]) => {
                        const categoryPermIds = perms.map(p => p.id);
                        const selectedInCategory = categoryPermIds.filter(id => selectedPermissions.includes(id)).length;
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
                              borderBottomColor: isActive ? CSS.primary : 'transparent',
                              background: isActive ? CSS.mutedBg : 'transparent',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="uppercase tracking-wide">{category}</span>
                              <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: isActive ? CSS.primary : CSS.border, color: isActive ? 'white' : CSS.mutedFg }}>
                                {selectedInCategory > 0 && <span>{selectedInCategory}/</span>}
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
                        <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: CSS.border }}>
                          <span className="text-sm font-medium" style={{ color: CSS.fg }}>
                            {activeCategoryPerms.filter(p => selectedPermissions.includes(p.id)).length} von {activeCategoryPerms.length} ausgewählt
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const categoryPermIds = activeCategoryPerms.map(p => p.id);
                              const allSelected = categoryPermIds.every(id => selectedPermissions.includes(id));
                              if (allSelected) {
                                setSelectedPermissions(prev => prev.filter(id => !categoryPermIds.includes(id)));
                              } else {
                                setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermIds])]);
                              }
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition-all"
                            style={{ background: CSS.primary, color: 'white' }}
                            disabled={creating}
                          >
                            {activeCategoryPerms.every(p => selectedPermissions.includes(p.id)) ? 'Alle abwählen' : 'Alle wählen'}
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
                                <div className="text-sm font-medium" style={{ color: CSS.fg }}>
                                  {perm.name}
                                </div>
                                {perm.description && (
                                  <div className="text-xs mt-0.5" style={{ color: CSS.mutedFg }}>
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
    </AdminLayout>
  );
}
