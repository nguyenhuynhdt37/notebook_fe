"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreateSectionCardProps {
  onCreate: (title: string) => void;
  viewMode?: "horizontal" | "vertical";
}

export default function CreateSectionCard({
  onCreate,
  viewMode = "horizontal",
}: CreateSectionCardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate(title);
    setTitle("");
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setTitle("");
  };

  if (isCreating) {
    return (
      <Card
        className={cn(
          "shrink-0 p-4 h-fit border-2 border-primary/20 bg-muted/20",
          viewMode === "horizontal" ? "w-80" : "w-full"
        )}
      >
        <h3 className="mb-3 font-semibold text-sm">Tạo chương mới</h3>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tên chương..."
          className="mb-3 bg-background"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1"
          >
            Tạo
          </Button>
          <Button variant="ghost" onClick={handleCancel} size="icon">
            <X className="size-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "shrink-0 border-dashed hover:border-primary hover:text-primary flex-col gap-2",
        viewMode === "horizontal" ? "h-[100px] w-80" : "h-16 w-full flex-row"
      )}
      onClick={() => setIsCreating(true)}
    >
      <Plus className="size-6" />
      <span className="font-semibold">Thêm chương học mới</span>
    </Button>
  );
}
