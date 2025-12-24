"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, CheckCircle, Mail, User, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerClassResponse, LecturerClassPagedResponse } from "@/types/lecturer/reference";

interface ManualAddStudentFlowProps {
  onBack: () => void;
}

interface AddStudentRequest {
  classId: string;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
}

interface AddStudentResponse {
  success: boolean;
  message: string;
  userCreated: boolean;
  emailSent: boolean;
  studentCode: string;
  fullName: string;
  email: string;
}

export default function ManualAddStudentFlow({ onBack }: ManualAddStudentFlowProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<LecturerClassResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<LecturerClassResponse | null>(null);
  const [result, setResult] = useState<AddStudentResponse | null>(null);
  
  const [formData, setFormData] = useState<AddStudentRequest>({
    classId: "",
    studentCode: "",
    fullName: "",
    dateOfBirth: "",
    email: "",
  });

  // Fetch classes on component mount
  React.useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await api.get<LecturerClassPagedResponse>('/lecturer/classes?size=100');
        if (response.data?.items) {
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

  const handleInputChange = (field: keyof AddStudentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClassSelect = (classId: string) => {
    handleInputChange("classId", classId);
    const selected = classes.find(c => c.id === classId);
    setSelectedClass(selected || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classId || !formData.studentCode.trim() || !formData.fullName.trim() || 
        !formData.dateOfBirth || !formData.email.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<AddStudentResponse>('/api/lecturer/manual-class-management/add-student', formData);

      setResult(response.data);
      if (response.data.success) {
        setStep("success");
        toast.success("Thêm sinh viên thành công!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.message || "Không thể thêm sinh viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("form");
    setResult(null);
    setFormData({
      classId: "",
      studentCode: "",
      fullName: "",
      dateOfBirth: "",
      email: "",
    });
    setSelectedClass(null);
  };

  if (step === "success" && result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thêm sinh viên thành công!</h1>
            <p className="text-muted-foreground">Sinh viên đã được thêm vào lớp học phần</p>
          </div>
        </div>

        {/* Success Card */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                  {result.message}
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {result.studentCode} - {result.fullName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin sinh viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Mã sinh viên:</span>
                <p className="font-medium font-mono">{result.studentCode}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Họ và tên:</span>
                <p className="font-medium">{result.fullName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="font-medium">{result.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Ngày sinh:</span>
                <p className="font-medium">{formData.dateOfBirth}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Trạng thái xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tài khoản:</span>
                <Badge variant={result.userCreated ? "default" : "secondary"}>
                  {result.userCreated ? "Đã tạo mới" : "Đã tồn tại"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email thông báo:</span>
                <Badge variant={result.emailSent ? "default" : "secondary"}>
                  <Mail className="h-3 w-3 mr-1" />
                  {result.emailSent ? "Đã gửi" : "Không gửi"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Lớp học:</span>
                <Badge variant="outline">
                  {selectedClass?.classCode}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleStartOver}>
            Thêm sinh viên khác
          </Button>
          <Button onClick={onBack}>
            Xem danh sách lớp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm sinh viên thủ công</h1>
          <p className="text-muted-foreground">Thêm sinh viên mới vào lớp học phần</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chọn lớp học phần</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class">Lớp học phần *</Label>
              <Select value={formData.classId} onValueChange={handleClassSelect} disabled={isLoadingClasses}>
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

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Thông tin sinh viên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentCode">Mã sinh viên *</Label>
                <Input
                  id="studentCode"
                  placeholder="VD: 2021001"
                  value={formData.studentCode}
                  onChange={(e) => handleInputChange("studentCode", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !formData.classId}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang thêm sinh viên...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm sinh viên
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}