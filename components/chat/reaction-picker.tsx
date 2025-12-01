"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "😄", "😢", "🔥", "🎉"];

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
                "flex items-center gap-1 p-1 bg-background border rounded-lg shadow-sm",
                className
            )}
        >
            {EMOJIS.map((emoji) => (
                <Button
                    key={emoji}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onSelect(emoji)}
                    className="hover:bg-muted"
                    type="button"
                >
                    <span className="text-lg">{emoji}</span>
                </Button>
            ))}
        </div>
    );
}

