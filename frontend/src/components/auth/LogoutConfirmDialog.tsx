"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { ClayPanelShell, ClayActionButton } from "@/components/ui/clay-primitives";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({ isOpen, onClose, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm focus:outline-none"
            role="dialog"
            aria-modal="true"
          >
            <ClayPanelShell 
              tone="card" 
              className="relative flex flex-col items-center text-center p-8 gap-6 shadow-xl border border-[#e6dfd8]"
              style={{ backgroundColor: "#faf9f5" }}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-[#8e8b82] hover:text-[#141413] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#cc785c]/10 text-[#cc785c]">
                <LogOut className="h-7 w-7" />
              </div>

              {/* Content */}
              <div>
                <h3 
                  className="mb-2 text-[#141413]"
                  style={{
                    fontFamily: 'Copernicus, "Tiempos Headline", "EB Garamond", serif',
                    fontSize: "24px",
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  Đăng xuất tài khoản?
                </h3>
                <p 
                  className="text-[#6c6a64]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: "14px",
                    lineHeight: 1.55,
                  }}
                >
                  Mọi thí nghiệm chưa lưu sẽ bị mất. Bạn chắc chắn muốn đăng xuất chứ?
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col gap-3">
                <ClayActionButton
                  variant="primary"
                  onClick={onConfirm}
                  className="w-full h-11 text-base"
                  style={{
                    backgroundColor: "#cc785c",
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                  }}
                >
                  Đăng xuất ngay
                </ClayActionButton>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-sm font-medium text-[#6c6a64] hover:text-[#141413] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Hủy bỏ
                </button>
              </div>
            </ClayPanelShell>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
