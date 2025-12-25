"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { useUserStore } from "@/stores/user";

interface PreviewImportModalProps {
  data: {
    totalRows: number;
    successCount: number;
    duplicateCount: number;
    errorCount: number;
    duplicates: Array<{
      rowNumber: number;
      studentCode: string;
      fullName: string;
      reason: string;
    }>;
    errors: Array<{
      rowNumber: number;
      studentCode: string;
      fullName: string;
      reason: string;
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
  const user = useUserStore((state) => state.user);

  const handleImportStudents = async () => {
    if (!formData.file) {
      toast.error("Không tìm thấy file Excel");
      return;
    }

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
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
          'X-User-Id': user.id.toString(),
        },
      });

      // API trả về { success, message, data, error }
      if (response.data.success && response.data.data) {
        onConfirm(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể import sinh viên");
      }
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
                <div className="text-2xl font-bold text-green-600">{data.successCount}</div>
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
                <div className="text-2xl font-bold text-yellow-600">{data.duplicateCount}</div>
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
                <div className="text-2xl font-bold text-red-600">{data.errorCount}</div>
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

      {/* Preview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tóm tắt dữ liệu sẽ import</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">
                      {data.successCount} sinh viên hợp lệ
                    </p>
                    <p className="text-sm text-green-600">Sẽ được import vào lớp</p>
                  </div>
                </div>
              </div>
              
              {data.duplicateCount > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-400">
                        {data.duplicateCount} sinh viên trùng lặp
                      </p>
                      <p className="text-sm text-yellow-600">Đã có trong lớp</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {data.successCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p>Không có sinh viên hợp lệ để import</p>
                <p className="text-sm">Vui lòng kiểm tra lại file Excel</p>
              </div>
            )}
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
          disabled={isLoading || data.successCount === 0}
          size="lg"
        >
          {isLoading ? "Đang import..." : `Import ${data.successCount} sinh viên`}
        </Button>
      </div>
    </div>
  );
}