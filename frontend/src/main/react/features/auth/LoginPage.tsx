import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";
import { AuthService } from "@/core/auth/AuthService";
import type { UserData } from "@/core/auth/AuthService";

const API_URL = (import.meta as any)?.env?.VITE_API_URL ?? "/api";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;
  const { login } = useAuthCtx();

  const doRedirect = () => {
    if (from) { 
      navigate(from, { replace: true }); 
      return; 
    }
    // Alle User gehen zum Admin-Panel
    // Permissions aus DB bestimmen, was sie sehen/tun können
    navigate("/admin", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // === Login Request an neues Backend-API ===
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: 'include', // WICHTIG: Für httpOnly Cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login fehlgeschlagen (HTTP ${res.status})`);
      }

      // Parse Enhanced Login Response
      const data = await res.json();
      
      // Validiere Response-Struktur
      if (!data.accessToken || !data.expiresAt) {
        throw new Error('Ungültige Server-Response: accessToken oder expiresAt fehlt');
      }

      // Erstelle UserData-Objekt
      const user: UserData = {
        id: data.id,
        username: data.username || data.name, // Fallback für name → username
        email: data.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      };

      // === Speichere Token in AuthService (In-Memory + optional localStorage) ===
      AuthService.setTokens(
        { 
          accessToken: data.accessToken, 
          expiresAt: data.expiresAt 
        },
        user,
        rememberMe
      );

      // === Update React Context (für Re-Rendering) ===
      login(user, rememberMe);

      // === Cleanup: Entferne Legacy localStorage-Keys ===
      // Diese Keys werden nicht mehr verwendet (AuthService managed alles)
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('roles');
      localStorage.removeItem('user');

      // === Redirect basierend auf Rolle ===
      doRedirect();

    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err?.message || "Unbekannter Fehler beim Login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#264555]">
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-white text-sm mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E3BB62]"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E3BB62]"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 w-4 h-4 text-[#E3BB62] bg-white/20 border-gray-300 rounded focus:ring-[#E3BB62]"
            />
            <label htmlFor="rememberMe" className="text-white text-sm">
              Angemeldet bleiben
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E3BB62] hover:bg-[#d3a84f] disabled:opacity-70 disabled:cursor-not-allowed text-[#1E293B] font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Wird eingeloggt..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}