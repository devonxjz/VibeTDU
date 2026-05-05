"use client";

import { useState, useEffect } from "react";
import { post } from "@/api/client/http";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  pictureUrl?: string;
  aiQuotaRemaining: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

const TOKEN_KEY = "vtu_jwt";
const USER_KEY = "vtu_user";

/**
 * Auth hook backed by the real /api/auth/google endpoint.
 * Reads the JWT from localStorage on mount (persisted session).
 * `loginWithGoogle(idToken)` exchanges a Google ID Token for an internal JWT.
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    token: null,
    user: null,
    isLoading: true,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setAuthState({
          isLoggedIn: true,
          token: savedToken,
          user: JSON.parse(savedUser),
          isLoading: false,
        });
        return;
      }
    } catch (_) {}
    setAuthState((s) => ({ ...s, isLoading: false }));
  }, []);

  /**
   * Exchange a Google ID Token for an internal JWT from the Spring backend.
   * Called after the Google popup returns successfully.
   */
  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    try {
      const res = await post<{
        jwt: string;
        user: {
          id: string;
          email: string;
          name: string;
          pictureUrl: string;
          aiQuotaRemaining: number;
        };
      }>("/api/auth/google", { idToken });

      const user: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        pictureUrl: res.user.pictureUrl,
        avatarUrl: res.user.pictureUrl,
        aiQuotaRemaining: res.user.aiQuotaRemaining,
      };

      localStorage.setItem(TOKEN_KEY, res.jwt);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setAuthState({ isLoggedIn: true, token: res.jwt, user, isLoading: false });
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  /** Mock login shortcut — dev only */
  const login = () => {
    const mockUser: User = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      aiQuotaRemaining: 20,
    };
    localStorage.setItem(TOKEN_KEY, "mock-jwt-dev");
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    setAuthState({ isLoggedIn: true, token: "mock-jwt-dev", user: mockUser, isLoading: false });
    window.location.href = "/";
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ isLoggedIn: false, token: null, user: null, isLoading: false });
    window.location.href = "/login";
  };

  return {
    ...authState,
    login,
    logout,
    loginWithGoogle,
  };
}
