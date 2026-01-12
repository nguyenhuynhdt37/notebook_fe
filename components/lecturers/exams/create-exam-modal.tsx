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
  
  // Set default dates and times
  const getDefaultStartDateTime = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    return {
      date: oneHourLater,
      time: `${oneHourLater.getHours().toString().padStart(2, '0')}:${oneHourLater.getMinutes().toString().padStart(2, '0')}`
    };
  };

  const getDefaultEndDateTime = () => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    return {
      date: twoHoursLater,
      time: `${twoHoursLater.getHours().toString().padStart(2, '0')}:${twoHoursLater.getMinutes().toString().padStart(2, '0')}`
    };
  };

  const defaultStart = getDefaultStartDateTime();
  const defaultEnd = getDefaultEndDateTime();

  const [startDate, setStartDate] = useState<Date>(defaultStart.date);
  const [endDate, setEndDate] = useState<Date>(defaultEnd.date);
  const [startTime, setStartTime] = useState(defaultStart.time);
  const [endTime, setEndTime] = useState(defaultEnd.time);
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
    // Create new date in local timezone
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
    return combined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classId) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    // Combine date and time
    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    // Validate that start time is in the future
    const now = new Date();
    if (startDateTime <= now) {
      toast.error("Thời gian bắt đầu phải trong tương lai");
      return;
    }

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Try different time formats to match backend expectation
    const formatForBackend = (date: Date): string => {
      // Backend test successful with: "2026-01-03T12:45:50.670"
      // Use UTC to avoid timezone issues
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
      const ms = date.getUTCMilliseconds();
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
    };

    // Alternative: try adding timezone offset to make it clearly future
    const formatWithBuffer = (date: Date): string => {
      // Add 2 hours buffer to ensure it's in future even with timezone conversion
      const bufferedDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
      return formatForBackend(bufferedDate);
    };

    // Format for Spring Boot LocalDateTime (no timezone)
    const formatForLocalDateTime = (date: Date): string => {
      // LocalDateTime expects format: "2026-01-03T12:45:50" (no timezone)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    setIsLoading(true);
    try {
      console.log("=== DEBUG EXAM CREATION ===");
      console.log("Current time:", new Date());
      console.log("Current time ISO:", new Date().toISOString());
      console.log("Timezone offset (minutes):", new Date().getTimezoneOffset());
      console.log("Start date selected:", startDate);
      console.log("Start time selected:", startTime);
      console.log("Combined start datetime:", startDateTime);
      console.log("Combined start datetime LOCAL:", startDateTime.toString());
      console.log("End datetime:", endDateTime);
      console.log("End datetime LOCAL:", endDateTime.toString());
      console.log("Is start time in future?", startDateTime > now);
      console.log("Time difference (ms):", startDateTime.getTime() - now.getTime());

      const examData: CreateExamRequest = {
        ...formData as CreateExamRequest,
        startTime: formatForLocalDateTime(startDateTime),
        endTime: formatForLocalDateTime(endDateTime),
      };

      console.log("Formatted start time for LocalDateTime:", examData.startTime);
      console.log("Formatted end time for LocalDateTime:", examData.endTime);
      console.log("Final exam data being sent:", examData);

      await api.post("/api/exams", examData);
      toast.success("Tạo đề thi thành công");
      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error("=== ERROR CREATING EXAM ===");
      console.error("Error object:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Request data was:", {
        startTime: formatForLocalDateTime(startDateTime),
        endTime: formatForLocalDateTime(endDateTime),
        ...formData
      });
      toast.error("Không thể tạo đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    const defaultStart = getDefaultStartDateTime();
    const defaultEnd = getDefaultEndDateTime();
    
    setFormData({
      title: "",
      description: "",
      durationMinutes: 60,
      passingScore: 5,
      shuffleQuestions: true,
      shuffleOptions: true,
      maxAttempts: 1,
    });
    setStartDate(defaultStart.date);
    setEndDate(defaultEnd.date);
    setStartTime(defaultStart.time);
    setEndTime(defaultEnd.time);
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
                        required
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
                        required
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