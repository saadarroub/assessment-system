import { useMemo } from "react";

type Props = {
  firstName?: string;
};

type Variant = "morning" | "day" | "evening";

function getGreeting(hours: number, firstName?: string) {
  const base =
    hours < 12 ? "Guten Morgen" : hours < 18 ? "Guten Tag" : "Guten Abend";
  return firstName ? `${base}, ${firstName}!` : `${base}!`;
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
    gradientFrom: "#264555", 
    gradientTo: "#E3BB62", 
    accentStrong: "rgba(255, 255, 255, 0.18)",
    accentMedium: "rgba(255, 255, 255, 0.12)",
    accentSoft: "rgba(255, 255, 255, 0.08)",
    textColor: "#FFFFFF",
  },
  day: {
    
   gradientFrom: "#2B5F8A",
    gradientTo: "#52628fff",
    accentStrong: "rgba(255, 255, 255, 0.20)",
    accentMedium: "rgba(255, 255, 255, 0.14)",
    accentSoft: "rgba(255, 255, 255, 0.10)",
    textColor: "#FFFFFF",
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
  const variant: Variant =
    hour < 12 ? "morning" : hour < 18 ? "day" : "evening";

  const config = THEME[variant];

  return (
    <div
      className={`
         relative w-full max-w-[1100px] mx-auto mb-6
    overflow-hidden rounded-2xl shadow-sm
    py-6 md:py-10 lg:py-12
      `}
      style={{
        // Gradient lokal, ohne Tailwind
        backgroundImage: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
      }}
      role="img"
      aria-label="Zeitabhängiger Begrüßungsbanner"
    >
      {/* Geometrische Hintergrund-Formen */}
      <div className="absolute inset-0 opacity-20">
        {/* große Raute links */}
        <div
          className="
            absolute -top-24 -left-24 w-96 h-96 rotate-45
          "
          style={{ backgroundColor: config.accentStrong }}
        />
        {/* Shape rechts oben */}
        <div
          className="
            absolute top-0 right-0 w-64 h-64 -rotate-12
          "
          style={{ backgroundColor: config.accentMedium }}
        />
        {/* Shape unten links */}
        <div
          className="
            absolute bottom-0 left-1/4 w-72 h-72 rotate-12
          "
          style={{ backgroundColor: config.accentSoft }}
        />
        {/* Shape unten rechts */}
        <div
          className="
            absolute -bottom-12 right-1/3 w-48 h-48 rotate-45
          "
          style={{ backgroundColor: config.accentStrong }}
        />
      </div>

      {/* Text-Ebene */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <h1
          className={`
            text-3xl md:text-4xl lg:text-5xl font-extrabold
            drop-shadow-md text-center
          `}
          style={{ color: config.textColor }}
        >
          {getGreeting(hour, firstName)}
        </h1>
      </div>
    </div>
  );
}
