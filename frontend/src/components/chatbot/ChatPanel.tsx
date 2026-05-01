"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, Send, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useLabStore } from "@/stores/lab-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatMessageBubble } from "@/components/chatbot/ChatMessageBubble";
import { cn } from "@/utils/cn";

const DISCLAIMER =
  "Powered by Gemini 2.0 Flash — câu trả lời có thể không chính xác, hãy đối chiếu sách giáo khoa.";

export function ChatPanel() {
  const isOpen = useChatbotStore((s) => s.isOpen);
  const closePanel = useChatbotStore((s) => s.closePanel);
  const messages = useChatbotStore((s) => s.messages);
  const isLoading = useChatbotStore((s) => s.isLoading);
  const error = useChatbotStore((s) => s.error);
  const cooldownUntil = useChatbotStore((s) => s.cooldownUntil);
  const clearMessages = useChatbotStore((s) => s.clearMessages);
  const retryLast = useChatbotStore((s) => s.retryLast);
  const sendMessage = useChatbotStore((s) => s.sendMessage);

  const lastReaction = useLabStore((s) => s.lastReaction);

  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  const cooldownActive = nowMs < cooldownUntil;



  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages.length, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closePanel]);

  const quickPrompts = useMemo(() => {
    const eq = lastReaction?.equation;
    const product = lastReaction?.productFormula;
    const out: string[] = [];
    if (eq) out.push(`Giải thích phương trình: ${eq}`);
    out.push("Có nguy hiểm không? Lưu ý an toàn?");
    if (product) out.push(`Sản phẩm ${product} dùng để làm gì?`);
    out.push("Tóm tắt phản ứng và hiện tượng quan sát được.");
    return out;
  }, [lastReaction?.equation, lastReaction?.productFormula]);

  const disabled = isLoading || cooldownActive;

  async function onSubmit() {
    if (disabled) return;
    const value = text.trim();
    if (!value) return;
    setText("");
    await sendMessage(value);
  }

  return (
    <TooltipProvider delayDuration={250}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="fixed right-4 top-16 z-[60]"
            role="dialog"
            aria-label="Trợ lý hoá học"
          >
            <div className="w-[24rem] max-w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-mint/20 text-navy">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-navy">
                        Trợ lý hoá học
                      </div>
                      <div className="truncate text-[11px] text-navy-soft">
                        {DISCLAIMER}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-xl text-navy-soft transition hover:bg-white/10 hover:text-navy"
                        onClick={closePanel}
                        aria-label="Đóng"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Đóng (Esc)</TooltipContent>
                  </Tooltip>

                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded-xl text-navy-soft transition hover:bg-white/10 hover:text-navy"
                            aria-label="Xoá hội thoại"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Xoá hội thoại</TooltipContent>
                    </Tooltip>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xoá hội thoại?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Thao tác này sẽ xoá toàn bộ tin nhắn đã lưu. Vị trí nút chat
                          sẽ được giữ nguyên.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Huỷ</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => clearMessages()}
                        >
                          Xoá
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex h-[28rem] flex-col">
                <ScrollArea className="flex-1 px-4 py-3">
                  {messages.length === 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-navy">
                        Bạn muốn hỏi gì?
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setText(p)}
                            className="rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 text-[12px] text-navy transition hover:bg-mint/15"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((m, idx) => (
                        <ChatMessageBubble key={idx} message={m} />
                      ))}
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-[12px] text-navy-soft">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Đang trả lời…
                        </div>
                      ) : null}
                      {error ? (
                        <div className="mt-2 flex items-center gap-2 text-[12px] text-red-700">
                          <span className="truncate">{error}</span>
                          <button
                            type="button"
                            onClick={() => retryLast()}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[12px] text-red-700 hover:bg-red-100"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Thử lại
                          </button>
                        </div>
                      ) : null}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t border-white/10 p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void onSubmit();
                        }
                      }}
                      placeholder="Nhập câu hỏi…"
                      className={cn(
                        "min-h-[44px] max-h-28 flex-1 resize-none rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[13px] text-navy outline-none placeholder:text-navy-soft/80 focus:border-mint/35 focus:ring-2 focus:ring-mint/15",
                        disabled && "opacity-70",
                      )}
                      disabled={disabled}
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => void onSubmit()}
                      disabled={disabled || !text.trim()}
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-2xl border border-mint/25 bg-mint/20 text-navy transition hover:bg-mint/25 disabled:opacity-60",
                      )}
                      aria-label="Gửi"
                    >
                      {cooldownActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TooltipProvider>
  );
}

