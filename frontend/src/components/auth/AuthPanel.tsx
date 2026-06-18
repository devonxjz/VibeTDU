"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  loginWithGoogle,
  loginWithPassword,
  registerWithPassword,
} from "@/api/client/auth";
import { useAuthStore, type AuthSession } from "@/stores/auth-store";

type Mode = "login" | "register";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function AuthPanel() {
  const saveSession = useAuthStore((state) => state.saveSession);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState("270");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const updateGoogleWidth = () => {
      const isCompact =
        typeof window.matchMedia === "function"
          ? window.matchMedia("(max-width: 640px)").matches
          : window.innerWidth <= 640;
      setGoogleButtonWidth(isCompact ? "270" : "420");
    };

    updateGoogleWidth();
    window.addEventListener("resize", updateGoogleWidth);

    return () => window.removeEventListener("resize", updateGoogleWidth);
  }, []);

  const handleSession = (session: AuthSession) => {
    saveSession(session);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session =
        mode === "login"
          ? await loginWithPassword({ email, password })
          : await registerWithPassword({ name, email, password });
      handleSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitGoogle = async (credential?: string) => {
    if (!credential) {
      setError("Google credential không hợp lệ");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const session = await loginWithGoogle({ credential });
      handleSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập bằng Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#fbf5e8] text-[#14201d]">
      <div className="grid min-h-[100dvh] min-w-0 grid-cols-1 lg:grid-cols-[52%_48%]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          aria-label="Không gian phòng thí nghiệm VibeTDU"
          style={{ backgroundImage: "url('/auth-lab-reference.png')" }}
          className="relative hidden min-h-[100dvh] overflow-hidden bg-[#f0e1c9] bg-cover bg-center lg:block"
        />

        <section className="relative flex min-h-[100dvh] min-w-0 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_78%_84%,rgba(33,79,73,0.14),transparent_34%),linear-gradient(135deg,#fffaf0_0%,#f2e5d0_100%)]" />
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1], delay: 0.08 }}
            className="relative min-w-0 w-[calc(100vw-2rem)] max-w-[358px] rounded-[22px] border-[3px] border-[#0d5154] bg-[#fff5e7]/75 p-2 shadow-[0_28px_80px_rgba(65,45,23,0.15)] sm:w-full sm:max-w-[560px]"
          >
            <div className="min-w-0 rounded-[16px] border-2 border-[#df9e2f] bg-[#fffaf2]/95 px-5 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-12 sm:py-11">
              <div className="text-center">
                <p className="text-base font-medium text-[#2d2923]">Chào mừng trở lại</p>
                <h1 className="mt-2 text-[clamp(3rem,7vw,4.7rem)] font-semibold leading-none tracking-[0] text-[#0e5257]">
                  VibeTDU
                </h1>
                <p className="mt-3 text-base leading-7 text-[#5f5548]">
                  Tên tài khoản sẽ hiển thị trong phòng thí nghiệm.
                </p>
              </div>

              <div className="mt-8 sm:mt-10">
                {googleClientId ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <div className="flex h-14 w-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-[#cfc6b9] bg-white shadow-[0_12px_26px_rgba(42,34,24,0.08)]">
                      <GoogleLogin
                        key={googleButtonWidth}
                        onSuccess={(response) => void submitGoogle(response.credential)}
                        onError={() => setError("Không thể đăng nhập bằng Google")}
                        text="continue_with"
                        shape="rectangular"
                        width={googleButtonWidth}
                      />
                    </div>
                  </GoogleOAuthProvider>
                ) : (
                  <button
                    type="button"
                    aria-label="Tiếp tục với Google"
                    onClick={() => setError("Google login chưa được cấu hình")}
                    className="group flex h-14 w-full items-center justify-center gap-4 rounded-md border border-[#cfc6b9] bg-white px-5 text-base font-medium text-[#2f2a23] shadow-[0_12px_26px_rgba(42,34,24,0.08)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2eadc] text-sm font-semibold text-[#d64b35] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5">
                      G
                    </span>
                    <span>Tiếp tục với Google</span>
                  </button>
                )}
              </div>

              <div className="my-8 flex items-center gap-4 text-sm font-medium text-[#6f665a]">
                <span className="h-px flex-1 bg-[#cfc6b9]" />
                <span>hoặc</span>
                <span className="h-px flex-1 bg-[#cfc6b9]" />
              </div>

              <form className="space-y-5" onSubmit={submit}>
                {mode === "register" && (
                  <label className="block text-sm font-medium text-[#2f2a23]">
                    Tên của bạn
                    <span className="relative mt-2 block">
                      <User
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#665c50]"
                      />
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required={mode === "register"}
                        className="h-14 w-full rounded-md border border-[#cfc6b9] bg-[#fffdf8] px-12 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#9e9282] focus:border-[#0e5257] focus:shadow-[0_0_0_4px_rgba(14,82,87,0.12)]"
                        placeholder="Ví dụ: Tran Le Thai"
                      />
                    </span>
                  </label>
                )}

                <label className="block text-sm font-medium text-[#2f2a23]">
                  Email
                  <span className="relative mt-2 block">
                    <Mail
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#665c50]"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="h-14 w-full rounded-md border border-[#cfc6b9] bg-[#fffdf8] px-12 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#9e9282] focus:border-[#0e5257] focus:shadow-[0_0_0_4px_rgba(14,82,87,0.12)]"
                      placeholder="student@example.com"
                    />
                  </span>
                </label>

                <label className="block text-sm font-medium text-[#2f2a23]">
                  Mật khẩu
                  <span className="relative mt-2 block">
                    <LockKeyhole
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#665c50]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="h-14 w-full rounded-md border border-[#cfc6b9] bg-[#fffdf8] px-12 pr-14 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#9e9282] focus:border-[#0e5257] focus:shadow-[0_0_0_4px_rgba(14,82,87,0.12)]"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ẩn password" : "Hiện password"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#665c50] transition-colors duration-300 hover:bg-[#f2eadc] hover:text-[#0e5257]"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <Eye aria-hidden="true" className="h-5 w-5" />
                      )}
                    </button>
                  </span>
                </label>

                {error && (
                  <p className="rounded-md border border-[#edc7b2] bg-[#fff2ea] px-4 py-3 text-sm font-medium text-[#9a4825]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  aria-label={mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  disabled={isSubmitting}
                  className="group flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#0d5154] px-5 text-base font-semibold text-[#fffaf2] shadow-[0_16px_36px_rgba(13,81,84,0.22)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#174f4a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                  />
                </button>
              </form>

              <p className="mt-7 text-center text-base text-[#2f2a23]">
                {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode(mode === "login" ? "register" : "login");
                  }}
                  className="font-semibold text-[#c57518] transition-colors duration-300 hover:text-[#0e5257]"
                >
                  {mode === "login" ? "Tạo tài khoản" : "Đăng nhập"}
                </button>
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
