import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "@/components/auth/AuthGate";
import { loginWithPassword } from "@/api/client/auth";
import { clearAuthSession, saveAuthSession, useAuthStore, type AuthUser } from "@/stores/auth-store";

vi.mock("@/api/client/auth", () => ({
  loginWithPassword: vi.fn(),
  loginWithGoogle: vi.fn(),
  registerWithPassword: vi.fn(),
}));

const user: AuthUser = {
  id: "user-1",
  email: "student@example.com",
  name: "Tran Le Thai",
  pictureUrl: null,
  provider: "local",
  aiQuotaRemaining: 20,
};

describe("AuthGate", () => {
  afterEach(() => {
    cleanup();
    clearAuthSession();
    useAuthStore.setState({ session: null, hasHydrated: false });
    vi.clearAllMocks();
  });

  it("renders auth UI when there is no session", async () => {
    render(
      <AuthGate>
        <div>Lab Ready</div>
      </AuthGate>,
    );

    expect(await screen.findByRole("button", { name: /tiếp tục với google/i })).toBeInTheDocument();
    expect(screen.queryByText("Lab Ready")).not.toBeInTheDocument();
  });

  it("renders children when a session exists", async () => {
    saveAuthSession({ token: "token-123", user });

    render(
      <AuthGate>
        <div>Lab Ready</div>
      </AuthGate>,
    );

    expect(await screen.findByText("Lab Ready")).toBeInTheDocument();
  });

  it("uses the authenticated user name as the display name after login", async () => {
    vi.mocked(loginWithPassword).mockResolvedValue({
      token: "token-123",
      user,
    });

    render(
      <AuthGate>
        <div>Lab Ready</div>
      </AuthGate>,
    );

    fireEvent.change(await screen.findByLabelText(/email/i), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/mật khẩu/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^đăng nhập$/i }));

    await waitFor(() => {
      expect(localStorage.getItem("vibe_user_name")).toBe("Tran Le Thai");
    });
  });

  it("does not render the old nickname prompt", async () => {
    render(
      <AuthGate>
        <div>Lab Ready</div>
      </AuthGate>,
    );

    await screen.findByRole("button", { name: /tiếp tục với google/i });

    expect(screen.queryByPlaceholderText(/DongLV_K12/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/biệt danh/i)).not.toBeInTheDocument();
  });
});
