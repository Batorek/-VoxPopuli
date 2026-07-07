"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchCurrentUser, login as apiLogin } from "./api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("vox_access_token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem("vox_access_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await apiLogin(username, password);
    window.localStorage.setItem("vox_access_token", tokens.access);
    if (tokens.refresh) {
      window.localStorage.setItem("vox_refresh_token", tokens.refresh);
    }
    const me = await fetchCurrentUser();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("vox_access_token");
    window.localStorage.removeItem("vox_refresh_token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
