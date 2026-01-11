"use client";

import { useEffect, useCallback } from "react";
import { useAiTaskWebSocket } from "@/hooks/websocket/use-ai-task-websocket";
import {
  AiTaskProgressMessage,
  AiTaskNotification,
} from "@/types/user/ai-task";
import { toast } from "sonner";

interface AiTaskWebSocketProps {
  notebookId: string;
  accessToken: string | null;
  role_name?: string | null;
  onTaskProgressUpdate?: (
    aiSetId: string,
    progress: number,
    message: string
  ) => void;
  onTaskDone?: (aiSetId: string) => void;
  onTaskFailed?: (aiSetId: string, message: string) => void;
  onNotification?: (notification: AiTaskNotification) => void;
  onRefetch?: () => void;
}

/**
 * Component để xử lý WebSocket cho AI Task Progress
 *
 * Tự động subscribe vào:
 * - Notebook channel: `/topic/notebook/{notebookId}/ai-tasks` để nhận notifications
 *
 * Cung cấp methods để subscribe/unsubscribe task progress channels
 */
export default function AiTaskWebSocket({
  notebookId,
  accessToken,
  role_name,
  onTaskProgressUpdate,
  onTaskDone,
  onTaskFailed,
  onNotification,
  onRefetch,
}: AiTaskWebSocketProps) {
  const handleTaskProgress = useCallback(
    (message: AiTaskProgressMessage) => {
      switch (message.type) {
        case "progress":
          onTaskProgressUpdate?.(
            message.aiSetId,
            message.progress,
            message.message
          );
          break;
        case "done":
          onTaskProgressUpdate?.(message.aiSetId, 100, "Hoàn thành!");
          onTaskDone?.(message.aiSetId);
          onRefetch?.();
          toast.success("Tạo nội dung thành công!");
          break;
        case "failed":
          onTaskFailed?.(message.aiSetId, message.message);
          toast.error(message.message || "Tạo nội dung thất bại");
          break;
      }
    },
    [onTaskProgressUpdate, onTaskDone, onTaskFailed, onRefetch]
  );

  const handleTaskNotification = useCallback(
    (notification: AiTaskNotification) => {
      onNotification?.(notification);

      switch (notification.type) {
        case "done":
          onRefetch?.();
          const setTypeLabel = getSetTypeLabel(notification.setType);
          toast.info(
            `${notification.createdBy.fullName} vừa tạo xong ${setTypeLabel}`
          );
          break;
        case "deleted":
          onRefetch?.();
          break;
        case "created":
          // Optionally show notification when task is created
          break;
      }
    },
    [onNotification, onRefetch]
  );

  const { subscribeToTask, unsubscribeFromTask } = useAiTaskWebSocket({
    notebookId,
    accessToken,
    role_name,
    onTaskProgress: handleTaskProgress,
    onTaskNotification: handleTaskNotification,
    onError: (error) => {
      console.error("AI Task WebSocket error:", error);
    },
  });

  // Expose subscribe/unsubscribe methods via window for external use
  useEffect(() => {
    (window as any).__aiTaskWebSocket = {
      subscribe: subscribeToTask,
      unsubscribe: unsubscribeFromTask,
    };

    return () => {
      delete (window as any).__aiTaskWebSocket;
    };
  }, [subscribeToTask, unsubscribeFromTask]);

  return null;
}

/**
 * Helper function to get Vietnamese label for set type
 */
function getSetTypeLabel(setType: string): string {
  const labels: Record<string, string> = {
    quiz: "Quiz",
    flashcard: "Flashcards",
    tts: "Audio Podcast",
    video: "Video Summary",
    mindmap: "Sơ đồ tư duy",
    discuss: "Câu hỏi gợi mở",
    summary: "Tóm tắt",
    "study-guide": "Study Guide",
    faq: "FAQ",
    "key-concepts": "Key Concepts",
    timeline: "Timeline",
    translate: "Dịch",
    eli5: "Giải thích đơn giản",
    socratic: "Câu hỏi Socratic",
    critic: "Phê bình",
    "deep-dive": "Phân tích sâu",
  };

  return labels[setType] || setType;
}
