"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api/client/axios";
import FileUploadZone from "./file-upload-zone";

interface CreateClassFormProps {
  onPreview: (data: any, formData: any) => void;
}

export default function CreateClassForm({ onPreview }: CreateClassFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teachingAssignmentId, setTeachingAssignmentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx')) {
      toast.error("Chỉ hỗ trợ file Excel (.xlsx)");
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast.error("File không được vượt quá 10MB");
      return;
    }

    setFile(selectedFile);
    toast.success("File đã được chọn");
  };

  const handlePreview = async () => {
    if (!file || !className.trim() || !subjectId || !teachingAssignmentId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await api.post('/api/lecturer/class-management/preview-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-User-Id': 'lecturer-id', // TODO: Get from auth
        },
      });

      onPreview(response.data, {
        file,
        className,
        subjectId,
        teachingAssignmentId,
      });
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.response?.data?.message || "Không thể xem trước file Excel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={() => setFile(null)}
          />
        </CardContent>
      </Card>

      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin lớp học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Tên lớp học phần *</Label>
            <Input
              id="className"
              placeholder="Nhập tên lớp học phần"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Môn học *</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java-basic">Lập trình Java cơ bản</SelectItem>
                <SelectItem value="web-dev">Phát triển Web</SelectItem>
                <SelectItem value="database">Cơ sở dữ liệu</SelectItem>
                <SelectItem value="algorithms">Thuật toán và cấu trúc dữ liệu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment">Phân công giảng dạy *</Label>
            <Select value={teachingAssignmentId} onValueChange={setTeachingAssignmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phân công giảng dạy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment-1">Học kỳ 1 - 2024-2025</SelectItem>
                <SelectItem value="assignment-2">Học kỳ 2 - 2024-2025</SelectItem>
                <SelectItem value="assignment-3">Học kỳ hè - 2024-2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          onClick={handlePreview}
          disabled={!file || !className.trim() || !subjectId || !teachingAssignmentId || isLoading}
          size="lg"
        >
          {isLoading ? "Đang xử lý..." : "Xem trước Excel"}
        </Button>
      </div>
    </div>
  );
}