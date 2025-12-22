"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
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

interface SubjectDeleteDialogProps {
  subjectId: string;
  subjectName: string;
  majorCount: number;
  assignmentCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function SubjectDeleteDialog({
  subjectId,
  subjectName,
  majorCount,
  assignmentCount,
  open,
  onOpenChange,
  onDelete,
}: SubjectDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/subject/${subjectId}`);
      toast.success("Xóa môn học thành công");
      onOpenChange(false);
      onDelete();
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 409) {
        toast.error("Không thể xóa môn học", {
          description:
            "Môn học đang có ràng buộc dữ liệu (phân công hoặc thuộc ngành học). Vui lòng xóa các ràng buộc trước.",
        });
      } else {
        toast.error(err.response?.data?.message || "Không thể xóa môn học");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasConstraints = majorCount > 0 || assignmentCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-xl font-semibold">
                Xác nhận xóa môn học
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn xóa môn học{" "}
                <span className="font-semibold text-foreground">
                  {subjectName}
                </span>
                ? Hành động này không thể hoàn tác.
                {hasConstraints && (
                  <span className="block mt-2 text-yellow-600">
                    ⚠️ Môn học này đang có{" "}
                    {majorCount > 0 ? `${majorCount} ngành` : ""}
                    {majorCount > 0 && assignmentCount > 0 ? " và " : ""}
                    {assignmentCount > 0
                      ? `${assignmentCount} phân công`
                      : ""}{" "}
                    liên kết.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
              <AlertDialogCancel disabled={isLoading} className="mt-0">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? "Đang xóa..." : "Xóa môn học"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
