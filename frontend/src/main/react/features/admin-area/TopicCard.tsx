import React from "react";
import { FileText, Edit3, Trash2, ArrowRight } from "lucide-react";

function isColorLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);

  // Formel für relative Helligkeit (Luma)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;

  return brightness > 180; // >180 = hell
}

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;

  color?: string; // optional
  colorDark?: string; // optional
};
type TopicCardProps = {
  t: Topic;
  onDelete: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onManage: (t: Topic) => void;
};

const TopicCard = ({ t, onDelete, onEdit, onManage }: TopicCardProps) => {
  const baseColor = t.color ?? "#264555"; // Fallback-Farbe falls undefined
  const isLight = isColorLight(baseColor);

  const textColor = isLight ? "text-black" : "text-white";
  const textColorSoft = isLight ? "text-black/70" : "text-white/80";

  return (
    <div
      className="
    relative flex flex-col rounded-2xl overflow-hidden 
    shadow-[0_6px_25px_rgba(0,0,0,0.10)]
    p-5
  "
      style={{
        background: t.color || "#264555", // nur EINE Farbe
      }}
    >
      {/* Content */}
      <div className="relative z-10 text-white flex flex-col gap-4">
        {/* ICON + STATUS */}
        <div className="flex items-center justify-between">
          {/* Icon links */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center
              bg-white/20 border border-white/20 backdrop-blur-xl 
              shadow-md"
          >
            <FileText
              size={23}
              className={isLight ? "text-black/80" : "text-white"}
            />
          </div>

          {/* Aktiv Badge */}
          <div>
            <span
              className="px-3 py-1 rounded-xl 
                bg-green-500/90 
                text-white text-xs font-semibold 
                shadow border border-white/20 backdrop-blur-sm"
            >
              Aktiv
            </span>
          </div>
        </div>

        {/* Title + Subtitle */}
        <div className="flex flex-col gap-1 min-h-[80px]">
          <h3
            className={`text-xl font-semibold leading-tight line-clamp-2 ${textColor}`}
          >
            {t.title}
          </h3>

          <p
            className={`text-sm leading-relaxed line-clamp-2 ${textColorSoft}`}
          >
            {t.subtitle || "Keine Beschreibung vorhanden"}
          </p>
        </div>

        {/* Anzahl der Fragen */}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-md shadow-md w-fit">
          <span className={`text-sm ${textColorSoft}`}>Anzahl der Fragen:</span>
          <span className={`text-lg font-semibold ${textColor}`}>
            {t.questions}
          </span>
        </div>

        {/* Buttons */}
      <div className="flex items-center gap-2 mt-1">

  {/* Fragen verwalten – Soft Blue BG ONLY */}
  <button
    onClick={() => onManage(t)}
    className="
      flex-1 bg-white text-gray-900 font-medium rounded-lg py-2 
      flex items-center justify-center gap-2 shadow-sm 
      transition-all text-sm
      hover:bg-blue-50 active:bg-blue-100
    "
  >
    Fragen Verwalten <ArrowRight size={16} />
  </button>

  {/* Bearbeiten – Soft Green BG ONLY */}
  <button
    onClick={() => onEdit(t)}
    className="
      w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md 
      flex items-center justify-center shadow border border-white/30 
      transition-all
      hover:bg-green-500/30
    "
  >
    <Edit3 size={18} className={textColor} />
  </button>

  {/* Löschen – Soft Red BG ONLY */}
  <button
    onClick={() => onDelete(t)}
    className="
      w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md 
      flex items-center justify-center shadow border border-white/30 
      transition-all
      hover:bg-red-500/30
    "
  >
    <Trash2 size={18} className={textColor} />
  </button>

</div>


      </div>
    </div>
  );
};

export default React.memo(TopicCard);
