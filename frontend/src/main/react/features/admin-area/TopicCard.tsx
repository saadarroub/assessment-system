import React from "react";
import { FileText, Edit3, Trash2, ArrowRight } from "lucide-react";

function isColorLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);

  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  return brightness > 180;
}

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;

  color?: string;
};

type TopicCardProps = {
  t: Topic;
  onDelete: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onManage: (t: Topic) => void;
};

const TopicCard = ({ t, onDelete, onEdit, onManage }: TopicCardProps) => {
  const baseColor = t.color ?? "#264555";
  const isLight = isColorLight(baseColor);

  const textColor = isLight ? "text-black" : "text-white";
  const textColorSoft = isLight ? "text-black/70" : "text-white/80";

  return (
    <div
    className="
  relative flex flex-col rounded-xl overflow-hidden 
  shadow-md
  p-5
"
style={{
  background: baseColor,
}}

    >
      <div className="relative z-10 flex flex-col gap-4">

        {/* ICON + STATUS */}
        <div className="flex items-center justify-between">
          <div
            className="
              w-12 h-12 rounded-xl flex items-center justify-center
              bg-white/10 border border-white/20 shadow-sm
            "
          >
            <FileText size={23} className={isLight ? "text-black/70" : "text-white"} />
          </div>

          <span
            className="
              px-3 py-1 rounded-xl 
              bg-green-500 text-white text-xs font-semibold
              shadow-sm border border-white/20
            "
          >
            Aktiv
          </span>
        </div>

        {/* TITLE + SUBTITLE */}
        <div className="flex flex-col gap-1 min-h-[80px]">
          <h4 className={`text-xl font-semibold leading-tight line-clamp-2 ${textColor}`}>
            {t.title}
          </h4>
          <p className={`text-sm leading-relaxed line-clamp-2 ${textColorSoft}`}>
            {t.subtitle || "Keine Beschreibung vorhanden"}
          </p>
        </div>

        {/* Fragenanzahl – enge Variante */}
        <div
          className="
            inline-flex items-center gap-2 px-3 py-2 rounded-lg
            bg-white/10 shadow-sm w-fit
          "
        >
          <span className={`text-sm ${textColorSoft}`}>Anzahl der Fragen:</span>
          <span className={`text-lg font-semibold ${textColor}`}>{t.questions}</span>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2 mt-1">

          {/* MANAGE */}
          <button
            onClick={() => onManage(t)}
            className="
              flex-1 bg-white text-gray-900 font-medium rounded-lg py-2
              flex items-center justify-center gap-2 shadow-sm
              hover:bg-blue-50 active:bg-blue-100
              transition-all text-sm
            "
          >
            Fragen Verwalten <ArrowRight size={16} />
          </button>

          {/* EDIT */}
          <button
            onClick={() => onEdit(t)}
            className="
              w-10 h-10 rounded-xl bg-white/10
              flex items-center justify-center shadow-sm border border-white/20
              hover:bg-green-500/20 transition-all
            "
          >
            <Edit3 size={18} className={textColor} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(t)}
            className="
              w-10 h-10 rounded-xl bg-white/10
              flex items-center justify-center shadow-sm border border-white/20
              hover:bg-red-500/20 transition-all
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
