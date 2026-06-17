"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#f8f1e4] text-[#14201d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(223,170,86,0.22),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(49,103,94,0.18),transparent_28%),linear-gradient(135deg,#fbf7ef_0%,#efe3cf_100%)]" />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8 lg:px-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="relative hidden min-h-[520px] overflow-hidden rounded-[2rem] border border-[#dcc9aa]/70 bg-[#efe2cc] shadow-[0_28px_90px_rgba(80,56,26,0.14)] md:block"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.12)),radial-gradient(circle_at_40%_10%,rgba(255,255,255,0.92),transparent_32%)]" />
          <div className="absolute left-8 top-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#173f3a] text-lg font-semibold text-[#f8f1e4] shadow-[0_14px_30px_rgba(23,63,58,0.22)]">
              V
            </div>
            <div>
              <p className="text-xl font-semibold tracking-[0] text-[#14201d]">VibeTDU</p>
              <p className="text-sm text-[#6f6252]">ChemLab Studio</p>
            </div>
          </div>

          <div className="absolute inset-x-10 bottom-16 h-28 rounded-[2rem] bg-[#8b6a44] shadow-[inset_0_3px_0_rgba(255,255,255,0.18),0_24px_70px_rgba(71,45,20,0.24)]" />
          <div className="absolute bottom-36 left-[15%] h-52 w-36 rounded-b-[4rem] rounded-t-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(131,193,184,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_22px_50px_rgba(31,73,69,0.16)]" />
          <div className="absolute bottom-36 left-[22%] h-20 w-24 rounded-full bg-[#78b8ad]/55 blur-[1px]" />
          <div className="absolute bottom-32 left-[43%] h-64 w-32 rounded-b-[4.5rem] rounded-t-[1.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(232,174,85,0.28))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_60px_rgba(86,61,26,0.18)]" />
          <div className="absolute bottom-32 left-[48%] h-24 w-20 rounded-full bg-[#e7ad57]/55 blur-[1px]" />
          <div className="absolute bottom-40 right-[16%] h-44 w-28 rounded-b-[4rem] rounded-t-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(39,91,84,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_22px_50px_rgba(31,73,69,0.16)]" />

          <div className="absolute bottom-8 left-8 max-w-md">
            <p className="text-[clamp(2.2rem,4vw,4.4rem)] font-semibold leading-[0.95] tracking-[0] text-[#14201d]">
              Vào lab bằng danh tính thật.
            </p>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#675b4d]">
              Sổ tay, quota AI và lịch sử thí nghiệm đi theo tài khoản của bạn.
            </p>
          </div>
        </motion.section>

        <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center md:min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1], delay: 0.08 }}
            className="w-full max-w-[460px] rounded-[2rem] border border-[#cbb58d]/70 bg-[#f3e6cf]/80 p-2 shadow-[0_30px_90px_rgba(72,50,22,0.14)]"
          >
            <div className="rounded-[calc(2rem-0.5rem)] border border-[#eadbc2] bg-[#fffaf2] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:p-8">
              <div>
                <p className="text-sm font-medium text-[#806f5b]">VibeTDU ChemLab</p>
                <h1 className="mt-3 text-[clamp(2.25rem,6vw,4.4rem)] font-semibold leading-[0.95] tracking-[0] text-[#14201d]">
                  Đăng nhập
                </h1>
                <p className="mt-4 text-base leading-7 text-[#6d6255]">
                  Tên trong tài khoản sẽ hiển thị trong phòng thí nghiệm.
                </p>
              </div>

              <div className="mt-8">
                {googleClientId ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <div className="overflow-hidden rounded-full border border-[#e1d1b7] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(40,32,22,0.06)]">
                      <GoogleLogin
                        onSuccess={(response) => void submitGoogle(response.credential)}
                        onError={() => setError("Không thể đăng nhập bằng Google")}
                        text="continue_with"
                        shape="pill"
                        width="360"
                      />
                    </div>
                  </GoogleOAuthProvider>
                ) : (
                  <button
                    type="button"
                    aria-label="Tiếp tục với Google"
                    onClick={() => setError("Google login chưa được cấu hình")}
                    className="group flex h-12 w-full items-center justify-between rounded-full border border-[#e1d1b7] bg-white px-5 text-sm font-semibold text-[#14201d] shadow-[0_10px_28px_rgba(40,32,22,0.06)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <span>Tiếp tục với Google</span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2eadc] text-sm transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                      G
                    </span>
                  </button>
                )}
              </div>

              <div className="my-7 flex items-center gap-4 text-xs font-medium uppercase text-[#93836d]">
                <span className="h-px flex-1 bg-[#eadbc2]" />
                <span>hoặc</span>
                <span className="h-px flex-1 bg-[#eadbc2]" />
              </div>

              <div className="grid grid-cols-2 rounded-full bg-[#f2eadc] p-1">
                <button
                  type="button"
                  aria-label="Chọn chế độ đăng nhập"
                  onClick={() => setMode("login")}
                  className={`h-10 rounded-full text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    mode === "login" ? "bg-[#173f3a] text-[#fffaf2]" : "text-[#766854]"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  aria-label="Chọn chế độ tạo tài khoản"
                  onClick={() => setMode("register")}
                  className={`h-10 rounded-full text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    mode === "register" ? "bg-[#173f3a] text-[#fffaf2]" : "text-[#766854]"
                  }`}
                >
                  Tạo tài khoản
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                {mode === "register" && (
                  <label className="block text-sm font-semibold text-[#514739]">
                    Tên của bạn
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required={mode === "register"}
                      className="mt-2 h-12 w-full rounded-2xl border border-[#e1d1b7] bg-[#fffdf8] px-4 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#a99a82] focus:border-[#2c665d] focus:shadow-[0_0_0_4px_rgba(44,102,93,0.12)]"
                      placeholder="Ví dụ: Tran Le Thai"
                    />
                  </label>
                )}

                <label className="block text-sm font-semibold text-[#514739]">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-[#e1d1b7] bg-[#fffdf8] px-4 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#a99a82] focus:border-[#2c665d] focus:shadow-[0_0_0_4px_rgba(44,102,93,0.12)]"
                    placeholder="student@example.com"
                  />
                </label>

                <label className="block text-sm font-semibold text-[#514739]">
                  Mật khẩu
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-[#e1d1b7] bg-[#fffdf8] px-4 text-base font-medium text-[#14201d] outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#a99a82] focus:border-[#2c665d] focus:shadow-[0_0_0_4px_rgba(44,102,93,0.12)]"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-[#edc7b2] bg-[#fff2ea] px-4 py-3 text-sm font-medium text-[#9a4825]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  aria-label={mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  disabled={isSubmitting}
                  className="group flex h-12 w-full items-center justify-between rounded-full bg-[#173f3a] px-5 text-sm font-semibold text-[#fffaf2] shadow-[0_16px_36px_rgba(23,63,58,0.22)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#22554e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</span>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#f2bd69] text-[#173f3a] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
