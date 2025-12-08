import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: "navy" | "sand" | "blue" | "custom";
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
  // Satte Gradients
  const gradients: Record<string, string> = {
    navy: "from-[#0c1821] via-[#203645] to-[#0b141b]",
    sand: "from-[#d2c9b9] via-[#c4b9a0] to-[#aa9880]",
    blue: "from-[#1e446e] via-[#2f6ca3] to-[#16314a]",
    custom: "",
  };

  const isCentered = center;

  return (
    <div
      className={`relative w-full bg-gradient-to-br ${gradients[gradient]}
      shadow-[0_14px_40px_rgba(0,0,0,0.55)] border-b border-white/100 overflow-hidden`}
      style={{ minHeight: height }}
    >
      {/* ====================== 1) Hintergrund-Ebenen ====================== */}

      {/* weicher Gold-Glow links oben */}
      <div
        className="
          pointer-events-none absolute -left-24 -top-28
          h-60 w-60 rounded-full
          bg-[#E3BB62]/55 blur-3xl
          animate-pulse
        "
        aria-hidden="true"
      />

      {/* blauer Glow rechts unten */}
      <div
        className="
          pointer-events-none absolute -right-28 bottom-[-60px]
          h-64 w-64 rounded-full
          bg-[#3ba4ff]/35 blur-3xl
        "
        aria-hidden="true"
      />

      {/* dezentes diagonales Liniensystem */}
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

      {/* ====================== 2) CONTENT ====================== */}

      <div className="relative z-10 mx-auto flex max-w-[1400px] xl:max-w-[1600px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        {/* Linker Bereich: Icon + Titel + Subtitle + kleine Chips */}
        <div
          className={`flex flex-col gap-4 ${
            isCentered
              ? "items-center text-center lg:items-start lg:text-left"
              : "items-start text-left"
          }`}
        >
          {/* Icon mit Orbit-Ring + kleinem Label */}
          {(icon || title) && (
            <div className="inline-flex items-center gap-3 rounded-3xl border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.42)]">
              {/* Orbit um das Icon */}
              {icon && (
                <div className="relative">
                  {/* äußerer Orbit */}
                  <div className="absolute inset-[-8px] rounded-full border border-white/25 opacity-60" />
                  {/* zwei kleine Dots auf dem Orbit */}
                  <span className="absolute -top-1 right-2 h-[5px] w-[5px] rounded-full bg-[#E3BB62]" />
                  <span className="absolute bottom-0 -left-1 h-[4px] w-[4px] rounded-full bg-sky-300" />

                  {/* Icon-Container */}
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 border border-white/40 text-white shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
                    {React.cloneElement(icon as any, {
                      size: 22,
                      className: "text-white",
                    })}
                  </div>
                </div>
              )}

              {/* kleines Label rechts vom Icon */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Admin · Area
                </span>
                <span className="text-[11px] text-white/80">
                  Konfiguration & Benutzerverwaltung
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

          {/* kleine Info-Chips unter dem Titel */}
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-[11px] font-medium text-white/85 border border-white/15 backdrop-blur-sm">
              • Benutzer · Rollen · Rechte
            </span>
            <span className="inline-flex items-center rounded-full bg-black/14 px-3 py-1 text-[11px] font-medium text-white/80 border border-white/10 backdrop-blur-sm">
              • CapConsulting · ICA³
            </span>
          </div>
        </div>

        {/* Rechter Bereich: z.B. Buttons (extra) */}
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
