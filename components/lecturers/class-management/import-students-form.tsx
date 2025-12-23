"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import FileUploadZone from "./file-upload-zone";

interface ImportStudentsFormProps {
  onPreview: (data: any, formData: any) => void;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
}

export default function ImportStudentsForm({ onPreview }: ImportStudentsFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for classes - in real app, fetch from API
  useEffect(() => {
    const mockClasses: ClassInfo[] = [
      { id: "class-1", name: "Java Cơ Bản - Lớp A", subject: "Lập trình Java", studentCount: 25 },
      { id: "class-2", name: "Web Development - Lớp B", subject: "Phát triển Web", studentCount: 30 },
      { id: "class-3", name: "Database - Lớp C", subject: "Cơ sở dữ liệu", studentCount: 28 },
    ];
    setClasses(mockClasses);
  }, []);

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

  const handleClassSelect = (value: string) => {
    setClassId(value);
    const selected = classes.find(c => c.id === value);
    setSelectedClass(selected || null);
  };

  const handlePreview = async () => {
    if (!file || !classId) {
      toast.error("Vui lòng chọn lớp và file Excel");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('classId', classId);

      const response = await api.post('/api/lecturer/class-management/preview-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-User-Id': 'lecturer-id', // TODO: Get from auth
        },
      });

      onPreview(response.data, {
        file,
        classId,
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
      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chọn lớp học phần</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class">Lớp học phần *</Label>
            <Select value={classId} onValueChange={handleClassSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp học phần" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{cls.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {cls.studentCount} SV
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Class Info */}
          {selectedClass && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedClass.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClass.subject} • {selectedClass.studentCount} sinh viên hiện tại
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={() => setFile(null)}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          onClick={handlePreview}
          disabled={!file || !classId || isLoading}
          size="lg"
        >
          {isLoading ? "Đang xử lý..." : "Xem trước Excel"}
        </Button>
      </div>
    </div>
  );
}