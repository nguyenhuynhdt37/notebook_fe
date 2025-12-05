"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FilePreviewProps {
  notebookId: string;
  fileId: string;
}

export default function FilePreview({
  notebookId,
  fileId,
}: FilePreviewProps) {
  const router = useRouter();
  const [file, setFile] = useState<NotebookFileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (notebookId && fileId) {
      loadFile();
    }
  }, [notebookId, fileId]);

  const loadFile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NotebookFileResponse>(
        `/admin/notebooks/${notebookId}/files/${fileId}`
      );
      setFile(response.data);
    } catch (error: any) {
      console.error("Error fetching file:", error);
      const message =
        error.response?.data?.message || "Không thể tải thông tin file";
      toast.error(message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (file?.storageUrl) {
      window.open(file.storageUrl, "_blank");
    }
  };

  const isPdf = file?.mimeType === "application/pdf";
  const isWord =
    file?.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file?.mimeType === "application/msword";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không tìm thấy file
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {file.originalFilename}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Xem trước nội dung file
            </p>
          </div>
        </div>
        <Button onClick={handleDownload} variant="outline">
          <Download className="size-4 mr-2" />
          Tải xuống
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Nội dung file</CardTitle>
              <CardDescription className="mt-1">
                {file.mimeType} •{" "}
                {Math.round((file.fileSize / 1024) * 100) / 100} KB
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPdf ? (
            <div className="w-full border rounded-lg overflow-hidden bg-muted/50">
              <iframe
                src={file.storageUrl}
                className="w-full h-[calc(100vh-300px)] min-h-[600px]"
                title={file.originalFilename}
              />
            </div>
          ) : isWord ? (
            <div className="w-full border rounded-lg overflow-hidden bg-background">
              <div className="p-6">
                <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                  <FileText className="size-12" />
                  <div className="text-center">
                    <p className="font-medium mb-1">
                      Không thể xem trước file Word
                    </p>
                    <p className="text-sm">
                      Vui lòng tải xuống để xem nội dung
                    </p>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="mt-4"
                    >
                      <Download className="size-4 mr-2" />
                      Tải xuống file
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full border rounded-lg overflow-hidden bg-muted/50">
              <div className="p-6">
                <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                  <FileText className="size-12" />
                  <div className="text-center">
                    <p className="font-medium mb-1">
                      Không hỗ trợ xem trước loại file này
                    </p>
                    <p className="text-sm">
                      Vui lòng tải xuống để xem nội dung
                    </p>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="mt-4"
                    >
                      <Download className="size-4 mr-2" />
                      Tải xuống file
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

