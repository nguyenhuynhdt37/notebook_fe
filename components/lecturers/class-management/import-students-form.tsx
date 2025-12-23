"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import FileUploadZone from "./file-upload-zone";
import { LecturerClassResponse, LecturerClassPagedResponse } from "@/types/lecturer/reference";

interface ImportStudentsFormProps {
  onPreview: (data: any, formData: any) => void;
}

export default function ImportStudentsForm({ onPreview }: ImportStudentsFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<LecturerClassResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<LecturerClassResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await api.get<LecturerClassPagedResponse>('/lecturer/classes?size=100');
        if (response.data?.items) {
          // Filter only active classes
          const activeClasses = response.data.items.filter(cls => cls.isActive);
          setClasses(activeClasses);
        }
      } catch (error: any) {
        console.error('Error fetching classes:', error);
        toast.error("Không thể tải danh sách lớp học");
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
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
            <Select value={classId} onValueChange={handleClassSelect} disabled={isLoadingClasses}>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoadingClasses ? "Đang tải danh sách lớp..." : "Chọn lớp học phần"
                } />
              </SelectTrigger>
              <SelectContent>
                {isLoadingClasses ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Đang tải...</span>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Không có lớp học phần nào
                  </div>
                ) : (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{cls.classCode}</span>
                          <span className="text-xs text-muted-foreground">{cls.subjectName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {cls.studentCount} SV
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Class Info */}
          {selectedClass && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedClass.classCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedClass.subjectName} • {selectedClass.termName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{selectedClass.studentCount} sinh viên</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedClass.room} • {selectedClass.periods}
                      </p>
                    </div>
                  </div>
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