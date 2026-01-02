"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { CreateExamRequest } from "@/types/lecturer/exam";

interface CreateExamFormProps {
  classId: string;
  onSuccess?: (examId: string) => void;
}

export function CreateExamForm({ classId, onSuccess }: CreateExamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExamRequest>({
    classId,
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 60,
    passingScore: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đề thi");
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }
    
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setIsLoading(true);
    try {
      const exam = await examApi.createExam(formData);
      toast.success("Đã tạo đề thi thành công");
      
      if (onSuccess) {
        onSuccess(exam.id);
      } else {
        router.push(`/lecturer/exams/${exam.id}`);
      }
    } catch (error: any) {
      console.error("Error creating exam:", error);
      const errorMessage = error.response?.data?.message || "Không thể tạo đề thi";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo đề thi mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề đề thi *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề đề thi..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả đề thi..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Thời gian làm bài (phút)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Cài đặt bổ sung</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, shuffleQuestions: checked as boolean }))
                    }
                  />
                  <Label htmlFor="shuffleQuestions">Trộn thứ tự câu hỏi</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleOptions"
                    checked={formData.shuffleOptions}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, shuffleOptions: checked as boolean }))
                    }
                  />
                  <Label htmlFor="shuffleOptions">Trộn thứ tự đáp án</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo đề thi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}