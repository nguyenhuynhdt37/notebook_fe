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
      console.error("Error publishing exam:", error);
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
      console.error("Error activating exam:", error);
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
      console.error("Error cancelling exam:", error);
      const errorMessage = error.response?.data?.message || "Không thể hủy đề thi";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (exam.status) {
      case "DRAFT":
        return {
          label: "Soạn thảo",
          color: "bg-gray-100 text-gray-800",
          description: "Đề thi đang được soạn thảo, có thể chỉnh sửa",
          actions: (
            <Button 
              onClick={handlePublish} 
              disabled={isLoading || !exam.questions || exam.questions.length === 0}
            >
              Xuất bản
            </Button>
          )
        };
      case "PUBLISHED":
        return {
          label: "Đã xuất bản",
          color: "bg-blue-100 text-blue-800",
          description: "Đề thi đã được chốt, không thể chỉnh sửa",
          actions: (
            <div className="flex gap-2">
              <Button onClick={handleActivate} disabled={isLoading}>
                Kích hoạt
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    Hủy đề thi
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận hủy đề thi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn hủy đề thi này? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Xác nhận hủy
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        };
      case "ACTIVE":
        return {
          label: "Đang diễn ra",
          color: "bg-green-100 text-green-800",
          description: "Đề thi đang được mở cho sinh viên làm bài",
          actions: (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  Hủy đề thi
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận hủy đề thi</AlertDialogTitle>
                  <AlertDialogDescription>
                    Đề thi đang diễn ra. Hủy đề thi sẽ ảnh hưởng đến sinh viên đang làm bài. 
                    Bạn có chắc chắn muốn tiếp tục?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Xác nhận hủy
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          color: "bg-red-100 text-red-800",
          description: "Đề thi đã bị hủy",
          actions: null
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          description: "Trạng thái không xác định",
          actions: null
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Badge className={statusInfo.color}>
          {statusInfo.label}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {statusInfo.description}
        </p>
      </div>
      
      {statusInfo.actions && (
        <div className="flex gap-2">
          {statusInfo.actions}
        </div>
      )}
    </div>
  );
}