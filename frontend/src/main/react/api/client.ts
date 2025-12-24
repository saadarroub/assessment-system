// src/main/react/api/client.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthService } from "@/core/auth/AuthService";
import { PermissionEventBus } from "@/core/auth/PermissionEventBus";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // WICHTIG: Für httpOnly Cookies (Refresh Token)
  withCredentials: true,
});

// ========== REQUEST INTERCEPTOR: Attach Bearer Token ==========
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getAccessToken();
    
    if (token) {
      // Attach Authorization Header automatisch
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR: Handle 401 (Unauthorized) & 403 (Forbidden) ==========
apiClient.interceptors.response.use(
  // Success Response → Durchleiten
  (response) => response,
  
  // Error Response → Smart Handling
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ===== 401 UNAUTHORIZED: Token expired → Refresh & Retry =====
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Versuche Token zu refreshen
        const newToken = await AuthService.refreshToken();
        
        // Update Authorization Header mit neuem Token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry Original Request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh fehlgeschlagen → User muss neu einloggen
        // AuthService.clearTokens() wurde bereits in refreshToken() aufgerufen
        
        // Optional: Redirect zu Login (aber NICHT hier, sondern in AuthContext)
        // window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // ===== 403 FORBIDDEN: Keine Berechtigung → Event emittieren =====
    if (error.response?.status === 403) {
      // User bleibt eingeloggt, aber hat keine Permission für diese Aktion
      
      // Extrahiere Details aus Request
      const method = originalRequest.method?.toUpperCase() || "GET";
      const resource = originalRequest.url || "unknown";
      const responsePayload = error.response?.data as { message?: string } | undefined;
      const message = responsePayload?.message || "Keine Berechtigung für diese Aktion";

      // Unterscheide zwischen GET (Blur-Overlay) und anderen Methoden (Toast)
      const isGetRequest = method === "GET";

      // Emittiere Event für UI-Feedback
      PermissionEventBus.emit({
        action: `${method} ${resource}`,
        resource,
        message,
        isGetRequest, // Neu: Flag für UI-Entscheidung
      });

      // Error weiterwerfen (Component kann entscheiden wie sie reagiert)
      return Promise.reject(error);
    }

    // ===== Alle anderen Errors: Durchleiten =====
    return Promise.reject(error);
  }
);
