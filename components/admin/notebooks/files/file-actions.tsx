"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Download, Trash2 } from "lucide-react";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FileActionsProps {
  file: NotebookFileResponse;
}

export default function FileActions({ file }: FileActionsProps) {
  const router = useRouter();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="size-4" />
          Tải xuống
        </DropdownMenuItem>
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
  );
}

