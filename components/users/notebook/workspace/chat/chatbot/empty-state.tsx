"use client";

import { Sparkles, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmptyStateProps {
  selectedFileIds: string[];
}

export default function EmptyState({ selectedFileIds }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto px-6 animate-in fade-in duration-500">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted/30 mb-6  ring-1 ring-primary/10">
        <Sparkles className="size-12 text-primary animate-pulse" />
      </div>
      <h3 className="font-semibold text-xl text-foreground mb-3 tracking-tight">
        {selectedFileIds.length === 0 ? "Chọn nguồn tài liệu để bắt đầu" : "Bắt đầu trò chuyện với AI"}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-sm">
        {selectedFileIds.length === 0
          ? "Vui lòng chọn ít nhất một tài liệu từ danh sách nguồn bên trái để có thể đặt câu hỏi với AI."
          : "Hỏi bất kỳ điều gì về tài liệu trong notebook này. AI sẽ trả lời dựa trên nội dung đã được tải lên."}
      </p>
      {selectedFileIds.length > 0 && (
        <Badge variant="outline" className="text-xs font-semibold gap-1.5 px-4 py-2 border-primary/30 bg-primary/5 text-primary ">
          <FileText className="size-3.5" />
          {selectedFileIds.length} {selectedFileIds.length === 1 ? "tài liệu" : "tài liệu"} đã chọn
        </Badge>
      )}
    </div>
  );
}

