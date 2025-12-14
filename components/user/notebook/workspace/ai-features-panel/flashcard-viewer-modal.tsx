"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { FlashcardListResponse } from "@/types/user/flashcard";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

interface FlashcardViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

export default function FlashcardViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: FlashcardViewerModalProps) {
  const [flashcardsData, setFlashcardsData] =
    useState<FlashcardListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const fetchFlashcards = useCallback(async () => {
    if (!notebookId || !aiSetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<FlashcardListResponse>(
        `/user/notebooks/${notebookId}/ai/flashcards/${aiSetId}`
      );
      setFlashcardsData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải bộ flashcards này."
      );
    } finally {
      setLoading(false);
    }
  }, [aiSetId, notebookId]);

  const handleNextCard = useCallback(() => {
    if (
      flashcardsData &&
      currentCardIndex < flashcardsData.flashcards.length - 1
    ) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else if (
      flashcardsData &&
      currentCardIndex === flashcardsData.flashcards.length - 1
    ) {
      setShowSummary(true);
    }
  }, [flashcardsData, currentCardIndex]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setFlippedCards(new Set());
  }, []);

  const handleJumpToCard = useCallback((index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
    setShowSummary(false);
  }, []);

  const handleFlipSummaryCard = useCallback((index: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (open && aiSetId) {
      fetchFlashcards();
    }
  }, [open, aiSetId, fetchFlashcards]);

  useEffect(() => {
    if (open) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowSummary(false);
      setFlippedCards(new Set());
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!open || !flashcardsData) return;

      if (showSummary) {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevCard();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNextCard();
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          handleFlipCard();
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    open,
    flashcardsData,
    showSummary,
    handlePrevCard,
    handleNextCard,
    handleFlipCard,
    onOpenChange,
  ]);

  if (!open) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="size-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Đang tải flashcards...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="size-10 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchFlashcards}>
            Thử lại
          </Button>
        </div>
      );
    }

    if (!flashcardsData || flashcardsData.flashcards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Sparkles className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có flashcards nào.</p>
        </div>
      );
    }

    const totalCards = flashcardsData.flashcards.length;

    // Summary View - Grid 3x4 với thẻ lật được
    if (showSummary) {
      return (
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
              <Sparkles className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              🎉 Hoàn thành {totalCards} thẻ!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Nhấn vào thẻ để lật xem lại
            </p>
          </div>

          {/* Grid 3x4 */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
              {flashcardsData.flashcards.map((card, index) => (
                <div
                  key={card.id}
                  className="aspect-[3/4] perspective-1000 cursor-pointer"
                  onClick={() => handleFlipSummaryCard(index)}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                      flippedCards.has(index) ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden border-2 rounded-xl bg-card p-4 flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded w-fit mb-2">
                        {index + 1}
                      </span>
                      <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <div className="text-sm font-medium text-center line-clamp-4">
                          <MarkdownRenderer
                            content={card.frontText}
                            className="prose-sm"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Nhấn để lật
                      </p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-primary/30 rounded-xl bg-primary/5 p-4 flex flex-col">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded w-fit mb-2">
                        {index + 1}
                      </span>
                      <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <div className="text-sm font-medium text-center line-clamp-4">
                          <MarkdownRenderer
                            content={card.backText}
                            className="prose-sm"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Nhấn để lật
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleRestart} className="gap-2">
              <RotateCcw className="size-4" />
              Học lại từ đầu
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </div>
      );
    }

    // Card View - Thẻ chữ nhật đứng 3:4
    const currentCard = flashcardsData.flashcards[currentCardIndex];

    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        {/* Progress */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {currentCardIndex + 1} / {totalCards}
            </span>
            <span className="text-muted-foreground">
              {flashcardsData.title}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Card - 3:4 aspect ratio */}
        <div
          className="w-full max-w-sm aspect-[3/4] perspective-1000 cursor-pointer mb-6"
          onClick={handleFlipCard}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden border-2 rounded-2xl bg-card shadow-lg flex flex-col items-center justify-center p-8 overflow-auto">
              <BookOpen className="size-10 text-muted-foreground mb-6 shrink-0" />
              <div className="text-xl font-medium text-center leading-relaxed">
                <MarkdownRenderer content={currentCard.frontText} />
              </div>
              <p className="text-sm text-muted-foreground mt-6 shrink-0">
                Nhấn để xem đáp án
              </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-primary/30 rounded-2xl bg-primary/5 shadow-lg flex flex-col items-center justify-center p-8 overflow-auto">
              <Sparkles className="size-10 text-primary mb-6 shrink-0" />
              <div className="text-xl font-medium text-center leading-relaxed">
                <MarkdownRenderer content={currentCard.backText} />
              </div>
              {currentCard.example && (
                <p className="text-sm text-muted-foreground mt-4 text-center italic">
                  VD: {currentCard.example}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-6 shrink-0">
                Nhấn để xem câu hỏi
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-5" />
            Trước
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handleNextCard}
            className="gap-2"
          >
            {currentCardIndex === totalCards - 1 ? "Hoàn thành" : "Tiếp"}
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground mt-4">
          Phím tắt: ← → Space ESC
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={() => onOpenChange(false)}
      >
        <X className="size-5" />
      </Button>

      {renderContent()}
    </div>
  );
}
