import React from "react";
import { Layers, Edit3, Trash2, ArrowRight, Copy, Info } from "lucide-react";



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
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const descRefFull = React.useRef<HTMLParagraphElement | null>(null);
  const hoverTimeout = React.useRef<any>(null);

  const [showInfoIcon, setShowInfoIcon] = React.useState(false);
  const [showTooltipFull, setShowTooltipFull] = React.useState(false);

  React.useEffect(() => {
    function checkOverflow() {
      function isOverflow(el: HTMLElement | null) {
        if (!el) return false;
        return (
          el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
        );
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



  return (
    <div
      className="
         relative flex flex-col rounded-2xl overflow-visible
    p-6 transition-all duration-300
    hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]
      "
      style={{
    background: "#ffffff",
  border: "1px solid #e9ebe5ff",
  boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative z-10 flex flex-col gap-5">
        {/* ICON + STATUS */}
        <div className="flex items-center justify-between">
        <div
  className="
    h-12 w-12  rounded-2xl
    flex items-center justify-center
    bg-[hsl(45_80%_55%_/_0.2)]
  "
>
  <Layers
    className="text-[hsl(45_80%_55%)]"
    size={26}
    strokeWidth={2}
  />
</div>


          {/* ⭐ Status Badge + Toggle */}
          <div className="flex items-center gap-2 -mt-6 ">
            {/* Status Badge */}
<span
  className={`
    px-2 py-1 rounded-full text-xs font-medium
    ${
      t.status === "active"
        ? "bg-[hsl(142_71%_85%)] text-[hsl(142_71%_30%)]"
        : "bg-[hsl(45_30%_88%)] text-[hsl(30_8%_45%)]"
    }
  `}
>

  {t.status === "active" ? "aktiv" : "inaktiv"}
</span>


            {/* Toggle Switch */}
           <div
  onClick={() => onStatusChange()}
  className={`
    relative w-11 h-6 rounded-full cursor-pointer flex items-center
    transition-all duration-300 ease-out
    ${
      t.status === "active"
        ? "bg-emerald-500"   // helles Grün (aktiv)
        : "bg-[hsl(45_30%_88%)]"    // helles Beige (inaktiv)
    }
  `}
>

              <div
                className={`
                  w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300
                  ${t.status === "active" ? "translate-x-5" : "translate-x-0.5"}
                `}
              ></div>
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="flex flex-col gap-2 min-h-[80px]">
          {/* TITLE + INFO ICON */}
          <div className="flex items-start justify-between relative">
          <h4
  ref={titleRef}
  className={`text-[20px] font-semibold leading-snug
    text-[hsl(30_10%_15%)]
    whitespace-nowrap overflow-hidden text-ellipsis flex-1
  `}
>
  {t.title}
</h4>


            {/* INFO ICON */}
            {showInfoIcon && (
              <div
                className="ml-2 mt-0.5"
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
                <div
                  className="
      w-6 h-6 flex items-center justify-center rounded-full 
      bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer
    "
                >
                  <Info className="w-[17px] h-[17px] text-gray-500" strokeWidth={2} />
                </div>

                <div
                  className={`
        ${showTooltipFull ? "opacity-100 visible" : "opacity-0 invisible"}
        absolute right-0 top-9 w-80 bg-gray-900 text-white text-xs p-3 rounded-lg
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
  className={`text-[15px] font-medium leading-relaxed line-clamp-2
    text-[hsl(30_8%_45%)]
  `}
>
  {t.subtitle || "Keine Beschreibung vorhanden"}
</p>

        </div>

        {/* FRAGENANZAHL */}
        <div
          className="
    inline-flex items-center gap-2
    h-[32px] px-3
    rounded-full
    w-fit
  "
          style={{
            background: "#f5f0e6",
          }}
        >
         <span
  className="
    text-sm font-semibold 
    text-[hsl(30_10%_25%)]
  "
>
  Anzahl der Fragen:
</span>

<span
  className="
    text-sm font-bold
    text-[hsl(30_10%_25%)]
  "
>
  {t.questions}
</span>

        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-3">
<button
  onClick={() => onDelete(t)}
  className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-colors duration-200
    bg-[#f7f3ea]                       /* Hintergrund wie Fragenanzahl */
    border border-[#f7cfcf] 
     hover:border-[#e88a8a]         /* helleres Rot für Rahmen */
    hover:bg-[#fde8e8]                 /* Hover bleibt rot (sanft) */
  "
>
  <Trash2 size={18} color="#e74c3c" strokeWidth={2.2} />
</button>



          <button
  onClick={() => onDuplicate(t)}
  className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-all duration-200
    bg-[#f7f3ea]                 /* wie Anzahl der Fragen */
    border border-[#c9ddf0]      /* sehr helles Blau (unhover) */
    hover:bg-[#eef5fb]           /* zartes Blau beim Hover */
    hover:border-[#9cc4e8]       /* Rahmen wird stärker beim Hover */
  "
>
  <Copy size={18} color="#5b8db8" strokeWidth={2.2} />
</button>


         <button
  onClick={() => onEdit(t)}
  className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-all duration-200
    bg-[#f7f3ea]                 /* wie Anzahl der Fragen */
    border border-[#c4e5d6]      /* sehr helles Grün (unhover) */
    hover:bg-[#eaf7f0]           /* zartes Grün beim Hover */
    hover:border-[#8fd1b3]       /* Rahmen wird stärker beim Hover */
  "
>
  <Edit3 size={18} color="#27ae60" strokeWidth={2.2} />
</button>



<button
  onClick={() => onManage(t)}
  className="
    group flex-1 ml-3
    flex items-center justify-center gap-3
    h-10 px-6
    rounded-xl
    font-semibold text-[14.5px]
    transition-colors duration-200
    bg-[hsl(45_80%_55%_/_0.2)]   /* gleiche Farbe wie Icon-Hintergrund */
    hover:bg-[hsl(45_80%_55%_/_0.28)]
    text-[hsl(30_10%_20%)]
  "
>
  <span>Fragen Verwalten</span>

  <ArrowRight
    size={16}
    strokeWidth={2.5}
    className="
      transition-transform duration-200
      group-hover:translate-x-2
    "
  />
</button>


        </div>
      </div>
    </div>
  );
};

export default React.memo(TopicCard);
