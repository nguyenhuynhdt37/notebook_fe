"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  QuizListResponse,
  QuizResponse,
  QuizOptionResponse,
} from "@/types/user/ai-task";

interface QuizPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getDifficultyLabel = (level: number): string => {
  if (level <= 1) return "Dễ";
  if (level <= 2) return "Trung bình";
  if (level <= 3) return "Khó";
  return "Rất khó";
};

export default function QuizPlayerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: QuizPlayerModalProps) {
  const [quizData, setQuizData] = useState<QuizListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);

  const fetchQuizData = useCallback(async () => {
    if (!notebookId || !aiSetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<QuizListResponse>(
        `/user/notebooks/${notebookId}/ai/quiz/${aiSetId}`
      );
      setQuizData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải quiz");
    } finally {
      setLoading(false);
    }
  }, [notebookId, aiSetId]);

  useEffect(() => {
    if (open && aiSetId) {
      fetchQuizData();
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setAnsweredQuestions(new Set());
      setCorrectAnswers(new Set());
      setShowResult(false);
    }
  }, [open, aiSetId, fetchQuizData]);

  const currentQuiz: QuizResponse | null =
    quizData?.quizzes[currentIndex] || null;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuiz || answeredQuestions.has(currentQuiz.id)) return;

    setSelectedOptionId(optionId);
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuiz.id));

    // Check if answer is correct
    const selectedOpt = currentQuiz.options.find((o) => o.id === optionId);
    if (selectedOpt?.isCorrect) {
      setCorrectAnswers((prev) => new Set(prev).add(currentQuiz.id));
    }
  };

  const handleNext = () => {
    if (quizData && currentIndex < quizData.quizzes.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedOptionId(null);
    }
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnsweredQuestions(new Set());
    setCorrectAnswers(new Set());
    setShowResult(false);
  };

  const isAnswered = currentQuiz
    ? answeredQuestions.has(currentQuiz.id)
    : false;

  const isLastQuestion = quizData
    ? currentIndex === quizData.quizzes.length - 1
    : false;

  const allAnswered = quizData
    ? answeredQuestions.size === quizData.quizzes.length
    : false;

  const selectedOption: QuizOptionResponse | null = currentQuiz
    ? currentQuiz.options.find((o) => o.id === selectedOptionId) || null
    : null;

  const correctOption: QuizOptionResponse | null = currentQuiz
    ? currentQuiz.options.find((o) => o.isCorrect) || null
    : null;

  const scorePercent = quizData
    ? Math.round((correctAnswers.size / quizData.quizzes.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-background" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-background">
          <DialogTitle className="sr-only">Quiz Player</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">
                  {quizData?.title || "Quiz"}
                </h2>
                {quizData && (
                  <p className="text-sm text-muted-foreground">
                    Câu {currentIndex + 1} / {quizData.totalQuizzes}
                  </p>
                )}
              </div>
            </div>

            {/* Quiz Info */}
            {quizData && (
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Tạo bởi</p>
                  <p className="font-medium">{quizData.createdByName}</p>
                </div>
                <Avatar className="size-9">
                  <AvatarImage
                    src={quizData.createdByAvatar}
                    alt={quizData.createdByName}
                  />
                  <AvatarFallback>
                    {getInitials(quizData.createdByName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground border-l pl-4">
                  <p>{quizData.totalQuizzes} câu hỏi</p>
                  <p>{formatDate(quizData.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="size-10 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Đang tải quiz...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="size-10 text-destructive mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={fetchQuizData}>
                  Thử lại
                </Button>
              </div>
            )}

            {!loading && !error && !showResult && currentQuiz && (
              <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      {getDifficultyLabel(currentQuiz.difficultyLevel)}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-medium leading-relaxed">
                    {currentQuiz.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuiz.options
                    .sort((a, b) => a.position - b.position)
                    .map((option, idx) => {
                      const isSelected = selectedOptionId === option.id;
                      const showResult = isAnswered;

                      let optionStyle =
                        "border-border hover:border-foreground/30 hover:bg-muted/50";
                      if (showResult) {
                        if (option.isCorrect) {
                          optionStyle = "border-green-500 bg-green-500/10";
                        } else if (isSelected && !option.isCorrect) {
                          optionStyle = "border-red-500 bg-red-500/10";
                        } else {
                          optionStyle = "border-border opacity-60";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-foreground bg-muted/50";
                      }

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          disabled={isAnswered}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 size-7 rounded-full border flex items-center justify-center text-sm font-medium">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{option.text}</p>
                              {showResult && isSelected && option.feedback && (
                                <div className="mt-2 flex items-start gap-2">
                                  {option.isCorrect ? (
                                    <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {option.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                            {showResult && option.isCorrect && (
                              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Correct Answer Info (when wrong) */}
                {isAnswered &&
                  selectedOption &&
                  !selectedOption.isCorrect &&
                  correctOption && (
                    <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-5 text-green-500" />
                        <p className="font-medium text-green-700">
                          Đáp án đúng
                        </p>
                      </div>
                      <p className="text-sm">{correctOption.text}</p>
                      {correctOption.feedback && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {correctOption.feedback}
                        </p>
                      )}
                    </div>
                  )}

                {/* Explanation */}
                {isAnswered && currentQuiz.explanation && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium mb-2">Giải thích:</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuiz.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Result Screen */}
            {showResult && quizData && (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <div className="text-center max-w-md">
                  <div className="mb-8">
                    <div
                      className={`inline-flex items-center justify-center size-24 rounded-full mb-4 ${
                        scorePercent >= 70
                          ? "bg-green-500/10"
                          : scorePercent >= 40
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      <span
                        className={`text-4xl font-bold ${
                          scorePercent >= 70
                            ? "text-green-500"
                            : scorePercent >= 40
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {scorePercent}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {scorePercent >= 70
                        ? "Xuất sắc! 🎉"
                        : scorePercent >= 40
                        ? "Khá tốt! 👍"
                        : "Cần cố gắng hơn! 💪"}
                    </h3>
                    <p className="text-muted-foreground">
                      Bạn đã trả lời đúng {correctAnswers.size}/
                      {quizData.totalQuizzes} câu hỏi
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-2xl font-bold text-green-500">
                        {correctAnswers.size}
                      </p>
                      <p className="text-sm text-muted-foreground">Câu đúng</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-2xl font-bold text-red-500">
                        {quizData.totalQuizzes - correctAnswers.size}
                      </p>
                      <p className="text-sm text-muted-foreground">Câu sai</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleRestart}>
                      Làm lại
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {quizData && !loading && !error && !showResult && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="size-4" />
                Câu trước
              </Button>

              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {quizData.totalQuizzes}
              </p>

              {isLastQuestion && isAnswered ? (
                <Button onClick={handleShowResult} className="gap-2">
                  Xem kết quả
                  <CheckCircle2 className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="gap-2"
                >
                  Câu tiếp
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
