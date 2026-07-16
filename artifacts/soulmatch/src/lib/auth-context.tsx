import { API_URL } from '../config/api';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { googleLogout } from "@react-oauth/google";

const ACCESS_TOKEN_KEY = "soulmatch_access_token";
const REFRESH_TOKEN_KEY = "soulmatch_refresh_token";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  role: "user" | "premium" | "admin" | "superadmin";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  isPremium: boolean;
  journeyProgress: number;
  profileCompleteness: number;
  photos: Array<{ id: number; url: string; isPrimary: boolean; publicId?: string | null }>;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      setAccessToken(token);
      fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data) setUser(data); })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string, refresh: string, userData: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
    googleLogout();
  }, [queryClient]);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, accessToken, isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      login, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
