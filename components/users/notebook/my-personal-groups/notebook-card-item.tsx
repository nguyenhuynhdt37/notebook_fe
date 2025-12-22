"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Files,
  Calendar,
  Lock,
  MoreVertical,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { PersonalNotebookResponse } from "@/types/user/notebook";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface NotebookCardItemProps {
  notebook: PersonalNotebookResponse;
  onDeleted?: () => void;
}

export default function NotebookCardItem({
  notebook,
  onDeleted,
}: NotebookCardItemProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/user/personal-notebooks/${notebook.id}`);
      toast.success("Đã xóa notebook thành công");
      onDeleted?.();
    } catch (error: any) {
      console.error("Error deleting notebook:", error);
      const message = error.response?.data?.message || "Không thể xóa notebook";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/notebook/${notebook.id}/workspace`);
  };

  return (
    <>
      <Card
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group p-0 border-0"
        onClick={handleCardClick}
        aria-label={`Mở notebook ${notebook.title}`}
      >
        <div className="relative w-full aspect-square overflow-hidden">
          {notebook.thumbnailUrl ? (
            <>
              <img
                src={notebook.thumbnailUrl}
                alt={notebook.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:24px_24px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          )}

          {/* Badge */}
          <div className="absolute top-2 left-2 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              <Lock className="size-3" />
              Riêng tư
            </span>
          </div>

          {/* Menu */}
          <div className="absolute top-2 right-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleCardClick}>
                  <ExternalLink className="size-4 mr-2" />
                  Mở notebook
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="size-4 mr-2" />
                  Xóa notebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <h3 className="text-base font-semibold line-clamp-2 mb-2 drop-shadow-lg">
              {notebook.title}
            </h3>
            {notebook.description && (
              <p className="text-xs text-white/90 line-clamp-2 drop-shadow-md mb-3">
                {notebook.description}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20">
              <div className="flex items-center gap-1 text-xs text-white/90">
                <Files className="size-3.5" />
                <span className="font-medium">{notebook.fileCount} files</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/90">
                <Calendar className="size-3.5" />
                <span>{formatDate(notebook.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa notebook &quot;{notebook.title}&quot;? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
