import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { Building2, Search, ArrowUpDown, BarChart3 } from "lucide-react";
import { getCompanies, getWorkersByCompany, type CompanyApi, getCompanyOverallScore } from "@/features/service/companyService";

/*  Types  */

interface Company {
  id: string;
  name: string;
  employees: number;
  date: string;
  overall?: number | null;
}

type SortKey = "id" | "name" | "employees" | "date" | "overall";
/*  Tokens */
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

const formatDate = (val: string) => {
  if (!val) return "–";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString("de-DE");
};

const scoreTone = (score: number) => {
  if (score >= 80) return "good";
  if (score >= 70) return "mid";
  return "crit";
};

export default function CompanyListPage() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [q, setQ] = useState("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const apiCompanies: CompanyApi[] = await getCompanies();
        if (!alive) return;

        // Wenn API leer -> fallback Mock
        if (!apiCompanies || apiCompanies.length === 0) {
          setCompanies([
            { id: "1", name: "TechCorp GmbH", employees: 250, date: "2025-03-15" },
            { id: "2", name: "MedHealth AG", employees: 150, date: "2025-03-18" },
            { id: "3", name: "FinServ Bank", employees: 500, date: "2025-03-20" },
          ]);
          return;
        }

        // Mitarbeiterzahl pro Company holen
        const mapped: Company[] = await Promise.all(
          apiCompanies.map(async (c) => {
    const [sRes, wRes] = await Promise.allSettled([
      getCompanyOverallScore(c.id),
      getWorkersByCompany(c.id),
    ]);

    // Basis: echte Worker-Liste
    const workers =
      wRes.status === "fulfilled" && Array.isArray(wRes.value) ? wRes.value : [];
    let employees = workers.length;

    // Optional: Score aus Scoring
    let overall: number | null = null;

    if (sRes.status === "fulfilled") {
      const s = sRes.value;

      overall =
        typeof s?.averagePercentageScore === "number"
          ? Math.round(s.averagePercentageScore)
          : null;

      // Wenn Scoring eine sinnvolle Zahl liefert, nimm sie – sonst bleib bei workers.length
      if (typeof s?.totalWorkers === "number" && s.totalWorkers > 0) {
        employees = s.totalWorkers;
      }
    }

    return {
      id: c.id,
      name: c.name,
      employees,
      date: c.createdAt ?? c.updatedAt ?? "",
      overall,
    };
  })
        );



        if (!alive) return;
        setCompanies(mapped);
      } catch (e) {
        if (!alive) return;

        // API down -> fallback Mock
        setCompanies([
          { id: "1", name: "TechCorp GmbH", employees: 250, date: "2025-03-15" },
          { id: "2", name: "MedHealth AG", employees: 150, date: "2025-03-18" },
          { id: "3", name: "FinServ Bank", employees: 500, date: "2025-03-20" },
        ]);
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

    const base = companies.filter((c) => {
      if (!term) return true;
      return c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term);
    });

    base.sort((a, b) => {
      const dir = asc ? 1 : -1;

      const va = (() => {
        switch (sortKey) {
          case "id":
            return a.id.toLowerCase();
          case "name":
            return a.name.toLowerCase();
          case "employees":
            return a.employees ?? 0;
          case "date": {
            const ta = new Date(a.date).getTime();
            return Number.isNaN(ta) ? 0 : ta;
          }
          case "overall":
            return a.overall ?? -1;
        }
      })();

      const vb = (() => {
        switch (sortKey) {
          case "id":
            return b.id.toLowerCase();
          case "name":
            return b.name.toLowerCase();
          case "employees":
            return b.employees ?? 0;
          case "date": {
            const tb = new Date(b.date).getTime();
            return Number.isNaN(tb) ? 0 : tb;
          }
          case "overall":
            return b.overall ?? -1;
        }
      })();

      if (va === vb) return 0;
      return va > vb ? dir : -dir;
    });

    return base;
  }, [companies, q, sortKey, asc]);


  const setSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  // KPIs
  const total = companies.length;
  const scored = companies.filter((c) => typeof c.overall === "number") as Array<Company & { overall: number }>;

  const avgScore =
    scored.length > 0 ? Math.round(scored.reduce((s, c) => s + c.overall, 0) / scored.length) : 0;

  const goodCount = scored.filter((c) => c.overall >= 80).length;
  const criticalCount = scored.filter((c) => c.overall < 70).length;


  // Pagination
  useEffect(() => setPage(1), [q, sortKey, asc, pageSize, companies]);
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const startIdx = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(totalFiltered, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openCompany = (companyId: string) => {
    navigate(`/app/result/${companyId}`);
  };

 if (loading) {
  return (
    <AdminLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-10">
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className="h-10 w-10 rounded-full border-[3px] animate-spin"
            style={{
              borderColor: "rgba(210,201,185,0.7)", // sand
              borderTopColor: BRAND.gold,          // gold akzent
            }}
            aria-label="Lädt"
          />
          <p className="text-sm" style={{ color: CSS.mutedFg }}>
            Laden…
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}


  return (
    <AdminLayout>
      {/* Hero */}
      <PageHeader
        title="Ergebnisanalyse"
        subtitle="Alle bewerteten Unternehmen im Überblick"
        icon={<BarChart3 size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/*  Top-Bar: Breadcrumb Pill  */}
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
                style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
              >
                <Building2 size={14} />
              </span>

              <Link to="/app" className="hover:underline" style={{ color: CSS.mutedFg }}>
                Dashboard
              </Link>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Company List
              </span>
            </div>
          </nav>

          {/* KPI Badge rechts */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold"
            style={{ background: BRAND.navy, color: "white" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
            Ø Score: {avgScore}
          </div>
        </div>

        {/*  KPI Cards i*/}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "Gesamt", value: total, tone: "navy" as const },
            { label: "Ø Score", value: avgScore, tone: "navy" as const },
            { label: "Gut (≥80)", value: goodCount, tone: "good" as const },
            { label: "Kritisch (<70)", value: criticalCount, tone: "crit" as const },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-[18px] border px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              style={{ background: "linear-gradient(to bottom, #ffffff, #f7f7f7)", borderColor: BRAND.sand }}
            >
              <p className="text-xs" style={{ color: CSS.mutedFg }}>
                {k.label}
              </p>
              <p
                className="text-2xl font-bold mt-0.5"
                style={{
                  color:
                    k.tone === "navy"
                      ? BRAND.navy
                      : k.tone === "good"
                        ? "rgb(22,101,52)"
                        : "rgb(153,27,27)",
                }}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/*  Suche + Branchen Filter   */}
        <div
          className="
    max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
    rounded-[18px] border
    px-4 py-3 md:px-5 md:py-4
    shadow-[0_10px_30px_rgba(0,0,0,0.06)]
  "
          style={{ background: "linear-gradient(to bottom, #ffffff, #f7f7f7)", borderColor: BRAND.sand }}
        >
          {/* Grid sorgt dafür, dass rechts immer fix bleibt */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">

              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND.gray }}>
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Unternehmen (Name oder ID)…"
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

            {/* Count Badge (immer rechts, gleiche Höhe wie Inputs) */}
            <div className="flex justify-start md:justify-end">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 h-10 md:h-11 text-xs md:text-sm font-medium whitespace-nowrap"
                style={{ background: BRAND.navy, color: "white" }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                <span>
                  Zeige <span className="font-semibold">{filtered.length}</span> Unternehmen
                </span>
              </div>
            </div>
          </div>

        </div>


        {/*  Tabelle Card (Fog/Sand/Gold/Navy)  */}
        <section
          className="
            max-w-[1400px] xl:max-w-[1600px]
            mx-auto
            rounded-[12px]
            border
            shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
            overflow-hidden
          "
          style={{ borderColor: CSS.border, background: BRAND.fog }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead
                className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                  color: BRAND.navy,
                }}
              >
                <tr>
                  {[
                    { k: "id", label: "Nr°" },
                    { k: "name", label: "Unternehmen" },
                    { k: "employees", label: "Mitarbeiter" },
                    { k: "overall", label: "Score" },
                    { k: "date", label: "Datum" },
                  ]
                    .map((col) => (
                      <th key={col.k} className="px-4 py-3 text-[0.85rem] font-semibold" style={{ color: CSS.fg }}>
                        <button
                          type="button"
                          onClick={() => setSort(col.k as SortKey)}
                          className="inline-flex items-center gap-2 hover:brightness-110"
                          style={{ color: "inherit" }}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown size={14} className="opacity-60" />
                        </button>
                      </th>
                    ))}

                </tr>
              </thead>

              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 bg-white">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                          style={{ color: "hsla(200,32%,22%,0.65)" }}
                        >
                          <Search size={20} />
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-semibold" style={{ color: CSS.fg }}>
                            {q.trim() ? "Keine Treffer" : "Noch keine Unternehmen vorhanden"}
                          </p>

                          <p className="text-xs text-slate-500 max-w-md">
                            {q.trim()
                              ? "Bitte passe den Suchbegriff an oder setze die Suche zurück."
                              : "Sobald Daten vorhanden sind, siehst du hier die komplette Übersicht."}
                          </p>
                        </div>

                        {q.trim() && (
                          <button
                            type="button"
                            onClick={() => setQ("")}
                            className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                            style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                          >
                            Suche zurücksetzen
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((c, idx) => {
                    const rowNo = (page - 1) * pageSize + idx + 1;

                    return (
                      <tr
                        key={c.id}
                        className="
        bg-white
        transition
        border-l-[4px] border-transparent
        hover:border-[#E3BB62]
        hover:bg-[#fff9ec]
        hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
        cursor-pointer
      "
                        onClick={() => openCompany(c.id)}
                      >
                        {/* Nr° */}
                        <td className="px-4 py-4 text-sm" style={{ borderBottom: `1px solid ${CSS.border}`, color: CSS.mutedFg }}>
                          {rowNo}
                        </td>

                        {/* Unternehmen */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCompany(c.id);
                            }}
                            className="font-semibold hover:underline"
                            style={{ color: BRAND.navy }}
                          >
                            {c.name}
                          </button>
                        </td>

                        {/* Mitarbeiter */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          <span
                            className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                            style={{ background: CSS.muted, color: CSS.mutedFg }}
                          >
                            {c.employees}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                          {typeof c.overall === "number" ? (
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold"
                              style={{
                                background:
                                  c.overall >= 80
                                    ? "rgb(220,252,231)"
                                    : c.overall >= 70
                                      ? "rgb(254,243,199)"
                                      : "rgb(254,226,226)",
                                color:
                                  c.overall >= 80
                                    ? "rgb(22,101,52)"
                                    : c.overall >= 70
                                      ? "rgb(146,64,14)"
                                      : "rgb(153,27,27)",
                              }}
                            >
                              {c.overall}%
                            </span>
                          ) : (
                            <span className="text-sm" style={{ color: CSS.mutedFg }}>–</span>
                          )}
                        </td>


                        {/* Datum */}
                        <td className="px-4 py-4 text-sm" style={{ borderBottom: `1px solid ${CSS.border}`, color: CSS.mutedFg }}>
                          {formatDate(c.date)}
                        </td>
                      </tr>
                    );
                  })

                )}
              </tbody>
            </table>
          </div>
        </section>

        {/*  Pagination   */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-3
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{ background: "linear-gradient(to bottom, #ffffff, #f7f7f7)", borderColor: BRAND.sand }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm" style={{ color: BRAND.gray }}>
              Zeige{" "}
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {startIdx}
              </span>
              –
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {endIdx}
              </span>{" "}
              von{" "}
              <span className="font-semibold" style={{ color: BRAND.navy }}>
                {totalFiltered}
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
                  { label: "«", onClick: () => setPage(1), disabled: page <= 1 || totalFiltered === 0 },
                  { label: "‹", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 || totalFiltered === 0 },
                  { label: "›", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages || totalFiltered === 0 },
                  { label: "»", onClick: () => setPage(totalPages), disabled: page >= totalPages || totalFiltered === 0 },
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
                    style={{ borderColor: BRAND.sand, color: BRAND.navy, background: "#ffffff" }}
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
