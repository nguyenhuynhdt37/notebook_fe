"use client";

import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSetResponse } from "@/types/user/ai-task";
import SetItem from "./task-item";

interface SetListProps {
  sets: AiSetResponse[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView?: (setId: string) => void;
  onDelete?: (setId: string) => void;
  playingId?: string | null;
}

export default function SetList({
  sets,
  loading,
  error,
  onRetry,
  onView,
  onDelete,
  playingId,
}: SetListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="size-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground mb-3">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="inline-flex p-3 rounded-full bg-muted/50 mb-3">
          <Sparkles className="size-6 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Chưa có nội dung nào.
          <br />
          Hãy thử tạo một tính năng ở trên!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      {sets.map((set) => (
        <SetItem
          key={set.id}
          set={set}
          onView={onView}
          onDelete={onDelete}
          isPlaying={playingId === set.id}
        />
      ))}
    </div>
  );
}
