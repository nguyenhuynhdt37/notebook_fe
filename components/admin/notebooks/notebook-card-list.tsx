"use client";

import { useRouter } from "next/navigation";
import {
  MoreVertical,
  FileText,
  Users,
  Calendar,
  Globe,
  Lock,
} from "lucide-react";
import { NotebookAdminResponse } from "@/types/admin/notebook";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NotebookCardListProps {
  notebooks: NotebookAdminResponse[];
  onDelete: (notebook: NotebookAdminResponse) => void;
}

export default function NotebookCardList({
  notebooks,
  onDelete,
}: NotebookCardListProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "community":
        return "Cộng đồng";
      case "private_group":
        return "Nhóm riêng";
      case "personal":
        return "Cá nhân";
      default:
        return type;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    return visibility === "public" ? "Công khai" : "Riêng tư";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {notebooks.map((notebook) => (
        <Card
          key={notebook.id}
          className="overflow-hidden hover:shadow-lg transition-all duration-300 group p-0 border-0"
        >
          <div className="relative w-full aspect-square overflow-hidden bg-muted">
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
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <FileText className="size-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 items-start">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                {notebook.visibility === "public" ? (
                  <Globe className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                {getVisibilityLabel(notebook.visibility)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                {getTypeLabel(notebook.type)}
              </span>
            </div>
            <div className="absolute top-2 right-2 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/notebooks/${notebook.id}`)
                    }
                  >
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/notebooks/${notebook.id}/members`)
                    }
                  >
                    Thành viên
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/admin/notebooks/pending?notebookId=${notebook.id}`
                      )
                    }
                  >
                    Yêu cầu tham gia
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/notebooks/${notebook.id}/edit`)
                    }
                  >
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(notebook)}
                  >
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                  <Users className="size-3.5" />
                  <span className="font-medium">{notebook.memberCount}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/90">
                  <Calendar className="size-3.5" />
                  <span>{formatDate(notebook.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
