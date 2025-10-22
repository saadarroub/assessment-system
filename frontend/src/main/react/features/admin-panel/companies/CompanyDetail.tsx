// src/main/react/features/admin-panel/companies/CompanyDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import "@/styles/adminPanel.css";
import "@/styles/adminCompanyDetails.css";
import {
  getCompany,
  getWorkersByCompany,
  createWorker,
  updateWorker,
  deleteWorker,
  type WorkerApi,
} from "@/features/service/companyService";
import { Pencil, Loader2, Trash, UserPlus } from "lucide-react";

/* ---------- API & UI Types ---------- */
type CompanyApi = { id: string; name: string; description?: string; created_at?: string };
type CompanyDetailsT = {
  id: string;
  name: string;
  status?: "active" | "inactive";
  created: string;
  usersCount?: number;
  catalogsCount?: number;
};

function mapApiToDetails(x: CompanyApi): CompanyDetailsT {
  return {
    id: String(x.id),
    name: String(x.name ?? "Unbenannte Firma"),
    status: "active",
    created: x.created_at ? new Date(x.created_at).toISOString() : new Date().toISOString(),
  };
}
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE");
type TabKey = "users" | "catalogs" | "settings";

/* ================================ */
/*           Component              */
/* ================================ */
export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();

  const [company, setCompany] = useState<CompanyDetailsT | null>(null);
  const [tab, setTab] = useState<TabKey>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workers (Liste)
  const [workers, setWorkers] = useState<WorkerApi[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);

  // Invite (Create)
  const [openInvite, setOpenInvite] = useState(false);
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invWorkspace, setInvWorkspace] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Edit
  const [editing, setEditing] = useState<WorkerApi | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWs, setFormWs] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete
  const [toDelete, setToDelete] = useState<WorkerApi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ---------- Company laden ---------- */
  useEffect(() => {
    let alive = true;
    if (!id) {
      setError("Keine ID in der URL gefunden.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const raw = await getCompany(id);
        const mapped = mapApiToDetails(raw);
        if (alive) setCompany(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  /* ---------- Workers laden ---------- */
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setWorkersLoading(true);
    setWorkersError(null);
    (async () => {
      try {
        const list = await getWorkersByCompany(id);
        if (alive) setWorkers(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (alive) setWorkersError(e?.message ?? String(e));
      } finally {
        if (alive) setWorkersLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  /* ---------- Loading/Errors ---------- */
  if (loading) {
    return (
      <AdminPanelHeader>
        <header className="main-header">
          <div className="header-content">
            <div className="header-center">
              <div className="header-text">
                <h1>Company</h1>
                <p>Laden…</p>
              </div>
            </div>
          </div>
        </header>
      </AdminPanelHeader>
    );
  }

  if (error || !company) {
    return (
      <AdminPanelHeader>
        <header className="main-header">
          <div className="header-content">
            <div className="header-center">
              <div className="header-text">
                <h1>Companies</h1>
                <p>{error ?? "Company not found. Check the URL or go back to the list."}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <nav className="breadcrumb">
            <Link to="/admin/adminPanel">Admin Panel</Link>
            <span>›</span>
            <Link to="/admin/adminPanel/companies">Companies</Link>
            <span>›</span>
            <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>Not found</span>
          </nav>
        </main>
      </AdminPanelHeader>
    );
  }

  /* ---------- abgeleitete Werte ---------- */
  const usersCount = typeof company.usersCount === "number" ? company.usersCount : workers.length;
  const catalogsCount = typeof company.catalogsCount === "number" ? company.catalogsCount : 0;
  const statusLabel = (company.status ?? "active") === "active" ? "Active" : "Inactive";
  const statusClass = (company.status ?? "active") === "active" ? "status-active" : "status-inactive";

  /* ---------- Invite ---------- */
  function openInviteModal() {
    setInvName(""); setInvEmail(""); setInvWorkspace("");
    setCreateErr(null);
    setOpenInvite(true);
  }
  function cancelInvite() { if (!creating) setOpenInvite(false); }
  async function onInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!invName.trim() || !invEmail.trim()) {
      setCreateErr("Bitte Name und Email ausfüllen.");
      return;
    }
    setCreating(true);
    setCreateErr(null);
    try {
      const created = await createWorker({
        name: invName.trim(),
        email: invEmail.trim(),
        workSpaceRef: invWorkspace.trim() || undefined,
        companyId: id,
      });
      setWorkers(prev => [created, ...prev]);
      setOpenInvite(false);
    } catch (err: any) {
      setCreateErr(err?.message ?? String(err));
    } finally {
      setCreating(false);
    }
  }

  /* ---------- Edit ---------- */
  function openEdit(w: WorkerApi) {
    setEditing(w);
    setFormName(w.name ?? "");
    setFormEmail(w.email ?? "");
    setFormWs(w.workSpaceRef ?? "");
    setSaveError(null);
  }
  function cancelEdit() { if (!saving) { setEditing(null); setSaveError(null); } }
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing|| !company) return;
    setSaving(true);
    setSaveError(null);

    // Optimistic
    const optimistic = { ...editing, name: formName, email: formEmail, workSpaceRef: formWs };
    setWorkers(prev => prev.map(x => (x.id === editing.id ? optimistic : x)));

    try {
      const updated = await updateWorker(editing.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        workSpaceRef: (formWs ?? "").trim(),
        companyId: company.id,
      });
      setWorkers(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } catch (err: any) {
      setSaveError(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete ---------- */
  function askDelete(w: WorkerApi) { setToDelete(w); setDeleteError(null); }
  function cancelDelete() { if (!deleting) { setToDelete(null); setDeleteError(null); } }
  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const snapshot = workers;
    setWorkers(prev => prev.filter(x => x.id !== toDelete.id));
    try {
      await deleteWorker(toDelete.id);
      setToDelete(null);
    } catch (err: any) {
      setWorkers(snapshot);
      setDeleteError(err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  }

  /* ---------- Render ---------- */
  return (
    <AdminPanelHeader>
      {/* === Hero === */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-text">
              <h1>Company: {company.name}</h1>
              <p>Details &amp; management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/admin/adminPanel">Admin Panel</Link>
          <span>›</span>
          <Link to="/admin/adminPanel/companies">Companies</Link>
          <span>›</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{company.name}</span>
        </nav>

        {/* Kopf */}
        <div className="page-header details-page-header">
          <Link to="/admin/adminPanel/companies" className="back-btn" aria-label="Zurück zu Companies">←</Link>
          <div>
            <h2 className="page-title">Company Details &amp; Management</h2>
            <p className="page-description">{company.name}</p>
          </div>
        </div>

        <div className="content-grid">
          {/* Hauptspalte */}
          <div className="main-column">
            <section className="admin-card company-section">
              {/* Company Kopf */}
              <div className="company-header">
                <div className="company-info">
                  <div className="company-icon" aria-hidden>🏢</div>
                  <div className="company-text"><h2>{company.name}</h2></div>
                </div>
                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon" aria-hidden>👥</span><span className="stat-number">{usersCount}</span><div className="stat-label">Users</div></div>
                <div className="stat-card"><span className="stat-icon" aria-hidden>📂</span><span className="stat-number">{catalogsCount}</span><div className="stat-label">Catalogs</div></div>
                <div className="stat-card"><span className="stat-icon" aria-hidden>📅</span><div className="stat-number stat-number-compact">{formatDate(company.created)}</div><div className="stat-label">Created</div></div>
              </div>

              {/* Tabs */}
              <div className="tabs" role="tablist" aria-label="Company Tabs">
                <div className="tab-list">
                  <button type="button" className={`tab-button ${tab === "users" ? "active" : ""}`} aria-selected={tab === "users"} onClick={() => setTab("users")}>
                    <span aria-hidden>👥</span> Users ({usersCount})
                  </button>
                  <button type="button" className={`tab-button ${tab === "catalogs" ? "active" : ""}`} aria-selected={tab === "catalogs"} onClick={() => setTab("catalogs")}>
                    <span aria-hidden>📂</span> Catalogs ({catalogsCount})
                  </button>
                  <button type="button" className={`tab-button ${tab === "settings" ? "active" : ""}`} aria-selected={tab === "settings"} onClick={() => setTab("settings")}>
                    <span aria-hidden>⚙️</span> Settings
                  </button>
                </div>
              </div>

              {/* USERS TAB */}
              {tab === "users" && (
                <div>
                  {workersLoading ? (
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>⏳</div>
                      <p className="empty-title">Lade Worker…</p>
                    </div>
                  ) : workersError ? (
                    <div className="admin-error" role="alert" style={{ margin: "0.75rem 0" }}>
                      {workersError}
                    </div>
                  ) : workers.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>👥</div>
                      <p className="empty-title">Keine User-Daten verfügbar.</p>
                      <p className="empty-sub">Füge über „Invite User“ neue Worker hinzu.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="admin-table subtable">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Workspace</th>
                            <th>Created</th>
                            <th className="w-28">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workers.map((w) => (
                            <tr key={w.id}>
                              <td style={{ fontWeight: 600 }}>{w.name || "—"}</td>
                              <td className="cell-muted">{w.email || "—"}</td>
                              <td className="cell-muted">{w.workSpaceRef || "—"}</td>
                              <td className="cell-muted">
                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString("de-DE") : "—"}
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(w)}
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    title="Bearbeiten"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => askDelete(w)}
                                    className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    title="Löschen"
                                  >
                                    <Trash size={14} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "catalogs" && (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden>📁</div>
                  <p className="empty-title">Catalog management would be implemented here.</p>
                  <p className="empty-sub">This company has {catalogsCount} catalogs.</p>
                </div>
              )}

              {tab === "settings" && (
                <div className="settings-wrap">
                  <div className="settings-grid">
                    <div className="input-ctrl">
                      <label htmlFor="c-name">Company Name</label>
                      <input id="c-name" value={company.name} readOnly />
                    </div>
                  </div>
                  <p className="settings-hint">Settings management würde hier später implementiert.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="sidebar-column">
            <section className="admin-card actions-card">
              <h2 className="actions-title">Actions</h2>
              <div className="actions-list">
                <button
                  type="button"
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={openInviteModal}
                >
                  <UserPlus size={16} />
                  Invite User
                </button>
                <button type="button" className="btn btn-secondary">
                  <span aria-hidden>⚙️</span> Edit Settings
                </button>
              </div>
            </section>

            <section className="admin-card stats-card">
              <h2 className="stats-title">Company Stats</h2>
              <div className="stats-list">
                <div className="stat-row"><span className="stat-label-row">Total Users:</span><span className="stat-value">{usersCount}</span></div>
                <div className="stat-row"><span className="stat-label-row">Total Catalogs:</span><span className="stat-value">{catalogsCount}</span></div>
                <div className="stat-row"><span className="stat-label-row">Status:</span><span className="stat-value">{statusLabel}</span></div>
                <div className="stat-row"><span className="stat-label-row">Created:</span><span className="stat-value">{formatDate(company.created)}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* ===== Invite Worker Modal ===== */}
      {openInvite && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelInvite(); }}
        >
          <div className="w-[min(560px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1">Invite User</h3>
            {createErr && <div className="admin-error mb-3" role="alert">{createErr}</div>}

            <form onSubmit={onInviteSubmit} className="space-y-3">
              <div>
                <label htmlFor="cw-name" className="block text-sm font-medium mb-1">Name *</label>
                <input
                  id="cw-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="cw-mail" className="block text-sm font-medium mb-1">Email *</label>
                <input
                  id="cw-mail"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="cw-ws" className="block text-sm font-medium mb-1">Workspace (optional)</label>
                <input
                  id="cw-ws"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={invWorkspace}
                  onChange={(e) => setInvWorkspace(e.target.value)}
                  placeholder="z. B. HQ-01"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelInvite}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={creating}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                  disabled={creating}
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Edit Worker Modal ===== */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className="w-[min(560px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1">Edit Worker</h3>
            {saveError && (<div className="admin-error mb-3" role="alert">{saveError}</div>)}

            <form onSubmit={onSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-name">Name *</label>
                <input
                  id="w-name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-mail">Email *</label>
                <input
                  id="w-mail"
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="w-ws">Workspace</label>
                <input
                  id="w-ws"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={formWs}
                  onChange={(e) => setFormWs(e.target.value)}
                  placeholder="z. B. Senior Consulting"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Worker Modal ===== */}
      {toDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}
        >
          <div className="w-[min(520px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
            <h3 className="text-lg font-semibold mb-1 text-red-600">Worker löschen?</h3>
            <p className="text-sm text-slate-700 mb-3">
              Willst du <b>{toDelete.name || "Unbenannt"}</b> ({toDelete.email}) wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {deleteError && <div className="admin-error mb-3" role="alert">{deleteError}</div>}
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
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
                disabled={deleting}
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPanelHeader>
  );
}
