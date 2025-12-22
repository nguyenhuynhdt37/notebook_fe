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

interface TermDeleteDialogProps {
  termId: string;
  termName: string;
  totalAssignments: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function TermDeleteDialog({
  termId,
  termName,
  totalAssignments,
  open,
  onOpenChange,
  onDelete,
}: TermDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/term/${termId}`);
      toast.success("Xóa học kỳ thành công");
      onOpenChange(false);
      onDelete();
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 409) {
        toast.error("Không thể xóa học kỳ", {
          description: `Học kỳ "${termName}" đang có ${totalAssignments} phân công giảng dạy. Vui lòng xóa các phân công trước.`,
        });
      } else {
        toast.error(err.response?.data?.message || "Không thể xóa học kỳ");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                Xác nhận xóa học kỳ
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn xóa học kỳ{" "}
                <span className="font-semibold text-foreground">
                  {termName}
                </span>
                ? Hành động này không thể hoàn tác.
                {totalAssignments > 0 && (
                  <span className="block mt-2 text-yellow-600">
                    ⚠️ Học kỳ này đang có {totalAssignments} phân công giảng
                    dạy.
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
                {isLoading ? "Đang xóa..." : "Xóa học kỳ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
