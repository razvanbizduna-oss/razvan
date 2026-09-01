import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Single shared account ────────────────────────────────────────────────────
const ACCOUNT_USERNAME = 'INTERACT CISMIGIU';
const ACCOUNT_PASSWORD = 'itc2026';
const SESSION_KEY = 'interact_session_v2';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s === 'true') setIsAuthenticated(true);
    } catch { /* ignore */ }
  }, []);

  const login = (username: string, password: string) => {
    const uOk = username.trim().toLowerCase() === ACCOUNT_USERNAME.toLowerCase();
    const pOk = password === ACCOUNT_PASSWORD;
    if (!uOk || !pOk) return { success: false, error: 'Username sau parolă incorecte.' };
    try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch { /* ignore */ }
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
