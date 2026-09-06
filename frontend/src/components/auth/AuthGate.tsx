"use client";

import { useEffect, type ReactNode } from "react";
import { AuthPanel } from "./AuthPanel";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGate({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hasHydrated) {
    return (
      <main className="min-h-[100dvh] bg-[#f8f1e4]" aria-label="Đang tải đăng nhập">
        <div className="mx-auto flex min-h-[100dvh] max-w-7xl items-center justify-center px-6">
          <div className="h-12 w-12 rounded-full border border-[#d7c4a4] border-t-[#214f49]" />
        </div>
      </main>
    );
  }

  if (!session) {
    return <AuthPanel />;
  }

  return <>{children}</>;
}
