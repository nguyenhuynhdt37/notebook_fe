"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Download,
  Trash2,
  RotateCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import api from "@/api/client/axios";

interface FileActionsProps {
  file: NotebookFileResponse;
  onRetrySuccess?: () => void;
}

export default function FileActions({
  file,
  onRetrySuccess,
}: FileActionsProps) {
  const router = useRouter();
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const handleDetail = () => {
    router.push(`/admin/notebooks/${file.notebook.id}/files/${file.id}/detail`);
  };

  const handleView = () => {
    router.push(
      `/admin/notebooks/${file.notebook.id}/files/${file.id}/preview`
    );
  };

  const handleDownload = () => {
    // TODO: Thêm logic tải file
  };

  const handleDelete = () => {
    // TODO: Thêm logic xóa file
  };

  const handleRetry = async () => {
    try {
      setRetryLoading(true);
      await api.put<NotebookFileResponse>(
        `/admin/notebooks/${file.notebook.id}/files/${file.id}/retry`
      );
      toast.success(
        `File "${file.originalFilename}" đã được đưa vào hàng đợi xử lý lại!`
      );
      setRetryDialogOpen(false);
      onRetrySuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as any).response?.data?.message || "Lỗi khi thử lại file"
          : "Lỗi không xác định";
      toast.error(errorMessage);
    } finally {
      setRetryLoading(false);
    }
  };

  const isFailed = file.status === "failed";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleDetail}>
            <Info className="size-4" />
            Chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleView}>
            <Eye className="size-4" />
            Xem file
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="size-4" />
            Tải xuống
          </DropdownMenuItem>
          {isFailed && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRetryDialogOpen(true)}>
                <RotateCw className="size-4" />
                Thử lại
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            variant="destructive"
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={retryDialogOpen} onOpenChange={setRetryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thử lại xử lý file</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thử lại xử lý file "{file.originalFilename}
              "?
              <br />
              <br />
              <span className="font-medium text-foreground">
                Lưu ý: Tất cả chunks cũ sẽ bị xóa và tạo lại từ đầu.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={retryLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetry} disabled={retryLoading}>
              {retryLoading ? "Đang xử lý..." : "Thử lại"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
