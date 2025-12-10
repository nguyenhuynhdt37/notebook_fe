"use client";

import { Sparkles } from "lucide-react";

export default function StudioHeader() {
  return (
    <div className="px-4 py-4 border-b">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4" />
        <h2 className="font-semibold text-sm">Studio</h2>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Tạo nội dung từ nguồn của bạn
      </p>
    </div>
  );
}
