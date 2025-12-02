"use client";

import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookFileResponse } from "@/types/admin/notebook-file";

export async function approveFile(
  file: NotebookFileResponse
): Promise<NotebookFileResponse> {
  try {
    const response = await api.put<NotebookFileResponse>(
      `/admin/notebooks/${file.notebook.id}/files/${file.id}/approve`
    );
    toast.success("Đã duyệt file thành công!");
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Không thể duyệt file. Vui lòng thử lại sau.";
    toast.error(message);
    throw error;
  }
}

export async function rejectFile(
  file: NotebookFileResponse
): Promise<NotebookFileResponse> {
  try {
    const response = await api.put<NotebookFileResponse>(
      `/admin/notebooks/${file.notebook.id}/files/${file.id}/reject`
    );
    toast.success("Đã từ chối file thành công!");
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Không thể từ chối file. Vui lòng thử lại sau.";
    toast.error(message);
    throw error;
  }
}
