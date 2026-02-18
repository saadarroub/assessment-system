import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthService } from "@/core/auth/AuthService";
import { PermissionEventBus } from "@/core/auth/PermissionEventBus";
import { SessionEventBus } from "@/core/auth/SessionEventBus";

/* =========================================================
   Axios Instance
========================================================= */

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly Refresh Cookie
});

/* =========================================================
   Helper: erkennt "Session abgelaufen" obwohl 403
========================================================= */

function isSessionExpired403(error: AxiosError): boolean {
  const data = error.response?.data as any;
  const msg = String(data?.message ?? "").toLowerCase();
  const err = String(data?.error ?? "").toLowerCase();
  const wwwAuth = String(
    (error.response?.headers as any)?.["www-authenticate"] ?? ""
  ).toLowerCase();

  return (
    msg.includes("expired") ||
    msg.includes("full authentication") ||
    msg.includes("authentication") ||
    (msg.includes("token") && (msg.includes("invalid") || msg.includes("expired"))) ||
    err.includes("invalid_token") ||
    wwwAuth.includes("invalid_token")
  );
}

/* =========================================================
   REQUEST INTERCEPTOR – Bearer Token
========================================================= */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR – 401 / 403 GLOBAL HANDLING
========================================================= */

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    /* ===== 401 → Access Token expired → Refresh ===== */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await AuthService.refreshToken();

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        AuthService.clearTokens();
        SessionEventBus.emit({
          type: "EXPIRED",
          message: "Deine Sitzung ist abgelaufen. Bitte neu einloggen.",
        });
        return Promise.reject(error);
      }
    }

    /* ===== 403 → Session ODER Permission ===== */
    if (error.response?.status === 403) {

      // SESSION ABGELAUFEN (kommt bei euch als 403)
      if (isSessionExpired403(error)) {
        AuthService.clearTokens();
        SessionEventBus.emit({
          type: "EXPIRED",
          message: "Deine Sitzung ist abgelaufen. Bitte neu einloggen.",
        });
        return Promise.reject(error);
      }

      //ECHTE BERECHTIGUNG FEHLT
      const method = originalRequest.method?.toUpperCase() || "GET";
      const resource = originalRequest.url || "unknown";
      const responsePayload = error.response.data as { message?: string } | undefined;

      PermissionEventBus.emit({
        action: `${method} ${resource}`,
        resource,
        message: responsePayload?.message || "Keine Berechtigung für diese Aktion",
        isGetRequest: method === "GET",
      });

      return Promise.reject(error);
    }

    /* ===== Andere Fehler ===== */
    return Promise.reject(error);
  }
);
