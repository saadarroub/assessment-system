import { useState } from "react";
import { X } from "lucide-react";

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

function CheckRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="
        flex items-start gap-3
        rounded-xl border
        bg-slate-50
        px-4 py-3
        cursor-pointer
        transition
        hover:bg-white
        hover:border-slate-300
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="
          mt-1 h-5 w-5 rounded
          border-slate-300
          outline-none
          transition
        "
        style={{ accentColor: BRAND.gold }}
      />
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{desc}</div>
      </div>
    </label>
  );
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
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div className="w-full max-w-2xl px-4 sm:px-0" onMouseDown={(e) => e.stopPropagation()}>
        {/* CARD  */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
          {/* Deko-Glows */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
            aria-hidden="true"
          />

          {/* Inhalt */}
          <div className="relative px-6 pt-6 pb-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                  PDF Export
                </h3>
                <p className="text-xs text-slate-500">
                  Katalog: <span className="font-semibold">{catalogName}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition"
                aria-label="Schließen"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Section */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">
                  Inhalte auswählen
                </p>

                <div className="space-y-3">
                  <CheckRow
                    title="Alle Antworten"
                    desc="Detaillierte Tabellen mit allen Fragen und Antworten pro Thema"
                    checked={includeAnswers}
                    onChange={setIncludeAnswers}
                  />

                  <CheckRow
                    title="Charts & Visualisierungen"
                    desc="Balkendiagramme, Donut-Charts und Score-Visualisierungen"
                    checked={includeCharts}
                    onChange={setIncludeCharts}
                  />

                  <CheckRow
                    title="Scoring-Details"
                    desc="Gesamt-Score des Katalogs und Score pro Thema/Session"
                    checked={includeScoring}
                    onChange={setIncludeScoring}
                  />

                  {hasReifegradModel && (
                    <CheckRow
                      title="Reifegrad-Modell"
                      desc="Visualisierung der Reifegrad-Intervalle mit aktuellem Score"
                      checked={includeReifegrad}
                      onChange={setIncludeReifegrad}
                    />
                  )}
                </div>
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">
                  Notizen (optional)
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Fügen Sie hier Ihre Notizen oder Kommentare hinzu..."
                  className="
                    w-full rounded-xl border px-3 py-2.5 text-sm
                    bg-slate-50
                    border-slate-200
                    outline-none
                    focus:bg-white
                    focus:border-[#E3BB62]
                    focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                    transition
                    resize-none
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons unten wie Create Dialog */}
        <div className="h-3" />
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="
              flex-1 h-12
              text-sm font-medium
              text-slate-800
              bg-[#f3f3f3]
              hover:bg-[#e5e5e5]
              border border-slate-200
              rounded-xl
            "
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="
              flex-1 h-12
              text-sm font-semibold
              rounded-xl
              bg-[#E3BB62]
              text-[#264555]
              hover:bg-[#d8ac55]
              shadow-[0_10px_30px_rgba(0,0,0,0.18)]
              transition
              hover:-translate-y-[1px]
            "
          >
            PDF Exportieren
          </button>
        </div>
      </div>
    </div>
  );
}
