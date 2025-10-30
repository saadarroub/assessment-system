// src/features/admin-panel/companies/zuweisungen.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ArrowUpDown, Copy, Check, Link as LinkIcon, X } from "lucide-react";
import AdminPanelHeader from "@/apps/app/adminPanelHeader";
import { listAssignments, type AssignmentApi } from "@/features/service/assignmentService";

type SortKey = "worker" | "catalog" | "status" | "assignedAt" | "expiresAt" | "completedAt";

const CSS = {
    adminBg: "hsl(var(--admin-bg,0 0% 92%))",
    card: "hsl(var(--card,0 0% 98%))",
    border: "hsl(var(--border,30 15% 85%))",
    fg: "hsl(var(--foreground,205 35% 24%))",
    mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
    muted: "hsl(var(--muted,210 40% 97%))",
};

const fmt = (d?: string | null) => {
    if (!d) return "—";
    const dt = new Date(d);               // 'YYYY-MM-DDTHH:mm:ss' wird als lokal geparst – ok
    return isNaN(dt.getTime()) ? d : dt.toLocaleString("de-DE");
};

const clip = (s?: string | null, n = 60) => {
    if (!s) return "—";
    return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
};

function Badge({ status }: { status?: string | null }) {
    const s = (status || "").toLowerCase();
    const cls =
        s === "completed"
            ? "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
            : s === "expired"
                ? "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                : "bg-[rgb(219,234,254)] text-[rgb(30,64,175)]";
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>
            {status || "pending"}
        </span>
    );
}

export default function Zuweisungen() {
    const navigate = useNavigate();
    const location = useLocation() as { state?: { assignments?: AssignmentApi[] } };
    const initial = location?.state?.assignments ?? [];

    const [rows, setRows] = useState<AssignmentApi[]>(initial);
    const [loading, setLoading] = useState(!initial.length);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("assignedAt");
    const [asc, setAsc] = useState(false);

    // Invite-Dialog
    const [inviteFor, setInviteFor] = useState<AssignmentApi | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Basis-URL für den öffentlichen Zugriff (z. B. Backend-Route /public/access/{token})
    const PUBLIC_INVITE_BASE =
        import.meta.env.VITE_PUBLIC_INVITE_BASE ?? "http://localhost:8080/public/access";
     //Zum Testen   
    function buildAdminMetaUrl(a: AssignmentApi) {
        const token = a.accessToken || "";
        return `${PUBLIC_INVITE_BASE}/${token}/meta`;
    }

    function buildUserInviteUrl(a: AssignmentApi) {
        const token = a.accessToken || "";
        const APP_ORIGIN = window.location.origin; // z.B. http://localhost:5173
        return `${APP_ORIGIN}/invite/${token}`;
    }

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await listAssignments();
                if (alive) setRows(Array.isArray(data) ? data : []);
            } catch (e: any) {
                if (alive) setError(e?.message ?? String(e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();

        const base = term
            ? rows.filter((r) => {
                const pool = [
                    r.worker?.name,
                    r.worker?.id,
                    r.catalog?.title,
                    r.catalog?.id,
                    r.company?.name,
                    r.status,
                    r.accessCode,
                    r.accessToken,
                    r.notes,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return pool.includes(term);
            })
            : rows.slice();

        const val = (r: AssignmentApi) => {
            switch (sortKey) {
                case "worker": return (r.worker?.name || r.worker?.id || "").toLowerCase();
                case "catalog": return (r.catalog?.title || r.catalog?.id || "").toLowerCase();
                case "status": return (r.status || "").toLowerCase();
                case "assignedAt": return r.assignedAt ? new Date(r.assignedAt).getTime() : 0;
                case "expiresAt": return r.expiresAt ? new Date(r.expiresAt).getTime() : 0;
                case "completedAt": return r.completedAt ? new Date(r.completedAt).getTime() : 0;
            }
        };

        base.sort((a, b) => {
            const av = val(a) as any;
            const bv = val(b) as any;
            if (av === bv) return 0;
            return av > bv ? (asc ? 1 : -1) : asc ? -1 : 1;
        });

        return base;
    }, [rows, q, sortKey, asc]);

    const setSort = (k: SortKey) => {
        if (k === sortKey) setAsc((v) => !v);
        else { setSortKey(k); setAsc(true); }
    };

    return (
        <AdminPanelHeader>
            {/* Header */}
            <header className="w-full border-b bg-white/90 [backdrop-filter:saturate(1.4)_blur(6px)]" style={{ borderColor: CSS.adminBg }}>
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="h-[84px] grid place-items-center text-center">
                        <div>
                            <h1 className="m-0 text-[36px] font-extrabold tracking-[-0.01em]" style={{ color: CSS.fg }}>
                                Zuweisungen
                            </h1>
                            <p className="m-0 mt-2 text-[15px] font-semibold" style={{ color: CSS.mutedFg }}>
                                Alle Katalog-Zuweisungen an Worker.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-6 pt-6 pb-8" style={{ background: CSS.adminBg }}>
                <nav className="max-w-[1200px] mx-auto mb-4 flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
                    <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
                        Admin Panel
                    </Link>
                    <span className="opacity-60">›</span>
                    <span className="font-semibold" style={{ color: CSS.fg }}>Zuweisungen</span>
                </nav>

                <section
                    className="max-w-[1200px] mx-auto rounded-[10px] border shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]"
                    style={{ background: CSS.card, borderColor: CSS.border }}
                >
                    {/* Controls */}
                    <div className="flex flex-col gap-4 p-6 border-b" style={{ borderColor: CSS.border }}>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="relative max-w-[24rem] flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }}>
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Suche (Worker, Katalog, Status, Code, Token, Notiz)…"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 pl-10 text-sm outline-none focus:ring-2"
                                    style={{ borderColor: CSS.border, background: CSS.card, color: CSS.fg, boxShadow: "0 0 #0000" }}
                                />
                            </div>
                            <div className="text-sm" style={{ color: CSS.mutedFg }}>
                                {loading ? "Laden…" : error ? `Fehler: ${error}` : `Zeige ${filtered.length} Zuweisungen`}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="px-6 py-6 text-sm" style={{ color: CSS.mutedFg }}>Lade Zuweisungen…</div>
                        ) : error ? (
                            <pre className="px-6 py-6 text-xs whitespace-pre-wrap text-red-700 bg-red-50 border-t border-red-200">
                                {error}
                            </pre>
                        ) : filtered.length === 0 ? (
                            <div className="px-6 py-6 text-sm" style={{ color: CSS.mutedFg }}>Keine Einträge gefunden.</div>
                        ) : (
                            <table className="w-full border-collapse" style={{ background: CSS.card }}>
                                <thead>
                                    <tr>
                                        {[
                                            { k: "worker", label: "Worker" },
                                            { k: "catalog", label: "Catalog" },
                                            { k: "status", label: "Status" },
                                            { k: "assignedAt", label: "Zugewiesen am" },
                                            { k: "expiresAt", label: "Fällig am" },
                                            { k: null, label: "Notiz" },
                                            { k: null, label: "Aktion" }
                                        ].map((col, i) => (
                                            <th
                                                key={i}
                                                className="text-left px-4 py-3 text-[0.875rem] font-semibold border-b"
                                                style={{ background: CSS.muted, color: CSS.mutedFg, borderColor: CSS.border }}
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
                                    {filtered.map((r) => {
                                        const wName = r.worker?.name || "—";
                                        const wId = r.worker?.id || "—";
                                        const cTitle = r.catalog?.title || "—";
                                        const cId = r.catalog?.id || "—";
                                        const note = r.notes || "";
                                        return (
                                            <tr
                                                key={r.id}
                                                className="hover:bg-[hsl(var(--muted)/.5)] cursor-pointer" // onClick={() => navigate(`/admin/adminPanel/zuweisungen/${r.id}`, { state: { assignment: r } })
                                            >
                                                <td className="px-4 py-3" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                                    <div className="font-semibold" style={{ color: CSS.fg }}>{wName}</div>
                                                    <div className="text-xs" style={{ color: CSS.mutedFg }}>{wId}</div>
                                                </td>

                                                <td className="px-4 py-3" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                                    <div className="font-semibold" style={{ color: CSS.fg }}>{cTitle}</div>
                                                    <div className="text-xs" style={{ color: CSS.mutedFg }}>{cId}</div>
                                                </td>

                                                <td className="px-4 py-3" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                                    <Badge status={r.status} />
                                                </td>

                                                <td className="px-4 py-3 text-[0.9rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                                                    {fmt(r.assignedAt)}
                                                </td>

                                                <td className="px-4 py-3 text-[0.9rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                                                    {fmt(r.expiresAt)}
                                                </td>
                                                <td className="px-4 py-3 text-[0.9rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }} title={note}>
                                                    {clip(note, 56)}
                                                </td>
                                                <td className="px-4 py-3" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setInviteFor(r); setCopiedLink(false); setCopiedCode(false); }}
                                                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                                                        style={{ borderColor: CSS.border, color: CSS.fg }}
                                                        title="Einlade-Link erzeugen"
                                                    >
                                                        <LinkIcon size={14} />
                                                        Einladen
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>
            {inviteFor && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) setInviteFor(null); }}
                >
                    <div className="w-[min(560px,92vw)] rounded-xl bg-white shadow-2xl p-5 relative">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold">Einlade-Link</h3>
                            <button
                                type="button"
                                onClick={() => setInviteFor(null)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-slate-50"
                                style={{ borderColor: CSS.border }}
                                aria-label="Schließen"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Kontext */}
                        <div className="space-y-1 mb-4 text-sm" style={{ color: CSS.mutedFg }}>
                            <div>
                                <span className="font-semibold" style={{ color: CSS.fg }}>
                                    {inviteFor.worker?.name || inviteFor.worker?.id || "Worker"}
                                </span>{" "}
                                · {inviteFor.catalog?.title || inviteFor.catalog?.id || "Katalog"}
                            </div>
                            {inviteFor.company?.name && (
                                <div>Firma: {inviteFor.company.name}</div>
                            )}
                            {inviteFor.expiresAt && (
                                <div>Gültig bis: {new Date(inviteFor.expiresAt).toLocaleString("de-DE")}</div>
                            )}
                        </div>

                        {/* Link-Zeile */}
                        <label className="block text-sm font-medium mb-1">Link</label>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                readOnly
                                value={buildUserInviteUrl(inviteFor)}
                                className="flex-1 rounded-md border px-3 py-2 text-sm"
                                style={{ borderColor: CSS.border, color: CSS.fg, background: CSS.card }}
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(buildUserInviteUrl(inviteFor));
                                        setCopiedLink(true);
                                        setTimeout(() => setCopiedLink(false), 1200);
                                    } catch { }
                                }}
                                className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs hover:bg-slate-50"
                                style={{ borderColor: CSS.border }}
                                title="Link kopieren"
                            >
                                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                                Kopieren
                            </button>
                        </div>

                        {/* Optional: Access Code (falls vorhanden / benötigt) */}
                        {inviteFor.accessCode && (
                            <>
                                <label className="block text-sm font-medium mb-1">Access-Code</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        value={inviteFor.accessCode}
                                        className="flex-1 rounded-md border px-3 py-2 text-sm"
                                        style={{ borderColor: CSS.border, color: CSS.fg, background: CSS.card }}
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(inviteFor.accessCode || "");
                                                setCopiedCode(true);
                                                setTimeout(() => setCopiedCode(false), 1200);
                                            } catch { }
                                        }}
                                        className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs hover:bg-slate-50"
                                        style={{ borderColor: CSS.border }}
                                        title="Code kopieren"
                                    >
                                        {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                                        Kopieren
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                type="button"
                                onClick={() => setInviteFor(null)}
                                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                style={{ borderColor: CSS.border, color: CSS.fg }}
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminPanelHeader>
    );
}
