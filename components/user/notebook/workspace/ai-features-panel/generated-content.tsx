"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AiSetResponse } from "@/types/user/ai-task";
import SetList from "./task-list";
import QuizPlayerModal from "./quiz-player-modal";
import FlashcardViewerModal from "./flashcard-viewer-modal";

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
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);

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

    // Chỉ cho xem khi đã done
    if (set.status !== "done") {
      toast.info("Nội dung đang được
