"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { ClayPanelShell, ClayActionButton } from "@/components/ui/clay-primitives";

const STORAGE_KEY = "vibe_user_name";

export function useUserName() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem(STORAGE_KEY));
  }, []);

  const save = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUserName(name);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserName(null);
  };

  return { userName, save, clear };
}

export function WelcomeModal() {
  const { userName, save } = useUserName();
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is done
  if (!mounted) return null;

  // Already has a name — don't show
  if (userName) return null;

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) save(trimmed);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-md"
        >
          <ClayPanelShell
            tone="canvas"
            className="flex flex-col items-center gap-6 p-8 shadow-2xl text-center"
          >
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-primary/10">
              <FlaskConical className="h-8 w-8 text-clay-primary" />
            </div>

            {/* Text */}
            <div>
              <h2 className="clay-display-sm text-clay-ink">
                Chào mừng đến VibeTDU!
              </h2>
              <p className="clay-body-sm text-clay-muted mt-2">
                Nhập tên của bạn để tạo Sổ tay Hóa học cá nhân
              </p>
            </div>

            {/* Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ví dụ: DongLV_K12"
              autoFocus
              className="w-full rounded-[var(--clay-rounded-md)] border border-clay-hairline bg-clay-surface-card px-4 py-3 text-center clay-body-md text-clay-ink placeholder:text-clay-muted focus:outline-none focus:ring-2 focus:ring-clay-primary/30"
            />

            {/* Button */}
            <ClayActionButton
              variant="primary"
              className="w-full"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              🔬 Vào Phòng Thí Nghiệm
            </ClayActionButton>
          </ClayPanelShell>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
