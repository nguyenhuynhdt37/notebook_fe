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

interface OrgUnitDeleteDialogProps {
  orgUnitId: string;
  orgUnitName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function OrgUnitDeleteDialog({
  orgUnitId,
  orgUnitName,
  open,
  onOpenChange,
  onDelete,
}: OrgUnitDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/org-units/${orgUnitId}`);
      toast.success("Xóa đơn vị tổ chức thành công");
      onOpenChange(false);
      onDelete();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể xóa đơn vị tổ chức"
      );
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
                Xác nhận xóa đơn vị tổ chức
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn xóa đơn vị{" "}
                <span className="font-semibold text-foreground">
                  {orgUnitName}
                </span>
                ? Hành động này không thể hoàn tác.
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
                {isLoading ? "Đang xóa..." : "Xóa đơn vị"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
