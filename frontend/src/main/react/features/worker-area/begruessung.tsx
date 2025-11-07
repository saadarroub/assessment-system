import { useMemo } from "react";
import MorgenImg from "@/assets/morning.png";
import MittagImg from "@/assets/morning.png";
import AbendImg from "@/assets/test5.png";//3

type Props = {
  firstName?: string;
};

function getGreeting(hours: number, firstName?: string) {
  const base =
    hours < 12 ? "Guten Morgen" : hours < 18 ? "Guten Tag" : "Guten Abend";
  return firstName ? `${base}, ${firstName}!` : `${base}!`;
}

export default function GreetingBanner({ firstName }: Props) {
  const hour = useMemo(() => new Date().getHours(), []);
  const variant = useMemo<"morning" | "day" | "evening">(
    () => (hour < 12 ? "morning" : hour < 18 ? "day" : "evening"),
    [hour]
  );

  const config = {
    morning: {
      image: MorgenImg, 
      overlayFrom: "bg-cap-gold/70",
      overlayTo: "bg-cap-sand/0",
      textClass: "text-white",
    },
    day: {
      image: MittagImg,
      overlayFrom: "bg-cap-mid/60",
      overlayTo: "bg-cap-light/0",
      textClass: "text-white",
    },
    evening: {
      image: AbendImg,
      overlayFrom: "bg-cap-dark/70",
      overlayTo: "bg-cap-gray/0",
      textClass: "text-[#F5F7FA]",
    },
  }[variant];

  return (
    <div
      className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden shadow-sm mb-6"
      style={{
        backgroundImage: `url(${config.image})`,
        backgroundSize: "no-repeat",
        backgroundPosition: "cover",
      }}
      role="img"
      aria-label="Zeitabhängiger Begrüßungsbanner"
    >
      {/* Gradient-Overlay in Markenfarben */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-r from-0% to-80% ${config.overlayFrom} ${config.overlayTo}`} />
      </div>

      {/* Text */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <h1 className={`text-4xl md:text-5xl font-extrabold drop-shadow-md ${config.textClass}`}>
          {getGreeting(hour, firstName)}
        </h1>
      </div>
    </div>
  );
}
