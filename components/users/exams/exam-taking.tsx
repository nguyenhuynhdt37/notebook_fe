"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Flag, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStudentExamStore } from "@/stores/studentExam";
import { QuestionCard } from "./question-card";
import { Timer } from "./timer";
import { AnswerTracker } from "./answer-tracker";
import examApi from "@/api/client/exam";
import { StudentAnswer } from "@/types/student/exam";

interface ExamTakingProps {
  examId: string;
}

export function ExamTaking({ examId }: ExamTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const {
    currentExam,
    answers,
    timeRemaining,
    isExamActive,
    tabSwitchCount,
    copyPasteCount,
    rightClickCount,
    setAnswer,
    setTimeRemaining,
    setExamActive,
    incrementTabSwitch,
    incrementCopyPaste,
    incrementRightClick,
    clearExamData,
  } = useStudentExamStore();

  const router = useRouter();

  // Security event handlers
  useEffect(() => {
    if (!currentExam) {
      router.push(`/exams/${examId}/start`);
      return;
    }

    setExamActive(true);

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      incrementRightClick();
      toast.warning("Chuột phải đã bị vô hiệu hóa");
    };

    // Disable copy/paste
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        incrementCopyPaste();
        toast.warning("Sao chép/dán đã bị vô hiệu hóa");
      }

      // Disable F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        toast.warning("Công cụ phát triển đã bị vô hiệu hóa");
      }
    };

    // Track tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementTabSwitch();
        toast.warning("Phát hiện chuyển tab! Hành vi này đã được ghi nhận.");
      }
    };

    // Prevent leaving fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error("Vui lòng giữ chế độ toàn màn hình");
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(console.error);
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentExam, examId, router]);

  // Timer countdown
  useEffect(() => {
    if (!isExamActive || isSubmitting) return;

    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isExamActive, isSubmitting]);

  // Track time spent on current question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerChange = useCallback((questionId: string, answerData: any, confidence: "LOW" | "MEDIUM" | "HIGH") => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const existingAnswer = answers[questionId];

    const answer: StudentAnswer = {
      questionId,
      answerData,
      timeSpentSeconds: (existingAnswer?.timeSpentSeconds || 0) + timeSpent,
      revisionCount: existingAnswer ? existingAnswer.revisionCount + 1 : 0,
      wasSkipped: false,
      confidence,
    };

    setAnswer(questionId, answer);
    setQuestionStartTime(Date.now()); // Reset timer for this question
  }, [answers, questionStartTime, setAnswer]);

  const handleSkipQuestion = () => {
    if (!currentExam) return;

    const question = currentExam.questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    if (!answers[question.questionId]) {
      const answer: StudentAnswer = {
        questionId: question.questionId,
        answerData: {},
        timeSpentSeconds: timeSpent,
        revisionCount: 0,
        wasSkipped: true,
        confidence: "LOW",
      };
      setAnswer(question.questionId, answer);
    }

    // Move to next question
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (!currentExam) return;

    toast.info("Hết thời gian! Đang tự động nộp bài...");
    await submitExam(true);
  };

  const handleManualSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const submitExam = async (isAutoSubmit = false) => {
    if (!currentExam) return;

    setIsSubmitting(true);
    try {
      // Calculate total time spent
      const totalTimeSpent = currentExam.durationMinutes * 60 - timeRemaining;

      // Prepare answers array
      const answersArray = currentExam.questions.map(question => {
        const answer = answers[question.questionId];
        return answer || {
          questionId: question.questionId,
          answerData: {},
          timeSpentSeconds: 0,
          revisionCount: 0,
          wasSkipped: true,
          confidence: "LOW" as const,
        };
      });

      const submitData = {
        attemptId: currentExam.attemptId,
        isAutoSubmit,
        timeSpentSeconds: totalTimeSpent,
        answers: answersArray,
        tabSwitchCount,
        copyPasteCount,
        rightClickCount,
      };

      await examApi.submitExam(examId, submitData);

      // Clear exam data and navigate to result
      clearExamData();
      setExamActive(false);

      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }

      router.push(`/exams/${examId}/result`);

    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  if (!currentExam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Không tìm thấy thông tin bài thi</p>
          <Button onClick={() => router.push("/exams")} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">{currentExam.examTitle}</h1>
              <div className="text-sm text-muted-foreground">
                Câu {currentQuestionIndex + 1} / {currentExam.questions.length}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Timer timeRemaining={timeRemaining} />
              <Button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.questionId]}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestionIndex + 1}
            />

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Câu trước
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSkipQuestion}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Bỏ qua
                </Button>

                <Button
                  onClick={() => setCurrentQuestionIndex(Math.min(currentExam.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === currentExam.questions.length - 1}
                >
                  Câu tiếp
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <AnswerTracker
              questions={currentExam.questions}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={setCurrentQuestionIndex}
            />

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Đã trả lời:</span>
                  <span className="font-medium">{answeredCount}/{currentExam.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian còn lại:</span>
                  <span className="font-medium text-orange-600">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {(tabSwitchCount > 0 || copyPasteCount > 0 || rightClickCount > 0) && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    Cảnh báo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {tabSwitchCount > 0 && (
                    <p>Chuyển tab: {tabSwitchCount} lần</p>
                  )}
                  {copyPasteCount > 0 && (
                    <p>Sao chép/dán: {copyPasteCount} lần</p>
                  )}
                  {rightClickCount > 0 && (
                    <p>Chuột phải: {rightClickCount} lần</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Xác nhận nộp bài</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Bạn có chắc chắn muốn nộp bài không?</p>
              <div className="text-sm text-muted-foreground">
                <p>Đã trả lời: {answeredCount}/{currentExam.questions.length} câu</p>
                <p>Thời gian còn lại: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => submitExam(false)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Đang nộp..." : "Nộp bài"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}