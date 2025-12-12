import React from "react";
import { FileText, Edit3, Trash2, ArrowRight, Copy, Info } from "lucide-react";

function isColorLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);

  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  return brightness > 180;
}

// 🎨 3-Color Concept basierend auf #56768f

const PRIMARY = "#433b3bff";     // Grau – Basis
const SECONDARY = "#797272ff";   // etwas heller
const ACCENT = "#8e8e8eff";



const GRADIENT = `linear-gradient(145deg, ${PRIMARY}, ${SECONDARY}, ${ACCENT})`;

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  status: "active" | "inactive";
};

type TopicCardProps = {
  t: Topic;
  loading?: boolean; // HINZUFÜGEN!
  onDelete: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onManage: (t: Topic) => void;
  onDuplicate: (t: Topic) => void;
  onStatusChange: () => void;
};

const TopicCard = ({
  t,
  onDelete,
  onEdit,
  onManage,
  onDuplicate,
  onStatusChange,
}: TopicCardProps) => {
  const isLight = isColorLight(SECONDARY);

  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const descRefFull = React.useRef<HTMLParagraphElement | null>(null);
  const hoverTimeout = React.useRef<any>(null);


  const [showInfoIcon, setShowInfoIcon] = React.useState(false);
  const [showTooltipFull, setShowTooltipFull] = React.useState(false);

 

  React.useEffect(() => {
  function checkOverflow() {
    function isOverflow(el: HTMLElement | null) {
      if (!el) return false;
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    }

    const titleOverflow = isOverflow(titleRef.current);
    const subtitleOverflow = isOverflow(descRefFull.current);

    setShowInfoIcon(titleOverflow || subtitleOverflow);
  }

  checkOverflow();

  window.addEventListener("resize", checkOverflow);

  return () => window.removeEventListener("resize", checkOverflow);
}, [t.title, t.subtitle]);

React.useEffect(() => {
  const observer = new ResizeObserver(() => {
    function isOverflow(el: HTMLElement | null) {
      if (!el) return false;
      return (
        el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
      );
    }

    const titleOverflow = isOverflow(titleRef.current);
    const subtitleOverflow = isOverflow(descRefFull.current);

    setShowInfoIcon(titleOverflow || subtitleOverflow);
  });

  if (titleRef.current) observer.observe(titleRef.current);
  if (descRefFull.current) observer.observe(descRefFull.current);

  return () => observer.disconnect();
}, []);





  const textColor = isLight ? "text-black" : "text-white";
  const textColorSoft = isLight ? "text-black/50" : "text-white/80";

  return (
    <div
      className="
        relative flex flex-col rounded-xl overflow-visible
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
            bg-[#9b9696ff] border border-white/20 shadow-sm
            "
          >
            <FileText size={23} className={textColorSoft} />
          </div>
          {/* ⭐ Status Button */}
          <div
            onClick={() => onStatusChange()}
            className={`
     relative w-16 h-6 rounded-full cursor-pointer flex items-center
    transition-all duration-300 ease-out 
    ${t.status === "active" ? "bg-green-500 px-2" : "bg-red-500 px-0.5"}
  `}
          >
            <span
              className={`
      absolute left-2 text-[11px] font-bold text-white transition-opacity duration-200
      ${t.status === "active" ? "opacity-100" : "opacity-0"}
    `}
            >
              aktiv
            </span>

            <span
              className={`
      absolute right-2 text-[10px] font-bold text-white transition-opacity duration-200
      ${t.status === "inactive" ? "opacity-100" : "opacity-0"}
    `}
            >
              inaktiv
            </span>

            <div
              className={`
      w-4 h-4 bg-[#808080] rounded-full shadow-md transform transition-transform duration-300
      ${t.status === "active" ? "translate-x-9" : "translate-x-px"}
    `}
            ></div>
          </div>
        </div>

        {/* TITLE */}
        <div className="flex flex-col gap-1 min-h-[80px]">
          {/* TITLE + INFO ICON */}
          <div className="flex items-start justify-between relative">
            <h4
              ref={titleRef}
              className={`text-xl font-semibold leading-tight ${textColor}
      whitespace-nowrap overflow-hidden text-ellipsis flex-1
    `}
            >
              {t.title}
            </h4>

            {/* INFO ICON */}
        {showInfoIcon && (
  <div
    className="ml-2 mt-[2px]"
    onMouseEnter={() => {
      hoverTimeout.current = setTimeout(() => {
        setShowTooltipFull(true);
      }, 350); // ⏳ 350ms Delay bevor Tooltip öffnet
    }}
    onMouseLeave={() => {
      clearTimeout(hoverTimeout.current);
      setShowTooltipFull(false);
    }}
  >
    <div className="
      w-6 h-6 flex items-center justify-center rounded-full 
      bg-white/20 backdrop-blur-sm shadow-sm hover:bg-white/30 transition-all
    ">
      <Info className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>

    <div
      className={`
        ${showTooltipFull ? "opacity-100 visible" : "opacity-0 invisible"}
        absolute right-0 top-8 w-80 bg-gray-900 text-white text-xs p-3 rounded-lg
        border border-gray-700 shadow-[0_4px_10px_rgba(0,0,0,0.4)]
        transition-all duration-200 z-50
      `}
    >
      <b>{t.title}</b>
      <br />
      {t.subtitle || "Keine Beschreibung vorhanden"}
    </div>
  </div>
)}

          </div>
          <p
            ref={descRefFull}
            className={`text-sm leading-relaxed line-clamp-2 ${textColorSoft} mt-1`}
          >
            {t.subtitle || "Keine Beschreibung vorhanden"}
          </p>
        </div>

        {/* FRAGENANZAHL */}
        <div
          className="
            inline-flex items-center gap-2 px-3 py-2 rounded-lg
            bg-[#9b9696ff] shadow-sm w-fit
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
              w-10 h-10 rounded-xl bg-[#9b9696ff]
              flex items-center justify-center shadow-sm border border-white/20
              hover:bg-red-500/20 transition-all
            "
          >
            <Trash2 size={18} className={textColor} />
          </button>
          <button
            onClick={() => onDuplicate(t)}
            className="
                          w-10 h-10 rounded-xl bg-[#9b9696ff]
                          flex items-center justify-center shadow-sm border border-white/20
                          hover:bg-blue-500/20 transition-all
                        "
          >
            <Copy size={18} className={textColor} />
          </button>

          <button
            onClick={() => onEdit(t)}
            className="
              w-20 h-10 rounded-xl bg-[#9b9696ff]
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
