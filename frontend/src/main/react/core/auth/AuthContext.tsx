// src/main/react/core/auth/AuthContext.tsx
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type AuthState = {
  token: string | null;
  roles: string[];              // z.B. ['superadmin'] oder ['user']
};

type AuthContextValue = {
  isAuthenticated: boolean;
  roles: string[];
  token: string | null;
  login: (token: string, roles: string[]) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  roles: [],
  token: null,
  login: () => { },
  logout: () => { },
});
/**
 * Merkt sich, ob du eingeloggt bist (isAuthenticated) und welche Rollen du hast (roles).

Speichert den Token (hier vorerst token aus localStorage).

Gibt zwei Funktionen:

login(token, roles): schreibt Token/Rollen in localStorage und in den React-State.

logout(): löscht alles wieder.

Dadurch können alle Komponenten im App-Baum den Login-Zustand lesen (mit useAuthCtx()).
 * 
 *  
 */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
  }));

  const login = (token: string, roles: string[]) => {
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));
    setState({ token, roles });
  };

const logout = () => {
  // alles lokale wegräumen
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("roles");
  localStorage.removeItem("user");
  setState({ token: null, roles: [] });
};

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!state.token,
    roles: state.roles,
    token: state.token,
    login,
    logout,
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthCtx = () => useContext(AuthContext);
