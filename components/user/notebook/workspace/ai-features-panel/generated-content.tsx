"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AiSetResponse } from "@/types/user/ai-task";
import SetList from "./task-list";
import QuizPlayerModal from "./quiz-player-modal";

interface GeneratedContentProps {
  notebookId: string;
}

export default function GeneratedContent({
  notebookId,
}: GeneratedContentProps) {
  const [sets, setSets] = useState<AiSetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const fetchSets = useCallback(async () => {
    if (!notebookId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AiSetResponse[]>(
        `/user/notebooks/${notebookId}/ai/sets`
      );
      setSets(response.data);
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

  const handleView = (setId: string) => {
    const set = sets.find((s) => s.id === setId);
    if (!set) return;

    // Chỉ mở modal quiz nếu type là quiz và status là done
    if (set.setType === "quiz" && set.status === "done") {
      setSelectedSetId(setId);
      setQuizModalOpen(true);
    } else {
      // TODO: Handle other types
      console.log("View set:", setId, set.setType);
    }
  };

  const handleDelete = async (setId: string) => {
    try {
      await api.delete(`/user/notebooks/${notebookId}/ai/sets/${setId}`);
      toast.success("Đã xóa thành công");
      fetchSets();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? "Bạn chỉ có thể xóa AI Set do chính mình tạo"
          : "Không thể xóa");
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  return (
    <div className="p-4">
      <h3 className="text-xs font-medium text-muted-foreground mb-3">
        Nội dung đã tạo
      </h3>
      <SetList
        sets={sets}
        loading={loading}
        error={error}
        onRetry={fetchSets}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Quiz Player Modal */}
      {selectedSetId && (
        <QuizPlayerModal
          open={quizModalOpen}
          onOpenChange={setQuizModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}
    </div>
  );
}
