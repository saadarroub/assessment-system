/**
 * logoutApi - Backend-Logout mit Token + Cookie-Cleanup
 * 
 * WICHTIG: 
 * - Verwendet credentials: 'include' für httpOnly Cookie-Cleanup
 * - Backend löscht Refresh-Token-Cookie
 * - Token kann null sein (z.B. in Dev-Mode)
 */
export async function logoutApi(token: string | null) {
  if (!token) {
    console.warn('logoutApi: No token provided, skipping backend logout');
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: 'include', // WICHTIG: Für Cookie-Cleanup
      headers: { 
        "Content-Type": "application/json",
        // Optional: Token auch im Header (für zusätzliche Validierung)
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ token }), // Backend erwartet { token: "..." }
    });
    
    if (!res.ok) {
      console.warn("Logout API returned", res.status);
      // Nicht werfen - App soll trotzdem lokal abmelden
    } else {
      const data = await res.json();
      console.log("Logout successful:", data.message);
    }
  } catch (e) {
    console.warn("Logout API failed:", e);
    // Nicht werfen - App soll trotzdem lokal abmelden
  }
}

