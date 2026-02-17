// CornerBadge.tsx
import type { PropsWithChildren } from "react";

type Props = {
  /** Gesamtbreite in px */
  width?: number;
  /** Gesamthöhe in px */
  height?: number;
  /** Senkrechter „Einzug“ an der rechten Kante (kleines Stück, das nach unten geht) */
  rightNotch?: number;
  /** Länge der unteren waagerechten Kante (kleines rechtes Stück) */
  bottomRightLen?: number;
  /** Höhe des abgeschrägten Schnitts links unten */
  bevelHeight?: number;
  /** Füllfarbe (HEX oder CSS-Farbe) */
  fill?: string;
  /** Linienfarbe */
  stroke?: string;
  /** Linienbreite */
  strokeWidth?: number;
    /** zusätzliche Klassen für das Haupt-Element */
  className?: string;
  /** zusätzliche Klassen für das Overlay (der Layer über dem SVG) */
  overlayClassName?: string;
};

export default function CornerBadge({
  width = 240,
  height = 120,
  rightNotch = 28,
  bottomRightLen = 56,
  bevelHeight = 52,
  fill = "#ebebec",
  stroke = "#a5a5a57f",
  strokeWidth = 4,
  className,
  overlayClassName,
  children,
}: PropsWithChildren<Props>) {
  const rn = Math.max(0, Math.min(height - 1, rightNotch));
  const br = Math.max(0, Math.min(width - 1, bottomRightLen));
  const bv = Math.max(0, Math.min(height - 1, bevelHeight));

  // Punkte (A→B→C→H→D→E→A) – mit kurzem Boden rechts
  const A = [0, 0];
  const B = [width, 0];
  const C = [width, rn];
  const H = [width, height];
  const D = [width - br, height];
  const E = [0, height - bv];

  const points = [A, B, C, H, D, E].map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width, height }}
      aria-label="Parallelogramm-Badge"
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Overlay-Layer für Inhalte in der Form */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${overlayClassName ?? ""}`}
        // wichtig: Klicks auf Children erlauben
        style={{ pointerEvents: "none" }}
      >
        {/* pointer-events wieder aktivieren NUR für Kinder */}
        <div style={{ pointerEvents: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
