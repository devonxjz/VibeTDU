import { nanoid } from "nanoid";
import { get, post } from "@/api/client/http";
import { getAuthToken } from "@/stores/auth-store";
import type { JournalSummary } from "@/types/journal";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

export async function saveJournal(
  title: string,
  experimentData: string
): Promise<ApiResult<{ id: string; title: string; createdAt: string }>> {
  if (getAuthToken()) {
    try {
      const data = await post<{ id: string; title: string; createdAt: string }>("/api/journal", {
        title,
        experimentData,
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi lưu dữ liệu",
      };
    }
  }

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
  if (getAuthToken()) {
    try {
      const data = await get<JournalSummary[]>("/api/journal");
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi tải dữ liệu",
      };
    }
  }

  try {
    const stored = localStorage.getItem("vibetdu_journals");
    const journals = stored ? JSON.parse(stored) : [];
    return { success: true, data: journals };
  } catch {
    return { success: false, error: "Lỗi tải dữ liệu cục bộ" };
  }
}
