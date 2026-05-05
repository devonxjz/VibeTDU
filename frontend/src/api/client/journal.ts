import { get, post, HttpError } from "./http";
import type { JournalSummary, JournalEntry } from "@/types/journal";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

export async function saveJournal(
  title: string,
  experimentData: string
): Promise<ApiResult<{ id: string; title: string; createdAt: string }>> {
  try {
    const data = await post<{ id: string; title: string; createdAt: string }>("/api/journal", {
      title,
      experimentData,
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof HttpError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: "Lỗi kết nối tới máy chủ" };
  }
}

export async function getJournals(): Promise<ApiResult<JournalSummary[]>> {
  try {
    const data = await get<JournalSummary[]>("/api/journal");
    return { success: true, data };
  } catch (error) {
    if (error instanceof HttpError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: "Lỗi kết nối tới máy chủ" };
  }
}
