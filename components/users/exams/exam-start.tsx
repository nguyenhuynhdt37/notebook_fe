"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, FileText, AlertTriangle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import examApi from "@/api/client/exam";
import { AvailableExam, BrowserInfo } from "@/types/student/exam";
import { useStudentExamStore } from "@/stores/studentExam";

interface ExamStartProps {
  examId: string;
}

export function ExamStart({ examId }: ExamStartProps) {
  const [exam, setExam] = useState<AvailableExam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [academicIntegrityAcknowledged, setAcademicIntegrityAcknowledged] = useState(false);
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const router = useRouter();
  const { setCurrentExam, clearExamData, setTimeRemaining } = useStudentExamStore();

  useEffect(() => {
    loadExamInfo();
    clearExamData(); // Clear any previous exam data
  }, [examId]);

  const loadExamInfo = async () => {
    setIsLoading(true);
    try {
      const availableExams = await examApi.getAvailableExams();
      const examInfo = availableExams.find(e => e.id === examId);

      if (!examInfo) {
        toast.error("Không tìm thấy thông tin đề thi");
        router.push("/exams");
        return;
      }

      setExam(examInfo);
    } catch (error) {
      console.error("Error loading exam info:", error);
      toast.error("Không thể tải thông tin đề thi");
      router.push("/exams");
    } finally {
      setIsLoading(false);
    }
  };

  const getBrowserInfo = (): BrowserInfo => {
    const userAgent = navigator.userAgent;
    const screen = window.screen;

    // Simple browser detection
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (userAgent.includes("Chrome")) {
      browserName = "Chrome";
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (userAgent.includes("Safari")) {
      browserName = "Safari";
      const match = userAgent.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    }

    return {
      browserName,
      browserVersion,
      operatingSystem: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop",
      isFullScreen: document.fullscreenElement !== null,
      academicIntegrityAcknowledged,
      rulesAcknowledged,
    };
  };

  const handleStartExam = async () => {
    if (!exam) return;

    if (!academicIntegrityAcknowledged || !rulesAcknowledged) {
      toast.error("Vui lòng xác nhận tất cả các điều khoản");
      return;
    }

    setIsStarting(true);
    try {
      // Check if can take exam
      const canTake = await examApi.canTakeExam(examId);
      if (!canTake) {
        toast.error("Bạn không thể thi đề này");
        return;
      }

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.warn("Could not enter fullscreen:", error);
        }
      }

      // Start exam
      const browserInfo = getBrowserInfo();
      const examData = await examApi.startExam(examId, browserInfo);

      // Store exam data
      setCurrentExam(examData);
      setTimeRemaining(examData.remainingTimeSeconds);

      // Navigate to exam taking page
      router.push(`/exams/${examId}/take`);

    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Không thể bắt đầu đề thi");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin đề thi...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Không tìm thấy thông tin đề thi</p>
          <Button onClick={() => router.push("/exams")} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const canStart = exam.canTakeExam && exam.isActive && !exam.isTimeUp && exam.remainingAttempts > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/exams")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chuẩn bị thi</h1>
            <p className="text-muted-foreground">{exam.title}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin đề thi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Lớp học</p>
                    <p className="text-muted-foreground">{exam.className}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Môn học</p>
                    <p className="text-muted-foreground">{exam.subjectName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thời gian làm bài</p>
                    <p className="text-muted-foreground">{exam.durationMinutes} phút</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Số câu hỏi</p>
                    <p className="text-muted-foreground">{exam.totalQuestions} câu</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lượt thi còn lại</p>
                    <p className="text-muted-foreground">{exam.remainingAttempts}/{exam.maxAttempts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Quy định thi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <p>• Không được sử dụng tài liệu, thiết bị hỗ trợ khác</p>
                  <p>• Không được thoát khỏi chế độ toàn màn hình</p>
                  <p>• Không được chuyển tab hoặc cửa sổ khác</p>
                  <p>• Không được sao chép, dán nội dung</p>
                  <p>• Hệ thống sẽ tự động nộp bài khi hết thời gian</p>
                  <p>• Mọi hành vi gian lận sẽ được ghi nhận và xử lý</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="academic-integrity"
                      checked={academicIntegrityAcknowledged}
                      onCheckedChange={(checked) => setAcademicIntegrityAcknowledged(checked as boolean)}
                    />
                    <label htmlFor="academic-integrity" className="text-sm leading-relaxed">
                      Tôi cam kết tuân thủ các quy định về tính trung thực học thuật và không sử dụng
                      bất kỳ hình thức gian lận nào trong quá trình làm bài thi.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="rules"
                      checked={rulesAcknowledged}
                      onCheckedChange={(checked) => setRulesAcknowledged(checked as boolean)}
                    />
                    <label htmlFor="rules" className="text-sm leading-relaxed">
                      Tôi đã đọc và hiểu rõ tất cả các quy định thi. Tôi đồng ý tuân thủ
                      các quy định này trong suốt quá trình làm bài.
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Kiểm tra hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Trình duyệt:</span>
                  <span className="text-green-600">✓ Hỗ trợ</span>
                </div>
                <div className="flex justify-between">
                  <span>JavaScript:</span>
                  <span className="text-green-600">✓ Bật</span>
                </div>
                <div className="flex justify-between">
                  <span>Kết nối mạng:</span>
                  <span className="text-green-600">✓ Ổn định</span>
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <Card>
              <CardContent className="pt-6">
                {!canStart ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {exam.isTimeUp ? "Đề thi đã hết hạn" :
                        !exam.isActive ? "Đề thi chưa mở" :
                          exam.remainingAttempts === 0 ? "Đã hết lượt thi" :
                            "Không thể thi"}
                    </p>
                    <Button
                      onClick={() => router.push("/exams")}
                      variant="outline"
                      className="w-full"
                    >
                      Quay lại danh sách
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartExam}
                    disabled={!academicIntegrityAcknowledged || !rulesAcknowledged || isStarting}
                    className="w-full"
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang bắt đầu...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Bắt đầu làm bài
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}