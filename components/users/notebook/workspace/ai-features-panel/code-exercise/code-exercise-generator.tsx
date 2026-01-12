"use client";

import { useState } from "react";
import { Loader2, Code2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import api from "@/api/client/axios";
import { GenerateQuizResponse } from "@/types/user/ai-task";
import { DialogFooter } from "@/components/ui/dialog";

interface Props {
  notebookId: string;
  selectedFileIds: string[];
  onGenerated: (aiSetId: string) => void;
  onCancel: () => void;
}

export default function CodeExerciseGenerator({
  notebookId,
  selectedFileIds,
  onGenerated,
  onCancel,
}: Props) {
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM"
  );
  const [count, setCount] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (selectedFileIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post<GenerateQuizResponse>(
        `/user/notebooks/${notebookId}/ai/code-exercises/generate`,
        {
          fileIds: selectedFileIds,
          difficulty,
          count,
          prompt: prompt.trim() || undefined,
        }
      );
      onGenerated(res.data.aiSetId);
    } catch (error: any) {
      console.error("Failed to generate exercises:", error);
      setError(
        error.response?.data?.message ||
          "Không thể tạo bài tập. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 py-4 flex-1">
        {/* File Info */}
        {selectedFileIds.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" />
            <p className="text-sm">
              Vui lòng chọn file từ panel Nguồn trước khi tạo bài tập
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Đã chọn{" "}
              <span className="font-medium">{selectedFileIds.length}</span> tài
              liệu để tạo bài tập
            </p>
          </div>
        )}

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Độ khó</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["EASY", "MEDIUM", "HARD"] as const).map((level) => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level ? "default" : "outline"}
                className="w-full"
                onClick={() => setDifficulty(level)}
                disabled={loading}
              >
                {level === "EASY"
                  ? "Cơ bản"
                  : level === "MEDIUM"
                  ? "Trung bình"
                  : "Nâng cao"}
              </Button>
            ))}
          </div>
        </div>

        {/* Count Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Số lượng bài tập</Label>
            <span className="text-sm font-medium">{count} bài</span>
          </div>
          <Slider
            value={[count]}
            onValueChange={([v]) => setCount(v)}
            min={1}
            max={5}
            step={1}
            className="py-2"
            disabled={loading}
          />
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label>Yêu cầu cụ thể (Tùy chọn)</Label>
          <Textarea
            placeholder="Ví dụ: Tập trung vào thuật toán sắp xếp, hoặc sử dụng đệ quy..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Loader2 className="size-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              AI đang phân tích và tạo bài tập code...
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={loading || selectedFileIds.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Đang tạo...
            </>
          ) : (
            <>
              <Code2 className="size-4 mr-2" />
              Tạo bài tập
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
