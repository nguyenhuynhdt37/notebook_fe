"use client";

import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, ArrowLeft, Settings, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/api/client/axios";
import { ExamDetailResponse, Question } from "@/types/lecturer";
import { GenerateQuestionsModal } from "./generate-questions-modal";
import { ExamStatusManager } from "./exam-status-manager";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ExamPreviewProps {
  examId: string;
}

const statusConfig = {
  DRAFT: { label: "Soạn thảo", color: "bg-gray-100 text-gray-800" },
  PUBLISHED: { label: "Đã xuất bản", color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Đang diễn ra", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

const questionTypeLabels = {
  MCQ: "Trắc nghiệm",
  TRUE_FALSE: "Đúng/Sai", 
  ESSAY: "Tự luận",
};

const difficultyLabels = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
  MIXED: "Hỗn hợp",
};

const difficultyColors = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800", 
  HARD: "bg-red-100 text-red-800",
  MIXED: "bg-blue-100 text-blue-800",
};

export default function ExamPreview({ examId }: ExamPreviewProps) {
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
      const response = await api.get<ExamDetailResponse>(`/api/exams/${examId}/preview`);
      // Ensure questions array exists
      const examData = {
        ...response.data,
        questions: response.data.questions || []
      };
      setExam(examData);
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
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[exam.status];

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {exam.questions?.length || 0} câu hỏi • {exam.totalPoints} điểm
              </span>
            </div>
          </div>
        </div>
        
        {exam.status === "DRAFT" && (
          <div className="flex gap-2">
            <Button onClick={() => setShowGenerateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo câu hỏi AI
            </Button>
          </div>
        )}
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
          <TabsTrigger value="questions">Câu hỏi ({exam.questions?.length || 0})</TabsTrigger>
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
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Trộn câu hỏi:</span>
                    <p className="font-medium">{exam.shuffleQuestions ? "Có" : "Không"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Trộn đáp án:</span>
                    <p className="font-medium">{exam.shuffleOptions ? "Có" : "Không"}</p>
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
                      {new Date(exam.startTime).toLocaleDateString("vi-VN")} {new Date(exam.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Kết thúc:</span>
                    <p className="font-medium">
                      {new Date(exam.endTime).toLocaleDateString("vi-VN")} {new Date(exam.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
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
                <div className="text-2xl font-bold">{exam.questions?.length || 0}</div>
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
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Danh sách câu hỏi</h2>
            {exam.questions && exam.questions.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Tổng: {exam.questions.length} câu
              </div>
            )}
          </div>

          {!exam.questions || exam.questions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Chưa có câu hỏi nào</p>
                    <p className="text-sm">Sử dụng AI để tạo câu hỏi tự động từ notebook</p>
                  </div>
                  <Button onClick={() => setShowGenerateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo câu hỏi AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {exam.questions.map((question, index) => (
                <QuestionCard 
                  key={question.id} 
                  question={question} 
                  index={index + 1}
                  canEdit={exam.status === "DRAFT"}
                />
              ))}
            </div>
          )}
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

function QuestionCard({ 
  question, 
  index, 
  canEdit 
}: { 
  question: Question; 
  index: number;
  canEdit: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {index}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {questionTypeLabels[question.type]}
                </Badge>
                <Badge className={difficultyColors[question.difficulty]}>
                  {difficultyLabels[question.difficulty]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {question.points} điểm
                </span>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="font-medium">{question.content}</p>
        </div>

        {question.type === "MCQ" && question.options && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Các lựa chọn:</p>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex}
                  className={`flex items-center gap-2 p-2 rounded border ${
                    option === question.correctAnswer 
                      ? "bg-green-50 border-green-200" 
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                    {String.fromCharCode(65 + optionIndex)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {option === question.correctAnswer && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Đáp án đúng
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === "TRUE_FALSE" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Đáp án:</p>
            <Badge className={question.correctAnswer === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {question.correctAnswer === "true" ? "Đúng" : "Sai"}
            </Badge>
          </div>
        )}

        {question.type === "ESSAY" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Gợi ý đáp án:</p>
            <div className="p-3 bg-muted/50 rounded border">
              <p className="text-sm">{question.correctAnswer}</p>
            </div>
          </div>
        )}

        {question.explanation && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Giải thích:</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}