"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import LecturerSubjectSelect from "@/components/lecturers/shared/lecturer-subject-select";

interface ManualCreateClassFlowProps {
  onBack: () => void;
}

interface CreateClassRequest {
  className: string;
  subjectId: string;
  room: string;
  dayOfWeek: number;
  periods: string;
  note: string;
}

interface CreateClassResponse {
  success: boolean;
  message: string;
  classId: string | null;
  className: string | null;
  subjectName: string | null;
}

const DAYS_OF_WEEK = [
  { value: 2, label: "Thứ 2" },
  { value: 3, label: "Thứ 3" },
  { value: 4, label: "Thứ 4" },
  { value: 5, label: "Thứ 5" },
  { value: 6, label: "Thứ 6" },
  { value: 7, label: "Thứ 7" },
  { value: 8, label: "Chủ nhật" },
];

const PERIODS = [
  { value: "1-3", label: "Tiết 1-3 (7:00-9:30)" },
  { value: "4-6", label: "Tiết 4-6 (9:45-12:15)" },
  { value: "7-9", label: "Tiết 7-9 (13:00-15:30)" },
  { value: "10-12", label: "Tiết 10-12 (15:45-18:15)" },
  { value: "13-15", label: "Tiết 13-15 (18:30-21:00)" },
];

export default function ManualCreateClassFlow({ onBack }: ManualCreateClassFlowProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateClassResponse | null>(null);
  
  const [formData, setFormData] = useState<CreateClassRequest>({
    className: "",
    subjectId: "",
    room: "",
    dayOfWeek: 2,
    periods: "",
    note: "",
  });

  const handleInputChange = (field: keyof CreateClassRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.className.trim() || !formData.subjectId || !formData.room.trim() || !formData.periods) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<CreateClassResponse>('/api/lecturer/manual-class-management/create-class', formData, {
        headers: {
          'X-User-Id': 'lecturer-id', // TODO: Get from auth
        },
      });

      setResult(response.data);
      if (response.data.success) {
        setStep("success");
        toast.success("Tạo lớp học phần thành công!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Create class error:', error);
      toast.error(error.response?.data?.message || "Không thể tạo lớp học phần");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("form");
    setResult(null);
    setFormData({
      className: "",
      subjectId: "",
      room: "",
      dayOfWeek: 2,
      periods: "",
      note: "",
    });
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
            <h1 className="text-3xl font-bold tracking-tight">Tạo lớp thành công!</h1>
            <p className="text-muted-foreground">Lớp học phần đã được tạo và notebook đã được thiết lập</p>
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
                  Lớp "{result.className}" - {result.subjectName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lớp đã tạo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tên lớp:</span>
                <p className="font-medium">{result.className}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Môn học:</span>
                <p className="font-medium">{result.subjectName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Phòng học:</span>
                <p className="font-medium">{formData.room}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Thời gian:</span>
                <p className="font-medium">
                  {DAYS_OF_WEEK.find(d => d.value === formData.dayOfWeek)?.label} - {formData.periods}
                </p>
              </div>
            </div>
            {formData.note && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Ghi chú:</span>
                <p className="font-medium">{formData.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleStartOver}>
            Tạo lớp khác
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo lớp học phần thủ công</h1>
          <p className="text-muted-foreground">Tạo lớp mới không cần file Excel</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Thông tin lớp học phần
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="className">Tên lớp học phần *</Label>
                <Input
                  id="className"
                  placeholder="VD: Lớp 01 - Java Programming"
                  value={formData.className}
                  onChange={(e) => handleInputChange("className", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Môn học *</Label>
                <LecturerSubjectSelect
                  value={formData.subjectId || null}
                  onChange={(value) => handleInputChange("subjectId", value || "")}
                  placeholder="Chọn môn học"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Phòng học *</Label>
                <Input
                  id="room"
                  placeholder="VD: A101, B205"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Thứ trong tuần *</Label>
                <Select 
                  value={formData.dayOfWeek.toString()} 
                  onValueChange={(value) => handleInputChange("dayOfWeek", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="periods">Tiết học *</Label>
                <Select 
                  value={formData.periods} 
                  onValueChange={(value) => handleInputChange("periods", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tiết học" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Ghi chú thêm về lớp học (tùy chọn)"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  rows={3}
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
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo lớp...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Tạo lớp học phần
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}