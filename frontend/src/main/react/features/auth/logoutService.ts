export async function logoutApi(token: string | null) {
  if (!token) return; // nichts zu tun (dev oder schon ausgeloggt)

  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }), // dein Backend erwartet { token: "..." }
    });
    // optional prüfen/loggen – die App soll auch bei 4xx/5xx lokal abmelden
    if (!res.ok) {
      console.warn("Logout API returned", res.status);
    } else {
      // optional: Response lesen
      // const data = await res.json();
      // console.log(data);
    }
  } catch (e) {
    console.warn("Logout API failed:", e);
  }
}
