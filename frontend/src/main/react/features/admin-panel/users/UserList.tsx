// src/features/admin-panel/users/UsersPage.tsx — Tailwind-only (100% Style-Match)
// Neu: Edit-Icon + Edit-Modal (Name, Email, Password optional) mit updateUser()
// Sonst unverändert.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, ArrowUpDown, Eye, Plus, Trash2, Pencil } from "lucide-react";
import {
  getUsers,
  getUserRoles,
  createUser,
  deleteUser,
  type UserApi,
  // NEW
  updateUser,
} from "@/features/service/userService";

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
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Create User Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  // 1) Users
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getUsers();
        const mapped = (raw ?? []).map(mapApiToUser);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2) Roles per user
  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setRolesLoading(true);
    (async () => {
      try {
        const pairs = await Promise.all(
          items.map(async (u) => {
            try {
              const roles = await getUserRoles(u.id);
              return [u.id, roles] as const;
            } catch {
              return [u.id, [] as string[]] as const;
            }
          })
        );
        if (!alive) return;
        const rolesById = Object.fromEntries(pairs) as Record<string, string[]>;
        setItems((prev) => prev.map((u) => ({ ...u, roles: rolesById[u.id] ?? [] })));
      } finally {
        if (alive) setRolesLoading(false);
      }
    })();
    return () => { alive = false; };
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
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createUser({
        name: uName.trim(),
        email: uEmail.trim(),
        password: uPassword,
      });
      const row = mapApiToUser(created);
      setItems((prev) => [row, ...prev]);
      setUName("");
      setUEmail("");
      setUPassword("");
      setOpenCreate(false);
    } catch (err: any) {
      setCreateError(err?.message ?? String(err));
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
    } catch (err: any) {
      setDeleteError(err?.message ?? String(err));
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
  } catch (err: any) {
    setUpdateError(err?.message ?? String(err));
  } finally {
    setUpdating(false);
  }
}

  return (
    <AdminPanelHeader>
      {/* ===== Hero ===== */}
      <header className="w-full border-b bg-white/90 [backdrop-filter:saturate(1.4)_blur(6px)]" style={{ borderColor: CSS.adminBg }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-[84px] grid place-items-center text-center select-none">
            <div>
              <h1 className="m-0 text-[36px] font-extrabold leading-none tracking-[-0.01em] text-[color:var(--foreground,#264555)]">Users</h1>
              <p className="m-0 mt-2 text-[15px] font-semibold text-[color:var(--muted-foreground,#6b7280)]">Manage user accounts, roles, and permissions.</p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Außenbereich unter dem Hero ===== */}
      <main className="px-6 py-6" style={{ background: CSS.adminBg }}>
        {/* Breadcrumb */}
        <nav className="max-w-[1200px] mx-auto mb-4 flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
          <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>Admin Panel</Link>
          <span className="opacity-60">›</span>
          <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Users</span>
        </nav>

        {/* Seitenkopf */}
        <header className="max-w-[1200px] mx-auto mb-[18px]">
          <h2 className="m-0 mb-1 text-[2rem] font-bold" style={{ color: CSS.fg }}>Users</h2>
          <p className="m-0 max-w-[720px] leading-[1.6]" style={{ color: CSS.mutedFg }}>Manage user accounts, roles, and permissions.</p>
        </header>

        {/* Add User */}
        <div className="max-w-[1200px] mx-auto mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[rgba(38,69,85,.35)] bg-[#264555]"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* ===== Card (um die Tabelle) ===== */}
        <section className="max-w-[1200px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]" style={{ background: CSS.card, borderColor: CSS.border }}>
          {/* Controls */}
          <div className="flex flex-col gap-4 p-6 border-b" style={{ borderColor: CSS.border }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Suche */}
              <div className="relative max-w-[24rem] flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }} aria-hidden>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search users"
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

              {/* Right info */}
              <div className="text-sm" style={{ color: CSS.mutedFg }}>
                {loading ? "Loading…" : error ? "Error" : `Showing ${filtered.length} of ${items.length} users`}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-[hsl(var(--card))]">
              <thead>
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
                      className="text-left text-[0.875rem] font-semibold px-4 py-4 border-b"
                      style={{ background: "hsl(var(--muted))", color: CSS.mutedFg, borderColor: CSS.border }}
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
                  <tr>
                    <td colSpan={6} className="px-4 py-4">Lade Users…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4">Keine Einträge gefunden.</td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[hsl(var(--muted)/.5)]">
                      <td className="px-4 py-4 font-semibold" style={{ borderBottom: `1px solid ${CSS.border}` }}>{u.name}</td>
                      <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>{u.email}</td>
                      <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                        <div className="flex flex-wrap gap-2">
                          {rolesLoading && u.roles.length === 0 ? (
                            <span className="text-[0.875rem]" style={{ color: CSS.mutedFg }}>…</span>
                          ) : u.roles.length ? (
                            u.roles.map((r) => (
                              <span key={r} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#e5ebf0] text-[#264555]">{r}</span>
                            ))
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
                      <td className="px-4 py-4 text-right whitespace-nowrap" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                        <div className="inline-flex items-center gap-2">
                          {/* View (wie bisher) */}
                          <Link
                            to={`/admin/adminPanel/users/${u.id}`}
                            title="View"
                           className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-110 bg-[#264555]"
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

          {/* Pagination */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2">
              <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">Prev</button>
              <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">Next</button>
            </div>
          </div>
        </section>
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
    </AdminPanelHeader>
  );
}
