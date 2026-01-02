"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import examApi from "@/api/client/exam";

interface DebugGenerateQuestionsProps {
  examId: string;
}

export function DebugGenerateQuestions({ examId }: DebugGenerateQuestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testGenerateQuestions = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const requestData = {
        notebookFileIds: ["test-file-id"],
        numberOfQuestions: 5,
        questionTypes: "MCQ,TRUE_FALSE",
        difficultyLevel: "MEDIUM" as const,
        mcqOptionsCount: 4,
        includeExplanation: true,
        language: "vi",
        easyPercentage: 30,
        mediumPercentage: 50,
        hardPercentage: 20,
      };

      console.log("Debug: Sending request:", requestData);
      
      const response = await examApi.generateQuestions(examId, requestData);
      
      console.log("Debug: Received response:", response);
      setResult(response);
      
    } catch (err: any) {
      console.error("Debug: Error occurred:", err);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug Generate Questions API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testGenerateQuestions} 
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? "Testing..." : "Test API Call"}
        </Button>

        {result && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-green-600">Success</Badge>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-red-600">Error</Badge>
            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}