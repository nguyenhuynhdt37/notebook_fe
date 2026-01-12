"use client";

import { useState, useEffect } from "react";
import { Clock, Users, HelpCircle, Calendar, FileText, PlayCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import examApi from "@/api/client/exam";
import { AvailableExam } from "@/types/student/exam";

export function ExamList() {
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAvailableExams();
  }, []);

  const loadAvailableExams = async () => {
    setIsLoading(true);
    try {
      const examData = await examApi.getAvailableExams();
      setExams(examData);
    } catch (error) {
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = (examId: string) => {
    router.push(`/exams/${examId}/start`);
  };

  const getExamStatus = (exam: AvailableExam) => {
    if (exam.isTimeUp) return { label: "Hết hạn", variant: "destructive" as const };
    if (!exam.isActive) return { label: "Chưa mở", variant: "secondary" as const };
    if (!exam.canTakeExam) return { label: "Không thể thi", variant: "outline" as const };
    if (exam.remainingAttempts === 0) return { label: "Hết lượt", variant: "outline" as const };
    return { label: "Có thể thi", variant: "default" as const };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Danh sách đề thi</h1>
        <p className="text-sm text-muted-foreground">
          Các đề thi có sẵn cho bạn
        </p>
      </div>

      {exams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Không có đề thi nào</h3>
            <p className="text-sm text-muted-foreground text-center">
              Hiện tại không có đề thi nào khả dụng cho bạn.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const canStart = exam.canTakeExam && exam.isActive && !exam.isTimeUp && exam.remainingAttempts > 0;
            const hasAttempted = exam.remainingAttempts < exam.maxAttempts;

            return (
              <Card key={exam.id} className="group transition-all hover:border-foreground/20">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{exam.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {exam.className}
                        <span className="mx-1">·</span>
                        {exam.subjectName}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Bắt đầu</p>
                        <p className="font-medium text-xs">
                          {format(new Date(exam.startTime), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Kết thúc</p>
                        <p className="font-medium text-xs">
                          {format(new Date(exam.endTime), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {exam.totalQuestions} câu
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className={`text-xs ${exam.remainingAttempts === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Lượt thi còn lại: {exam.remainingAttempts}/{exam.maxAttempts}
                    </p>
                    <div className="flex items-center gap-2">
                      {hasAttempted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/exams/${exam.id}/result`)}
                        >
                          <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                          Xem kết quả
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleStartExam(exam.id)}
                        disabled={!canStart}
                      >
                        <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                        Bắt đầu thi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}