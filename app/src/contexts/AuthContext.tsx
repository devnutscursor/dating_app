import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { apiGet, apiPost, getStoredToken, setStoredToken, TOKEN_KEY } from '@/lib/api';
import { clearAllAppCaches } from '@/lib/appCache';
import { connectChatSocket, disconnectChatSocket } from '@/lib/chatSocket';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    gender: 'male' | 'female';
    birthDate?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  /** Optimistic coin balance update (e.g. after per-minute video billing). */
  setCoins: (coins: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  const setCoins = useCallback((coins: number) => {
    setUser((prev) => (prev ? { ...prev, coins } : prev));
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    setToken(t);
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!token) {
      disconnectChatSocket();
      return;
    }
    connectChatSocket(token);
    return () => {
      disconnectChatSocket();
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ accessToken: string; user: User }>('/auth/login', { email, password });
    setStoredToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      gender: 'male' | 'female';
      birthDate?: string;
    }) => {
      const data = await apiPost<{ accessToken: string; user: User }>('/auth/register', payload);
      setStoredToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    clearAllAppCaches();
    disconnectChatSocket();
    setStoredToken(null);
    setToken(null);
    setUser(null);
    try {
      void apiPost('/auth/logout');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setCoins,
    }),
    [user, token, loading, login, register, logout, refreshUser, setCoins]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { TOKEN_KEY };
