// src/main/react/features/worker-area/results/CompanyDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, FileText, ArrowLeft } from 'lucide-react';

interface Participant {
  id: string;
  sessionId: string;
  name: string;
  position: string;
  department: string;
  completionDate: string;
  status: 'completed' | 'pending' | 'in-progress';
}

interface CompanyOverall {
  companyId: string;
  companyName: string;
  averagePercentageScore: number;
  totalCompletedSessions: number;
  totalSessions: number;
  totalWorkers: number;
  totalCatalogs: number;
  catalogScores: any[]; 
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

        await new Promise(resolve => setTimeout(resolve, 500));


        const mockCompany: CompanyOverall = {
          companyId: companyId || 'C001',
          companyName: 'TechCorp GmbH',
          averagePercentageScore: 75.5,
          totalCompletedSessions: 15,
          totalSessions: 20,
          totalWorkers: 25,
          totalCatalogs: 5,
          catalogScores: [] 
        };

        const mockParticipants: Participant[] = [
          { id: 'w1', sessionId: 'sess_101', name: 'Max Mustermann', position: 'IT-Leiter', department: 'IT', completionDate: '2025-03-15', status: 'completed' },
          { id: 'w2', sessionId: 'sess_102', name: 'Anna Schmidt', position: 'CISO', department: 'Security', completionDate: '2025-03-16', status: 'completed' },
          { id: 'w3', sessionId: 'sess_103', name: 'John Doe', position: 'DevOps', department: 'Engineering', completionDate: '2025-03-18', status: 'in-progress' },
        ];
        
        setCompanyData(mockCompany);
        setParticipants(mockParticipants);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleAnalyzeWorker = (sessionId: string) => {
    navigate(`/app/results/${sessionId}`);
  };

  if (loading) return <AdminLayout><div className="p-10 text-center">Laden...</div></AdminLayout>;
  if (!companyData) return <AdminLayout><div className="p-10 text-center">Unternehmen nicht gefunden</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/app/companylist')} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyData.companyName}</h1>
                <p className="text-gray-500 text-sm">Übersicht & Mitarbeiter</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Durchschnittsscore</p>
              <p className="text-3xl font-bold text-gray-800">{companyData.averagePercentageScore}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Teilnehmer</p>
              <p className="text-3xl font-bold text-gray-800">{participants.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Abgeschlossen</p>
              <p className="text-3xl font-bold text-gray-800">{participants.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mitarbeiter-Liste (Zur Detail-Analyse)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Abteilung</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{p.position}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{p.department}</td>
                      <td className="py-3 px-4">
                         <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.status === 'completed' ? 'Fertig' : 'In Bearbeitung'}
                          </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleAnalyzeWorker(p.sessionId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1 ml-auto transition-colors shadow-sm"
                        >
                          <Search size={14} /> Analysieren
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
