// src/main/react/core/auth/AuthContext.tsx
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from './AuthService';
import type { UserData } from './AuthService';

type AuthState = {
  user: UserData | null;
  isLoading: boolean;
};

type AuthContextValue = {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  roles: string[];
  login: (user: UserData, rememberMe?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],
  roles: [],
  login: () => { },
  logout: () => { },
  refreshUser: async () => { },
});

/**
 * AuthProvider - React Context für Authentication State
 * 
 * Responsibilities:
 * - Verwaltet User-State in React (für Re-Rendering)
 * - Delegiert Token-Management an AuthService (Singleton)
 * - Bietet login/logout Methods für Components
 * - Lädt User-Daten beim App-Start (checkAuth on mount)
 * 
 * Best Practices:
 * - Keine direkten localStorage-Zugriffe
 * - State synchronisiert mit AuthService
 * - isLoading für Loading-States während Token-Validation
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: AuthService.getUser(),
    isLoading: true,
  });

  /**
   * Check Auth on Mount - lädt User aus AuthService (falls vorhanden)
   */
  useEffect(() => {
    let alive = true;

    const checkAuth = async () => {
      const user = AuthService.getUser();

      if (user && AuthService.isAuthenticated()) {
        if (alive) setState({ user, isLoading: false });
        return;
      }

      if (user) {
        try {
          await AuthService.refreshToken();
          const refreshedUser = AuthService.getUser();
          if (alive) {
            setState({ user: refreshedUser, isLoading: false });
          }
          return;
        } catch (err) {
          console.warn('Silent refresh failed:', err);
          AuthService.clearTokens();
        }
      }

      if (alive) setState({ user: null, isLoading: false });
    };

    checkAuth();

    return () => {
      alive = false;
    };
  }, []);

  /**
   * Login - setzt User und Token im AuthService + State
   * 
   * WICHTIG: Token-Management passiert in AuthService.setTokens()
   * Hier nur React-State-Update für Re-Rendering
   * 
   * @param user - UserData vom Backend
   * @param _rememberMe - (unused here, managed in AuthService.setTokens())
   */
  const login = useCallback((user: UserData, _rememberMe: boolean = false) => {
    // Update React State für Re-Rendering
    setState({ user, isLoading: false });
    
    // Note: AuthService.setTokens() muss VORHER in LoginPage.tsx aufgerufen werden!
    // Hier nur State-Sync
  }, []);

  /**
   * Logout - löscht Token + User im AuthService + State
   */
  const logout = useCallback(() => {
    AuthService.clearTokens();
    setState({ user: null, isLoading: false });
  }, []);

  /**
   * Refresh User - lädt User-Daten neu vom Backend (z.B. nach Permission-Änderung)
   */
  const refreshUser = useCallback(async () => {
    // TODO: Implementiere Backend-Call zu GET /api/users/me
    // Für jetzt: Hole User aus AuthService
    const user = AuthService.getUser();
    setState(prev => ({ ...prev, user }));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    isAuthenticated: !!state.user && AuthService.isAuthenticated(),
    isLoading: state.isLoading,
    permissions: state.user?.permissions || [],
    roles: state.user?.roles || [],
    login,
    logout,
    refreshUser,
  }), [state, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthCtx = () => useContext(AuthContext);
