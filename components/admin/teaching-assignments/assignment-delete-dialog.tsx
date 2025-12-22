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

interface AssignmentDeleteDialogProps {
  assignmentId: string;
  subjectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function AssignmentDeleteDialog({
  assignmentId,
  subjectName,
  open,
  onOpenChange,
  onDelete,
}: AssignmentDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/teaching-assignments/${assignmentId}`);
      toast.success("Xóa phân công thành công");
      onOpenChange(false);
      onDelete();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể xóa phân công");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa phân công</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phân công môn{" "}
            <span className="font-medium text-foreground">
              &quot;{subjectName}&quot;
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
