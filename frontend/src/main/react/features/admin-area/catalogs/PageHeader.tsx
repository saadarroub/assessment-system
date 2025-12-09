import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: "navy" | "sand"  ;
  height?: string;
  center?: boolean;
  showPattern?: boolean;
  extra?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  icon,
  gradient = "navy",
  height = "260px",
  center = true,
  showPattern = true,
  extra,
}: PageHeaderProps) {
  // Hintergrundoptionen
  const gradients: Record<string, string> = {
    navy: "from-[#264555] via-[#38556b] to-[#2f3e4c]",
    sand: "from-[#d2c9b9] via-[#c9c0ad] to-[#b9b09f]",

  };

  return (
    <div
      className={`relative w-full px-10 py-14 bg-gradient-to-br ${gradients[gradient]}
      shadow-sm border-b border-gray-300/40 overflow-hidden`}
      style={{ height }}
    >
      {/* ========================================================= */}
      {/* 1) DEKO-ICONS IM HINTERGRUND (nutzt automatisch das gleiche Icon wie oben) */}
      {/* ========================================================= */}
     {showPattern && icon && (
  <>
    {/* Oben Links – sehr dünn, soft, dezent */}
    <div className="absolute left-10 top-4 opacity-30">
      {React.cloneElement(icon as any, {
        size: 130,                        // groß aber dünn
        strokeWidth: 0.5,                 // ⭐ extrem dünne Linie
        className: "text-white/20 blur-[1px]",  // ⭐ weicher & schwacher Look
      })}
    </div>

    {/* Unten Rechts – gespiegelt */}
    <div className="absolute right-10 bottom-5 opacity-20 rotate-180">
      {React.cloneElement(icon as any, {
        size: 100,
        strokeWidth: 0.5,
        className: "text-white/20 blur-[1px]",
      })}
    </div>
  </>
)}


      {/* ========================================================= */}
      {/* 2) SOFT LIGHT OVERLAY (Premium Shine Layer) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-white/5 mix-blend-soft-light"></div>

      {/* ========================================================= */}
      {/* 3) TOP SHINE (Elegant Light at Top) */}
      {/* ========================================================= */}
      <div className="absolute top-0 left-0 w-full h-20 bg-white/10 blur-2xl opacity-20 pointer-events-none"></div>

      {/* ========================================================= */}
      {/* CONTENT */}
      {/* ========================================================= */}
      <div
        className={`mt-0 flex flex-col gap-3 ${
          center ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {/* ICON (Advanced Glow Version) */}
        {icon && (
          <div className="relative">
            {/* Glow hinter Icon */}
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl"></div>

            {/* Icon selbst */}
            <div className="p-4 relative rounded-full bg-white/20 backdrop-blur-md shadow-inner border border-white/20 text-white">
              {icon}
            </div>
          </div>
        )}

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-white tracking-wide">
          {title}
        </h1>

        {/* SUBTITLE */}
        {subtitle && <p className="text-white/80 text-[15px]">{subtitle}</p>}

        {/* EXTRA CONTENT (Buttons, Filter etc.) */}
        {extra && <div className="mt-4">{extra}</div>}
      </div>
    </div>
  );
}
