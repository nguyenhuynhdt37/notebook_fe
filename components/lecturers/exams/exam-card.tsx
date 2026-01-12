"use client";

import { useState } from "react";
import { Eye, Trash2, Clock, Users, HelpCircle, Calendar, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
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
  DRAFT: { label: "Bản nháp", variant: "secondary" as const },
  PUBLISHED: { label: "Đã xuất bản", variant: "outline" as const },
  ACTIVE: { label: "Đang thi", variant: "default" as const },
  CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
};

export function ExamCard({ exam, onUpdate }: ExamCardProps) {
  const status = statusConfig[exam.status];
  const startTime = new Date(exam.startTime);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await examApi.deleteExam(exam.id);
      toast.success("Xóa đề thi thành công");
      onUpdate();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa đề thi");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="group transition-all hover:border-foreground/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title & Status */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link 
                      href={`/lecturer/exams/${exam.id}/preview`}
                      className="font-medium hover:underline truncate"
                    >
                      {exam.title}
                    </Link>
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  {exam.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {exam.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{exam.className || "Chưa gán lớp"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{exam.totalQuestions} câu hỏi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{exam.durationMinutes} phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {startTime.toLocaleDateString("vi-VN", { 
                      day: "2-digit", 
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <ExamStatusManager exam={exam} onUpdate={onUpdate} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/lecturer/exams/${exam.id}/preview`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/lecturer/exams/${exam.id}/preview`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa đề thi
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>Điểm đạt: {exam.passingScore}</span>
            <span>
              Tạo {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đề thi "{exam.title}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa đề thi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}