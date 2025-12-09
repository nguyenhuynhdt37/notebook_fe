"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJIS = [
  { emoji: "👍", label: "Thích" },
  { emoji: "❤️", label: "Yêu thích" },
  { emoji: "😄", label: "Vui" },
  { emoji: "😢", label: "Buồn" },
  { emoji: "🔥", label: "Nóng" },
  { emoji: "🎉", label: "Chúc mừng" },
];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export default function ReactionPicker({
  onSelect,
  className,
}: ReactionPickerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 p-2 bg-background/95 border border-border/60 rounded-2xl shadow-xl backdrop-blur-md",
        className
      )}
    >
      {EMOJIS.map((item) => (
        <Button
          key={item.emoji}
          variant="ghost"
          size="icon-sm"
          onClick={() => onSelect(item.emoji)}
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-muted/80 hover:scale-110 transition-all duration-200",
            "active:scale-95 shadow-sm"
          )}
          type="button"
          title={item.label}
        >
          <span className="text-xl leading-none">{item.emoji}</span>
        </Button>
      ))}
    </div>
  );
}
