import { useEffect, useMemo, useState } from "react";
import {Hourglass} from "lucide-react";

type Props = {
  expiresAt: string; // ISO, z.B. "2025-11-05T18:00:00Z"
  compact?: boolean; // kleinere Darstellung
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { d, h, m, s, expired: false };
}

export default function CountdownTimer({ expiresAt, compact }: Props) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, target - now);
  const { d, h, m, s, expired } = formatRemaining(remainingMs);

  // Nur zwei "Warn"-Fälle:
  const lessThanDay = !expired && remainingMs < 24 * 3600 * 1000;
  const lessThanHour = !expired && remainingMs < 3600 * 1000;

  // NUR Schrift einfärben (kein Container-Background):
  const textTone = expired
    ? "text-slate-500"
    : lessThanHour
      ? "text-red-600"
      : lessThanDay
        ? "text-amber-600"
        : "text-slate-900";

  // ~2x größer: größeres Padding & Schriftgrößen
  const sizeNum = compact ? "text-xl" : "text-2xl";   // Tage-Zahl
  const sizeTime = compact ? "text-lg" : "text-xl";   // HH:MM:SS

  return (
    <div
      className={`inline-flex items-center gap-4 px-5 py-3 rounded-xl border border-slate-200 shadow-sm bg-white`}
      aria-label="Countdown-Timer"
      title={expired ? "Abgelaufen" : "Verbleibende Zeit"}
    >
      <Hourglass className={`w-6 h-6 ${textTone}`} aria-hidden />
      <div className="flex items-baseline gap-3">
         {d > 0 ? (
    // Fall: noch mindestens 1 Tag
    <span className={`${sizeNum} font-semibold ${textTone}`}>
     noch {d} {d === 1 ? "Tag" : "Tage"} 
    </span>
  ) : (
    // Fall: weniger als 1 Tag → Stunden/Minuten/Sekunden anzeigen
    <span className={`tabular-nums ${sizeTime} ${textTone}`}>
      {pad(h)}:{pad(m)}:{pad(s)} noch
    </span>
  )}
      </div>
    </div>
  );
}
