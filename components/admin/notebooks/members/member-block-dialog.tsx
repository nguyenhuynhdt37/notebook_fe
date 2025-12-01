"use client";

import { useState } from "react";
import { Ban, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
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

interface MemberBlockDialogProps {
  member: MemberResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MemberBlockDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: MemberBlockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const isOwner = member.role === "owner";
  const isBlocked = member.status === "blocked";

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

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      await api.put(`/admin/community/members/${member.id}/block`);
      toast.success(`Đã chặn "${member.userFullName}" thành công`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể chặn thành viên";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async () => {
    setIsLoading(true);
    try {
      await api.put(`/admin/community/members/${member.id}/unblock`);
      toast.success(`Đã mở chặn "${member.userFullName}" thành công`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể mở chặn thành viên";
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
                  Không thể chặn chủ sở hữu
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Không thể chặn chủ sở hữu (owner) khỏi notebook. Chủ sở hữu
                  không thể bị chặn.
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

  if (isBlocked) {
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
                  Mở chặn thành viên
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Bạn có chắc chắn muốn mở chặn{" "}
                  <span className="font-semibold text-foreground">
                    {member.userFullName}
                  </span>
                  ? Họ sẽ có thể truy cập lại notebook này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
                <AlertDialogCancel disabled={isLoading} className="mt-0">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnblock}
                  disabled={isLoading}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang mở chặn...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 size-4" />
                      Mở chặn
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Ban className="size-6 text-destructive" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-xl font-semibold">
                Xác nhận chặn thành viên
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn chặn{" "}
                <span className="font-semibold text-foreground">
                  {member.userFullName}
                </span>
                ? Khi bị chặn, họ sẽ không thể truy cập notebook nữa.
                {totalContributions > 0 && (
                  <>
                    <br />
                    <br />
                    <span className="font-semibold text-foreground">
                      Lưu ý:
                    </span>{" "}
                    Thành viên này đã có{" "}
                    <span className="font-semibold text-foreground">
                      {totalContributions}
                    </span>{" "}
                    đóng góp. Tất cả đóng góp sẽ được giữ lại nhưng họ không
                    thể truy cập notebook nữa.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
              <AlertDialogCancel disabled={isLoading} className="mt-0">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBlock}
                disabled={isLoading}
                className="bg-destructive text-white text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang chặn...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 size-4" />
                    Chặn thành viên
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

