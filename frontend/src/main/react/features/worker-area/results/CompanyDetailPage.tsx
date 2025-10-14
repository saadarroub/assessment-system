import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdminLayout from "@/apps/app/AdminLayout";

interface Company {
  id: string;
  name: string;
  overall: number;
  employees: number;
  industry: string;
  date: string;
}

interface Participant {
  name: string;
  position: string;
  department: string;
  completionDate: string;
  status: 'completed' | 'pending' | 'in-progress';
}

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Von API ein bestimmtes Unternehmen abrufen
    const fetchCompanyData = async () => {
      try {
        // Info des Unternehmens
        const companyRes = await fetch(`http://localhost:5050/api/company/${companyId}`);
        const companyData = await companyRes.json();
        setCompany(companyData);

        // Info der Teilnehmenden
        const participantsRes = await fetch(`http://localhost:5050/api/company/${companyId}/participants`);
        const participantsData = await participantsRes.json();
        setParticipants(participantsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Ohne API Mock-Daten
        const dummyCompanies = [
          { id: 'C001', name: 'TechCorp GmbH', overall: 75, employees: 250, industry: 'IT', date: '2025-03-15' },
          { id: 'C002', name: 'MedHealth AG', overall: 82, employees: 150, industry: 'Healthcare', date: '2025-03-18' },
          { id: 'C003', name: 'FinServ Bank', overall: 88, employees: 500, industry: 'Finance', date: '2025-03-20' },
          { id: 'C004', name: 'AutoParts Ltd', overall: 68, employees: 300, industry: 'Manufacturing', date: '2025-03-22' },
          { id: 'C005', name: 'RetailMax', overall: 71, employees: 180, industry: 'Retail', date: '2025-03-25' },
          { id: 'C006', name: 'LogiTrans', overall: 79, employees: 220, industry: 'Logistics', date: '2025-03-28' },
          { id: 'C007', name: 'EduLearn GmbH', overall: 73, employees: 120, industry: 'Education', date: '2025-04-01' },
          { id: 'C008', name: 'PowerGrid AG', overall: 85, employees: 400, industry: 'Energy', date: '2025-04-05' },
          { id: 'C009', name: 'BuildCo', overall: 65, employees: 280, industry: 'Construction', date: '2025-04-08' },
          { id: 'C010', name: 'FoodService', overall: 70, employees: 160, industry: 'Food', date: '2025-04-10' }
        ];
        
        const dummyParticipants: Participant[] = [
          { name: 'Max Mustermann', position: 'IT-Leiter', department: 'IT-Abteilung', completionDate: '2025-03-15', status: 'completed' },
          { name: 'Anna Schmidt', position: 'CISO', department: 'Sicherheit', completionDate: '2025-03-15', status: 'completed' },
          { name: 'Peter Wagner', position: 'Compliance Officer', department: 'Compliance', completionDate: '2025-03-15', status: 'completed' }
        ];

        const found = dummyCompanies.find(c => c.id === companyId);
        setCompany(found || null);
        setParticipants(dummyParticipants);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Laden...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!company) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Unternehmen nicht gefunden</h2>
            <p className="text-gray-600 mb-6">Die Unternehmens-ID "{companyId}" existiert nicht.</p>
            <button
              onClick={() => navigate('/app/companylist')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Branchen-Durchschnitte
  const industryAverages = [
    { industry: 'Finance', avg: 88 },
    { industry: 'Energy', avg: 85 },
    { industry: 'Healthcare', avg: 82 },
    { industry: 'Logistics', avg: 79 },
    { industry: 'IT', avg: 75 },
    { industry: 'Education', avg: 73 },
    { industry: 'Retail', avg: 71 },
    { industry: 'Food', avg: 70 },
    { industry: 'Manufacturing', avg: 68 },
    { industry: 'Construction', avg: 65 }
  ];

  // Time Line Data
  const timelineData = [
    { month: 'Okt 2024', avgScore: company.overall - 12 },
    { month: 'Nov 2024', avgScore: company.overall - 9 },
    { month: 'Dez 2024', avgScore: company.overall - 6 },
    { month: 'Jan 2025', avgScore: company.overall - 4 },
    { month: 'Feb 2025', avgScore: company.overall - 2 },
    { month: 'Mär 2025', avgScore: company.overall }
  ];

  // Category Averages
  const categoryAverages = [
    { category: 'Zugriffskontrolle', score: Math.min(100, company.overall + 12) },
    { category: 'Netzwerksicherheit', score: Math.min(100, company.overall + 7) },
    { category: 'Mitarbeitersicherheit', score: Math.max(0, company.overall) },
    { category: 'Datenschutz', score: Math.max(0, company.overall - 2) },
    { category: 'Physische Sicherheit', score: Math.max(0, company.overall - 7) },
    { category: 'Incident Response', score: Math.max(0, company.overall - 13) }
  ];

  // Maturity Distribution
  const maturityDistribution = [
    { level: 'Optimiert (90+)', count: company.overall >= 90 ? 1 : 0, color: '#10B981' },
    { level: 'Verwaltet (80-89)', count: company.overall >= 80 && company.overall < 90 ? 1 : 0, color: '#3B82F6' },
    { level: 'Definiert (70-79)', count: company.overall >= 70 && company.overall < 80 ? 1 : 0, color: '#F59E0B' },
    { level: 'Wiederholt (50-69)', count: company.overall >= 50 && company.overall < 70 ? 1 : 0, color: '#EF4444' },
    { level: 'Initial (<50)', count: company.overall < 50 ? 1 : 0, color: '#DC2626' }
  ];

  // Size vs Score
  const sizeVsScore = [
    { name: company.name, employees: company.employees, score: company.overall },
    { name: 'Branchenschnitt', employees: company.employees, score: industryAverages.find(i => i.industry === company.industry)?.avg || 70 }
  ];

  // Schwachstellen
  const topWeaknesses = categoryAverages
    .filter(cat => cat.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(cat => ({
      area: cat.category,
      percentage: Math.round((1 - cat.score / 100) * 100)
    }));

  const exportToExcel = () => {
    const data = [
      ['Unternehmensdetails'],
      ['ID', 'Name', 'Gesamtscore', 'Mitarbeiter', 'Branche', 'Datum'],
      [company.id, company.name, company.overall, company.employees, company.industry, company.date],
      [],
      ['Kategorien-Scores'],
      ['Kategorie', 'Score'],
      ...categoryAverages.map(c => [c.category, c.score])
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${company.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${company.name}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/companylist')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Zurück zur Übersicht"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-500 mt-1">Detaillierte Sicherheitsbewertung</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF Export
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div id="dashboard-content" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gesamtscore</p>
                  <p className="text-3xl font-bold" style={{
                    color: company.overall >= 80 ? '#10B981' : company.overall >= 70 ? '#F59E0B' : '#EF4444'
                  }}>
                    {company.overall}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className={`text-xs mt-2 ${company.overall >= 80 ? 'text-green-600' : company.overall >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {company.overall >= 80 ? '✓ Gut' : company.overall >= 70 ? '⚠ Mittel' : '✗ Kritisch'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div>
                <p className="text-sm text-gray-600 mb-1">Branche</p>
                <p className="text-xl font-bold text-gray-800">{company.industry}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mitarbeiter</p>
                  <p className="text-3xl font-bold text-green-600">{company.employees}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div>
                <p className="text-sm text-gray-600 mb-1">Datum</p>
                <p className="text-lg font-bold text-purple-600">{company.date}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div>
                <p className="text-sm text-gray-600 mb-1">ID</p>
                <p className="text-lg font-mono font-bold text-gray-800">{company.id}</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Zeitlicher Verlauf */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Entwicklung über Zeit</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={3} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Branchenvergleich */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Branchenvergleich</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={industryAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="industry" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avg" name="Durchschnitt">
                    {industryAverages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.industry === company.industry ? '#3B82F6' : entry.avg >= 80 ? '#10B981' : entry.avg >= 70 ? '#F59E0B' : '#EF4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Kategorien-Radar */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategorien-Bewertung</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={categoryAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Reifegrad */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reifegrad</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={maturityDistribution.filter(m => m.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level }) => level}
                    outerRadius={90}
                    dataKey="count"
                  >
                    {maturityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Größe vs Score */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vergleich zum Branchenschnitt</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="employees" name="Mitarbeiter" />
                  <YAxis type="number" dataKey="score" name="Score" domain={[0, 100]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Vergleich" data={sizeVsScore} fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Top Schwachstellen */}
            {topWeaknesses.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Verbesserungsbereiche</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topWeaknesses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" angle={-20} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#EF4444" name="Verbesserungspotential (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Teilnehmer-Details Tabelle */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment-Teilnehmer</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Abteilung</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Abschlussdatum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{participant.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.position}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.department}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.completionDate}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            participant.status === 'completed' ? 'bg-green-100 text-green-800' :
                            participant.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.status === 'completed' ? 'Abgeschlossen' :
                             participant.status === 'in-progress' ? 'In Bearbeitung' :
                             'Ausstehend'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Keine Teilnehmerdaten verfügbar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Gesamt:</strong> {participants.length} Teilnehmer haben das Assessment abgeschlossen</p>
            </div>
          </div>

          {/* Zusammenfassung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Wichtigste Erkenntnisse</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Gesamtscore: {company.overall} Punkte
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Branche: {company.industry}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {topWeaknesses.length > 0 ? `Hauptschwachstelle: ${topWeaknesses[0].area}` : 'Keine kritischen Schwachstellen'}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Verbesserung: +{Math.abs(timelineData[timelineData.length - 1].avgScore - timelineData[0].avgScore)} Punkte seit Oktober
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Empfohlene Maßnahmen</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {topWeaknesses.slice(0, 3).map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {weakness.area} verbessern
                  </li>
                ))}
                {topWeaknesses.length === 0 && (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Gutes Sicherheitsniveau beibehalten
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report-Info</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Unternehmen:</strong> {company.name}</p>
                <p><strong>ID:</strong> {company.id}</p>
                <p><strong>Erstellt am:</strong> {new Date().toLocaleDateString('de-DE')}</p>
                <p><strong>Assessment-Datum:</strong> {company.date}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
