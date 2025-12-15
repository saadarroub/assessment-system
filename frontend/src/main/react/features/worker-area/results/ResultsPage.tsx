// src/main/react/features/worker-area/results/ResultsPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import AdminLayout from "@/apps/app/AdminLayout";
import { ArrowLeft, CheckSquare, FileText, Mail, Save, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 


interface Question {
  id: number;
  type: 'choice' | 'text' | 'date';
  question: string;
  answer: string;
  score: number | null; 
  category: string;
}

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  

  const radarChartRef = useRef<HTMLDivElement>(null);


  const [questions, setQuestions] = useState<Question[]>([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchResults = async () => {
      try {

        const response = await fetch(`/api/worker-catalogs/${sessionId}/score`); 
        
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        } else {
          console.error("Data Loading Failure");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  const [adminNote, setAdminNote] = useState(''); 
  const [isSaved, setIsSaved] = useState(false);

  const handleScoreChange = (id: number, val: string) => {
    const numVal = val === '' ? null : Math.min(100, Math.max(0, Number(val)));
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, score: numVal } : q));
    setIsSaved(false);
  };

  const categories = Array.from(new Set(questions.map(q => q.category)));
  const chartData = categories.map(cat => {
    const list = questions.filter(q => q.category === cat && q.score !== null);
    const avg = list.length ? Math.round(list.reduce((a, b) => a + (b.score || 0), 0) / list.length) : 0;
    return { subject: cat, score: avg };
  });
  const overallScore = Math.round(chartData.reduce((a, b) => a + b.score, 0) / (chartData.length || 1));

  const handleSave = () => {
    // fetch('/api/save-score', { method: 'POST', body: ... })
    setIsSaved(true);
    alert('Bewertung gespeichert!');
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // -- Header --
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185); // Blue
      doc.text("Sicherheitsanalyse Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Session ID: ${sessionId}`, 14, 28);
      doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 14, 33);
      doc.text(`Gesamtscore: ${overallScore}/100`, 14, 38);

      let yPos = 50;

      if (radarChartRef.current) {
        try {
          const canvas = await html2canvas(radarChartRef.current, { 
            scale: 2,
            backgroundColor: '#ffffff' 
          });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 15, yPos, 80, 60); 
          
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("Ergebnis Visualisierung", 15, yPos - 2);
          
          yPos += 70; 
        } catch (chartError) {
          console.error("Chart capture failed:", chartError);
        }
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
        yPos += (splitNote.length * 5) + 10;
      }

      autoTable(doc, {
        startY: yPos,
        head: [['Kategorie', 'Frage', 'Antwort', 'Score']],
        body: questions.map(q => [
          q.category,
          q.question,
          q.answer,
          q.score !== null ? `${q.score}` : 'Offen'
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: { 
          0: { cellWidth: 25 }, 
          1: { cellWidth: 60 },
          2: { cellWidth: 60 },
          3: { cellWidth: 20, halign: 'center' }
        },
        margin: { top: 20 },
      });


      doc.save(`Report_${sessionId}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header Bar */}
        <div className="bg-white shadow border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manuelle Bewertung & Report</h1>
                <p className="text-xs text-gray-500">Session: {sessionId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">
                <Save size={18} /> Speichern
              </button>
              <button onClick={generatePDF} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
                <FileText size={18} /> PDF Export
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow border border-yellow-200 overflow-hidden">
              <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200 flex justify-between items-center">
                <h2 className="font-bold text-yellow-800 flex items-center gap-2">
                  <AlertTriangle size={20} /> Manuelle Bewertung erforderlich
                </h2>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                  {questions.filter(q => q.score === null).length} Offen
                </span>
              </div>
              <div className="p-6 space-y-6">
                {questions.filter(q => q.type !== 'choice').map(q => (
                  <div key={q.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{q.category}</span>
                      {q.score !== null ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckSquare size={12}/> Bewertet</span>
                      ) : (
                        <span className="text-xs font-bold text-red-500">Nicht bewertet</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                    <div className="bg-gray-50 p-3 rounded mb-3 text-sm text-gray-700 italic border-l-4 border-gray-300">
                      "{q.answer}"
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Score vergeben (0-100):</label>
                      <input 
                        type="number" 
                        className="w-24 border border-gray-300 rounded p-1 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={q.score === null ? '' : q.score}
                        placeholder="-"
                        onChange={(e) => handleScoreChange(q.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-500"/> Report Notizen & Maßnahmen
              </h2>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                placeholder="Schreiben Sie hier eine Zusammenfassung oder empfohlene Maßnahmen für den PDF-Bericht..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2 text-right">Dieser Text erscheint im PDF-Export.</p>
            </div>


            <div className="bg-white rounded-lg shadow p-6 opacity-70 hover:opacity-100 transition-opacity">
               <h2 className="font-bold text-gray-600 mb-4">Bereits bewertet (Automatisch)</h2>
               <table className="w-full text-sm text-left">
                 <thead className="text-gray-500 border-b">
                   <tr>
                     <th className="pb-2">Frage</th>
                     <th className="pb-2">Antwort</th>
                     <th className="pb-2 text-right">Score</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {questions.filter(q => q.type === 'choice').map(q => (
                     <tr key={q.id}>
                       <td className="py-2 pr-2">{q.question}</td>
                       <td className="py-2 font-medium">{q.answer}</td>
                       <td className="py-2 text-right font-bold text-blue-600">{q.score}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>


          <div className="space-y-6">
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 mb-1">Aktueller Gesamtscore</p>
              <div className="text-5xl font-bold text-blue-600 mb-2">{overallScore}</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallScore}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-700 mb-4 text-center">Visualisierung</h3>
              
              <div ref={radarChartRef} className="bg-white p-2 flex justify-center">
                 <ResponsiveContainer width="100%" height={250}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.5} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">Dieses Diagramm wird in das PDF übernommen.</p>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow flex items-center justify-center gap-2 transition">
              <Mail size={20} /> Ergebnis per E-Mail senden
            </button>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
