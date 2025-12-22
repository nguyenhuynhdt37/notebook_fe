"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LecturerResponse,
  ACADEMIC_DEGREE_LABELS,
} from "@/types/admin/lecturer";
import LecturerDeleteDialog from "./lecturer-delete-dialog";
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

interface LecturerTableProps {
  lecturers: LecturerResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: () => void;
}

export default function LecturerTable({
  lecturers,
  sortBy,
  sortDir,
  onSort,
  onDelete,
}: LecturerTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(-2)
      .toUpperCase();
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
              <SortableHeader field="fullName" label="Giảng viên" />
              <TableHead className="h-12">Mã GV</TableHead>
              <TableHead className="h-12">Học vị</TableHead>
              <TableHead className="h-12">Đơn vị</TableHead>
              <SortableHeader field="createdAt" label="Ngày tạo" />
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecturers.map((lecturer) => (
              <TableRow key={lecturer.id} className="hover:bg-accent/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={lecturer.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(lecturer.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{lecturer.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {lecturer.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {lecturer.lecturerCode || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  {lecturer.academicDegree ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                      {ACADEMIC_DEGREE_LABELS[lecturer.academicDegree] ||
                        lecturer.academicDegree}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {lecturer.orgUnit ? (
                    <div className="flex flex-col">
                      <span className="text-sm">{lecturer.orgUnit.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lecturer.orgUnit.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(lecturer.createdAt)}
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
                        <Link href={`/admin/lecturers/${lecturer.id}/edit`}>
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedLecturer({
                            id: lecturer.id,
                            name: lecturer.fullName,
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
      {selectedLecturer && (
        <LecturerDeleteDialog
          lecturerId={selectedLecturer.id}
          lecturerName={selectedLecturer.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
