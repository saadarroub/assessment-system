/**
 * AuthService - Singleton für zentrale Token-Verwaltung
 * 
 * Verantwortlichkeiten:
 * - In-Memory Token Storage (Access Token verschwindet bei Tab-Close = sicher)
 * - Token-Refresh-Logic mit automatischer Erneuerung
 * - Token-Expiry-Prüfung
 * - Optional: localStorage-Fallback für "Remember Me" Feature
 * 
 * Best Practices:
 * - Keine direkten localStorage-Zugriffe in Components/Services
 * - Single Source of Truth für Authentication-Token
 * - Thread-safe Singleton Pattern
 */

export interface TokenData {
  accessToken: string;
  expiresAt: number; // Unix timestamp (ms)
  refreshToken?: string; // Optional, falls Backend httpOnly Cookie nutzt
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

class AuthServiceClass {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private user: UserData | null = null;
  private refreshPromise: Promise<string> | null = null;
  private rememberMe: boolean = false;

  // Konstanten für Token-Handling
  private readonly TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 Minuten vor Ablauf refreshen
  private readonly LOCALSTORAGE_KEY = 'auth_remember_me';
  private readonly SESSION_KEY = 'auth_session';

  constructor() {
    // Beim Startup: Prüfe ob "Remember Me" aktiv war
    this.loadFromLocalStorageIfRemembered();
    this.loadFromSessionStorage();
  }

  /**
   * Speichert Access Token in Memory + optional localStorage
   */
  setTokens(tokenData: TokenData, user: UserData, rememberMe: boolean = false): void {
    this.accessToken = tokenData.accessToken;
    this.tokenExpiresAt = tokenData.expiresAt;
    this.user = user;
    this.rememberMe = rememberMe;

    // Optional: Bei "Remember Me" Token in localStorage als Fallback
    if (rememberMe) {
      try {
        localStorage.setItem(this.LOCALSTORAGE_KEY, JSON.stringify({
          accessToken: tokenData.accessToken,
          expiresAt: tokenData.expiresAt,
          user: user,
        }));
      } catch (e) {
        console.warn('Failed to persist auth to localStorage:', e);
      }
    } else {
      localStorage.removeItem(this.LOCALSTORAGE_KEY);
    }

    this.persistSessionState(user, tokenData.expiresAt, rememberMe);
  }

  /**
   * Gibt aktuellen Access Token zurück (oder null wenn nicht eingeloggt)
   */
  getAccessToken(): string | null {
    // Token expired? Dann nicht zurückgeben
    if (this.isTokenExpired()) {
      return null;
    }
    return this.accessToken;
  }

  /**
   * Gibt User-Daten zurück
   */
  getUser(): UserData | null {
    return this.user;
  }

  /**
   * Prüft ob Token bald abläuft (innerhalb von 5 Minuten)
   */
  isTokenExpiringSoon(): boolean {
    if (!this.tokenExpiresAt) return false;
    const now = Date.now();
    return (this.tokenExpiresAt - now) < this.TOKEN_REFRESH_THRESHOLD_MS;
  }

  /**
   * Prüft ob Token bereits abgelaufen ist
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    return Date.now() >= this.tokenExpiresAt;
  }

  /**
   * Refreshed den Access Token via Backend-API
   * 
   * WICHTIG: Diese Methode wird von Axios Interceptor aufgerufen.
   * Backend muss POST /api/auth/refresh Endpoint haben.
   * 
   * @returns Promise mit neuem Access Token
   */
  async refreshToken(): Promise<string> {
    // Verhindere parallele Refresh-Requests (Race Condition)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<string> {
    try {
      // Backend-Call zum Refresh-Endpoint
      // WICHTIG: httpOnly Refresh-Cookie wird automatisch vom Browser mitgeschickt
      const response = await fetch('http://localhost:8080/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Wichtig für Cookies!
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      const tokenPayload: TokenData = {
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
      };

      if (this.user) {
        this.setTokens(tokenPayload, this.user, this.rememberMe);
      } else {
        this.accessToken = data.accessToken;
        this.tokenExpiresAt = data.expiresAt;
      }

      return data.accessToken;
    } catch (error) {
      // Refresh fehlgeschlagen → User muss neu einloggen
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Löscht alle Token und User-Daten
   */
  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    this.user = null;
    this.rememberMe = false;
    localStorage.removeItem(this.LOCALSTORAGE_KEY);
    this.clearSessionState();
    
    // Legacy-Keys cleanup (falls noch vorhanden)
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('roles');
    localStorage.removeItem('user');
  }

  /**
   * Lädt Token aus localStorage (nur wenn "Remember Me" aktiv war)
   */
  private loadFromLocalStorageIfRemembered(): void {
    try {
      const stored = localStorage.getItem(this.LOCALSTORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      
      // Prüfe ob Token noch gültig ist
      if (data.expiresAt && Date.now() < data.expiresAt) {
        this.accessToken = data.accessToken;
        this.tokenExpiresAt = data.expiresAt;
        this.user = data.user;
        this.rememberMe = true;
      } else {
        // Token expired → cleanup
        localStorage.removeItem(this.LOCALSTORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to load auth from localStorage:', e);
      localStorage.removeItem(this.LOCALSTORAGE_KEY);
    }
  }

  private loadFromSessionStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);

      if (data?.user) {
        this.user = data.user;
        if (typeof data.expiresAt === 'number') {
          this.tokenExpiresAt = data.expiresAt;
        }
        if (typeof data.rememberMe === 'boolean') {
          this.rememberMe = data.rememberMe;
        }
        if (typeof data.accessToken === 'string') {
          this.accessToken = data.accessToken;
        }
      }
    } catch (e) {
      console.warn('Failed to load auth from sessionStorage:', e);
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  private persistSessionState(user: UserData, expiresAt: number, rememberMe: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
        user,
        expiresAt,
        rememberMe,
        accessToken: this.accessToken,
      }));
    } catch (e) {
      console.warn('Failed to persist auth to sessionStorage:', e);
    }
  }

  private clearSessionState(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear auth from sessionStorage:', e);
    }
  }

  /**
   * Prüft ob User eingeloggt ist
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.user;
  }
}

// Singleton Export
export const AuthService = new AuthServiceClass();
