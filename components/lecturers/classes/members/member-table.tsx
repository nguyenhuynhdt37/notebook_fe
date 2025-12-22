"use client";

import { GraduationCap, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClassStudent {
  id: string;
  studentCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  classCode: string;
  createdAt: string;
}

interface MemberTableProps {
  students: ClassStudent[];
  page: number;
  pageSize: number;
}

export default function MemberTable({ students, page, pageSize }: MemberTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Sinh viên</TableHead>
            <TableHead className="hidden sm:table-cell">Mã SV</TableHead>
            <TableHead className="hidden md:table-cell">Ngày sinh</TableHead>
            <TableHead className="hidden lg:table-cell">Lớp HP</TableHead>
            <TableHead className="text-right">Ngày vào lớp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id} className="hover:bg-muted/30">
              <TableCell className="text-muted-foreground">
                {page * pageSize + index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {student.firstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {student.studentCode}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{student.studentCode}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span className="text-sm">
                    {student.dob
                      ? new Date(student.dob).toLocaleDateString("vi-VN")
                      : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                  {student.classCode}
                </code>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {new Date(student.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
