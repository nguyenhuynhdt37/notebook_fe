"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "@/api/client/axios";
import { toast } from "sonner";

interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  termName: string;
  createdAt: string;
}

interface StudentListResponse {
  items: Student[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

interface StudentListViewProps {
  classId: string;
}

export default function StudentListView({ classId }: StudentListViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({
    page: 0,
    size: 15,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStudents = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response = await api.get<StudentListResponse>(
        `/lecturer/classes/${classId}/members?page=${page}&size=15`
      );
      setStudents(response.data.items);
      setMeta(response.data.meta);
    } catch (error: any) {
      console.error("Error loading students:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách sinh viên"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadStudents(0);
    }
  }, [classId]);

  const handlePageChange = (newPage: number) => {
    loadStudents(newPage);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Danh sách sinh viên ({meta.total})</span>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Mã SV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Lớp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    {isLoading ? "Đang tải..." : "Không có sinh viên"}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{meta.page * meta.size + index + 1}</TableCell>
                    <TableCell className="font-mono">
                      {student.studentCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.fullName}
                    </TableCell>
                    <TableCell>{formatDate(student.dob)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.classCode}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Trang {meta.page + 1} / {meta.totalPages} ({meta.total} sinh viên)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 0 || isLoading}
              >
                <ChevronLeft className="size-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages - 1 || isLoading}
              >
                Sau
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
