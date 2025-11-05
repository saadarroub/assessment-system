import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthCtx } from "@/core/auth/AuthContext";

const API_URL = (import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:8080/api";
const ENV_EMAIL = (import.meta as any)?.env?.VITE_DEFAULT_ADMIN_EMAIL;
const ENV_PW    = (import.meta as any)?.env?.VITE_DEFAULT_ADMIN_PASSWORD;

// Fallback-Defaults, falls ENV nicht gesetzt ist
const DEFAULT_ADMIN_EMAIL = (ENV_EMAIL && String(ENV_EMAIL)) || "admin@example.com";
const DEFAULT_ADMIN_PW    = (ENV_PW && String(ENV_PW))       || "admin123";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;
  const { login } = useAuthCtx();

  const doRedirect = (roles: string[]) => {
    if (from) { navigate(from, { replace: true }); return; }
    if (roles.includes("admin")) navigate("/admin", { replace: true });
  };

  // Offline-Login: KEIN Fetch, sofort lokal authentifizieren
  const offlineAdminLogin = () => {
    const payload = { sub: email, roles: ["admin"], offline: true, ts: Date.now() };
    const fakeJwt = `fake.${btoa(JSON.stringify(payload))}.token`;
    const roles = ["admin"];

    login(fakeJwt, roles);
    localStorage.setItem("user", JSON.stringify({ email, roles, accessToken: fakeJwt, note: "offline-admin" }));
    localStorage.setItem("accessToken", fakeJwt);
    doRedirect(roles);
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Offline-Admin
  if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PW) {
    offlineAdminLogin();
    return;
  }

  setLoading(true);
  try {
    // Login 
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login fehlgeschlagen (HTTP ${res.status})`);

    const rawUser = await res.json();        
    delete (rawUser as any).password;   

    const token: string = rawUser.accessToken ?? "dev-token";

    // Rollen separat laden
    const rolesRes = await fetch(`${API_URL}/users/${rawUser.id}/roles`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && token !== "dev-token" ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!rolesRes.ok) throw new Error(`Rollenabfrage fehlgeschlagen (HTTP ${rolesRes.status})`);

    const roleLinks = await rolesRes.json();
    const roles: string[] = Array.isArray(roleLinks)
      ? roleLinks
          .map((r: any) => r.role.name)
          .filter((n: unknown): n is string => typeof n === "string" && n.length > 0)
      : [];

    // Normalisiertes User-Objekt
    const normalizedUser = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      accessToken: token,
      roles,
      createdAt: rawUser.createdAt,
      updatedAt: rawUser.updatedAt,
    };

    // Persistieren + AuthContext + Redirect
    login(token, roles);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    if (normalizedUser.accessToken) {
      localStorage.setItem("accessToken", normalizedUser.accessToken);
    }

    doRedirect(roles);
  } catch (err: any) {
    setError(err?.message || "Unbekannter Fehler beim Login.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#264555]">
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>

        {error && <div className="mb-4 text-red-300 text-sm text-center">{error}</div>}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E3BB62] hover:bg-[#d3a84f] disabled:opacity-70 disabled:cursor-not-allowed text-[#1E293B] font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Wird eingeloggt..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-white/70 mt-4">
          Offliner: <b>{DEFAULT_ADMIN_EMAIL}</b> / <b>{DEFAULT_ADMIN_PW}</b>
        </p>
      </div>
    </div>
  );
}