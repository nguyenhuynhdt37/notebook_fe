"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LecturerAssignmentResponse } from "@/types/lecturer";

interface NotebookCardProps {
  data: LecturerAssignmentResponse;
}

export default function NotebookCard({ data }: NotebookCardProps) {
  if (!data.notebookId) {
    return (
      <div className="rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có Notebook</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Notebook sẽ được tạo tự động khi bạn bắt đầu upload tài liệu hoặc tạo
          nội dung cho môn học này.
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/20 hover:shadow-md">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative p-5">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {data.notebookThumbnailUrl ? (
            <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
              <Image
                src={data.notebookThumbnailUrl}
                alt={data.notebookTitle || "Notebook"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex shrink-0 w-20 h-20 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate">
              {data.notebookTitle || "Notebook môn học"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {data.notebookDescription || "Tài liệu và nội dung môn học"}
            </p>

            {data.notebookUpdatedAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                <span>
                  Cập nhật:{" "}
                  {new Date(data.notebookUpdatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          {/* Action */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
          >
            <Link href={`/notebooks/${data.notebookId}`}>
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Mở</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
