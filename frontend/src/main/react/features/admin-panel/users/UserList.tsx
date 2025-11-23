

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import myLogo from "@/assets/Zero-6-icons-05.webp";
import { Search, ArrowUpDown, Eye, Plus, Trash2, Pencil } from "lucide-react";
import {
  getUsers,
  getUserRoles,
  createUser,
  deleteUser,
  type UserApi,
  updateUser,
} from "@/features/service/userService";
import { getRoles, type RoleApi } from "@/features/service/roleService";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";
import { useToast } from "@/shared/contexts/ToastContext";

// ---- Types ----
export type UserRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "invited" | "disabled";
  lastLogin: string | null;
};

type SortKey = "name" | "email" | "status" | "lastLogin";

function mapApiToUser(u: UserApi): UserRow {
  return {
    id: String(u.id),
    name: String(u.name ?? "Unbenannter User"),
    email: String(u.email ?? ""),
    roles: [],
    status: "active",
    lastLogin: null,
  };
}

// HSL-Token-Fallbacks (wie in deiner CSS)
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

export default function UsersPage() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Create User Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Available roles
  const [availableRoles, setAvailableRoles] = useState<RoleApi[]>([]);
  const [rolesLoadError, setRolesLoadError] = useState<string | null>(null);

  // Delete Modal
  const [openDelete, setOpenDelete] = useState(false);
  const [targetUser, setTargetUser] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // NEW: Edit Modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Users
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getUsers();
        const mapped = (raw ?? []).map(mapApiToUser);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e); // Error-Objekt direkt setzen, nicht nur message
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Load available roles
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const roles = await getRoles();
        if (alive) setAvailableRoles(roles);
      } catch (e: any) {
        if (alive) setRolesLoadError(e?.message ?? "Fehler beim Laden der Rollen");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  // Roles per user – speichere nur roleIds im State
  useEffect(() => {
    if (!items.length) return;

    let alive = true;
    setRolesLoading(true);

    (async () => {
      try {
        const pairs = await Promise.all(
          items.map(async (u) => {
            try {
              const roleIds = await getUserRoles(u.id); // string[]: roleIds
              return [u.id, roleIds] as const;
            } catch {
              return [u.id, [] as string[]] as const;
            }
          })
        );

        if (!alive) return;

        const rolesById = Object.fromEntries(pairs) as Record<string, string[]>;

        setItems((prev) =>
          prev.map((u) => ({
            ...u,
            roles: rolesById[u.id] ?? [],
          }))
        );
      } finally {
        if (alive) setRolesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [items.length]);


  // Filter + Sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? items.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (u: UserRow): string | number => {
        if (sortKey === "lastLogin") return u.lastLogin ? new Date(u.lastLogin).getTime() : -Infinity;
        if (sortKey === "status") return u.status;
        if (sortKey === "email") return u.email.toLowerCase();
        return u.name.toLowerCase();
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  // Create user
  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim() || !uPassword.trim()) {
      setCreateError("Bitte Name, Email und Passwort ausfüllen.");
      return;
    }
    if (!selectedRoleId) {
      setCreateError("Bitte eine Rolle auswählen.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {

      const created = await createUser({
        name: uName.trim(),
        email: uEmail.trim(),
        password: uPassword,
        roleId: selectedRoleId,
      });

      const row = mapApiToUser(created);
      setItems((prev) => [row, ...prev]);
      setUName("");
      setUEmail("");
      setUPassword("");
      setSelectedRoleId("");
      setOpenCreate(false);
      showSuccess(`Benutzer "${created.name}" erfolgreich erstellt!`);
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      setCreateError(errorMsg);
      // 403 wird global vom PermissionToastListener gefangen
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Erstellen: ${errorMsg}`);
      }
    } finally {
      setCreating(false);
    }
  }

  // Delete flow
  const askDelete = (u: UserRow) => {
    setTargetUser(u);
    setDeleteError(null);
    setOpenDelete(true);
  };
  const cancelDelete = () => {
    if (deleting) return;
    setOpenDelete(false);
    setTargetUser(null);
    setDeleteError(null);
  };
  const confirmDelete = async () => {
    if (!targetUser) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(targetUser.id);
      setItems((prev) => prev.filter((x) => x.id !== targetUser.id));
      setOpenDelete(false);
      setTargetUser(null);
      showSuccess(`Benutzer "${targetUser.name}" erfolgreich gelöscht.`);
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      setDeleteError(errorMsg);
      // 403 wird global vom PermissionToastListener gefangen
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Löschen: ${errorMsg}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  // === NEW: Edit flow ===
  const openEditFor = (u: UserRow) => {
    setEditUser(u);
    setEName(u.name);
    setEEmail(u.email);
    setEPassword("");
    setUpdateError(null);
    setOpenEdit(true);
  };

  const cancelEdit = () => {
    if (updating) return;
    setOpenEdit(false);
    setEditUser(null);
    setEName("");
    setEEmail("");
    setEPassword("");
    setUpdateError(null);
  };

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;

    // Für PUT immer volle Felder nehmen (Eingabe oder bestehende Werte)
    const full: { name: string; email: string; password?: string } = {
      name: eName.trim() || editUser.name,
      email: eEmail.trim() || editUser.email,
      ...(ePassword.trim() ? { password: ePassword.trim() } : {}),
    };

    try {
      setUpdating(true);
      setUpdateError(null);

      const updated = await updateUser(editUser.id, full);

      // Tabelle lokal aktualisieren
      setItems(prev =>
        prev.map(row =>
          row.id === editUser.id
            ? { ...row, name: updated.name ?? full.name, email: updated.email ?? full.email }
            : row
        )
      );

      cancelEdit();
      showSuccess(`Benutzer "${full.name}" erfolgreich aktualisiert!`);
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      setUpdateError(errorMsg);
      // 403 wird global vom PermissionToastListener gefangen
      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Aktualisieren: ${errorMsg}`);
      }
    } finally {
      setUpdating(false);
    }
  }
  // === Pagination (wie in Zuweisungen) ===
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => { setPage(1); }, [q, sortKey, asc, items]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);


  return (
    <AdminLayout>
      {/* ===== Hero ===== */}
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
                    Benutzer Administration
                  </h1>
                  <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
                    Benutzerkonten von CapConsulting , Rollen und Berechtigungen verwalten
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      {/* ===== Außenbereich unter dem Hero ===== */}
      <main className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6" style={{ background: CSS.adminBg }}>
        {/* ===== Top-Bar: Breadcrumb + Add-Button (eine Zeile) ===== */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          {/* Breadcrumb links */}
          <nav className="flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
            <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
              Admin Panel
            </Link>
            <span className="opacity-60">›</span>
            <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Users</span>
          </nav>

          {/* Add User rechts – GELB wie in Zuweisungen */}
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow hover:[filter:brightness(1.05)] focus:outline-none"
            style={{
              background: "hsl(40,60%,63%)",      // Gelb
              color: "hsl(200,32%,22%)",          // dunkles Blau-Grau
              boxShadow: "0 1px 2px rgba(0,0,0,.05)"
            }}
            aria-label="Add User"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* Suche + Count */}
        <div
          className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[12px] border bg-white/85 [backdrop-filter:saturate(1.2)_blur(4px)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          style={{ borderColor: CSS.border }}
        >
          <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Suche Benutzer (Name oder E-Mail)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full h-10 md:h-11 rounded-md border pl-10 pr-3 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: CSS.border, background: CSS.card, color: CSS.fg, boxShadow: '0 0 #0000' }}
              />
            </div>

            {/* Zähler rechts */}
            <div
              className="inline-block text-sm font-medium px-3 md:px-4 py-2 rounded-lg border"
              style={{ background: CSS.card, color: CSS.mutedFg, borderColor: CSS.border }}
            >
              Zeige <span className="font-semibold" style={{ color: CSS.fg }}>{filtered.length}</span> Benutzer
            </div>
          </div>
        </div>


        {/* ===== Card (um die Tabelle) ===== */}
        <WithPermissionCheck error={error} loading={loading} minHeight="400px">
          <section className="max-w-[1400px] xl:max-w-[1600px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]" style={{ background: CSS.card, borderColor: CSS.border }}>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-[hsl(var(--card))]">
                <thead
                  className="bg-[hsla(200,32%,22%,0.05)]"
                  style={{ borderBottom: "2px solid hsla(200,32%,22%,0.1)" }}
                >
                  <tr>
                    {[
                      { k: "name", label: "Name" },
                      { k: "email", label: "Email" },
                      { k: null, label: "Roles" },
                      { k: "status", label: "Status" },
                      { k: "lastLogin", label: "Last Login" },
                      { k: null, label: "Actions" },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-[0.85rem] font-semibold ${col.label === "Actions" ? "text-center" : "text-left"}`}
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
                      <td colSpan={6} className="px-4 py-4">Lade Users…</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4">Keine Einträge gefunden.</td>
                    </tr>
                  ) : (
                    pageData.map((u) => (
                      <tr key={u.id} className="transition border-l-[4px] border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]">
                        <td className="px-4 py-4 font-semibold" style={{ borderBottom: `1px solid ${CSS.border}` }}>{u.name}</td>
                        <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>{u.email}</td>
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="flex flex-wrap gap-2">
                            {rolesLoading && u.roles.length === 0 ? (
                              <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>…</span>
                            ) : u.roles.length ? (
                             u.roles.map((roleId) => {
    const role = availableRoles.find((r) => r.id === roleId);
    const label = role ? role.name : roleId; // Fallback: ID

    return (
      <span
        key={roleId}
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#e5ebf0] text-[#264555]"
      >
        {label}
      </span>
    );
  })
                            ) : (
                              <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span
                            className={
                              u.status === "active"
                                ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                                : u.status === "invited"
                                  ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,243,199)] text-[rgb(146,64,14)]"
                                  : "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                            }
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("de-DE") : "Never"}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* View (wie bisher) */}
                            <Link
                              to={`/admin/adminPanel/users/${u.id}`}
                              title="View"
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-110 bg-[#264555]"
                              style={{
                                background: "hsl(40,60%,63%)",           // Gelb wie in Zuweisungen
                                color: "hsl(200,32%,22%)"                 // dunkles Blau-Grau für Text/Icon
                              }}
                            >
                              <Eye size={14} />
                              <span className="hidden sm:inline">View</span>
                            </Link>

                            {/* NEW: Edit Icon-Button (öffnet Edit-Modal) */}
                            <button
                              type="button"
                              aria-label="Edit user"
                              onClick={() => openEditFor(u)}
                              title="Edit"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border hover:bg-slate-50"
                              style={{ borderColor: CSS.border, color: CSS.fg }}
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Delete (wie bisher) */}
                            <button
                              type="button"
                              aria-label="Delete user"
                              onClick={() => askDelete(u)}
                              title="Löschen"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border text-red-600 hover:bg-red-50"
                              style={{ borderColor: "rgb(254 202 202)" }}
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

        {/* === Pagination (abgesetzt, wie Zuweisungen) === */}
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

      {/* ===== Create User Modal ===== */}
      {openCreate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenCreate(false); }}
        >
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-3">Create User</h3>
            {createError && (<div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{createError}</div>)}
            <form onSubmit={onCreateUser} className="space-y-3">
              <div>
                <label htmlFor="u-name" className="block text-sm font-medium mb-1">Name *</label>
                <input
                  id="u-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="z. B. Max Mustermann"
                  required
                />
              </div>
              <div>
                <label htmlFor="u-email" className="block text-sm font-medium mb-1">Email *</label>
                <input
                  id="u-email"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="u-pass" className="block text-sm font-medium mb-1">Password *</label>
                <input
                  id="u-pass"
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder="●●●●●●●●"
                  required
                />
              </div>
              <div>
                <label htmlFor="u-role" className="block text-sm font-medium mb-1">Rolle *</label>
                <select
                  id="u-role"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  disabled={creating}
                  required
                >
                  <option value="">-- Bitte wählen --</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {rolesLoadError && (
                  <p className="text-xs text-red-600 mt-1">{rolesLoadError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpenCreate(false)} className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={creating}>
                  Abbrechen
                </button>
                <button type="submit" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60" disabled={creating}>
                  {creating ? "Erstelle…" : "Erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {openDelete && targetUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}
        >
          <div className="w-[min(460px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1 text-red-600">User löschen?</h3>
            <p className="text-sm text-slate-600 mb-3">
              Willst du den Benutzer <b>{targetUser.name}</b> ({targetUser.email}) wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {deleteError && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{deleteError}</div>}
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
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                disabled={deleting}
              >
                {deleting ? "Lösche…" : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEW: Edit User Modal ===== */}
      {openEdit && editUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-3">Edit User</h3>

            {updateError && (
              <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800" role="alert">
                {updateError}
              </div>
            )}

            <form onSubmit={onEditSubmit} className="space-y-3">
              <div>
                <label htmlFor="e-name" className="block text-sm font-medium mb-1">Name</label>
                <input
                  id="e-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                  placeholder="Name ändern (optional)"
                />
              </div>
              <div>
                <label htmlFor="e-email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  id="e-email"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={eEmail}
                  onChange={(e) => setEEmail(e.target.value)}
                  placeholder="Email ändern (optional)"
                />
              </div>
              <div>
                <label htmlFor="e-pass" className="block text-sm font-medium mb-1">New Password (optional)</label>
                <input
                  id="e-pass"
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={ePassword}
                  onChange={(e) => setEPassword(e.target.value)}
                  placeholder="Leer lassen, um Passwort zu behalten"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={updating}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                  disabled={updating}
                >
                  {updating ? "Speichere…" : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
