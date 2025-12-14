import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { getUser, type UserApi } from "@/features/service/userService";
import { Network, Users } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { Pencil } from "lucide-react"

const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(+dt) ? "—" : dt.toLocaleDateString("de-DE");
}

// exakt auf deinen Response zugeschnitten
type RoleWithPerms = {
  id: string;
  name: string;
  permissions: string[];
};

type UserWithExtras = UserApi & {
  createdAt?: string;
  updatedAt?: string;
  roles?: any[];
};

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) throw new Error("Keine User-ID in der URL gefunden.");
        const u = (await getUser(id)) as UserWithExtras;
        if (alive) setUser(u);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const displayName = loading ? "Loading…" : user?.name || "—";

  // Rollen sauber mappen
  const rawRoles = ((user as any)?.roles ?? []) as any[];

  const userRoles: RoleWithPerms[] = rawRoles.map((r: any) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    permissions: Array.isArray(r.permissions)
      ? r.permissions.map((p: any) => String(p))
      : [],
  }));

  const roleChips = userRoles.map((r) => ({
    id: r.id,
    label: r.name || "Unbenannte Rolle",
  }));

  // Permissions: alle Rollen zusammen, ohne Duplikate
  const allPermissions = Array.from(
    new Set(userRoles.flatMap((r) => r.permissions))
  );
  const permissionChips = allPermissions.map((p, idx) => ({
    id: String(idx),
    label: p,
  }));

  const createdDate = user?.createdAt;
  const updatedDate = user?.updatedAt;

  return (
    <AdminLayout>
      {/* ===== Hero wie in der Liste ===== */}
      <PageHeader
        title="Benutzer Administration"
        subtitle="Verwalte Benutzerkonten, Rollen und Berechtigungen in CapConsulting"
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
            "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto space-y-4">
          {/* Top-Bar: Breadcrumb-Pill + Back-Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Breadcrumb als Pill – analog UsersPage, aber mit Usernamen */}
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
                  <Users size={14} />
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

                <Link
                  to="/admin/adminPanel/users"
                  className="hover:underline"
                  style={{ color: CSS.mutedFg }}
                >
                  Users
                </Link>

                <span
                  className="text-[11px] opacity-60"
                  style={{ color: CSS.mutedFg }}
                >
                  ›
                </span>

                <span
                  className="font-semibold max-w-[180px] truncate"
                  style={{ color: "hsl(var(--foreground))" }}
                  title={displayName}
                >
                  {displayName}
                </span>
              </div>
            </nav>

            {/* Zur Liste zurück */}
            <Link
              to="/admin/adminPanel/users"
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                text-xs sm:text-sm font-medium
                bg-white
                hover:bg-slate-50
              "
              style={{ borderColor: BRAND.sand, color: BRAND.navy }}
            >
              <span className="text-base leading-none">←</span>
              <span>Zur Übersicht</span>
            </Link>
          </div>

          {/* ===== 2 Spalten Content ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] gap-5 lg:gap-6">
            {/* Linke Spalte */}
            <div className="space-y-5">
              {/* User Information Card */}
              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                style={{ borderColor: BRAND.sand }}
              >
                {/* Header full width (Meta-Style) */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(38,69,85,0.10)", color: BRAND.navy }}
                      aria-hidden
                    >
                      <Users size={18} />
                    </div>

                    <div>
                      <h2 className="text-[15px] font-semibold leading-tight text-slate-900">
                        User Information
                      </h2>
                      <p className="text-[12px] text-slate-500 m-0">
                        Stammdaten und Rollen des ausgewählten Benutzers.
                      </p>
                    </div>
                  </div>

                  {/* Avatar rechts bleibt */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold"
                    style={{
                      background: "rgba(227,187,98,0.35)",
                      color: BRAND.navy,
                      border: `1px solid ${BRAND.sand}`,
                    }}
                    title={user?.name ?? "User"}
                  >
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    Fehler: {error}
                  </div>
                )}

                {/* Name + Email + Rollen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5 py-5">
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">👤</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Name
                        </p>
                        <p className="m-0 text-[15px] font-semibold">
                          {loading ? "…" : user?.name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">✉️</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Email
                        </p>
                        <p className="m-0 text-[15px] font-semibold break-all">
                          {loading ? "…" : user?.email || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rollen + Created */}
                  <div className="space-y-4">
                    {/* Rollen */}
                    <div>
                      <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                        Rollen
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {loading ? (
                          <span className="text-[#264555]/50">…</span>
                        ) : roleChips.length ? (
                          roleChips.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#e5ebf0] text-[#264555]"
                            >
                              {r.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#264555]/50">—</span>
                        )}
                      </div>
                    </div>

                    {/* Created / Updated */}
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="text-[18px]">📅</span>
                      <div>
                        <p className="m-0 text-[13px] text-[#264555]/70 font-semibold">
                          Erstellt / Aktualisiert
                        </p>
                        <p className="m-0 text-[14px] font-medium">
                          {loading ? "…" : fmtDate(createdDate)}
                          {updatedDate && (
                            <span className="text-xs text-slate-500">
                              {" "}
                              · zuletzt: {fmtDate(updatedDate)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Permissions Card (statt „Noch nicht implementiert“) */}
              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                style={{ borderColor: BRAND.sand }}
              >
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(38,69,85,0.10)", color: BRAND.navy }}
                      aria-hidden
                    >
                      <Network size={18} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
                        Permissions
                      </h3>
                      <p className="text-[12px] text-slate-500 m-0">
                        Aggregiert aus allen Rollen dieses Benutzers.
                      </p>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <p className="text-sm text-slate-500">Lade…</p>
                ) : permissionChips.length ? (
                  <div className="mt-5 mb-5 flex flex-wrap gap-2 px-5 py-">
                    {permissionChips.map((p) => {
                      // einfache Farbzuordnung nach Prefix
                      const prefix = p.label.split(".")[0];
                      let bg = "#f8fafc";
                      let border = "#e5ebf0";
                      if (prefix === "users") {
                        bg = "rgba(59,130,246,0.06)";
                        border = "rgba(59,130,246,0.35)";
                      } else if (prefix === "catalogs") {
                        bg = "rgba(22,163,74,0.06)";
                        border = "rgba(22,163,74,0.35)";
                      } else if (prefix === "companies") {
                        bg = "rgba(234,179,8,0.06)";
                        border = "rgba(234,179,8,0.35)";
                      } else if (prefix === "roles" || prefix === "permissions") {
                        bg = "rgba(147,51,234,0.06)";
                        border = "rgba(147,51,234,0.35)";
                      }

                      return (
                        <span
                          key={p.id}
                          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            color: BRAND.navy,
                          }}
                        >
                          {p.label}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Keine Permissions gefunden.
                  </p>
                )}
              </section>

              {/* Platzhalter für zukünftige Aktivitäten */}
              <section
                className="
                  rounded-[18px] border
                  shadow-[0_10px_30px_rgba(0,0,0,0.04)]
                  px-5 py-4
                  bg-white
                "
                style={{ borderColor: BRAND.sand }}
              >
                <h3 className="text-[15px] font-semibold mb-2">
                  Noch nicht implementiert
                </h3>
                <p className="text-sm text-slate-500">
                  Noch nicht implementiert
                </p>
              </section>
            </div>

            {/* Rechte Spalte – kompakte Meta/Actions Card */}
            <aside className="space-y-5">
              <section
                className="rounded-[18px] border bg-white overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.05)]"
                style={{ borderColor: BRAND.sand }}
              >
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(38,69,85,0.06) 0%, rgba(227,187,98,0.10) 100%)",
                    borderBottom: `1px solid ${BRAND.sand}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(38,69,85,0.10)", color: BRAND.navy }}
                      aria-hidden
                    >
                      <Pencil size={18} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
                        Actions
                      </h3>
                      <p className="text-[12px] text-slate-500 m-0">
                        Aktionen für diesen Benutzer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">

                </div>
              </section>

            </aside>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
