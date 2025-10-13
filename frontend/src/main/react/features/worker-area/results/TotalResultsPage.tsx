import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6m');

  // Simulierte Daten für mehrere Unternehmen
  const companiesData = [
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

  const averageScore = Math.round(companiesData.reduce((sum, c) => sum + c.overall, 0) / companiesData.length);

  // Branchen-Durchschnitte
  const industryAverages = [
    { industry: 'Finance', avg: 88, count: 1 },
    { industry: 'Energy', avg: 85, count: 1 },
    { industry: 'Healthcare', avg: 82, count: 1 },
    { industry: 'Logistics', avg: 79, count: 1 },
    { industry: 'TechCorp', avg: 75, count: 1 },
    { industry: 'Education', avg: 73, count: 1 },
    { industry: 'Retail', avg: 71, count: 1 },
    { industry: 'Food', avg: 70, count: 1 },
    { industry: 'Manufacturing', avg: 68, count: 1 },
    { industry: 'Construction', avg: 65, count: 1 }
  ];

  // Zeitlicher Verlauf
  const timelineData = [
    { month: 'Okt 2024', avgScore: 68, assessments: 12 },
    { month: 'Nov 2024', avgScore: 70, assessments: 15 },
    { month: 'Dez 2024', avgScore: 71, assessments: 18 },
    { month: 'Jan 2025', avgScore: 73, assessments: 22 },
    { month: 'Feb 2025', avgScore: 74, assessments: 20 },
    { month: 'Mär 2025', avgScore: 76, assessments: 25 }
  ];

  // Kategorien-Durchschnitte
  const categoryAverages = [
    { category: 'Zugriffskontrolle', score: 87 },
    { category: 'Netzwerksicherheit', score: 82 },
    { category: 'Mitarbeitersicherheit', score: 75 },
    { category: 'Datenschutz', score: 73 },
    { category: 'Physische Sicherheit', score: 68 },
    { category: 'Incident Response', score: 62 }
  ];

  // Reifegrad-Verteilung
  const maturityDistribution = [
    { level: 'Optimiert (90+)', count: 0, color: '#10B981' },
    { level: 'Verwaltet (80-89)', count: 3, color: '#3B82F6' },
    { level: 'Definiert (70-79)', count: 4, color: '#F59E0B' },
    { level: 'Wiederholt (50-69)', count: 3, color: '#EF4444' },
    { level: 'Initial (<50)', count: 0, color: '#DC2626' }
  ];

  // Unternehmensgrößen vs. Scores
  const sizeVsScore = companiesData.map(c => ({
    name: c.name,
    employees: c.employees,
    score: c.overall
  }));

  // Top Schwachstellen
  const topWeaknesses = [
    { area: 'Incident Response', percentage: 68, companies: 7 },
    { area: 'Physische Sicherheit', percentage: 52, companies: 5 },
    { area: 'Datenschutz', percentage: 48, companies: 5 },
    { area: 'Mitarbeitersicherheit', percentage: 44, companies: 4 },
    { area: 'Backup-Strategie', percentage: 36, companies: 4 }
  ];

  const exportToExcel = () => {
    const data = [
      ['Unternehmensübersicht'],
      ['ID', 'Name', 'Gesamtscore', 'Mitarbeiter', 'Branche', 'Datum'],
      ...companiesData.map(c => [c.id, c.name, c.overall, c.employees, c.industry, c.date]),
      [],
      ['Branchendurchschnitte'],
      ['Branche', 'Durchschnitt', 'Anzahl'],
      ...industryAverages.map(i => [i.industry, i.avg, i.count]),
      [],
      ['Kategorien-Durchschnitte'],
      ['Kategorie', 'Score'],
      ...categoryAverages.map(c => [c.category, c.score])
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Gesamtanalyse_${new Date().toISOString().split('T')[0]}.csv`;
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

      pdf.save(`Gesamtanalyse_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gesamtanalyse Dashboard</h1>
              <p className="text-gray-500 mt-1">Aggregierte Sicherheitsbewertungen aller Unternehmen</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Durchschnittsscore</p>
                <p className="text-3xl font-bold text-blue-600">{averageScore}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 8% vs. Vormonat</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assessments</p>
                <p className="text-3xl font-bold text-green-600">{companiesData.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Letzter Monat</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kritische Fälle</p>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">Score &lt; 70</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Branchen</p>
                <p className="text-3xl font-bold text-purple-600">{industryAverages.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Abgedeckt</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Zeitlicher Verlauf */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Durchschnittliche Entwicklung</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={3} name="Ø Score" />
                <Line yAxisId="right" type="monotone" dataKey="assessments" stroke="#10B981" strokeWidth={2} name="Assessments" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Branchenvergleich */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branchendurchschnitte</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={industryAverages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="industry" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg" name="Durchschnitt">
                  {industryAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avg >= 80 ? '#10B981' : entry.avg >= 70 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Kategorien-Radar */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Durchschnitt nach Kategorien</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={categoryAverages}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Durchschnitt" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Reifegrad-Verteilung */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reifegrad-Verteilung</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={maturityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, count }) => `${level.split(' ')[0]}: ${count}`}
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

          {/* Unternehmensgröße vs. Score */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Unternehmensgröße vs. Sicherheitsscore</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="employees" name="Mitarbeiter" />
                <YAxis type="number" dataKey="score" name="Score" domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Unternehmen" data={sizeVsScore} fill="#8B5CF6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Top Schwachstellen */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Häufigste Schwachstellen</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topWeaknesses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" angle={-20} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#EF4444" name="Betroffene (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unternehmenstabelle */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alle Unternehmen</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unternehmen</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branche</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Mitarbeiter</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Datum</th>
                </tr>
              </thead>
              <tbody>
                {companiesData.map((company, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{company.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{company.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{company.industry}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{company.employees}</td>
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold" style={{
                        color: company.overall >= 80 ? '#10B981' : company.overall >= 70 ? '#F59E0B' : '#EF4444'
                      }}>
                        {company.overall}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        company.overall >= 80 ? 'bg-green-100 text-green-800' :
                        company.overall >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {company.overall >= 80 ? 'Gut' : company.overall >= 70 ? 'Mittel' : 'Kritisch'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{company.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zusammenfassung */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Wichtigste Erkenntnisse</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Durchschnittlicher Score liegt bei {averageScore} Punkten
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Finance-Branche führt mit 88 Punkten
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Incident Response ist häufigste Schwachstelle
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Positive Entwicklung: +8% in 6 Monaten
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Empfohlene Maßnahmen</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Incident Response Plans branchenweit implementieren
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Best Practices von Finance-Sektor teilen
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Fokus auf kleinere Unternehmen (&lt;200 MA)
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Quartalsweise Nachbewertungen ansetzen
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report-Info</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Erstellungsdatum:</strong> {new Date().toLocaleDateString('de-DE')}</p>
              <p><strong>Zeitraum:</strong> Okt 2024 - Mär 2025</p>
              <p><strong>Datenbasis:</strong> {companiesData.length} Assessments</p>
              <p><strong>Report-ID:</strong> AGG-{new Date().getFullYear()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
