"use client";

import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function LoginForm() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialResponse = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError("Không nhận được token từ Google. Vui lòng thử lại.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const success = await loginWithGoogle(credentialResponse.credential);

    if (success) {
      router.push("/");
    } else {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#faf9f5",
        color: "#141413",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="w-full max-w-sm p-8 flex flex-col items-center text-center">
        {/* Brand Logo */}
        <div className="w-10 h-10 mb-10 text-[#141413] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
          </svg>
        </div>

        <h1
          className="mb-3"
          style={{
            fontFamily: 'Copernicus, "Tiempos Headline", "EB Garamond", serif',
            fontSize: "36px",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}
        >
          Chào mừng đến VibeTDU
        </h1>

        <p className="mb-8" style={{ color: "#6c6a64", fontSize: "16px", lineHeight: 1.55 }}>
          Đăng nhập để lưu thí nghiệm và dùng AI không giới hạn.
        </p>

        {error && (
          <div className="mb-4 w-full rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-left">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: "#6c6a64" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang đăng nhập...
          </div>
        ) : (
          /* GoogleLogin renders the official Google button — handles popup + id_token */
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={() => {
              setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
            }}
            text="continue_with"
            shape="rectangular"
            size="large"
            width="320"
          />
        )}

        {/* Divider */}
        <div className="my-6 flex w-full items-center gap-3">
          <div className="flex-1 h-px bg-[#e6dfd8]" />
          <span style={{ color: "#8e8b82", fontSize: "12px" }}>hoặc</span>
          <div className="flex-1 h-px bg-[#e6dfd8]" />
        </div>

        {/* Guest mode */}
        <button
          className="w-full text-sm transition-colors duration-200 hover:text-[#141413]"
          style={{ color: "#6c6a64", fontWeight: 500 }}
          onClick={() => router.push("/")}
        >
          Tiếp tục không cần đăng nhập →
        </button>

        <p
          className="mt-8 px-4"
          style={{ color: "#8e8b82", fontSize: "13px", lineHeight: 1.4 }}
        >
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <a href="#" className="underline hover:text-[#141413]">Điều khoản dịch vụ</a>{" "}
          và{" "}
          <a href="#" className="underline hover:text-[#141413]">Chính sách bảo mật</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
