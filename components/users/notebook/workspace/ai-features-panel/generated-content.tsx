"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AiSetResponse } from "@/types/user/ai-task";
import SetList from "./task-list";
import QuizPlayerModal from "./quiz-player-modal";
import FlashcardViewerModal from "./flashcard-viewer-modal";
import MindmapViewerModal from "./mindmap-viewer-modal";
import SuggestionViewerModal from "./suggestion-viewer-modal";
import VideoViewerModal from "./video-viewer-modal";
import SummaryViewerModal from "./summary-viewer-modal";

interface AudioInfo {
  id: string;
  url: string;
  title: string;
}

interface GeneratedContentProps {
  notebookId: string;
  onAudioPlay?: (audio: AudioInfo | null) => void;
}

export default function GeneratedContent({
  notebookId,
  onAudioPlay,
}: GeneratedContentProps) {
  const [sets, setSets] = useState<AiSetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [mindmapModalOpen, setMindmapModalOpen] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

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

    if (set.status !== "done") {
      toast.info("Nội dung đang được tạo, vui lòng chờ...");
      return;
    }

    // Reset modals
    setQuizModalOpen(false);
    setFlashcardModalOpen(false);
    setMindmapModalOpen(false);
    setSuggestionModalOpen(false);
    setVideoModalOpen(false);
    setSummaryModalOpen(false);

    setSelectedSetId(setId);

    // Normalize type string just in case
    const type = set.setType as string;

    switch (type) {
      case "quiz":
        setQuizModalOpen(true);
        break;
      case "flashcard":
        setFlashcardModalOpen(true);
        break;
      case "mindmap":
        setMindmapModalOpen(true);
        break;
      case "discuss":
      case "discussion": // Handle potential backend variation
      case "suggestion": // Handle potential backend variation
        setSuggestionModalOpen(true);
        break;
      case "tts":
        handlePlayAudio(setId, set.title);
        break;
      case "summary":
        setSummaryModalOpen(true);
        break;
      case "video":
        setVideoModalOpen(true);
        break;
      default:
        toast.error(`Định dạng không được hỗ trợ: ${type}`);
    }
  };

  const handlePlayAudio = useCallback(
    (setId: string, title?: string) => {
      api
        .get(`/user/notebooks/${notebookId}/ai/audio/${setId}`)
        .then((res: any) => {
          const data = res.data;
          const audioUrl = data?.primaryAudio?.audioUrl;
          if (audioUrl) {
            setPlayingId(setId);
            onAudioPlay?.({
              id: setId,
              url: audioUrl,
              title: data.title || title || "Podcast",
            });
          } else {
            toast.error("Không tìm thấy audio URL");
          }
        })
        .catch(() => {
          toast.error("Không thể tải audio");
        });
    },
    [notebookId, onAudioPlay]
  );

  const handleDelete = useCallback(
    async (setId: string) => {
      try {
        await api.delete(`/user/notebooks/${notebookId}/ai/sets/${setId}`);
        toast.success("Đã xóa thành công");
        fetchSets();
        if (playingId === setId) {
          setPlayingId(null);
          onAudioPlay?.(null);
        }
      } catch {
        toast.error("Không thể xóa");
      }
    },
    [notebookId, fetchSets, playingId, onAudioPlay]
  );

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  return (
    <>
      <SetList
        sets={sets}
        loading={loading}
        error={error}
        onView={handleView}
        onDelete={handleDelete}
        onRetry={fetchSets}
        playingId={playingId}
      />

      {selectedSetId && (
        <QuizPlayerModal
          open={quizModalOpen}
          onOpenChange={setQuizModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}

      {selectedSetId && (
        <FlashcardViewerModal
          open={flashcardModalOpen}
          onOpenChange={setFlashcardModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}

      {selectedSetId && (
        <MindmapViewerModal
          open={mindmapModalOpen}
          onOpenChange={setMindmapModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}
      {selectedSetId && (
        <SuggestionViewerModal
          open={suggestionModalOpen}
          onOpenChange={setSuggestionModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}
      {selectedSetId && (
        <VideoViewerModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}
      {selectedSetId && (
        <SummaryViewerModal
          open={summaryModalOpen}
          onOpenChange={setSummaryModalOpen}
          notebookId={notebookId}
          aiSetId={selectedSetId}
        />
      )}
    </>
  );
}
