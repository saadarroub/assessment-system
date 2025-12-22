import { useMemo } from "react";

type Props = { firstName?: string };
type Variant = "morning" | "day" | "evening";

function getGreeting(hours: number, firstName?: string) {
  const base =
    hours < 12 ? "Guten Morgen" : hours < 18 ? "Guten Tag" : "Guten Abend";
  return firstName ? `${base}, ${firstName} !` : `${base}`;
}

const THEME: Record<
  Variant,
  {
    gradientFrom: string;
    gradientTo: string;
    accentStrong: string;
    accentSoft: string;
    accentMedium: string;
    textColor: string;
  }
> = {
  morning: {
    gradientFrom: "#465e88ff",
    gradientTo: "#37405cff",
    accentStrong: "rgba(255, 255, 255, 0.16)",
    accentMedium: "rgba(255, 255, 255, 0.10)",
    accentSoft: "rgba(255, 255, 255, 0.06)",
    textColor: "#F5F7FA",
  },
  day: {
    gradientFrom: "#465e88ff",
    gradientTo: "#37405cff",
    accentStrong: "rgba(255, 255, 255, 0.16)",
    accentMedium: "rgba(255, 255, 255, 0.10)",
    accentSoft: "rgba(255, 255, 255, 0.06)",
    textColor: "#F5F7FA",
  },
  evening: {
    gradientFrom: "#465e88ff",
    gradientTo: "#37405cff",
    accentStrong: "rgba(255, 255, 255, 0.16)",
    accentMedium: "rgba(255, 255, 255, 0.10)",
    accentSoft: "rgba(255, 255, 255, 0.06)",
    textColor: "#F5F7FA",
  },
};

export default function GreetingBanner({ firstName }: Props) {
  const hour = useMemo(() => new Date().getHours(), []);
  const variant: Variant = hour < 12 ? "morning" : hour < 18 ? "day" : "evening";
  const config = THEME[variant];

  return (
    <div
      className="
        relative w-full max-w-[1100px] mx-auto mb-6
        overflow-hidden rounded-2xl
        py-7 md:py-10 lg:py-12
        shadow-[0_18px_50px_-28px_rgba(0,0,0,0.55)]
      "
      style={{
        backgroundImage: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
      }}
      role="img"
      aria-label="Zeitabhängiger Begrüßungsbanner"
    >
      {/* uper dezenter “Glas”-Layer für Tiefe */}
      <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-[1px]" />

      {/*ganz dünner Rand (macht es “fertiger”) */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />

      {/* Geometrische Hintergrund-Formen (minimal softer) */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rotate-45 blur-[1px]"
          style={{ backgroundColor: config.accentStrong }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 -rotate-12 blur-[1px]"
          style={{ backgroundColor: config.accentMedium }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 rotate-12 blur-[1px]"
          style={{ backgroundColor: config.accentSoft }}
        />
        <div
          className="absolute -bottom-12 right-1/3 w-48 h-48 rotate-45 blur-[1px]"
          style={{ backgroundColor: config.accentStrong }}
        />
      </div>

      {/* leichte “Wash” oben – macht Text lesbarer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_55%)]" />

      {/* Text-Ebene */}
      <div className="relative z-10 flex items-center justify-center h-full px-5">
        <h1
          className="
            text-center font-extrabold tracking-tight
            text-3xl md:text-4xl lg:text-5xl
            drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]
          "
          style={{ color: config.textColor }}
        >
          {firstName ? (
            <>
              {getGreeting(hour)}{" "}
              <span className="text-[#E3BB62] drop-shadow-[0_2px_10px_rgba(227,187,98,0.25)]">
                {firstName} !
              </span>
            </>
          ) : (
            getGreeting(hour)
          )}
        </h1>
      </div>
    </div>
  );
}
