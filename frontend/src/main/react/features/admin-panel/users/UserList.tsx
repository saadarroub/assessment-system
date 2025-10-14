// src/features/admin-panel/users/UsersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { Search, ArrowUpDown, Eye, Plus } from "lucide-react";
import "@/styles/adminPanel.css";
import "@/styles/adminUsers.css";
import {
  getUsers,
  getUserRoles,
  createUser,
  type UserApi,
} from "@/features/service/userService";

type UserRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];  // aus /users/{id}/roles
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

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // --- Create User Modal state ---
  const [openCreate, setOpenCreate] = useState(false);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 1) Users laden
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

  // 2) Rollen je User nachladen (parallel)
  useEffect(() => {
    if (!items.length) return;
    let alive = true;
    setRolesLoading(true);
    (async () => {
      try {
        const pairs = await Promise.all(
          items.map(async u => {
            try {
              const roles = await getUserRoles(u.id); // -> string[]
              return [u.id, roles] as const;
            } catch {
              return [u.id, [] as string[]] as const;
            }
          })
        );
        if (!alive) return;
        const rolesById = Object.fromEntries(pairs) as Record<string, string[]>;
        setItems(prev => prev.map(u => ({ ...u, roles: rolesById[u.id] ?? [] })));
      } finally {
        if (alive) setRolesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [items.length]);

  // Suche + Sortierung
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? items.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (u: UserRow): string | number => {
        if (sortKey === "lastLogin") return u.lastLogin ? new Date(u.lastLogin).getTime() : -Infinity;
        if (sortKey === "status")    return u.status;
        if (sortKey === "email")     return u.email.toLowerCase();
        return u.name.toLowerCase();
      };
      const av = val(a), bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return base;
  }, [items, q, sortKey, asc]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc(v => !v);
    else { setSortKey(key); setAsc(true); }
  };

  // --- Create user submit ---
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
        password: uPassword, // nicht trimmen → Passwort kann Leerzeichen enthalten
      });
      // Neu in die Tabelle (oben) einfügen
      const row = mapApiToUser(created);
      setItems(prev => [row, ...prev]);
      // Formular reset + Modal schließen
      setUName(""); setUEmail(""); setUPassword(""); setOpenCreate(false);
    } catch (err: any) {
      setCreateError(err?.message ?? String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <AdminPanelHeader>
      <header className="main-header">
        <div className="header-content">
          <div className="header-left" />
          <div className="header-center">
            <div className="header-text">
              <h1>Users</h1>
              <p>Manage user accounts, roles, and permissions.</p>
            </div>
          </div>
          <div className="header-right" />
        </div>
      </header>

      <main className="admin-main">
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Users</span>
        </nav>

        <header className="page-header">
          <h2 className="page-title">Users</h2>
          <p className="page-description">Manage user accounts, roles, and permissions.</p>
        </header>

        {/* Add User Button (öffnet Modal) */}
        <div className="max-w-[1200px] mx-auto mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        <section className="admin-card">
          <div className="table-controls">
            <div className="controls-row">
              <div className="search-input">
                <span className="search-icon" aria-hidden><Search size={16} /></span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search users"
                />
              </div>
              <div className="pagination-info">
                {loading ? "Loading…" : error ? "Error" : `Showing ${filtered.length} of ${items.length} users`}
              </div>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert" style={{ margin: "0.75rem 0" }}>
              Fehler: {error}
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <button className="sort-button" onClick={() => setSort("name")} type="button">
                      <span>Name</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("email")} type="button">
                      <span>Email</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Roles</th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("status")} type="button">
                      <span>Status</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>
                    <button className="sort-button" onClick={() => setSort("lastLogin")} type="button">
                      <span>Last Login</span><ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "1rem" }}>Lade Users…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "1rem" }}>Keine Einträge gefunden.</td></tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td className="cell-muted">{u.email}</td>
                      <td>
                        <div className="role-badges">
                          {rolesLoading && u.roles.length === 0
                            ? <span className="cell-muted">…</span>
                            : (u.roles.length
                                ? u.roles.map(r => <span key={r} className="role-badge">{r}</span>)
                                : <span className="cell-muted">—</span>
                              )}
                        </div>
                      </td>
                      <td>
                        <span className={
                          "status-badge " +
                          (u.status === "active" ? "status-active" :
                           u.status === "invited" ? "status-invited" : "status-disabled")
                        }>
                          {u.status}
                        </span>
                      </td>
                      <td className="cell-muted">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("de-DE") : "Never"}
                      </td>
                      <td>
                        <Link to={`/admin/adminPanel/users/${u.id}`} className="btn btn-primary">
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-controls">
              <button className="pagination-btn disabled" disabled>Prev</button>
              <button className="pagination-btn disabled" disabled>Next</button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Modal: Create User ===== */}
      {openCreate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenCreate(false); }}
        >
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-3">Create User</h3>

            {createError && (
              <div className="admin-error mb-3" role="alert">{createError}</div>
            )}

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
    </AdminPanelHeader>
  );
}
