"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookResponse } from "@/types/user/notebook";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AutoForm() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const validateForm = (): boolean => {
    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả nội dung bạn muốn học");
      return false;
    }
    if (countWords(description) < 10) {
      toast.error("Mô tả cần tối thiểu 10 từ để AI hiểu rõ nhu cầu của bạn");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();

      const data = {
        description: description.trim(),
        autoGenerate: true,
      };
      formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );

      const response = await api.post<NotebookResponse>(
        "/user/personal-notebooks",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("AI đã tạo notebook thành công!");
      router.push(`/notebook/${response.data.id}/workspace`);
    } catch (error: any) {
      console.error("Error creating notebook:", error);
      const message = error.response?.data?.message || "Không thể tạo notebook";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = countWords(description);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="auto-description">
          Mô tả nội dung bạn muốn học <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="auto-description"
          placeholder="Ví dụ: Tôi muốn học về machine learning và deep learning, bao gồm các khái niệm cơ bản, thuật toán phổ biến, và ứng dụng thực tế trong công việc..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          {wordCount} từ {wordCount < 10 && "(tối thiểu 10 từ)"}
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" />
          AI sẽ tự động tạo:
        </div>
        <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
          <li>Tiêu đề phù hợp với nội dung bạn mô tả</li>
          <li>Mô tả chi tiết bằng Markdown</li>
          <li>Ảnh bìa liên quan từ web</li>
        </ul>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            AI đang xử lý...
          </>
        ) : (
          <>
            <Sparkles className="size-4 mr-2" />
            Để AI tạo Notebook
          </>
        )}
      </Button>
    </form>
  );
}
