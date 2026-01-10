import React, { useEffect, useMemo, useRef, useState } from "react";

const TOKENS = {
  grey:  "#808080",
  steel: "#56768f",
  navy:  "#264555",
  sand:  "#d2c9b9",
};

type Square = {
  x: number; // percent 0..100
  y: number; // percent 0..100
  size: number; // px
  radius: number; // px
  color: string;
  opacity: number;
  speed: number; // parallax intensity
  blur: number; // px
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function SoftSquaresBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState({ nx: 0, ny: 0 }); // -1..1
  const rafRef = useRef<number | null>(null);

  const squares = useMemo<Square[]>(() => {
    const rnd = mulberry32(42); // seed => stabil, nicht “zappelig” bei re-render
    const colors = [TOKENS.grey, TOKENS.steel, TOKENS.navy, TOKENS.sand];

    const list: Square[] = [];
    for (let i = 0; i < 24; i++) {
      const size = Math.round(46 + rnd() * 120);        // 46..166
      const radius = Math.round(16 + rnd() * 26);       // 16..42
      const x = Math.round(rnd() * 100);
      const y = Math.round(rnd() * 100);
      const color = colors[Math.floor(rnd() * colors.length)];
      const opacity = 0.06 + rnd() * 0.12;              // 0.06..0.18
      const speed = 6 + rnd() * 18;                     // 6..24
      const blur = Math.round(rnd() * 1.5);             // 0..2
      list.push({ x, y, size, radius, color, opacity, speed, blur });
    }
    return list;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      // rAF throttling für Performance
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0..1
        const py = (e.clientY - rect.top) / rect.height;  // 0..1

        // -1..1
        setPointer({
          nx: (px - 0.5) * 2,
          ny: (py - 0.5) * 2,
        });
      });
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* optional: ganz leichter “goldener” Glow wie du wolltest */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.10) 0, transparent 45%)",
        }}
      />

      {squares.map((s, idx) => {
        const tx = pointer.nx * s.speed; // px
        const ty = pointer.ny * s.speed; // px

        return (
          <div
            key={idx}
            className="absolute will-change-transform"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: `${s.radius}px`,
              backgroundColor: s.color,
              opacity: s.opacity,
              filter: s.blur ? `blur(${s.blur}px)` : undefined,
              transform: `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0)`,
              transition: "transform 180ms ease-out",
            }}
          />
        );
      })}
    </div>
  );
}
