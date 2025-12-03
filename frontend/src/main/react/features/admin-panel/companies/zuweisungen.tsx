// src/features/admin-panel/companies/zuweisungen.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ArrowUpDown, Copy, Check, Link as LinkIcon, X } from "lucide-react";
import AdminLayout from "@/apps/app/AdminLayout";
import { listAssignments, type AssignmentApi } from "@/features/service/assignmentService";
import { Network } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

type SortKey = "worker" | "catalog" | "status" | "assignedAt" | "expiresAt" | "completedAt";

const CSS = {
    adminBg: "hsl(var(--admin-bg,0 0% 92%))",
    card: "hsl(var(--card,0 0% 98%))",
    border: "hsl(var(--border,30 15% 85%))",
    fg: "hsl(var(--foreground,205 35% 24%))",
    mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
    muted: "hsl(var(--muted,210 40% 97%))",
};

/* ===== Helper: Datum / Uhrzeit in zwei Zeilen ===== */

/* Prüft, ob die Fälligkeit schon vorbei ist */
const isExpired = (iso?: string | null) =>
    !!iso && new Date(iso).getTime() < Date.now();

const fmtParts = (d?: string | null) => {
    if (!d) return { date: "—", time: "" };
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return { date: d, time: "" };
    return {
        date: dt.toLocaleDateString("de-DE"),
        time: dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
};

//const clip = (s?: string | null, n = 60) => (!s ? "—" : s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

function Badge({ status }: { status?: string | null }) {
    const s = (status || "").toLowerCase();
    const cls =
        s === "completed"
            ? "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
            : s === "expired"
                ? "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                : "bg-[rgb(219,234,254)] text-[rgb(30,64,175)]";
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{status || "pending"}</span>;
}

export default function Zuweisungen() {
    const location = useLocation() as { state?: { assignments?: AssignmentApi[] } };
    const initial = location?.state?.assignments ?? [];

    const [rows, setRows] = useState<AssignmentApi[]>(initial);
    const [loading, setLoading] = useState(!initial.length);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("assignedAt");
    const [asc, setAsc] = useState(false);

    const [inviteFor, setInviteFor] = useState<AssignmentApi | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    function buildUserInviteUrl(a: AssignmentApi) {
        const token = a.accessToken || "";
        const APP_ORIGIN = window.location.origin;
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
        return () => {
            alive = false;
        };
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
                case "worker":
                    return (r.worker?.name || r.worker?.id || "").toLowerCase();
                case "catalog":
                    return (r.catalog?.title || r.catalog?.id || "").toLowerCase();
                case "status":
                    return (r.status || "").toLowerCase();
                case "assignedAt":
                    return r.assignedAt ? new Date(r.assignedAt).getTime() : 0;
                case "expiresAt":
                    return r.expiresAt ? new Date(r.expiresAt).getTime() : 0;
                case "completedAt":
                    return r.completedAt ? new Date(r.completedAt).getTime() : 0;
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
        else {
            setSortKey(k);
            setAsc(true);
        }
    };

    // Pagination: Seite & Seitengröße (anpassbar)
    const [page, setPage] = useState(1);
    const pageSize = 6; // oder 6, wenn du exakt wie im Screenshot willst

    // Wenn sich die Filterliste ändert, zurück auf Seite 1
    useEffect(() => { setPage(1); }, [q, sortKey, asc, rows]);

    // Ableitungen
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIdx = Math.min(total, page * pageSize);
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Seite einklemmen, falls Filter/Sort die Seitenanzahl reduzieren
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);


    return (
        <AdminLayout>
            {/* Kopfbereich (unverändert außer Breite) */}
              {/* HEADER */}
            <PageHeader
      
              title=" Zuweisungen Administration"
              subtitle="Alle Katalog-Zuweisungen an Kunden verwalten"
              icon={<Network size={40} />}
              gradient="navy"
              height="280px"
              showPattern={true}
      
            />

            <main className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6" style={{ background: CSS.adminBg }}>
                <nav className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 flex items-center gap-2 text-[0.9rem]" style={{ color: CSS.mutedFg }}>
                    <Link to="/admin/adminPanel" className="hover:underline" style={{ color: CSS.mutedFg }}>
                        Admin Panel
                    </Link>
                    <span className="opacity-60">›</span>
                    <span className="font-semibold" style={{ color: CSS.fg }}>
                        Zuweisungen
                    </span>
                </nav>

                {/* Suche + Count */}
                <div
                    className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 rounded-[12px] border bg-white/85 [backdrop-filter:saturate(1.2)_blur(4px)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    style={{ borderColor: CSS.border }}
                >
                    <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 md:gap-4">
                        <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: CSS.mutedFg }}>
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                placeholder="Suche (Worker, Katalog, Status, Code, Token)…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full h-10 md:h-11 rounded-md border pl-10 pr-3 text-sm outline-none transition focus:ring-2"
                                style={{ borderColor: CSS.border, background: CSS.card, color: CSS.fg, boxShadow: "0 0 #0000" }}
                            />
                        </div>
                        <div className="inline-block text-sm font-medium px-3 md:px-4 py-2 rounded-lg border" style={{ background: CSS.card, color: CSS.mutedFg, borderColor: CSS.border }}>
                            Zeige <span className="font-semibold" style={{ color: CSS.fg }}>{filtered.length}</span> Zuweisungen
                        </div>
                    </div>
                </div>

                {/* Tabelle */}
                <section className="max-w-[1400px] xl:max-w-[1600px] mx-auto rounded-[12px] border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ borderColor: CSS.border }}>
                    <div className="overflow-x-auto md:overflow-x-visible rounded-[12px]" style={{ scrollbarGutter: "stable both-edges" as any }}>
                        <table className="w-full border-collapse bg-[hsl(0,0%,100%)]">
                            {/* Optional: kompakte Spaltenbreiten (passt zum Screenshot) */}
                            <colgroup>
                                <col style={{ width: "22%" }} />
                                <col style={{ width: "22%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "16%" }} />
                                <col style={{ width: "16%" }} />
                                <col style={{ width: "24%" }} />
                                <col style={{ width: "10%" }} />
                            </colgroup>

                            <thead className="bg-[hsla(200,32%,22%,0.05)]" style={{ borderBottom: "2px solid hsla(200,32%,22%,0.1)" }}>
                                <tr>
                                    {[
                                        { k: "worker", label: "Worker" },
                                        { k: "catalog", label: "Catalog" },
                                        { k: "status", label: "Status" },
                                        { k: "assignedAt", label: "Zugewiesen am" },
                                        { k: "expiresAt", label: "Fällig am" },
                                        { k: null, label: "Aktion" },
                                    ].map((col, i) => (
                                        <th key={i} className="text-left text-[0.85rem] font-semibold px-4 py-3" style={{ color: CSS.fg }}>
                                            {col.k ? (
                                                <button type="button" onClick={() => setSort(col.k as SortKey)} className="inline-flex items-center gap-2 hover:brightness-110" style={{ color: "inherit" }}>
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
                                    <tr><td className="px-4 py-4 text-sm" style={{ color: CSS.mutedFg }}>Lade Zuweisungen…</td></tr>
                                ) : error ? (
                                    <tr><td><pre className="px-4 py-4 text-xs whitespace-pre-wrap text-red-700 bg-red-50 border-t border-red-200">{error}</pre></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td className="px-4 py-4 text-sm" style={{ color: CSS.mutedFg }}>Keine Einträge gefunden.</td></tr>
                                ) : (
                                    pageData.map((r) => {
                                        const wName = r.worker?.name || "—";
                                        const companyName = r.company?.name || "—";
                                        //const wId = r.worker?.id || "—";
                                        const cTitle = r.catalog?.title || "—";
                                       // const cId = r.catalog?.id || "—";
                                        const { date: aDate, time: aTime } = fmtParts(r.assignedAt);
                                        const { date: eDate, time: eTime } = fmtParts(r.expiresAt);
                                        const expired = isExpired(r.expiresAt);

                                        return (
                                            <tr key={r.id} className={`transition border-l-[4px] ${expired
                                                    ? "border-[rgb(239,68,68)] bg-[rgba(254,226,226,0.3)]" // rot markiert
                                                    : "border-transparent hover:bg-[hsla(40,60%,63%,0.05)] hover:border-[hsl(40,60%,63%)]"
                                                }`}>
                                                {/* Worker */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-top" style={{ borderColor: CSS.border }}>
                                                    <div className="font-semibold" style={{ color: CSS.fg }}>{wName}</div>
                                                    <div className="mt-1 inline-block rounded text-[0.75rem]" style={{ color: CSS.mutedFg, background: "hsla(40,15%,92%,0.5)" }}>
                                                        <span className="px-2 py-1 font-mono">{companyName}</span>
                                                    </div>
                                                </td>

                                                {/* Catalog */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-top" style={{ borderColor: CSS.border }}>
                                                    <div className="font-semibold" style={{ color: CSS.fg }}>{cTitle}</div>
                                                    <div className="mt-1 inline-block rounded text-[0.75rem]" style={{ color: CSS.mutedFg, background: "hsla(40,15%,92%,0.5)" }}>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-middle" style={{ borderColor: CSS.border }}>
                                                    <Badge status={r.status} />
                                                </td>

                                                {/* Zugewiesen am → Datum + Uhrzeit untereinander */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-middle whitespace-nowrap" style={{ borderColor: CSS.border }}>
                                                    <div style={{ color: CSS.fg }}>{aDate}</div>
                                                    <div className="text-[15px] opacity-70" style={{ color: CSS.mutedFg }}>{aTime}</div>
                                                </td>

                                                {/* Fällig am → Datum + Uhrzeit untereinander */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-middle whitespace-nowrap" style={{ borderColor: CSS.border }}>
                                                    <div style={{ color: CSS.fg }}>{eDate}</div>
                                                    <div className="text-[15px] opacity-70" style={{ color: CSS.mutedFg }}>{eTime}</div>
                                                </td>

                                                {/* Aktion */}
                                                <td className="px-4 py-4 text-[0.95rem] border-t align-middle" style={{ borderColor: CSS.border }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setInviteFor(r); setCopiedLink(false); setCopiedCode(false); }}
                                                        className="inline-flex items-center gap-2 rounded-lg font-semibold px-3 py-2 transition shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:[box-shadow:0_4px_8px_rgba(0,0,0,0.15)]"
                                                        style={{ background: "hsl(40,60%,63%)", color: "hsl(200,32%,22%)", borderColor: CSS.border }}
                                                        title="Einlade-Link erzeugen"
                                                    >
                                                        <LinkIcon size={14} />
                                                        <span className="hidden sm:inline">Einladen</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {/* Externer Pagination-Container (NEU, außerhalb der Tabelle) */}
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
                                aria-label="Zurück"
                            >
                                Zurück
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || total === 0}
                                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsla(40,60%,63%,0.08)]"
                                style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                                aria-label="Weiter"
                            >
                                Weiter
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Invite Modal (unverändert) */}
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

                        <div className="space-y-1 mb-4 text-sm" style={{ color: CSS.mutedFg }}>
                            <div>
                                <span className="font-semibold" style={{ color: CSS.fg }}>
                                    {inviteFor.worker?.name || inviteFor.worker?.id || "Worker"}
                                </span>{" "}
                                · {inviteFor.catalog?.title || inviteFor.catalog?.id || "Katalog"}
                            </div>
                            {inviteFor.company?.name && <div>Firma: {inviteFor.company.name}</div>}
                            {inviteFor.expiresAt && <div>Gültig bis: {new Date(inviteFor.expiresAt).toLocaleString("de-DE")}</div>}
                        </div>

                        <label className="block text-sm font-medium mb-1">Link</label>
                        <div className="flex items-center gap-2 mb-3">
                            <input readOnly value={buildUserInviteUrl(inviteFor)} className="flex-1 rounded-md border px-3 py-2 text-sm" style={{ borderColor: CSS.border, color: CSS.fg, background: CSS.card }} />
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

                        {inviteFor.accessCode && (
                            <>
                                <label className="block text-sm font-medium mb-1">Access-Code</label>
                                <div className="flex items-center gap-2">
                                    <input readOnly value={inviteFor.accessCode} className="flex-1 rounded-md border px-3 py-2 text-sm" style={{ borderColor: CSS.border, color: CSS.fg, background: CSS.card }} />
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
        </AdminLayout>
    );
}
