import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdminLayout from "@/apps/app/AdminLayout";

interface Participant {
  name: string;
  position: string;
  department: string;
  completionDate: string;
  status: 'completed' | 'pending' | 'in-progress';
}

interface ThemaScore {
  themaId: string;
  themaName: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  completedSessions: number;
  totalSessions: number;
}

interface CatalogScore {
  catalogId: string;
  catalogTitle: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  completedSessions: number;
  totalSessions: number;
  themaScores: ThemaScore[];
  workerScores: any[];
}

interface CompanyOverall {
  companyId: string;
  companyName: string;
  averagePercentageScore: number;
  totalCompletedSessions: number;
  totalSessions: number;
  totalWorkers: number;
  totalCatalogs: number;
  catalogScores: CatalogScore[];
}

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyOverall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/scoring/company/${companyId}/overall`);
        
        if (!response.ok) {
          throw new Error('API call failed');
        }
        
        const data = await response.json();
        setCompanyData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching company data:', error);
        
        
        // Mock-Daten für Demo (falls API nicht verfügbar)
        const mockData: CompanyOverall = {
          companyId: companyId || 'C001',
          companyName: 'TechCorp GmbH',
          averagePercentageScore: 75.5,
          totalCompletedSessions: 150,
          totalSessions: 200,
          totalWorkers: 250,
          totalCatalogs: 5,
          catalogScores: [
            {
              catalogId: 'cat1',
              catalogTitle: 'Zugriffskontrolle',
              totalScore: 450.5,
              maxPossibleScore: 600.0,
              percentageScore: 87.2,
              completedSessions: 30,
              totalSessions: 40,
              themaScores: [
                { themaId: 't1', themaName: 'Authentifizierung', totalScore: 85, maxPossibleScore: 100, percentageScore: 85.0, completedSessions: 10, totalSessions: 15 },
                { themaId: 't2', themaName: 'Autorisierung', totalScore: 90, maxPossibleScore: 100, percentageScore: 90.0, completedSessions: 10, totalSessions: 12 },
                { themaId: 't3', themaName: 'Multi-Faktor', totalScore: 88, maxPossibleScore: 100, percentageScore: 88.0, completedSessions: 10, totalSessions: 13 }
              ],
              workerScores: []
            },
            {
              catalogId: 'cat2',
              catalogTitle: 'Netzwerksicherheit',
              totalScore: 410.0,
              maxPossibleScore: 500.0,
              percentageScore: 82.0,
              completedSessions: 28,
              totalSessions: 35,
              themaScores: [
                { themaId: 't4', themaName: 'Firewall-Konfiguration', totalScore: 80, maxPossibleScore: 100, percentageScore: 80.0, completedSessions: 9, totalSessions: 12 },
                { themaId: 't5', themaName: 'VPN-Nutzung', totalScore: 85, maxPossibleScore: 100, percentageScore: 85.0, completedSessions: 10, totalSessions: 11 },
                { themaId: 't6', themaName: 'Intrusion Detection', totalScore: 78, maxPossibleScore: 100, percentageScore: 78.0, completedSessions: 9, totalSessions: 12 }
              ],
              workerScores: []
            },
            {
              catalogId: 'cat3',
              catalogTitle: 'Mitarbeitersicherheit',
              totalScore: 375.0,
              maxPossibleScore: 500.0,
              percentageScore: 75.0,
              completedSessions: 25,
              totalSessions: 32,
              themaScores: [
                { themaId: 't7', themaName: 'Security Awareness', totalScore: 72, maxPossibleScore: 100, percentageScore: 72.0, completedSessions: 8, totalSessions: 11 },
                { themaId: 't8', themaName: 'Phishing-Erkennung', totalScore: 78, maxPossibleScore: 100, percentageScore: 78.0, completedSessions: 9, totalSessions: 10 },
                { themaId: 't9', themaName: 'Passwort-Richtlinien', totalScore: 76, maxPossibleScore: 100, percentageScore: 76.0, completedSessions: 8, totalSessions: 11 }
              ],
              workerScores: []
            },
            {
              catalogId: 'cat4',
              catalogTitle: 'Datenschutz',
              totalScore: 365.0,
              maxPossibleScore: 500.0,
              percentageScore: 73.0,
              completedSessions: 24,
              totalSessions: 30,
              themaScores: [
                { themaId: 't10', themaName: 'DSGVO-Compliance', totalScore: 70, maxPossibleScore: 100, percentageScore: 70.0, completedSessions: 8, totalSessions: 10 },
                { themaId: 't11', themaName: 'Datenverschlüsselung', totalScore: 76, maxPossibleScore: 100, percentageScore: 76.0, completedSessions: 8, totalSessions: 10 },
                { themaId: 't12', themaName: 'Datenminimierung', totalScore: 74, maxPossibleScore: 100, percentageScore: 74.0, completedSessions: 8, totalSessions: 10 }
              ],
              workerScores: []
            },
            {
              catalogId: 'cat5',
              catalogTitle: 'Incident Response',
              totalScore: 310.0,
              maxPossibleScore: 500.0,
              percentageScore: 62.0,
              completedSessions: 20,
              totalSessions: 28,
              themaScores: [
                { themaId: 't13', themaName: 'Notfallpläne', totalScore: 60, maxPossibleScore: 100, percentageScore: 60.0, completedSessions: 7, totalSessions: 9 },
                { themaId: 't14', themaName: 'Backup & Recovery', totalScore: 64, maxPossibleScore: 100, percentageScore: 64.0, completedSessions: 7, totalSessions: 9 },
                { themaId: 't15', themaName: 'Incident Reporting', totalScore: 62, maxPossibleScore: 100, percentageScore: 62.0, completedSessions: 6, totalSessions: 10 }
              ],
              workerScores: []
            }
          ]
        };
       const dummyParticipants: Participant[] = [
          { name: 'Max Mustermann', position: 'IT-Leiter', department: 'IT-Abteilung', completionDate: '2025-03-15', status: 'completed' },
          { name: 'Anna Schmidt', position: 'CISO', department: 'Sicherheit', completionDate: '2025-03-15', status: 'completed' },
          { name: 'Peter Wagner', position: 'Compliance Officer', department: 'Compliance', completionDate: '2025-03-15', status: 'completed' }
        ];
        
        setParticipants(dummyParticipants);  
        
        setCompanyData(mockData);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const exportToExcel = () => {
    if (!companyData) return;
    
    const data = [
      ['Unternehmensdetails'],
      ['ID', 'Name', 'Gesamtscore %', 'Mitarbeiter', 'Kataloge', 'Abgeschlossene Sessions'],
      [companyData.companyId, companyData.companyName, companyData.averagePercentageScore, companyData.totalWorkers, companyData.totalCatalogs, companyData.totalCompletedSessions],
      [],
      ['Katalog-Scores'],
      ['Katalog', 'Score %', 'Punkte', 'Max Punkte', 'Abgeschlossen', 'Gesamt Sessions'],
      ...companyData.catalogScores.map(c => [
        c.catalogTitle, 
        c.percentageScore.toFixed(2), 
        c.totalScore.toFixed(2), 
        c.maxPossibleScore.toFixed(2),
        c.completedSessions, 
        c.totalSessions
      ]),
      [],
      ['Themen-Details'],
      ['Katalog', 'Thema', 'Score %', 'Punkte', 'Max Punkte', 'Abgeschlossen', 'Gesamt Sessions']
    ];
    
    companyData.catalogScores.forEach(catalog => {
      catalog.themaScores.forEach(thema => {
        data.push([
          catalog.catalogTitle,
          thema.themaName,
          thema.percentageScore.toFixed(2),
          thema.totalScore.toFixed(2),
          thema.maxPossibleScore.toFixed(2),
          thema.completedSessions,
          thema.totalSessions
        ]);
      });
    });
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${companyData.companyName}_${new Date().toISOString().split('T')[0]}.csv`;
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

      pdf.save(`${companyData?.companyName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

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

  if (!companyData) {
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

  // Zeitverlauf Mock-Daten (basierend auf aktuellem Score)
  const timelineData = [
    { month: 'Okt 2024', avgScore: Math.max(0, companyData.averagePercentageScore - 12) },
    { month: 'Nov 2024', avgScore: Math.max(0, companyData.averagePercentageScore - 9) },
    { month: 'Dez 2024', avgScore: Math.max(0, companyData.averagePercentageScore - 6) },
    { month: 'Jan 2025', avgScore: Math.max(0, companyData.averagePercentageScore - 4) },
    { month: 'Feb 2025', avgScore: Math.max(0, companyData.averagePercentageScore - 2) },
    { month: 'Mär 2025', avgScore: companyData.averagePercentageScore }
  ];

  // Katalog-Scores für Bar Chart
  const catalogChartData = companyData.catalogScores.map(cat => ({
    name: cat.catalogTitle.length > 15 ? cat.catalogTitle.substring(0, 12) + '...' : cat.catalogTitle,
    score: cat.percentageScore
  }));

  // Alle Themen sammeln mit Katalog-Info
  const allThemas: Array<ThemaScore & { catalogTitle: string }> = [];
  companyData.catalogScores.forEach(catalog => {
    catalog.themaScores.forEach(thema => {
      allThemas.push({
        ...thema,
        catalogTitle: catalog.catalogTitle
      });
    });
  });

  // Themen für Bar Chart (alle Themen)
  const themaChartData = allThemas.map(thema => ({
    name: thema.themaName.length > 20 ? thema.themaName.substring(0, 17) + '...' : thema.themaName,
    fullName: thema.themaName,
    score: thema.percentageScore,
    catalog: thema.catalogTitle
  }));

  // Top schwächste Themen für Verbesserungsbereiche
  const weakestThemas = [...allThemas]
    .sort((a, b) => a.percentageScore - b.percentageScore)
    .slice(0, 5)
    .map(t => ({
      name: t.themaName.length > 25 ? t.themaName.substring(0, 22) + '...' : t.themaName,
      score: t.percentageScore
    }));

  // Radar Chart Daten (Katalog-Scores)
  const radarData = companyData.catalogScores.map(cat => ({
    category: cat.catalogTitle.length > 20 ? cat.catalogTitle.substring(0, 17) + '...' : cat.catalogTitle,
    score: cat.percentageScore
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return '✓ Gut';
    if (score >= 70) return '⚠ Mittel';
    return '✗ Kritisch';
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
                  <h1 className="text-3xl font-bold text-gray-900">{companyData.companyName}</h1>
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
                    color: getScoreColor(companyData.averagePercentageScore)
                  }}>
                    {companyData.averagePercentageScore.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className={`text-xs mt-2`} style={{ color: getScoreColor(companyData.averagePercentageScore) }}>
                {getStatusText(companyData.averagePercentageScore)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mitarbeiter</p>
                  <p className="text-3xl font-bold text-green-600">{companyData.totalWorkers}</p>
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
                <p className="text-sm text-gray-600 mb-1">Kataloge</p>
                <p className="text-3xl font-bold text-purple-600">{companyData.totalCatalogs}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div>
                <p className="text-sm text-gray-600 mb-1">Abgeschlossene Sessions</p>
                <p className="text-3xl font-bold text-blue-600">{companyData.totalCompletedSessions}</p>
                <p className="text-xs text-gray-500 mt-1">von {companyData.totalSessions} gesamt</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div>
                <p className="text-sm text-gray-600 mb-1">ID</p>
                <p className="text-lg font-mono font-bold text-gray-800">{companyData.companyId.substring(0, 8)}...</p>
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
                  <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={3} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Themen (alle Themen aus allen Katalogen) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Themen-Übersicht</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={themaChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-xs">
                            <p className="font-semibold">{data.fullName}</p>
                            <p>Katalog: {data.catalog}</p>
                            <p>Score: {data.score.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" name="Score %">
                    {themaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Themen Radar */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Themen-Bewertung</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score %" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pro Katalog (Bar Chart) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reifgrad pro Katalog</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={catalogChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" name="Score %">
                    {catalogChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
        </div>
      </div>
    </AdminLayout>
  );
}
