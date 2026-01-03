"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamQuestion, StudentAnswer } from "@/types/student/exam";

interface AnswerTrackerProps {
  questions: ExamQuestion[];
  answers: Record<string, StudentAnswer>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

export function AnswerTracker({ 
  questions, 
  answers, 
  currentQuestionIndex, 
  onQuestionSelect 
}: AnswerTrackerProps) {
  const getQuestionStatus = (question: ExamQuestion, index: number) => {
    const answer = answers[question.questionId];
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) {
      return {
        variant: "default" as const,
        className: "bg-blue-600 text-white border-blue-600",
        label: "Hiện tại"
      };
    }
    
    if (answer?.wasSkipped) {
      return {
        variant: "outline" as const,
        className: "border-orange-300 text-orange-600 hover:bg-orange-50",
        label: "Bỏ qua"
      };
    }
    
    if (answer && !answer.wasSkipped) {
      return {
        variant: "outline" as const,
        className: "border-green-300 text-green-600 hover:bg-green-50 bg-green-50",
        label: "Đã trả lời"
      };
    }
    
    return {
      variant: "outline" as const,
      className: "border-gray-300 text-gray-600 hover:bg-gray-50",
      label: "Chưa trả lời"
    };
  };

  const answeredCount = Object.values(answers).filter(a => !a.wasSkipped).length;
  const skippedCount = Object.values(answers).filter(a => a.wasSkipped).length;
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tổng quan câu hỏi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600">{answeredCount}</div>
            <div className="text-muted-foreground">Đã trả lời</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{skippedCount}</div>
            <div className="text-muted-foreground">Bỏ qua</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-600">{unansweredCount}</div>
            <div className="text-muted-foreground">Chưa làm</div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question, index);
            
            return (
              <Button
                key={question.questionId}
                variant={status.variant}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${status.className}`}
                onClick={() => onQuestionSelect(index)}
                title={`Câu ${index + 1} - ${status.label}`}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Câu hiện tại</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Đã trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Đã bỏ qua</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
            <span>Chưa trả lời</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}