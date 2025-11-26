
type Props = {
  topicName?: string;
  onRestart: () => void;
  onBackToTopics: () => void;
  // Optional: falls du später Fortschritt anzeigen willst
  percent?: number;
  answered?: number;
  total?: number;
};


export default function AssessmentCompleted({
  topicName,
  onRestart,
  onBackToTopics,
  percent,
  answered,
  total,
}: Props) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="text-6xl mb-5">✓</div>
      <div className="text-[28px] font-bold text-[#1a1a1a] mb-2">
        Assessment abgeschlossen
      </div>

      <div className="text-[16px] text-[#666] mb-3">
        {`Vielen Dank für die Teilnahme am ${topicName || "Assessment"}. Ihre Antworten wurden gespeichert.`}
      </div>

      {/* Optionaler Fortschritt, nur anzeigen wenn übergeben */}
      {(typeof percent === "number" || (answered != null && total != null)) && (
        <div className="text-sm text-[#475569] mb-6">
          {typeof percent === "number" && <span>{percent}% abgeschlossen</span>}
          {answered != null && total != null && (
            <span className="ml-2">{`(${answered} von ${total} Fragen)`}</span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={onRestart}
        >
          Assessment erneut starten
        </button>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#d4af37] text-[#333] hover:bg-[#c29d2f] transition"
          onClick={onBackToTopics}
        >
          🏠 Zur Übersicht
        </button>
      </div>
    </div>
  );
}
