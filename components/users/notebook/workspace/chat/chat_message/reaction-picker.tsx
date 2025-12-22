"use client";

import { Button } from "@/components/ui/button";

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
}

export default function ReactionPicker({ onSelect }: ReactionPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {EMOJIS.map((item) => (
        <Button
          key={item.emoji}
          variant="ghost"
          size="icon"
          onClick={() => onSelect(item.emoji)}
          className="h-8 w-8 hover:bg-muted"
          title={item.label}
        >
          <span className="text-lg">{item.emoji}</span>
        </Button>
      ))}
    </div>
  );
}
