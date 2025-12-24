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

// Kleines Hilfs-Element für das CapConsulting-ICA³-Badge
function BrandChip() {
  return (
    <div
      className="
        relative inline-flex items-center gap-2
        rounded-full border border-white/30
        bg-gradient-to-r from-white/10 via-white/5 to-transparent
        px-5 py-1.5
        text-[11px] font-medium tracking-wide
        text-white/90
        shadow-[0_10px_25px_rgba(0,0,0,0.55)]
        backdrop-blur-md
      "
    >
      {/* Goldener Status-Dot links */}
      <span
        className="
          h-2.5 w-2.5 rounded-full bg-[#E3BB62]
          shadow-[0_0_12px_rgba(227,187,98,0.9)]
        "
      />
      <span className="whitespace-nowrap">
        CapConsulting ·{" "}
        <span className="font-semibold text-[#E3BB62]">ICA³</span>
      </span>
    </div>
  );
}

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
  const gradients: Record<string, string> = {
    navy: "from-[#0c1821] via-[#203645] to-[#0b141b]",
    sand: "from-[#d2c9b9] via-[#c4b9a0] to-[#aa9880]",
    blue: "from-[#1e446e] via-[#2f6ca3] to-[#16314a]",
    custom: "",
  };

  const isCentered = center;

  const outerLayout = extra
    ? "lg:flex-row lg:items-center lg:justify-between"
    : isCentered
      ? "lg:flex-row lg:items-center lg:justify-center"
      : "lg:flex-row lg:items-center lg:justify-start";

  const columnAlign = isCentered
    ? "items-center text-center"
    : "items-start text-left";

  return (
    
    <div

      className={`relative w-full bg-gradient-to-br ${gradients[gradient]}`}
      style={{ minHeight: height }}
     >

      {/* blauer Glow rechts unten */}
      <div
        className="
          pointer-events-none absolute -right-28 bottom-[6px]
          h-60 w-60 rounded-full
          bg-[#3ba4ff]/35 blur-3xl
        "
        aria-hidden="true"
      />

      {/* diagonales Liniensystem */}
      <div
        className="
          pointer-events-none absolute inset-[-40px] opacity-20
          mix-blend-soft-light
        "
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* horizontale „Scanline“ oben */}
      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-20
          bg-gradient-to-b from-white/16 via-white/4 to-transparent
          blur-xl opacity-50
        "
      />

      {/* kleine „Sternchen“ */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      >
        <div className="absolute left-[18%] top-[18%] h-[3px] w-[3px] rounded-full bg-white/70" />
        <div className="absolute left-[30%] top-[46%] h-[2px] w-[2px] rounded-full bg-white/60" />
        <div className="absolute right-[18%] top-[26%] h-[3px] w-[3px] rounded-full bg-white/80" />
        <div className="absolute right-[30%] bottom-[30%] h-[2px] w-[2px] rounded-full bg-white/55" />
      </div>

      {/* Icon-Pattern im Hintergrund */}
      {showPattern && icon && (
        <>
          <div className="pointer-events-none absolute left-10 top-8 opacity-18">
            {React.cloneElement(icon as any, {
              size: 130,
              strokeWidth: 0.6,
              className: "text-white/25 blur-[1px]",
            })}
          </div>
          <div className="pointer-events-none absolute right-10 bottom-10 opacity-16 rotate-180">
            {React.cloneElement(icon as any, {
              size: 100,
              strokeWidth: 0.6,
              className: "text-white/22 blur-[1px]",
            })}
          </div>
        </>
      )}

      {/* Brand-Badge oben rechts */}
      <div className="absolute right-6 top-6 z-20">
        <BrandChip />
      </div>

      <div
        className="relative z-10 flex flex-col gap-6 py-10 pr-6"
        style={{
          paddingLeft: "200px",
        }}
      >
        {/* Linker Bereich: Icon + Titel + Subtitle */}
        <div className={`flex flex-col gap-4 ${columnAlign}`}>
          {/* Icon + kleines Label (System · Management etc.) */}
          {(icon || title) && (
            <div className="inline-flex items-center gap-3 rounded-3xl border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.42)]">
              {icon && (
                <div className="relative">
                  <div className="absolute inset-[-8px] rounded-full border border-white/25 opacity-60" />
                  <span className="absolute -top-1 right-2 h-[5px] w-[5px] rounded-full bg-[#E3BB62]" />
                  <span className="absolute bottom-0 -left-1 h-[4px] w-[4px] rounded-full bg-sky-300" />

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 border border-white/40 text-white shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
                    {React.cloneElement(icon as any, {
                      size: 22,
                      className: "text-white",
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  SYSTEM · MANAGEMENT
                </span>
                <span className="text-[11px] text-white/80">
                  Management & Administration der Plattform
                </span>
              </div>
            </div>
          )}

          {/* Titel + Subtitle */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[14px] md:text-[15px] text-white/85 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Rechter Bereich: */}
        {extra && (
          <div className="mt-4 flex w-full justify-start lg:mt-0 lg:w-auto lg:justify-end">
            <div className="inline-flex items-center gap-3 rounded-3xl border border-white/25 bg-black/25 px-4 py-3 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
              {extra}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}