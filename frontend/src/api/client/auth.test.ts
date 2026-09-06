import { afterEach, describe, expect, it, vi } from "vitest";

import { loginWithPassword } from "@/api/client/auth";
import { post } from "@/api/client/http";
import {
  clearAuthSession,
  getAuthToken,
  saveAuthSession,
  type AuthUser,
} from "@/stores/auth-store";

const user: AuthUser = {
  id: "user-1",
  email: "student@example.com",
  name: "Nguyen Van A",
  pictureUrl: null,
  provider: "local",
  aiQuotaRemaining: 20,
};

function mockJsonResponse(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("auth client and session", () => {
  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  it("stores auth token, profile, and display name", () => {
    saveAuthSession({ token: "token-123", user });

    expect(localStorage.getItem("vibetdu_auth_token")).toBe("token-123");
    expect(JSON.parse(localStorage.getItem("vibetdu_auth_user") ?? "{}")).toMatchObject(user);
    expect(localStorage.getItem("vibe_user_name")).toBe("Nguyen Van A");
    expect(getAuthToken()).toBe("token-123");
  });

  it("attaches bearer token to API requests", async () => {
    saveAuthSession({ token: "token-123", user });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ ok: true }));

    await post<{ ok: boolean }>("/api/protected", { hello: "world" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/protected",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
  });

  it("posts email and password to the login endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => mockJsonResponse({ token: "token-123", user }));

    await loginWithPassword({
      email: "student@example.com",
      password: "secret123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "student@example.com",
          password: "secret123",
        }),
      }),
    );
  });
});
