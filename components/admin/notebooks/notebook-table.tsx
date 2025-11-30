"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  FileText,
  Users,
} from "lucide-react";
import { NotebookAdminResponse } from "@/types/admin/notebook";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NotebookTableProps {
  notebooks: NotebookAdminResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

export default function NotebookTable({
  notebooks,
  sortBy,
  sortDir,
  onSort,
}: NotebookTableProps) {
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

  const SortableHeader = ({
    field,
    label,
  }: {
    field: string;
    label: string;
  }) => {
    const isActive = sortBy === field;
    return (
      <TableHead className="h-12">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 font-semibold hover:bg-accent"
          onClick={() => onSort(field)}
        >
          {label}
          {isActive ? (
            sortDir === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowDown className="ml-2 size-3.5" />
            )
          ) : (
            <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground opacity-50" />
          )}
        </Button>
      </TableHead>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">Ảnh</TableHead>
            <SortableHeader field="title" label="Tiêu đề" />
            <TableHead>Mô tả</TableHead>
            <SortableHeader field="type" label="Loại" />
            <SortableHeader field="visibility" label="Hiển thị" />
            <TableHead className="text-center">Thành viên</TableHead>
            <SortableHeader field="createdAt" label="Ngày tạo" />
            <TableHead className="w-[60px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notebooks.map((notebook) => (
            <TableRow key={notebook.id} className="hover:bg-accent/50">
              <TableCell>
                {notebook.thumbnailUrl ? (
                  <img
                    src={notebook.thumbnailUrl}
                    alt={notebook.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="font-medium">{notebook.title}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm line-clamp-1">
                  {notebook.description || "Không có mô tả"}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {getTypeLabel(notebook.type)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {getVisibilityLabel(notebook.visibility)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {notebook.memberCount}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {formatDate(notebook.createdAt)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        router.push(`/admin/notebooks/${notebook.id}/edit`)
                      }
                    >
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
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
