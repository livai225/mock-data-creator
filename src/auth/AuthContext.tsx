import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loginApi, meApi, registerApi, type AuthUser } from "@/lib/api";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const TOKEN_KEY = "arch_excellence_token";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }, []);

  const hydrate = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await meApi(token);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    if (!res.success || !res.data?.token) throw new Error(res.message ?? "Connexion impossible");

    setToken(res.data.token);
    setUser(res.data.user);
    try {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    } catch {
      // ignore
    }
    return res.data.user;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await registerApi(email, password);
    if (!res.success || !res.data?.token) throw new Error(res.message ?? "Inscription impossible");

    setToken(res.data.token);
    setUser(res.data.user);
    try {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    } catch {
      // ignore
    }
    return res.data.user;
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, user, isAuthenticated, loading, login, register, logout }),
    [isAuthenticated, loading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
