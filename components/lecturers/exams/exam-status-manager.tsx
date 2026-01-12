"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Send, Play, XCircle } from "lucide-react";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { ExamDetailResponse } from "@/types/lecturer/exam";

interface ExamStatusManagerProps {
  exam: ExamDetailResponse;
  onUpdate: () => void;
}

export function ExamStatusManager({ exam, onUpdate }: ExamStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    if (!exam.questions || exam.questions.length === 0) {
      toast.error("Không thể xuất bản đề thi không có câu hỏi");
      return;
    }

    setIsLoading(true);
    try {
      await examApi.publishExam(exam.id);
      toast.success("Đã xuất bản đề thi thành công");
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể xuất bản đề thi";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await examApi.activateExam(exam.id);
      toast.success("Đã kích hoạt đề thi thành công");
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể kích hoạt đề thi";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await examApi.cancelExam(exam.id);
      toast.success("Đã hủy đề thi thành công");
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể hủy đề thi";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const CancelButton = ({ warning }: { warning?: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading} className="text-muted-foreground hover:text-red-600">
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Hủy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy đề thi</AlertDialogTitle>
          <AlertDialogDescription>
            {warning || "Bạn có chắc chắn muốn hủy đề thi này? Hành động này không thể hoàn tác."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  switch (exam.status) {
    case "DRAFT":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Bản nháp</Badge>
          <span className="text-xs text-muted-foreground">Có thể chỉnh sửa</span>
          <div className="ml-auto">
            <Button 
              size="sm"
              onClick={handlePublish} 
              disabled={isLoading || !exam.questions || exam.questions.length === 0}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Xuất bản
            </Button>
          </div>
        </div>
      );

    case "PUBLISHED":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">Đã xuất bản</Badge>
          <span className="text-xs text-muted-foreground">Sẵn sàng kích hoạt</span>
          <div className="ml-auto flex items-center gap-1">
            <CancelButton />
            <Button size="sm" onClick={handleActivate} disabled={isLoading}>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Kích hoạt
            </Button>
          </div>
        </div>
      );

    case "ACTIVE":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default">Đang diễn ra</Badge>
          <span className="text-xs text-muted-foreground">Sinh viên đang làm bài</span>
          <div className="ml-auto">
            <CancelButton warning="Đề thi đang diễn ra. Hủy sẽ ảnh hưởng đến sinh viên đang làm bài. Bạn có chắc chắn?" />
          </div>
        </div>
      );

    case "CANCELLED":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Đã hủy</Badge>
          <span className="text-xs text-muted-foreground">Đề thi đã bị hủy</span>
        </div>
      );

    default:
      return null;
  }
}