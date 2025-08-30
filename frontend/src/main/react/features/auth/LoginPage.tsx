import { useState } from "react";
// Optional: wenn du react-router nutzt, kannst du die Navigation aktivieren
// import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const navigate = useNavigate();

  const handleRoleLogin = (role: "kund" | "admin") => {
    // Hier später API-Call / Role-Flow einbauen
    console.log(`Login als ${role}:`, { email, password });

    // Optional: route je nach Rolle
    // if (role === "kund") navigate("/kunde/dashboard");
    // if (role === "admin") navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#264555]">
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Login
        </h2>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-white text-sm mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E3BB62]"
              required
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
            />
          </div>

          {/* Zwei Buttons statt Einloggen */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleRoleLogin("kund")}
              className="w-full bg-[#E3BB62] hover:bg-[#d3a84f] text-[#1E293B] font-semibold py-2 rounded-lg transition"
            >
              Als Kund
            </button>
            <button
              type="button"
              onClick={() => handleRoleLogin("admin")}
              className="w-full border border-white/40 text-white hover:bg-white/10 font-semibold py-2 rounded-lg transition"
            >
              Als Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
