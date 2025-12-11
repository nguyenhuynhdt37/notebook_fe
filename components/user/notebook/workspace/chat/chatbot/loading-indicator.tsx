"use client";

import { Bot, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LoadingIndicator() {
  return (
    <div className="flex gap-3.5 max-w-4xl mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="shrink-0">
        <Avatar className="size-9 border-2 border-primary/20  ring-1 ring-primary/5">
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5">
            <Bot className="size-4.5 text-primary animate-pulse" />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="rounded-2xl px-5 py-4 bg-muted/60 border border-border/50  inline-block backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Đang suy nghĩ...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

