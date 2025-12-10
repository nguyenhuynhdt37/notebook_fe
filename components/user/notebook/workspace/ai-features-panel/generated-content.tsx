"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AiTaskResponse } from "@/types/user/ai-task";
import TaskList from "./task-list";

interface GeneratedContentProps {
  notebookId: string;
}

export default function GeneratedContent({
  notebookId,
}: GeneratedContentProps) {
  const [tasks, setTasks] = useState<AiTaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!notebookId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AiTaskResponse[]>(
        `/user/notebooks/${notebookId}/ai/tasks`
      );
      setTasks(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Vui lòng đăng nhập");
      } else {
        setError("Không thể tải danh sách");
      }
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  const handleView = (taskId: string) => {
    // TODO: Navigate to task result
    console.log("View task:", taskId);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/user/notebooks/${notebookId}/ai/tasks/${taskId}`);
      toast.success("Đã xóa thành công");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể xóa");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Polling for pending tasks
  useEffect(() => {
    const hasPendingTasks = tasks.some(
      (t) => t.status === "queued" || t.status === "processing"
    );

    if (!hasPendingTasks) return;

    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

  return (
    <div className="p-4">
      <h3 className="text-xs font-medium text-muted-foreground mb-3">
        Nội dung đã tạo
      </h3>
      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onRetry={fetchTasks}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}
