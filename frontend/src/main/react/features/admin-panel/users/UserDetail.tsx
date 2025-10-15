// src/features/admin-panel/users/UserDetailsPage.tsx (Tailwind – angepasst wie Bild 1)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { getUser, getUserRoles, type UserApi } from "@/features/service/userService";

const CAP = {
  dark: "#264555",
  mid: "#56768f",
  gold: "#E3BB62",
  gray: "#808080",
  sand: "#d2c9b9",
  mute: "#ebebec",
};

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(+dt) ? "—" : dt.toLocaleDateString("de-DE");
}
function fmtTime(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(+dt) ? "—" : dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserApi | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User laden
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) throw new Error("Keine User-ID in der URL gefunden.");
        const u = await getUser(id);
        if (alive) setUser(u);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Rollen laden
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setRolesLoading(true);
    (async () => {
      try {
        const r = await getUserRoles(id);
        if (alive) setRoles(r);
      } finally {
        if (alive) setRolesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const displayName = loading ? "Loading…" : (user?.name || "—");

  return (
    <AdminPanelHeader>
      {/* ===== Hero ===== */}
      <header
        className="w-full border-b bg-white/90 [backdrop-filter:saturate(1.4)_blur(6px)]"
        style={{ borderColor: CAP.mute }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="h-[84px] flex items-center justify-center">
            <div className="text-center select-none">
              <h1 className="m-0 text-[36px] leading-none font-extrabold tracking-[-0.01em] text-[#264555]">Users</h1>
              <p className="m-0 mt-2 text-[15px] text-[#264555]/70 font-semibold">
                Manage user accounts, roles, and permissions.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full bg-[#EBEBEB] border-b border-[#e9ecef]">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#264555]/70 font-medium mb-5">
            <Link to="/admin/adminPanel" className="hover:underline">Admin Panel</Link>
            <span className="opacity-60">›</span>
            <Link to="/admin/adminPanel/users" className="hover:underline">Users</Link>
            <span className="opacity-60">›</span>
            <span className="text-[color:var(--foreground,#0f172a)] font-semibold">{displayName}</span>
          </nav>

          {/* Kopf mit Zurück-Button */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/admin/adminPanel/users"
              aria-label="Zurück zu Users"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border bg-white shadow-sm hover:bg-[#ebebec] transition-colors"
              style={{ borderColor: CAP.mute }}
            >
              <span className="text-lg">←</span>
            </Link>
            <div>
              <h2 className="text-[28px] font-extrabold leading-tight m-0">{displayName}</h2>
              <p className="text-sm text-[#264555]/70 m-0">User Details &amp; Management</p>
            </div>
          </div>

          {/* 2-Spalten Inhalt */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
            {/* Hauptspalte */}
            <div className="flex flex-col gap-6">
              {/* User Information */}
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <div className="mb-3">
                  <h3 className="text-[17px] font-semibold tracking-tight">User Information</h3>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-3 rounded-xl border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm"
                  >
                    Fehler: {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {/* Name */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">👤</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">Name</p>
                        <p className="m-0 text-[15px] font-semibold">{loading ? "…" : (user?.name || "—")}</p>
                      </div>
                    </div>

                    <div className="h-3" />

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">✉️</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">Email</p>
                        <p className="m-0 text-[15px] font-semibold break-all">{loading ? "…" : (user?.email || "—")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Roles */}
                    <div className="mb-4">
                      <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">Roles</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {rolesLoading ? (
                          <span className="text-[#264555]/50">…</span>
                        ) : roles.length ? (
                          roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#e5ebf0] text-[#264555]"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#264555]/50">—</span>
                        )}
                      </div>
                    </div>

                    {/* Created */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">📅</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">Created</p>
                        <p className="m-0 text-[15px] font-semibold">{loading ? "…" : fmtDate(user?.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Associated Companies */}
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden className="text-[18px]">🏢</span>
                  <h3 className="text-[17px] font-semibold tracking-tight m-0">Associated Companies</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-[#e9ecef] bg-white px-4 py-3">
                    <div>
                      <h4 className="m-0 text-[15px] font-extrabold">—</h4>
                      <p className="m-0 text-sm text-[#264555]/70">—</p>
                    </div>
                    <button
                      className="inline-flex items-center gap-1 text-sm font-bold rounded-lg border border-[#d1d5db] px-3 py-1.5 text-[#264555] bg-white hover:bg-[#f5f7f9]"
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    >
                      View Company
                    </button>
                  </div>
                </div>
              </section>

              {/* Recent Activities */}
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <h3 className="text-[17px] font-semibold tracking-tight mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-[#e9ecef] bg-white px-4 py-3">
                    <span aria-hidden className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-[#1f2937]"></span>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[15px]"><strong>—</strong> on <span className="text-[#264555]/60">—</span></p>
                      <p className="m-0 text-sm text-[#264555]/60">{fmtDate()} , {fmtTime()}</p>
                      <p className="m-0 text-sm text-[#264555]/60">—</p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">—</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Rechte Spalte */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <h3 className="text-[16px] font-semibold tracking-tight">Actions</h3>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold text-sm text-white bg-[#264555] hover:brightness-110 shadow-[0_6px_14px_-8px_rgba(38,69,85,.45)]"
                  >
                    <span aria-hidden>🔄</span> Reset Password
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold text-sm text-red-600 border border-red-300 bg-white hover:bg-red-50"
                  >
                    <span aria-hidden>🚫</span> Disable User
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AdminPanelHeader>
  );
}
