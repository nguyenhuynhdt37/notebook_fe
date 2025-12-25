"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/api/client/axios";
import FileUploadZone from "./file-upload-zone";
import LecturerSubjectSelect from "@/components/lecturers/shared/lecturer-subject-select";
import LecturerAssignmentSelect from "@/components/lecturers/shared/lecturer-assignment-select";
import { useUserStore } from "@/stores/user";

interface CreateClassFormProps {
  onPreview: (data: any, formData: any) => void;
}

export default function CreateClassForm({ onPreview }: CreateClassFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teachingAssignmentId, setTeachingAssignmentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const user = useUserStore((state) => state.user);

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

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await api.post('/api/lecturer/class-management/preview-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-User-Id': user.id.toString(),
        },
      });

      // API trả về { success, message, data, error }
      if (response.data.success && response.data.data) {
        onPreview(response.data.data, {
          file,
          className,
          subjectId,
          teachingAssignmentId,
        });
      } else {
        toast.error(response.data.message || "Không thể xem trước file Excel");
      }
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
            <LecturerSubjectSelect
              value={subjectId || null}
              onChange={(value) => setSubjectId(value || "")}
              placeholder="Chọn môn học"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment">Phân công giảng dạy *</Label>
            <LecturerAssignmentSelect
              value={teachingAssignmentId || null}
              onChange={(value) => setTeachingAssignmentId(value || "")}
              placeholder="Chọn phân công giảng dạy"
            />
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