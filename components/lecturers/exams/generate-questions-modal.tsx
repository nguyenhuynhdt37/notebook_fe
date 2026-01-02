"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, Settings, BookOpen, Search, ExternalLink } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import examApi from "@/api/client/exam";
import { 
  GenerateQuestionsRequest, 
  NotebookFile, 
  Notebook,
  DifficultyLevel 
} from "@/types/lecturer/exam";
import { FileManager } from "./file-manager";

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
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  
  // Notebook and file states
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string>("");
  const [notebookFiles, setNotebookFiles] = useState<NotebookFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileSearch, setFileSearch] = useState("");
  
  const [formData, setFormData] = useState<GenerateQuestionsRequest>({
    notebookFileIds: [],
    numberOfQuestions: 10,
    questionTypes: "MCQ,TRUE_FALSE",
    difficultyLevel: "MEDIUM",
    mcqOptionsCount: 4,
    includeExplanation: true,
    language: "vi",
    easyPercentage: 30,
    mediumPercentage: 50,
    hardPercentage: 20,
  });

  useEffect(() => {
    if (open) {
      loadNotebooks();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selectedNotebook) {
      loadNotebookFiles();
    } else {
      setNotebookFiles([]);
      setSelectedFiles([]);
    }
  }, [selectedNotebook, fileSearch]);

  const resetForm = () => {
    setSelectedNotebook("");
    setNotebookFiles([]);
    setSelectedFiles([]);
    setFileSearch("");
    setProgress(0);
    setFormData({
      notebookFileIds: [],
      numberOfQuestions: 10,
      questionTypes: "MCQ,TRUE_FALSE",
      difficultyLevel: "MEDIUM",
      mcqOptionsCount: 4,
      includeExplanation: true,
      language: "vi",
      easyPercentage: 30,
      mediumPercentage: 50,
      hardPercentage: 20,
    });
  };

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const notebooks = await examApi.getAccessibleNotebooks();
      setNotebooks(notebooks);
    } catch (error) {
      console.error("Error loading notebooks:", error);
      toast.error("Không thể tải danh sách notebook");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotebookFiles = async () => {
    if (!selectedNotebook) return;
    
    setIsLoading(true);
    try {
      const files = await examApi.getNotebookFiles(selectedNotebook, fileSearch);
      setNotebookFiles(files);
    } catch (error) {
      console.error("Error loading notebook files:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileToggle = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (selectedFiles.length === 0) {
      errors.push("Vui lòng chọn ít nhất 1 file");
    }
    
    if (!formData.numberOfQuestions || formData.numberOfQuestions < 1 || formData.numberOfQuestions > 100) {
      errors.push("Số câu hỏi phải từ 1-100");
    }
    
    if (!formData.questionTypes) {
      errors.push("Vui lòng chọn ít nhất một loại câu hỏi");
    }
    
    if (formData.difficultyLevel === 'MIXED') {
      const total = formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage;
      if (total !== 100) {
        errors.push("Tổng phần trăm độ khó phải bằng 100%");
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      const requestData = {
        ...formData,
        notebookFileIds: selectedFiles,
      };

      console.log("Sending generate questions request:", requestData);

      // Simulate progress updates
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(75);
      
      const result = await examApi.generateQuestions(examId, requestData);
      
      console.log("Generate questions result:", result);
      
      setProgress(100);
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        console.error("Invalid response structure:", result);
        toast.error("Phản hồi từ server không hợp lệ");
        return;
      }

      // Check for questions
      const questionCount = result.totalQuestions || result.questions?.length || 0;
      
      if (questionCount > 0) {
        toast.success(`Đã tạo thành công ${questionCount} câu hỏi`);
        onSuccess();
        onOpenChange(false);
      } else {
        console.warn("No questions generated:", result);
        toast.warning("Không có câu hỏi nào được tạo. Vui lòng thử lại với files khác.");
      }
      
    } catch (error: any) {
      console.error("Error generating questions:", error);
      
      // Log detailed error information
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack
      });
      
      // Check if it's actually a success response with different status code
      if (error.response?.status >= 200 && error.response?.status < 300) {
        console.log("Success response with non-200 status:", error.response);
        const data = error.response.data;
        
        if (data && typeof data === 'object') {
          const questionCount = data.totalQuestions || data.questions?.length || 0;
          if (questionCount > 0) {
            toast.success(`Đã tạo thành công ${questionCount} câu hỏi`);
            onSuccess();
            onOpenChange(false);
            return;
          }
        }
      }
      
      // Handle different error types
      let errorMessage = "Không thể tạo câu hỏi";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Dữ liệu gửi lên không hợp lệ";
      } else if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn";
      } else if (error.response?.status === 403) {
        errorMessage = "Không có quyền thực hiện thao tác này";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy exam hoặc files";
      } else if (error.response?.status >= 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Lỗi kết nối mạng";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const questionTypes = [
    { value: "MCQ", label: "Trắc nghiệm", description: "Câu hỏi nhiều lựa chọn" },
    { value: "TRUE_FALSE", label: "Đúng/Sai", description: "Câu hỏi đúng hoặc sai" },
    { value: "ESSAY", label: "Tự luận", description: "Câu hỏi tự luận ngắn" },
    { value: "CODING", label: "Lập trình", description: "Câu hỏi code" },
    { value: "FILL_BLANK", label: "Điền khuyết", description: "Điền vào chỗ trống" },
    { value: "MATCHING", label: "Ghép đôi", description: "Ghép cặp đáp án" },
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
          <Tabs defaultValue="source" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="source">Chọn nguồn tài liệu</TabsTrigger>
              <TabsTrigger value="config">Cấu hình câu hỏi</TabsTrigger>
            </TabsList>

            {/* Source Selection Tab */}
            <TabsContent value="source" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    Chọn Notebook
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading && !selectedNotebook ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">Đang tải danh sách notebook...</div>
                    </div>
                  ) : notebooks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">Không có notebook nào</div>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          onOpenChange(false);
                          router.push('/lecturer/file-management');
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Đi đến Quản lý Files
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedNotebook} onValueChange={setSelectedNotebook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn notebook..." />
                      </SelectTrigger>
                      <SelectContent>
                        {notebooks.map((notebook) => (
                          <SelectItem key={notebook.id} value={notebook.id}>
                            <div className="flex flex-col">
                              <span>{notebook.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {notebook.readyFiles}/{notebook.totalFiles} files sẵn sàng • {notebook.className || notebook.type}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {selectedNotebook && (
                <FileManager
                  notebookId={selectedNotebook}
                  files={notebookFiles}
                  selectedFiles={selectedFiles}
                  onFilesChange={setNotebookFiles}
                  onSelectionChange={setSelectedFiles}
                  allowUpload={true}
                  allowDelete={true}
                  allowSelection={true}
                />
              )}
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
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
                          numberOfQuestions: parseInt(e.target.value) || 0
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
                          <SelectItem value="2">2 lựa chọn</SelectItem>
                          <SelectItem value="3">3 lựa chọn</SelectItem>
                          <SelectItem value="4">4 lựa chọn</SelectItem>
                          <SelectItem value="5">5 lựa chọn</SelectItem>
                          <SelectItem value="6">6 lựa chọn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <Label>Tùy chọn bổ sung</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeExplanation"
                          checked={formData.includeExplanation}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, includeExplanation: checked as boolean }))
                          }
                        />
                        <Label htmlFor="includeExplanation">Bao gồm giải thích đáp án</Label>
                      </div>
                    </div>
                  </div>

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
                              easyPercentage: parseInt(e.target.value) || 0
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
                              mediumPercentage: parseInt(e.target.value) || 0
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
                              hardPercentage: parseInt(e.target.value) || 0
                            }))}
                            min="0"
                            max="100"
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng: {formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage}%
                          {formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage !== 100 && (
                            <span className="text-red-500 ml-2">
                              (Phải bằng 100%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      {progress < 25 && "Đang xử lý files..."}
                      {progress >= 25 && progress < 50 && "Đang phân tích nội dung..."}
                      {progress >= 50 && progress < 75 && "Đang tạo câu hỏi..."}
                      {progress >= 75 && progress < 100 && "Đang xử lý kết quả..."}
                      {progress >= 100 && "Hoàn thành!"}
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
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
              disabled={isGenerating || selectedFiles.length === 0}
            >
              {isGenerating ? "Đang tạo..." : "Tạo câu hỏi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}