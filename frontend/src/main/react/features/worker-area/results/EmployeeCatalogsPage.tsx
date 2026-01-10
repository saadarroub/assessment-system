import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, FileText, ChevronRight, BarChart2, Search, Users } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  score: number;
  status: "completed" | "pending";
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

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

export default function EmployeeCatalogsPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setEmployee({
        id: workerId || "w1",
        name: "Max Mustermann",
        department: "IT",
        catalogs: [
          {
            id: "cat_001",
            name: "IT-Strategie 2025",
            date: "2025-03-15",
            overallScore: 78,
            topics: [
              { id: "t1", name: "Cloud Governance", score: 85, status: "completed", sessionId: "sess_101" },
              { id: "t2", name: "Security Policies", score: 60, status: "completed", sessionId: "sess_102" },
            ],
          },
        ],
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [workerId]);

  const handleExportCatalog = (catalog: Catalog) => {
    const doc = new jsPDF();
    doc.text(`Report: ${catalog.name}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Thema", "Status", "Score"]],
      body: catalog.topics.map((t) => [t.name, t.status, `${t.score}%`]),
    });
    doc.save("Report.pdf");
  };

  const filteredCatalogs = useMemo(() => {
    if (!employee) return [];
    return employee.catalogs.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  }, [employee, q]);

  if (loading) return <AdminLayout><div className="p-10 text-center">Laden...</div></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader
        title={employee?.name ?? "Employee"}
        subtitle="Catalogs"
        icon={<BarChart2 size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />
      <main className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20" style={{ background: "#f3f4f7" }}>
        <div className="max-w-[1400px] mx-auto mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <ArrowLeft size={16} /> Zurück
            </button>
        </div>
        
        <div className="max-w-[1400px] mx-auto space-y-4">
            {filteredCatalogs.map(catalog => (
                <div key={catalog.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 flex justify-between items-center cursor-pointer" onClick={() => setExpandedCatalogId(expandedCatalogId === catalog.id ? null : catalog.id)}>
                        <div className="flex items-center gap-4">
                            <FileText size={24} className="text-[#264555]" />
                            <div>
                                <h3 className="font-bold text-lg">{catalog.name}</h3>
                                <p className="text-sm text-gray-500">{catalog.topics.length} Themen</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-[#264555]">{catalog.overallScore}%</span>
                            <button onClick={(e) => {e.stopPropagation(); handleExportCatalog(catalog)}} className="px-3 py-1 bg-gray-100 rounded text-sm">PDF</button>
                            <ChevronRight className={`transition ${expandedCatalogId === catalog.id ? 'rotate-90' : ''}`} />
                        </div>
                    </div>
                    {expandedCatalogId === catalog.id && (
                        <div className="bg-gray-50 p-6 border-t space-y-2">
                            {catalog.topics.map(t => (
                                <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                    <span>{t.name}</span>
                                    <div className="flex gap-3 items-center">
                                        <span className={`px-2 py-1 rounded text-xs ${t.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{t.score}%</span>
                                        <button onClick={() => navigate(`/app/results/${t.sessionId}`)} className="text-blue-600 text-sm hover:underline">Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </main>
    </AdminLayout>
  );
}
