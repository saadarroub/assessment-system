import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { AuthService } from "@/core/auth/AuthService";
import type { UserData } from "@/core/auth/AuthService";
import HereImage from "@/assets/hero-image.jpg";
import Erstev from "@/assets/dritte.png";
import IcaLogo from "@/assets/ChatGPT Image 29. Dez. 2025, 20_35_15.png";
import IcaLogo2 from "@/assets/ChatGPT Image 29. Dez. 2025, 20_48_13.png";
import { Eye, EyeOff } from "lucide-react";


const API_URL = (import.meta as any)?.env?.VITE_API_URL ?? "/api";


//const BG_IMAGE_A = HereImage;
const BG_IMAGE_A = Erstev;
// const BG_IMAGE_A = IcaLogo;
const BG_IMAGE_B = "https://source.unsplash.com/0luEH7946jA/2400x1600";

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-[#E3BB62] shadow-[0_10px_30px_rgba(227,187,98,0.35)] grid place-items-center">
        <span className="font-extrabold text-[#264555] tracking-tight">ICA³</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white/95">ICA³ Platform</div>
        <div className="text-xs text-white/70">
          Integrated Customer Assessments & Advanced Analytics
        </div>
      </div>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-5 w-5 rounded-full border border-[#E3BB62]/50 bg-[#E3BB62]/15 grid place-items-center">
        <div className="h-2 w-2 rounded-full bg-[#E3BB62]" />
      </div>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;
  const { login } = useAuthCtx();

  const bgUrl = useMemo(() => BG_IMAGE_A, []);

  const doRedirect = () => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    navigate("/admin", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login fehlgeschlagen (HTTP ${res.status})`);
      }

      const data = await res.json();

      if (!data.accessToken || !data.expiresAt) {
        throw new Error("Ungültige Server-Response: accessToken oder expiresAt fehlt");
      }

      const user: UserData = {
        id: data.id,
        username: data.username || data.name,
        email: data.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      };

      AuthService.setTokens(
        { accessToken: data.accessToken, expiresAt: data.expiresAt },
        user,
        rememberMe
      );

      login(user, rememberMe);

      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("roles");
      localStorage.removeItem("user");

      doRedirect();
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err?.message || "Unbekannter Fehler beim Login.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen relative overflow-hidden bg-[#264555]">

      {/* Background photo */}
      <img
        src={bgUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />

      {/* Brand overlay (makes any photo fit your palette) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#264555]/95 via-[#264555]/40 to-[#56768f]/40" />

      {/* Subtle premium glow + dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 600px at 15% 10%, rgba(227,187,98,0.22), transparent 55%)," +
            "radial-gradient(700px 500px at 85% 25%, rgba(86,118,143,0.25), transparent 55%),",
          backgroundSize: "auto, auto, 18px 18px",
          backgroundPosition: "center, center, 0 0",
        }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {/* Outer frame */}
          <div className="rounded-3xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden backdrop-blur-sm">
            {/* Top hairline */}
            <div className="h-1.5 bg-gradient-to-r from-[#E3BB62] via-[#d2c9b9] to-[#56768f]" />

            {/* Main grid */}
            <div className="grid md:grid-cols-2">
              {/* Left: Brand/Value */}
              <div className="relative p-8 md:p-10 bg-[#264555]/80">
                <div className="flex items-start justify-between gap-4">
                  <LogoMark />
                  <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3BB62]" />
                    Secure Access
                  </div>
                </div>

                <div className="mt-10">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                    Willkommen zurück.
                  </h1>
                  <p className="mt-3 text-white/75 max-w-md">
                    Melde dich an, um Assessments zu erstellen, Ergebnisse zu analysieren und Reports sicher zu verwalten.
                  </p>

                  <div className="mt-8 space-y-4">
                    <CheckItem>Zentrale Verwaltung von Assessments & Katalogen</CheckItem>
                    <CheckItem>Rollenbasierter Zugriff und sichere Anmeldung</CheckItem>
                    <CheckItem>Export & Reporting für interne Auswertungen</CheckItem>
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/55">
                    <span>© {new Date().getFullYear()} ICA³</span>
                    <span className="hidden sm:inline">Sicherer Zugang • Session-basiert</span>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-[#E3BB62]/10 blur-2xl" />
              </div>

              {/* Right: Form */}
              <div className="p-8 md:p-10 bg-[#ebebec]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#264555]">Login</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Bitte gib deine Zugangsdaten ein, um fortzufahren.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">CAP Consulting</div>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="font-semibold">Login fehlgeschlagen</div>
                    <div className="mt-0.5">{error}</div>
                  </div>
                )}

                <form className="mt-7 space-y-5" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-sm font-medium text-[#264555]">
                      E-Mail
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm
                                   placeholder:text-slate-400
                                   focus:outline-none focus:ring-2 focus:ring-[#E3BB62]/60 focus:border-[#E3BB62]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#264555]">Passwort</label>

                    <>
                      {/* nur für dieses Component */}
                      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 shadow-sm
                 placeholder:text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-[#E3BB62]/60 focus:border-[#E3BB62]"
                        />

                        {/* dein Icon */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:text-slate-700"
                          aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </>

                  </div>


                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#E3BB62] focus:ring-[#E3BB62]"
                      />
                      Angemeldet bleiben
                    </label>

                    <div className="text-xs text-slate-500">
                      Secure Session • Cookies
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3 font-semibold text-[#264555]
                               bg-[#E3BB62] hover:brightness-[0.98] active:brightness-[0.96]
                               disabled:opacity-60 disabled:cursor-not-allowed
                               shadow-[0_14px_30px_rgba(227,187,98,0.35)] transition"
                  >
                    {loading ? "Wird eingeloggt..." : "Login"}
                  </button>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Durch das Einloggen stimmst du den internen Nutzungsrichtlinien zu.
                  </p>
                </form>

                {/* Bottom brand hint */}
                <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#56768f]" />
                    System Status: Operational
                  </span>
                  <span className="text-slate-400">v1.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
}
