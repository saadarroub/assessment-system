import React, { useState } from 'react';
import { Trash2, Edit, Plus, X, Save } from 'lucide-react';
import AdminLayout from "@/apps/app/AdminLayout";

// --- [Component 1] The Modal (Dialog) ---
const ModelModal = ({ isOpen, onClose, onSave, initialData }) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  const [intervals, setIntervals] = useState(initialData?.intervals || [
    { id: 1, start: 0, end: 100, name: 'Initial Level' }
  ]);

  const handleIntervalChange = (index, newEnd) => {
    const updatedIntervals = [...intervals];
    const current = updatedIntervals[index];
    
    let endValue = parseInt(newEnd, 10);
    if (isNaN(endValue)) endValue = 0;
    if (endValue > 100) endValue = 100;
    if (endValue <= current.start) endValue = current.start + 1;

    current.end = endValue;

    if (index < updatedIntervals.length - 1) {
      updatedIntervals[index + 1].start = endValue + 1;
      if (updatedIntervals[index + 1].end <= updatedIntervals[index + 1].start) {
         updatedIntervals[index + 1].end = 100;
      }
    }

    setIntervals(updatedIntervals);
  };

  const addInterval = () => {
    const lastInterval = intervals[intervals.length - 1];
    
    if (lastInterval.end >= 100) {
      alert("Der letzte Bereich endet bereits bei 100%. Bitte kürzen Sie diesen zuerst.");
      return;
    }

    const newStart = lastInterval.end + 1;
    setIntervals([
      ...intervals,
      { id: Date.now(), start: newStart, end: 100, name: `Level ${intervals.length + 1}` }
    ]);
  };

  const removeInterval = (index) => {
    if (intervals.length === 1) return;
    const updated = intervals.filter((_, i) => i !== index);
    
    if (index > 0) {
       updated[index].start = updated[index - 1].end + 1;
    } else {
       updated[0].start = 0;
    }
    setIntervals(updated);
  };

  const handleSave = () => {
    if (intervals[intervals.length - 1].end !== 100) {
      alert("Das Modell muss 100% abdecken.");
      return;
    }
    onSave({ id: initialData?.id, name, description, intervals });
    onClose();
  };

  return (
  
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Reifegradmodell bearbeiten' : 'Neues Reifegradmodell erstellen'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Name & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name des Modells</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="z.B. IT Security Model"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Beschreibung des Modells..."
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Interval Editor (The Sketch Logic) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Intervalle definieren</h3>
              <button 
                onClick={addInterval}
                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={16} /> Add New
              </button>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {intervals.map((interval, idx) => (
                <div key={interval.id} className="flex items-center gap-4 bg-white p-3 rounded shadow-sm border border-gray-200">
                  {/* Start Value (Read Only usually) */}
                  <div className="w-16 text-center">
                    <span className="block text-xs text-gray-500">Von</span>
                    <div className="font-mono font-bold text-gray-700">{interval.start}%</div>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-400">→</div>

                  {/* End Value (Editable) */}
                  <div className="w-20">
                    <span className="block text-xs text-gray-500 mb-1">Bis</span>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={interval.end}
                        onChange={(e) => handleIntervalChange(idx, e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-center font-mono font-bold focus:border-blue-500 outline-none"
                      />
                      <span className="absolute right-1 top-1 text-xs text-gray-400">%</span>
                    </div>
                  </div>

                  {/* Name of this Level */}
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Bezeichnung</span>
                    <input 
                      type="text" 
                      value={interval.name}
                      onChange={(e) => {
                        const newIntervals = [...intervals];
                        newIntervals[idx].name = e.target.value;
                        setIntervals(newIntervals);
                      }}
                      className="w-full p-1 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                    />
                  </div>

                  {/* Delete Button (Option) */}
                  {intervals.length > 1 && (
                    <button onClick={() => removeInterval(idx)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Ändern Sie den "Bis"-Wert, um einen neuen Bereich zu ermöglichen. Der nächste Bereich startet automatisch bei (Wert + 1).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition">
            Abbrechen
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md flex items-center gap-2 transition">
            <Save size={18} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
};


// --- [Component 2] Main Page (List View) ---
export default function MaturityModelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  
  // Mock Data (List of existing models)
  const [models, setModels] = useState([
    { 
      id: 'm1', 
      name: 'IT Security Standard', 
      description: 'Standardmodell für IT-Sicherheit nach ISO 27001',
      intervals: [
        { start: 0, end: 30, name: 'Initial' },
        { start: 31, end: 70, name: 'Verwaltet' },
        { start: 71, end: 100, name: 'Optimiert' }
      ]
    }
  ]);

  const handleAddNew = () => {
    setEditingModel(null); // Reset for new entry
    setIsModalOpen(true);
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Möchten Sie dieses Modell wirklich löschen?")) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const handleSaveModel = (modelData) => {
    if (modelData.id) {
      // Update existing
      setModels(models.map(m => m.id === modelData.id ? modelData : m));
    } else {
      // Create new
      setModels([...models, { ...modelData, id: Date.now().toString() }]);
    }
  };

  return (
      <AdminLayout>
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reifegradmodelle</h1>
            <p className="text-gray-500">Verwalten Sie hier die Bewertungsschemata.</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 transition"
          >
            <Plus size={20} /> Modell erstellen
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4 border-b">Name des Modells</th>
                <th className="p-4 border-b">Beschreibung</th>
                <th className="p-4 border-b">Intervalle</th>
                <th className="p-4 border-b text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {models.map(model => (
                <tr key={model.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{model.name}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{model.description}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {model.intervals.map((int, i) => (
                        <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 border border-gray-200">
                          {int.name} ({int.end}%)
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(model)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(model.id)}
                      className="px-3 py-1.5 text-sm border border-red-200 rounded text-red-600 hover:bg-red-50 hover:border-red-400 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Keine Modelle gefunden. Erstellen Sie ein neues Modell.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modal */}
      <ModelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveModel}
        initialData={editingModel}
      />
    </div>
        </AdminLayout>
  );
}
