"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLabStore } from "@/stores/lab-store";
import { saveJournal } from "@/api/client/journal";
import { ClayPanelShell, ClayActionButton } from "@/components/ui/clay-primitives";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

export function GuestMigrationDialog() {
  const { isLoggedIn, isLoading } = useAuth();
  const { clearGuestExperiment, setGuestExperimentDismissed } = useLabStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [experimentData, setExperimentData] = useState<string | null>(null);

  useEffect(() => {
    // Only check when auth is resolved and user is logged in
    if (!isLoading && isLoggedIn) {
      const data = localStorage.getItem("guestExperiment");
      const dismissed = localStorage.getItem("guestExperimentDismissed");
      
      if (data && !dismissed) {
        setExperimentData(data);
        setIsOpen(true);
      }
    }
  }, [isLoggedIn, isLoading]);

  const handleDismiss = () => {
    setGuestExperimentDismissed(true);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!experimentData) return;
    
    setIsSaving(true);
    try {
      const result = await saveJournal("Thí nghiệm trước đăng nhập", experimentData);
      
      if (result.success) {
        toast.success("Đã lưu thí nghiệm thành công!");
        clearGuestExperiment();
        setIsOpen(false);
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi lưu sổ tay.");
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra khi lưu sổ tay.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <ClayPanelShell tone="card" className="flex flex-col gap-6 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clay-brand-peach/20 text-clay-brand-peach">
                  <Save className="h-6 w-6" />
                </div>
                <div>
                  <h3 id="dialog-title" className="clay-title-md text-clay-ink">
                    Lưu thí nghiệm trước đó?
                  </h3>
                  <p className="clay-body-sm mt-2 text-clay-muted">
                    Bạn có một thí nghiệm chưa lưu trước khi đăng nhập. Bạn có muốn lưu thí nghiệm này vào Sổ tay Hóa học của mình không?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={handleDismiss}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-clay-muted hover:text-clay-ink disabled:opacity-50"
                >
                  Không
                </button>
                <ClayActionButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[100px]"
                >
                  {isSaving ? "Đang lưu..." : "Lưu vào Sổ tay"}
                </ClayActionButton>
              </div>
            </ClayPanelShell>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
