// src/main/react/features/worker-area/results/ResultsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, List, Save, AlertCircle } from 'lucide-react';
import AdminLayout from "@/apps/app/AdminLayout";

import { getQuestionsTimeline, getManualScoring, updateAnswerScore } from '@/api/scoringApi'; 

// import { getWorkerById } from '@/features/service/userService'; 

interface TimelineItem {
  questionId: string;
  questionText: string;
  answerText: string;
  timestamp: string;

}

interface ScoringItem {
  questionId: string;
  category: string;
  questionText: string;
  answerText: string;
  score: number | null;
  maxScore?: number;
}

interface ScoringCategory {
  categoryName: string;
  items: ScoringItem[];
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState<'timeline' | 'scoring'>('timeline');
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [scoringData, setScoringData] = useState<ScoringCategory[]>([]); 
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'timeline') {
          const data = await getQuestionsTimeline(sessionId);
          setTimelineData(Array.isArray(data) ? data : []); 
        } else {
          const data = await getManualScoring(sessionId);
          
          setScoringData(transformToCategories(data)); 
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, activeTab]);


  const transformToCategories = (data: any[]): ScoringCategory[] => {

    if (data.length > 0 && 'categoryName' in data[0]) return data;
    

    const grouped: Record<string, ScoringItem[]> = {};
    data.forEach((item) => {
      const cat = item.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return Object.entries(grouped).map(([name, items]) => ({ categoryName: name, items }));
  };


  const handleScoreUpdate = async (questionId: string, newScore: string) => {
    if (!sessionId) return;
    const scoreNum = parseFloat(newScore);
    if (isNaN(scoreNum)) return;

    try {
      await updateAnswerScore(sessionId, questionId, scoreNum);

      setScoringData(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(item => 
          item.questionId === questionId ? { ...item, score: scoreNum } : item
        )
      })));

    } catch (error) {
      alert("Fehler beim Speichern des Scores.");
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ergebnisse & Bewertung</h1>
                <p className="text-xs text-gray-500">Session ID: {sessionId}</p>
              </div>
            </div>
            
            {/* View Toggle Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock size={16} /> Timeline
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'scoring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} /> Manual Scoring
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-10">Laden...</div>
          ) : (
            <>
              {/* === TIMELINE VIEW === */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                   <h2 className="text-lg font-semibold text-gray-700 mb-4">Antworten-Verlauf</h2>
                   <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                      {timelineData.map((item, idx) => (
                        <div key={idx} className="mb-8 ml-6 relative">
                          <span className="absolute -left-9 top-0 bg-blue-100 text-blue-600 rounded-full p-1.5 border-2 border-white">
                            <Clock size={14} />
                          </span>
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
                            <h3 className="font-medium text-gray-900">{item.questionText}</h3>
                            <p className="mt-2 text-gray-600 bg-gray-50 p-3 rounded">{item.answerText}</p>
                          </div>
                        </div>
                      ))}
                      {timelineData.length === 0 && <div className="ml-6 text-gray-500">Keine Daten verfügbar.</div>}
                   </div>
                </div>
              )}

              {/* === MANUAL SCORING VIEW === */}
              {activeTab === 'scoring' && (
                <div className="space-y-8">
                  {scoringData.map((category, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">{category.categoryName}</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item) => (
                          <div key={item.questionId} className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">{item.questionText}</p>
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                                {item.answerText || <span className="text-gray-400 italic">Keine Antwort</span>}
                              </div>
                            </div>
                            
                            {/* Scoring Input Area */}
                            <div className="w-full md:w-48 flex flex-col gap-2">
                              <label className="text-xs font-semibold text-gray-500 uppercase">Score (0-10)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  defaultValue={item.score ?? ''}
                                  onBlur={(e) => handleScoreUpdate(item.questionId, e.target.value)}
                                  className={`w-full border rounded px-3 py-2 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500 ${
                                    item.score === null ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                                  }`}
                                  placeholder="-"
                                />
                                {item.score === null && (
                                  <AlertCircle size={20} className="text-orange-500" title="Bewertung ausstehend" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 text-center">Automatisch gespeichert</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {scoringData.length === 0 && <div className="text-center text-gray-500">Keine Kategorien gefunden.</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
