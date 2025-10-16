import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '@/apps/app/AdminLayout';
import { ArrowLeft, MessageSquare, X, Circle, List, BarChart3 } from 'lucide-react';
import '@/styles/admin.css';

export default function MyAdminPage() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedType, setSelectedType] = useState('Ja/Nein');

  return (
    <AdminLayout>
      <div className="bg-[rgba(210,201,185,0.2)] px-10 pt-10 pb-12 border-b border-gray-200 rounded-b-xl">
        
        {/* 🔹 Zurück-Button */}
        <div
          className="w-fit bg-gray-100 hover:bg-blue-50 active:bg-blue-100 
                     rounded-lg shadow px-4 py-3 flex items-center gap-2 
                     cursor-pointer transition-all duration-200 
                     transform hover:-translate-y-0.5"
          onClick={() => navigate('/admin/topics/project-management')}
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium text-gray-800">
            Zurück zur Übersicht
          </span>
        </div>

        {/* 🔹 Titelbereich */}
        <div className="mt-8 ml-60">
          <h1 className="text-3xl md:text-3xl font-bold text-gray-900">
            Katalog 1 – Prozesse
          </h1>
          <p className="text-gray-600 mt-1 ml-14">
            Organisationsstrukturen
          </p>
        </div>
      </div>

      {/* 🔹 Body-Bereich */}
      <div className="bg-white mx-10 mt-12 p-10 rounded-xl shadow text-center">
        <div className="flex flex-col items-center justify-center">
          <MessageSquare size={36} className="text-gray-400 mb-3" />

          <h2 className="text-lg font-semibold text-gray-800">
            Noch keine Fragen
          </h2>
          <p className="text-gray-500 mt-1 mb-6">
            Beginnen Sie mit dem Erstellen von Fragen für diesen Katalog.
          </p>

          <button
            onClick={() => setShowPrompt(true)}
            className="bg-brand-sand text-white font-medium px-5 py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            Erste Frage erstellen
          </button>
        </div>
      </div>

      {/* 🔹 Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center md:pl-60 z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-w-[95%] p-6 relative">
            {/* Header */}
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Neue Frage hinzufügen
            </h2>

            {/* Dropdown */}
            <label className="text-sm text-gray-700 font-medium">
              Übergeordnete Frage 
            </label>
            <select className="w-full border border-gray-300 rounded-lg p-2 mt-1 mb-5 focus:ring-2 focus:ring-brand-sand focus:outline-none">
                <option value=""  hidden>
                        Hauptfrage oder Unterfrage?
                </option>
                <option value="hauptfrage">Hauptfrage</option>
                <option value="unterfrage">Unterfrage</option>
            </select>

            {/* Fragetyp Auswahl */}
            <label className="text-sm text-gray-700 font-medium mb-2 block">
              Fragetyp*
            </label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Textfeld', icon: MessageSquare },
                { label: 'Ja/Nein', icon: Circle },
                { label: 'Auswahl', icon: List },
                { label: 'Bewertung', icon: BarChart3 },
              ].map((type) => {
                const Icon = type.icon;
                const active = selectedType === type.label;
                return (
                  <button
                    key={type.label}
                    onClick={() => setSelectedType(type.label)}
                    className={`flex items-center gap-2 border rounded-lg px-4 py-2 transition ${
                      active
                        ? 'border-brand-sand bg-brand-sand/10 text-brand-sand font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Frage Eingabe */}
            <label className="text-sm text-gray-700 font-medium">
              Frage*
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 mb-6 focus:ring-2 focus:ring-brand-sand focus:outline-none"
              placeholder="Frage eingeben..."
              rows={3}
            ></textarea>

            {/* Aktionen */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-brand-sand text-white rounded-lg hover:bg-brand-sand/80" onClick={() => {
  setShowPrompt(false);
  navigate('/admin/catalogs/1/condition-editor');
}}>
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
