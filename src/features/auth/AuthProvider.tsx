import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "./authApi";
import { AuthContext } from "./authContext";
import type { AuthResponse, UserProfile } from "../../types";

const TOKEN_KEY = "token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setIsLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const profile = await authApi.me();
      setUser(profile);
      return profile;
    } catch {
      clearStoredToken();
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback((response: AuthResponse) => {
    storeToken(response.token);
    setUser(response.user);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user && getStoredToken()),
      isLoading,
      user,
      login,
      logout,
      refreshProfile,
    }),
    [isLoading, login, logout, refreshProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
