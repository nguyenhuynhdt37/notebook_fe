"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/api/client/axios";
import { ExamResponse } from "@/types/lecturer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ExamStatusManager } from "./exam-status-manager";
import examApi from "@/api/client/exam";

interface ExamCardProps {
  exam: ExamResponse;
  onUpdate: () => void;
}

const statusConfig = {
  DRAFT: { label: "Soạn thảo", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
  PUBLISHED: { label: "Đã xuất bản", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Đang diễn ra", variant: "default" as const, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
};

export function ExamCard({ exam, onUpdate }: ExamCardProps) {
  const status = statusConfig[exam.status];
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  const now = new Date();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này không?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await examApi.deleteExam(exam.id);
      toast.success("Xóa đề thi thành công");
      onUpdate();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa đề thi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{exam.title}</h3>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exam.description}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/lecturer/exams/${exam.id}/preview`}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Lớp học:</span>
            <p className="font-medium">{exam.className || "Chưa xác định"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Thời gian:</span>
            <p className="font-medium">{exam.durationMinutes} phút</p>
          </div>
          <div>
            <span className="text-muted-foreground">Số câu hỏi:</span>
            <p className="font-medium">{exam.totalQuestions} câu</p>
          </div>
          <div>
            <span className="text-muted-foreground">Điểm đạt:</span>
            <p className="font-medium">{exam.passingScore} điểm</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Bắt đầu: {startTime.toLocaleDateString("vi-VN")} {startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-muted-foreground">
            Tạo {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true, locale: vi })}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <ExamStatusManager exam={exam} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}