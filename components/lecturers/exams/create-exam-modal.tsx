"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import api from "@/api/client/axios";
import { CreateExamRequest, LecturerClassPagedResponse } from "@/types/lecturer";
import { DateTimePreview } from "./datetime-preview";

interface CreateExamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ClassOption {
  id: string;
  classCode: string;
  room: string;
  studentCount: number;
}

export function CreateExamModal({ open, onOpenChange, onSuccess }: CreateExamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [formData, setFormData] = useState<Partial<CreateExamRequest>>({
    title: "",
    description: "",
    durationMinutes: 60,
    passingScore: 5,
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 1,
  });

  useEffect(() => {
    if (open) {
      loadClasses();
    }
  }, [open]);

  const loadClasses = async () => {
    try {
      const response = await api.get<LecturerClassPagedResponse>("/lecturer/classes?size=100");
      if (response.data?.items) {
        const activeClasses = response.data.items.filter(cls => cls.isActive);
        setClasses(activeClasses.map(cls => ({
          id: cls.id,
          classCode: cls.classCode,
          room: cls.room,
          studentCount: cls.studentCount
        })));
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    }
  };

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    if (!formData.classId) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    // Combine date and time
    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setIsLoading(true);
    try {
      const examData: CreateExamRequest = {
        ...formData as CreateExamRequest,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      await api.post("/api/exams", examData);
      toast.success("Tạo đề thi thành công");
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Không thể tạo đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      durationMinutes: 60,
      passingScore: 5,
      shuffleQuestions: true,
      shuffleOptions: true,
      maxAttempts: 1,
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("08:00");
    setEndTime("10:00");
  };

  const handleInputChange = (field: keyof CreateExamRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đề thi mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề đề thi *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tiêu đề đề thi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả về đề thi"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Lớp học *</Label>
              <Select
                value={formData.classId}
                onValueChange={(value: string) => handleInputChange("classId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.classCode} - {cls.room} ({cls.studentCount} SV)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cài đặt thời gian</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-3">
                <Label>Thời gian bắt đầu *</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: vi }) : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-3">
                <Label>Thời gian kết thúc *</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: vi }) : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview combined datetime */}
            <DateTimePreview
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
            />

            <div className="space-y-2">
              <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange("durationMinutes", parseInt(e.target.value))}
                  className="pl-9"
                  min="1"
                  max="300"
                />
              </div>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cài đặt đề thi</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => handleInputChange("passingScore", parseFloat(e.target.value))}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => handleInputChange("maxAttempts", parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trộn câu hỏi</Label>
                  <p className="text-sm text-muted-foreground">
                    Thay đổi thứ tự câu hỏi cho mỗi sinh viên
                  </p>
                </div>
                <Switch
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) => handleInputChange("shuffleQuestions", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trộn đáp án</Label>
                  <p className="text-sm text-muted-foreground">
                    Thay đổi thứ tự các lựa chọn trong câu hỏi trắc nghiệm
                  </p>
                </div>
                <Switch
                  checked={formData.shuffleOptions}
                  onCheckedChange={(checked) => handleInputChange("shuffleOptions", checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo đề thi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}