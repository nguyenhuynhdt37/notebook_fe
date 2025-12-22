"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermResponse } from "@/types/admin/term";
import TermDeleteDialog from "./term-delete-dialog";
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

interface TermTableProps {
  terms: TermResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: () => void;
}

export default function TermTable({
  terms,
  sortBy,
  sortDir,
  onSort,
  onDelete,
}: TermTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<{
    id: string;
    name: string;
    totalAssignments: number;
  } | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHeader field="code" label="Mã" />
              <SortableHeader field="name" label="Tên học kỳ" />
              <SortableHeader field="startDate" label="Bắt đầu" />
              <TableHead className="h-12">Kết thúc</TableHead>
              <TableHead className="h-12">Trạng thái</TableHead>
              <TableHead className="h-12 text-center">Phân công</TableHead>
              <SortableHeader field="createdAt" label="Ngày tạo" />
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term.id} className="hover:bg-accent/50">
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {term.code}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{term.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(term.startDate)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(term.endDate)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      term.isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {term.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {term.totalAssignments}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(term.createdAt)}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/terms/${term.id}`}>
                          Xem chi tiết
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/terms/${term.id}/edit`}>
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedTerm({
                            id: term.id,
                            name: term.name,
                            totalAssignments: term.totalAssignments,
                          });
                          setDeleteDialogOpen(true);
                        }}
                      >
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
      {selectedTerm && (
        <TermDeleteDialog
          termId={selectedTerm.id}
          termName={selectedTerm.name}
          totalAssignments={selectedTerm.totalAssignments}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
