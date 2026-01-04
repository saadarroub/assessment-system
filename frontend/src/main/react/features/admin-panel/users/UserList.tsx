import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { Search, ArrowUpDown, Eye, Plus, Trash2, Pencil, Users } from "lucide-react";
import ConfirmModal from "@/shared/components/ConfirmModal";
import UserLogo from "@/assets/blue-user-icon-transparent.png";
import { getUserProfile, buildAvatarUrl } from "@/features/service/profilePageService";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { PermissionButton } from "@/shared/components/permission/PermissionButton";
import { SoftSquaresBackground } from "@/shared/components/SoftSquaresBackground";


import {
  getUsers,
  createUser,
  deleteUser,
  type UserApi,
  updateUser,
  deleteUserRole,
  assignUserRole,
} from "@/features/service/userService";
import { getRoles, type RoleApi } from "@/features/service/roleService";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";
import { useToast } from "@/shared/contexts/ToastContext";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
// ---- Types ----
export type UserRow = {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  status: "active" | "invited" | "disabled";
  avatarUrl?: string | null;
};

type SortKey = "name" | "email" | "status";

function mapApiToUser(u: UserApi): UserRow {
  const rawRoles: any = (u as any).roles;

  let roles: { id: string; name: string }[] = [];

  if (Array.isArray(rawRoles)) {
    if (rawRoles.length > 0 && typeof rawRoles[0] === "string") {
      // roles: string[]
      roles = rawRoles.map((r: string) => ({
        id: String(r),
        name: String(r),
      }));
    } else {
      // roles: { id, name }[]
      roles = rawRoles.map((r: any) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
      }));
    }
  }

  return {
    id: String(u.id),
    name: String(u.name ?? "Unbenannter User"),
    email: String(u.email ?? ""),
    roles,
    status: (u.status as "active" | "invited" | "disabled") ?? "active",
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
const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};


export default function UsersPage() {
  const { showSuccess, showError } = useToast();
  const { has } = useHasPermission();

  const canViewUsers = has("users.view");
  const canCreateUser = has("users.create");
  const canEditUser = has("users.edit");
  const canDeleteUser = has("users.delete");


  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Edit Modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [eRoleId, setERoleId] = useState<string>("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [removingRole, setRemovingRole] = useState(false);
  const [removeRoleError, setRemoveRoleError] = useState<string | null>(null);

  const [avatarById, setAvatarById] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!items.length) return;

    let alive = true;

    (async () => {
      // nur für User laden, die noch keinen Cache-Eintrag haben
      const missing = items
        .map((u) => u.id)
        .filter((id) => avatarById[id] === undefined);

      if (!missing.length) return;

      const results = await Promise.allSettled(
        missing.map(async (id) => {
          const p = await getUserProfile(id);
          return [id, buildAvatarUrl(p.profileImagePath)] as const;
        })
      );

      if (!alive) return;

      setAvatarById((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r.status === "fulfilled") {
            const [id, url] = r.value;
            next[id] = url ?? null;
          } else {
            // wenn Fehler: merken wir "kein avatar"
            // (sonst würdest du immer wieder neu versuchen)
            const reason: any = r.reason;
            const idGuess = String(reason?.config?.url ?? "");
            // fallback: setze nichts, wenn du willst – ich setze auf null, damit Ruhe ist
            // (wir haben id nicht sicher, daher einfach ignorieren)
          }
        }
        return next;
      });
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);



  async function onRemoveRole() {
    if (!editUser || !editUser.roles.length) return;

    // Wir nehmen die erste / einzige Rolle des Users
    const roleIdToRemove = editUser.roles[0].id;

    try {
      setRemovingRole(true);
      setRemoveRoleError(null);

      await deleteUserRole(editUser.id, roleIdToRemove);

      // Tabelle updaten
      setItems(prev =>
        prev.map(row =>
          row.id === editUser.id ? { ...row, roles: [] } : row
        )
      );

      // Edit-Modal-State updaten
      setEditUser(prev => (prev ? { ...prev, roles: [] } : prev));
      setERoleId(""); // Select später wieder von Null starten

      showSuccess("Rolle erfolgreich entfernt.");
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setRemoveRoleError(msg);

      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Entfernen der Rolle: ${msg}`);
      }
    } finally {
      setRemovingRole(false);
    }
  }


  // Get current user
  const { user: currentUser } = useAuthCtx();

  // Users
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getUsers();
        // Filter out the currently logged-in user
      const filtered = currentUser
  ? raw.filter(u => String(u.id) !== String(currentUser.id))
  : raw;

        const mapped = (filtered.reverse() ?? []).map(mapApiToUser);
        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e); // Error-Objekt direkt setzen, nicht nur message
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentUser]);

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


  // Filter + Sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? items.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      : items.slice();

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (u: UserRow): string | number => {
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

      const base = mapApiToUser(created);
      const roleFromSelect = availableRoles.find(r => String(r.id) === String(selectedRoleId));
      const row = (base.roles?.length)
        ? base
        : {
          ...base,
          roles: roleFromSelect
            ? [{ id: String(roleFromSelect.id), name: String(roleFromSelect.name) }]
            : [{ id: String(selectedRoleId), name: String(selectedRoleId) }],
        };

      setItems((prev) => [row, ...prev]);
      setHighlightedId(row.id);
      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
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

  // === Edit flow ===
  const openEditFor = (u: UserRow) => {
    setEditUser(u);
    setEName(u.name);
    setEEmail(u.email);
    setEPassword("");
    setERoleId(u.roles[0]?.id ?? "");
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
    setERoleId("");
    setUpdateError(null);
  };

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;

    // Stammdaten vorbereiten (ohne Rolle)
    const userPayload = {
      name: eName.trim() || editUser.name,
      email: eEmail.trim() || editUser.email,
      ...(ePassword.trim() ? { password: ePassword.trim() } : {}),
    };

    // aktuelle & neue Rolle ermitteln
    const oldRoleId = editUser.roles[0]?.id ?? null;   // aktuelle Rolle aus Tabelle/State
    const newRoleId = eRoleId || null;                 // aus dem Select (kann "" sein)

    try {
      setUpdating(true);
      setUpdateError(null);

      // User-Daten updaten (Name/Email/Passwort)
      await updateUser(editUser.id, userPayload);

      // alte Rolle löschen, wenn sie sich ändert
      if (oldRoleId && oldRoleId !== newRoleId) {
        await deleteUserRole(editUser.id, oldRoleId);
      }

      //  neue Rolle setzen, wenn gewählt und anders als vorher
      if (newRoleId && newRoleId !== oldRoleId) {
        await assignUserRole(editUser.id, newRoleId);
      }

      //  Users neu laden, damit roles sicher korrekt sind
      const raw = await getUsers();
      const mapped = (raw ?? []).map(mapApiToUser).reverse();
      setItems(mapped);

      cancelEdit();
      showSuccess(`Benutzer "${userPayload.name}" erfolgreich aktualisiert!`);
    } catch (err: any) {
      const errorMsg = err?.message ?? String(err);
      setUpdateError(errorMsg);

      if ((err as any)?.response?.status !== 403) {
        showError(`Fehler beim Aktualisieren: ${errorMsg}`);
      }
    } finally {
      setUpdating(false);
    }
  }



  //Pagination 
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Start mit 10 Zeilen pro Seite
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => { setPage(1); }, [q, sortKey, asc, items, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Scroll sperren, sobald irgendein Modal offen ist
  const isAnyModalOpen =
    openCreate ||
    (openEdit && !!editUser) ||
    (openDelete && !!targetUser);

  useScrollLock(isAnyModalOpen);


  return (
    <AdminLayout>
      {/* HEADER */}
      <PageHeader

        title=" Benutzer Administration"
        subtitle=" Verwalte Benutzerkonten, Rollen und Berechtigungen in CapConsulting"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/*  Außenbereich unter dem Hero  */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            // oben weicher Übergang vom dunklen Header
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            // Grundfläche: sehr sanftes, leicht blau-graues Licht
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >

        {/* ===== Top-Bar: Breadcrumb + Add-Button (eine Zeile) ===== */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          {/* Breadcrumb links – als hübscher Pill */}
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
              {/* kleines Icon-Badge */}
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",   // Navy ganz leicht
                  color: BRAND.navy,
                }}
              >
                <Users size={14} />
              </span>

              {/* Admin Panel Link */}
              <Link
                to="/admin/adminPanel"
                className="hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                Admin Panel
              </Link>

              {/* Trenner */}
              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              {/* Aktuelle Seite */}
              <span
                className="font-semibold"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Users
              </span>
            </div>
          </nav>

          {/* Add User rechts */}
          <PermissionButton
            type="button"
            allowed={canCreateUser}
            tooltip="Du brauchst die Berechtigung: users.create"
            onClick={() => setOpenCreate(true)}
            aria-label="Add User"
            className="
    inline-flex items-center gap-2
    rounded-full
    px-4 py-2
    text-sm font-semibold
    focus:outline-none
    transition
    hover:-translate-y-[1px]
  "
            style={{
              background: "hsl(40,60%,63%)",
              color: "hsl(200,32%,22%)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <Plus size={16} />
            <span>Add User</span>
          </PermissionButton>


        </div>


        {/*  Suche + Count – Cap Farbwelt */}
        <div
          className="
    max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
    rounded-[18px] border
    px-4 py-3 md:px-5 md:py-4
    shadow-[0_10px_30px_rgba(0,0,0,0.06)]
  "
          style={{
            // dezente Card: oben minimal heller, unten etwas dunkler
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand, // #d2c9b9
          }}
        >

          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND?.gray ?? "#808080" }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Benutzer (Name oder E-Mail)…"
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
                  borderColor: BRAND?.sand ?? "#d2c9b9",
                  color: CSS.fg,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = BRAND?.gold ?? "#E3BB62";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = BRAND?.sand ?? "#d2c9b9";
                }}
              />
            </div>

            {/* Zähler rechts – dezente Badge */}
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: BRAND?.navy ?? "#264555",
                  color: "white",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: BRAND?.gold ?? "#E3BB62" }}
                />
                <span>
                  Zeige{" "}
                  <span className="font-semibold">
                    {filtered.length}
                  </span>{" "}
                  Benutzer
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* ===== Card (um die Tabelle) ===== */}
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


            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead
                  className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                  style={{
                    background: "linear-gradient(to right, #ebebec, #ffffff)", // Fog → weiß
                    borderBottom: "2px solid #d2c9b9",                         // Sand
                    color: "#264555",                                          // Navy
                  }}
                >

                  <tr>
                    {[
                      { k: "name", label: "Name" },
                      { k: "email", label: "Email" },
                      { k: null, label: "Roles" },
                      { k: "status", label: "Status" },
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
                      <td colSpan={6} className="px-4 py-4 bg-white">Lade Users…</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 bg-white">
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          {/* Icon-Kreis */}
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                            style={{ color: "hsla(200,32%,22%,0.65)" }}>
                            <Search size={20} />
                          </div>

                          {/* Texte */}
                          <div className="space-y-1">
                            <p className="text-sm font-semibold" style={{ color: CSS.fg }}>
                              {q.trim()
                                ? "Keine Treffer für deine Suche"
                                : "Noch keine Benutzer vorhanden"}
                            </p>

                            <p className="text-xs text-slate-500 max-w-md">
                              {q.trim()
                                ? "Bitte passe den Suchbegriff an oder setze den Filter zurück."
                                : "Lege den ersten Benutzer an, um mit der Administration zu starten."}
                            </p>
                          </div>

                          {/* Aktionen */}
                          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                            {q.trim() && (
                              <button
                                type="button"
                                onClick={() => setQ("")}
                                className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                                style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                              >
                                Filter zurücksetzen
                              </button>
                            )}

                            {!q.trim() && (
                              <PermissionButton
                                type="button"
                                allowed={canCreateUser}
                                tooltip="Du brauchst die Berechtigung: users.create"
                                onClick={() => setOpenCreate(true)}
                                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold shadow hover:[filter:brightness(1.05)]"
                                style={{
                                  background: "hsl(40,60%,63%)",
                                  color: "hsl(200,32%,22%)",
                                  boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                                }}
                              >
                                <Plus size={14} />
                                Benutzer anlegen
                              </PermissionButton>

                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((u) => (
                      <tr
                        key={u.id}
                        className={`
    bg-white
    transition
    border-l-[4px] border-transparent
    hover:border-[#E3BB62]
    hover:bg-[#fff9ec]
    hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
    ${highlightedId === u.id ? "animate-pulse" : ""}
  `}
                        style={
                          highlightedId === u.id
                            ? {
                              borderLeftColor: "rgb(34 197 94)", // grün links
                              boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                              background:
                                "linear-gradient(to right, rgba(34,197,94,0.08), rgba(255,255,255,1))",
                            }
                            : undefined
                        }
                      >


                        <td
                          className="px-4 py-4"
                          style={{ borderBottom: `1px solid ${CSS.border}` }}
                        >
                          <div className="flex items-center gap-3 ">
                            {/* Avatar */}
                            <div
                              className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 overflow-hidden"
                              title={u.name}
                            >
                              {avatarById[u.id] ? (
                                <img
                                  src={avatarById[u.id] as string}
                                  alt={u.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                  onError={() => {
                                    // wenn Bild nicht geladen werden kann -> fallback auf Initial
                                    setAvatarById((prev) => ({ ...prev, [u.id]: null }));
                                  }}
                                />
                              ) : (
                                <span className="text-[12px] font-bold" style={{ color: BRAND.navy }}>
                                  {(u.name?.charAt(0) ?? "U").toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Name */}
                            <span className="font-semibold" style={{ color: CSS.fg }}>
                              {u.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>{u.email}</td>
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="flex flex-wrap gap-2">
                            {u.roles.length ? (
                              u.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#e5ebf0] text-[#264555]"
                                >
                                  {r.name}
                                </span>
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
                        <td className="px-4 py-4 text-center whitespace-nowrap" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="inline-flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/adminPanel/users/${u.id}`}
                              title="View"
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
                            </Link>


                            {/* Edit Icon-Button (öffnet Edit-Modal) */}
                            <PermissionButton
                              type="button"
                              allowed={canEditUser}
                              tooltip="Du brauchst: users.edit"
                              aria-label="Edit user"
                              onClick={() => openEditFor(u)}
                              title="Edit"
                              className="
    inline-flex items-center justify-center
    rounded-full
    px-2.5 py-1.5
    text-[11px] font-medium
    border
    transition
    hover:bg-[#f5f0e4]
  "
                              style={{
                                borderColor: "#d2c9b9",
                                color: "#264555",
                                background: "#ffffff",
                              }}
                            >
                              <Pencil size={13} />
                            </PermissionButton>


                            {/* Delete (wie bisher) */}
                            <PermissionButton
                              type="button"
                              allowed={canDeleteUser}
                              tooltip="Du brauchst: users.delete"
                              aria-label="Delete user"
                              onClick={() => askDelete(u)}
                              title="Löschen"
                              className="
    inline-flex items-center justify-center
    rounded-full
    px-2.5 py-1.5
    text-[11px] font-medium
    border
    transition
    hover:bg-[#fff1f1]
  "
                              style={{
                                borderColor: "rgba(248,113,113,0.8)",
                                color: "rgb(185,28,28)",
                                background: "#ffffff",
                              }}
                            >
                              <Trash2 size={13} />
                            </PermissionButton>


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
        {/* === Pagination (mit Rows per page + Page X of Y) === */}
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
            {/* Links: Range-Info */}
            <div className="text-xs sm:text-sm" style={{ color: "#808080" }}>
              Zeige <span className="font-semibold" style={{ color: "#264555" }}>{startIdx}</span>
              –
              <span className="font-semibold" style={{ color: "#264555" }}>{endIdx}</span>
              {" "}von{" "}
              <span className="font-semibold" style={{ color: "#264555" }}>{total}</span> Einträgen
            </div>

            {/* Rechts: Rows per page + Page X of Y + Pfeile */}
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {/* Rows per page */}
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

              {/* Page X of Y */}
              <span
                className="
                  inline-flex items-center
                  rounded-full
                  px-3 py-1.5
                  text-xs sm:text-sm font-semibold
                "
                style={{
                  background: "#264555", // Navy
                  color: "white",
                }}
              >
                Seite {page} von {totalPages}
              </span>

              {/* Pfeil-Buttons */}
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

      {/* ===== Create User Modal ===== */}
      {openCreate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Karten-Block mit Glow */}
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
                  Create User
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
                  id="create-user-form"
                  onSubmit={onCreateUser}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="u-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="u-name"
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
                      value={uName}
                      onChange={(e) => setUName(e.target.value)}
                      placeholder="z. B. Max Mustermann"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="u-email"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="u-email"
                      type="email"
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
                      value={uEmail}
                      onChange={(e) => setUEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="u-pass"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="u-pass"
                      type="password"
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
                      value={uPassword}
                      onChange={(e) => setUPassword(e.target.value)}
                      placeholder="●●●●●●●●"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="u-role"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Rolle <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="u-role"
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
                      <p className="text-xs text-red-600 mt-1">
                        {rolesLoadError}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* kleiner Abstand wie bei den anderen Modals */}
            <div className="h-3" />

            {/* Button-Leiste – gleich wie Confirm/Edit */}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
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
                form="create-user-form"
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
                disabled={creating}
              >
                {creating ? "Erstelle…" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ===== Delete Confirm Modal ===== */}
      <ConfirmModal
        open={openDelete && !!targetUser}
        title="User löschen?"
        description={
          <>
            Willst du den Benutzer{" "}
            <span className="font-semibold">{targetUser?.name}</span>
            {" "}(
            <span className="font-mono text-[13px]">{targetUser?.email}</span>
            ) wirklich löschen?
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
        onCancel={cancelDelete}
        onConfirm={() => {
          if (!deleting) {
            void confirmDelete();
          }
        }}
        icon={<Trash2 className="text-red-500" />}
      />


      {/* ===== Edit User Modal (im gleichen Style wie ConfirmModal) ===== */}
      {openEdit && editUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"

        >
          <div
            className="w-full max-w-xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Karten-Block mit Glow – analog ConfirmModal */}
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
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                  Edit User
                </h3>

                {updateError && (
                  <div
                    className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                    role="alert"
                  >
                    {updateError}
                  </div>
                )}

                <form
                  id="edit-user-form"
                  onSubmit={onEditSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="e-name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="e-name"
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
                      value={eName}
                      onChange={(e) => setEName(e.target.value)}
                      placeholder="Name ändern (optional)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="e-email"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="e-email"
                      type="email"
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
                      value={eEmail}
                      onChange={(e) => setEEmail(e.target.value)}
                      placeholder="Email ändern (optional)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="e-pass"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      id="e-pass"
                      type="password"
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
                      value={ePassword}
                      onChange={(e) => setEPassword(e.target.value)}
                      placeholder="Leer lassen, um Passwort zu behalten"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="e-role"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Rolle
                    </label>

                    {editUser.roles.length > 0 ? (
                      // ===== Schritt 1: Aktuelle Rolle anzeigen + Entfernen-Button =====
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
                        <p className="text-xs text-slate-600">
                          Aktuelle Rolle:
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          {/* Badge mit aktueller Rolle */}
                          <span className="inline-flex items-center rounded-full bg-[#e5ebf0] px-3 py-1 text-xs font-semibold text-[#264555]">
                            {editUser.roles[0].name}
                          </span>

                          {/* Button zum Entfernen der Rolle */}
                          <button
                            type="button"
                            onClick={onRemoveRole}
                            disabled={removingRole}
                            className="
            inline-flex items-center gap-1.5
            rounded-full border px-3 py-1.5
            text-xs font-semibold
            bg-[#fff1f1]
            border-red-200
            text-red-700
            hover:bg-[#ffe2e2]
            disabled:opacity-60 disabled:cursor-not-allowed
          "
                          >
                            <Trash2 size={12} />
                            {removingRole ? "Entferne…" : "Rolle entfernen"}
                          </button>
                        </div>

                        {removeRoleError && (
                          <p className="mt-1 text-xs text-red-700">
                            {removeRoleError}
                          </p>
                        )}

                        <p className="mt-1 text-[11px] text-slate-500">
                          Nachdem die Rolle entfernt wurde, kannst du unten eine neue Rolle auswählen.
                        </p>
                      </div>
                    ) : (
                      // ===== Schritt 2: Keine Rolle → Select anzeigen =====
                      <>
                        <select
                          id="e-role"
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
                          value={eRoleId}
                          onChange={(e) => setERoleId(e.target.value)}
                          disabled={updating}
                        >
                          <option value="">-- Bitte wählen --</option>
                          {availableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>

                        {rolesLoadError && (
                          <p className="text-xs text-red-600 mt-1">
                            {rolesLoadError}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                </form>
              </div>
            </div>

            {/* kleiner Abstand wie beim ConfirmModal */}
            <div className="h-3" />

            {/* Button-Leiste – gleicher Style wie ConfirmModal */}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
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
                form="edit-user-form"
                disabled={updating}
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

    </AdminLayout>
  );
}
