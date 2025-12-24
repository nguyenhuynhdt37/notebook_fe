"use client";

import {
  ArrowUpDown,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { RegulationFileResponse } from "@/types/admin/regulation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilesTableProps {
  files: RegulationFileResponse[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: (file: RegulationFileResponse) => void;
  onRename: (file: RegulationFileResponse) => void;
  onRetryOcr: (file: RegulationFileResponse) => void;
}

export default function FilesTable({
  files,
  sortBy,
  sortDirection,
  onSort,
  onDelete,
  onRename,
  onRetryOcr,
}: FilesTableProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "Chờ xử lý", variant: "secondary" as const },
      processing: { label: "Đang xử lý", variant: "default" as const },
      done: { label: "Hoàn thành", variant: "default" as const },
      failed: { label: "Thất bại", variant: "destructive" as const },
    };
    const { label, variant } =
      config[status as keyof typeof config] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="-ml-3"
    >
      {label}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );

  if (files.length === 0) {
    return (
      <div className="border rounded-lg py-12 text-center text-muted-foreground">
        Không có file nào
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="originalFilename" label="Tên file" />
            </TableHead>
            <TableHead>
              <SortButton field="fileSize" label="Kích thước" />
            </TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>OCR / Embedding</TableHead>
            <TableHead>Chunk Settings</TableHead>
            <TableHead>
              <SortButton field="createdAt" label="Ngày tải" />
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.originalFilename}</TableCell>
              <TableCell>{formatFileSize(file.fileSize)}</TableCell>
              <TableCell>{getStatusBadge(file.status)}</TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {file.ocrDone ? "✓" : "✗"} / {file.embeddingDone ? "✓" : "✗"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {file.chunkSize} / {file.chunkOverlap}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(file.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Mở menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRename(file)}
                      className="cursor-pointer"
                    >
                      <Pencil className="size-4 mr-2" />
                      Đổi tên
                    </DropdownMenuItem>
                    {(file.status === "failed" || !file.ocrDone) && (
                      <DropdownMenuItem
                        onClick={() => onRetryOcr(file)}
                        className="cursor-pointer"
                      >
                        <RotateCcw className="size-4 mr-2" />
                        Thử lại OCR
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(file)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
