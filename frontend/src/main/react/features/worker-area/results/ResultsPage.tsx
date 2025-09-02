import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import AppHeader from '@/apps/app/AppHeader';

export default function ResultsPage() {
  const { sessionId } = useParams();

  const securityData = [
    { subject: 'Netzwerksicherheit', score: 85, maxScore: 100, category: 'Technisch' },
    { subject: 'Datenschutz', score: 72, maxScore: 100, category: 'Compliance' },
    { subject: 'Zugriffskontrolle', score: 90, maxScore: 100, category: 'Technisch' },
    { subject: 'Physische Sicherheit', score: 65, maxScore: 100, category: 'Physisch' },
    { subject: 'Mitarbeitersicherheit', score: 78, maxScore: 100, category: 'Human' },
    { subject: 'Incident Response', score: 55, maxScore: 100, category: 'Prozess' }
  ];

  const overallScore = Math.round(securityData.reduce((sum, item) => sum + item.score, 0) / securityData.length);

  const competitorData = [
    { category: 'Unsere Firma', Technisch: 87, Compliance: 72, Prozess: 66, Human: 78, Physisch: 65 },
    { category: 'Branchendurchschnitt', Technisch: 75, Compliance: 80, Prozess: 70, Human: 72, Physisch: 68 },
    { category: 'Top 25%', Technisch: 92, Compliance: 88, Prozess: 85, Human: 85, Physisch: 82 },
  ];

  const trendData = [
    { period: 'Q1 2024', score: 65 },
    { period: 'Q2 2024', score: 68 },
    { period: 'Q3 2024', score: 71 },
    { period: 'Q4 2024', score: 73 },
    { period: 'Q1 2025', score: overallScore }
  ];

  const riskData = [
    { name: 'Niedrig', value: 45, color: '#10B981' },
    { name: 'Mittel', value: 30, color: '#F59E0B' },
    { name: 'Hoch', value: 20, color: '#EF4444' },
    { name: 'Kritisch', value: 5, color: '#DC2626' }
  ];

  const getMaturityLevel = (score: number) => {
    if (score >= 90) return { level: 'Optimiert', color: '#10B981', desc: 'Exzellente Sicherheitsstandards' };
    if (score >= 80) return { level: 'Verwaltet', color: '#3B82F6', desc: 'Gute Sicherheitsmaßnahmen' };
    if (score >= 70) return { level: 'Definiert', color: '#F59E0B', desc: 'Grundlegende Sicherheit vorhanden' };
    if (score >= 50) return { level: 'Wiederholt', color: '#EF4444', desc: 'Verbesserungsbedarf' };
    return { level: 'Initial', color: '#DC2626', desc: 'Dringende Maßnahmen erforderlich' };
  };

  const maturity = getMaturityLevel(overallScore);

  const recommendations = [
    { priority: 'Hoch', area: 'Incident Response', action: 'Incident Response Plan implementieren', effort: 'Hoch', timeline: '3-6 Monate' },
    { priority: 'Hoch', area: 'Physische Sicherheit', action: 'Zugangskontrollen verstärken', effort: 'Mittel', timeline: '1-3 Monate' },
    { priority: 'Mittel', area: 'Datenschutz', action: 'DSGVO-Compliance überprüfen', effort: 'Mittel', timeline: '2-4 Monate' },
    { priority: 'Mittel', area: 'Mitarbeitersicherheit', action: 'Security Awareness Training', effort: 'Niedrig', timeline: '1-2 Monate' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <AppHeader />
      <div className="wrapper p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Ergebnisse</h1>
        <p className="text-gray-500 mb-6">Session: <strong>{sessionId ?? '—'}</strong></p>

        {/* Gesamtpunktzahl - Full Width */}
        <div className="mb-8 w-full">
          <div className="bg-white p-8 rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Gesamtpunktzahl</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={maturity.color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${overallScore * 2.83} 283`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-gray-800">{overallScore}</span>
                  <span className="text-sm text-gray-600">von 100</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-2"
                style={{ backgroundColor: maturity.color + '20', color: maturity.color }}
              >
                {maturity.level}
              </span>
              <p className="text-sm text-gray-600">{maturity.desc}</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailbewertung nach Bereichen</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={securityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Aktuelle Bewertung" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bewertung nach Sicherheitsbereichen</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={securityData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3B82F6">
                  {securityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score < 70 ? '#EF4444' : entry.score < 85 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risiko-Verteilung */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risikoverteilung</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Schlüsselmetriken */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Schlüsselmetriken</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stärkster Bereich:</span>
                <span className="font-medium text-green-600 text-sm">
                  {securityData.reduce((max, item) => item.score > max.score ? item : max).subject}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Schwächster Bereich:</span>
                <span className="font-medium text-red-600 text-sm">
                  {securityData.reduce((min, item) => item.score < min.score ? item : min).subject}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Offene Empfehlungen:</span>
                <span className="font-medium text-blue-600">{recommendations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Branchendurchschnitt:</span>
                <span className="font-medium text-gray-800">73 Punkte</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{overallScore}</div>
                  <div className="text-sm text-gray-500">Ihre Gesamtbewertung</div>
                </div>
              </div>
            </div>
          </div>

          {/* Branchenvergleich */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branchenvergleich</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Technisch" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Compliance" stackId="a" fill="#10B981" />
                <Bar dataKey="Prozess" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Human" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="Physisch" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sicherheitstrend */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sicherheitstrend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Trend:</strong> Kontinuierliche Verbesserung um {overallScore - 65} Punkte seit Q1 2024
              </p>
            </div>
          </div>
        </div>

        {/* Handlungsempfehlungen */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prioritäre Handlungsempfehlungen</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Priorität</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Bereich</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Maßnahme</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Aufwand</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Zeitrahmen</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{rec.area}</td>
                    <td className="py-3 px-4 text-gray-700">{rec.action}</td>
                    <td className="py-3 px-4 text-gray-600">{rec.effort}</td>
                    <td className="py-3 px-4 text-gray-600">{rec.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nächste Schritte</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Detailanalyse der kritischen Bereiche durchführen</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Implementierungsplan für Empfehlungen erstellen</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Quartalsbewertung für Fortschrittsmessung einplanen</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Mitarbeiterschulungen priorisieren</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kontakt & Support</h3>
            <div className="text-gray-700 space-y-2">
              <p><strong>Bewertungsdatum:</strong> {new Date().toLocaleDateString('de-DE')}</p>
              <p><strong>Nächste Bewertung:</strong> {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}</p>
              <p><strong>Berichts-ID:</strong> SEC-2025-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Bei Fragen zu diesem Bericht oder Unterstützung bei der Implementierung kontaktieren Sie unser Security-Team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

