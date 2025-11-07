// src/features/admin-panel/users/UserDetailsPage.tsx (Tailwind – angepasst wie Bild 1)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { getUser, getUserRoles, type UserApi } from "@/features/service/userService";
import myLogo from "@/assets/Zero-6-icons-05.webp";

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
              Users Administration
            </h1>
            <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
             Benutzerkonten, Rollen und Berechtigungen verwalten
            </p>
          </div>
        </div>
            </div>
          </div>
          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      <main className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">
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
                  <h3 className="text-[17px] font-semibold tracking-tight m-0">Noch nicht implementiert</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-[#e9ecef] bg-white px-4 py-3">
                    <div>
                    <p>Noch nicht implementiert</p>
                    </div>
                    
                  </div>
                </div>
              </section>

              {/* Recent Activities */}
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <h3 className="text-[17px] font-semibold tracking-tight mb-4">Noch nicht implementiert</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-[#e9ecef] bg-white px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p>Noch nicht implementiert</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Rechte Spalte */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-[#e9ecef] bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.18)] p-5">
                <h3 className="text-[16px] font-semibold tracking-tight">Actions</h3>
                <div className="mt-4 grid gap-2">
                <p>Noch nicht implementiert</p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
