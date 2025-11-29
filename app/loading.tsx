"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-foreground border-r-foreground/50 animate-spin" />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <Image
              src="/logo/notebooks-logo-64.svg"
              alt="Notebooks AI"
              width={64}
              height={64}
              className="text-foreground"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">Notebooks AI</h1>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Đang tải
            </span>
            <Loader2 className="size-4 animate-spin text-foreground" />
          </div>
        </div>

        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-foreground/20 rounded-full animate-pulse" />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Đang chuẩn bị nội dung cho bạn...
        </p>
      </div>
    </div>
  );
}
