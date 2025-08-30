// src/main/react/core/auth/AuthContext.tsx
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type AuthState = {
  token: string | null;
  roles: string[];
};

type AuthContextValue = {
  isAuthenticated: boolean;
  roles: string[];
  token: string | null;
  login: (token: string, roles: string[]) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: true,           // hier
  roles: ['superadmin'],            // hier
  token: 'dummy-token',             // hier
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: 'dummy-token',
    roles: ['superadmin'],
  }));

  const login = (token: string, roles: string[]) => {
    setState({ token, roles });
  };

  const logout = () => {
    setState({ token: 'dummy-token', roles: ['superadmin'] });
  };

//hier
  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: true,         
    roles: ['superadmin'],         
    token: 'dummy-token',
    login,
    logout,
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthCtx = () => useContext(AuthContext);

