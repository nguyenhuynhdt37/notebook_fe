"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, List, CheckCircle2, Circle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

import api from "@/api/client/axios";
import {
  CodeExercise,
  RunCodeResult,
  ExerciseSolution,
  RunCodeRequest,
} from "@/types/user/ai-task";
import CodeEditorPanel from "./code-editor-panel";
import TestResults from "./test-results";
import { cn } from "@/lib/utils";

interface Props {
  notebookId: string;
  aiSetId: string;
  onBack: () => void;
}

export default function CodeExercisePlayer({
  notebookId,
  aiSetId,
  onBack,
}: Props) {
  const [exercises, setExercises] = useState<CodeExercise[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);

  // Load exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get<CodeExercise[]>(
          `/user/notebooks/${notebookId}/ai/code-exercises/${aiSetId}`
        );
        setExercises(res.data);
      } catch (error) {
        console.error("Failed to load exercises:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [notebookId, aiSetId]);

  const currentExercise = exercises[currentExerciseIdx];

  const handleUpdateContent = (content: string) => {
    if (!currentExercise) return;
    const newExercises = [...exercises];
    // Assume modifying the first file (main file) for simplicity in this MVP
    // In reality we'd track active file index
    if (newExercises[currentExerciseIdx].files.length > 0) {
      newExercises[currentExerciseIdx].files[0].content = content;
      setExercises(newExercises);
    }
  };

  const handleRunCode = async () => {
    if (!currentExercise) return;
    setIsRunning(true);
    setRunResult(null);

    try {
      const payload: RunCodeRequest = {
        files: currentExercise.files.map((f) => ({
          filename: f.filename,
          content: f.content,
          isMain: f.isMain,
        })),
      };

      const res = await api.post<RunCodeResult>(
        `/user/notebooks/${notebookId}/ai/code-exercises/exercise/${currentExercise.id}/run`,
        payload
      );
      setRunResult(res.data);

      // Update completion status locally if passed
      if (res.data.status === "passed") {
        const newExercises = [...exercises];
        newExercises[currentExerciseIdx].status = "passed";
        setExercises(newExercises);
      }
    } catch (error) {
      console.error("Run code failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleGetSolution = async () => {
    if (!currentExercise) return;
    if (
      !confirm(
        "Bạn có chắc muốn xem đáp án? Code hiện tại của bạn sẽ bị ghi đè."
      )
    )
      return;

    try {
      const res = await api.get<ExerciseSolution[]>(
        `/user/notebooks/${notebookId}/ai/code-exercises/exercise/${currentExercise.id}/solution`
      );

      if (res.data && res.data.length > 0) {
        const solution = res.data[0]; // Assuming 1 file solution for logic MVP
        handleUpdateContent(solution.content);
      }
    } catch (error) {
      console.error("Get solution failed:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!currentExercise) return <div>No exercises found.</div>;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-semibold">{currentExercise.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            {currentExerciseIdx + 1} / {exercises.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Description & Test Cases */}
          <ResizablePanel defaultSize={35} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              {/* Description */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <ScrollArea className="h-full p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{currentExercise.description}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle />

              {/* Test Results */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <TestResults result={runResult} isRunning={isRunning} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right: Code Editor */}
          <ResizablePanel defaultSize={65} minSize={30}>
            <CodeEditorPanel
              files={currentExercise.files}
              activeFile={currentExercise.files[0]}
              language={currentExercise.language.name}
              isRunning={isRunning}
              onSelectFile={() => {}} // Single file MVP
              onUpdateContent={handleUpdateContent}
              onRunCode={handleRunCode}
              onGetSolution={handleGetSolution}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Exercise Navigation Footer */}
      <div className="h-14 border-t px-4 flex items-center justify-between bg-muted/20">
        <div className="flex gap-2 overflow-x-auto p-1">
          {exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => {
                setCurrentExerciseIdx(idx);
                setRunResult(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors whitespace-nowrap",
                currentExerciseIdx === idx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              {ex.status === "passed" ? (
                <CheckCircle2 className="size-3.5 text-green-500" />
              ) : (
                <Circle className="size-3.5 text-muted-foreground" />
              )}
              Bài {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
