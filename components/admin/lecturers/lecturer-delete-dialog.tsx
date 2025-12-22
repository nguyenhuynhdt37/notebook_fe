"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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

interface LecturerDeleteDialogProps {
  lecturerId: string;
  lecturerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function LecturerDeleteDialog({
  lecturerId,
  lecturerName,
  open,
  onOpenChange,
  onDelete,
}: LecturerDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/lecturer/${lecturerId}`);
      toast.success("Xóa giảng viên thành công");
      onOpenChange(false);
      onDelete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa giảng viên");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa giảng viên</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa giảng viên{" "}
            <span className="font-medium text-foreground">
              &quot;{lecturerName}&quot;
            </span>
            ? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
