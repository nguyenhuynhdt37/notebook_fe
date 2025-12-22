"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectResponse } from "@/types/admin/subject";
import SubjectDeleteDialog from "./subject-delete-dialog";
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

interface SubjectTableProps {
  subjects: SubjectResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: () => void;
}

export default function SubjectTable({
  subjects,
  sortBy,
  sortDir,
  onSort,
  onDelete,
}: SubjectTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
    majorCount: number;
    assignmentCount: number;
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
              <SortableHeader field="name" label="Tên môn học" />
              <SortableHeader field="credit" label="Tín chỉ" />
              <TableHead className="h-12">Trạng thái</TableHead>
              <TableHead className="h-12 text-center">Số ngành</TableHead>
              <TableHead className="h-12 text-center">Phân công</TableHead>
              <TableHead className="h-12 text-center">Sinh viên</TableHead>
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id} className="hover:bg-accent/50">
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {subject.code}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{subject.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{subject.credit ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subject.isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {subject.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {subject.majorCount}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {subject.assignmentCount}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {subject.studentCount}
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
                        <Link href={`/admin/subjects/${subject.id}`}>
                          Xem chi tiết
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/subjects/${subject.id}/edit`}>
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedSubject({
                            id: subject.id,
                            name: subject.name,
                            majorCount: subject.majorCount,
                            assignmentCount: subject.assignmentCount,
                            studentCount: subject.studentCount,
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
      {selectedSubject && (
        <SubjectDeleteDialog
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
          majorCount={selectedSubject.majorCount}
          assignmentCount={selectedSubject.assignmentCount}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
