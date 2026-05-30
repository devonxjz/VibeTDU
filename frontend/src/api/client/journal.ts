import { nanoid } from "nanoid";
import type { JournalSummary } from "@/types/journal";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

export async function saveJournal(
  title: string,
  experimentData: string
): Promise<ApiResult<{ id: string; title: string; createdAt: string }>> {
  try {
    const newEntry = {
      id: nanoid(),
      title,
      experimentData,
      savedBy: localStorage.getItem("vibe_user_name") || "Ẩn danh",
      createdAt: new Date().toISOString()
    };
    const stored = localStorage.getItem("vibetdu_journals");
    const journals = stored ? JSON.parse(stored) : [];
    journals.unshift(newEntry);
    localStorage.setItem("vibetdu_journals", JSON.stringify(journals));
    return { success: true, data: newEntry };
  } catch {
    return { success: false, error: "Lỗi lưu dữ liệu cục bộ" };
  }
}

export async function getJournals(): Promise<ApiResult<JournalSummary[]>> {
  try {
    const stored = localStorage.getItem("vibetdu_journals");
    const journals = stored ? JSON.parse(stored) : [];
    return { success: true, data: journals };
  } catch {
    return { success: false, error: "Lỗi tải dữ liệu cục bộ" };
  }
}
