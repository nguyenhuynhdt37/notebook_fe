"use client";

import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/api/client/axios";
import { ExamDetailResponse, Question } from "@/types/lecturer";
import { GenerateQuestionsModal } from "./generate-questions-modal";

interface ExamPreviewProps {
  examId: string;
}

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
        <Skeleton className="h-8 w-64" />
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
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
            <div className="flex items-center gap-2">
              <Badge className={`${exam.status === "DRAFT" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"}`}>
                {exam.status === "DRAFT" ? "Soạn thảo" : "Đã xuất bản"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {exam.questions.length} câu hỏi • {exam.totalPoints} điểm
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

      {/* Exam Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đề thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Thời gian:</span>
              <p className="font-medium">{exam.durationMinutes} phút</p>
            </div>
            <div>
              <span className="text-muted-foreground">Điểm đạt:</span>
              <p className="font-medium">{exam.passingScore} điểm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Số lần làm:</span>
              <p className="font-medium">{exam.maxAttempts} lần</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trộn câu hỏi:</span>
              <p className="font-medium">{exam.shuffleQuestions ? "Có" : "Không"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Danh sách câu hỏi</h2>
          {exam.questions.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Tổng: {exam.questions.length} câu
            </div>
          )}
        </div>

        {exam.questions.length === 0 ? (
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
      </div>

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