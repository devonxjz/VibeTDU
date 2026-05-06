"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ChemLabShell } from "@/components/chemlab/ChemLabShell";

export default function ChemLabPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth state is hydrated (avoid flash)
    if (!isLoading && !isLoggedIn) {
      // router.replace("/login"); // Disabled for testing phase
    }
  }, [isLoggedIn, isLoading, router]);

  // While hydrating, render nothing to avoid flash
  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "#faf9f5" }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p style={{ color: "#8e8b82", fontSize: "14px" }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect happening, show nothing
  // if (!isLoggedIn) return null; // Disabled for testing phase

  return <ChemLabShell />;
}
