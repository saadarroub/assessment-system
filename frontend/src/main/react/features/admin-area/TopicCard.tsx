import React from "react";
import { FileText, Edit3, Trash2, ArrowRight, Copy } from "lucide-react";

function isColorLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);

  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  return brightness > 180;
}

// 🎨 3-Color Concept basierend auf #56768f
const PRIMARY = "#303335ff"; // original brand-steel
const SECONDARY = "#3f5a6eff"; // lighter
const ACCENT = "#486c88de"; // darker

const GRADIENT = `linear-gradient(145deg, ${PRIMARY}, ${SECONDARY}, ${ACCENT})`;

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
};

type TopicCardProps = {
  t: Topic;
  loading?: boolean; // HINZUFÜGEN!
  onDelete: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onManage: (t: Topic) => void;
};

const TopicCard = ({ t, onDelete, onEdit, onManage }: TopicCardProps) => {
  const isLight = isColorLight(SECONDARY);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const textColor = isLight ? "text-black" : "text-white";
  const textColorSoft = isLight ? "text-black/50" : "text-white/80";

  return (
    <div
      className="
        relative flex flex-col rounded-xl overflow-hidden 
        shadow-md p-5
      "
      style={{
        background: GRADIENT,
      }}
    >
      <div className="relative z-10 flex flex-col gap-4">
        {/* ICON + STATUS */}
        <div className="flex items-center justify-between">
          <div
            className="
              w-12 h-12 rounded-xl flex items-center justify-center
              bg-[#3f5568] border border-white/20 shadow-sm
            "
          >
            <FileText size={23} className={textColorSoft} />
          </div>

          <div className="relative">
            {/* Status Button */}
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={`
                    px-3 py-1 rounded-xl text-xs font-semibold shadow-sm transition
                    ${
                      isActive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
             `}
            >
              {isActive ? "Aktiv" : "Inaktiv"}
            </button>

            {/* Dropdown */}
            {statusOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border
                  flex flex-col text-sm overflow-hidden z-50
                "
              >
                <button
                  className="px-3 py-2 hover:bg-green-50 text-left"
                  onClick={() => {
                    setIsActive(true);
                    setStatusOpen(false);
                  }}
                >
                  ✅ Aktiv
                </button>

                <button
                  className="px-3 py-2 hover:bg-red-50 text-left"
                  onClick={() => {
                    setIsActive(false);
                    setStatusOpen(false);
                  }}
                >
                  ⛔ Inaktiv
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TITLE */}
        <div className="flex flex-col gap-1 min-h-[80px]">
          <h4
            className={`text-xl font-semibold leading-tight line-clamp-2 ${textColor}`}
          >
            {t.title}
          </h4>

          <p
            className={`text-sm leading-relaxed line-clamp-2 ${textColorSoft}`}
          >
            {t.subtitle || "Keine Beschreibung vorhanden"}
          </p>
        </div>

        {/* FRAGENANZAHL */}
        <div
          className="
            inline-flex items-center gap-2 px-3 py-2 rounded-lg
            bg-[#486c88de] shadow-sm w-fit
          "
        >
          <span className={`text-sm ${textColorSoft}`}>Anzahl der Fragen:</span>

          <span className={`text-lg font-semibold ${textColor}`}>
            {t.questions}
          </span>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onDelete(t)}
            className="
              w-10 h-10 rounded-xl bg-[#486c88de]
              flex items-center justify-center shadow-sm border border-white/20
              hover:bg-red-500/20 transition-all
            "
          >
            <Trash2 size={18} className={textColor} />
          </button>
          <button
            className="
                          w-10 h-10 rounded-xl bg-[#486c88de]
                          flex items-center justify-center shadow-sm border border-white/20
                          hover:bg-blue-500/20 transition-all
                        "
          >
            <Copy size={18} className={textColor} />
          </button>

          <button
            onClick={() => onEdit(t)}
            className="
              w-20 h-10 rounded-xl bg-[#486c88de]
              flex items-center justify-center shadow-sm border border-white/20
              hover:bg-green-500/20 transition-all
            "
          >
            <Edit3 size={18} className={textColor} />
          </button>

          <button
            onClick={() => onManage(t)}
            className="
                    group flex-1 bg-[#d2e0e8ff] text-gray-900 font-medium rounded-lg py-2
                    flex items-center justify-center gap-2 shadow-sm
                    hover:bg-[#E3BB62]  transition-all text-sm
                  "
          >
            Fragen Verwalten
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-2"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopicCard);
