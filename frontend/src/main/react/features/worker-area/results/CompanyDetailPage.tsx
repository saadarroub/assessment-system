// src/main/react/features/worker-area/results/CompanyDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";

import { Search, ArrowLeft, Building2 } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { Network } from "lucide-react";

/* ================= Types ================= */

interface Participant {
  id: string;
  sessionId: string;
  name: string;
  position: string;
  department: string;
  completionDate: string;
  status: "completed" | "pending" | "in-progress";
}

interface CompanyOverall {
  companyId: string;
  companyName: string;
  averagePercentageScore: number;
  totalCompletedSessions: number;
  totalSessions: number;
  totalWorkers: number;
  totalCatalogs: number;
  catalogScores: any[];
}

/* ============== Tokens wie bei CompanyList ============== */
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

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "–";

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState<CompanyOverall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Suche in Teilnehmerliste
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);

        // Demo/Mock (wie in deiner Datei) — hier später echte API rein
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockCompany: CompanyOverall = {
          companyId: companyId || "C001",
          companyName: "TechCorp GmbH",
          averagePercentageScore: 75.5,
          totalCompletedSessions: 15,
          totalSessions: 20,
          totalWorkers: 25,
          totalCatalogs: 5,
          catalogScores: [],
        };

        const mockParticipants: Participant[] = [
          {
            id: "w1",
            sessionId: "sess_101",
            name: "Max Mustermann",
            position: "IT-Leiter",
            department: "IT",
            completionDate: "2025-03-15",
            status: "completed",
          },
          {
            id: "w2",
            sessionId: "sess_102",
            name: "Anna Schmidt",
            position: "CISO",
            department: "Security",
            completionDate: "2025-03-16",
            status: "completed",
          },
          {
            id: "w3",
            sessionId: "sess_103",
            name: "John Doe",
            position: "DevOps",
            department: "Engineering",
            completionDate: "2025-03-18",
            status: "in-progress",
          },
        ];

        setCompanyData(mockCompany);
        setParticipants(mockParticipants);
      } catch (e) {
        console.error(e);
        setCompanyData(null);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const filteredParticipants = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return participants;
    return participants.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.position.toLowerCase().includes(term) ||
        p.department.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
      );
    });
  }, [participants, q]);

  const completedCount = useMemo(
    () => participants.filter((p) => p.status === "completed").length,
    [participants]
  );

  const inProgressCount = useMemo(
    () => participants.filter((p) => p.status === "in-progress").length,
    [participants]
  );

  const pendingCount = useMemo(
    () => participants.filter((p) => p.status === "pending").length,
    [participants]
  );

  const handleAnalyzeWorker = (id: string) => {
    navigate(`/app/employee/${id}`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 text-center" style={{ color: CSS.mutedFg }}>
          Laden…
        </div>
      </AdminLayout>
    );
  }

  if (!companyData) {
    return (
      <AdminLayout>
        <div className="p-10 text-center" style={{ color: CSS.mutedFg }}>
          Unternehmen nicht gefunden
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* ===== Hero wie CompanyList ===== */}
      <PageHeader
        title={companyData.companyName}
        subtitle="Übersicht & Mitarbeiter"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/* ===== Außenbereich unter dem Hero (gleiches BG) ===== */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/* ===== Top-Bar: Breadcrumb als Pill + Back Button rechts ===== */}
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
                <Building2 size={14} />
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

              <Link
                to="/admin/adminPanel/companies"
                className="hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                Firmen
              </Link>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
              </span>

              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Details
              </span>
            </div>
          </nav>

          {/* Back Button – gleicher Pill-Style wie View Button */}
          <button
            type="button"
            onClick={() => navigate("/app/result/:companyId")}
            className="
              inline-flex items-center gap-2
              rounded-full
              px-5 py-2.5
              text-sm font-semibold
              shadow-[0_6px_18px_rgba(0,0,0,0.16)]
              focus:outline-none
              transition
              hover:-translate-y-[1px]
              hover:brightness-105
            "
            style={{
              background: "hsl(40,60%,63%)",
              color: "hsl(200,32%,22%)",
              border: "1px solid rgba(255,255,255,0.9)",
            }}
            aria-label="Zurück zur Firmenliste"
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
        </div>

        {/* ===== KPI Cards (optisch wie deine Cards, aber in CompanyList-Farbwelt) ===== */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {[
            {
              label: "Durchschnittsscore",
              value: `${companyData.averagePercentageScore}%`,
              accent: BRAND.gold,
            },
            {
              label: "Teilnehmer",
              value: String(participants.length),
              accent: BRAND.steel,
            },
            {
              label: "Abgeschlossen",
              value: String(completedCount),
              accent: "rgb(34,197,94)",
            },
            {
              label: "In Bearbeitung",
              value: String(inProgressCount + pendingCount),
              accent: "rgb(234,179,8)",
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className="
                rounded-[18px] border
                px-5 py-4
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: BRAND.sand }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: CSS.mutedFg }}>
                  {kpi.label}
                </p>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: kpi.accent }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-2xl font-bold" style={{ color: CSS.fg }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* ===== Suche + Count – exakt wie CompanyList ===== */}
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
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.gray }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche Teilnehmer (Name, Position, Abteilung, Status)…"
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

            <div className="flex items-center gap-3">
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
                  Zeige{" "}
                  <span className="font-semibold">{filteredParticipants.length}</span>{" "}
                  Teilnehmer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Tabelle – exakt wie CompanyList Card ===== */}
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
                    { label: "Name", align: "text-left" },
                    { label: "Position", align: "text-left" },
                    { label: "Abteilung", align: "text-left" },
                    { label: "Status", align: "text-left" },
                    { label: "Abschluss", align: "text-left" },
                    { label: "Aktion", align: "text-center" },
                  ].map((col, idx) => (
                    <th
                      key={idx}
                      className={`px-4 py-3 text-[0.85rem] font-semibold ${col.align}`}
                      style={{ color: CSS.fg }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.length === 0 ? (
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
                            {q.trim() ? "Keine Treffer für deine Suche" : "Keine Teilnehmer vorhanden"}
                          </p>
                          <p className="text-xs text-slate-500 max-w-md">
                            {q.trim()
                              ? "Bitte passe den Suchbegriff an oder setze den Filter zurück."
                              : "Sobald Sessions vorhanden sind, erscheinen hier die Teilnehmer."}
                          </p>
                        </div>

                        {q.trim() && (
                          <button
                            type="button"
                            onClick={() => setQ("")}
                            className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                            style={{
                              borderColor: CSS.border,
                              color: CSS.mutedFg,
                            }}
                          >
                            Filter zurücksetzen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr
                      key={p.id}
                      className="
                        bg-white
                        transition
                        border-l-[4px] border-transparent
                        hover:border-[#E3BB62]
                        hover:bg-[#fff9ec]
                        hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                      "
                    >
                      <td
                        className="px-4 py-4"
                        style={{ borderBottom: `1px solid ${CSS.border}` }}
                      >
                        <span className="font-semibold" style={{ color: CSS.fg }}>
                          {p.name}
                        </span>
                      </td>

                      <td
                        className="px-4 py-4 text-sm"
                        style={{ borderBottom: `1px solid ${CSS.border}`, color: CSS.mutedFg }}
                      >
                        {p.position}
                      </td>

                      <td
                        className="px-4 py-4 text-sm"
                        style={{ borderBottom: `1px solid ${CSS.border}`, color: CSS.mutedFg }}
                      >
                        {p.department}
                      </td>

                      <td
                        className="px-4 py-4"
                        style={{ borderBottom: `1px solid ${CSS.border}` }}
                      >
                        <span
                          className={
                            p.status === "completed"
                              ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
                              : p.status === "in-progress"
                              ? "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,249,195)] text-[rgb(133,77,14)]"
                              : "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
                          }
                        >
                          {p.status === "completed"
                            ? "Fertig"
                            : p.status === "in-progress"
                            ? "In Bearbeitung"
                            : "Ausstehend"}
                        </span>
                      </td>

                      <td
                        className="px-4 py-4 text-sm"
                        style={{ borderBottom: `1px solid ${CSS.border}`, color: CSS.mutedFg }}
                      >
                        {formatDate(p.completionDate)}
                      </td>

                      <td
                        className="px-4 py-4 text-center whitespace-nowrap"
                        style={{ borderBottom: `1px solid ${CSS.border}` }}
                      >
                        <button
                          onClick={() => handleAnalyzeWorker(p.id)}
                          title="Analysieren"
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
                          <Search size={13} />
                          <span className="hidden sm:inline">Analysieren</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
