"use client";

import { useState, useEffect } from "react";
import { Clock, Users, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      console.error("Error loading available exams:", error);
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = (examId: string) => {
    router.push(`/exams/${examId}/start`);
  };

  const getExamStatus = (exam: AvailableExam) => {
    if (exam.isTimeUp) return { label: "Hết hạn", color: "bg-red-100 text-red-800" };
    if (!exam.isActive) return { label: "Chưa mở", color: "bg-gray-100 text-gray-800" };
    if (!exam.canTakeExam) return { label: "Không thể thi", color: "bg-yellow-100 text-yellow-800" };
    if (exam.remainingAttempts === 0) return { label: "Hết lượt thi", color: "bg-orange-100 text-orange-800" };
    return { label: "Có thể thi", color: "bg-green-100 text-green-800" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Danh sách đề thi</h1>
        <p className="text-muted-foreground">
          Các đề thi có sẵn cho bạn
        </p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Không có đề thi nào</h3>
            <p className="text-muted-foreground text-center">
              Hiện tại không có đề thi nào khả dụng cho bạn.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const canStart = exam.canTakeExam && exam.isActive && !exam.isTimeUp && exam.remainingAttempts > 0;
            
            return (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {exam.className}
                        </span>
                        <span>{exam.subjectName}</span>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Bắt đầu</p>
                        <p className="text-muted-foreground">
                          {format(new Date(exam.startTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Kết thúc</p>
                        <p className="text-muted-foreground">
                          {format(new Date(exam.endTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Thời gian</p>
                        <p className="text-muted-foreground">{exam.durationMinutes} phút</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Câu hỏi</p>
                        <p className="text-muted-foreground">{exam.totalQuestions} câu</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Lượt thi còn lại: <span className="font-medium">{exam.remainingAttempts}/{exam.maxAttempts}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handleStartExam(exam.id)}
                      disabled={!canStart}
                      className="min-w-[100px]"
                    >
                      {canStart ? "Bắt đầu thi" : "Không thể thi"}
                    </Button>
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