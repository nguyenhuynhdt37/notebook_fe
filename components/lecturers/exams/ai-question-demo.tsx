"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { 
  CreateExamRequest, 
  GenerateQuestionsRequest, 
  Notebook, 
  NotebookFile,
  ExamDetailResponse 
} from "@/types/lecturer/exam";

/**
 * Demo component showing the complete AI Question Generation workflow
 * according to the API guide specifications
 */
export function AIQuestionDemo() {
  const [step, setStep] = useState(1);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [files, setFiles] = useState<NotebookFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [exam, setExam] = useState<ExamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Load accessible notebooks
  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const notebooks = await examApi.getAccessibleNotebooks();
      setNotebooks(notebooks);
      toast.success(`Tải được ${notebooks.length} notebooks`);
      setStep(2);
    } catch (error) {
      console.error("Error loading notebooks:", error);
      toast.error("Không thể tải danh sách notebook");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Select notebook and load files
  const selectNotebook = async (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setIsLoading(true);
    try {
      const files = await examApi.getNotebookFiles(notebook.id);
      setFiles(files);
      toast.success(`Tải được ${files.length} files từ notebook`);
      setStep(3);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Upload new files (demo with simple upload)
  const handleFileUpload = async (files: File[]) => {
    if (!selectedNotebook) return;
    
    setIsLoading(true);
    try {
      const uploadedFiles = await examApi.uploadFilesSimple(selectedNotebook.id, files);
      setFiles(prev => [...prev, ...uploadedFiles]);
      toast.success(`Upload thành công ${uploadedFiles.length} files`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Không thể upload files");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Create exam
  const createExam = async () => {
    if (!selectedNotebook) return;
    
    setIsLoading(true);
    try {
      const examData: CreateExamRequest = {
        classId: selectedNotebook.classId || "demo-class-id",
        title: "Demo AI Generated Exam",
        description: "Exam created using AI question generation",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        durationMinutes: 60,
        passingScore: 60,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: 1,
      };

      const createdExam = await examApi.createExam(examData);
      setExam(createdExam as ExamDetailResponse);
      toast.success("Tạo exam thành công");
      setStep(5);
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Không thể tạo exam");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Generate questions using AI
  const generateQuestions = async () => {
    if (!exam || selectedFiles.length === 0) return;
    
    setIsLoading(true);
    try {
      const generateRequest: GenerateQuestionsRequest = {
        notebookFileIds: selectedFiles,
        numberOfQuestions: 10,
        questionTypes: "MCQ,TRUE_FALSE",
        difficultyLevel: "MEDIUM",
        mcqOptionsCount: 4,
        includeExplanation: true,
        language: "vi",
        easyPercentage: 30,
        mediumPercentage: 50,
        hardPercentage: 20,
      };

      const examWithQuestions = await examApi.generateQuestions(exam.id, generateRequest);
      setExam(examWithQuestions);
      toast.success(`Tạo thành công ${examWithQuestions.totalQuestions} câu hỏi`);
      setStep(6);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Không thể tạo câu hỏi");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Preview and publish exam
  const publishExam = async () => {
    if (!exam) return;
    
    setIsLoading(true);
    try {
      await examApi.publishExam(exam.id);
      toast.success("Xuất bản exam thành công");
      setStep(7);
    } catch (error) {
      console.error("Error publishing exam:", error);
      toast.error("Không thể xuất bản exam");
    } finally {
      setIsLoading(false);
    }
  };

  const readyFiles = files.filter(f => f.status === "done" && f.ocrDone && f.embeddingDone);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo: AI Question Generation Workflow</CardTitle>
          <p className="text-muted-foreground">
            Minh họa quy trình tạo câu hỏi tự động theo API Guide
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {s}
                </div>
                {s < 7 && <div className="w-8 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Load Notebooks */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 1: Tải danh sách Notebooks</h3>
              <p className="text-muted-foreground">
                Sử dụng API <code>/lecturer/notebooks/accessible</code> để lấy danh sách notebooks có quyền truy cập
              </p>
              <Button onClick={loadNotebooks} disabled={isLoading}>
                {isLoading ? "Đang tải..." : "Tải Notebooks"}
              </Button>
            </div>
          )}

          {/* Step 2: Select Notebook */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 2: Chọn Notebook</h3>
              <div className="grid gap-3">
                {notebooks.map((notebook) => (
                  <Card key={notebook.id} className="cursor-pointer hover:bg-muted/50" onClick={() => selectNotebook(notebook)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{notebook.title}</h4>
                          <p className="text-sm text-muted-foreground">{notebook.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{notebook.type}</Badge>
                            <Badge variant="secondary">{notebook.readyFiles}/{notebook.totalFiles} files</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Manage Files */}
          {step === 3 && selectedNotebook && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 3: Quản lý Files</h3>
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notebook: {selectedNotebook.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {readyFiles.length} files sẵn sàng / {files.length} tổng files
                    </p>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {readyFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles(prev => [...prev, file.id]);
                              } else {
                                setSelectedFiles(prev => prev.filter(id => id !== file.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.originalFilename}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.fileSize / 1024).toFixed(1)} KB • {file.chunksCount} chunks
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {file.mimeType.split('/')[1]?.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={createExam} 
                        disabled={selectedFiles.length === 0 || isLoading}
                      >
                        Tiếp tục với {selectedFiles.length} files
                      </Button>
                      <Badge variant="secondary">
                        Đã chọn {selectedFiles.length} files
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Create Exam */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 4: Tạo Exam</h3>
              <p className="text-muted-foreground">
                Sử dụng API <code>/api/exams</code> để tạo exam mới
              </p>
              <Button onClick={createExam} disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo Exam"}
              </Button>
            </div>
          )}

          {/* Step 5: Generate Questions */}
          {step === 5 && exam && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 5: Tạo Câu Hỏi AI</h3>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium">{exam.title}</h4>
                  <p className="text-sm text-muted-foreground">ID: {exam.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Sẽ tạo 10 câu hỏi từ {selectedFiles.length} files đã chọn
                  </p>
                </CardContent>
              </Card>
              <Button onClick={generateQuestions} disabled={isLoading}>
                {isLoading ? "Đang tạo câu hỏi..." : "Tạo Câu Hỏi AI"}
              </Button>
            </div>
          )}

          {/* Step 6: Preview and Publish */}
          {step === 6 && exam && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 6: Xem trước và Xuất bản</h3>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium">{exam.title}</h4>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="secondary">{exam.totalQuestions} câu hỏi</Badge>
                    <Badge variant="secondary">{exam.totalPoints} điểm</Badge>
                    <Badge variant="outline">{exam.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Exam đã được tạo thành công với {exam.totalQuestions} câu hỏi
                  </p>
                </CardContent>
              </Card>
              <Button onClick={publishExam} disabled={isLoading}>
                {isLoading ? "Đang xuất bản..." : "Xuất bản Exam"}
              </Button>
            </div>
          )}

          {/* Step 7: Complete */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">✅ Hoàn thành!</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-green-600 font-medium">
                    Exam đã được tạo và xuất bản thành công!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sinh viên có thể bắt đầu làm bài thi.
                  </p>
                </CardContent>
              </Card>
              <Button onClick={() => {
                setStep(1);
                setNotebooks([]);
                setSelectedNotebook(null);
                setFiles([]);
                setSelectedFiles([]);
                setExam(null);
              }}>
                Bắt đầu lại
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints Used */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Endpoints được sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p><code className="bg-muted px-2 py-1 rounded">GET /lecturer/notebooks/accessible</code> - Lấy danh sách notebooks</p>
            <p><code className="bg-muted px-2 py-1 rounded">GET /lecturer/notebooks/{`{notebookId}`}/files</code> - Lấy files theo notebook</p>
            <p><code className="bg-muted px-2 py-1 rounded">POST /lecturer/notebooks/{`{notebookId}`}/files/simple</code> - Upload files đơn giản</p>
            <p><code className="bg-muted px-2 py-1 rounded">POST /api/exams</code> - Tạo exam mới</p>
            <p><code className="bg-muted px-2 py-1 rounded">POST /api/exams/{`{examId}`}/generate</code> - Tạo câu hỏi AI</p>
            <p><code className="bg-muted px-2 py-1 rounded">PUT /api/exams/{`{examId}`}/publish</code> - Xuất bản exam</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}