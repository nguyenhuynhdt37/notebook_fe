"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MajorResponse } from "@/types/admin/major";
import MajorDeleteDialog from "./major-delete-dialog";
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

interface MajorTableProps {
  majors: MajorResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: () => void;
}

export default function MajorTable({
  majors,
  sortBy,
  sortDir,
  onSort,
  onDelete,
}: MajorTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<{
    id: string;
    name: string;
    subjectCount: number;
    studentCount: number;
  } | null>(null);

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
              <SortableHeader field="name" label="Tên ngành" />
              <TableHead className="h-12">Đơn vị</TableHead>
              <TableHead className="h-12">Trạng thái</TableHead>
              <TableHead className="h-12 text-center">Môn học</TableHead>
              <TableHead className="h-12 text-center">Sinh viên</TableHead>
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {majors.map((major) => (
              <TableRow key={major.id} className="hover:bg-accent/50">
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {major.code}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{major.name}</span>
                </TableCell>
                <TableCell>
                  {major.orgUnit ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">{major.orgUnit.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      major.isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {major.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {major.subjectCount}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {major.studentCount}
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
                        <Link href={`/admin/majors/${major.id}`}>
                          Xem chi tiết
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/majors/${major.id}/edit`}>
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedMajor({
                            id: major.id,
                            name: major.name,
                            subjectCount: major.subjectCount,
                            studentCount: major.studentCount,
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
      {selectedMajor && (
        <MajorDeleteDialog
          majorId={selectedMajor.id}
          majorName={selectedMajor.name}
          subjectCount={selectedMajor.subjectCount}
          studentCount={selectedMajor.studentCount}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
