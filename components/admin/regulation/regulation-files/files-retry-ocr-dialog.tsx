"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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

interface FilesRetryOcrDialogProps {
  fileId: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}

export default function FilesRetryOcrDialog({
  fileId,
  fileName,
  open,
  onOpenChange,
  onRetry,
}: FilesRetryOcrDialogProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await api.post(`/admin/regulation/files/${fileId}/retry-ocr`);
      toast.success("Đã bắt đầu xử lý OCR lại");
      onRetry();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error?.response?.data?.message || "Không thể thử lại OCR";
      toast.error(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-5 text-primary" />
            Thử lại OCR
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Bạn có muốn thử lại quá trình OCR cho file này?</p>
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="text-xs">
                Hệ thống sẽ reset trạng thái và xử lý lại OCR + Embedding cho
                file. Quá trình này có thể mất vài phút.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRetrying}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleRetry} disabled={isRetrying}>
            <RotateCcw className="size-4 mr-2" />
            {isRetrying ? "Đang xử lý..." : "Thử lại"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
