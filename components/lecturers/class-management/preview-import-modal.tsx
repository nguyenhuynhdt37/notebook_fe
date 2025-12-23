"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";

interface PreviewImportModalProps {
  data: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    duplicateRows: number;
    errors: Array<{
      rowNumber: number;
      studentCode: string;
      fullName: string;
      reason: string;
    }>;
    duplicates: Array<{
      rowNumber: number;
      studentCode: string;
      fullName: string;
      reason: string;
    }>;
    students: Array<{
      studentCode: string;
      fullName: string;
      dateOfBirth: string;
    }>;
  };
  formData: {
    file: File | null;
    classId: string;
  };
  onBack: () => void;
  onConfirm: (result: any) => void;
}

export default function PreviewImportModal({ data, formData, onBack, onConfirm }: PreviewImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleImportStudents = async () => {
    if (!formData.file) {
      toast.error("Không tìm thấy file Excel");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('excelFile', formData.file);
      submitData.append('classId', formData.classId);

      const response = await api.post('/api/lecturer/class-management/import-students', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-User-Id': 'lecturer-id', // TODO: Get from auth
        },
      });

      onConfirm(response.data);
    } catch (error: any) {
      console.error('Import students error:', error);
      toast.error(error.response?.data?.message || "Không thể import sinh viên");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{data.validRows}</div>
                <div className="text-sm text-muted-foreground">Hợp lệ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{data.duplicateRows}</div>
                <div className="text-sm text-muted-foreground">Trùng lặp</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{data.errorRows}</div>
                <div className="text-sm text-muted-foreground">Lỗi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.totalRows}</div>
                <div className="text-sm text-muted-foreground">Tổng số</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách sinh viên sẽ import</CardTitle>
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
                  <TableHead className="w-24">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.slice(0, 10).map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono">{student.studentCode}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.dateOfBirth}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hợp lệ
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {data.students.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      ... và {data.students.length - 10} sinh viên khác
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Duplicates */}
      {data.duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600">Sinh viên đã có trong lớp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.duplicates.map((duplicate, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Dòng {duplicate.rowNumber}: {duplicate.studentCode} - {duplicate.fullName}
                    </p>
                    <p className="text-xs text-yellow-600">{duplicate.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {data.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danh sách lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.errors.map((error, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Dòng {error.rowNumber}: {error.studentCode} - {error.fullName}
                    </p>
                    <p className="text-xs text-red-600">{error.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại chỉnh sửa
        </Button>
        <Button
          onClick={handleImportStudents}
          disabled={isLoading || data.validRows === 0}
          size="lg"
        >
          {isLoading ? "Đang import..." : `Import ${data.validRows} sinh viên`}
        </Button>
      </div>
    </div>
  );
}