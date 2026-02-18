/**
 * logoutApi - Backend-Logout mit Token + Cookie-Cleanup
 */
export async function logoutApi(token: string | null) {
  if (!token) {
    console.warn('logoutApi: No token provided, skipping backend logout');
    return;
  }

  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: 'include', // WICHTIG: Für Cookie-Cleanup
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ token }), // Backend erwartet { token: "..." }
    });
    
    if (!res.ok) {
      console.warn("Logout API returned", res.status);
     
    } else {
      const data = await res.json();
      console.log("Logout successful:", data.message);
    }
  } catch (e) {
    console.warn("Logout API failed:", e);
  }
}

