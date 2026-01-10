import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

import {
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  FileText,
  Network,
  Save,
} from "lucide-react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getManualScoring, updateAnswerScore } from '@/features/service/scoringService';

// ---- Types ----
interface Question {
  id: string | number;
  type: "choice" | "text" | "date";
  category: string;
  question: string;
  answer: string;
  score: number | null;
}

// CSS & Brand
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
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const radarChartRef = useRef<HTMLDivElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getManualScoring(sessionId);
        
        const transformedQuestions: Question[] = [];
        if (Array.isArray(data)) {
            data.forEach((cat: any) => {
                if(cat.items && Array.isArray(cat.items)) {
                    cat.items.forEach((item: any) => {
                        transformedQuestions.push({
                            id: item.questionId,
                            type: "text", 
                            category: cat.categoryName || "Allgemein",
                            question: item.questionText,
                            answer: item.answerText,
                            score: item.score
                        });
                    });
                }
            });
        }
        setQuestions(transformedQuestions);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const openCount = useMemo(
    () => questions.filter((q) => q.score === null).length,
    [questions]
  );

  const overallScore = useMemo(() => {
      const scoredQuestions = questions.filter(q => q.score !== null);
      if (scoredQuestions.length === 0) return 0;
      const total = scoredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
      return Math.round(total / scoredQuestions.length);
  }, [questions]);

  const handleScoreChange = async (id: string | number, val: string) => {
    const numVal = val === "" ? null : Math.min(100, Math.max(0, Number(val)));
    
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, score: numVal } : q)));
    setIsSaved(false);

    // API 호출
    if (sessionId && numVal !== null) {
        try {
            await updateAnswerScore(sessionId, String(id), numVal);
            setIsSaved(true);
        } catch (error) {
            console.error("Score save failed", error);
        }
    }
  };

  const onSave = () => setIsSaved(true);

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setTextColor(38, 69, 85);
      doc.text("Sicherheitsanalyse Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Session ID: ${sessionId ?? "-"}`, 14, 28);
      doc.text(`Datum: ${new Date().toLocaleDateString("de-DE")}`, 14, 33);
      doc.text(`Gesamtscore: ${overallScore}/100`, 14, 38);

      let yPos = 50;

      if (radarChartRef.current) {
        try {
          const canvas = await html2canvas(radarChartRef.current, { scale: 2, backgroundColor: "#ffffff" });
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 15, yPos, 80, 60);
          yPos += 70;
        } catch (e) { console.error(e); }
      }

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

      autoTable(doc, {
        startY: yPos,
        head: [["Kategorie", "Frage", "Antwort", "Score"]],
        body: questions.map((q) => [q.category, q.question, q.answer, q.score !== null ? `${q.score}` : "Offen"]),
      });

      doc.save(`Report_${sessionId}.pdf`);
    } catch (error) {
      alert("PDF Error");
    }
  };

  if (loading) return <div className="p-10 text-center">Laden...</div>;

  return (
    <AdminLayout>
      <PageHeader
        title="Manuelle Bewertung & Report"
        subtitle={`Session: ${sessionId ?? "-"}`}
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      <main className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-10 pt-20" style={{ background: "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%), linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)" }}>
        <div className="max-w-[1400px] mx-auto mb-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white/80">
            <ArrowLeft size={14} /> Zurück
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-[#d2c9b9] text-[#264555]">
              <Save size={16} /> {isSaved ? "Gespeichert" : "Speichern"}
            </button>
            <button onClick={() => void generatePDF()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#E3BB62] text-[#264555]">
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-[12px] border bg-[#ebebec] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                <h2 className="font-semibold flex items-center gap-2 text-[#264555]">
                  <AlertTriangle size={18} /> Manuelle Bewertung
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">{openCount} Offen</span>
              </div>
              <div className="p-6 bg-white space-y-6">
                {questions.map((q) => (
                  <div key={q.id} className="border-b pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-gray-500">{q.category}</span>
                      {q.score !== null ? <span className="text-green-700 text-xs flex gap-1"><CheckSquare size={12}/>Bewertet</span> : <span className="text-red-600 text-xs">Nicht bewertet</span>}
                    </div>
                    <p className="font-semibold mb-2">{q.question}</p>
                    <div className="p-3 bg-gray-50 border-l-4 border-[#d2c9b9] italic text-sm mb-3">„{q.answer}“</div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Score (0-100):</span>
                        <input 
                            type="number" 
                            className="w-24 h-10 rounded-full border text-center font-bold"
                            value={q.score === null ? "" : q.score}
                            placeholder="-"
                            onChange={(e) => handleScoreChange(q.id, e.target.value)}
                        />
                    </div>
                  </div>
                ))}
                {questions.length === 0 && <div className="text-center text-gray-500">Keine Daten.</div>}
              </div>
            </section>
            
            <section className="rounded-[12px] border bg-white shadow-sm p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-2 text-[#264555]"><FileText size={18} /> Notizen</h2>
                <textarea 
                    className="w-full border rounded-xl p-4 min-h-[100px]" 
                    placeholder="Zusammenfassung für den Report..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                />
            </section>
          </div>

          <aside>
            <section className="rounded-[18px] border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Gesamtscore</p>
                <div className="mt-2 text-5xl font-extrabold text-[#264555]">{overallScore}</div>
                <div className="mt-4 w-full h-2.5 bg-gray-100 rounded-full">
                    <div className="h-2.5 bg-[#E3BB62] rounded-full transition-all" style={{ width: `${overallScore}%` }}></div>
                </div>
            </section>
          </aside>
        </div>
      </main>
    </AdminLayout>
  );
}
