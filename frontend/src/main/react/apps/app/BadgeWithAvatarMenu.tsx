// BadgeWithAvatarMenu.tsx
import  { useState, useRef, useEffect } from "react";
import CornerBadge from "./CornerBadge";
//import { createPortal } from "react-dom";


//type MenuItem = { id: string; label: string; onClick?: () => void };

type Props = {
  width?: number;
  height?: number;
  rightNotch?: number;
  bottomRightLen?: number;
  bevelHeight?: number;
  avatarUrl: string;
};

export default function BadgeWithAvatarMenu({
  width = 200,
  height = 100,
  rightNotch = 40,
  bottomRightLen = 70,
  bevelHeight = 50,
  avatarUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [, setMenuPos] = useState<{x:number;y:number}|null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt Menü
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={boxRef} className="relative inline-block overflow-visible z-50">
      <CornerBadge
        width={width}
        height={height}
        rightNotch={rightNotch}
        bottomRightLen={bottomRightLen}
        bevelHeight={bevelHeight}
      >
        {/* Avatar-Button mittig */}
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
    const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setOpen(v => !v);
    setMenuPos({ x: r.left + r.width/2, y: r.bottom + 8 });
  }}
  className="flex items-center justify-center px-2 focus:outline-none focus:ring-black/40 rounded-full"
          title="Öffne Menü"
        >
          <div className="h-12 w-12 rounded-full bg-[linear-gradient(180deg,#E2E8F0,#CBD5E1)] p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
            <img src={avatarUrl} alt="Profil" className="h-full w-full rounded-full" />
          </div>
        </button>
      </CornerBadge>
    </div>
  );
}
