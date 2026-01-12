"use client";

import { useState, useEffect } from "react";
import { Sparkles, Settings, BookOpen, Loader2, Check } from "lucide-react";
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
    { value: "MCQ", label: "Trắc nghiệm" },
    { value: "TRUE_FALSE", label: "Đúng/Sai" },
    { value: "ESSAY", label: "Tự luận" },
    { value: "FILL_BLANK", label: "Điền khuyết" },
  ];

  const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" },
    { value: "MIXED", label: "Hỗn hợp" },
  ];

  const selectedNotebookData = notebooks.find(n => n.id === selectedNotebook);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Tạo câu hỏi tự động bằng AI
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="source" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="source" className="text-xs">Chọn nguồn tài liệu</TabsTrigger>
              <TabsTrigger value="config" className="text-xs">Cấu hình câu hỏi</TabsTrigger>
            </TabsList>

            {/* Source Selection Tab */}
            <TabsContent value="source" className="space-y-4 mt-4">
              {/* Notebook Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Chọn Notebook</Label>
                </div>
                
                {isLoading && !selectedNotebook ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : notebooks.length === 0 ? (
                  <div className="text-center py-6 border rounded-lg border-dashed">
                    <p className="text-sm text-muted-foreground mb-2">Không có notebook nào</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        router.push('/lecturer/file-management');
                      }}
                    >
                      Đi đến Quản lý Files
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedNotebook} onValueChange={setSelectedNotebook}>
                    <SelectTrigger className="h-auto py-2">
                      <SelectValue placeholder="Chọn notebook...">
                        {selectedNotebookData && (
                          <div className="flex items-center gap-2 text-left">
                            <span>{selectedNotebookData.title}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {selectedNotebookData.readyFiles}/{selectedNotebookData.totalFiles} files
                            </Badge>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {notebooks.map((notebook) => (
                        <SelectItem key={notebook.id} value={notebook.id}>
                          <div className="flex flex-col py-0.5">
                            <span className="font-medium">{notebook.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {notebook.readyFiles}/{notebook.totalFiles} files sẵn sàng • {notebook.className || notebook.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* File Manager */}
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
            <TabsContent value="config" className="space-y-4 mt-4">
              {/* Basic Settings */}
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cấu hình câu hỏi</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="numberOfQuestions" className="text-xs">Số lượng câu hỏi</Label>
                  <Input
                    id="numberOfQuestions"
                    type="number"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      numberOfQuestions: parseInt(e.target.value) || 0
                    }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="difficultyLevel" className="text-xs">Độ khó</Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value: DifficultyLevel) => 
                      setFormData(prev => ({ ...prev, difficultyLevel: value }))
                    }
                  >
                    <SelectTrigger className="h-9">
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
              <div className="space-y-2">
                <Label className="text-xs">Loại câu hỏi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {questionTypes.map((type) => (
                    <div 
                      key={type.value} 
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors
                        ${formData.questionTypes.includes(type.value) 
                          ? 'border-foreground/30 bg-accent' 
                          : 'hover:bg-muted/50'}`}
                      onClick={() => handleQuestionTypeToggle(type.value, !formData.questionTypes.includes(type.value))}
                    >
                      <Checkbox
                        checked={formData.questionTypes.includes(type.value)}
                        onCheckedChange={(checked) => handleQuestionTypeToggle(type.value, checked as boolean)}
                      />
                      <span className="text-sm">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MCQ Options */}
              {formData.questionTypes.includes("MCQ") && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Số lựa chọn trắc nghiệm</Label>
                  <Select
                    value={formData.mcqOptionsCount.toString()}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, mcqOptionsCount: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} lựa chọn</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Additional Options */}
              <div 
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors
                  ${formData.includeExplanation ? 'border-foreground/30 bg-accent' : 'hover:bg-muted/50'}`}
                onClick={() => setFormData(prev => ({ ...prev, includeExplanation: !prev.includeExplanation }))}
              >
                <Checkbox
                  checked={formData.includeExplanation}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, includeExplanation: checked as boolean }))
                  }
                />
                <span className="text-sm">Bao gồm giải thích đáp án</span>
              </div>

              {/* Difficulty Distribution */}
              {formData.difficultyLevel === "MIXED" && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <Label className="text-xs">Phân bố độ khó (%)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Dễ</Label>
                      <Input
                        type="number"
                        value={formData.easyPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          easyPercentage: parseInt(e.target.value) || 0
                        }))}
                        min="0"
                        max="100"
                        className="h-8 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">TB</Label>
                      <Input
                        type="number"
                        value={formData.mediumPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          mediumPercentage: parseInt(e.target.value) || 0
                        }))}
                        min="0"
                        max="100"
                        className="h-8 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Khó</Label>
                      <Input
                        type="number"
                        value={formData.hardPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          hardPercentage: parseInt(e.target.value) || 0
                        }))}
                        min="0"
                        max="100"
                        className="h-8 text-center"
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${
                    formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage === 100 
                      ? 'text-green-600' 
                      : 'text-red-500'
                  }`}>
                    Tổng: {formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage}%
                    {formData.easyPercentage + formData.mediumPercentage + formData.hardPercentage !== 100 && " (cần = 100%)"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  {progress < 50 ? "Đang phân tích nội dung..." : 
                   progress < 100 ? "Đang tạo câu hỏi..." : "Hoàn thành!"}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                AI đang xử lý. Quá trình này có thể mất vài phút.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {selectedFiles.length > 0 && (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-600" />
                  {selectedFiles.length} file đã chọn
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isGenerating || selectedFiles.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Tạo câu hỏi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}