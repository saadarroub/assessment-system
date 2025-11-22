import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from "@/apps/app/AdminLayout";

interface Company {
  id: string;
  name: string;
  overall: number;
  employees: number;
  industry: string;
  date: string;
}

export default function CompanyListPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  useEffect(() => {
    // API abrufen
    fetch("http://localhost:5050/api/companyList")
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
        setCompanies([]);
        setLoading(false);
      });
  }, []);

  // Filtering
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  // Industrie Liste
  const industries = ['all', ...Array.from(new Set(companies.map(c => c.industry)))];

  // Statistik
  const avgScore = Math.round(companies.reduce((sum, c) => sum + c.overall, 0) / companies.length) || 0;
  const criticalCount = companies.filter(c => c.overall < 70).length;
  const goodCount = companies.filter(c => c.overall >= 80).length;

  // Auf CompanyDetailPage
  const handleCompanyClick = (companyId: string) => {
    navigate(`/app/result/${companyId}`);
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

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Unternehmensübersicht</h1>
            <p className="text-gray-500 mt-1">Alle bewerteten Unternehmen im Überblick</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gesamt</p>
                  <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ø Score</p>
                  <p className="text-3xl font-bold text-blue-600">{avgScore}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gut (≥80)</p>
                  <p className="text-3xl font-bold text-green-600">{goodCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kritisch (&lt;70)</p>
                  <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter und Suche */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Suche</label>
                <input
                  type="text"
                  placeholder="Name oder ID suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Branche</label>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry === 'all' ? 'Alle Branchen' : industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Unternehmenstabelle */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Unternehmen ({filteredCompanies.length})
            </h3>
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
                  {filteredCompanies.map((company) => (
                    <tr 
                      key={company.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCompanyClick(company.id)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">{company.id}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompanyClick(company.id);
                          }}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                        >
                          {company.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{company.industry}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{company.employees}</td>
                      <td className="py-3 px-4">
                        <span 
                          className="text-lg font-bold"
                          style={{
                            color: company.overall >= 80 ? '#10B981' : 
                                   company.overall >= 70 ? '#F59E0B' : '#EF4444'
                          }}
                        >
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

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-gray-500">Keine Unternehmen gefunden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
