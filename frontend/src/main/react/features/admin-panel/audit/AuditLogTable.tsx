import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/shared/app/AdminLayout";
import { apiClient } from "@/shared/service/api/client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { WithPermissionCheck } from "@/shared/components/WithPermissionCheck";

type OutcomeKey = "success" | "error";

type AuditRow = {
  id: string;
  ts: string; // ISO
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;
  outcome: OutcomeKey;
  details?: string;
};

type SortKey = "ts" | "actor" | "action" | "outcome";

/* == Tokens wie bei CompanyList == */
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

const OUTCOME_OPTIONS: { value: "all" | OutcomeKey; label: string }[] = [
  { value: "all", label: "All Outcomes" },
  { value: "success", label: "success" },
  { value: "error", label: "error" },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE");
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function AuditPage() {
  const [data, setData] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [q, setQ] = useState("");
  const [action, setAction] = useState<"all" | string>("all");
  const [outcome, setOutcome] = useState<"all" | OutcomeKey>("all");

  const [sortKey, setSortKey] = useState<SortKey>("ts");
  const [asc, setAsc] = useState(false);

  // Pagination (wie CompanyList)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<AuditRow[]>("/audit-logs");
        if (!alive) return;
        setData(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err: any) {
        if (!alive) return;
        const e =
          err instanceof Error ? err : new Error(err?.message ?? String(err));
        // Wenn du 403 speziell texten willst, könntest du hier e.message setzen.
        setError(e);
        setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Actions Dropdown
  const actionOptions = useMemo(() => {
    const actions = [...new Set(data.map((r) => r.action))].filter(Boolean);
    return [
      { value: "all", label: "All Actions" },
      ...actions.map((a) => ({ value: a, label: a })),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    let rows = data.filter((r) => {
      const matchesSearch =
        term.length === 0 ||
        r.actorName.toLowerCase().includes(term) ||
        r.actorEmail.toLowerCase().includes(term) ||
        r.action.toLowerCase().includes(term) ||
        r.resource.toLowerCase().includes(term) ||
        (r.details ?? "").toLowerCase().includes(term);

      const matchesAction = action === "all" || r.action === action;
      const matchesOutcome = outcome === "all" || r.outcome === outcome;

      return matchesSearch && matchesAction && matchesOutcome;
    });

    rows.sort((a, b) => {
      const dir = asc ? 1 : -1;
      const val = (r: AuditRow): number | string => {
        switch (sortKey) {
          case "ts":
            return new Date(r.ts).getTime();
          case "actor":
            return (r.actorName ?? "").toLowerCase();
          case "action":
            return r.action ?? "";
          case "outcome":
            return r.outcome ?? "";
        }
      };
      const av = val(a);
      const bv = val(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return rows;
  }, [q, action, outcome, sortKey, asc, data]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(key === "ts" ? false : true);
    }
  };

  const clearFilters = () => {
    setQ("");
    setAction("all");
    setOutcome("all");
  };

  // Pagination calc
  useEffect(() => setPage(1), [q, action, outcome, sortKey, asc, pageSize, data]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <AdminLayout>
      {/*  Hero  */}
      <PageHeader
        title="Audit Logs"
        subtitle="Überwache System-Aktivitäten und Nutzeraktionen"
        icon={<ShieldCheck size={40} />}
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
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/*  Breadcrumb Pill  */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
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
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",
                  color: BRAND.navy,
                }}
              >
                <ShieldCheck size={14} />
              </span>

              <Link
                to="/admin/adminPanel"
                className="hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                Admin Panel
              </Link>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Audit Logs
              </span>
            </div>
          </nav>
          <div />
        </div>

        {/*  Controls Card (Search + Filters + Count)  */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.gray }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Search logs by action, actor, resource…"
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
                  borderColor: BRAND.sand,
                  color: CSS.fg,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = BRAND.gold;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = BRAND.sand;
                }}
              />
            </div>

            {/* Filter-Selects + Button */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="h-10 md:h-11 rounded-full border bg-white px-3 pr-8 text-sm font-medium outline-none appearance-none shadow-sm"
                style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                aria-label="Filter by action"
              >
                {actionOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                className="h-10 md:h-11 rounded-full border bg-white px-3 pr-8 text-sm font-medium outline-none appearance-none shadow-sm"
                style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                aria-label="Filter by outcome"
              >
                {OUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex items-center gap-2
                  h-10 md:h-11
                  rounded-full border
                  px-4
                  text-sm font-semibold
                  transition
                  hover:bg-[#fff9ec]
                "
                style={{ borderColor: BRAND.sand, color: BRAND.navy, background: "#fff" }}
              >
                <Filter size={16} />
                Clear Filters
              </button>

              {/* Count Badge rechts */}
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: BRAND.navy,
                  color: "white",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                <span>
                  Zeige <span className="font-semibold">{filtered.length}</span> Logs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*  Tabelle Card  */}
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead
                  className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                  style={{
                    background: "linear-gradient(to right, #ebebec, #ffffff)",
                    borderBottom: "2px solid #d2c9b9",
                    color: "#264555",
                  }}
                >
                  <tr>
                    {[
                      { k: "ts", label: "Timestamp" },
                      { k: "actor", label: "Actor" },
                      { k: "action", label: "Action" },
                      { k: null, label: "Resource" },
                      { k: "outcome", label: "Outcome" },
                      { k: null, label: "Details" },
                    ].map((col, idx) => (
                      <th key={idx} className="px-4 py-3 text-[0.85rem] font-semibold" style={{ color: CSS.fg }}>
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
                  {!loading && pageData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 bg-white">
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                            style={{ color: "hsla(200,32%,22%,0.65)" }}
                          >
                            <Search size={20} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold" style={{ color: CSS.fg }}>
                              {q.trim() || action !== "all" || outcome !== "all"
                                ? "Keine Treffer für deine Filter"
                                : "Noch keine Audit Logs vorhanden"}
                            </p>
                            <p className="text-xs text-slate-500 max-w-md">
                              {q.trim() || action !== "all" || outcome !== "all"
                                ? "Passe Suche/Filter an oder setze sie zurück."
                                : "Sobald Aktionen im System passieren, erscheinen sie hier."}
                            </p>
                          </div>

                          {(q.trim() || action !== "all" || outcome !== "all") && (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                              style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                            >
                              Filter zurücksetzen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((row) => (
                      <tr
                        key={row.id}
                        className="
                          bg-white
                          transition
                          border-l-[4px] border-transparent
                          hover:border-[#E3BB62]
                          hover:bg-[#fff9ec]
                          hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                        "
                      >
                        {/* Timestamp */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="font-semibold" style={{ color: CSS.fg }}>
                            {fmtDate(row.ts)}
                          </div>
                          <div className="text-xs" style={{ color: CSS.mutedFg }}>
                            {fmtTime(row.ts)}
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <div className="font-semibold" style={{ color: CSS.fg }}>
                            {row.actorName}
                          </div>
                          <div className="text-xs" style={{ color: CSS.mutedFg }}>
                            {row.actorEmail}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span
                            className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                            style={{
                              background: CSS.muted,
                              color: CSS.mutedFg,
                            }}
                            title={row.action}
                          >
                            {row.action}
                          </span>
                        </td>

                        {/* Resource */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span className="text-sm font-mono" style={{ color: CSS.mutedFg }}>
                            {row.resource}
                          </span>
                        </td>

                        {/* Outcome */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span
                            className={
                              row.outcome === "success"
                                ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                                : "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                            }
                          >
                            {row.outcome}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span className="text-sm" style={{ color: CSS.mutedFg }}>
                            {row.details || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </WithPermissionCheck>

        {/*  Pagination */}
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
            <div className="text-xs sm:text-sm" style={{ color: BRAND.gray }}>
              Zeige{" "}
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {startIdx}
              </span>
              –{" "}
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {endIdx}
              </span>{" "}
              von{" "}
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {total}
              </span>{" "}
              Einträgen
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm" style={{ color: BRAND.gray }}>
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
                    style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
                    style={{ color: "#b0b0b0" }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold"
                style={{ background: BRAND.navy, color: "white" }}
              >
                Seite {page} von {totalPages}
              </span>

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
                      borderColor: BRAND.sand,
                      color: BRAND.navy,
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      if (!btn.disabled) {
                        e.currentTarget.style.background = "#fff9ec";
                        e.currentTarget.style.borderColor = BRAND.gold;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = BRAND.sand;
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
    </AdminLayout>
  );
}
