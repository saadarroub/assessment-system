import { Settings } from "lucide-react";

type Props = {
  name: string;
  email?: string;
  avatarUrl: string;
  collapsed?: boolean;
  onSettings?: () => void;
  tokens: {
    sidebarHSL: string;
    sidebarStrong: string;
    sidebarBorder: string;
    sidebarFg: string;
    sidebarMuted: string;
  };
};

export default function ProfileStrip({
  name,
  email,
  avatarUrl,
  collapsed = false,
  onSettings,
  tokens,
}: Props) {
  // Farben aus deinen TOKENS
  const bg = `hsl(${tokens.sidebarStrong})`;
  const fg = `hsl(${tokens.sidebarFg})`;
  const muted = `hsl(${tokens.sidebarMuted})`;
  const brd = `hsl(${tokens.sidebarBorder})`;

  if (collapsed) {
    // Kompakte Variante (nur Avatar + Zahnrad)
    return (
      <div
        className="mt-3 rounded-2xl border px-2 py-2 flex items-center justify-between"
        style={{ background: bg, color: fg, borderColor: brd }}
      >
        <div className="relative">
          <img src={avatarUrl} alt="Profil" className="h-10 w-10 rounded-full object-cover" />
          {/* Online-Dot (optional) */}
          <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border" style={{ background: "#22c55e", borderColor: bg }} />
        </div>
        <button
          type="button"
          aria-label="Einstellungen"
          onClick={onSettings}
          className="grid place-items-center rounded-xl border px-3 py-2 hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,.18)", color: muted }}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // Normale (breite) Variante
  return (
    <div
      className="mt-3 rounded-2xl border p-3 flex items-center gap-3"
      style={{ background: bg, color: fg, borderColor: brd }}
    >
      <div className="relative">
        <img src={avatarUrl} alt="Profil" className="h-12 w-12 rounded-full object-cover" />
        {/* Online-Dot (optional) */}
        <span className="absolute -bottom-0 -right-0 h-3.5 w-3.5 rounded-full border" style={{ background: "#22c55e", borderColor: bg }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{name}</div>
        {email && (
          <div className="text-xs truncate" style={{ color: muted }}>
            {email}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Einstellungen"
        onClick={onSettings}
        className="grid place-items-center rounded-xl border px-3 py-2 hover:bg-white/10"
        style={{ borderColor: "rgba(255,255,255,.18)", color: muted }}
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}
