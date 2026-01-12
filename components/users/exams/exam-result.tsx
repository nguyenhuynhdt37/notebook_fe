"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Clock, Target, CheckCircle, XCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import examApi from "@/api/client/exam";
import { ExamResult as ExamResultType } from "@/types/student/exam";

interface ExamResultProps {
  examId: string;
}

export function ExamResult({ examId }: ExamResultProps) {
  const [result, setResult] = useState<ExamResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadExamResult();
  }, [examId]);

  const loadExamResult = async () => {
    setIsLoading(true);
    try {
      const resultData = await examApi.getExamResult(examId);
      setResult(resultData);
    } catch (error) {
      console.error("Error loading exam result:", error);
      toast.error("Không thể tải kết quả thi");
      router.push("/exams");
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string | null | undefined) => {
    if (!grade) return "bg-gray-100 text-gray-800";

    switch (grade.toUpperCase()) {
      case "A": case "A+": return "bg-green-100 text-green-800";
      case "B": case "B+": return "bg-blue-100 text-blue-800";
      case "C": case "C+": return "bg-yellow-100 text-yellow-800";
      case "D": case "D+": return "bg-orange-100 text-orange-800";
      case "F": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPassStatus = (isPassed: boolean) => {
    return isPassed
      ? { label: "Đạt", color: "bg-green-100 text-green-800", icon: CheckCircle }
      : { label: "Không đạt", color: "bg-red-100 text-red-800", icon: XCircle };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải kết quả thi...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Không tìm thấy kết quả thi</p>
          <Button onClick={() => router.push("/exams")} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const passStatus = getPassStatus(result.isPassed);
  const PassIcon = passStatus.icon;

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
            <h1 className="text-2xl font-bold">Kết quả thi</h1>
            <p className="text-muted-foreground">{result.examTitle}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Điểm tổng kết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {result.totalScore.toFixed(1)}/{result.totalPossibleScore.toFixed(1)}
                    </div>
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {result.percentageScore.toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Badge className={getGradeColor(result.grade)} variant="secondary">
                      Xếp loại: {result.grade}
                    </Badge>
                    <Badge className={passStatus.color} variant="secondary">
                      <PassIcon className="h-4 w-4 mr-1" />
                      {passStatus.label}
                    </Badge>
                  </div>

                  <Progress value={result.percentageScore} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Thống kê chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {result.correctAnswers}
                    </div>
                    <div className="text-sm text-muted-foreground">Câu đúng</div>
                    <div className="text-xs text-muted-foreground">
                      {((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-red-600">
                      {result.incorrectAnswers}
                    </div>
                    <div className="text-sm text-muted-foreground">Câu sai</div>
                    <div className="text-xs text-muted-foreground">
                      {((result.incorrectAnswers / result.totalQuestions) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.skippedQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">Bỏ qua</div>
                    <div className="text-xs text-muted-foreground">
                      {((result.skippedQuestions / result.totalQuestions) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">Tổng câu</div>
                    <div className="text-xs text-muted-foreground">100%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Phân tích kết quả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Câu trả lời đúng</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(result.correctAnswers / result.totalQuestions) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Câu trả lời sai</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(result.incorrectAnswers / result.totalQuestions) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {result.incorrectAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Câu bỏ qua</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(result.skippedQuestions / result.totalQuestions) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {result.skippedQuestions}/{result.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exam Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Thông tin bài thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <Badge variant={result.status === "GRADED" ? "default" : "secondary"}>
                    {result.status === "GRADED" ? "Đã chấm" : "Đang chấm"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian làm bài:</span>
                  <span className="font-medium">{result.timeSpentFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã bài thi:</span>
                  <span className="font-mono text-xs">{result.attemptId.slice(-8)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={() => router.push("/exams")}
                  className="w-full"
                >
                  Xem đề thi khác
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="w-full"
                >
                  In kết quả
                </Button>
              </CardContent>
            </Card>

            {/* Motivational Message */}
            <Card className={result.isPassed ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  {result.isPassed ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-800">
                        Chúc mừng! Bạn đã vượt qua bài thi.
                      </p>
                      <p className="text-xs text-green-600">
                        Tiếp tục phát huy và học tập thêm nhé!
                      </p>
                    </>
                  ) : (
                    <>
                      <Target className="h-8 w-8 text-orange-600 mx-auto" />
                      <p className="text-sm font-medium text-orange-800">
                        Chưa đạt yêu cầu. Đừng nản chí!
                      </p>
                      <p className="text-xs text-orange-600">
                        Hãy ôn tập thêm và thử lại lần sau.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}