"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AttemptResponse,
  QuizAnalysisResponse,
  TopicAnalysis,
} from "@/types/user/ai-task";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attemptId: string;
  notebookId: string;
  aiSetId: string;
}

function formatTime(seconds?: number): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TopicSection({
  title,
  icon,
  topics,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  topics: TopicAnalysis[];
  type: "strength" | "weakness" | "improvement";
}) {
  if (topics.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {topics.map((topic, i) => (
          <Collapsible key={i}>
            <CollapsibleTrigger asChild>
              <button className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{topic.topic}</span>
                  <ChevronDown className="size-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {topic.analysis}
              </p>
              {topic.suggestions.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {topic.suggestions.map((s, j) => (
                    <li
                      key={j}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-foreground/40 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

export default function QuizResultModal({
  open,
  onOpenChange,
  attemptId,
  notebookId,
  aiSetId,
}: Props) {
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [analysis, setAnalysis] = useState<QuizAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const fetchAttempt = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await api.get<AttemptResponse>(
        `/user/notebooks/${notebookId}/ai/quiz/attempts/${attemptId}`
      );
      setAttempt(res.data);
      if (res.data.hasAnalysis) {
        try {
          const analysisRes = await api.get<QuizAnalysisResponse>(
            `/user/notebooks/${notebookId}/ai/quiz/attempts/${attemptId}/analysis`
          );
          setAnalysis(analysisRes.data);
        } catch {
          // Analysis fetch failed, continue without it
        }
      }
      if (aiSetId) {
        try {
          const historyRes = await api.get<AttemptResponse[]>(
            `/user/notebooks/${notebookId}/ai/quiz/${aiSetId}/attempts`
          );
          setHistory(historyRes.data);
        } catch {
          // History fetch failed, continue without it
        }
      }
    } catch {
      setError("Không thể tải kết quả.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, notebookId, aiSetId]);

  const handleAnalyze = async () => {
    if (!attemptId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post<QuizAnalysisResponse>(
        `/user/notebooks/${notebookId}/ai/quiz/attempts/${attemptId}/analyze`
      );
      setAnalysis(res.data);
      if (attempt) setAttempt({ ...attempt, hasAnalysis: true });
    } catch {
      setError("Không thể phân tích. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    setAnalysis(null);
    setShowAnswers(false);
  }, [attemptId]);

  useEffect(() => {
    if (open && attemptId) fetchAttempt();
  }, [open, attemptId, fetchAttempt]);

  const scorePercent = attempt ? Math.round(attempt.score) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-screen h-screen m-0 rounded-none border-none p-0 gap-0 bg-background flex flex-col sm:max-w-none sm:rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0 data-[state=open]:!slide-in-from-bottom-0 data-[state=open]:!slide-in-from-left-0 [&>button]:hidden">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-8 shrink-0 bg-background">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-muted">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Kết quả bài làm
              </DialogTitle>
              {attempt && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(attempt.createdAt)}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Loader2 className="size-10 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Đang tải kết quả...
                </p>
              </div>
            </div>
          ) : error && !attempt ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto">
                  <AlertCircle className="size-8 text-red-500" />
                </div>
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchAttempt}>
                  Thử lại
                </Button>
              </div>
            </div>
          ) : attempt ? (
            <div className="h-full flex">
              {/* Left Panel - Score */}
              <div className="w-[400px] border-r bg-muted/30 p-8 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Score Circle */}
                  <div className="relative mb-8">
                    <div className="size-48 rounded-full border-[12px] border-muted flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold tracking-tight">
                          {scorePercent}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {attempt.correctCount}/{attempt.totalQuestions} câu
                          đúng
                        </div>
                      </div>
                    </div>
                    {/* Progress overlay */}
                    <svg
                      className="absolute inset-0 -rotate-90"
                      viewBox="0 0 192 192"
                    >
                      <circle
                        cx="96"
                        cy="96"
                        r="90"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${(scorePercent / 100) * 565} 565`}
                        className="text-foreground"
                      />
                    </svg>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="text-center p-4 rounded-lg bg-background border">
                      <div className="text-2xl font-semibold">
                        {attempt.correctCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Đúng
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background border">
                      <div className="text-2xl font-semibold">
                        {attempt.totalQuestions - attempt.correctCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sai
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-6 border-t">
                  {!analysis && !analyzing && (
                    <Button
                      onClick={handleAnalyze}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Brain className="size-4" />
                      Phân tích bằng AI
                    </Button>
                  )}
                  {analyzing && (
                    <Button disabled className="w-full gap-2" size="lg">
                      <Loader2 className="size-4 animate-spin" />
                      Đang phân tích...
                    </Button>
                  )}
                  {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}
                </div>
              </div>

              {/* Right Panel - Details */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs
                  defaultValue="analysis"
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="px-8 pt-6 pb-4 border-b shrink-0">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="analysis" className="gap-2">
                        <Brain className="size-4" />
                        Phân tích
                      </TabsTrigger>
                      <TabsTrigger value="answers" className="gap-2">
                        <CheckCircle2 className="size-4" />
                        Đáp án
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-2">
                        <History className="size-4" />
                        Lịch sử
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Analysis Tab */}
                    <TabsContent value="analysis" className="m-0 p-8 space-y-8">
                      {!analysis ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Brain className="size-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            Phân tích AI
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-sm mb-6">
                            Sử dụng AI để phân tích kết quả, tìm điểm mạnh, điểm
                            yếu và đưa ra gợi ý học tập phù hợp.
                          </p>
                          {!analyzing && (
                            <Button
                              onClick={handleAnalyze}
                              size="lg"
                              className="gap-2"
                            >
                              <Brain className="size-4" />
                              Bắt đầu phân tích
                            </Button>
                          )}
                          {analyzing && (
                            <Button disabled size="lg" className="gap-2">
                              <Loader2 className="size-4 animate-spin" />
                              Đang phân tích...
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-8 max-w-2xl">
                          {/* Summary */}
                          <div className="p-6 rounded-xl bg-muted/50 border">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-background">
                                <Brain className="size-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold mb-1">
                                  {analysis.scoreText}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {analysis.summary}
                                </p>
                              </div>
                            </div>
                          </div>

                          <TopicSection
                            title="Điểm mạnh"
                            icon={<CheckCircle2 className="size-4" />}
                            topics={analysis.strengths}
                            type="strength"
                          />

                          <TopicSection
                            title="Đã cải thiện"
                            icon={<TrendingUp className="size-4" />}
                            topics={analysis.improvements}
                            type="improvement"
                          />

                          <TopicSection
                            title="Cần ôn lại"
                            icon={<AlertTriangle className="size-4" />}
                            topics={analysis.weaknesses}
                            type="weakness"
                          />

                          {analysis.recommendations.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <Lightbulb className="size-4" />
                                Gợi ý học tập
                              </h3>
                              <div className="p-4 rounded-lg border bg-card space-y-2">
                                {analysis.recommendations.map((r, i) => (
                                  <p
                                    key={i}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <span className="text-foreground/40 mt-0.5">
                                      •
                                    </span>
                                    {r}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    {/* Answers Tab */}
                    <TabsContent value="answers" className="m-0 p-8">
                      {attempt.answers && attempt.answers.length > 0 ? (
                        <div className="space-y-4 max-w-2xl">
                          {attempt.answers.map((ans, idx) => (
                            <div
                              key={ans.quizId}
                              className={cn(
                                "p-5 rounded-xl border-2 transition-colors",
                                ans.isCorrect
                                  ? "border-foreground/20 bg-foreground/5"
                                  : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={cn(
                                    "size-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                                    ans.isCorrect
                                      ? "bg-foreground text-background"
                                      : "bg-red-500 text-white"
                                  )}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0 space-y-3">
                                  <p className="font-medium leading-relaxed">
                                    {ans.question}
                                  </p>
                                  <div className="space-y-2">
                                    {ans.selectedOptionText && (
                                      <div
                                        className={cn(
                                          "flex items-start gap-2 text-sm",
                                          ans.isCorrect
                                            ? "text-foreground"
                                            : "text-red-600 dark:text-red-400"
                                        )}
                                      >
                                        {ans.isCorrect ? (
                                          <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                                        ) : (
                                          <XCircle className="size-4 mt-0.5 shrink-0" />
                                        )}
                                        <span>
                                          Bạn chọn: {ans.selectedOptionText}
                                        </span>
                                      </div>
                                    )}
                                    {!ans.isCorrect && (
                                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                                        <span>
                                          Đáp án đúng: {ans.correctOptionText}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <CheckCircle2 className="size-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Không có dữ liệu đáp án chi tiết
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="m-0 p-8">
                      {history.length > 0 ? (
                        <div className="space-y-3 max-w-2xl">
                          {history.map((h, idx) => (
                            <div
                              key={h.id}
                              className={cn(
                                "p-5 rounded-xl border transition-colors",
                                h.id === attemptId
                                  ? "border-foreground/30 bg-muted/50"
                                  : "border-border hover:bg-muted/30"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                    #{history.length - idx}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">
                                        {h.correctCount}/{h.totalQuestions}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        ({Math.round(h.score)}%)
                                      </span>
                                      {h.id === attemptId && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Hiện tại
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {formatDate(h.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {h.timeSpentSeconds && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Clock className="size-3.5" />
                                      {formatTime(h.timeSpentSeconds)}
                                    </div>
                                  )}
                                  {h.hasAnalysis && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs gap-1"
                                    >
                                      <Brain className="size-3" />
                                      Đã phân tích
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <History className="size-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Chưa có lịch sử làm bài
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
