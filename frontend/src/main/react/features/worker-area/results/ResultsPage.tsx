import { useParams } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import AppHeader from '@/apps/app/AppHeader';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  
  const convertChartsToImages = async () => {
    const charts = document.querySelectorAll('.recharts-wrapper');
    const promises = Array.from(charts).map(async (chart) => {
      try {
        const parentElement = chart.parentNode as HTMLElement;
        if (!parentElement) {
          throw new Error('Parent element not found');
        }

        const canvas = await html2canvas(parentElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = imgData;
        img.style.width = `${parentElement.offsetWidth}px`;
        img.style.height = `${parentElement.offsetHeight}px`;
        img.style.display = 'block';
        
        (chart as HTMLElement).style.display = 'none';
        parentElement.appendChild(img);
      
        return { chart, img };
      } catch (error) {
        console.error('Chart conversion error:', error);
        return null;
      }    
    });
  
  const results = await Promise.all(promises);
  return results.filter(result => result !== null);
};



const exportToExcel = () => {
  const excelButton = document.getElementById('excel-btn') as HTMLButtonElement;
  if (excelButton) {
    excelButton.disabled = true;
    excelButton.textContent = 'Excel generieren...';
  }

  try {
    const data = [
      ['Sicherheitsbereich', 'Aktueller Score', 'Max Score', 'Kategorie'],
      ...securityData.map(item => [item.subject, item.score, item.maxScore, item.category]),
      [],
      ['Empfehlungen'],
      ['Priorität', 'Bereich', 'Maßnahme', 'Aufwand', 'Zeitrahmen'],
      ...recommendations.map(rec => [rec.priority, rec.area, rec.action, rec.effort, rec.timeline])
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Security_Assessment_${sessionId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  } finally {
    setTimeout(() => {
      const btn = document.getElementById('excel-btn') as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Als Excel exportieren';
      }
    }, 1000);
  }
};

const convertSVGToImage = (svg: SVGElement): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const bounds = svg.getBoundingClientRect();
      canvas.width = bounds.width;
      canvas.height = bounds.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(blob);
            imgElement.style.width = `${canvas.width}px`;
            imgElement.style.height = `${canvas.height}px`;
            resolve(imgElement);
          }
        });
      }
    };
    
    img.src = url;
  });
};



const exportToPNG = async () => {
  const element = document.getElementById('results-content');
  if (!element) return;

  try {
    const pngButton = document.getElementById('png-btn') as HTMLButtonElement;
    if (pngButton) {
      pngButton.disabled = true;
      pngButton.textContent = 'PNG generieren...';
    }

    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(document.body, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      x: element.offsetLeft,
      y: element.offsetTop,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const link = document.createElement('a');
    link.download = `Security_Assessment_${sessionId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
  } catch (error) {
    console.error('PNG export error:', error);
  } finally {
    const pngButton = document.getElementById('png-btn') as HTMLButtonElement;
    if (pngButton) {
      pngButton.disabled = false;
      pngButton.textContent = 'Als PNG exportieren';
    }
  }
};
  
  
  
  
  
  
  
  
  
  
  
  
  const exportToPDF = async () => {
  const element = document.getElementById('results-content');
  if (!element) return;

  try {
    const exportButton = document.getElementById('export-btn') as HTMLButtonElement;
    if (exportButton) {
      exportButton.disabled = true;
      exportButton.textContent = 'PDF generieren...';
    }

    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
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

    const filename = `Security_Assessment_${sessionId || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('PDF export error:', error);
    alert('PDF error.');
  } finally {
    const exportButton = document.getElementById('export-btn') as HTMLButtonElement;
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.textContent = 'Als PDF exportieren';
    }
  }
};

  return (
    <>
      <AppHeader />
      <div className="wrapper p-6 bg-gray-50 min-h-screen">
        
        
        <div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-1">Ergebnisse</h1>
    <p className="text-gray-500">Session: <strong>{sessionId ?? '—'}</strong></p>
  </div>
  <div className="flex gap-2">
  <button
    id="export-btn"
    onClick={exportToPDF}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Als PDF exportieren
  </button>
  
  <button 
    id="excel-btn"
    onClick={exportToExcel} 
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Als Excel exportieren
  </button>
  
  <button 
    id="png-btn"
    onClick={exportToPNG} 
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    Als PNG exportieren
  </button>
</div>
</div>

        
        <div id="results-content" className="space-y-8">
        

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
      
      
      </div>
    </>
  );
}

