"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { MemberResponse } from "@/types/admin/member";
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

interface MemberDeleteDialogProps {
  member: MemberResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MemberDeleteDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: MemberDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const getTotalContributions = () => {
    return (
      member.statistics.fileCount +
      member.statistics.videoCount +
      member.statistics.flashcardCount +
      member.statistics.ttsCount +
      member.statistics.quizCount +
      member.statistics.messageCount +
      member.statistics.ragQueryCount
    );
  };

  const totalContributions = getTotalContributions();
  const isOwner = member.role === "owner";
  const canDelete = !isOwner && totalContributions === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsLoading(true);
    try {
      await api.delete(`/admin/community/members/${member.id}`);
      toast.success("Đã xóa thành viên thành công");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa thành viên";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwner) {
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
                  Không thể xóa chủ sở hữu
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Không thể xóa chủ sở hữu (owner) khỏi notebook. Chủ sở hữu
                  không thể bị xóa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
                <AlertDialogCancel className="mt-0">Đóng</AlertDialogCancel>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (totalContributions > 0) {
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
                  Không thể xóa thành viên
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Không thể xóa{" "}
                  <span className="font-semibold text-foreground">
                    {member.userFullName}
                  </span>{" "}
                  vì đã có{" "}
                  <span className="font-semibold text-foreground">
                    {totalContributions}
                  </span>{" "}
                  đóng góp. Vui lòng sử dụng chức năng chặn (block) để ẩn thành
                  viên này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
                <AlertDialogCancel className="mt-0">Đóng</AlertDialogCancel>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

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
                Xác nhận xóa thành viên
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold text-foreground">
                  {member.userFullName}
                </span>{" "}
                khỏi notebook này? Hành động này không thể hoàn tác và sẽ xóa
                vĩnh viễn thành viên khỏi notebook.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
              <AlertDialogCancel disabled={isLoading} className="mt-0">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-destructive text-white text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa thành viên"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

