import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: echten Login/API-Call einbauen einmal hierr
      // await api.login({ email, password });

      // Nach Erfolg zur App-Dashboard-Seite
      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);
      // TODO: Fehlermeldung anzeigen
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
