// src/main/react/features/worker-area/results/EmployeeCatalogsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminLayout from "@/apps/app/AdminLayout";
import { ArrowLeft, FileText, ChevronRight, BarChart2, Search } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  score: number;
  status: 'completed' | 'pending' | 'review_pending';
  sessionId: string; 
}

interface Catalog {
  id: string;
  name: string;
  date: string;
  overallScore: number;
  topics: Topic[];
}

interface EmployeeData {
  id: string;
  name: string;
  department: string;
  catalogs: Catalog[];
}

export default function EmployeeCatalogsPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      // Mock Data (review_pending 포함)
      setEmployee({
        id: workerId || 'w1',
        name: 'Max Mustermann',
        department: 'IT',
        catalogs: [
          {
            id: 'cat_001',
            name: 'IT-Strategie 2025',
            date: '2025-03-15',
            overallScore: 78,
            topics: [
              { id: 't1', name: 'Cloud Governance', score: 85, status: 'completed', sessionId: 'sess_101' },
              { id: 't2', name: 'Security Policies', score: 0, status: 'review_pending', sessionId: 'sess_102' },
              { id: 't3', name: 'Budgeting', score: 90, status: 'completed', sessionId: 'sess_103' },
            ]
          },
          {
            id: 'cat_002',
            name: 'Digital Workplace',
            date: '2025-02-20',
            overallScore: 92,
            topics: [
              { id: 't4', name: 'Remote Access', score: 95, status: 'completed', sessionId: 'sess_104' },
              { id: 't5', name: 'Collaboration Tools', score: 89, status: 'completed', sessionId: 'sess_105' },
            ]
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, [workerId]);

  const handleExportCatalog = (catalog: Catalog) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text(`Report: ${catalog.name}`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Mitarbeiter: ${employee?.name}`, 14, 35);
    doc.text(`Abteilung: ${employee?.department}`, 14, 42);
    doc.text(`Erstelldatum: ${catalog.date}`, 14, 49);
    doc.text(`Gesamt-Score: ${catalog.overallScore}%`, 14, 56);
    
    autoTable(doc, {
      startY: 70,
      head: [['Thema', 'Status', 'Score']],
      body: catalog.topics.map(t => [t.name, t.status, `${t.score}%`]),
      headStyles: { fillColor: [41, 128, 185] },
    });

    catalog.topics.forEach((topic, index) => {
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text(`Thema ${index + 1}: ${topic.name}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Score Visualisierung (${topic.score}%)`, 14, 40);
      doc.setFillColor(230, 230, 230);
      doc.rect(14, 45, 180, 20, 'F');
      
      if (topic.score >= 80) doc.setFillColor(46, 204, 113);
      else if (topic.score >= 60) doc.setFillColor(241, 196, 15);
      else doc.setFillColor(231, 76, 60);
      
      const width = (180 * topic.score) / 100;
      doc.rect(14, 45, width, 20, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(50);
      doc.text("Analyse & Maßnahmen", 14, 80);
      doc.setFontSize(10);
      doc.setTextColor(100);
      const desc = "Basierend auf den Antworten wurden folgende Potenziale erkannt.";
      const splitDesc = doc.splitTextToSize(desc, 180);
      doc.text(splitDesc, 14, 90);
    });

    doc.save(`${employee?.name}_${catalog.name}_Report.pdf`);
  };

  if (loading) return <AdminLayout><div>Laden...</div></AdminLayout>;
  if (!employee) return <AdminLayout><div>Nicht gefunden</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-sm text-gray-500">Zugewiesene Kataloge ({employee.catalogs.length})</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {employee.catalogs.map((catalog) => (
            <div key={catalog.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedCatalogId(expandedCatalogId === catalog.id ? null : catalog.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${catalog.overallScore >= 70 ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{catalog.name}</h2>
                    <p className="text-sm text-gray-500">Erstellt: {catalog.date} • {catalog.topics.length} Themen</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Gesamt-Score</p>
                    <p className="text-xl font-bold text-blue-600">{catalog.overallScore}%</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleExportCatalog(catalog); }}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                  >
                    <FileText size={16} /> PDF Export
                  </button>
                  <ChevronRight 
                    size={20} 
                    className={`text-gray-400 transition-transform ${expandedCatalogId === catalog.id ? 'rotate-90' : ''}`} 
                  />
                </div>
              </div>

              {expandedCatalogId === catalog.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Enthaltene Themen & Sessions</h3>
                  <div className="space-y-3">
                    {catalog.topics.map((topic) => (
                      <div key={topic.id} className="bg-white p-4 rounded border border-gray-200 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <BarChart2 size={18} className="text-gray-400" />
                          <span className="font-medium text-gray-800">{topic.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           {topic.status === 'review_pending' ? (
                             <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">
                               In Bewertung
                             </span>
                           ) : (
                             <span className={`px-2 py-1 rounded text-xs font-bold ${topic.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                               {topic.score}%
                             </span>
                           )}
                           
                           <button
                             onClick={() => navigate(`/app/results/${topic.sessionId}`)}
                             className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                           >
                             <Search size={14} /> Analyse ansehen
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
