"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileSelector from "./file-selector";
import ChunkConfig from "./chunk-config";
import api from "@/api/client/axios";

interface FileUploadProps {
  notebookId: string;
  onUploadSuccess?: (files: NotebookFileResponse[]) => void;
  onClose?: () => void;
}

export default function FileUpload({
  notebookId,
  onUploadSuccess,
  onClose,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [chunkSize, setChunkSize] = useState(3000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigChange = (size: number, overlap: number) => {
    setChunkSize(size);
    setChunkOverlap(overlap);
  };

  const validateUploadParams = (
    files: File[],
    chunkSize: number,
    chunkOverlap: number
  ): string | null => {
    if (files.length === 0) {
      return "Vui lòng chọn ít nhất một file";
    }

    if (chunkSize < 3000 || chunkSize > 5000) {
      return "Chunk size phải từ 3000 đến 5000";
    }

    if (chunkOverlap < 200 || chunkOverlap > 500) {
      return "Chunk overlap phải từ 200 đến 500";
    }

    return null;
  };

  const uploadFiles = async (
    notebookId: string,
    files: File[],
    config: { chunkSize: number; chunkOverlap: number }
  ): Promise<NotebookFileResponse[]> => {
    const formData = new FormData();
    formData.append("request", JSON.stringify(config));

    for (const file of files) {
      formData.append("files", file);
    }

    const response = await api.post<NotebookFileResponse[]>(
      `/admin/notebooks/${notebookId}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  };

  const handleUpload = async () => {
    const validationError = validateUploadParams(
      files,
      chunkSize,
      chunkOverlap
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await uploadFiles(notebookId, files, {
        chunkSize,
        chunkOverlap,
      });

      toast.success(`Upload thành công ${result.length} file(s)!`);
      setFiles([]);
      onUploadSuccess?.(result);
      onClose?.();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as any).response?.data?.message || "Lỗi khi upload files"
          : "Lỗi không xác định";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload Files</CardTitle>
        <CardDescription>
          Upload PDF và Word files. Files sẽ được tự động approved và xử lý AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileSelector
          onFilesChange={setFiles}
          onError={setError}
          disabled={loading}
        />

        <ChunkConfig onConfigChange={handleConfigChange} disabled={loading} />

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="w-full"
        >
          {loading ? (
            <>
              <Upload className="size-4" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Upload Files
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
