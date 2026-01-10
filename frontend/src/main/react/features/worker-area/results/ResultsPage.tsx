import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

import {
  ArrowLeft,
  FileText,
  Save,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Search,
  Filter
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

  const openCount = useMemo(() => questions.filter((q) => q.score === null).length, [questions]);
  const completedCount = useMemo(() => questions.length - openCount, [questions, openCount]);
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
      <div className="bg-[#f4f5f7] min-h-screen pb-20">
        <PageHeader
            title="Manuelle Bewertung"
            subtitle={`Session ID: ${sessionId ?? "-"}`}
            icon={<FileText size={24} />}
            breadcrumbs={['Admin Panel', 'Firmen', 'Details']}
        />

        <div className="max-w-[1400px] mx-auto px-6 -mt-8 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">DURCHSCHNITTSCORE</span>
                        <div className="w-2 h-2 rounded-full bg-[#E3BB62]"></div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#264555]">{overallScore}%</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TEILNEHMER</span>
                        <div className="w-2 h-2 rounded-full bg-[#56768f]"></div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#264555]">{questions.length}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ABGESCHLOSSEN</span>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#264555]">{completedCount}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">IN BEARBEITUNG</span>
                        <div className="w-2 h-2 rounded-full bg-[#E3BB62]"></div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#264555]">{openCount}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                <div className="flex items-center px-4 w-full">
                    <Search className="text-gray-400 mr-3" size={20} />
                    <input 
                        type="text" 
                        placeholder="Suche Teilnehmer (Name, Position, Abteilung, Status)..." 
                        className="w-full outline-none text-gray-600 placeholder-gray-400 h-10"
                    />
                </div>
                <button className="bg-[#264555] text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mr-2">
                    Zeige {questions.length} Teilnehmer
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f9fafb] border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NAME / FRAGE</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">POSITION / KATEGORIE</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ABSCHLUSS</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">AKTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {questions.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="font-bold text-[#264555]">{q.question}</div>
                                    <div className="text-sm text-gray-400 italic mt-1">„{q.answer}“</div>
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-500">{q.category}</td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        q.score !== null ? 'bg-green-100 text-green-700' : 'bg-[#fffbeb] text-[#d97706]'
                                    }`}>
                                        {q.score !== null ? 'Fertig' : 'In Bearbeitung'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-500">
                                    {new Date().toLocaleDateString('de-DE')}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="w-24 bg-[#E3BB62]/20 border border-[#E3BB62] rounded-full px-3 py-1.5 text-center font-bold text-[#264555] focus:outline-none focus:ring-2 focus:ring-[#E3BB62]" 
                                            value={q.score ?? ''} 
                                            placeholder="Score"
                                            onChange={(e) => handleScoreChange(q.id, e.target.value)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-[#264555] flex items-center gap-2 mb-4">
                        <FileText size={18} /> Report Notizen & Maßnahmen
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">Dieser Text erscheint im PDF-Export.</p>
                    <textarea 
                        className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-[#E3BB62] focus:border-transparent outline-none transition-all resize-y text-sm" 
                        placeholder="Schreiben Sie hier eine Zusammenfassung oder empfohlene Maßnahmen für den PDF-Bericht..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                    />
                </div>
            </div>

            <div className="fixed bottom-6 right-6 flex gap-3 z-50">
                <button onClick={onSave} className="shadow-lg bg-white border border-gray-200 text-[#264555] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                    <Save size={18} /> {isSaved ? "Gespeichert" : "Speichern"}
                </button>
                <button onClick={() => void generatePDF()} className="shadow-lg bg-[#264555] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#1a313f] transition-all">
                    <FileText size={18} /> PDF Exportieren
                </button>
            </div>

        </div>
      </div>
    </AdminLayout>
  );
}
