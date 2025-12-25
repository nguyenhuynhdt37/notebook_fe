"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, List } from "lucide-react";

interface ImportResultProps {
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
  type?: "create" | "import"; // Thêm type để phân biệt luồng
  onStartOver: () => void;
  onViewClasses: () => void;
}

export default function ImportResult({ data, type = "create", onStartOver, onViewClasses }: ImportResultProps) {
  const hasIssues = data.duplicateCount > 0 || data.errorCount > 0;
  
  const isCreateFlow = type === "create";
  const title = isCreateFlow ? "Tạo lớp thành công!" : "Import sinh viên thành công!";
  const description = isCreateFlow 
    ? `Lớp học phần đã được tạo và import ${data.successCount} sinh viên thành công`
    : `Đã import ${data.successCount} sinh viên vào lớp thành công`;
  const actionText = isCreateFlow ? "Tạo lớp khác" : "Import lớp khác";

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                {title}
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{data.successCount}</div>
                <div className="text-sm text-muted-foreground">Thành công</div>
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

      {/* Duplicates */}
      {data.duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Sinh viên trùng lặp ({data.duplicates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.duplicates.map((duplicate, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {duplicate.studentCode} - {duplicate.fullName}
                    </p>
                    <p className="text-xs text-yellow-600">{duplicate.reason}</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Dòng {duplicate.rowNumber}
                  </Badge>
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
            <CardTitle className="text-lg text-red-600 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Lỗi import ({data.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.errors.map((error, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {error.studentCode} - {error.fullName}
                    </p>
                    <p className="text-xs text-red-600">{error.reason}</p>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Dòng {error.rowNumber}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onStartOver}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {actionText}
        </Button>
        <Button onClick={onViewClasses}>
          <List className="h-4 w-4 mr-2" />
          Xem danh sách lớp
        </Button>
      </div>
    </div>
  );
}