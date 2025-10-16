import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/apps/app/AdminLayout';
import '@/styles/admin.css';
import {
  ArrowLeft,
  Plus,
  Folder,
  BarChart3,
  MessageSquare,
  ListPlus,
  Trash2,
  Edit3,
 
  
} from 'lucide-react';

const stats = [
  { label: 'Kataloge', value: 5, icon: Folder },
  { label: 'Gesamtfragen', value: 50, icon: MessageSquare },
  { label: 'Durchschnitt', value: '10.5 pro Katalog', icon: BarChart3 },
];

const catalogs = [
  {
    id: 1,
    title: 'Katalog 1 – Prozesse',
    subtitle: 'Organisationsstrukturen',
    questions: 15,
    updated: 'Heute',
  },
  {
    id: 2,
    title: 'Katalog 2 – Prozesse',
    subtitle: 'Geschäftsprozesse',
    questions: 20,
    updated: 'Gestern',
  },
  {
    id: 3,
    title: 'Katalog 3 – Governance',
    subtitle: 'IT-Governance und Compliance',
    questions: 15,
    updated: 'Heute',
  },
];

export default function EamPaget() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="bg-[rgba(86,118,143,0.1)] px-10 pt-10 pb-16 border-b border-gray-200 rounded-b-xl">
        <div
          className="w-fit bg-gray-100 hover:bg-blue-50 active:bg-blue-100 
          rounded-lg shadow px-4 py-3 flex items-center gap-2 
          cursor-pointer transition-all duration-200 
          transform hover:-translate-y-0.5"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium text-gray-800">
            Zurück zur Übersicht
          </span>
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <div className="bg-[#56768f] p-3 rounded-xl shadow">
              <BarChart3 size={26} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-6xl font-bold">Enterprise Architecture Management</h1>
          </div>
          <p className="text-gray-600 mt-4">Strategische IT-Planung und -Ausrichtung</p>
        </div>
      </div>

      {/* Statistikkarten */}
      <div className="px-10 pt-2 pb-10 bg-white">
        <div className="px-1 pt-4 flex justify-end">
          <button className="flex items-center gap-2 bg-[#56768f] text-white font-medium px-4 py-2 
           rounded shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Plus size={16} />Neuer Katalog
          </button>
        </div>

        <div className="px-max-w-screen-xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white border-l-4 border-t-2 border-[#56768f] rounded-lg shadow p-4 min-w-[280px] flex-[1_1_300px]"
              >
                <p className="text-sm text-gray-500">{s.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
                  {i === 0 && <Folder size={26} className="text-[#56768f]" />}
                  {i === 1 && <MessageSquare size={26} className="text-[#56768f]" />}
                  {i === 2 && <BarChart3 size={26} className="text-[#56768f]" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Katalogkarten */}
      <div className="px-10 pt-2 pb-10 bg-white">
        <div className="px-1 pt-4 flex justify-end" />

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {catalogs.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border-t-8 border-[#56768f] rounded-lg shadow p-4 min-w-[280px] flex-[1_1_300px]"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">{cat.title}</h2>
                <span className="text-sm text-gray-500">{cat.questions} Fragen</span>
              </div>

              <p className="text-sm text-gray-500 mb-4">{cat.subtitle}</p>

              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Aktiv
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Letzte Änderung: {cat.updated}
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 pt-4">
                <button className="px-4 py-2 border rounded flex items-center justify-center gap-2 text-[#56768f] text-sm hover:bg-gray-50">
                  <Edit3 size={16} /> Bearbeiten
                </button>

                <button className="px-4 py-2 border border-red-500 text-red-500 rounded flex items-center justify-center gap-2 text-sm hover:bg-red-50">
                  <Trash2 size={16} /> Löschen
                </button>

                <button className="flex-1 min-w-[140px] bg-[#56768f] text-white px-2 py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-[#56768f]/80">
                  <ListPlus size={16} /> Fragen verwalten
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
