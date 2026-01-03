"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamQuestion, StudentAnswer } from "@/types/student/exam";

interface QuestionCardProps {
  question: ExamQuestion;
  answer?: StudentAnswer;
  onAnswerChange: (questionId: string, answerData: any, confidence: "LOW" | "MEDIUM" | "HIGH") => void;
  questionNumber: number;
}

export function QuestionCard({ question, answer, onAnswerChange, questionNumber }: QuestionCardProps) {
  const [confidence, setConfidence] = useState<"LOW" | "MEDIUM" | "HIGH">(answer?.confidence || "MEDIUM");

  const handleMCQChange = (selectedOptionId: string) => {
    onAnswerChange(question.questionId, { selectedOptionId }, confidence);
  };

  const handleEssayChange = (essayText: string) => {
    onAnswerChange(question.questionId, { essayText }, confidence);
  };

  const handleConfidenceChange = (newConfidence: "LOW" | "MEDIUM" | "HIGH") => {
    setConfidence(newConfidence);
    if (answer) {
      onAnswerChange(question.questionId, answer.answerData, newConfidence);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MCQ": return "Trắc nghiệm";
      case "TRUE_FALSE": return "Đúng/Sai";
      case "ESSAY": return "Tự luận";
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Câu {questionNumber}
            <Badge variant="outline" className="ml-2">
              {getQuestionTypeLabel(question.questionType)}
            </Badge>
            <Badge variant="secondary" className="ml-2">
              {question.points} điểm
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="prose max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {question.questionText}
          </p>
        </div>

        {/* Answer Options */}
        {question.questionType === "MCQ" || question.questionType === "TRUE_FALSE" ? (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.answerData?.selectedOptionId || ""}
              onValueChange={handleMCQChange}
            >
              {question.options?.map((option) => (
                <div key={option.optionId} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.optionId} id={option.optionId} />
                  <Label 
                    htmlFor={option.optionId} 
                    className="flex-1 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {option.optionText}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : question.questionType === "ESSAY" ? (
          <div className="space-y-3">
            <Label htmlFor="essay-answer">Câu trả lời của bạn:</Label>
            <Textarea
              id="essay-answer"
              placeholder="Nhập câu trả lời của bạn..."
              value={answer?.answerData?.essayText || ""}
              onChange={(e) => handleEssayChange(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Số ký tự: {answer?.answerData?.essayText?.length || 0}
            </p>
          </div>
        ) : null}

        {/* Confidence Level */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Mức độ tự tin với câu trả lời:</Label>
          <div className="flex gap-2">
            <Button
              variant={confidence === "LOW" ? "default" : "outline"}
              size="sm"
              onClick={() => handleConfidenceChange("LOW")}
              className="flex-1"
            >
              Thấp
            </Button>
            <Button
              variant={confidence === "MEDIUM" ? "default" : "outline"}
              size="sm"
              onClick={() => handleConfidenceChange("MEDIUM")}
              className="flex-1"
            >
              Trung bình
            </Button>
            <Button
              variant={confidence === "HIGH" ? "default" : "outline"}
              size="sm"
              onClick={() => handleConfidenceChange("HIGH")}
              className="flex-1"
            >
              Cao
            </Button>
          </div>
        </div>

        {/* Answer Status */}
        {answer && !answer.wasSkipped && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            Đã trả lời
            {answer.revisionCount > 0 && (
              <span className="text-muted-foreground">
                (Đã sửa {answer.revisionCount} lần)
              </span>
            )}
          </div>
        )}
        
        {answer?.wasSkipped && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            Đã bỏ qua
          </div>
        )}
      </CardContent>
    </Card>
  );
}