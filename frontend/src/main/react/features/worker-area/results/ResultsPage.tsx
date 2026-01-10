import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

import {
  ArrowLeft,
  FileText,
  Network,
  Save,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
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
  
  const completedCount = useMemo(
    () => questions.length - openCount,
    [questions, openCount]
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

  if (loading) return <div className="p-10 text-center text-gray-500">Daten werden geladen...</div>;

  return (
    <AdminLayout>
      <PageHeader
        title="Manuelle Bewertung & Report"
        subtitle={`Session ID: ${sessionId ?? "-"}`}
        icon={<Network size={40} />}
        gradient="navy"
        height="220px"
        showPattern={true}
        center={false}
      />

      <main className="min-h-[calc(100vh-64px)] -mt-20 px-6 pb-20 relative z-10">
        <div className="max-w-[1400px] mx-auto">
            
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 bg-white text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-[#264555]">
              <ArrowLeft size={16} /> Zurück
            </button>
            
            <div className="flex items-center gap-3">
              <button onClick={onSave} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 bg-white border transition-all shadow-sm font-medium ${isSaved ? 'text-green-600 border-green-200' : 'text-[#264555] border-gray-200 hover:bg-gray-50'}`}>
                <Save size={18} /> {isSaved ? "Gespeichert" : "Speichern"}
              </button>
              <button onClick={() => void generatePDF()} className="inline-flex items-center gap-2 rounded-full px-5 py-2 bg-[#E3BB62] text-[#264555] font-bold shadow-md hover:bg-[#dcae4e] transition-colors">
                <FileText size={18} /> PDF Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Durchschnittsscore</span>
                    <BarChart3 className="text-[#E3BB62]" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-[#264555] z-10">{overallScore}%</div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                    <div className="h-full bg-[#E3BB62]" style={{ width: `${overallScore}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fragen Gesamt</span>
                    <Users className="text-blue-400" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-[#264555]">{questions.length}</div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Abgeschlossen</span>
                    <CheckCircle className="text-green-500" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-[#264555]">{completedCount}</div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Bearbeitung</span>
                    <Clock className="text-orange-400" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-[#264555]">{openCount}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-[#264555] flex items-center gap-2">
                    <AlertCircle size={18} /> Detaillierte Bewertung
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[40%]">Name / Frage</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Kategorie</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Score (0-100)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {questions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-semibold text-[#264555] mb-1">{q.question}</div>
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                „{q.answer}“
                            </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                            {q.category}
                        </td>

                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            q.score !== null 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}>
                            {q.score !== null ? 'Fertig' : 'In Bearbeitung'}
                            </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end">
                                <input 
                                type="number" 
                                className="w-20 border border-gray-300 rounded-lg py-2 px-1 text-center font-bold text-[#264555] focus:ring-2 focus:ring-[#E3BB62] focus:border-[#E3BB62] outline-none transition-all shadow-sm" 
                                value={q.score ?? ''} 
                                placeholder="-"
                                onChange={(e) => handleScoreChange(q.id, e.target.value)}
                                />
                            </div>
                        </td>
                        </tr>
                    ))}
                    {questions.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                Keine Fragen gefunden.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
          </div>

          <section className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-bold flex items-center gap-2 mb-4 text-[#264555]">
                <FileText size={20} className="text-[#E3BB62]" /> 
                Zusammenfassung & Maßnahmen
            </h2>
            <textarea 
                className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-[#E3BB62] focus:border-transparent outline-none transition-all resize-y" 
                placeholder="Schreiben Sie hier eine Zusammenfassung oder empfohlene Maßnahmen für den PDF-Bericht..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
            />
          </section>

        </div>
      </main>
    </AdminLayout>
  );
}
