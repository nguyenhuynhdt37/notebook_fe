"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { GenerateQuestionsRequest, NotebookFile, DifficultyLevel } from "@/types/lecturer";

interface GenerateQuestionsModalProps {
  examId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GenerateQuestionsModal({ 
  examId, 
  open, 
  onOpenChange, 
  onSuccess 
}: GenerateQuestionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notebooks, setNotebooks] = useState<NotebookFile[]>([]);
  const [selectedNotebooks, setSelectedNotebooks] = useState<string[]>([]);
  const [formData, setFormData] = useState<GenerateQuestionsRequest>({
    notebookFileIds: [],
    numberOfQuestions: 10,
    questionTypes: "MCQ,TRUE_FALSE",
    difficultyLevel: "MIXED",
    mcqOptionsCount: 4,
    easyPercentage: 30,
    mediumPercentage: 50,
    hardPercentage: 20,
  });

  useEffect(() => {
    if (open) {
      loadNotebooks();
    }
  }, [open]);

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NotebookFile[]>("/api/notebooks/files");
      setNotebooks(response.data);
    } catch (error) {
      console.error("Error loading notebooks:", error);
      toast.error("Không thể tải danh sách notebook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotebookToggle = (notebookId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotebooks(prev => [...prev, notebookId]);
    } else {
      setSelectedNotebooks(prev => prev.filter(id => id !== notebookId));
    }
  };

  const handleQuestionTypeToggle = (type: string, checked: boolean) => {
    const types = formData.questionTypes.split(",").filter(t => t);
    if (checked) {
      types.push(type);
    } else {
      const index = types.indexOf(type);
      if (index > -1) types.splice(index, 1);
    }
    setFormData(prev => ({ ...prev, questionTypes: types.join(",") }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNotebooks.length === 0) {
      toast.error("Vui lòng chọn ít nhất một notebook");
      return;
    }

    if (!formData.questionTypes) {
      toast.error("Vui lòng chọn ít nhất một loại câu hỏi");
      return;
    }

    setIsGenerating(true);
    try {
      const requestData = {
        ...formData,
        notebookFileIds: selectedNotebooks,
      };

      await api.post(`/api/exams/${examId}/generate`, requestData);
      toast.success("Đã tạo câu hỏi thành công");
      onSuccess();
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Không thể tạo câu hỏi");
    } finally {
      setIsGenerating(false);
    }
  };

  const questionTypes = [
    { value: "MCQ", label: "Trắc nghiệm", description: "Câu hỏi nhiều lựa chọn" },
    { value: "TRUE_FALSE", label: "Đúng/Sai", description: "Câu hỏi đúng hoặc sai" },
    { value: "ESSAY", label: "Tự luận", description: "Câu hỏi tự luận ngắn" },
  ];

  const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" },
    { value: "MIXED", label: "Hỗn hợp" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Tạo câu hỏi tự động bằng AI
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notebook Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Chọn tài liệu nguồn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Đang tải danh sách notebook...</div>
                </div>
              ) : notebooks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Không có notebook nào</div>
                </div>
              ) : (
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {notebooks.map((notebook) => (
                    <div
                      key={notebook.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={notebook.id}
                        checked={selectedNotebooks.includes(notebook.id)}
                        onCheckedChange={(checked) => 
                          handleNotebookToggle(notebook.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor={notebook.id} className="font-medium cursor-pointer">
                          {notebook.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {(notebook.size / 1024).toFixed(1)} KB • 
                          {new Date(notebook.uploadedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedNotebooks.length > 0 && (
                <div className="pt-2">
                  <Badge variant="secondary">
                    Đã chọn {selectedNotebooks.length} notebook
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Cấu hình câu hỏi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfQuestions">Số lượng câu hỏi</Label>
                  <Input
                    id="numberOfQuestions"
                    type="number"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      numberOfQuestions: parseInt(e.target.value) 
                    }))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Độ khó</Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value: DifficultyLevel) => 
                      setFormData(prev => ({ ...prev, difficultyLevel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Question Types */}
              <div className="space-y-3">
                <Label>Loại câu hỏi</Label>
                <div className="grid gap-3">
                  {questionTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={type.value}
                        checked={formData.questionTypes.includes(type.value)}
                        onCheckedChange={(checked) => 
                          handleQuestionTypeToggle(type.value, checked as boolean)
                        }
                      />
                      <div>
                        <Label htmlFor={type.value} className="font-medium cursor-pointer">
                          {type.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MCQ Options */}
              {formData.questionTypes.includes("MCQ") && (
                <div className="space-y-2">
                  <Label htmlFor="mcqOptionsCount">Số lựa chọn cho câu trắc nghiệm</Label>
                  <Select
                    value={formData.mcqOptionsCount.toString()}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, mcqOptionsCount: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 lựa chọn</SelectItem>
                      <SelectItem value="4">4 lựa chọn</SelectItem>
                      <SelectItem value="5">5 lựa chọn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Difficulty Distribution */}
              {formData.difficultyLevel === "MIXED" && (
                <div className="space-y-4">
                  <Label>Phân bố độ khó (%)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Label className="w-20">Dễ:</Label>
                      <Input
                        type="number"
                        value={formData.easyPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          easyPercentage: parseInt(e.target.value) 
                        }))}
                        min="0"
                        max="100"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-20">Trung bình:</Label>
                      <Input
                        type="number"
                        value={formData.mediumPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          mediumPercentage: parseInt(e.target.value) 
                        }))}
                        min="0"
                        max="100"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-20">Khó:</Label>
                      <Input
                        type="number"
                        value={formData.hardPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          hardPercentage: parseInt(e.target.value) 
                        }))}
                        min="0"
                        max="100"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tổng: {formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage}%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Đang tạo câu hỏi...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    AI đang phân tích nội dung và tạo câu hỏi. Quá trình này có thể mất vài phút.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isGenerating || selectedNotebooks.length === 0}
            >
              {isGenerating ? "Đang tạo..." : "Tạo câu hỏi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}