"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Eye, Edit, Settings, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/api/client/axios";
import { ExamDetailResponse } from "@/types/lecturer";
import { ExamStatusManager } from "./exam-status-manager";
import { GenerateQuestionsModal } from "./generate-questions-modal";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ExamDetailProps {
  examId: string;
}

const statusConfig = {
  DRAFT: { label: "Soạn thảo", color: "bg-gray-100 text-gray-800" },
  PUBLISHED: { label: "Đã xuất bản", color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Đang diễn ra", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export default function ExamDetail({ examId }: ExamDetailProps) {
  const [exam, setExam] = useState<ExamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ExamDetailResponse>(`/api/exams/${examId}`);
      setExam(response.data);
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("Không thể tải thông tin đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSuccess = () => {
    setShowGenerateModal(false);
    loadExam();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy đề thi</p>
            <Button asChild className="mt-4">
              <Link href="/lecturer/exams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[exam.status];
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/lecturer/exams/${examId}/preview`}>
              <Eye className="mr-2 h-4 w-4" />
              Xem trước
            </Link>
          </Button>
          {exam.status === "DRAFT" && (
            <Button onClick={() => setShowGenerateModal(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Tạo câu hỏi
            </Button>
          )}
        </div>
      </div>

      {/* Status Manager */}
      <Card>
        <CardContent className="p-6">
          <ExamStatusManager exam={exam} onUpdate={loadExam} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="questions">Câu hỏi ({exam.questions.length})</TabsTrigger>
          <TabsTrigger value="students">Sinh viên</TabsTrigger>
          <TabsTrigger value="results">Kết quả</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Lớp học:</span>
                    <p className="font-medium">{exam.className || "Chưa xác định"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Thời gian làm bài:</span>
                    <p className="font-medium">{exam.durationMinutes} phút</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Điểm đạt:</span>
                    <p className="font-medium">{exam.passingScore} điểm</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Số lần làm tối đa:</span>
                    <p className="font-medium">{exam.maxAttempts} lần</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thời gian thi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Bắt đầu:</span>
                    <p className="font-medium">
                      {startTime.toLocaleDateString("vi-VN")} {startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Kết thúc:</span>
                    <p className="font-medium">
                      {endTime.toLocaleDateString("vi-VN")} {endTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Tạo lúc:</span>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exam.questions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exam.totalPoints}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sinh viên tham gia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardContent className="p-6">
              {exam.questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Chưa có câu hỏi nào</p>
                    <p className="text-sm">Sử dụng AI để tạo câu hỏi tự động từ notebook</p>
                  </div>
                  <Button onClick={() => setShowGenerateModal(true)} className="mt-4">
                    <Edit className="mr-2 h-4 w-4" />
                    Tạo câu hỏi AI
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Danh sách câu hỏi</h3>
                    <Button variant="outline" asChild>
                      <Link href={`/lecturer/exams/${examId}/preview`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {exam.questions.length} câu hỏi • {exam.totalPoints} điểm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tính năng quản lý sinh viên sẽ có sớm</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tính năng xem kết quả sẽ có sớm</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tính năng cài đặt sẽ có sớm</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Questions Modal */}
      <GenerateQuestionsModal
        examId={examId}
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}