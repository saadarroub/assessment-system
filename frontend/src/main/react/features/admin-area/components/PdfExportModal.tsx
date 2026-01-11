import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

interface PdfExportModalProps {
  open: boolean;
  onClose: () => void;
  catalogName: string;
  hasReifegradModel: boolean;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  includeAnswers: boolean;
  includeCharts: boolean;
  includeScoring: boolean;
  includeReifegrad: boolean;
  notes: string;
}

export default function PdfExportModal({
  open,
  onClose,
  catalogName,
  hasReifegradModel,
  onExport,
}: PdfExportModalProps) {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeScoring, setIncludeScoring] = useState(true);
  const [includeReifegrad, setIncludeReifegrad] = useState(hasReifegradModel);
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const handleExport = () => {
    onExport({
      includeAnswers,
      includeCharts,
      includeScoring,
      includeReifegrad: hasReifegradModel && includeReifegrad,
      notes,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.steel} 100%)`,
          }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">PDF Export</h2>
            <p className="text-sm text-white/80 mt-1">{catalogName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wide mb-4"
              style={{ color: BRAND.navy }}
            >
              Inhalte auswählen
            </h3>

            <div className="space-y-3">
              {/* Checkbox: Alle Antworten */}
              <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: BRAND.navy }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: BRAND.navy }}>
                    Alle Antworten
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Detaillierte Tabellen mit allen Fragen und Antworten pro Thema
                  </div>
                </div>
              </label>

              {/* Checkbox: Charts & Visualisierungen */}
              <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: BRAND.navy }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: BRAND.navy }}>
                    Charts & Visualisierungen
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Balkendiagramme, Donut-Charts und Score-Visualisierungen
                  </div>
                </div>
              </label>

              {/* Checkbox: Scoring */}
              <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={includeScoring}
                  onChange={(e) => setIncludeScoring(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: BRAND.navy }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: BRAND.navy }}>
                    Scoring-Details
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Gesamt-Score des Katalogs und Score pro Thema/Session
                  </div>
                </div>
              </label>

              {/* Checkbox: Reifegrad-Modell (nur wenn vorhanden) */}
              {hasReifegradModel && (
                <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={includeReifegrad}
                    onChange={(e) => setIncludeReifegrad(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    style={{ accentColor: BRAND.navy }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: BRAND.navy }}>
                      Reifegrad-Modell
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Visualisierung der Reifegrad-Intervalle mit aktuellem Score
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label
              className="block text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: BRAND.navy }}
            >
              Notizen (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fügen Sie hier Ihre Notizen oder Kommentare hinzu..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              style={{ borderColor: BRAND.sand }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleExport}
            className="gap-2"
            style={{
              background: BRAND.gold,
              color: BRAND.navy,
            }}
          >
            <span>PDF Exportieren</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
