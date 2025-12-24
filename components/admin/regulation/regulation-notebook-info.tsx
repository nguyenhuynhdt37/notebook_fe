"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  FileText,
  Clock,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  RegulationNotebookResponse,
  ApiResponse,
} from "@/types/admin/regulation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

export default function RegulationNotebookInfo() {
  const router = useRouter();
  const [notebook, setNotebook] = useState<RegulationNotebookResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotebook();
  }, []);

  const loadNotebook = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<RegulationNotebookResponse>>(
        "/admin/regulation/notebook"
      );
      setNotebook(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải thông tin công văn");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-muted/50 rounded-xl border border-border/50" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-muted/50 rounded-xl border border-border/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Chưa có dữ liệu về công văn.</p>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({
    label,
    value,
    icon: Icon,
    className,
    description,
  }: {
    label: string;
    value: number;
    icon: any;
    className?: string;
    description?: string;
  }) => (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md border bg-card/50",
        className
      )}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="p-2 rounded-lg bg-background border shadow-sm">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {value.toLocaleString("vi-VN")}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/20 p-8 md:p-10 shadow-sm group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
          <FileText className="size-80 -translate-y-1/2 translate-x-1/4 stroke-[0.5]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 h-full">
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {notebook.title}
              </h2>
              <div className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                <MarkdownRenderer
                  content={
                    notebook.description ||
                    "Hệ thống quản lý tài liệu, quy chế và văn bản chính thức."
                  }
                  className="prose-p:text-lg prose-p:text-muted-foreground prose-p:my-0"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 border shadow-sm backdrop-blur-sm">
                <span className="font-semibold text-foreground">
                  Người tạo:
                </span>
                <span>{notebook.createdByName}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 border shadow-sm backdrop-blur-sm">
                <span className="font-semibold text-foreground">Cập nhật:</span>
                <span>
                  {new Date(
                    notebook.updatedAt || notebook.createdAt
                  ).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center lg:items-start min-w-[200px]">
            <Button
              onClick={() => router.push("/admin/regulation/edit")}
              variant="default"
              className="w-full lg:w-auto shadow-sm hover:shadow transition-all"
            >
              <Edit className="size-4 mr-2" />
              Chỉnh sửa thông tin
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Tổng văn bản"
          value={notebook.totalFiles}
          icon={FileText}
          description="Tài liệu đã tải lên"
          className="hover:border-primary/20"
        />
        <StatCard
          label="Đã hoàn tất OCR"
          value={notebook.ocrDoneFiles}
          icon={CheckCircle2}
          className="hover:border-green-500/20 bg-green-50/30 dark:bg-green-950/5"
          description="Văn bản đã số hóa"
        />
        <StatCard
          label="Đã Embedding"
          value={notebook.embeddingDoneFiles}
          icon={Database}
          className="hover:border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/5"
          description="Sẵn sàng tìm kiếm"
        />
        <StatCard
          label="Cần kiểm tra"
          value={notebook.failedFiles}
          icon={AlertCircle}
          className={cn(
            "hover:border-red-500/20 bg-red-50/30 dark:bg-red-950/5",
            notebook.failedFiles > 0 && "border-red-200 dark:border-red-900"
          )}
          description="Xử lý thất bại"
        />
      </div>
    </div>
  );
}
