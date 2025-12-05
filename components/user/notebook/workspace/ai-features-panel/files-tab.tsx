"use client";

import { FileText, Sparkles, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FilesTab() {
  return (
    <div className="space-y-2">
      <div className="text-center py-16">
        <div className="mb-6 inline-flex p-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 shadow-lg border border-border/40">
          <FileText className="size-16 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2.5">
          Chưa có tệp nào được AI tạo
        </h3>
        <p className="text-sm text-muted-foreground mb-7 max-w-xs mx-auto leading-relaxed">
          Các tệp được AI tạo từ nguồn của bạn sẽ hiển thị ở đây
        </p>
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 shadow-sm">
          <Sparkles className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            Sử dụng AI để tạo tệp mới
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-1 hover:opacity-70 transition-opacity">
                  <HelpCircle className="size-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  AI có thể tạo tóm tắt, báo cáo, và các tài liệu khác từ nguồn
                  của bạn
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
