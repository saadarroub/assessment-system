import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Search, ArrowLeft, Building2 } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { Network } from "lucide-react";

interface Participant {
  id: string;
  sessionId: string;
  name: string;
  position: string;
  department: string;
  completionDate: string;
  status: "completed" | "pending" | "in-progress";
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

const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "–";

export default function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState<CompanyOverall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockCompany: CompanyOverall = {
        companyId: companyId || "C001",
        companyName: "TechCorp GmbH",
        averagePercentageScore: 75.5,
        totalCompletedSessions: 15,
        totalSessions: 20,
        totalWorkers: 25,
        totalCatalogs: 5,
        catalogScores: [],
      };

      const mockParticipants: Participant[] = [
        { id: "w1", sessionId: "sess_101", name: "Max Mustermann", position: "IT-Leiter", department: "IT", completionDate: "2025-03-15", status: "completed" },
        { id: "w2", sessionId: "sess_102", name: "Anna Schmidt", position: "CISO", department: "Security", completionDate: "2025-03-16", status: "completed" },
        { id: "w3", sessionId: "sess_103", name: "John Doe", position: "DevOps", department: "Engineering", completionDate: "2025-03-18", status: "in-progress" },
      ];

      setCompanyData(mockCompany);
      setParticipants(mockParticipants);
      setLoading(false);
    };

    fetchCompanyData();
  }, [companyId]);

  const filteredParticipants = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return participants;
    return participants.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.position.toLowerCase().includes(term) ||
      p.department.toLowerCase().includes(term)
    );
  }, [participants, q]);

  const handleAnalyzeWorker = (id: string) => {
    navigate(`/app/employee/${id}`); // 경로 수정됨
  };

  if (loading) return <AdminLayout><div className="p-10 text-center">Laden...</div></AdminLayout>;
  if (!companyData) return <AdminLayout><div className="p-10 text-center">Nicht gefunden</div></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader
        title={companyData.companyName}
        subtitle="Übersicht & Mitarbeiter"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />
      <main className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20" style={{ background: "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)" }}>
        <div className="max-w-[1400px] mx-auto mb-3 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-white">
                <ArrowLeft size={16} /> Zurück
            </button>
        </div>
        <section className="max-w-[1400px] mx-auto rounded-[12px] border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Position</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParticipants.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-4 font-semibold">{p.name}</td>
                                <td className="px-4 py-4">{p.position}</td>
                                <td className="px-4 py-4">{p.status}</td>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => handleAnalyzeWorker(p.id)} className="text-blue-600 hover:underline">Analysieren</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </main>
    </AdminLayout>
  );
}
