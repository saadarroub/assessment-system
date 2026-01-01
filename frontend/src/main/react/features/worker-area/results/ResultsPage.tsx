import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

import {
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  FileText,
  Mail,
  Network,
  Save,
} from "lucide-react";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- Types ----
interface Question {
  id: number;
  type: "choice" | "text" | "date";
  question: string;
  answer: string;
  score: number | null;
  category: string;
}

// HSL-Token-Fallbacks (wie in deiner UserList)
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

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const radarChartRef = useRef<HTMLDivElement>(null);

  // Demo-Daten 
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: "choice",
      category: "Netzwerk",
      question: "Ist die Firewall aktiviert?",
      answer: "Ja",
      score: 100,
    },
    {
      id: 2,
      type: "choice",
      category: "Zugriff",
      question: "Werden Passwörter alle 90 Tage geändert?",
      answer: "Nein",
      score: 0,
    },
    {
      id: 3,
      type: "text",
      category: "Incident Response",
      question: "Beschreiben Sie den Prozess bei Datenverlust.",
      answer: "Ich melde es dem IT-Support per E-Mail.",
      score: null,
    },
    {
      id: 4,
      type: "date",
      category: "Compliance",
      question: "Wann war die letzte Schulung?",
      answer: "2023-11-01",
      score: null,
    },
    {
      id: 5,
      type: "text",
      category: "Physische Sicherheit",
      question: "Wie werden Besucher protokolliert?",
      answer: "Es liegt eine Liste am Empfang.",
      score: null,
    },
  ]);

  const [adminNote, setAdminNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const openCount = useMemo(
    () => questions.filter((q) => q.score === null).length,
    [questions]
  );

  const categories = useMemo(
    () => Array.from(new Set(questions.map((q) => q.category))),
    [questions]
  );

  const chartData = useMemo(() => {
    return categories.map((cat) => {
      const list = questions.filter((q) => q.category === cat && q.score !== null);
      const avg = list.length
        ? Math.round(list.reduce((a, b) => a + (b.score ?? 0), 0) / list.length)
        : 0;
      return { subject: cat, score: avg };
    });
  }, [categories, questions]);

  const overallScore = useMemo(() => {
    const denom = chartData.length || 1;
    return Math.round(chartData.reduce((a, b) => a + b.score, 0) / denom);
  }, [chartData]);

  const handleScoreChange = (id: number, val: string) => {
    const numVal = val === "" ? null : Math.min(100, Math.max(0, Number(val)));
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, score: numVal } : q)));
    setIsSaved(false);
  };

  const onSave = () => {
    // Hier  API-Call 
    setIsSaved(true);
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header (Cap-Look)
      doc.setFontSize(18);
      doc.setTextColor(38, 69, 85); // navy-ish
      doc.text("Sicherheitsanalyse Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Session ID: ${sessionId ?? "-"}`, 14, 28);
      doc.text(`Datum: ${new Date().toLocaleDateString("de-DE")}`, 14, 33);
      doc.text(`Gesamtscore: ${overallScore}/100`, 14, 38);

      let yPos = 50;

      // Chart ins PDF
      if (radarChartRef.current) {
        try {
          const canvas = await html2canvas(radarChartRef.current, {
            scale: 2,
            backgroundColor: "#ffffff",
          });
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 15, yPos, 80, 60);

          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("Ergebnis Visualisierung", 15, yPos - 2);

          yPos += 70;
        } catch (chartError) {
          // eslint-disable-next-line no-console
          console.error("Chart capture failed:", chartError);
        }
      }

      // Admin Note
      if (adminNote) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Zusammenfassung & Maßnahmen:", 14, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const splitNote = doc.splitTextToSize(adminNote, pageWidth - 28);
        doc.text(splitNote, 14, yPos);
        yPos += splitNote.length * 5 + 10;
      }

      // Tabelle
      autoTable(doc, {
        startY: yPos,
        head: [["Kategorie", "Frage", "Antwort", "Score"]],
        body: questions.map((q) => [
          q.category,
          q.question,
          q.answer,
          q.score !== null ? `${q.score}` : "Offen",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [38, 69, 85] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 60 },
          3: { cellWidth: 20, halign: "center" },
        },
        margin: { top: 20 },
      });

      doc.save(`Report_${sessionId ?? "session"}.pdf`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("PDF generation failed:", error);
      alert("PDF Error");
    }
  };

  return (
    <AdminLayout>
      {/* HERO Header  */}
      <PageHeader
        title="Manuelle Bewertung & Report"
        subtitle={`Bewerte offene Antworten, ergänze Maßnahmen und exportiere den Bericht als PDF — Session: ${sessionId ?? "-"
          }`}
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      {/*  Außenbereich unter dem Hero  */}
      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-10 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/*  Top-Bar: Breadcrumb + Actions  */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between gap-3">
          {/* Breadcrumb links  */}
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
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
                >
                  <ArrowLeft size={14} />
                </span>
                Zurück
              </button>

              <span className="text-[11px] opacity-60" style={{ color: CSS.mutedFg }}>
                ›
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
                Results
              </span>
            </div>
          </nav>

          {/* Actions rechts */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
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
                background: "#ffffff",
                color: BRAND.navy,
                border: `1px solid ${BRAND.sand}`,
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              }}
              title="Speichern"
            >
              <Save size={16} />
              <span className="hidden sm:inline">{isSaved ? "Gespeichert" : "Speichern"}</span>
            </button>

            <button
              type="button"
              onClick={() => void generatePDF()}
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
                background: BRAND.gold,
                color: BRAND.navy,
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
              title="PDF Export"
            >
              <FileText size={16} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/*  Info-Leiste */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-5
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
              >
                <AlertTriangle size={18} />
              </div>

              <div>
                <div className="text-sm font-semibold" style={{ color: CSS.fg }}>
                  Offene Bewertungen
                </div>
                <div className="text-xs" style={{ color: CSS.mutedFg }}>
                  Bitte bewerte die offenen Text-/Datumsfragen (0–100), ergänze Notizen und exportiere den Report.
                </div>
              </div>
            </div>

            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm font-medium"
              style={{ background: BRAND.navy, color: "white" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
              <span>
                <span className="font-semibold">{openCount}</span> Offen
              </span>
            </div>
          </div>
        </div>

        {/*  Content Grid  */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT / MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manuelle Bewertung Card */}
            <section
              className="
                rounded-[12px] border overflow-hidden
                shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
              "
              style={{ borderColor: CSS.border, background: BRAND.fog }}
            >
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                }}
              >
                <h2 className="font-semibold flex items-center gap-2" style={{ color: BRAND.navy }}>
                  <AlertTriangle size={18} />
                  Manuelle Bewertung erforderlich
                </h2>

                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: "rgba(227,187,98,0.25)",
                    color: BRAND.navy,
                    border: `1px solid rgba(227,187,98,0.35)`,
                  }}
                >
                  {openCount} Offen
                </span>
              </div>

              <div className="p-6 space-y-6 bg-white">
                {questions.filter((q) => q.type !== "choice").map((q) => (
                  <div
                    key={q.id}
                    className="border-b last:border-0 pb-6 last:pb-0"
                    style={{ borderColor: CSS.border }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: CSS.mutedFg }}
                      >
                        {q.category}
                      </span>

                      {q.score !== null ? (
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: "rgb(22,101,52)" }}>
                          <CheckSquare size={12} />
                          Bewertet
                        </span>
                      ) : (
                        <span className="text-xs font-bold" style={{ color: "rgb(185,28,28)" }}>
                          Nicht bewertet
                        </span>
                      )}
                    </div>

                    <p className="font-semibold mb-2" style={{ color: CSS.fg }}>
                      {q.question}
                    </p>

                    <div
                      className="p-3 rounded mb-3 text-sm italic border-l-4"
                      style={{
                        background: "rgba(38,69,85,0.04)",
                        borderLeftColor: BRAND.sand,
                        color: CSS.fg,
                      }}
                    >
                      „{q.answer}“
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-medium" style={{ color: CSS.fg }}>
                        Score vergeben (0–100):
                      </label>

                      <input
                        type="number"
                        className="
                          w-24 h-10
                          rounded-full
                          border
                          px-3
                          text-center font-bold
                          outline-none transition
                          bg-white
                        "
                        style={{
                          borderColor: BRAND.sand,
                          color: BRAND.navy,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        }}
                        value={q.score === null ? "" : q.score}
                        placeholder="-"
                        onChange={(e) => handleScoreChange(q.id, e.target.value)}
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
                  </div>
                ))}
              </div>
            </section>

            {/* Notizen Card */}
            <section
              className="
                rounded-[12px] border
                shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
                overflow-hidden
              "
              style={{ borderColor: CSS.border, background: BRAND.fog }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                }}
              >
                <h2 className="font-semibold flex items-center gap-2" style={{ color: BRAND.navy }}>
                  <FileText size={18} />
                  Report Notizen & Maßnahmen
                </h2>
                <p className="text-xs mt-1" style={{ color: CSS.mutedFg }}>
                  Dieser Text erscheint im PDF-Export.
                </p>
              </div>

              <div className="p-6 bg-white">
                <textarea
                  className="
                    w-full
                    rounded-2xl
                    border
                    p-4
                    outline-none
                    transition
                    min-h-[140px]
                    bg-white
                  "
                  style={{
                    borderColor: BRAND.sand,
                    color: CSS.fg,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                  placeholder="Schreiben Sie hier eine Zusammenfassung oder empfohlene Maßnahmen für den PDF-Bericht..."
                  value={adminNote}
                  onChange={(e) => {
                    setAdminNote(e.target.value);
                    setIsSaved(false);
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
            </section>

            {/* Bereits bewertet Table */}
            <section
              className="
    rounded-[12px] border
    shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
    overflow-hidden
  "
              style={{ borderColor: CSS.border, background: BRAND.fog }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                }}
              >
                <h2 className="font-semibold" style={{ color: BRAND.navy }}>
                  Bereits bewertet <span className="opacity-60">(Automatisch)</span>
                </h2>
              </div>

              {/* ✅ NEU: Innen-Wrapper, damit die Tabelle NICHT full width ist */}
              <div className="bg-white px-4 sm:px-6 py-6">
                <div
                  className="
        mx-auto
        w-full
        max-w-[980px]
        rounded-2xl
        border
        overflow-hidden
        shadow-[0_10px_24px_rgba(0,0,0,0.06)]
      "
                  style={{ borderColor: BRAND.sand, background: "linear-gradient(to bottom, #ffffff, #fbfbfb)" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead
                        className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                        style={{
                          background: "linear-gradient(to right, #f1f2f4, #ffffff)",
                          borderBottom: `1px solid ${CSS.border}`,
                          color: BRAND.navy,
                        }}
                      >
                        <tr>
                          <th className="px-5 py-3 text-[0.82rem]" style={{ color: CSS.fg }}>
                            Frage
                          </th>
                          <th className="px-5 py-3 text-[0.82rem]" style={{ color: CSS.fg }}>
                            Antwort
                          </th>
                          <th className="px-5 py-3 text-[0.82rem] text-right" style={{ color: CSS.fg }}>
                            Score
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {questions
                          .filter((q) => q.type === "choice")
                          .map((q) => {
                            const isYes =
                              (q.answer ?? "").trim().toLowerCase() === "ja" ||
                              (q.answer ?? "").trim().toLowerCase() === "yes";
                            const scoreVal = q.score ?? 0;

                            return (
                              <tr
                                key={q.id}
                                className="
                      bg-white transition
                      hover:bg-[#fff9ec]
                    "
                              >
                                <td className="px-5 py-4 align-top" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                  <div className="font-semibold" style={{ color: CSS.fg }}>
                                    {q.question}
                                  </div>
                                  <div className="text-xs mt-1" style={{ color: CSS.mutedFg }}>
                                    {q.category}
                                  </div>
                                </td>

                                <td className="px-5 py-4 align-top" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                                  {/* hübscher “Pill”-Look wie im Screenshot */}
                                  <span
                                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
                                    style={{
                                      background: isYes ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                      color: isYes ? "rgb(22,101,52)" : "rgb(185,28,28)",
                                      border: `1px solid ${isYes ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                                    }}
                                  >
                                    {q.answer}
                                  </span>
                                </td>

                                <td
                                  className="px-5 py-4 text-right align-top"
                                  style={{ borderBottom: `1px solid ${CSS.border}` }}
                                >
                                  <span
                                    className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-extrabold"
                                    style={{
                                      background: scoreVal >= 70 ? "rgba(227,187,98,0.22)" : "rgba(38,69,85,0.06)",
                                      color: BRAND.navy,
                                      border: `1px solid ${scoreVal >= 70 ? "rgba(227,187,98,0.35)" : "rgba(38,69,85,0.10)"}`,
                                      minWidth: 70,
                                    }}
                                  >
                                    {q.score}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>


          </div>

          {/* RIGHT / SIDEBAR */}
          <aside className="space-y-6">
            {/* Score Card */}
            <section
              className="
                rounded-[18px] border
                px-5 py-5
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                bg-white
              "
              style={{ borderColor: BRAND.sand }}
            >
              <p className="text-sm" style={{ color: CSS.mutedFg }}>
                Aktueller Gesamtscore
              </p>

              <div className="mt-2 flex items-end justify-between">
                <div className="text-5xl font-extrabold" style={{ color: BRAND.navy }}>
                  {overallScore}
                </div>

                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: BRAND.navy, color: "white" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
                  <span>/ 100</span>
                </div>
              </div>

              <div className="mt-4 w-full rounded-full h-2.5" style={{ background: "rgba(38,69,85,0.10)" }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${overallScore}%`,
                    background: BRAND.gold,
                  }}
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminLayout>
  );
}
