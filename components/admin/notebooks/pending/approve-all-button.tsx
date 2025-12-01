"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
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

interface ApproveAllButtonProps {
  notebookId?: string;
  pendingCount: number;
  onSuccess: () => void;
}

export default function ApproveAllButton({
  notebookId,
  pendingCount,
  onSuccess,
}: ApproveAllButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApproveAll = async () => {
    setIsLoading(true);
    try {
      let url: string;
      if (notebookId) {
        url = `/admin/community/${notebookId}/pending-requests/approve-all`;
      } else {
        url = `/admin/community/pending-requests/approve-all`;
      }

      const response = await api.post<{ approvedCount: number }>(url);
      toast.success(
        `Đã phê duyệt thành công ${response.data.approvedCount} yêu cầu!`
      );
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Không thể phê duyệt tất cả. Vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isLoading || pendingCount === 0}
        className="h-9"
      >
        <CheckCircle2 className="size-4 mr-2" />
        {isLoading ? "Đang phê duyệt..." : `Phê duyệt tất cả (${pendingCount})`}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
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
                  Phê duyệt tất cả
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Bạn có chắc chắn muốn phê duyệt tất cả{" "}
                  <span className="font-semibold text-foreground">
                    {pendingCount}
                  </span>{" "}
                  yêu cầu pending
                  {notebookId ? " của notebook này" : ""}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
                <AlertDialogCancel disabled={isLoading} className="mt-0">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApproveAll}
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
                      Phê duyệt tất cả
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
