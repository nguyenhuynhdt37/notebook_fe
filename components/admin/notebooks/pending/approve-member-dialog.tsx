"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { PendingRequestResponse } from "@/types/admin/pending-request";
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

interface ApproveMemberDialogProps {
  request: PendingRequestResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ApproveMemberDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: ApproveMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!request) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await api.put(`/admin/community/members/${request.id}/approve`);
      toast.success(`Đã phê duyệt "${request.userFullName}" thành công`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Không thể phê duyệt thành viên. Vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="size-6 text-foreground" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-xl font-semibold">
                Phê duyệt yêu cầu
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn phê duyệt yêu cầu tham gia của{" "}
                <span className="font-semibold text-foreground">
                  {request.userFullName}
                </span>{" "}
                vào notebook{" "}
                <span className="font-semibold text-foreground">
                  {request.notebookTitle}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
              <AlertDialogCancel disabled={isLoading} className="mt-0">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang phê duyệt...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 size-4" />
                    Phê duyệt
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
