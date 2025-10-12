import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined; 
  const { login } = useAuthCtx();

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);   
  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), 
      });

      if (!res.ok) {
        throw new Error(`Login fehlgeschlagen (HTTP ${res.status})`);
      }
        const user = await res.json();
      delete (user as any).password; // Sicherheit

      // Bis Keycloak/Backend echten Token liefert:
      const token = user.accessToken ?? "dev-token";
      const roles: string[] = user.roles ?? [];

      // EINZIGER Ort, wo Auth gesetzt wird
      login(token, roles);
      // User im Storage für Profil/Anzeige
      localStorage.setItem("user", JSON.stringify(user));
      // Optional: wenn Backend irgendwann echten Access-Token liefert – separat ablegen
      if (user.accessToken) localStorage.setItem("accessToken", user.accessToken);

      // ⬅Priorität 1: dorthin zurück, wo der Header hin wollte
    if (from) {
      navigate(from, { replace: true });
      return;
    }

 // ⬅️ sonst: rollenbasiert
    if (roles.includes("admin")) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/app/dashboard", { replace: true });
    }
    
    } catch (err:any) {
      console.error(err);
      // Fehlermeldung anzeigen
            setError(err.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#264555]">
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Login
        </h2>
        {/* Error Anzeige */}
        {error && (
          <div className="mb-4 text-red-300 text-sm text-center">{error}</div>
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
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300
             focus:outline-none focus:ring-2 focus:ring-[#E3BB62]"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E3BB62] hover:bg-[#d3a84f] disabled:opacity-70 disabled:cursor-not-allowed text-[#1E293B] font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Wird eingeloggt..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-4">
          Kein Account?{" "}
          <a href="/register" className="text-[#E3BB62] font-semibold hover:underline">
            Registrieren
          </a>
        </p>
      </div>
    </div>
  );
}
