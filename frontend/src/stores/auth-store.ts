import { create } from "zustand";

export const AUTH_TOKEN_KEY = "vibetdu_auth_token";
export const AUTH_USER_KEY = "vibetdu_auth_user";
export const DISPLAY_NAME_KEY = "vibe_user_name";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  provider: string;
  aiQuotaRemaining: number;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type AuthState = {
  session: AuthSession | null;
  hasHydrated: boolean;
  hydrate: () => void;
  saveSession: (session: AuthSession) => void;
  clearSession: () => void;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  localStorage.setItem(DISPLAY_NAME_KEY, session.user.name);
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(DISPLAY_NAME_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hasHydrated: false,
  hydrate: () => set({ session: getStoredAuthSession(), hasHydrated: true }),
  saveSession: (session) => {
    saveAuthSession(session);
    set({ session, hasHydrated: true });
  },
  clearSession: () => {
    clearAuthSession();
    set({ session: null, hasHydrated: true });
  },
}));
