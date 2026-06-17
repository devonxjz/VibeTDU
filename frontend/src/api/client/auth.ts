import { get, post } from "./http";
import { saveAuthSession, type AuthSession, type AuthUser } from "@/stores/auth-store";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type GoogleLoginRequest = {
  credential: string;
};

export type AuthResponse = AuthSession;

export async function loginWithPassword(request: LoginRequest): Promise<AuthResponse> {
  const session = await post<AuthResponse>("/api/auth/login", request);
  saveAuthSession(session);
  return session;
}

export async function registerWithPassword(request: RegisterRequest): Promise<AuthResponse> {
  const session = await post<AuthResponse>("/api/auth/register", request);
  saveAuthSession(session);
  return session;
}

export async function loginWithGoogle(request: GoogleLoginRequest): Promise<AuthResponse> {
  const session = await post<AuthResponse>("/api/auth/google", request);
  saveAuthSession(session);
  return session;
}

export function getCurrentUser(): Promise<AuthUser> {
  return get<AuthUser>("/api/auth/me");
}
